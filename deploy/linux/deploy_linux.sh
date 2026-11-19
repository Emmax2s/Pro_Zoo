#!/bin/bash
set -euo pipefail

# ================= CONFIGURACIÓN =================
REPO_DIR="/opt/Pro_Zoo"
ISPCONFIG_WEB_DIR="/var/www/clients/client1/web1/web"   # <-- AJUSTAR A LA RUTA REAL DE ISPCONFIG
SERVICE_USER="root"                                     # <-- O el usuario del sistema asignado
PG_DB="pro_zoo"
PG_USER="usr_prozoo_admin"
# =================================================

echo "=== [1/8] Verificando archivos .env ==="
if [ ! -f "$REPO_DIR/.env" ] || [ ! -f "$REPO_DIR/chatbot/.env" ]; then
    echo "ERROR: Faltan archivos .env en $REPO_DIR o $REPO_DIR/chatbot"
    exit 1
fi

echo "=== [2/8] Configurando Swap de seguridad (4 GB) y afinamiento de memoria ==="
if [ -z "$(swapon --show)" ]; then
    echo "Configurando swapfile de 4 GB para prevenir OOM en VM de 8 GB RAM..."
    fallocate -l 4G /swapfile || dd if=/dev/zero of=/swapfile bs=1M count=4096
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    if ! grep -q "/swapfile" /etc/fstab; then
        echo "/swapfile none swap sw 0 0" >> /etc/fstab
    fi
    sysctl vm.swappiness=10
    if ! grep -q "vm.swappiness" /etc/sysctl.conf; then
        echo "vm.swappiness=10" >> /etc/sysctl.conf
    fi
else
    echo "Swap ya activo. Verificando swappiness..."
    sysctl vm.swappiness=10 || true
fi

echo "=== [3/8] Optimizando daemon de Ollama para mantener modelo en RAM (evita lentitud HDD) ==="
mkdir -p /etc/systemd/system/ollama.service.d
cat << 'EOF' > /etc/systemd/system/ollama.service.d/override.conf
[Service]
Environment="OLLAMA_HOST=127.0.0.1:11434"
Environment="OLLAMA_KEEP_ALIVE=-1"
Environment="OLLAMA_NUM_PARALLEL=1"
Environment="OLLAMA_MAX_LOADED_MODELS=1"
EOF
systemctl daemon-reload
systemctl restart ollama

# Obtener modelo configurado desde chatbot/.env (por defecto llama3.2:3b)
MODELO_OLLAMA="llama3.2:3b"
if [ -f "$REPO_DIR/chatbot/.env" ]; then
    MODELO_ENV=$(grep -E '^OLLAMA_MODEL=' "$REPO_DIR/chatbot/.env" | cut -d '=' -f2 | tr -d ' "\r\n' || true)
    if [ -n "$MODELO_ENV" ]; then
        MODELO_OLLAMA="$MODELO_ENV"
    fi
fi
echo "Asegurando modelo Ollama: $MODELO_OLLAMA..."
if ! ollama list | grep -q "$MODELO_OLLAMA"; then
    echo "Descargando modelo $MODELO_OLLAMA en Ollama..."
    ollama pull "$MODELO_OLLAMA"
fi

echo "=== [4/8] Instalando dependencias Node.js y compilando Frontend ==="
cd "$REPO_DIR"
npm ci
npm run build

echo "=== [5/8] Publicando Frontend (dist/) en carpeta web de ISPConfig ==="
mkdir -p "$ISPCONFIG_WEB_DIR"
rm -f "$ISPCONFIG_WEB_DIR/index.html"
cp -r "$REPO_DIR/dist/"* "$ISPCONFIG_WEB_DIR/"

# .htaccess para rutas SPA de React (solo si ISPConfig usa Apache)
cat << 'EOF' > "$ISPCONFIG_WEB_DIR/.htaccess"
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteCond %{REQUEST_URI} ^/(api|uploads|chatbot) [NC]
  RewriteRule ^ - [L]
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
EOF

echo "=== [6/8] Inicializando esquema base de PostgreSQL (init.sql y seed.sql) ==="
mkdir -p "$REPO_DIR/backend/uploads"
sudo -u postgres psql -d "$PG_DB" -f "$REPO_DIR/backend/db/init.sql" || true
if [ -f "$REPO_DIR/backend/db/seed.sql" ]; then
    sudo -u postgres psql -d "$PG_DB" -f "$REPO_DIR/backend/db/seed.sql" || true
fi
sudo -u postgres psql -d "$PG_DB" -c "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO $PG_USER; GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO $PG_USER;"

echo "=== [7/8] Configurando entorno virtual Python 3.12 del Chatbot ==="
cd "$REPO_DIR/chatbot"
python3.12 -m venv venv
./venv/bin/pip install --upgrade pip
./venv/bin/pip install -r requirements.txt
./venv/bin/pip install "click>=8.2.1" gunicorn
./venv/bin/python -m spacy download es_core_news_sm

mkdir -p "$REPO_DIR/chatbot/logs" "$REPO_DIR/chatbot/assets"

echo "=== Ejecutando primera ingesta vectorial (ChromaDB) ==="
./venv/bin/python ingesta_datos.py

# Verifica que existan los 6 audios rápidos pre-renderizados
if [ ! -f "$REPO_DIR/chatbot/assets/costos.mp3" ] || [ ! -f "$REPO_DIR/chatbot/assets/costos_en.mp3" ]; then
    echo "Regenerando audios estáticos de sugerencias rápidas..."
    ./venv/bin/python app.py --regenerar-audios
fi

echo "=== [8/8] Creando servicios systemd (Backend Express + Chatbot Gunicorn) ==="

cat << EOF > /etc/systemd/system/prozoo-backend.service
[Unit]
Description=Pro_Zoo Backend API (Node.js / Express)
After=network.target postgresql.service

[Service]
Type=simple
User=$SERVICE_USER
WorkingDirectory=$REPO_DIR
EnvironmentFile=$REPO_DIR/.env
ExecStart=/usr/bin/node $REPO_DIR/backend/index.js
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

# IMPORTANTE: -w 1 --threads 4 ajustado a 2 vCPU y 8 GB RAM, --timeout 180 soporta inferencia CPU
cat << EOF > /etc/systemd/system/zoomat-chatbot.service
[Unit]
Description=Asistente Virtual ZooMAT (Flask + Gunicorn)
After=network.target ollama.service mysql.service mariadb.service

[Service]
Type=simple
User=$SERVICE_USER
WorkingDirectory=$REPO_DIR/chatbot
EnvironmentFile=$REPO_DIR/chatbot/.env
ExecStart=$REPO_DIR/chatbot/venv/bin/gunicorn -w 1 --threads 4 --timeout 180 -b 127.0.0.1:8000 app:app
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable --now prozoo-backend.service
systemctl enable --now zoomat-chatbot.service

echo "=== Configurando script y cron de reindexación semanal (Lunes 02:00 AM) ==="
cat << EOF > "$REPO_DIR/chatbot/reindexar_semanal.sh"
#!/bin/bash
LOG="$REPO_DIR/chatbot/logs/ingesta_semanal.log"
echo "=== [\$(date '+%Y-%m-%d %H:%M:%S')] INICIO REINDEXACIÓN SEMANAL ===" >> "\$LOG"

# Garantiza que los servicios SIEMPRE vuelvan a encender aunque falle la ingesta
restaurar_servicios() {
    echo "[\$(date '+%Y-%m-%d %H:%M:%S')] Reiniciando ollama.service..." >> "\$LOG"
    systemctl start ollama.service
    sleep 3
    echo "[\$(date '+%Y-%m-%d %H:%M:%S')] Reiniciando zoomat-chatbot.service..." >> "\$LOG"
    systemctl start zoomat-chatbot.service
    echo "=== [\$(date '+%Y-%m-%d %H:%M:%S')] FIN REINDEXACIÓN ===" >> "\$LOG"
}
trap restaurar_servicios EXIT

echo "[\$(date '+%Y-%m-%d %H:%M:%S')] Deteniendo zoomat-chatbot y ollama para liberar RAM..." >> "\$LOG"
systemctl stop zoomat-chatbot.service || true
systemctl stop ollama.service || true
sleep 3

cd "$REPO_DIR/chatbot"
./venv/bin/python ingesta_datos.py >> "\$LOG" 2>&1 || echo "ERROR en ingesta_datos.py" >> "\$LOG"
EOF

chmod +x "$REPO_DIR/chatbot/reindexar_semanal.sh"

# Registra la tarea en crontab de root sin duplicarla
(crontab -l 2>/dev/null | grep -v "reindexar_semanal.sh"; echo "0 2 * * 1 $REPO_DIR/chatbot/reindexar_semanal.sh") | crontab -

echo "============================================================"
echo "DESPLIEGUE COMPLETADO. Estado de servicios:"
systemctl --no-pager status prozoo-backend.service zoomat-chatbot.service | grep -E "●|Active:"
echo "============================================================"

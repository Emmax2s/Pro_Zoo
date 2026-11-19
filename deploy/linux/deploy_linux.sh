#!/bin/bash
set -euo pipefail

# ================= CONFIGURACIÓN =================
REPO_DIR="/opt/Pro_Zoo"
ISPCONFIG_WEB_DIR="/var/www/clients/client1/web1/web"   # <-- AJUSTAR A LA RUTA REAL DE ISPCONFIG
SERVICE_USER="root"                                     # <-- O el usuario del sistema asignado
PG_DB="pro_zoo"
PG_USER="usr_prozoo_admin"
# =================================================

echo "=== [1/7] Verificando archivos .env ==="
if [ ! -f "$REPO_DIR/.env" ] || [ ! -f "$REPO_DIR/chatbot/.env" ]; then
    echo "ERROR: Faltan archivos .env en $REPO_DIR o $REPO_DIR/chatbot"
    exit 1
fi

echo "=== [2/7] Instalando dependencias Node.js y compilando Frontend ==="
cd "$REPO_DIR"
npm ci
npm run build

echo "=== [3/7] Publicando Frontend (dist/) en carpeta web de ISPConfig ==="
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

echo "=== [4/7] Inicializando esquema base de PostgreSQL (init.sql y seed.sql) ==="
mkdir -p "$REPO_DIR/backend/uploads"
sudo -u postgres psql -d "$PG_DB" -f "$REPO_DIR/backend/db/init.sql" || true
if [ -f "$REPO_DIR/backend/db/seed.sql" ]; then
    sudo -u postgres psql -d "$PG_DB" -f "$REPO_DIR/backend/db/seed.sql" || true
fi
sudo -u postgres psql -d "$PG_DB" -c "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO $PG_USER; GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO $PG_USER;"

echo "=== [5/7] Configurando entorno virtual Python 3.12 del Chatbot ==="
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

echo "=== [6/7] Creando servicios systemd (Backend Express + Chatbot Gunicorn) ==="

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

# IMPORTANTE: -w 1 --threads 8 comparte ~1.2 GB de RAM sin duplicar ChromaDB/spaCy y --timeout 120 soporta inferencia CPU
cat << EOF > /etc/systemd/system/zoomat-chatbot.service
[Unit]
Description=Asistente Virtual ZooMAT (Flask + Gunicorn)
After=network.target ollama.service mysql.service mariadb.service

[Service]
Type=simple
User=$SERVICE_USER
WorkingDirectory=$REPO_DIR/chatbot
EnvironmentFile=$REPO_DIR/chatbot/.env
ExecStart=$REPO_DIR/chatbot/venv/bin/gunicorn -w 1 --threads 8 --timeout 120 -b 127.0.0.1:8000 app:app
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable --now prozoo-backend.service
systemctl enable --now zoomat-chatbot.service

echo "=== [7/7] Creando script y cron de reindexación semanal (Lunes 02:00 AM) ==="
cat << EOF > "$REPO_DIR/chatbot/reindexar_semanal.sh"
#!/bin/bash
LOG="$REPO_DIR/chatbot/logs/ingesta_semanal.log"
echo "=== [\$(date '+%Y-%m-%d %H:%M:%S')] INICIO REINDEXACIÓN SEMANAL ===" >> "\$LOG"

# Garantiza que el servicio SIEMPRE vuelva a encender aunque falle la ingesta
reiniciar_bot() {
    echo "[\$(date '+%Y-%m-%d %H:%M:%S')] Iniciando zoomat-chatbot.service..." >> "\$LOG"
    systemctl start zoomat-chatbot.service
    echo "=== [\$(date '+%Y-%m-%d %H:%M:%S')] FIN REINDEXACIÓN ===" >> "\$LOG"
}
trap reiniciar_bot EXIT

systemctl stop zoomat-chatbot.service
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
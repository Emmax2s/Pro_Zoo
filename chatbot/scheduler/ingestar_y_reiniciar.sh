#!/bin/bash
# ============================================================
# ingestar_y_reiniciar.sh
# Se ejecuta todos los lunes a las 3:00 AM (hora Chiapas)
# 1. Ejecuta ingesta_datos.py dentro del contenedor del chatbot
# 2. Reinicia el contenedor del chatbot para cargar los nuevos metadatos
# ============================================================

set -e

LOG_DIR="/var/log/prozoo"
mkdir -p "$LOG_DIR"
LOG_FILE="$LOG_DIR/ingesta_$(date +%Y-%m-%d_%H-%M).log"

echo "============================================" | tee -a "$LOG_FILE"
echo "INICIO: $(date '+%Y-%m-%d %H:%M:%S')"       | tee -a "$LOG_FILE"
echo "============================================" | tee -a "$LOG_FILE"

# ── Paso 1: Ejecutar ingesta_datos.py dentro del chatbot ──
echo "[1/2] Ejecutando ingesta_datos.py en prozoo_chatbot..." | tee -a "$LOG_FILE"

docker exec prozoo_chatbot python ingesta_datos.py >> "$LOG_FILE" 2>&1

EXIT_CODE=$?
if [ $EXIT_CODE -eq 0 ]; then
    echo "[OK] Ingesta completada exitosamente." | tee -a "$LOG_FILE"
else
    echo "[ERROR] La ingesta falló con código $EXIT_CODE. Ver log: $LOG_FILE" | tee -a "$LOG_FILE"
    # Enviar notificación si falla (opcional: descomentar y configurar)
    # curl -s -X POST "$WEBHOOK_URL" -d "{\"text\":\"❌ Ingesta ZooMAT falló el $(date)\"}"
    exit $EXIT_CODE
fi

# ── Paso 2: Reiniciar el chatbot para cargar los nuevos metadatos ──
echo "[2/2] Reiniciando prozoo_chatbot para cargar metadatos nuevos..." | tee -a "$LOG_FILE"

docker restart prozoo_chatbot >> "$LOG_FILE" 2>&1

echo "[OK] Contenedor reiniciado. Los nuevos metadatos están disponibles." | tee -a "$LOG_FILE"
echo "FIN: $(date '+%Y-%m-%d %H:%M:%S')" | tee -a "$LOG_FILE"
echo "============================================" | tee -a "$LOG_FILE"

# Limpiar logs con más de 30 días de antigüedad
find "$LOG_DIR" -name "ingesta_*.log" -mtime +30 -delete

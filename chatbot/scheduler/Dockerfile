# ── Scheduler: Alpine + Docker CLI + cron ─────────────────
FROM alpine:3.19

# Instalar Docker CLI y bash (para poder hacer "docker exec" y "docker restart")
RUN apk add --no-cache docker-cli bash tzdata

# Zona horaria de Chiapas (UTC-6)
ENV TZ=America/Mexico_City
RUN cp /usr/share/zoneinfo/America/Mexico_City /etc/localtime && \
    echo "America/Mexico_City" > /etc/timezone

# Copiar el script de ingesta + reinicio
COPY ingestar_y_reiniciar.sh /usr/local/bin/ingestar_y_reiniciar.sh
RUN chmod +x /usr/local/bin/ingestar_y_reiniciar.sh

# Copiar el crontab
COPY crontab /etc/crontabs/root

# Crond en primer plano (modo Alpine)
CMD ["crond", "-f", "-l", "2"]

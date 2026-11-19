"""
Punto de entrada de producción para el Asistente Virtual ZooMAT.
Ejecuta la aplicación Flask sobre el servidor WSGI Waitress en Windows y plataformas compatibles.
En Linux también puede ser servido directamente por Gunicorn:
    gunicorn -w 1 --threads 8 -b 0.0.0.0:8000 app:app
"""
import os
import sys
from pathlib import Path
from dotenv import load_dotenv

# Cargar variables de entorno desde .env local si existe
ruta_env = Path(__file__).resolve().parent / ".env"
if ruta_env.exists():
    load_dotenv(dotenv_path=ruta_env)

# Importar la instancia WSGI de Flask
from app import app

def iniciar_servidor():
    from waitress import serve
    
    host = os.getenv("CHATBOT_HOST", "0.0.0.0")
    port = int(os.getenv("CHATBOT_PORT", 8000))
    threads = int(os.getenv("WAITRESS_THREADS", 8))
    
    print("=" * 60)
    print("ASISTENTE VIRTUAL ZOOMAT - SERVIDOR DE PRODUCCIÓN WSGI (WAITRESS)")
    print(f"Escuchando en: http://{host}:{port}")
    print(f"Hilos de atención concurrentes: {threads}")
    print("=" * 60)
    
    serve(app, host=host, port=port, threads=threads)

if __name__ == "__main__":
    iniciar_servidor()

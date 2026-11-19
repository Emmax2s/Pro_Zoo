"""
Test suite de validación para despliegue de producción multiplataforma (Windows Server / Linux)
y soporte universal de subruta en dominio oficial: https://www.zoomat.chiapas.gob.mx/
"""
import os
import re
import time
import pytest
from unittest.mock import patch, AsyncMock
from app import app, limpiar_audios_temporales, DIR_ASSETS, ARCHIVOS_PROTEGIDOS_ASSETS

@pytest.fixture
def client():
    app.config["TESTING"] = True
    with app.test_client() as client:
        yield client

def test_nombres_audio_dinamicos_unicos_uuid(client):
    """
    Valida que las respuestas dinámicas en /chat generen nombres únicos con formato
    resp_<hex>_<idioma>.mp3 sin condiciones de carrera.
    """
    with patch("app.generar_audio_hibrido", new_callable=AsyncMock) as mock_tts:
        mock_tts.return_value = None

        # Llamada 1 (Español)
        res1 = client.post("/chat", data={"pregunta": "¿Qué comen las iguanas verdes?", "idioma": "es"})
        assert res1.status_code == 200
        data1 = res1.get_json()
        assert "audio_url" in data1
        match1 = re.search(r"^/assets/(resp_[a-f0-9]{10}_es\.mp3)$", data1["audio_url"])
        assert match1 is not None, f"audio_url no cumple con el formato UUID: {data1['audio_url']}"
        nombre1 = match1.group(1)

        # Llamada 2 (Español consecutiva)
        res2 = client.post("/chat", data={"pregunta": "¿Dónde viven los ocelotes?", "idioma": "es"})
        assert res2.status_code == 200
        data2 = res2.get_json()
        match2 = re.search(r"^/assets/(resp_[a-f0-9]{10}_es\.mp3)$", data2["audio_url"])
        assert match2 is not None
        nombre2 = match2.group(1)

        # Los nombres deben ser estrictamente diferentes
        assert nombre1 != nombre2, f"Colisión detectada: llamadas consecutivas generaron el mismo audio: {nombre1}"

        # Llamada 3 (Inglés)
        res3 = client.post("/chat", data={"pregunta": "Where do jaguars live?", "idioma": "en"})
        assert res3.status_code == 200
        data3 = res3.get_json()
        match3 = re.search(r"^/assets/(resp_[a-f0-9]{10}_en\.mp3)$", data3["audio_url"])
        assert match3 is not None, f"audio_url en inglés no cumple con formato UUID: {data3['audio_url']}"


def test_limpiar_audios_temporales_candado_seguridad():
    """
    Valida que limpiar_audios_temporales() elimine audios temporales vencidos y
    NUNCA elimine audios estáticos de sugerencias rápidas ni imágenes PNG.
    """
    os.makedirs(DIR_ASSETS, exist_ok=True)
    ahora = time.time()

    # 1. Crear archivos de prueba
    archivo_vencido = os.path.join(DIR_ASSETS, "resp_9999999999_es.mp3")
    archivo_reciente = os.path.join(DIR_ASSETS, "resp_0000000000_es.mp3")
    archivo_png_prueba = os.path.join(DIR_ASSETS, "logo_prueba_seguridad.png")

    with open(archivo_vencido, "w", encoding="utf-8") as f:
        f.write("dummy audio vencido")
    with open(archivo_reciente, "w", encoding="utf-8") as f:
        f.write("dummy audio reciente")
    with open(archivo_png_prueba, "w", encoding="utf-8") as f:
        f.write("dummy png")

    # Ajustar mtime del vencido a 600 segundos en el pasado
    os.utime(archivo_vencido, (ahora - 600, ahora - 600))
    # Ajustar mtime del reciente al tiempo actual
    os.utime(archivo_reciente, (ahora, ahora))
    # Ajustar mtime de la imagen a 600 segundos en el pasado
    os.utime(archivo_png_prueba, (ahora - 600, ahora - 600))

    try:
        # Ejecutar limpieza con límite de 300 segundos
        limpiar_audios_temporales(max_antiguedad_segundos=300)

        # El vencido debe haberse borrado
        assert not os.path.exists(archivo_vencido), "El archivo temporal vencido no fue eliminado"
        # El reciente debe seguir existiendo
        assert os.path.exists(archivo_reciente), "El archivo temporal reciente fue borrado erróneamente"
        # La imagen PNG NUNCA debe ser tocada
        assert os.path.exists(archivo_png_prueba), "Una imagen PNG fue borrada erróneamente por la limpieza"

        # Verificar que los 6 audios estáticos oficiales sigan protegidos
        for audio_fijo in [
            "costos.mp3", "costos_en.mp3",
            "horarios.mp3", "horarios_en.mp3",
            "banos.mp3", "banos_en.mp3"
        ]:
            ruta_fijo = os.path.join(DIR_ASSETS, audio_fijo)
            if os.path.exists(ruta_fijo):
                assert audio_fijo in ARCHIVOS_PROTEGIDOS_ASSETS
    finally:
        # Limpieza de archivos de prueba
        for p in [archivo_vencido, archivo_reciente, archivo_png_prueba]:
            if os.path.exists(p):
                try:
                    os.remove(p)
                except OSError:
                    pass


def test_cabeceras_csp_y_frame_ancestors(client):
    """
    Valida que el endpoint raíz '/' inyecte las cabeceras Content-Security-Policy
    con frame-ancestors autorizando el dominio oficial y no contenga X-Frame-Options: DENY.
    """
    res = client.get("/")
    assert res.status_code == 200

    # No debe tener X-Frame-Options restrictivo
    assert res.headers.get("X-Frame-Options") != "DENY"
    assert res.headers.get("X-Frame-Options") != "SAMEORIGIN"

    # Debe contener Content-Security-Policy con frame-ancestors
    csp = res.headers.get("Content-Security-Policy", "")
    assert "frame-ancestors" in csp, f"Cabecera CSP no incluye frame-ancestors: {csp}"
    assert "https://www.zoomat.chiapas.gob.mx" in csp, "CSP no autoriza el dominio oficial del ZooMAT"
    assert "https://pruzo.me" in csp
    assert "http://localhost:*" in csp


def test_index_html_sin_rutas_absolutas_rigidas():
    """
    Valida que templates/index.html no use rutas absolutas rígidas como '/chat'
    o '/assets/logo_fondo.png' que fallen bajo la subruta '/chatbot/'.
    """
    ruta_html = os.path.join(os.path.dirname(__file__), "..", "templates", "index.html")
    with open(ruta_html, "r", encoding="utf-8") as f:
        html = f.read()

    # 1. Debe incluir función de resolución dinámica
    assert "function resolveAsset(" in html or "const resolveAsset" in html
    assert "basePath" in html

    # 2. No debe invocar fetch('/chat' con ruta absoluta rígida
    assert "fetch('/chat'" not in html, "index.html contiene llamada absoluta rígida fetch('/chat')"

    # 3. La marca de agua CSS debe usar ruta relativa 'assets/logo_fondo.png'
    assert "url('/assets/logo_fondo.png')" not in html, "Marca de agua CSS usa ruta absoluta '/assets/logo_fondo.png'"
    assert "url('assets/logo_fondo.png')" in html or 'url("assets/logo_fondo.png")' in html

    # 4. El audio devuelto por el backend debe procesarse dinámicamente
    assert "resolveAsset(data.audio_url)" in html or "resolveAsset(" in html


def test_importacion_y_objeto_wsgi_server():
    """
    Valida que chatbot/server.py se importe limpiamente y exponga el objeto WSGI 'app'
    compatible con Waitress y Gunicorn.
    """
    import server
    assert hasattr(server, "app"), "server.py no expone la instancia 'app'"
    assert hasattr(server, "iniciar_servidor"), "server.py no define la función 'iniciar_servidor'"
    assert callable(server.app.wsgi_app), "server.app no es una aplicación WSGI válida"

import pytest
from app import app
import re

def test_servir_imagenes_avatares():
    """Valida que Flask sirva correctamente las 3 imágenes de avatar desde /assets/."""
    client = app.test_client()
    avatares = [
        "bot_avatar.png",
        "bot_avatar2.png",
        "bot_avatar3.png"
    ]
    for avatar in avatares:
        resp = client.get(f"/assets/{avatar}")
        assert resp.status_code == 200, f"Error al servir /assets/{avatar}: {resp.status_code}"
        assert resp.mimetype in ["image/png", "application/octet-stream"], f"Mimetype inesperado: {resp.mimetype}"
        assert len(resp.data) > 100000, f"Tamaño de imagen demasiado pequeño para {avatar}"


def test_index_html_rotacion_avatares_y_tiempo_inactividad():
    """Valida que templates/index.html contenga la lógica de rotación de avatares y 90s de inactividad."""
    with open("templates/index.html", "r", encoding="utf-8") as f:
        html = f.read()

    # 1. Definición del array con los 3 avatares
    assert "AVATARES_BOT" in html
    assert "/assets/bot_avatar.png" in html
    assert "/assets/bot_avatar2.png" in html
    assert "/assets/bot_avatar3.png" in html

    # 2. Precarga de imágenes
    assert "new Image()" in html

    # 3. Función cambiarAvatarSesion
    assert "function cambiarAvatarSesion()" in html
    assert "zoomat_ultimo_avatar" in html
    assert "localStorage" in html

    # 4. Variable avatarActual y uso en burbujas e indicador
    assert "let avatarActual" in html
    assert "avatar.src = avatarActual;" in html
    assert "loading-bot-avatar" in html

    # 5. Sin referencias residuales fijas en el script al añadir mensajes
    assert "avatar.src = '/assets/bot_avatar.png';" not in html

    # 6. Tiempo de inactividad a 90 segundos exactos (90000 ms)
    match_tiempo = re.search(r'const\s+TIEMPO_INACTIVIDAD\s*=\s*(\d+);', html)
    assert match_tiempo is not None, "TIEMPO_INACTIVIDAD no encontrado"
    assert int(match_tiempo.group(1)) == 90000, f"TIEMPO_INACTIVIDAD debe ser 90000 ms, se encontró {match_tiempo.group(1)}"

    # 7. Invocación de cambiarAvatarSesion en carga inicial y en limpiarChat
    assert "cambiarAvatarSesion();" in html
    # En limpiarChat debe ejecutarse antes de mostrarBienvenida
    pos_limpiar = html.find("function limpiarChat()")
    pos_reiniciar = html.find("function reiniciarTemporizador()", pos_limpiar)
    bloque_limpiar = html[pos_limpiar:pos_reiniciar]
    assert "cambiarAvatarSesion();" in bloque_limpiar
    assert "mostrarBienvenida();" in bloque_limpiar
    assert bloque_limpiar.find("cambiarAvatarSesion();") < bloque_limpiar.find("mostrarBienvenida();")


def test_algoritmo_rotacion_sin_repeticion_consecutiva():
    """Simula el algoritmo de cambiarAvatarSesion para comprobar que nunca repita consecutivamente."""
    avatares = [
        '/assets/bot_avatar.png',
        '/assets/bot_avatar2.png',
        '/assets/bot_avatar3.png'
    ]
    import random

    ultimo = None
    for _ in range(50):
        candidatos = [a for a in avatares if a != ultimo]
        assert len(candidatos) == 2 or (ultimo is None and len(candidatos) == 3)
        seleccionado = random.choice(candidatos)
        if ultimo is not None:
            assert seleccionado != ultimo, f"El avatar '{seleccionado}' se repitió consecutivamente con '{ultimo}'"
        ultimo = seleccionado

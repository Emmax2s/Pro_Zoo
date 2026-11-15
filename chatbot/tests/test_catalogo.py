import pytest
from app import consultar_catalogo_general, obtener_especies_registradas, responder_consulta_existencia_animal, registrar_log
import app

def test_obtener_especies_registradas_no_vacio():
    especies = obtener_especies_registradas()
    assert len(especies) > 0
    # No debe incluir nombres espurios de archivos
    for e in especies:
        assert ".pdf" not in e
        assert "traduccion" not in e.lower()

def test_catalogo_animales_general():
    resp = consultar_catalogo_general("¿Qué animales hay en el ZooMAT?")
    assert resp is not None
    assert "El ZooMAT alberga y protege exclusivamente fauna nativa del estado de Chiapas" in resp
    assert "recorrido" in resp

def test_catalogo_ranas():
    resp = consultar_catalogo_general("¿Qué ranas tienen?")
    assert resp is not None
    assert "ranas" in resp.lower()
    assert "recorrido" in resp

def test_catalogo_sapos():
    resp = consultar_catalogo_general("¿Cuales sapos hay en el zoologico?")
    assert resp is not None
    assert "sapos" in resp.lower()

def test_catalogo_cecilias():
    resp = consultar_catalogo_general("¿Qué cecilias podemos ver?")
    assert resp is not None
    assert "cecilias" in resp.lower()

def test_definicion_sapo():
    resp = consultar_catalogo_general("¿Qué es un sapo?")
    assert resp is not None
    assert "anfibios anuros" in resp
    assert "ZooMAT" in resp

def test_definicion_anfibio():
    resp = consultar_catalogo_general("¿Qué es un anfibio?")
    assert resp is not None
    assert "clase de vertebrados" in resp
    assert "ZooMAT" in resp

def test_preguntas_biologicas_no_se_interceptan_por_catalogo():
    # Deben retornar None para fluir libremente a RAG
    assert consultar_catalogo_general("¿Qué comen las ranas?") is None
    assert consultar_catalogo_general("¿Dónde viven las cecilias?") is None
    assert consultar_catalogo_general("¿Qué comen los sapos?") is None
    assert consultar_catalogo_general("Háblame de los anfibios") is None

def test_filtro_por_familia_taxonomica():
    bufonidos = obtener_especies_registradas("bufonidae")
    assert len(bufonidos) >= 4
    craugastoridos = obtener_especies_registradas("craugastoridae")
    assert len(craugastoridos) >= 10

def test_existencia_animales_registrados_afirmativo():
    # Casos del log: confirmación afirmativa directa
    resp_zopilote = responder_consulta_existencia_animal("Tienen zopilotes")
    assert resp_zopilote is not None
    assert "¡Sí!" in resp_zopilote
    assert "Zopilote rey" in resp_zopilote

    resp_chachalaca = responder_consulta_existencia_animal("Tienen chachalacas?")
    assert resp_chachalaca is not None
    assert "¡Sí!" in resp_chachalaca
    assert "chachalacas" in resp_chachalaca.lower()

    resp_chachalaca_hay = responder_consulta_existencia_animal("Las chachalacas hay?")
    assert resp_chachalaca_hay is not None
    assert "¡Sí!" in resp_chachalaca_hay

    resp_jaguar = responder_consulta_existencia_animal("¿Tienen jaguares?")
    assert resp_jaguar is not None
    assert "¡Sí!" in resp_jaguar
    assert "jaguar" in resp_jaguar.lower()

def test_existencia_animales_exoticos_negativo():
    resp_leones = responder_consulta_existencia_animal("¿Cuentan con leones?")
    assert resp_leones is not None
    assert "No, en el ZooMAT no contamos con" in resp_leones
    assert "exclusivamente fauna nativa" in resp_leones

    resp_jirafas = responder_consulta_existencia_animal("¿Tienen jirafas?")
    assert resp_jirafas is not None
    assert "No, en el ZooMAT no contamos con" in resp_jirafas

def test_existencia_animales_no_registrados_negativo():
    resp_flamencos = responder_consulta_existencia_animal("¿Tienen flamencos?")
    assert resp_flamencos is not None
    assert "No contamos con ejemplares de flamencos" in resp_flamencos

def test_existencia_no_intercepta_logistica_ni_biologia():
    assert responder_consulta_existencia_animal("¿Tienen estacionamiento?") is None
    assert responder_consulta_existencia_animal("¿Tienen descuento con credencial?") is None
    assert responder_consulta_existencia_animal("¿Qué comen las chachalacas?") is None
    assert responder_consulta_existencia_animal("¿Dónde viven los zopilotes?") is None

def test_registrar_log_con_tiempo(tmp_path, monkeypatch):
    monkeypatch.setattr(app, "DIR_LOGS", str(tmp_path))
    
    app.registrar_log("¿Tienen jaguares?", "¡Sí! En el ZooMAT contamos con Jaguar.", tiempo_segundos=1.45)
    
    archivos = list(tmp_path.glob("log_*.txt"))
    assert len(archivos) == 1
    contenido = archivos[0].read_text(encoding="utf-8")
    assert "Pregunta del visitante: ¿Tienen jaguares?" in contenido
    assert "Respuesta del ChatBot: ¡Sí! En el ZooMAT contamos con Jaguar." in contenido
    assert "Tiempo de respuesta: 1.45 segundos." in contenido

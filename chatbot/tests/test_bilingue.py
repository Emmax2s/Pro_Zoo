import os
import pytest
from app import (
    verificar_sugerencia_rapida,
    verificar_interaccion_basica,
    consultar_catalogo_general,
    responder_consulta_existencia_animal,
    procesar_logica_hibrida,
    DATOS_LOGISTICA_EN,
    SUGERENCIAS_RAPIDAS_EN,
)
from enrutador_semantico import analizar_intencion


def test_sugerencias_rapidas_en():
    resp_costos, audio_costos = verificar_sugerencia_rapida("what are the entrance fees", idioma="en")
    assert resp_costos is not None
    assert "General admission is 35 pesos" in resp_costos
    assert audio_costos == "costos_en.mp3"

    resp_horarios, audio_horarios = verificar_sugerencia_rapida("what are the zoo hours", idioma="en")
    assert resp_horarios is not None
    assert "Tuesday to Sunday" in resp_horarios
    assert audio_horarios == "horarios_en.mp3"

    resp_banos, audio_banos = verificar_sugerencia_rapida("where are the restrooms located", idioma="en")
    assert resp_banos is not None
    assert "Monkey Plaza" in resp_banos
    assert audio_banos == "banos_en.mp3"


def test_interaccion_basica_en():
    # Saludos
    assert "Welcome to ZooMAT" in verificar_interaccion_basica("hello", idioma="en")
    assert "Welcome to ZooMAT" in verificar_interaccion_basica("good morning", idioma="en")

    # Despedidas
    assert "very welcome" in verificar_interaccion_basica("thank you", idioma="en")
    assert "wonderful visit" in verificar_interaccion_basica("bye", idioma="en")

    # Identidad
    assert "official virtual guide" in verificar_interaccion_basica("who are you", idioma="en")

    # Confirmaciones y negaciones
    assert "Perfect!" in verificar_interaccion_basica("yes", idioma="en")
    assert "Understood" in verificar_interaccion_basica("no thanks", idioma="en")

    # Gibberish
    assert "could not understand" in verificar_interaccion_basica("asdfghjkl", idioma="en")


def test_enrutador_logistica_en():
    # Enrutamiento de intención en inglés
    res_horario = analizar_intencion("What time do you open?")
    assert res_horario["ruta"] == "mysql"
    assert res_horario["entidad"] == "horario"
    assert res_horario["tipo"] == "general"

    res_estudiante = analizar_intencion("How much is admission for students?")
    assert res_estudiante["ruta"] == "mysql"
    assert res_estudiante["entidad"] == "boleto"
    assert res_estudiante["tipo"] == "estudiante"

    res_mascotas = analizar_intencion("Can I bring my dog?")
    assert res_mascotas["ruta"] == "mysql"
    assert res_mascotas["entidad"] == "regla"
    assert res_mascotas["tipo"] == "mascotas"

    res_banos = analizar_intencion("Where are the restrooms?")
    assert res_banos["ruta"] == "mysql"
    assert res_banos["entidad"] == "ubicacion"
    assert res_banos["tipo"] == "baños"


def test_procesar_logica_logistica_en():
    # Respuestas de logística inmediata en inglés (fast-path y consulta general)
    resp_horario = procesar_logica_hibrida("What time do you open?", idioma="en")
    assert "Tuesday to Sunday" in resp_horario
    assert "16:00" in resp_horario
    assert "Mondays" in resp_horario

    resp_horario_gen = procesar_logica_hibrida("What are the general visiting hours?", idioma="en")
    assert "09:00 to 16:00 hours" in resp_horario_gen
    assert "Mondays" in resp_horario_gen

    resp_estudiante = procesar_logica_hibrida("How much is admission for students?", idioma="en")
    assert "25 pesos" in resp_estudiante

    resp_mascotas = procesar_logica_hibrida("Can I bring my dog to the zoo?", idioma="en")
    assert "strictly prohibited" in resp_mascotas.lower()

    resp_alcohol = procesar_logica_hibrida("Is alcohol allowed in the zoo?", idioma="en")
    assert "strictly prohibited" in resp_alcohol.lower()


def test_existencia_animales_en():
    # Afirmativa para fauna nativa de Chiapas
    resp_jaguar = responder_consulta_existencia_animal("Do you have jaguars?", idioma="en")
    assert resp_jaguar is not None
    assert "Yes! At ZooMAT we house and exhibit" in resp_jaguar
    assert "Jaguar" in resp_jaguar

    resp_cocodrilo = responder_consulta_existencia_animal("Are there crocodiles?", idioma="en")
    assert resp_cocodrilo is not None
    assert "Yes! At ZooMAT we house and exhibit" in resp_cocodrilo

    # Negativa categórica para animales exóticos
    resp_leon = responder_consulta_existencia_animal("Do you have lions?", idioma="en")
    assert resp_leon is not None
    assert "No, at ZooMAT we do not have lions" in resp_leon
    assert "exclusively houses and preserves species native to the state of Chiapas" in resp_leon

    resp_jirafa = responder_consulta_existencia_animal("Are there giraffes?", idioma="en")
    assert resp_jirafa is not None
    assert "No, at ZooMAT we do not have giraffes" in resp_jirafa

    # Negativa para especie no registrada
    resp_flamenco = responder_consulta_existencia_animal("Do you have flamingos?", idioma="en")
    assert resp_flamenco is not None
    assert "We do not currently have flamingos specimens" in resp_flamenco


def test_catalogo_general_en():
    resp_general = consultar_catalogo_general("What animals do you have?", idioma="en")
    assert resp_general is not None
    assert "ZooMAT exclusively houses and protects wildlife native to the state of Chiapas" in resp_general
    assert "during your visit" in resp_general

    resp_ranas = consultar_catalogo_general("What frogs do you have?", idioma="en")
    assert resp_ranas is not None
    assert "frogs native to Chiapas" in resp_ranas

    resp_sapo_def = consultar_catalogo_general("What is a toad?", idioma="en")
    assert resp_sapo_def is not None
    assert "Toads are anuran amphibians" in resp_sapo_def


def test_archivos_audio_en_existen():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    p_costos = os.path.join(base_dir, "assets", "costos_en.mp3") if not os.path.exists("assets/costos_en.mp3") else "assets/costos_en.mp3"
    p_horarios = os.path.join(base_dir, "assets", "horarios_en.mp3") if not os.path.exists("assets/horarios_en.mp3") else "assets/horarios_en.mp3"
    p_banos = os.path.join(base_dir, "assets", "banos_en.mp3") if not os.path.exists("assets/banos_en.mp3") else "assets/banos_en.mp3"
    assert os.path.exists(p_costos)
    assert os.path.exists(p_horarios)
    assert os.path.exists(p_banos)
    assert os.path.getsize(p_costos) > 1000
    assert os.path.getsize(p_horarios) > 1000
    assert os.path.getsize(p_banos) > 1000


def test_endpoint_chat_post_y_logs(monkeypatch):
    from app import app
    client = app.test_client()

    # 1. Prueba de fast-path en español
    res_es = client.post('/chat', data={'pregunta': 'costos', 'idioma': 'es'})
    assert res_es.status_code == 200
    assert "tarifa general es de 35 pesos" in res_es.json["respuesta"]

    # 2. Prueba de fast-path en inglés
    res_en = client.post('/chat', data={'pregunta': 'costs', 'idioma': 'en'})
    assert res_en.status_code == 200
    assert "General admission is 35 pesos" in res_en.json["respuesta"]

    # 3. Prueba de flujo general con mock de audio para validar registrar_log con idioma
    async def mock_audio(texto, archivo, idioma='es'):
        return None

    monkeypatch.setattr("app.generar_audio_hibrido", mock_audio)

    res_saludo = client.post('/chat', data={'pregunta': 'hello', 'idioma': 'en'})
    assert res_saludo.status_code == 200
    assert "Welcome to ZooMAT" in res_saludo.json["respuesta"]


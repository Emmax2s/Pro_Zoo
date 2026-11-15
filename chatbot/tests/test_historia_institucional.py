# test_historia_institucional.py
# Batería Exhaustiva de Pruebas QA para Documentos Institucionales e Históricos (RAG)
# ZooMAT Virtual Assistant

import pytest
import re
from app import procesar_logica_hibrida, contexto_es_relevante
import enrutador_semantico
import motor_rag

class TestHistoriaInstitucionalRAG:
    """Pruebas del motor RAG, enrutador y síntesis de respuestas para documentos institucionales."""

    # 1. Enrutamiento semántico a RAG para variaciones de historia y fundación
    @pytest.mark.parametrize("pregunta,idioma", [
        ("¿Cuál es la historia del zoológico?", "es"),
        ("cuéntame sobre la historia del ZooMAT", "es"),
        ("¿En qué año se fundó el parque?", "es"),
        ("¿Quién fue el fundador del zoológico?", "es"),
        ("cuándo fue creado el zoomat", "es"),
        ("inicios y fundación del parque", "es"),
        ("origen histórico del zoológico", "es"),
        ("don miguel alvarez del toro quien fue", "es"),
        ("¿Quién fue Eliseo Palacios?", "es"),
        ("¿Quién fue César Domínguez?", "es"),
        ("¿Cuáles son las tres sedes del zoológico?", "es"),
        ("¿Por qué no pueden usar perfumes fuertes los cuidadores?", "es"),
        ("¿Cuándo llegó el primer jaguar negro al ZooMAT?", "es"),
        ("tell me about the history of zoomat", "en"),
        ("when was the zoo founded?", "en"),
        ("who founded the zoo?", "en"),
        ("what is the historical origin of zoomat?", "en"),
        ("who was Eliseo Palacios?", "en"),
        ("what are the three locations of the zoo?", "en"),
        ("why can workers not wear strong perfume?", "en"),
    ])
    def test_enrutamiento_historia_a_rag(self, pregunta, idioma):
        decision = enrutador_semantico.analizar_intencion(pregunta)
        assert decision["ruta"] == "rag", f"Debe enrutar a RAG para: {pregunta}"
        assert decision["entidad"] == "institucional"
        assert decision["tipo"] == "historia"

    # 2. Detección de tema institucional en motor_rag
    @pytest.mark.parametrize("pregunta", [
        "historia del zoologico",
        "fundacion del parque",
        "cuando fue fundado",
        "quien es el fundador",
        "who founded zoomat",
        "history of zoomat",
        "primer director eliseo palacios",
        "tres sedes del zoologico",
        "primer jaguar negro 1987",
        "prohibicion de perfumes desodorantes",
        "manantiales cerro hueco",
        "three locations of the zoo"
    ])
    def test_deteccion_especie_tema_institucional(self, pregunta):
        tema = motor_rag.detectar_especie(pregunta)
        assert tema is not None, f"No detectó documento institucional para: {pregunta}"
        assert any(k in tema.lower() for k in ["historia", "institucional", "zoomat"])

    # 3. Recuperación de contexto desde ChromaDB
    def test_recuperacion_contexto_chromadb_fundacion(self):
        contexto = motor_rag.buscar_contexto("historia del zoomat fundacion 1942 miguel alvarez del toro")
        assert "1942" in contexto, "El contexto recuperado debe incluir el año 1942"
        assert "Alvarez del Toro" in contexto or "Álvarez del Toro" in contexto, "El contexto debe mencionar al fundador"
        assert "Zapotal" in contexto, "El contexto debe mencionar El Zapotal"
        assert "Ninfa" in contexto, "El contexto debe mencionar la ubicación original La Ninfa"

    def test_recuperacion_contexto_chromadb_pioneros_y_sedes(self):
        contexto_pioneros = motor_rag.buscar_contexto("primer director eliseo palacios cesar dominguez becky eve alvarez")
        assert "Eliseo Palacios" in contexto_pioneros
        assert "César Domínguez" in contexto_pioneros or "Cesar Dominguez" in contexto_pioneros

        contexto_sedes = motor_rag.buscar_contexto("tres sedes Parque Madero Convivencia Infantil Zapotal")
        assert "Parque Madero" in contexto_sedes
        assert "Zapotal" in contexto_sedes

    def test_recuperacion_contexto_chromadb_rescates_y_normas(self):
        contexto_rescates = motor_rag.buscar_contexto("primer jaguar negro 1987 cocodrilo hembra chicoasen sumidero aguila harpia brasil")
        assert "jaguar negro" in contexto_rescates.lower()
        assert "1987" in contexto_rescates
        assert "Chicoasén" in contexto_rescates or "Chicoasen" in contexto_rescates

        contexto_normas = motor_rag.buscar_contexto("prohibicion perfumes desodorantes uniforme cuidadores manantiales cerro hueco")
        assert "perfumes" in contexto_normas.lower()
        assert "olfato" in contexto_normas.lower()

    # 4. Candado de relevancia institucional
    def test_candado_relevancia_institucional(self):
        contexto = "Historia del ZooMAT. Fundado en 1942 por Don Miguel Álvarez del Toro en Tuxtla Gutiérrez."
        # Pregunta histórica debe ser relevante aunque no contenga un animal
        assert contexto_es_relevante("cuando fue la fundacion del zoologico", contexto) is True
        assert contexto_es_relevante("quien fundo el zoomat en 1942", contexto) is True
        assert contexto_es_relevante("tell me the history of zoomat", contexto) is True
        assert contexto_es_relevante("quien fue eliseo palacios primer director", contexto) is True
        assert contexto_es_relevante("cuales fueron las tres sedes del zoologico", contexto) is True
        assert contexto_es_relevante("por que no pueden usar perfume los cuidadores", contexto) is True
        # Pregunta totalmente ajena a la historia o zoológico debe ser rechazada
        assert contexto_es_relevante("cuantos goles metio messi", contexto) is False

    # 5. Respuestas de extremo a extremo: Datos clave de la fundación
    @pytest.mark.parametrize("pregunta,palabras_clave,idioma", [
        ("¿En qué año se fundó el ZooMAT?", ["1942"], "es"),
        ("¿Quién fundó el zoológico?", ["miguel alvarez del toro", "álvarez del toro"], "es"),
        ("¿Dónde estaba ubicado originalmente el zoológico?", ["ninfa", "sabinal", "centenario"], "es"),
        ("¿En qué año se trasladó a El Zapotal?", ["1980", "zapotal"], "es"),
        ("¿Cuál es la misión principal del ZooMAT?", ["fauna", "chiapas", "regional", "nativa"], "es"),
        ("When was ZooMAT founded?", ["1942"], "en"),
        ("Who founded ZooMAT?", ["miguel alvarez del toro", "álvarez del toro"], "en"),
        ("Where was ZooMAT originally located?", ["ninfa", "sabinal", "centenario"], "en"),
        ("In what year did it move to El Zapotal?", ["1980", "zapotal"], "en"),
    ])
    def test_respuestas_end_to_end_historia(self, pregunta, palabras_clave, idioma):
        resp = procesar_logica_hibrida(pregunta, idioma=idioma)
        resp_lower = resp.lower()
        coincide = any(kw.lower() in resp_lower for kw in palabras_clave)
        assert coincide, f"La respuesta no contiene ninguna de las palabras esperadas {palabras_clave}. Respuesta: {resp}"
        assert "\n" not in resp.strip(), "La respuesta debe ser un solo párrafo continuo"
        assert "*" not in resp, "La respuesta no debe contener asteriscos"

    # 5.2 Respuestas de extremo a extremo: Nuevos hechos rescatados de los 2 PDFs
    @pytest.mark.parametrize("pregunta,palabras_clave,idioma", [
        ("¿Quién fue el primer director del zoológico?", ["eliseo palacios"], "es"),
        ("¿Quién fue el gobernador de Chiapas cuando inició el proyecto del zoológico?", ["pascacio gamboa", "rafael pascacio"], "es"),
        ("¿Quién trajo al Rey Zopilote al zoológico en 1982?", ["césar domínguez", "domínguez"], "es"),
        ("¿Qué hijas de Don Miguel colaboraron en el zoológico?", ["becky", "eve"], "es"),
        ("¿Por qué el personal no puede usar perfume o desodorante fuerte?", ["olfato", "estrés", "agresiv", "olor"], "es"),
        ("¿En qué año llegó el primer jaguar negro al ZooMAT?", ["1987"], "es"),
        ("¿De dónde provienen los cocodrilos que habitan en el Cañón del Sumidero?", ["chicoasén", "chicoasen", "hembra", "atropellada"], "es"),
        ("¿De qué país trajeron al águila harpía del ZooMAT?", ["brasil"], "es"),
        ("¿Cuántos nacimientos naturales de agua nacen en la cueva de Cerro Hueco?", ["siete", "7"], "es"),
        ("¿Cuáles fueron las tres sedes del zoológico?", ["centenario", "madero", "zapotal"], "es"),
        ("¿En qué parque estuvo el zoológico de 1949 a 1980?", ["madero"], "es"),
        ("Who was the first director of the zoo?", ["eliseo palacios"], "en"),
        ("Why are strong perfumes prohibited for staff members?", ["smell", "scent", "stress", "animal"], "en"),
        ("From which country was the harpy eagle brought?", ["brazil", "brasil"], "en"),
    ])
    def test_respuestas_end_to_end_nuevos_hechos(self, pregunta, palabras_clave, idioma):
        resp = procesar_logica_hibrida(pregunta, idioma=idioma)
        resp_lower = resp.lower()
        coincide = any(kw.lower() in resp_lower for kw in palabras_clave)
        assert coincide, f"La respuesta no contiene ninguna de las palabras esperadas {palabras_clave}. Respuesta: {resp}"
        assert "\n" not in resp.strip(), "La respuesta debe ser un solo párrafo continuo"
        assert "*" not in resp, "La respuesta no debe contener asteriscos"

    # 6. Datos no documentados: No alucinar y declarar falta de registro oficial
    @pytest.mark.parametrize("pregunta,idioma", [
        ("¿Cuánto costó construir el zoológico en 1942?", "es"),
        ("¿Cuántos albañiles trabajaron en la construcción original?", "es"),
        ("How much did it cost to build the zoo in 1942?", "en"),
    ])
    def test_dato_historico_no_documentado_sin_alucinacion(self, pregunta, idioma):
        resp = procesar_logica_hibrida(pregunta, idioma=idioma)
        resp_lower = resp.lower()
        if idioma == 'es':
            assert any(k in resp_lower for k in ["no cuento con", "registros oficiales", "específica", "especifica", "no contiene"]), f"Debe declarar falta de datos oficiales: {resp}"
        else:
            assert any(k in resp_lower for k in ["do not have", "official records", "specific", "specified", "records"]), f"Debe declarar falta de datos en inglés: {resp}"
        assert "millones" not in resp_lower
        assert "albañiles" not in resp_lower or "no cuento" in resp_lower

import unicodedata
from unittest.mock import patch
import pytest

import app
import enrutador_semantico
import motor_rag


def norm(texto):
    """Normaliza eliminando acentos y convirtiendo a minúsculas para comparaciones estables."""
    t = unicodedata.normalize("NFD", (texto or "").lower())
    return "".join(c for c in t if unicodedata.category(c) != "Mn")


class TestAuditoriaLog17Nov:
    """Suite de validación automatizada para las 20 correcciones derivadas de la auditoría de logs."""

    # 1. Multimedia: Mapa de baños
    def test_multimedia_mapa_banos(self):
        pregunta = "puedes mostrar los baños con un mapa"
        resp = norm(app.procesar_logica_hibrida(pregunta, idioma='es'))
        assert "no puedo mostrar mapas" in resp or "texto y voz" in resp
        assert "restaurantes" in resp
        assert "plaza monos" in resp
        assert "nutrias" in resp
        assert "harpia" in resp

    # 2. Multimedia: Mapa general del zoológico
    def test_multimedia_mapa_general(self):
        pregunta = "muéstrame un mapa del zoológico"
        resp = norm(app.procesar_logica_hibrida(pregunta, idioma='es'))
        assert "texto y voz" in resp
        assert "calzada cerro hueco" in resp
        assert "andadores" in resp

    # 3. Multimedia: Fotos de especies
    def test_multimedia_fotos(self):
        pregunta = "tienes fotos de las especies?"
        resp = norm(app.procesar_logica_hibrida(pregunta, idioma='es'))
        assert "no puedo mostrar fotografias" in resp or "no puedo mostrar fotos" in resp
        assert any(w in resp for w in ["describir", "plumaje", "pelaje", "caracteristicas"])

    # 4. Solicitud de cambio de idioma por texto
    def test_cambio_idioma_texto(self):
        pregunta = "puedes cambiar el idioma al inglés?"
        resp = app.procesar_logica_hibrida(pregunta, idioma='es')
        assert "[ ES | EN ]" in resp
        assert "bilingüe" in resp or "bilingue" in norm(resp)

    # 5. Descripción de ave roja sin nombre taxonómico -> RAG Guacamaya roja
    def test_ave_roja_descripcion(self):
        pregunta = "hay una ave muy bonita de colores principalmente rojo cómo se llama"
        capturado = {}

        def fake_llama(prompt_usuario, instrucciones_sistema=""):
            capturado["prompt"] = prompt_usuario
            return f"__MOCK_RAG__|{prompt_usuario}"

        with patch("app.preguntar_a_llama", side_effect=fake_llama), \
             patch("app.generar_audio_hibrido"):
            resp = app.procesar_logica_hibrida(pregunta, idioma='es')

        assert resp.startswith("__MOCK_RAG__|")
        ctx = norm(capturado.get("prompt", ""))
        assert "guacamaya" in ctx or "ara macao" in ctx

    # 6. Juegos fuera de dominio
    def test_juegos_fuera_dominio(self):
        pregunta = "puedo jugar conmigo?"
        resp = norm(app.procesar_logica_hibrida(pregunta, idioma='es'))
        assert "no tengo la funcion de realizar juegos" in resp or "no realizo juegos" in resp
        assert any(f in resp for f in ["jaguar", "tapir", "quetzal", "fauna"])

    # 7. Conteo fuera de dominio
    def test_conteo_fuera_dominio(self):
        pregunta = "unos, dos, tres que sigue?"
        resp = norm(app.procesar_logica_hibrida(pregunta, idioma='es'))
        assert "no tengo la funcion de realizar juegos" in resp or "acertijos" in resp
        assert "zoomat" in resp

    # 8. Distancias en km y Cerro Mactumatzá
    def test_distancias_mactumatza(self):
        pregunta = "¿a cuántos kilómetros está el cerro Mactumatzá?"
        resp = norm(app.procesar_logica_hibrida(pregunta, idioma='es'))
        assert "no cuento con calculo de distancias en kilometros" in resp
        assert "suroriente" in resp
        assert "suroeste" in resp

    # 9. GPS y ubicación del visitante
    def test_gps_ubicacion_visitante(self):
        pregunta = "sabes desde dónde te estoy escribiendo?"
        resp = norm(app.procesar_logica_hibrida(pregunta, idioma='es'))
        assert "privacidad" in resp
        assert "gps" in resp or "geografica" in resp

    # 10. Pregunta biológica sin sujeto
    def test_pregunta_biologica_sin_sujeto(self):
        app.reiniciar_memoria_turno()
        pregunta = "¿Cuántos años vive ?"
        resp = norm(app.procesar_logica_hibrida(pregunta, idioma='es'))
        assert "nombre del animal" in resp

    # 11. Servicio: Guía diurno (prioridad sobre otros servicios)
    def test_servicio_guiado_diurno(self):
        pregunta = "quisiera contratar un guía para que nos explique el recorrido durante el día"
        decision = enrutador_semantico.analizar_intencion(pregunta)
        assert decision["ruta"] == "mysql"
        assert decision["entidad"] == "servicio"
        assert decision["tipo"] == "guiado_diurno"

        resp = norm(app.procesar_logica_hibrida(pregunta, idioma='es'))
        assert "20 pesos" in resp

    # 12. Regla: Prohibido alimentar animales (prioridad sobre andadores)
    def test_regla_alimentar_animales_andadores(self):
        pregunta = "podemos aventarles fruta desde los andadores a los animales?"
        decision = enrutador_semantico.analizar_intencion(pregunta)
        assert decision["ruta"] == "mysql"
        assert decision["entidad"] == "regla"
        assert decision["tipo"] == "alimentar_animales"

        resp = norm(app.procesar_logica_hibrida(pregunta, idioma='es'))
        assert "prohibido" in resp

    # 13. Animales libres en la reserva -> RAG institucional
    def test_animales_libres_habitats(self):
        pregunta = "¿qué animales o especies andan sueltos o libres en el parque?"
        decision = enrutador_semantico.analizar_intencion(pregunta)
        assert decision["entidad"] == "institucional" or decision["ruta"] == "rag"

        ctx = norm(motor_rag.buscar_contexto(pregunta))
        assert any(k in ctx for k in ["libertad", "fauna silvestre", "zapotal", "manantiales", "andadores"])

    # 14. Tipos de aves o reptiles -> Catálogo general (no cae en falso positivo de boletos)
    def test_tipos_aves_o_reptiles_catalogo(self):
        for pregunta in ["qué tipos de aves tienen?", "qué tipos de reptiles hay?"]:
            decision = enrutador_semantico.analizar_intencion(pregunta)
            assert decision["entidad"] != "boleto"
            resp = norm(app.consultar_catalogo_general(pregunta, idioma='es'))
            assert resp is not None
            assert "zoomat" in resp
            assert "especies" in resp

    # 15. Horarios en inglés: palabras aisladas 'Schedules' y 'Hours'
    def test_horarios_single_word_en(self):
        for palabra in ["Schedules", "Hours", "schedule"]:
            resp = app.procesar_logica_hibrida(palabra, idioma='en')
            assert "09:00 to 16:00 hours" in resp
            assert "Mondays" in resp

    # 16. Animales exóticos con erratas / variantes tipográficas (EN / ES)
    def test_animales_exoticos_typos(self):
        resp_en = norm(app.procesar_logica_hibrida("do you have jirafes?", idioma='en'))
        assert "do not have jirafe" in resp_en or "exotic species" in resp_en or "exclusively" in resp_en

        resp_es = norm(app.procesar_logica_hibrida("hay girafes?", idioma='es'))
        assert "no contamos con girafe" in resp_es or "exclusivamente fauna nativa" in resp_es or "especies exoticas" in resp_es

    # 17. Saludo compuesto con pregunta ("Hola hay tapires?")
    def test_saludo_compuesto_tapir(self):
        pregunta = "Hola hay tapires?"
        resp = norm(app.procesar_logica_hibrida(pregunta, idioma='es'))
        # No debe ser cortado como bienvenida vacía
        assert "bienvenido al zoomat. ¿sobre que especie" not in resp
        assert "tapir" in resp
        assert "si" in resp

    # 18. Sapo borracho / Sapo excavador: Recuperación precisa sin caer a Sapo.docx genérico
    def test_sapo_borracho_recuperacion(self):
        for pregunta in ["¿Qué es el sapo borracho?", "¿Dónde vive el sapo excavador?"]:
            ctx = norm(motor_rag.buscar_contexto(pregunta))
            assert "rhinophrynus dorsalis" in ctx or "sapo borracho" in ctx or "sapo de rebano" in ctx

    # 19. Mito de verrugas en anfibios -> Mitos y Realidades
    def test_mito_verrugas_anfibios(self):
        pregunta = "si toco un sapo me salen verrugas?"
        ctx = norm(motor_rag.buscar_contexto(pregunta))
        assert "verrugas" in ctx
        assert "vph" in ctx or "virus del papiloma" in ctx

    # 20. Mito de cigarro en sapos -> Mitos y Realidades
    def test_mito_cigarro_anfibios(self):
        pregunta = "es verdad que si le das un cigarro a un sapo explota?"
        ctx = norm(motor_rag.buscar_contexto(pregunta))
        assert "cigarrillo" in ctx or "cigarro" in ctx
        assert "maltrato" in ctx or "humo" in ctx or "muere" in ctx

    # 21. Regla general abierta: Reglamento, reglas del zoológico, prohibiciones
    def test_regla_general_abierta(self):
        preguntas = [
            "qué reglamentos hay",
            "cuáles son las reglas del zoológico?",
            "qué está prohibido?",
            "cuáles son las normas del parque"
        ]
        for p in preguntas:
            decision = enrutador_semantico.analizar_intencion(p)
            assert decision["ruta"] == "mysql"
            assert decision["entidad"] == "regla"
            assert decision["tipo"] == "general"

            resp = norm(app.procesar_logica_hibrida(p, idioma='es'))
            assert "andadores marcados" in resp
            assert "mascotas" in resp
            assert "alcoholicas" in resp
            assert "tocar o alimentar" in resp
            assert "carriolas" in resp

        # Caso en inglés
        p_en = "what are the zoo rules?"
        decision_en = enrutador_semantico.analizar_intencion(p_en)
        assert decision_en["entidad"] == "regla"
        assert decision_en["tipo"] == "general"
        resp_en = norm(app.procesar_logica_hibrida(p_en, idioma='en'))
        assert "marked pathways" in resp_en
        assert "pets" in resp_en

    # 22. Boleto para visitantes foráneos / turistas / extranjeros
    def test_boleto_foraneos_turistas(self):
        preguntas = [
            "y si soy de otro estado?",
            "cuánto pagan los de otro estado?",
            "soy turista de fuera de Chiapas",
            "cuánto pagan los visitantes extranjeros?"
        ]
        for p in preguntas:
            decision = enrutador_semantico.analizar_intencion(p)
            assert decision["ruta"] == "mysql"
            assert decision["entidad"] == "boleto"
            assert decision["tipo"] == "foraneo"

            resp = norm(app.procesar_logica_hibrida(p, idioma='es'))
            assert "35 pesos" in resp
            assert "25 pesos" in resp
            assert "martes" in resp
            assert "ine" in resp

        # Caso en inglés
        p_en = "admission fee for visitors from other states"
        decision_en = enrutador_semantico.analizar_intencion(p_en)
        assert decision_en["entidad"] == "boleto"
        assert decision_en["tipo"] == "foraneo"
        resp_en = norm(app.procesar_logica_hibrida(p_en, idioma='en'))
        assert "35 pesos" in resp_en
        assert "25 pesos" in resp_en

    # 23. Libros y relatos de Don Miguel Álvarez del Toro -> RAG Institucional
    def test_libros_miguel_historias(self):
        pregunta = "En qué libro miguel redacta sus historias?"
        decision = enrutador_semantico.analizar_intencion(pregunta)
        assert decision["entidad"] == "institucional" or decision["ruta"] == "rag"

        ctx = norm(motor_rag.buscar_contexto(pregunta))
        assert "asi era chiapas" in ctx
        assert "cronicas" in ctx or "expediciones" in ctx

        resp = norm(app.procesar_logica_hibrida(pregunta, idioma='es'))
        assert "asi era chiapas" in resp

    # 24. Pregunta elíptica de seguimiento: Nombre de los libros tras preguntar por sus historias
    def test_seguimiento_libros_nombre(self):
        app.reiniciar_memoria_turno()
        # Turno 1
        r1 = app.procesar_logica_hibrida("En qué libro miguel redacta sus historias?", idioma='es')
        assert "asi era chiapas" in norm(r1)

        # Turno 2 (pregunta elíptica sin sujeto)
        r2 = norm(app.procesar_logica_hibrida("¿cómo se llaman esos libros?", idioma='es'))
        assert "animales silvestres" in r2
        assert "reptiles" in r2
        assert "aves" in r2
        assert "mamiferos" in r2
        assert "aranas" in r2 or "arana" in r2
        assert "asi era chiapas" in r2

    # 25. Pregunta elíptica de seguimiento: ¿Sigue vivo Don Miguel?
    def test_seguimiento_don_miguel_vivo(self):
        app.reiniciar_memoria_turno()
        # Turno 1
        r1 = app.procesar_logica_hibrida("Y don miguel?", idioma='es')
        assert any(k in norm(r1) for k in ["miguel alvarez del toro", "director", "fundador"])

        # Turno 2 (pregunta elíptica sobre vida/fallecimiento)
        r2 = norm(app.procesar_logica_hibrida("sigue vivo?", idioma='es'))
        assert "1996" in r2 or "fallecio" in r2 or "murio" in r2

    # 26. Pregunta elíptica de seguimiento: Pregunta biológica sin sujeto tras consultar especie
    def test_seguimiento_biologico_especie(self):
        app.reiniciar_memoria_turno()
        # Turno 1
        r1 = app.procesar_logica_hibrida("Y el jaguar?", idioma='es')
        assert "jaguar" in norm(r1)

        # Turno 2 (años de vida sin mencionar al jaguar)
        r2 = norm(app.procesar_logica_hibrida("cuántos años vive?", idioma='es'))
        assert "por favor escribe el nombre del animal" not in r2
        assert any(k in r2 for k in ["ano", "anos", "libertad", "cautividad", "vida", "longevidad"])

    # 27. Catálogo de Clases Biológicas Múltiples (Aves y Reptiles)
    def test_catalogo_clases_multiples(self):
        pregunta = "¿Qué tipos de aves o reptiles puedo conocer durante mi visita?"
        decision = enrutador_semantico.analizar_intencion(pregunta)
        assert decision.get("entidad") != "regla"

        resp = norm(app.procesar_logica_hibrida(pregunta, idioma='es'))
        assert "regla" not in resp and "prohibido" not in resp
        assert "aves" in resp
        assert "reptiles" in resp
        assert "zoomat" in resp

    # 28. Consulta explícita: Don Miguel sigue vivo
    def test_don_miguel_sigue_vivo_explicito(self):
        # En español
        r_es = norm(app.procesar_logica_hibrida("Don miguel sigue vivo?", idioma='es'))
        assert "1996" in r_es
        assert "fallecio" in r_es or "murio" in r_es
        assert "1942" in r_es

        # En inglés
        r_en = norm(app.procesar_logica_hibrida("Is Don Miguel still alive?", idioma='en'))
        assert "1996" in r_en
        assert "passed away" in r_en or "died" in r_en

    # 29. Pronombres enclíticos ("puedes mostrarlos") con memoria de baños
    def test_pronombre_puedes_mostrarlos(self):
        app.reiniciar_memoria_turno()
        # Turno 1: Baños
        r1 = app.procesar_logica_hibrida("Baños", idioma='es')
        assert "sanitarios" in norm(r1) or "banos" in norm(r1)

        # Turno 2: "Puedes mostrarlos"
        r2 = norm(app.procesar_logica_hibrida("Puedes mostrarlos", idioma='es'))
        assert "texto y voz" in r2
        assert "no puedo mostrar mapas" in r2 or "no puedo mostrar" in r2
        assert "restaurantes" in r2
        assert "plaza monos" in r2

    # 30. Consulta descriptiva de ave roja vistosa -> RAG Guacamaya roja
    def test_ave_roja_vistosa_guacamaya(self):
        pregunta = "me gusta la jaula de un ave muy bonita de colores principalmente rojo como se llama?"
        capturado = {}

        def fake_llama(prompt_usuario, instrucciones_sistema=""):
            capturado["prompt"] = prompt_usuario
            return f"__MOCK_RAG__|{prompt_usuario}"

        with patch("app.preguntar_a_llama", side_effect=fake_llama), \
             patch("app.generar_audio_hibrido"):
            resp = app.procesar_logica_hibrida(pregunta, idioma='es')

        assert resp.startswith("__MOCK_RAG__|")
        ctx = norm(capturado.get("prompt", ""))
        assert "guacamaya" in ctx or "ara macao" in ctx

    # 31. Solo nombre sin solicitud de dieta (Perico epistula enana)
    def test_perico_solo_nombre_sin_dieta(self):
        pregunta = "Perico epistula enana"
        capturado = {}

        def fake_llama(prompt_usuario, instrucciones_sistema=""):
            capturado["prompt"] = prompt_usuario
            return f"El Perico cabeza blanca (Pionus senilis) es un ave representativa de Chiapas con plumaje verde y frente blanca."

        with patch("app.preguntar_a_llama", side_effect=fake_llama), \
             patch("app.generar_audio_hibrido"):
            resp = norm(app.procesar_logica_hibrida(pregunta, idioma='es'))

        # El contexto inyectado al LLM NO debe contener la línea de dieta vacía
        ctx = capturado.get("prompt", "")
        fragmento = ctx.split("CONSULTA DEL VISITANTE:")[0]
        assert "dieta: no se contiene información" not in fragmento.lower()
        assert "no cuento con informacion especifica sobre la dieta" not in resp

    # 32. Consultas dobles compuestas en inglés
    def test_consultas_dobles_en(self):
        # 1. Apertura + Boleto de estudiante
        p1 = "What time do you open and how much is admission for students?"
        r1 = norm(app.procesar_logica_hibrida(p1, idioma='en'))
        assert "09:00" in r1
        assert "16:00" in r1
        assert "25 pesos" in r1
        assert "student" in r1

        # 2. Ubicación de baños + Mascotas
        p2 = "Where are the restrooms located and can I bring my dog to the zoo?"
        r2 = norm(app.procesar_logica_hibrida(p2, idioma='en'))
        assert "four restroom modules" in r2 or "restroom" in r2
        assert "restaurant" in r2
        assert "plaza monos" in r2
        assert "prohibited" in r2
        assert "dogs" in r2 or "pets" in r2


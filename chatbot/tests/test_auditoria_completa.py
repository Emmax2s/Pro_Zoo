# test_auditoria_completa.py
# Batería Exhaustiva de Pruebas Automatizadas QA: Fases 3 y 4
# ZooMAT Virtual Assistant - Hardening & Regression Suite

import pytest
import re
from app import procesar_logica_hibrida, es_fuera_de_dominio, contexto_es_relevante
import enrutador_semantico
import motor_rag
import motor_mysql

# ==============================================================================
# FASE 3: PRUEBAS DE REGRESIÓN Y VARIACIÓN SEMÁNTICA (5 A 8 FORMAS POR CONSULTA)
# ==============================================================================

class TestFase3RegresionVariaciones:

    # --------------------------------------------------------------------------
    # Tema 1: Historia del zoológico y fundación (Falso negativo en log de hoy)
    # --------------------------------------------------------------------------
    @pytest.mark.parametrize("pregunta", [
        "cuando se fundo el zoologico?",
        "¿Quién fundó el ZooMAT?",
        "cuéntame la historia del zoologico",
        "en qué año fue creado el parque",
        "quien creo el zoomat",
        "historia y antecedentes del zoomat",
        "when was the zoo founded?",
        "who founded zoomat?"
    ])
    def test_tema1_historia_fundacion(self, pregunta):
        idioma = 'en' if 'founded' in pregunta.lower() or 'when' in pregunta.lower() else 'es'
        decision = enrutador_semantico.analizar_intencion(pregunta)
        assert decision["ruta"] == "rag", f"Fallo de ruta en: {pregunta}"
        assert decision["entidad"] == "institucional"
        assert decision["tipo"] == "historia"
        
        resp = procesar_logica_hibrida(pregunta, idioma=idioma)
        assert any(k in resp.lower() for k in ["1942", "miguel alvarez del toro", "miguel álvarez del toro", "álvarez", "zapotal", "ninfa"]), f"Dato histórico faltante en respuesta: {resp}"

    # --------------------------------------------------------------------------
    # Tema 2: Atributos biológicos vs Presencia (Jaguar: longevidad / años)
    # --------------------------------------------------------------------------
    @pytest.mark.parametrize("pregunta", [
        "CUANTOS AÑOS TIENE EL JAGUAR",
        "¿Cuántos años vive un jaguar?",
        "cual es la esperanza de vida del jaguar",
        "cuanto tiempo puede vivir el jaguar",
        "longevidad del jaguar en cautiverio",
        "edad maxima que alcanza un jaguar",
        "how many years does a jaguar live?",
        "what is the lifespan of a jaguar?"
    ])
    def test_tema2_atributos_biologicos_jaguar(self, pregunta):
        idioma = 'en' if 'lifespan' in pregunta.lower() or 'how many' in pregunta.lower() else 'es'
        resp = procesar_logica_hibrida(pregunta, idioma=idioma)
        # No debe ser la respuesta genérica de existencia ("¡Sí! En el ZooMAT contamos con...")
        assert "¡sí! en el zoomat contamos con" not in resp.lower(), f"Falso positivo de existencia en: {pregunta}"
        assert "yes! at zoomat we house" not in resp.lower()
        # Debe contener datos de años/longevidad o declarar que consulta la ficha biológica
        assert any(k in resp.lower() for k in ["año", "años", "year", "years", "longevidad", "vida", "cautiverio", "libertad", "registros"]), f"Respuesta inadecuada: {resp}"

    # --------------------------------------------------------------------------
    # Tema 3: Dieta / Sinónimos estrictos de alimentación (Águila Harpía)
    # --------------------------------------------------------------------------
    @pytest.mark.parametrize("pregunta", [
        "cual es la comida del aguila arpia",
        "¿Qué come el águila harpía en el zoológico?",
        "de qué se alimenta el águila harpía",
        "cuál es la dieta del águila harpía",
        "qué presas caza el águila harpía",
        "comida habitual del aguila arpia",
        "what is the diet of the harpy eagle?",
        "what does the harpy eagle eat?"
    ])
    def test_tema3_dieta_aguila_arpia(self, pregunta):
        idioma = 'en' if 'harpy' in pregunta.lower() else 'es'
        resp = procesar_logica_hibrida(pregunta, idioma=idioma)
        # Llama no debe decir que falta información, ya que la ficha contiene Alimentación
        assert "no cuento con información específica" not in resp.lower(), f"Falso dato faltante en: {pregunta}"
        assert "do not have specific information" not in resp.lower()
        # Debe responder con mamíferos, monos, perezosos, etc.
        assert any(k in resp.lower() for k in ["mamíferos", "mamiferos", "monos", "perezosos", "tlacuaches", "presas", "alimenta", "feed", "mammals", "monkeys"]), f"Fallo al responder dieta: {resp}"

    # --------------------------------------------------------------------------
    # Tema 4: Tolerancia a errores tipográficos en especies (Fuzzy Matching)
    # --------------------------------------------------------------------------
    @pytest.mark.parametrize("pregunta,especie_esperada", [
        ("AGULA ARPIA", "Águila arpía"),
        ("dame info del agula arpia", "Águila arpía"),
        ("Muercielago frutero", "Murciélago frutero"),
        ("que come el muercielago frutero", "Murciélago frutero"),
        ("donde vive el muercielago", "Murciélago frutero"),
        ("hablame del jagur", "Jaguar"),
        ("ranita de cristla", "Ranita de cristal"),
        ("sapo chiquitooo", "Sapo chiquito")
    ])
    def test_tema4_errores_tipograficos_especies(self, pregunta, especie_esperada):
        esp = motor_rag.detectar_especie(pregunta)
        assert esp is not None, f"No detectó especie con typo en: {pregunta}"
        assert motor_rag.normalizar_texto(esp) == motor_rag.normalizar_texto(especie_esperada), f"Detectó '{esp}' en vez de '{especie_esperada}'"

    # --------------------------------------------------------------------------
    # Tema 5: Hora de reloj y día calendario vs Horario del parque
    # --------------------------------------------------------------------------
    @pytest.mark.parametrize("pregunta", [
        "que hora es",
        "dame la hora",
        "me dices la hora por favor",
        "tienes la hora?",
        "que dia es hoy",
        "que fecha es hoy",
        "what time is it",
        "what day is today"
    ])
    def test_tema5_hora_reloj_y_dia_calendario(self, pregunta):
        idioma = 'en' if 'what' in pregunta.lower() else 'es'
        resp = procesar_logica_hibrida(pregunta, idioma=idioma)
        # Debe responder con hora/fecha viva Y mencionar el horario oficial del parque
        assert any(k in resp.lower() for k in ["horas", "hora", "hoy es", "today is", "currently"]), f"No dio hora/fecha adecuada: {resp}"
        assert any(k in resp.lower() for k in ["zoomat", "taquilla", "ticket", "parque"]), f"No contextualizó con ZooMAT: {resp}"

    # --------------------------------------------------------------------------
    # Tema 6: Descuentos y boletos para pensionados / INAPAM / INSEN
    # --------------------------------------------------------------------------
    @pytest.mark.parametrize("pregunta", [
        "tienen descuento para jubilados?",
        "cuanto pagan los de la tercera edad?",
        "descuento para adultos mayores con inapam",
        "precio de entrada con credencial insen",
        "costo del boleto para abuelitos",
        "cuanto pagan los pensionados",
        "senior citizen discount ticket",
        "how much do seniors pay?"
    ])
    def test_tema6_descuentos_pensionados_inapam(self, pregunta):
        idioma = 'en' if 'senior' in pregunta.lower() or 'how much' in pregunta.lower() else 'es'
        decision = enrutador_semantico.analizar_intencion(pregunta)
        assert decision["ruta"] == "mysql"
        assert decision["entidad"] == "boleto"
        assert decision["tipo"] == "inapam"
        
        resp = procesar_logica_hibrida(pregunta, idioma=idioma)
        assert "25 pesos" in resp.lower(), f"Tarifa de 25 pesos no encontrada en: {resp}"

    # --------------------------------------------------------------------------
    # Tema 7: Saludos con modismos o caracteres repetidos
    # --------------------------------------------------------------------------
    @pytest.mark.parametrize("pregunta", [
        "que ondaaaa",
        "holaaaaa",
        "ola buenas",
        "hola que tal",
        "que hubo",
        "buenas tardes",
        "hellooo",
        "hey there"
    ])
    def test_tema7_saludos_modismos(self, pregunta):
        idioma = 'en' if 'hello' in pregunta.lower() or 'hey' in pregunta.lower() else 'es'
        resp = procesar_logica_hibrida(pregunta, idioma=idioma)
        assert any(k in resp.lower() for k in ["hola", "bienvenido", "hello", "welcome"]), f"No saludó amablemente a: {pregunta}"

    # --------------------------------------------------------------------------
    # Tema 8: Frustración, quejas o desgano conversacional
    # --------------------------------------------------------------------------
    @pytest.mark.parametrize("pregunta", [
        "Como que no tienes info si me la acabas de dar cabrón",
        "responde lo que quieras pues",
        "lo que tu digas",
        "me da igual",
        "me caes mal",
        "eres un robot malo no sirves",
        "whatever you want"
    ])
    def test_tema8_frustracion_y_quejas(self, pregunta):
        idioma = 'en' if 'whatever' in pregunta.lower() else 'es'
        resp = procesar_logica_hibrida(pregunta, idioma=idioma)
        # Debe responder con cortesía profesional y redirigir
        assert any(k in resp.lower() for k in ["lamento", "apologize", "puedo contarte", "tell you", "ayudarte", "apoyarte", "assist"]), f"No manejó la queja con cortesía: {resp}"


# ==============================================================================
# FASE 4: PRUEBAS EXPLORATORIAS Y BLINDAJE CONTRA ATAQUES FUERA DE CONTEXTO
# ==============================================================================

class TestFase4ExploratoriaYOutDeDominio:

    # --------------------------------------------------------------------------
    # 1. Batería de Ataques Fuera de Dominio (Al menos 15 entradas trampa)
    # --------------------------------------------------------------------------
    @pytest.mark.parametrize("pregunta_trampa", [
        "cuanto gano mexico a ecuador en el mundial",
        "Cuando se celebra el mundial",
        "¿Sales ahí?",
        "2+2",
        "cuanto es la raiz cuadrada de 144",
        "quien es el presidente de estados unidos",
        "como programar un bot en python",
        "quien canta la cancion de shakira",
        "habitat de los cuervos",
        "donde viven los osos polares",
        "que horario tiene el zoologico de chapultepec",
        "cual es la capital de francia",
        "tienes novia robot?",
        "que pelicula de avengers es la mejor",
        "quien gano el clasico barcelona real madrid",
        "cuantos goles metio messi en su carrera",
        "cuantas ruedas tiene un automovil",
        "explicame la segunda guerra mundial"
    ])
    def test_bateria_ataques_fuera_de_dominio(self, pregunta_trampa):
        # El bot NUNCA debe alucinar una ficha de animal ni responder de fútbol o política
        resp = procesar_logica_hibrida(pregunta_trampa, idioma='es')
        
        # Palabras prohibidas que indicarían alucinación
        palabras_prohibidas = [
            "cotorra de cueva", "trogón", "trogon", "murciélago frutero", "barcelona",
            "goles", "francia", "messi", "pitágoras", "ecuador ganó", "4", "12"
        ]
        for pb in palabras_prohibidas:
            assert pb not in resp.lower(), f"Fuga de información o alucinación con '{pb}' en: {pregunta_trampa}"
            
        # Debe contener el mensaje de exclusividad de fauna de Chiapas o rol del asistente
        assert any(k in resp.lower() for k in [
            "asistente virtual", "zoomat", "fauna", "chiapas", "regional", "no albergamos", "exclusivamente"
        ]), f"No aplicó filtro fuera de dominio a: {pregunta_trampa} (Respuesta fue: {resp})"

    # --------------------------------------------------------------------------
    # 2. Nuevas consultas de logística (4 módulos de baños, mascotas, transporte)
    # --------------------------------------------------------------------------
    @pytest.mark.parametrize("pregunta", [
        "donde estan los baños?",
        "ubicacion de sanitarios",
        "tienen baños publicos?",
        "where are the restrooms located?",
        "where can i find a bathroom?"
    ])
    def test_logistica_cuatro_modulos_banos(self, pregunta):
        idioma = 'en' if 'restroom' in pregunta.lower() or 'bathroom' in pregunta.lower() else 'es'
        resp = procesar_logica_hibrida(pregunta, idioma=idioma)
        assert any(k in resp.lower() for k in ["cuatro", "four"]), f"No mencionó los 4 módulos: {resp}"
        assert any(k in resp.lower() for k in ["restaurantes", "restaurant"]), f"Falta módulo restaurantes: {resp}"
        assert any(k in resp.lower() for k in ["plaza monos", "monkey plaza"]), f"Falta módulo plaza monos: {resp}"
        assert any(k in resp.lower() for k in ["nutrias", "otter"]), f"Falta módulo nutrias: {resp}"
        assert any(k in resp.lower() for k in ["águila harpía", "aguila harpia", "harpy eagle"]), f"Falta módulo águila harpía: {resp}"

    @pytest.mark.parametrize("pregunta", [
        "puedo llevar a mi perro?",
        "se permiten mascotas en el zoologico?",
        "puedo entrar con mi gato?",
        "can i bring my dog?",
        "are pets allowed in zoomat?"
    ])
    def test_regla_mascotas_estricta(self, pregunta):
        idioma = 'en' if 'dog' in pregunta.lower() or 'pets' in pregunta.lower() else 'es'
        resp = procesar_logica_hibrida(pregunta, idioma=idioma)
        assert any(k in resp.lower() for k in ["prohibido", "prohibited"]), f"No declaró prohibidas las mascotas: {resp}"

    # --------------------------------------------------------------------------
    # 3. Rechazo estricto de Fauna Exótica (No nativa de Chiapas)
    # --------------------------------------------------------------------------
    @pytest.mark.parametrize("animal_exotico", [
        "león", "leon", "jirafa", "elefante", "canguro", "oso polar", "cebra", "pinguino",
        "lion", "giraffe", "elephant", "kangaroo", "polar bear", "zebra", "penguin"
    ])
    def test_rechazo_fauna_exotica(self, animal_exotico):
        pregunta = f"¿Tienen {animal_exotico} en el zoológico?"
        idioma = 'en' if any(c in animal_exotico for c in ["lion", "giraffe", "elephant", "kangaroo", "polar bear", "zebra", "penguin"]) else 'es'
        resp = procesar_logica_hibrida(pregunta, idioma=idioma)
        assert any(k in resp.lower() for k in ["no", "exclusivamente", "exotic", "exóticas", "exoticas", "chiapas"]), f"No rechazó fauna exótica: {resp}"

    # --------------------------------------------------------------------------
    # 4. Candado dinámico de relevancia en RAG (Evitar match falso por palabras biológicas)
    # --------------------------------------------------------------------------
    def test_candado_dinamico_cuervos_no_matchea_cotorra(self):
        contexto_cotorra = "Cotorra de cueva (Cyanolyca cucullata). Hábitat: selvas de niebla y bosques húmedos de Chiapas. Se alimenta de frutos e insectos."
        # 'cuervos' no existe en el contexto, y 'habitat' no debe ser usado como animal
        es_rel = contexto_es_relevante("habitat de los cuervos", contexto_cotorra)
        assert es_rel is False, "El candado dinámico falló: consideró relevante a los cuervos basándose en la palabra 'habitat'"

import pytest
import re
from app import procesar_logica_hibrida, preprocesar_texto_para_tts

# Expresiones regulares prohibidas en respuestas y cadenas TTS
REGEX_AMBIGUO_12H = re.compile(r'\b(?:[1-9]|1[0-2]):[0-5]\d\s*(?:a\.?\s*m\.?|p\.?\s*m\.?|de\s+la\s+mañana|de\s+la\s+tarde|de\s+la\s+noche|in\s+the\s+morning|in\s+the\s+afternoon|in\s+the\s+evening)\b', re.IGNORECASE)
REGEX_REPETICIONES = re.compile(r'\b(horas\s+horas|hours\s+hours|de\s+la\s+mañana\s+de\s+la\s+mañana|de\s+la\s+tarde\s+de\s+la\s+tarde|in\s+the\s+morning\s+in\s+the\s+morning)\b', re.IGNORECASE)
REGEX_HORA_SOLA_AMBIGUA = re.compile(r'\b(?<!\d:)(?<!\d)(?:[1-7]):00\b') # 1:00 a 7:00 sin 24h


def test_variaciones_horario_espanol():
    """Verifica al menos 7 variaciones de consultas sobre horarios en español."""
    consultas = [
        "¿A qué hora abren el zoológico?",
        "¿Cuál es el horario de taquilla y de visita?",
        "¿A qué hora cierran las puertas del parque?",
        "¿Hasta qué hora puedo entrar y cuánto dura el recorrido?",
        "¿A qué hora abren los restaurantes o locales de comida?",
        "¿Cuál es el horario de la biblioteca del ZooMAT?",
        "¿A qué hora son los recorridos nocturnos?",
        "¿Qué horario tiene la tienda de artesanías?"
    ]

    for consulta in consultas:
        respuesta = procesar_logica_hibrida(consulta, idioma="es")
        assert respuesta is not None, f"Respuesta vacía para: {consulta}"
        
        # 1. No debe contener horas en 12h con sufijos (ej. 4:00 de la tarde)
        match_ambiguo = REGEX_AMBIGUO_12H.search(respuesta)
        assert match_ambiguo is None, f"Encontrado horario 12h ambiguo '{match_ambiguo.group(0)}' en respuesta: {respuesta}"
        
        # 2. No debe contener repeticiones accidentales
        match_rep = REGEX_REPETICIONES.search(respuesta)
        assert match_rep is None, f"Encontrada repetición '{match_rep.group(0)}' en respuesta: {respuesta}"
        
        # 3. La cadena preprocesada para TTS debe ser limpia
        texto_tts = preprocesar_texto_para_tts(respuesta, idioma="es")
        assert not REGEX_AMBIGUO_12H.search(texto_tts), f"TTS contiene formato ambiguo: {texto_tts}"
        assert not REGEX_REPETICIONES.search(texto_tts), f"TTS contiene repeticiones: {texto_tts}"
        assert not REGEX_HORA_SOLA_AMBIGUA.search(texto_tts), f"TTS contiene hora vespertina sin 24h: {texto_tts}"


def test_variaciones_horario_ingles():
    """Verifica al menos 5 variaciones de consultas sobre horarios en inglés."""
    consultas = [
        "What are your opening hours?",
        "What time does the ticket booth close?",
        "Until what time is the zoo open and how long is the tour?",
        "When do night tours take place?",
        "What time do the food stands open and close?"
    ]

    for consulta in consultas:
        respuesta = procesar_logica_hibrida(consulta, idioma="en")
        assert respuesta is not None, f"Respuesta vacía para: {consulta}"
        
        # 1. No debe contener horas en 12h con sufijos
        match_ambiguo = REGEX_AMBIGUO_12H.search(respuesta)
        assert match_ambiguo is None, f"Encontrado horario 12h ambiguo '{match_ambiguo.group(0)}' en respuesta: {respuesta}"
        
        # 2. No debe contener repeticiones
        match_rep = REGEX_REPETICIONES.search(respuesta)
        assert match_rep is None, f"Encontrada repetición '{match_rep.group(0)}' en respuesta: {respuesta}"
        
        # 3. La cadena preprocesada para TTS debe ser limpia
        texto_tts = preprocesar_texto_para_tts(respuesta, idioma="en")
        assert not REGEX_AMBIGUO_12H.search(texto_tts), f"TTS en inglés contiene formato ambiguo: {texto_tts}"
        assert not REGEX_REPETICIONES.search(texto_tts), f"TTS en inglés contiene repeticiones: {texto_tts}"


def test_normalizador_tts_casos_borde():
    """Verifica que preprocesar_texto_para_tts transforme correctamente cualquier residuo a formato 24h."""
    casos = [
        # Caso 1: Rango clásico de 12 horas con sufijos
        ("El zoológico abre de 9:00 de la mañana a 4:00 de la tarde.", 
         "El zoológico abre de 09:00 a 16:00 horas.", "es"),
        
        # Caso 2: Expresión con repetición accidental del TTS
        ("Atención de 9:00 de la mañana de la mañana a 4:00 de la tarde de la tarde.",
         "Atención de 09:00 a 16:00 horas.", "es"),
        
        # Caso 3: Rango nocturno con 'y'
        ("Los recorridos nocturnos son a las 7:00 y 8:00 de la noche con reservación.",
         "Los recorridos nocturnos son a las 19:00 y 20:00 horas con reservación.", "es"),
        
        # Caso 4: Horario de comida con 'entre'
        ("El área de comida cierra entre la 1:00 y las 2:00 de la tarde.",
         "El área de comida cierra entre las 13:00 y las 14:00 horas.", "es"),
        
        # Caso 5: Cierre aislado del parque
        ("La salida máxima del parque es a las 6:00 de la tarde.",
         "La salida máxima del parque es a las 18:00 horas.", "es"),
        
        # Caso 6: Taquilla cierra a las 4:00
        ("La taquilla cierra estrictamente a las 4:00.",
         "La taquilla cierra estrictamente a las 16:00 horas.", "es"),
         
        # Caso 7: Rango simple sin sufijos
        ("El horario general es de 9:00 a 4:00 de martes a domingo.",
         "El horario general es de 09:00 a 16:00 horas de martes a domingo.", "es"),
         
        # Caso 8: Inglés con sufijos
        ("The zoo is open from 9:00 am to 4:00 pm Tuesday to Sunday.",
         "The zoo is open from 09:00 to 16:00 hours Tuesday to Sunday.", "en"),
         
        # Caso 9: Inglés con repeticiones accidentales
        ("Night tours are held at 7:00 pm and 8:00 pm in the evening.",
         "Night tours are held at 19:00 and 20:00 hours.", "en"),
         
        # Caso 10: Eliminación de 'horas horas' duplicado
        ("El horario es a las 16:00 horas horas.",
         "El horario es a las 16:00 horas.", "es")
    ]

    for entrada, salida_esperada, idioma in casos:
        resultado = preprocesar_texto_para_tts(entrada, idioma=idioma)
        assert resultado == salida_esperada, f"\nEntrada:  {entrada}\nEsperado: {salida_esperada}\nObtenido: {resultado}"

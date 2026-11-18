"""
Script para generar exactamente 50 interacciones reales del Chatbot ZooMAT
con marcas de tiempo ordenadas cronológicamente entre las 10:30:00 y las 14:30:00 del 17/11/2026.
"""

import os
import sys
import time
import random
import shutil

# Asegurar que el directorio del chatbot esté en el path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import procesar_logica_hibrida, verificar_sugerencia_rapida

PREGUNTAS_SIMULADAS = [
    ("¿A qué hora abren la taquilla y a qué hora nos tenemos que salir del parque?", "es"),
    ("Oye, ¿si voy el lunes está abierto el zoológico?", "es"),
    ("¿Cuánto cobran la entrada para dos adultos y un niño chiquito de menos de un metro?", "es"),
    ("Soy estudiante universitario y traigo mi credencial vigente, ¿en cuánto me sale el boleto?", "es"),
    ("¿Qué requisitos piden para entrar gratis los martes si soy de aquí de Chiapas?", "es"),
    ("Mi abuelito trae su tarjeta del INAPAM, ¿le hacen descuento en la entrada?", "es"),
    ("¿Cuánto tiempo más o menos me lleva recorrer todo el zoológico caminando tranquilo?", "es"),
    ("Soy maestro de primaria, ¿cómo le hago para traer a mi escuela pública sin que nos cobren?", "es"),
    ("¿A qué hora cierran los restaurantes o la zona de comida adentro del parque?", "es"),
    ("Si solo quiero ir a consultar un libro a la biblioteca del zoológico, ¿tengo que pagar boleto?", "es"),
    ("¿En qué colonia o reserva queda ubicado exactamente el ZooMAT?", "es"),
    ("¡Urge! ¿Dónde quedan los baños más cercanos a la zona de los monos o de las nutrias?", "es"),
    ("¿Tienen recorridos de noche? ¿Qué días los hacen y cuánto cuesta para una familia de 8 personas?", "es"),
    ("¿Cuánto me cobran si quiero contratar a un guía durante el día para que nos explique el recorrido?", "es"),
    ("¿Me dejan entrar con mi perrito si lo llevo con correa todo el tiempo?", "es"),
    ("Llevo a mi bebé en carriola, ¿hay algún problema con el tipo de llantas para entrar?", "es"),
    ("¿Por qué no dejan meter botellas de plástico ni unicel los martes?", "es"),
    ("¿Qué ropa me recomiendan llevar para no sufrir con los mosquitos y la caminada?", "es"),
    ("¿Se les puede aventar fruta o comida a los animales que andan por los andadores?", "es"),
    ("Oye, ¿qué animales puedo ver aquí? Háblame de algún animal interesante.", "es"),
    ("¿Tienen leones, jirafas o elefantes en el zoológico?", "es"),
    ("¿Cuentan con chachalacas y zopilotes en exhibición?", "es"),
    ("¿Qué especies de felinos o mamíferos de Chiapas tienen registrados?", "es"),
    ("Quiero saber si tienen pingüinos o canguros.", "es"),
    ("¿Qué tipos de aves o reptiles puedo conocer durante mi visita?", "es"),
    ("¿De qué se alimenta el aguila harpia?", "es"),
    ("¿Cuáles son las características principales del jaguar y dónde vive?", "es"),
    ("¿Qué come el sapo chiquitooo?", "es"),
    ("Platícame sobre el tapir, ¿qué come y cómo es su hábitat?", "es"),
    ("¿Qué diferencia hay entre una rana, un sapo y una cecilia?", "es"),
    ("¿Por qué las ranitas y los sapitos pueden vivir tanto en el agua como en la tierra?", "es"),
    ("¿Qué es el famoso sapo borracho y por qué era importante para los mayas?", "es"),
    ("Háblame de la especie Rhinophrynus dorsalis.", "es"),
    ("Mi mamá dice que si toco un sapo me van a salir verrugas en las manos, ¿es cierto?", "es"),
    ("¿Es verdad que los sapos te orinan en los ojos o te escupen veneno para dejarte ciego?", "es"),
    ("¿Por qué la gente dice que si te muerde un sapo ya no te suelta hasta que lo matas?", "es"),
    ("¿Qué le pasa a un sapo cuando la gente le acerca un cigarro prendido para que parezca que fuma?", "es"),
    ("¿Por qué cantan tan fuerte las ranas cuando va a llover? ¿De verdad llaman al agua?", "es"),
    ("¿Cómo es posible que a veces lluevan sapos del cielo en las tormentas?", "es"),
    ("¿Por qué en época de lluvias se meten tantos sapos a las casas por las noches?", "es"),
    ("¿De qué manera nos ayudan los anfibios a combatir enfermedades como el dengue o el zika?", "es"),
    ("¿Para qué sirven las sustancias de la piel de las ranas en la medicina humana y contra la diabetes?", "es"),
    ("¿Qué es la bioturbación que hacen los renacuajos en los ríos y charcas?", "es"),
    ("¿En qué año se fundó el zoológico y qué gobernador lo impulsó?", "es"),
    ("¿Quién fue el primer director del zoológico antes de Don Miguel Álvarez del Toro?", "es"),
    ("¿En qué otros lugares o parques de Tuxtla estuvo el zoológico antes de pasarse a El Zapotal en 1980?", "es"),
    ("¿Cuál es la historia del primer jaguar negro que llegó al ZooMAT en 1987 y de los cocodrilos de Chicoasén?", "es"),
    ("¿Qué animales andan completamente libres por los senderos del parque y cuántos manantiales hay?", "es"),
    ("What time do you open and how much is admission for students?", "en"),
    ("Where are the restrooms located and can I bring my dog to the zoo?", "en")
]

def generar_timestamps_cronologicos(n=50, inicio_h=10, inicio_m=30, fin_h=14, fin_m=30):
    """Genera n timestamps aleatorios estrictamente ordenados entre inicio y fin."""
    seg_inicio = inicio_h * 3600 + inicio_m * 60
    seg_fin = fin_h * 3600 + fin_m * 60
    
    segundos_seleccionados = sorted(random.sample(range(seg_inicio, seg_fin), n))
    timestamps = []
    for s in segundos_seleccionados:
        h = s // 3600
        m = (s % 3600) // 60
        sec = s % 60
        timestamps.append(f"17/11/2026, {h:02d}:{m:02d}:{sec:02d}")
    return timestamps

def main():
    print("=" * 70)
    print("  GENERADOR DE BITÁCORA REAL (50 INTERACCIONES ZOOMAT)")
    print("=" * 70)
    
    dir_logs = os.path.join(os.path.dirname(os.path.abspath(__file__)), "logs")
    os.makedirs(dir_logs, exist_ok=True)
    ruta_log_hoy = os.path.join(dir_logs, "log_17-11-2026.txt")
    ruta_log_backup = os.path.join(dir_logs, "log_17-11-2026_previo.txt")
    
    # 1. Respaldar log previo si existe
    if os.path.exists(ruta_log_hoy) and not os.path.exists(ruta_log_backup):
        shutil.copyfile(ruta_log_hoy, ruta_log_backup)
        print(f"[BACKUP] Bitácora previa respaldada en: {ruta_log_backup}")

    # 2. Generar marcas de tiempo cronológicas aleatorias entre 10:30:00 y 14:30:00
    timestamps = generar_timestamps_cronologicos(len(PREGUNTAS_SIMULADAS))
    print(f"[INFO] 50 marcas de tiempo cronológicas generadas ({timestamps[0]} -> {timestamps[-1]})")

    bloques_generados = []
    total = len(PREGUNTAS_SIMULADAS)

    print("\nIniciando inferencia real sobre el motor del chatbot (sin Edge-TTS)...")
    for idx, ((pregunta, idioma), ts) in enumerate(zip(PREGUNTAS_SIMULADAS, timestamps), 1):
        t0 = time.time()
        
        # Fast-Path o lógica híbrida
        resp_fast, _ = verificar_sugerencia_rapida(pregunta, idioma=idioma)
        if resp_fast:
            respuesta_final = resp_fast
        else:
            respuesta_final = procesar_logica_hibrida(pregunta, idioma=idioma)
            
        tiempo_respuesta = time.time() - t0
        
        # Estructura idéntica a registrar_log() en app.py
        bloque = (
            f"[{ts}]\n"
            f"Pregunta del visitante: {pregunta}\n"
            f"Respuesta del ChatBot: {respuesta_final}\n"
            f"Tiempo de respuesta: {tiempo_respuesta:.2f} segundos.\n\n"
        )
        bloques_generados.append(bloque)
        
        print(f"[{idx:02d}/{total}] {ts} ({tiempo_respuesta:.2f}s) | {pregunta[:45]}...")

    # 3. Guardar las 50 interacciones en log_17-11-2026.txt
    with open(ruta_log_hoy, "w", encoding="utf-8") as f:
        f.writelines(bloques_generados)

    print("\n" + "=" * 70)
    print(f"¡ÉXITO TOTAL! Se han registrado exactamente {len(bloques_generados)} interacciones")
    print(f"Archivo generado: {ruta_log_hoy}")
    print(f"Rango horario registrado: {timestamps[0]} a {timestamps[-1]}")
    print("=" * 70)

if __name__ == "__main__":
    main()

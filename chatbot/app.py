from flask import Flask, request, jsonify, render_template
import os
import sys
import time
import random
from datetime import datetime
import requests
import speech_recognition as sr
from pydub import AudioSegment
import re
import unicodedata
import edge_tts
import asyncio
from gtts import gTTS

# Importamos tus motores lógicos exactos
import motor_rag
import motor_mysql           
import enrutador_semantico   

# Configuramos Flask y le decimos que la carpeta 'assets' será accesible públicamente
app = Flask(__name__, static_folder='assets', static_url_path='/assets')

DIR_LOGS = "logs"
os.makedirs("assets", exist_ok=True)
os.makedirs("uploads", exist_ok=True)
os.makedirs(DIR_LOGS, exist_ok=True)

# --- Funciones Auxiliares ---
def registrar_log(pregunta, respuesta, tiempo_segundos=None, idioma='es', **kwargs):
    """Registra la consulta del visitante, la respuesta del bot y el tiempo de respuesta en un archivo diario con formato específico."""
    try:
        ahora = datetime.now()
        nombre_archivo = ahora.strftime("log_%d-%m-%Y.txt")
        ruta_archivo = os.path.join(DIR_LOGS, nombre_archivo)
        
        timestamp = ahora.strftime("%d/%m/%Y, %H:%M:%S")
        if tiempo_segundos is not None:
            bloque_log = (
                f"[{timestamp}]\n"
                f"Pregunta del visitante: {pregunta}\n"
                f"Respuesta del ChatBot: {respuesta}\n"
                f"Tiempo de respuesta: {tiempo_segundos:.2f} segundos.\n\n"
            )
        else:
            bloque_log = (
                f"[{timestamp}]\n"
                f"Pregunta del visitante: {pregunta}\n"
                f"Respuesta del ChatBot: {respuesta}\n\n"
            )
        
        with open(ruta_archivo, "a", encoding="utf-8") as f:
            f.write(bloque_log)
    except Exception as e:
        print(f"Error al escribir log de conversación: {e}")

def quitar_acentos(texto):
    """Elimina tildes para comparar palabras sin importar cómo las escriba el usuario (ej. Cangúro -> canguro)."""
    return ''.join(c for c in unicodedata.normalize('NFD', texto.lower()) if unicodedata.category(c) != 'Mn')

def obtener_especies_registradas(filtro=None):
    """Obtiene dinámicamente especies válidas registradas en ChromaDB descartando metadatos espurios y categorías genéricas."""
    especies_genericas = {
        "anfibios", "rana", "sapo", "cecilia", "reptiles", "aves", "mamiferos", "felinos", "serpientes",
        "mitos y realidades de los anfibios", "diferencias y adaptaciones de anfibios",
        "importancia ecologica y medicina anfibios"
    }
    terminos_excluidos = [
        '.pdf', 'traduccion', 'herpetario', 'fichas',
        'mitos y realidades', 'diferencias y adaptaciones', 'importancia ecologica', 'ecologia y medicina'
    ]
    especies_validas = [
        nombre for norm, nombre in motor_rag.ESPECIES_CONOCIDAS.items()
        if not any(excl in norm for excl in terminos_excluidos)
        and norm not in especies_genericas
    ]
    if not filtro:
        return especies_validas
        
    filtro_norm = quitar_acentos(filtro.lower()).strip()
    
    # 1. Búsqueda taxonómica directa en ChromaDB por Clase o Familia biológica
    for clase_k, lista_esp in motor_rag.CLASES_CONOCIDAS.items():
        if filtro_norm == clase_k or (clase_k.endswith("s") and filtro_norm == clase_k[:-1]) or filtro_norm in clase_k:
            res = [e for e in lista_esp if e in especies_validas]
            if res:
                return res

    for fam_k, lista_esp in motor_rag.FAMILIAS_CONOCIDAS.items():
        if filtro_norm == fam_k or (fam_k.endswith("s") and filtro_norm == fam_k[:-1]) or filtro_norm in fam_k:
            res = [e for e in lista_esp if e in especies_validas]
            if res:
                return res

    # 2. Búsqueda por coincidencias léxicas y sinonimias comunes
    terminos_busqueda = [filtro_norm]
    if "rana" in filtro_norm:
        terminos_busqueda.extend(["rana", "ranita"])
    elif "sapo" in filtro_norm:
        terminos_busqueda.extend(["sapo", "sapito"])
    elif "cecilia" in filtro_norm:
        terminos_busqueda.append("cecilia")
    elif "anfibio" in filtro_norm:
        terminos_busqueda.extend(["rana", "ranita", "sapo", "sapito", "cecilia", "tlaconete", "salamandra"])
    elif "ave" in filtro_norm or "pajaro" in filtro_norm:
        terminos_busqueda.extend(["ave", "pajaro", "aguila", "quetzal", "tucan", "loro", "chachalaca", "guacamaya", "halcon", "colibri", "hocofaisan", "pavon"])
    elif "felino" in filtro_norm:
        terminos_busqueda.extend(["jaguar", "ocelote", "tigrillo", "puma", "leopardo", "yaguarundi", "gato montes"])
    elif "reptil" in filtro_norm:
        terminos_busqueda.extend(["cocodrilo", "caiman", "tortuga", "iguana", "serpiente", "nauyaca", "vibora", "lagarto", "gecko", "dragoncillo", "coralillo", "bejuquilla"])
    elif "mamifero" in filtro_norm:
        terminos_busqueda.extend(["jaguar", "ocelote", "tigrillo", "puma", "mono", "saraguato", "tapir", "venado", "jabali", "pecari", "nutria", "mapache", "tejon", "coati", "murcielago", "tlacuache", "yaguarundi", "zorrillo", "armadillo"])
    elif "mono" in filtro_norm:
        terminos_busqueda.extend(["mono", "saraguato", "arana"])
    elif "serpiente" in filtro_norm or "vibora" in filtro_norm:
        terminos_busqueda.extend(["serpiente", "vibora", "nauyaca", "coralillo", "bejuquilla", "boa", "masacuata"])
    elif "tortuga" in filtro_norm:
        terminos_busqueda.extend(["tortuga", "pochitoque", "casquito"])
    elif "cocodrilo" in filtro_norm or "caiman" in filtro_norm:
        terminos_busqueda.extend(["cocodrilo", "caiman"])
        
    coincidencias = [
        nombre for nombre in especies_validas
        if any(term in quitar_acentos(nombre.lower()) for term in terminos_busqueda)
    ]
    return coincidencias

# --- DICCIONARIO OFICIAL DE LOGÍSTICA EN INGLÉS ---
DATOS_LOGISTICA_EN = {
    ('horario', 'general'): "ZooMAT visiting hours are Tuesday through Sunday from 09:00 to 16:00 hours. The ticket booth opens at 09:00 hours and closes strictly at 16:00 hours. The zoo remains closed to the public on Mondays for general maintenance.",
    ('horario', 'cierre'): "The ZooMAT ticket office closes strictly at 16:00 hours, ending entrance for the day. Visitors already inside may continue their tour until the maximum park exit time of 18:00 hours.",
    ('horario', 'recorrido'): "The complete walking tour of ZooMAT takes approximately two to three hours at an average pace along an educational trail of 2.5 kilometers. We recommend arriving well before ticket closing at 16:00 hours.",
    ('horario', 'biblioteca'): "The ZooMAT scientific library is open to the public from Tuesday to Friday during daytime hours from 09:00 to 15:00 hours.",
    ('horario', 'tienda'): "The ZooMAT gift and souvenir shop is open from 09:00 to 16:00 hours from Tuesday to Sunday.",
    ('horario', 'comida'): "Food kiosks and restaurants open at 09:00 hours. Closing time depends on visitor attendance, generally closing between 13:00 and 14:00 hours in low season, and between 16:00 and 17:00 hours in high season.",

    ('boleto', 'general'): "General admission to ZooMAT is 35 pesos per person. Presenting a valid student, teacher, INAPAM, or INSEN credential reduces the fee to 25 pesos. Children under one meter tall enter for free, and on Tuesdays admission is free for Chiapas residents with a valid INE credential.",
    ('boleto', 'adulto'): "The general admission ticket for adults is 35 pesos.",
    ('boleto', 'estudiante'): "Students presenting a valid school or university credential pay a discounted admission fee of 25 pesos.",
    ('boleto', 'profesor'): "Teachers and educators with a valid academic credential pay a discounted admission fee of 25 pesos.",
    ('boleto', 'inapam'): "Senior citizens presenting an official INAPAM or INSEN credential pay a discounted admission fee of 25 pesos.",
    ('boleto', 'niño'): "Children under one meter in height enter ZooMAT completely free of charge. Children taller than one meter pay an admission fee of 25 pesos.",
    ('boleto', 'martes'): "On Tuesdays, the 'Martes del Pueblo' is observed and admission is completely free exclusively for Chiapas residents presenting an official INE credential issued in Chiapas. Minors aged 12 to 17 may present a valid school ID.",
    ('boleto', 'credencial_desconocida'): "Official discounts at the ticket office are 25 pesos for valid student, teacher, or senior INAPAM or INSEN credentials. For any other agreement, please inquire directly at the ticket office.",
    ('boleto', 'escuelas'): "Public schools can receive free access by submitting an advance official request letter detailing student and teacher counts. Private schools do not receive fee waivers, but their students and teachers pay the 25 pesos discounted rate with valid ID.",
    ('boleto', 'biblioteca'): "Access to the scientific library is completely free and you can visit it without purchasing a zoo ticket. Simply register at the security booth at the entrance with your personal details and an ID.",

    ('servicio', 'guiado_diurno'): "ZooMAT offers daytime guided tours requested directly at the ticket booth. The service has an additional cost of 20 pesos per person on top of general admission.",
    ('servicio', 'recorrido_nocturno'): "Night tours take place Tuesday through Saturday at 19:00 and 20:00 hours and require advance reservation. The base cost is 1,200 pesos for groups of 1 to 12 people, with an additional 100 pesos per person up to a maximum of 15 people.",
    ('servicio', 'biblioteca'): "The ZooMAT specialized library provides educational and research reference materials on regional biodiversity, open free of charge from Tuesday to Friday from 09:00 to 15:00 hours.",
    ('servicio', 'tienda'): "The souvenir shop offers handicrafts, regional t-shirts, postcards, and gifts, located on the main plaza and open from 09:00 to 16:00 hours from Tuesday to Sunday.",
    ('servicio', 'curadores'): "Meetings with curators, biologists, or researchers for academic projects must be requested in advance through the Environmental Education and Diffusion Office.",
    ('servicio', 'aforo'): "ZooMAT does not currently have a visitor capacity limit; the park is fully open without quota restrictions.",

    ('regla', 'mascotas'): "Pets of any kind are strictly prohibited inside ZooMAT to protect the health, biosecurity, and tranquility of our native wildlife.",
    ('regla', 'alcohol'): "Alcoholic beverages, beer, smoking, and weapons are strictly prohibited inside the entire zoo facility.",
    ('regla', 'plasticos'): "Single-use plastics, plastic bags, and styrofoam containers are prohibited within park premises.",
    ('regla', 'carriolas'): "Strollers with hard plastic wheels are prohibited due to the noise they generate on forest trails, which stresses the animals. Strollers with soft rubber wheels are allowed.",
    ('regla', 'vestimenta'): "Comfortable walking shoes with non-slip soles, fresh clothing, and insect repellent are recommended due to the humid climate of the El Zapotal forest.",
    ('regla', 'tocar_animales'): "Touching or attempting to handle any animals is strictly prohibited for visitor safety and animal welfare.",
    ('regla', 'alimentar_animales'): "Feeding any animals in the zoo is strictly prohibited, as each species receives a specialized veterinary diet.",
    ('regla', 'andadores'): "Visitors must strictly remain on marked trails and paved paths at all times. Stepping off the official trail is not permitted.",
    ('regla', 'daños'): "Damaging zoo facilities or disturbing wildlife will result in administrative sanctions and removal from the park.",

    ('ubicacion', 'general'): "ZooMAT is located south of Tuxtla Gutierrez in the El Zapotal ecological reserve on Cerro Hueco.",
    ('ubicacion', 'baños'): "ZooMAT has four restroom areas: the first is in the restaurant area before starting the tour, the second in Monkey Plaza behind the Casa Blanca taco restaurant, the third on the right side of the river otter habitat, and the fourth on the left side of the harpy eagle habitat.",
    ('ubicacion', 'transporte'): "Public transportation route 30 arrives directly at the ZooMAT entrance from downtown Tuxtla Gutierrez."
}

SUGERENCIAS_RAPIDAS_EN = {
    "costos": {
        "texto": "General admission is 35 pesos. With a valid student, teacher, INAPAM, or INSEN ID, admission is 25 pesos. Children under one meter tall enter for free, and on Tuesdays admission is free for Chiapas residents with a valid INE credential.",
        "audio": "costos_en.mp3",
        "claves": [
            "what are the entrance fees",
            "entrance fees",
            "costs",
            "cost",
            "how much is the entrance",
            "ticket prices",
            "ticket price",
            "admission fees",
            "admission fee",
            "prices",
            "tickets",
            "admission cost"
        ]
    },
    "horarios": {
        "texto": "ZooMAT is open from Tuesday to Sunday from 09:00 to 16:00 hours, when the ticket booth closes. Maximum park exit time is 18:00 hours, and on Mondays the park remains closed for general maintenance.",
        "audio": "horarios_en.mp3",
        "claves": [
            "what are the zoo hours",
            "zoo hours",
            "schedule",
            "hours",
            "what time do you open",
            "opening hours",
            "opening times",
            "zoo schedule"
        ]
    },
    "banos": {
        "texto": "ZooMAT has four restroom areas: the first is in the restaurant area before starting the tour, the second in Monkey Plaza behind the Casa Blanca taco restaurant, the third on the right side of the river otter habitat, and the fourth on the left side of the harpy eagle habitat.",
        "audio": "banos_en.mp3",
        "claves": [
            "where are the restrooms located",
            "where are the restrooms",
            "restrooms",
            "bathrooms",
            "where are the bathrooms",
            "toilets",
            "where are the toilets",
            "wc"
        ]
    }
}

ANIMALES_INGLES_A_ESP = {
    "jaguar": "jaguar", "jaguars": "jaguar",
    "ocelot": "ocelote", "ocelots": "ocelote",
    "tapir": "tapir", "tapires": "tapir",
    "quetzal": "quetzal", "quetzales": "quetzal",
    "macaw": "guacamaya", "macaws": "guacamaya", "scarlet macaw": "guacamaya",
    "spider monkey": "mono arana", "spider monkeys": "mono arana",
    "howler monkey": "mono saraguato", "howler monkeys": "mono saraguato",
    "monkey": "mono", "monkeys": "monos",
    "otter": "nutria", "otters": "nutria", "river otter": "nutria",
    "harpy eagle": "aguila harpia", "eagle": "aguila", "eagles": "aguila",
    "crocodile": "cocodrilo", "crocodiles": "cocodrilo",
    "alligator": "caiman", "alligators": "caiman", "caiman": "caiman",
    "deer": "venado", "white-tailed deer": "venado",
    "peccary": "pecari", "peccaries": "pecari",
    "toad": "sapo", "toads": "sapo",
    "frog": "rana", "frogs": "rana", "tree frog": "rana", "tree frogs": "rana",
    "amphibian": "anfibio", "amphibians": "anfibios",
    "salamander": "salamandra", "salamanders": "salamandras",
    "tadpole": "renacuajo", "tadpoles": "renacuajos",
    "caecilian": "cecilia", "caecilians": "cecilia",
    "snake": "serpiente", "snakes": "serpiente",
    "turtle": "tortuga", "turtles": "tortuga",
    "chachalaca": "chachalaca", "chachalacas": "chachalaca",
    "vulture": "zopilote", "vultures": "zopilote", "king vulture": "zopilote rey",
    "anteater": "oso hormiguero", "anteaters": "oso hormiguero",
    "armadillo": "armadillo", "armadillos": "armadillo",
    "toucan": "tucan", "toucans": "tucan"
}

ANIMALES_EXOTICOS_EN = sorted([
    "lion", "lions", "elephant", "elephants", "giraffe", "giraffes",
    "rhino", "rhinos", "rhinoceros", "hippo", "hippos", "hippopotamus", "zebra", "zebras",
    "kangaroo", "kangaroos", "polar bear", "polar bears", "panda", "pandas",
    "brown bear", "brown bears", "penguin", "penguins", "tiger", "tigers",
    "wolf", "wolves", "sea lion", "sea lions", "gorilla", "gorillas",
    "chimpanzee", "chimpanzees", "camel", "camels", "dromedary", "dromedaries",
    "whale", "whales", "dolphin", "dolphins", "koala", "koalas",
    "ostrich", "ostriches", "cheetah", "cheetahs", "hyena", "hyenas",
    "seal", "seals", "walrus", "walruses"
], key=len, reverse=True)

def contexto_es_relevante(pregunta, contexto):
    """Verifica dinámicamente que el animal o tema institucional buscado exista dentro del texto de ChromaDB."""
    pregunta_norm = re.sub(r'[^\w\s]', '', quitar_acentos(pregunta))
    contexto_norm = quitar_acentos(contexto)

    # Verificación de relevancia para documentos históricos o institucionales
    if motor_rag.es_consulta_historia(pregunta):
        terminos_historia_doc = [
            "historia", "fundacion", "fundado", "fundador", "1942", "1980", "alvarez del toro", "zapotal", "ninfa",
            "eliseo palacios", "pascacio gamboa", "cesar dominguez", "becky", "eve", "madero", "centenario",
            "manantiales", "nacimientos", "cerro hueco", "perfume", "desodorante", "uniforme", "domesticacion",
            "jaguar negro", "rey zopilote", "chicoasen", "sumidero", "quetzal", "harpia", "reservas", "triunfo",
            "gobierno del estado", "libertad", "saraguatos"
        ]
        if any(td in contexto_norm for td in terminos_historia_doc):
            return True

    # Verificación de relevancia para documentos temáticos sobre anfibios (mitos, medicina, ecología, diferencias)
    if enrutador_semantico.es_consulta_tematica_anfibios(pregunta):
        terminos_tematicos_doc = [
            "anfibio", "anfibios", "rana", "ranas", "sapo", "sapos", "salamandra", "cecilia",
            "verruga", "verrugas", "vph", "orina", "ceguera", "toxina", "mordida", "cigarrillo", "lluvia",
            "bioturbacion", "bioindicador", "medicina", "caeruleina", "pseudin", "dengue", "malaria",
            "zika", "aposematismo", "dendrobatidae", "reubicar", "proteger", "branquias", "pulmones"
        ]
        if any(tt in contexto_norm for tt in terminos_tematicos_doc):
            return True

    # Palabras de enlace, preposiciones y verbos comunes ignorados para aislar sustantivos reales
    palabras_vacias = {
        "dame", "informacion", "del", "de", "la", "el", "los", "las", "tienen", "tiene",
        "hay", "que", "como", "cual", "cuales", "es", "son", "un", "una", "unos",
        "unas", "sobre", "quiero", "saber", "me", "puedes", "decir", "en",
        "con", "sin", "por", "para", "sus", "nos", "voy", "van", "mas", "vez",
        "eso", "esa", "ese", "ahi", "aqui", "alla", "hace", "hacen", "hacer",
        "pasa", "puede", "pueden", "puedo", "menos", "todo", "todos", "toda",
        "esta", "estos", "estas", "pero", "algo", "alguien", "casi", "solo",
        "sola", "cada", "entre", "desde", "hasta", "hacia", "antes", "despues",
        "ahora", "luego", "siempre", "nunca", "tambien", "tampoco",
        "prepa", "rebaja", "credencial", "carreola", "rueditas", "sandalias", "tenis",
        "zoomat", "zoologico", "animal", "animales", "especie", "especies",
        "hablame", "cuentame", "existe", "existen", "donde", "estan",
        "come", "comen", "vive", "viven", "habita", "habitan", "alimenta",
        "alimentan", "mide", "miden", "pesa", "pesan", "caracteristicas",
        "habitat", "habitad", "dieta", "comida", "alimento", "alimentos", "alimentacion",
        "presas", "tamano", "peso", "color", "coloracion", "reproduccion", "cria", "crias",
        "huevo", "huevos", "anos", "edad", "longevidad", "tiempo", "distribucion",
        "respiracion", "veneno", "venenoso", "venenosa", "toxico", "toxica",
        "caza", "cazan", "vuela", "vuelan", "nada", "nadan", "trepa", "trepan",
        "sale", "salen", "sales", "gana", "ganan", "gano", "celebra", "celebran",
        "mexico", "ecuador", "mundial", "futbol", "chiapas", "zapotal",
        "cuanto", "cuantos", "cuanta", "cuantas", "cuando", "quien", "quienes",
        "diet", "habitat", "food", "size", "weight", "years", "old", "live", "lives", "eat", "eats"
    }

    palabras_clave = [p for p in pregunta_norm.split() if p not in palabras_vacias and len(p) > 2]

    # Si no quedaron palabras clave específicas, no hay sustantivo animal identificable
    if not palabras_clave:
        return False

    # Buscamos que el animal exista como palabra completa (\b evita falsos substrings)
    for palabra in palabras_clave:
        palabra_esp = ANIMALES_INGLES_A_ESP.get(palabra, palabra)
        for forma in motor_rag.obtener_formas_base(palabra_esp):
            raiz = forma[:-2] if forma.endswith("es") and len(forma) > 4 else forma.rstrip("s")
            patron_palabra_exacta = rf'\b{re.escape(raiz)}(s|es|a|as)?\b'
            if re.search(patron_palabra_exacta, contexto_norm):
                return True

    return False

def transcribir_audio_subido(ruta_archivo, idioma='es'):
    try:
        audio_convertido = AudioSegment.from_file(ruta_archivo)
        ruta_wav = "uploads/temp.wav"
        audio_convertido.export(ruta_wav, format="wav")
        
        recognizer = sr.Recognizer()
        with sr.AudioFile(ruta_wav) as source:
            audio = recognizer.record(source)
        lang_stt = "en-US" if idioma == 'en' else "es-MX"
        return recognizer.recognize_google(audio, language=lang_stt).lower()
    except Exception as e:
        print(f"Error procesando audio: {e}")
        return ""

def preprocesar_texto_para_tts(texto, idioma='es'):
    """
    Normaliza horarios al formato estricto de 24 horas y elimina redundancias
    y expresiones como 'de la mañana/tarde/noche', 'a.m./p.m.' para evitar
    interpretaciones erróneas y repeticiones en Edge-TTS y gTTS.
    """
    if not texto:
        return ""
    
    t = texto

    def parse_hm(h_str):
        if ':' in h_str:
            parts = h_str.split(':')
            return int(parts[0]), parts[1]
        return int(h_str), "00"

    lbl = "hours" if idioma == 'en' else "horas"

    # 1. Deduplicación de expresiones repetidas antes del procesamiento
    t = re.sub(r'(?i)\bde\s+la\s+mañana(\s+de\s+la\s+mañana)+\b', 'de la mañana', t)
    t = re.sub(r'(?i)\bde\s+la\s+tarde(\s+de\s+la\s+tarde)+\b', 'de la tarde', t)
    t = re.sub(r'(?i)\bde\s+la\s+noche(\s+de\s+la\s+noche)+\b', 'de la noche', t)
    t = re.sub(r'(?i)\b(a\.?\s*m\.?)(\s+a\.?\s*m\.?)+\b', 'a.m.', t)
    t = re.sub(r'(?i)\b(p\.?\s*m\.?)(\s+p\.?\s*m\.?)+\b', 'p.m.', t)
    t = re.sub(r'(?i)\bin\s+the\s+morning(\s+in\s+the\s+morning)+\b', 'in the morning', t)
    t = re.sub(r'(?i)\bin\s+the\s+afternoon(\s+in\s+the\s+afternoon)+\b', 'in the afternoon', t)
    t = re.sub(r'(?i)\bin\s+the\s+evening(\s+in\s+the\s+evening)+\b', 'in the evening', t)

    # 2. Rangos completos de mañana a tarde con sufijos (ej: "9:00 de la mañana a 4:00 de la tarde", "9:00 am to 4:00 pm")
    patron_rango_ampm_es = r'(?i)\b(\d{1,2}(?::\d{2})?)\s*(?:hrs?\.?|horas?)?\s*(?:de\s+la\s+mañana|a\.?\s*m\.?)\s*(?:a|hasta)\s*(\d{1,2}(?::\d{2})?)\s*(?:hrs?\.?|horas?)?\s*(?:de\s+la\s+tarde|p\.?\s*m\.?)\b'
    def repl_rango_ampm_es(m):
        h1, m1 = parse_hm(m.group(1))
        h2, m2 = parse_hm(m.group(2))
        if h1 == 12: h1 = 0
        if h2 < 12: h2 += 12
        return f"{h1:02d}:{m1} a {h2:02d}:{m2} horas"
    t = re.sub(patron_rango_ampm_es, repl_rango_ampm_es, t)

    patron_rango_ampm_en = r'(?i)\b(\d{1,2}(?::\d{2})?)\s*(?:hours?)?\s*(?:in\s+the\s+morning|a\.?\s*m\.?|am)\s*(?:to)\s*(\d{1,2}(?::\d{2})?)\s*(?:hours?)?\s*(?:in\s+the\s+afternoon|p\.?\s*m\.?|pm)\b'
    def repl_rango_ampm_en(m):
        h1, m1 = parse_hm(m.group(1))
        h2, m2 = parse_hm(m.group(2))
        if h1 == 12: h1 = 0
        if h2 < 12: h2 += 12
        return f"{h1:02d}:{m1} to {h2:02d}:{m2} hours"
    t = re.sub(patron_rango_ampm_en, repl_rango_ampm_en, t)

    # 3. Dos horas nocturnas o vespertinas unidas por 'y' / 'and' (ej: "7:00 y 8:00 de la noche", "7:00 pm and 8:00 pm")
    patron_par_noche_es = r'(?i)\b(\d{1,2}(?::\d{2})?)\s*y\s*(\d{1,2}(?::\d{2})?)\s*(?:hrs?\.?|horas?)?\s*(?:de\s+la\s+noche|de\s+la\s+tarde|p\.?\s*m\.?)\b'
    def repl_par_noche_es(m):
        h1, m1 = parse_hm(m.group(1))
        h2, m2 = parse_hm(m.group(2))
        if h1 < 12: h1 += 12
        if h2 < 12: h2 += 12
        return f"{h1:02d}:{m1} y {h2:02d}:{m2} horas"
    t = re.sub(patron_par_noche_es, repl_par_noche_es, t)

    patron_par_noche_en = r'(?i)\b(\d{1,2}(?::\d{2})?)\s*(?:pm|p\.?\s*m\.?)?\s*and\s*(\d{1,2}(?::\d{2})?)\s*(?:hours?)?\s*(?:in\s+the\s+evening|at\s+night|in\s+the\s+afternoon|p\.?\s*m\.?|pm)\b'
    def repl_par_noche_en(m):
        h1, m1 = parse_hm(m.group(1))
        h2, m2 = parse_hm(m.group(2))
        if h1 < 12: h1 += 12
        if h2 < 12: h2 += 12
        return f"{h1:02d}:{m1} and {h2:02d}:{m2} hours"
    t = re.sub(patron_par_noche_en, repl_par_noche_en, t)

    # 4. Dos horas vespertinas con 'entre' (ej: "entre la 1:00 y las 2:00 de la tarde", "between 1:00 pm and 2:00 pm")
    patron_entre_tarde_es = r'(?i)\bentre\s+(?:la|las)?\s*(\d{1,2}(?::\d{2})?)\s*y\s+(?:la|las)?\s*(\d{1,2}(?::\d{2})?)\s*(?:hrs?\.?|horas?)?\s*(?:de\s+la\s+tarde|p\.?\s*m\.?)\b'
    def repl_entre_tarde_es(m):
        h1, m1 = parse_hm(m.group(1))
        h2, m2 = parse_hm(m.group(2))
        if h1 < 12: h1 += 12
        if h2 < 12: h2 += 12
        return f"entre las {h1:02d}:{m1} y las {h2:02d}:{m2} horas"
    t = re.sub(patron_entre_tarde_es, repl_entre_tarde_es, t)

    patron_entre_tarde_en = r'(?i)\bbetween\s+(\d{1,2}(?::\d{2})?)\s*(?:pm|p\.?\s*m\.?)?\s*and\s*(\d{1,2}(?::\d{2})?)\s*(?:hours?)?\s*(?:in\s+the\s+afternoon|p\.?\s*m\.?|pm)\b'
    def repl_entre_tarde_en(m):
        h1, m1 = parse_hm(m.group(1))
        h2, m2 = parse_hm(m.group(2))
        if h1 < 12: h1 += 12
        if h2 < 12: h2 += 12
        return f"between {h1:02d}:{m1} and {h2:02d}:{m2} hours"
    t = re.sub(patron_entre_tarde_en, repl_entre_tarde_en, t)

    # 5. Horas individuales con sufijos explícitos
    def repl_single_am(m):
        h, mn = parse_hm(m.group(1))
        if h == 12: h = 0
        return f"{h:02d}:{mn} {lbl}"
    t = re.sub(r'(?i)\b(\d{1,2}(?::\d{2})?)\s*(?:hrs?\.?|horas?)?\s*(?:de\s+la\s+mañana|a\.?\s*m\.?)\b', repl_single_am, t)
    t = re.sub(r'(?i)\b(\d{1,2}(?::\d{2})?)\s*(?:hours?)?\s*(?:in\s+the\s+morning|a\.?\s*m\.?|am)\b', repl_single_am, t)

    def repl_single_pm(m):
        h, mn = parse_hm(m.group(1))
        if h < 12: h += 12
        return f"{h:02d}:{mn} {lbl}"
    t = re.sub(r'(?i)\b(\d{1,2}(?::\d{2})?)\s*(?:hrs?\.?|horas?)?\s*(?:de\s+la\s+tarde|de\s+la\s+noche|p\.?\s*m\.?)\b', repl_single_pm, t)
    t = re.sub(r'(?i)\b(\d{1,2}(?::\d{2})?)\s*(?:hours?)?\s*(?:in\s+the\s+afternoon|in\s+the\s+evening|at\s+night|p\.?\s*m\.?|pm)\b', repl_single_pm, t)

    # 6. Rangos numéricos sin sufijo (ej: "de 9:00 a 4:00", "from 9:00 to 4:00")
    def repl_rango_simple(m):
        prep = m.group(1) or ""
        h1, m1 = parse_hm(m.group(2))
        sep = m.group(3)
        h2, m2 = parse_hm(m.group(4))
        if h1 < 12 and h2 <= 7:
            h2 += 12
        pref = f"{prep} " if prep else ""
        return f"{pref}{h1:02d}:{m1} {sep} {h2:02d}:{m2} {lbl}"
    t = re.sub(r'(?i)(?:\b(de|from)\s+)?(\d{1,2}(?::\d{2})?)\s*(a|to|hasta)\s*(\d{1,2}(?::\d{2})?)(?:\s+(?:hrs?\.?|horas?|hours?))?\b', repl_rango_simple, t)

    # 7. Expresiones aisladas del parque: "cierra a las 4:00", "salida a las 6:00", "closes strictly at 4:00", etc.
    def repl_accion(m):
        accion = m.group(1)
        h, mn = parse_hm(m.group(2))
        if h <= 7 and any(w in accion.lower() for w in ["cierra", "salida", "concluye", "close", "exit"]):
            h += 12
        return f"{accion} {h:02d}:{mn} {lbl}"
    t = re.sub(r'(?i)\b(cierra(?:\s+estrictamente)?(?:\s+taquilla)?\s+a\s+las|salida(?:\s+m[aá]xima)?(?:\s+del\s+parque)?\s+es\s+a\s+las|abre(?:\s+taquilla)?\s+a\s+las|hasta\s+las|despu[eé]s\s+de\s+las)\s*(\d{1,2}(?::\d{2})?)\b', repl_accion, t)
    t = re.sub(r'(?i)\b(closes(?:\s+strictly)?(?:\s+at)?|exit(?:\s+time)?\s+is\s+at|opens\s+at|until)\s*(\d{1,2}(?::\d{2})?)\b', repl_accion, t)

    # 8. Normalizar formato de dos dígitos para la hora (ej: "9:00" -> "09:00")
    t = re.sub(r'(?<!\d:)(?<!\d)([0-9]):([0-5]\d)\b', r'0\1:\2', t)

    # 9. Limpiar cualquier sufijo de período pegado a 'horas' o 'hours' (ej: "09:00 horas de la mañana", "16:00 horas de la tarde")
    t = re.sub(r'(?i)\b(\d{2}:\d{2}\s+horas?)\s*(?:de\s+la\s+tarde|de\s+la\s+mañana|de\s+la\s+noche|del\s+d[ií]a|a\.?\s*m\.?|p\.?\s*m\.?)\b', r'\1', t)
    t = re.sub(r'(?i)\b(\d{2}:\d{2}\s+hours?)\s*(?:in\s+the\s+morning|in\s+the\s+afternoon|in\s+the\s+evening|at\s+night|am|pm|a\.?\s*m\.?|p\.?\s*m\.?)\b', r'\1', t)

    # 10. Limpieza general de residuos y palabras duplicadas
    t = re.sub(r'(?i)\bde\s+la\s+mañana\b', '', t)
    t = re.sub(r'(?i)\bde\s+la\s+tarde\b', '', t)
    t = re.sub(r'(?i)\bde\s+la\s+noche\b', '', t)
    t = re.sub(r'(?i)\bin\s+the\s+morning\b', '', t)
    t = re.sub(r'(?i)\bin\s+the\s+afternoon\b', '', t)
    t = re.sub(r'(?i)\bin\s+the\s+evening\b', '', t)
    t = re.sub(r'(?i)\ba\.?\s*m\.?\b', '', t)
    t = re.sub(r'(?i)\bp\.?\s*m\.?\b', '', t)
    t = re.sub(r'(?i)\bhoras(\s+horas)+\b', 'horas', t)
    t = re.sub(r'(?i)\bhrs(\s+hrs)+\b', 'hrs', t)
    t = re.sub(r'(?i)\bhours(\s+hours)+\b', 'hours', t)

    # 11. Limpieza de puntuación y espacios
    t = re.sub(r'\.{2,}', '.', t)
    t = re.sub(r'\s+([,\.\?!])', r'\1', t)
    t = re.sub(r'\s{2,}', ' ', t).strip()

    return t

async def generar_audio_hibrido(texto, nombre_archivo, idioma='es'):
    """Genera audio con Microsoft Edge TTS y fallback a Google TTS, soportando es-MX y en-US."""
    texto_procesado = preprocesar_texto_para_tts(texto, idioma=idioma)
    texto_limpio = texto_procesado.replace("*", "").replace('"', "").replace("#", "").replace("\n", " ")
    
    if idioma == 'en':
        texto_fonetico = re.sub(r'(?i)zoomat', 'Zoo-Mat', texto_limpio)
        voz_edge = "en-US-GuyNeural"
        lang_gtts = 'en'
        tld_gtts = 'com'
        etiqueta_voz = "en-US Guy"
    else:
        texto_fonetico = re.sub(r'(?i)zoomat', 'Zómat', texto_limpio)
        voz_edge = "es-MX-JorgeNeural"
        lang_gtts = 'es'
        tld_gtts = 'com.mx'
        etiqueta_voz = "es-MX Jorge"
    
    ruta_salida = f"assets/{nombre_archivo}"
    
    try:
        # INTENTO A: Microsoft Edge TTS
        communicate = edge_tts.Communicate(texto_fonetico, voz_edge)
        await communicate.save(ruta_salida)
        print(f"[EXITO] Audio generado con exito (Microsoft Edge TTS - Voz {etiqueta_voz}).")
        
    except Exception as e:
        print(f"[AVISO] Error en Microsoft Edge TTS ({e}). Activando Google TTS...")
        
        try:
            # INTENTO B: Google TTS Respaldo
            tts = gTTS(text=texto_fonetico, lang=lang_gtts, tld=tld_gtts, slow=False)
            tts.save(ruta_salida)
            print(f"[EXITO] Audio generado con exito (Google TTS Respaldo {lang_gtts}).")
        except Exception as gtts_error:
            print(f"[ERROR] Ambos motores en la nube fallaron. Detalle: {gtts_error}")

def preguntar_a_llama(prompt_usuario, instrucciones_sistema=""):
    """Envía la consulta a Llama 3.1 y limpia cualquier formato o razonamiento residual con reintentos."""
    ollama_host = os.getenv("OLLAMA_HOST", "localhost")
    ollama_port = os.getenv("OLLAMA_PORT", "11434")
    url = f"http://{ollama_host}:{ollama_port}/api/generate"
    payload = {
        "model": "llama3.1",
        "system": instrucciones_sistema,
        "prompt": prompt_usuario,
        "stream": False,
        "options": {
            "temperature": 0.0,
            "seed": 42
        }
    }
    for intento in range(3):
        try:
            respuesta = requests.post(url, json=payload, timeout=60)
            if respuesta.status_code == 200:
                texto_respuesta = respuesta.json().get("response", "Error al procesar la respuesta.").strip()
                # Limpieza profunda: eliminamos pensamientos entre paréntesis, comillas, asteriscos y saltos de línea
                texto_respuesta = re.sub(r'\(.*?\)', '', texto_respuesta)
                texto_respuesta = texto_respuesta.replace("**", "").replace("*", "").replace('"', "").replace("\n", " ").strip(' \t\n\r"\'')
                # Eliminamos pregunta repetida al inicio o muletillas de relleno meta-lingüístico
                texto_respuesta = re.sub(r'^[¿¡]?[^.?!]{3,90}\?\s*', '', texto_respuesta).strip()
                texto_respuesta = re.sub(
                    r'^(?:EXISTENCIA O PRESENCIA|PREGUNTA ESPEC[ÍI]FICA|DATO FALTANTE|CONSULTA GENERAL|INSTRUCCIONES|RESPUESTA DIRECTA):\s*',
                    '', texto_respuesta, flags=re.IGNORECASE
                ).strip()
                texto_respuesta = re.sub(
                    r'^(?:la respuesta a tu pregunta es(?: que)?|en el fragmento se (?:describe|menciona|indica)(?: que)?)\s+',
                    '', texto_respuesta, flags=re.IGNORECASE
                ).strip()
                # Eliminamos posibles justificaciones de razonamiento al inicio
                texto_respuesta = re.sub(r'^(?:lo siento,?\s+pero\s+)?(?:el visitante no mencion[oó]|la pregunta del visitante es demasiado vaga).*?(?:\.\s*|\:\s*)', '', texto_respuesta, flags=re.IGNORECASE).strip()
                # Eliminamos disculpas espurias ("Lo siento, ...") cuando SÍ se está dando una respuesta positiva
                texto_sin_disculpa = re.sub(
                    r'^lo siento,?\s+(?:pero\s+)?(?!en mis registros|no cuento|no tengo|no contamos|no dispongo|no se cuenta)',
                    '', texto_respuesta, flags=re.IGNORECASE
                ).strip()
                if texto_sin_disculpa:
                    texto_respuesta = texto_sin_disculpa[0].upper() + texto_sin_disculpa[1:]
                # Limpieza de meta-lenguaje sobre "fragmento" / "fragment"
                oraciones_sin_meta = [
                    o.strip() for o in re.split(r'(?<!\d)\.(?!\d)\s+', texto_respuesta)
                    if o.strip() and not re.search(r'\b(?:en\s+el\s+fragmento|in\s+the\s+fragment)\b', o, flags=re.IGNORECASE)
                ]
                if oraciones_sin_meta and len(oraciones_sin_meta) < len([o for o in re.split(r'(?<!\d)\.(?!\d)\s+', texto_respuesta) if o.strip()]):
                    texto_respuesta = '. '.join(o.rstrip('.') for o in oraciones_sin_meta) + '.'
                if re.search(r'\b(?:el\s+fragmento|el\s+texto|la\s+ficha|el\s+documento)\b.*?\b(?:no\s+(?:contiene|menciona|especifica|proporciona|incluye|cuenta|brinda|da))\b', texto_respuesta, flags=re.IGNORECASE):
                    texto_respuesta = "Lo siento, en mis registros oficiales del ZooMAT no cuento con información específica sobre ese dato."
                elif re.search(r'\b(?:the\s+fragment|the\s+text|the\s+document)\b.*?\b(?:does\s+not\s+(?:contain|mention|provide|include|give|state)|is\s+not\s+(?:specified|mentioned|provided))\b', texto_respuesta, flags=re.IGNORECASE):
                    texto_respuesta = "I apologize, in my official ZooMAT records I do not have specific information regarding that fact."
                # Expandir abreviaturas de unidades métricas para voz TTS natural
                es_ingles = "virtual guide" in (instrucciones_sistema or "").lower()
                if es_ingles:
                    texto_respuesta = re.sub(r'(\d)\s*mm\b', r'\1 millimeters', texto_respuesta)
                    texto_respuesta = re.sub(r'(\d)\s*cm\b', r'\1 centimeters', texto_respuesta)
                    texto_respuesta = re.sub(r'(\d)\s*kg\b', r'\1 kilograms', texto_respuesta)
                else:
                    texto_respuesta = re.sub(r'(\d)\s*mm\b', r'\1 milímetros', texto_respuesta)
                    texto_respuesta = re.sub(r'(\d)\s*cm\b', r'\1 centímetros', texto_respuesta)
                    texto_respuesta = re.sub(r'(\d)\s*kg\b', r'\1 kilogramos', texto_respuesta)
                # Limpiar espacios sobrantes y puntuación previa a comas/puntos
                texto_respuesta = re.sub(r'\s+([,\.])', r'\1', texto_respuesta)
                texto_respuesta = re.sub(r'\s+', ' ', texto_respuesta).strip()
                # Garantizar estrictamente un máximo de 4 oraciones para síntesis de voz (TTS)
                oraciones = [o.strip() for o in re.split(r'(?<!\d)\.(?!\d)\s+', texto_respuesta) if o.strip()]
                if len(oraciones) > 4:
                    texto_respuesta = '. '.join(o.rstrip('.') for o in oraciones[:4]) + '.'
                return texto_respuesta
            elif intento < 2:
                time.sleep(0.5)
                continue
            return f"Error en la conexión. Código: {respuesta.status_code}"
        except Exception as e:
            if intento < 2:
                time.sleep(0.5)
                continue
            return f"Ocurrió un error inesperado: {str(e)}"

def verificar_interaccion_basica(pregunta, idioma='es'):
    """Evalúa la entrada en Python puro (<0.01s) para responder o filtrar saludos, modismos, despedidas y gibberish (ES / EN)."""
    texto_crudo = pregunta.strip().lower()
    p_norm = quitar_acentos(texto_crudo)
    p_solo_letras = re.sub(r'[^\w\s]', '', p_norm).strip()
    # Versión colapsada de caracteres triples o más (ej. 'holaaaa' -> 'hola', 'ondaaaa' -> 'onda')
    p_sin_repeticion = re.sub(r'([a-zA-Z])\1{2,}', r'\1', p_solo_letras)
    
    # 1. Filtro básico: vacío, solo números o sin ninguna vocal
    patron_vocales = r'[aeiouy]' if idioma == 'en' else r'[aeiou]'
    if not p_solo_letras or p_solo_letras.isdigit() or not re.search(patron_vocales, p_norm):
        if idioma == 'en':
            return "Please write or ask by voice about a ZooMAT species, schedule, or service."
        return "Por favor, escribe o formula mediante tu voz el nombre de un animal, costo u horario del ZooMAT que desees consultar."

    # 1.3 Filtro de insultos, quejas y frustración
    patrones_insultos = ["cabron", "pendejo", "estupido", "idiota", "chinga", "puto", "inutil", "imbecil", "mierda", "fuck", "shit", "bitch", "asshole"]
    if any(re.search(rf'\b{ins}\b', p_solo_letras) for ins in patrones_insultos):
        if idioma == 'en':
            return "I apologize for any confusion. I am here to assist you politely with official information regarding ZooMAT species, admission fees, schedules, and park facilities. How may I help you?"
        return "Lamento la confusión. Estoy aquí para ayudarte de la mejor manera con información sobre los animales, horarios, costos y servicios del ZooMAT. ¿En qué duda específica sobre el zoológico te gustaría que te apoye?"

    # 1.4 Filtro de quejas sobre el bot
    patrones_quejas_es = ["me caes mal", "eres malo", "no sirves", "pesimo servicio", "te odio"]
    patrones_quejas_en = ["you suck", "i hate you", "you are useless", "bad service"]
    if any(q in p_solo_letras for q in patrones_quejas_en) or (idioma == 'en' and any(q in p_solo_letras for q in patrones_quejas_es)):
        return "I apologize if your experience was not optimal. I continuously improve to assist you with Chiapas wildlife and your visit to ZooMAT. How can I help you today?"
    if any(q in p_solo_letras for q in patrones_quejas_es):
        return "Lamento si la experiencia no ha sido óptima. Continuamente mejoro para brindarte la mejor información sobre la fauna de Chiapas y tu visita al ZooMAT. ¿Hay alguna duda específica en la que pueda ayudarte?"

    # 1.5 Filtro de desgano o respuestas conversacionales abiertas
    patrones_desgano_es = ["responde lo que quieras", "lo que quieras", "lo que sea", "lo que tu digas", "me da igual", "como quieras"]
    patrones_desgano_en = ["whatever", "anything", "as you wish", "whatever you want", "up to you"]
    if any(d in p_solo_letras for d in patrones_desgano_en) or (idioma == 'en' and any(d in p_solo_letras for d in patrones_desgano_es)):
        return "I can tell you about emblematic regional species like the jaguar, quetzal, or tapir, or provide info on schedules and entrance fees. Which topic would you prefer?"
    if any(d in p_solo_letras for d in patrones_desgano_es):
        return "Puedo contarte sobre especies emblemáticas como el jaguar, el quetzal o el tapir, o informarte sobre nuestros horarios y costos de entrada. ¿Cuál de estos temas te interesa?"

    # 1.6 Filtro de hora de reloj
    patrones_hora_es = ["que hora es", "tienes la hora", "me das la hora", "dame la hora", "la hora por favor", "que horas son", "a que hora estamos"]
    patrones_hora_en = ["what time is it", "tell me the time", "do you have the time"]
    if any(h in p_solo_letras or h in p_sin_repeticion for h in patrones_hora_en) or (idioma == 'en' and any(h in p_solo_letras for h in patrones_hora_es)):
        from datetime import datetime
        hora_str = datetime.now().strftime("%H:%M")
        return f"Currently it is approximately {hora_str} hours. Please note that the ZooMAT ticket booth is open from 09:00 to 16:00 hours from Tuesday to Sunday, with maximum park exit at 18:00 hours."
    if any(h in p_solo_letras or h in p_sin_repeticion for h in patrones_hora_es):
        from datetime import datetime
        hora_str = datetime.now().strftime("%H:%M")
        return f"Actualmente son aproximadamente las {hora_str} horas. Te recordamos que la taquilla del ZooMAT abre de 9:00 a 16:00 horas de martes a domingo, y el horario máximo de salida es a las 18:00 horas."

    # 1.7 Filtro de fecha y día calendario
    patrones_fecha_es = ["que dia es hoy", "que fecha es hoy", "a como estamos hoy", "que dia estamos"]
    patrones_fecha_en = ["what day is it", "what day is today", "what is today's date", "what is the date"]
    if any(f in p_solo_letras or f in p_sin_repeticion for f in patrones_fecha_en) or (idioma == 'en' and any(f in p_solo_letras for f in patrones_fecha_es)):
        from datetime import datetime
        dias_en = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
        hoy = datetime.now()
        dia_nom = dias_en[hoy.weekday()]
        aviso = " Please note that today Monday ZooMAT is closed for general maintenance." if hoy.weekday() == 0 else " The zoo is open today until 16:00 hours at the ticket office."
        return f"Today is {dia_nom}, {hoy.strftime('%B %d, %Y')}.{aviso}"
    if any(f in p_solo_letras or f in p_sin_repeticion for f in patrones_fecha_es):
        from datetime import datetime
        dias_es = ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"]
        hoy = datetime.now()
        dia_nom = dias_es[hoy.weekday()]
        aviso = " Ten en cuenta que hoy lunes el ZooMAT permanece cerrado por mantenimiento." if hoy.weekday() == 0 else " El parque se encuentra abierto con taquilla disponible hasta las 16:00 horas."
        return f"Hoy es {dia_nom}, {hoy.strftime('%d/%m/%Y')}.{aviso}"

    # 1.8 Filtro de capacidades del asistente
    patrones_capacidades_es = ["que te puedo preguntar", "que me puedes responder", "que preguntas puedo hacer", "que sabes hacer", "que informacion tienes", "que sabes"]
    patrones_capacidades_en = ["what can i ask you", "what can you do", "what do you know", "what questions can i ask"]
    if any(c in p_solo_letras or c in p_sin_repeticion for c in patrones_capacidades_en) or (idioma == 'en' and any(c in p_solo_letras for c in patrones_capacidades_es)):
        return "You can ask me about species native to Chiapas (diet, habitat, characteristics), entrance fees and discounts, visiting hours, bathroom locations, night tours, and visitor regulations. How can I assist you?"
    if any(c in p_solo_letras or c in p_sin_repeticion for c in patrones_capacidades_es):
        return "Puedes preguntarme sobre las especies nativas de Chiapas (su alimentación, hábitat o características), costos de entrada y descuentos, horarios de visita, ubicación de sanitarios, recorridos nocturnos y reglamentos del zoológico. ¿En qué te puedo ayudar hoy?"

    # 2. Filtro de Identidad del Bot
    patrones_identidad_es = [
        "quien eres", "que eres", "eres como chat gpt", "eres chat gpt", "eres chatgpt", 
        "eres un bot", "eres una ia", "eres un robot", "como te llamas", "que haces",
        "y tu que eres", "tu que eres", "que puedes hacer", "para que sirves"
    ]
    patrones_identidad_en = [
        "who are you", "what are you", "are you chat gpt", "are you chatgpt",
        "are you a bot", "are you an ai", "are you a robot", "what is your name",
        "what do you do", "what can you do", "what is zoomat"
    ]
    if any(pi in p_solo_letras for pi in patrones_identidad_en) or (idioma == 'en' and any(pi in p_solo_letras for pi in patrones_identidad_es)):
        return "Hello! I am the official virtual guide of ZooMAT (Miguel Alvarez del Toro Regional Zoo). I am here to assist you with information regarding native Chiapas wildlife, entrance fees, schedules, location, and park rules. How can I help you today?"
    if any(pi in p_solo_letras for pi in patrones_identidad_es):
        return "¡Hola! Soy el asistente virtual oficial del ZooMAT (Zoológico Regional Miguel Álvarez del Toro). Mi función es orientarte sobre la fauna regional de Chiapas y proporcionarte información sobre costos, horarios, ubicación y normas del zoológico. ¿En qué te puedo ayudar hoy?"

    # 3. Filtro de Peticiones Abiertas de Información / Sugerencias de animales (Muestreo Dinámico de la BD)
    patrones_abiertos_es = [
        "hablame sobre algun animal", "hablame de algun animal", "hablame de un animal",
        "cuentame de un animal", "dime de un animal", "recomiendame un animal",
        "dime algo de un animal", "platicame de un animal", "recomienda un animal",
        "hablame de un bicho", "hablame de una especie", "cuentame de alguna especie"
    ]
    patrones_abiertos_en = [
        "tell me about an animal", "tell me about some animal", "tell me about a species",
        "recommend an animal", "recommend a species", "talk to me about an animal",
        "talk about an animal", "suggest an animal"
    ]
    if any(pa in p_solo_letras for pa in patrones_abiertos_en) or (idioma == 'en' and any(pa in p_solo_letras for pa in patrones_abiertos_es)):
        todas = obtener_especies_registradas()
        if todas:
            muestras = random.sample(todas, min(3, len(todas)))
            ejemplos_texto = ", ".join(muestras[:-1]) + f", or {muestras[-1]}" if len(muestras) > 1 else muestras[0]
            return f"With pleasure! At ZooMAT we house various representative species from Chiapas, such as {ejemplos_texto}, among many others. Would you like to learn about one of them, or do you have another species in mind?"
        return "With pleasure! At ZooMAT we protect wildlife native to Chiapas. Which animal would you like to know about?"
    if any(pa in p_solo_letras for pa in patrones_abiertos_es):
        todas = obtener_especies_registradas()
        if todas:
            muestras = random.sample(todas, min(3, len(todas)))
            ejemplos_texto = ", ".join(muestras[:-1]) + f" o {muestras[-1]}" if len(muestras) > 1 else muestras[0]
            return f"¡Con gusto! En el ZooMAT albergamos diversas especies representativas de Chiapas, tales como {ejemplos_texto}, entre muchas otras. ¿Te gustaría conocer la ficha biológica de alguna de ellas o prefieres consultar otra especie?"
        return "¡Con gusto! En el ZooMAT albergamos y protegemos la fauna nativa de Chiapas. ¿Sobre qué animal te gustaría recibir información?"

    # 4. Filtro de Saludos (incluyendo modismos e inglés)
    saludos_en = ["hello", "hi", "good morning", "good afternoon", "good evening", "hey", "greetings"]
    saludos_exactos = [
        "hola", "ola", "olaa", "buenos dias", "buenas tardes", "buenas noches", "buenas",
        "que tal", "hola buenos dias", "hola buenas tardes", "hola buenas noches", "hey",
        "que onda", "y que onda", "que hubo", "que tranza", "que hay", "saludos"
    ]
    if p_solo_letras in saludos_en or p_sin_repeticion in saludos_en or any(p_sin_repeticion.startswith(s + " ") for s in ["hello", "hi", "hey"]):
        return "Hello! Welcome to ZooMAT. Which regional species or zoo information would you like to know about today?"
    if p_solo_letras in saludos_exactos or p_sin_repeticion in saludos_exactos or any(p_sin_repeticion.startswith(s + " ") for s in ["hola", "ola", "buenas", "que onda"]):
        if idioma == 'en':
            return "Hello! Welcome to ZooMAT. Which regional species or zoo information would you like to know about today?"
        return "¡Hola! Bienvenido al ZooMAT. ¿Sobre qué especie regional o información del zoológico te gustaría saber hoy?"

    # 5. Filtro de Negaciones breves
    negaciones_en = ["no", "nope", "no thanks", "none", "nothing", "nothing else"]
    negaciones = ["no", "nop", "no gracias", "ninguno", "nada", "nada mas"]
    if p_solo_letras in negaciones_en:
        return "Understood. If you need any assistance regarding an animal or your tour at ZooMAT later on, I will be here. Enjoy your visit!"
    if p_solo_letras in negaciones:
        if idioma == 'en':
            return "Understood. If you need any assistance regarding an animal or your tour at ZooMAT later on, I will be here. Enjoy your visit!"
        return "Entendido. Si más adelante necesitas conocer sobre algún animal o tu recorrido por el ZooMAT, aquí estaré. ¡Que disfrutes tu visita!"

    # 6. Filtro de Confirmaciones y Coloquialismos
    confirmaciones_en = ["yes", "yes practical", "yes please", "sure", "ok", "okay", "fine", "understood", "great", "alright"]
    confirmaciones = [
        "si", "si por favor", "claro", "por supuesto", "ok", "vale", "bueno", "bien", 
        "entendido", "aja", "sale", "orale", "orale we", "orale pues", "va", "sale vale", 
        "si guey", "si wey", "arre", "camara"
    ]
    if p_solo_letras in confirmaciones_en:
        return "Perfect! Which animal from Chiapas or ZooMAT service would you like information about?"
    if p_solo_letras in confirmaciones:
        if idioma == 'en':
            return "Perfect! Which animal from Chiapas or ZooMAT service would you like information about?"
        return "¡Perfecto! ¿De qué animal de Chiapas o servicio del ZooMAT te gustaría recibir información?"

    # 7. Filtro de Agradecimientos y Despedidas
    despedidas_en = ["thank you", "thanks", "bye", "goodbye", "see you", "see you later", "thats all", "perfect thanks"]
    despedidas_claves = [
        "gracias", "muchas gracias", "ok gracias", "va gracias", "sale gracias",
        "adios", "hasta luego", "nos vemos", "ahi nos vemos", "bye", "sale bye",
        "eso es todo", "perfecto gracias", "ah bueno gracias"
    ]
    if any(d in p_solo_letras for d in despedidas_en):
        return "You're very welcome! We hope you have a wonderful visit to ZooMAT. See you soon!"
    if any(d in p_solo_letras for d in despedidas_claves):
        palabras_pregunta = ["donde", "cuanto", "que", "como", "cuando", "cual", "cuales", "hora", "costo", "precio", "boleto"]
        if not any(pp in p_solo_letras.split() for pp in palabras_pregunta) or p_solo_letras in despedidas_claves:
            if idioma == 'en':
                return "You're very welcome! We hope you have a wonderful visit to ZooMAT. See you soon!"
            return "¡Con mucho gusto! Espero que disfrutes muchísimo tu recorrido por el ZooMAT. ¡Hasta pronto!"

    # 8. Filtro de Cortesías mutuas
    cortesias_en = ["you are welcome", "youre welcome", "my pleasure", "no problem", "anytime"]
    cortesias = ["de nada", "por nada", "no hay de que", "con gusto", "a la orden", "un placer"]
    if any(c in p_solo_letras for c in cortesias_en):
        return "A pleasure to assist you! If you have any further questions about ZooMAT species or services, feel free to ask."
    if p_solo_letras in cortesias:
        if idioma == 'en':
            return "A pleasure to assist you! If you have any further questions about ZooMAT species or services, feel free to ask."
        return "¡Es un gusto ayudarte! Si tienes alguna otra duda sobre nuestras especies o servicios en el ZooMAT, con confianza pregúntame."

    # 9. Detector avanzado de "teclazos" (Gibberish) palabra por palabra
    patrones_teclado = r'(asdf|qwer|zxcv|hjkl|jk|kj|sj|js|jd|dj|lj|jl|hj|jh|gf|fg|df|fd|vc|cv|zx|xz|qw|wq|fk|kf|dk|kd)'
    tokens_taxonomia_validos = {
        tok for k in list(motor_rag.TAXONOMIA_MAPA.keys()) + list(motor_rag.ESPECIES_CONOCIDAS.keys())
        for tok in k.split() if len(tok) >= 4
    }
    for palabra in p_solo_letras.split():
        if palabra in tokens_taxonomia_validos:
            continue
        # A) Consonantes seguidas (permitiendo grupos válidos del español, inglés y raíces científicas latinas)
        if idioma == 'en':
            if re.search(r'[bcdfghjklmnpqrstvwxz]{5,}', palabra):
                if not re.search(r'(ngths|ngth|bstr|nphr|mphr|chth|phth)', palabra):
                    return "I could not understand your message. Which ZooMAT species or service would you like information about?"
        else:
            if re.search(r'[bcdfghjklmnñpqrstvwxyz]{4,}', palabra):
                if not re.search(r'(nstr|bstr|nspr|nspl|nscr|ngth|nphr|mphr|lphr|phry|rhyn|chth|phth)', palabra):
                    return "Lo siento, no logré comprender tu consulta. ¿De qué especie o servicio del ZooMAT te gustaría recibir información?"

        # B) Barridos de teclado
        if re.search(patrones_teclado, palabra):
            if idioma == 'en':
                return "I could not understand your message. Which ZooMAT species or service would you like information about?"
            return "Lo siento, no logré comprender tu consulta. ¿De qué especie o servicio del ZooMAT te gustaría recibir información?"

        # C) Proporción de vocales en palabras largas
        if palabra.isdigit():
            continue
        if idioma == 'en':
            # En inglés palabras legítimas como strong, spring, flight, plants, thanks tienen 1 sola vocal (ratio 0.166)
            palabras_validas_en = {
                "strong", "strength", "strengths", "spring", "springs", "bright", "flight", "flights",
                "knight", "knights", "strike", "strikes", "strict", "straight", "stream", "rhythm",
                "rhythms", "church", "churches", "branch", "branches", "plants", "growth", "length",
                "lengths", "thanks", "school", "schools", "screen", "screens", "splash", "thrill", "threat", "threats"
            }
            if palabra in palabras_validas_en:
                continue
            if len(palabra) >= 7 and palabra.isalpha():
                num_vocales = len(re.findall(r'[aeiouy]', palabra))
                if (num_vocales / len(palabra)) < 0.15:
                    return "I could not understand your message. Which ZooMAT species or service would you like information about?"
        else:
            if len(palabra) >= 5 and palabra.isalpha():
                num_vocales = len(re.findall(r'[aeiou]', palabra))
                if (num_vocales / len(palabra)) < 0.25:
                    return "Lo siento, no logré comprender tu consulta. ¿De qué especie o servicio del ZooMAT te gustaría recibir información?"

        # D) Si repite la misma letra 4 veces seguidas
        if re.search(r'(.)\1{3,}', palabra):
            if idioma == 'en':
                return "I could not understand your message. Which ZooMAT species or service would you like information about?"
            return "Lo siento, no logré comprender tu consulta. ¿De qué especie o servicio del ZooMAT te gustaría recibir información?"

    # 10. Filtro de entradas demasiado breves sin contexto (< 3 caracteres)
    if len(p_solo_letras) < 3:
        if idioma == 'en':
            return "I apologize, your inquiry is very short. Please write the name of an animal, service, or admission fee for ZooMAT."
        return "Lo siento, tu consulta es muy breve. Por favor escribe el nombre de un animal, servicio o costo del ZooMAT que desees consultar."

    return None


# --- FAST-PATH: Sugerencias Rápidas Automatizadas (Respuestas fijas e instantáneas) ---
SUGERENCIAS_RAPIDAS = {
    "costos": {
        "texto": "La tarifa general es de 35 pesos. Presentando credencial vigente de estudiante, maestro, INAPAM o INSEN el costo es de 25 pesos. Los niños menores de un metro entran gratis, y los martes la entrada es libre para chiapanecos con credencial del INE de Chiapas.",
        "audio": "costos.mp3",
        "claves": [
            "cuales son los costos de entrada",
            "costos de entrada",
            "costos",
            "cuanto cuesta la entrada",
            "precios de entrada"
        ]
    },
    "horarios": {
        "texto": "El ZooMAT abre de martes a domingo de 09:00 a 16:00 horas, hora en que cierra taquilla. La salida máxima del parque es a las 18:00 horas, y los días lunes permanece cerrado por mantenimiento general.",
        "audio": "horarios.mp3",
        "claves": [
            "cual es el horario del zoologico",
            "horario del zoologico",
            "horarios",
            "horario",
            "cual es el horario"
        ]
    },
    "banos": {
        "texto": "El ZooMAT cuenta con cuatro módulos de sanitarios: el primero se ubica en el área de restaurantes antes de comenzar el recorrido, el segundo en plaza monos detrás del restaurante de tacos Casa Blanca, el tercero del lado derecho del hábitat de las nutrias y el cuarto a un costado izquierdo del hábitat del águila harpía.",
        "audio": "banos.mp3",
        "claves": [
            "donde estan ubicados los banos",
            "ubicacion de los banos",
            "donde estan los banos",
            "banos"
        ]
    }
}

def verificar_sugerencia_rapida(pregunta, idioma='es'):
    """Detecta las sugerencias rápidas predefinidas para responder en <0.01s sin tocar la BD ni el LLM (ES / EN)."""
    p_norm = re.sub(r'[^\w\s]', '', quitar_acentos(pregunta.lower())).strip()
    
    catalogo_principal = SUGERENCIAS_RAPIDAS_EN if idioma == 'en' else SUGERENCIAS_RAPIDAS
    for tipo, item in catalogo_principal.items():
        for clave in item["claves"]:
            clave_norm = re.sub(r'[^\w\s]', '', quitar_acentos(clave)).strip()
            if p_norm == clave_norm:
                return item["texto"], item["audio"]

    # Fallback cruzado
    catalogo_secundario = SUGERENCIAS_RAPIDAS if idioma == 'en' else SUGERENCIAS_RAPIDAS_EN
    for tipo, item in catalogo_secundario.items():
        for clave in item["claves"]:
            clave_norm = re.sub(r'[^\w\s]', '', quitar_acentos(clave)).strip()
            if p_norm == clave_norm:
                return item["texto"], item["audio"]

    return None, None

def consultar_catalogo_general(pregunta, idioma='es'):
    """Responde consultas sobre el inventario general y grupos de especies muestreando dinámicamente la BD (ES / EN)."""
    p_norm = re.sub(r'[^\w\s]', '', quitar_acentos(pregunta.lower())).strip()
    
    # 0. Si la pregunta busca atributos biológicos específicos (dieta, hábitat, reproducción, etc.),
    # dejamos que la ruta RAG responda consultando los documentos de la BD.
    palabras_biologicas = [
        "come", "comen", "comiendo", "alimenta", "alimentan", "dieta", "alimentacion", 
        "donde vive", "donde viven", "habitat", "viven", "vive",
        "reproduce", "reproducen", "reproduccion", "nacen", "huevo", "huevos",
        "respira", "respiran", "respiracion", "branquia", "pulmon", "piel",
        "veneno", "venenoso", "venenosa", "toxina", "toxico", "parotoides",
        "tamano", "mide", "miden", "cuanto mide", "peso", "pesan",
        "hablame de", "cuentame de", "informacion sobre", "caracteristicas", "descripcion",
        "que hacen", "como son", "de que color", "coloracion",
        "eat", "eats", "eating", "feed", "feeds", "diet", "live", "lives", "habitat",
        "reproduce", "reproduces", "breathe", "breathes", "breath", "venom", "poison",
        "poisonous", "size", "weight", "characteristics", "description", "color"
    ]
    if any(b in p_norm for b in palabras_biologicas):
        return None

    # 0.5 Consultas temáticas de anfibios (mitos, diferencias, medicina, bioturbación, plagas, protección) y Sapo Borracho van a RAG
    if enrutador_semantico.es_consulta_tematica_anfibios(pregunta) or any(
        k in p_norm for k in ["sapo borracho", "sapo de rebano", "rhinophrynus", "chaac", "diferencia", "diferencias", "salamandra", "protegerlos", "proteger a los"]
    ):
        return None

    # 1. Definiciones biológicas generales con ejemplos dinámicos de la BD
    if p_norm in ["que es un sapo", "que es el sapo", "que es sapo", "que son los sapos", "que son sapos", "definicion de sapo", "definicion de sapos",
                  "what is a toad", "what is the toad", "what are toads", "definition of toad"]:
        ejemplos = obtener_especies_registradas("sapo")
        if idioma == 'en':
            ej_str = f" such as the {ejemplos[0]}" if ejemplos else ""
            return f"Toads are anuran amphibians belonging to the fauna of Chiapas, characterized by their dry warty skin, parotoid glands, and terrestrial habits. At ZooMAT we house native species{ej_str}. We invite you to discover them during your tour!"
        if len(ejemplos) >= 2:
            muestras = random.sample(ejemplos, 2)
            ej_str = f" como el {muestras[0]} o el {muestras[1]}"
        elif len(ejemplos) == 1:
            ej_str = f" como el {ejemplos[0]}"
        else:
            ej_str = ""
        return f"Los sapos son anfibios anuros pertenecientes a la fauna de Chiapas, caracterizados por su piel rugosa, glándulas parotoides y hábitos terrestres. En el ZooMAT albergamos especies nativas{ej_str}. ¡Te invitamos a descubrirlos durante tu recorrido!"
        
    if p_norm in ["que es una rana", "que es la rana", "que es rana", "que son las ranas", "que son ranas", "definicion de rana", "definicion de ranas",
                  "what is a frog", "what is the frog", "what are frogs", "definition of frog"]:
        ejemplos = obtener_especies_registradas("rana")
        if idioma == 'en':
            ej_str = f" such as the {ejemplos[0]}" if ejemplos else ""
            return f"Frogs are anuran amphibians characterized by smooth moist skin, slender bodies, and long hind legs adapted for leaping. At ZooMAT we exhibit representative species from Chiapas{ej_str}. We encourage you to meet them on your visit!"
        if len(ejemplos) >= 2:
            muestras = random.sample(ejemplos, 2)
            ej_str = f" como la {muestras[0]} o la {muestras[1]}"
        elif len(ejemplos) == 1:
            ej_str = f" como la {ejemplos[0]}"
        else:
            ej_str = ""
        return f"Las ranas son anfibios anuros caracterizados por su piel suave y húmeda, cuerpo esbelto y patas traseras largas adaptadas al salto. En el ZooMAT exhibimos especies representativas de Chiapas{ej_str}. ¡Te animamos a conocerlas en tu visita!"

    if p_norm in ["que es una cecilia", "que es la cecilia", "que es cecilia", "que son las cecilias", "que son cecilias", "definicion de cecilia", "definicion de cecilias",
                  "what is a caecilian", "what is the caecilian", "what are caecilians", "definition of caecilian"]:
        ejemplos = obtener_especies_registradas("cecilia")
        if idioma == 'en':
            ej_str = f" such as the {ejemplos[0]}" if ejemplos else ""
            return f"Caecilians are legless amphibians with an elongated body resembling a small snake or earthworm, adapted to burrowing life in the rainforests of Chiapas. At ZooMAT we preserve native records{ej_str}. We invite you to learn about them on your tour."
        ej_str = f" como la {random.choice(ejemplos)}" if ejemplos else ""
        return f"Las cecilias son anfibios ápodos con aspecto alargado similar a una pequeña serpiente o lombriz, adaptadas a la vida subterránea en las selvas de Chiapas. En el ZooMAT contamos con registros{ej_str}. Te invitamos a aprender sobre ellas en tu recorrido."

    if p_norm in ["que es un anfibio", "que es el anfibio", "que es anfibio", "que son los anfibios", "que son anfibios", "definicion de anfibio", "definicion de anfibios",
                  "what is an amphibian", "what is the amphibian", "what are amphibians", "definition of amphibian"]:
        if idioma == 'en':
            return "Amphibians are a class of cold-blooded tetrapod vertebrates characterized by permeable skin and cutaneous respiration, undergoing metamorphosis from aquatic larvae to terrestrial or semi-aquatic adults. At ZooMAT we house anurans like frogs and toads, as well as Chiapas caecilians. We invite you to discover them during your visit!"
        return "Los anfibios son una clase de vertebrados tetrápodos de sangre fría caracterizados por su piel permeable y respiración cutánea, que atraviesan una metamorfosis desde larvas acuáticas hasta adultos terrestres o semiacuáticos. En el ZooMAT albergamos anuros como ranas y sapos, así como cecilias chiapanecas. ¡Te invitamos a conocerlos durante tu visita!"

    # 2. Consultas por familias o grupos taxonómicos específicos
    grupos = {
        "anfibio": "anfibios", "anfibios": "anfibios",
        "rana": "ranas", "ranas": "ranas", "ranita": "ranas", "ranitas": "ranas",
        "sapo": "sapos", "sapos": "sapos",
        "cecilia": "cecilias", "cecilias": "cecilias",
        "reptil": "reptiles", "reptiles": "reptiles",
        "ave": "aves", "aves": "aves", "pajaro": "aves", "pajaros": "aves",
        "mamifero": "mamíferos", "mamiferos": "mamíferos",
        "felino": "felinos", "felinos": "felinos",
        "serpiente": "serpientes", "serpientes": "serpientes",
        "tortuga": "tortugas", "tortugas": "tortugas",
        "mono": "monos", "monos": "monos",
        "cocodrilo": "cocodrilos", "cocodrilos": "cocodrilos",
        "caiman": "caimanes", "caimanes": "caimanes",
        "frog": "frogs", "frogs": "frogs",
        "toad": "toads", "toads": "toads",
        "caecilian": "caecilians", "caecilians": "caecilians",
        "amphibian": "amphibians", "amphibians": "amphibians",
        "bird": "birds", "birds": "birds",
        "mammal": "mammals", "mammals": "mammals",
        "reptile": "reptiles", "reptiles": "reptiles",
        "crocodile": "crocodiles", "crocodiles": "crocodiles",
        "alligator": "crocodiles", "alligators": "crocodiles",
        "feline": "felines", "felines": "felines"
    }
    
    palabras_consulta_inventario = [
        "hay", "tienen", "tiene", "albergan", "alberga", "exhiben", "exhibe",
        "podemos ver", "puedo ver", "se puede ver", "se pueden ver", "ver", 
        "cuentan", "muestrame", "cuales son", "cuales", "lista", "del zoomat", "en el zoomat",
        "do you have", "are there", "can we see", "can i see", "show me", "which", "list"
    ]
    
    grupo_consultado = None
    for clave, nombre_grupo in grupos.items():
        if re.search(rf'\b{clave}\b', p_norm):
            if any(inv in p_norm for inv in palabras_consulta_inventario):
                grupo_consultado = (clave, nombre_grupo)
                break
            
    if grupo_consultado:
        clave, nombre_grupo = grupo_consultado
        # Mapear clave en inglés a la clave canónica de filtro
        clave_filtro = ANIMALES_INGLES_A_ESP.get(clave, clave)
        if clave_filtro in ["bird", "birds"]: clave_filtro = "ave"
        elif clave_filtro in ["mammal", "mammals"]: clave_filtro = "mamifero"
        elif clave_filtro in ["reptile", "reptiles"]: clave_filtro = "reptil"
        elif clave_filtro in ["frog", "frogs"]: clave_filtro = "rana"
        elif clave_filtro in ["toad", "toads"]: clave_filtro = "sapo"
        elif clave_filtro in ["caecilian", "caecilians"]: clave_filtro = "cecilia"

        especies_grupo = obtener_especies_registradas(clave_filtro)
        
        if especies_grupo:
            num_muestra = min(4, len(especies_grupo))
            seleccionadas = random.sample(especies_grupo, num_muestra)
            if idioma == 'en':
                ej_texto = ", ".join(seleccionadas[:-1]) + f", and {seleccionadas[-1]}" if len(seleccionadas) > 1 else seleccionadas[0]
                return (
                    f"At ZooMAT we house various species of {nombre_grupo} native to Chiapas, such as {ej_texto}, "
                    f"among others from the region. We cordially invite you to discover and meet them all during your tour!"
                )
            if len(seleccionadas) == 1:
                ejemplos_texto = seleccionadas[0]
            else:
                ejemplos_texto = ", ".join(seleccionadas[:-1]) + f" y {seleccionadas[-1]}"
                
            return (
                f"En el ZooMAT contamos con diversas especies de {nombre_grupo} nativas de Chiapas, tales como {ejemplos_texto}, "
                f"entre otras más de la región. ¡Te invitamos cordialmente a descubrirlas y conocerlas todas durante tu recorrido!"
            )
        else:
            if idioma == 'en':
                return (
                    f"ZooMAT exclusively houses regional wildlife from Chiapas, including various species of {nombre_grupo}. "
                    f"We are currently expanding our digital catalog of technical sheets. We invite you to discover them in person during your visit!"
                )
            return (
                f"El ZooMAT alberga exclusivamente fauna regional de Chiapas, incluyendo diversas especies de {nombre_grupo}. "
                f"Actualmente en este módulo digital estamos ampliando el catálogo de fichas. ¡Te invitamos a descubrirlas y conocerlas en vivo durante tu visita!"
            )

    # 3. Consultas de inventario global ("¿Qué animales / especies / fauna hay o tienen?")
    palabras_inventario = [
        "que animales hay", "cuales animales hay", "que especies hay", "cuales especies hay",
        "que animales tienen", "cuales animales tienen", "que fauna hay", "que fauna tienen",
        "que podemos ver", "cuales podemos ver", "que ejemplares hay", "que ejemplares tienen",
        "animales del zoomat", "especies del zoomat", "catalogo de animales", "catalogo de especies",
        "animales que hay", "especies que hay", "cuales hay", "cuales tienen", "que es especies hay",
        "que fauna albergan", "que especies albergan", "que animales albergan",
        "what animals do you have", "what animals are there", "what species do you have",
        "what species are there", "which animals are there", "which animals do you have",
        "what fauna is there", "what can we see", "animals at zoomat", "species at zoomat",
        "animal catalog", "list of animals"
    ]
    if any(p in p_norm for p in palabras_inventario):
        todas_especies = obtener_especies_registradas()
        if todas_especies:
            num_muestra = min(5, len(todas_especies))
            seleccionadas = random.sample(todas_especies, num_muestra)
            if idioma == 'en':
                ej_texto = ", ".join(seleccionadas[:-1]) + f", and {seleccionadas[-1]}"
                return (
                    f"ZooMAT exclusively houses and protects wildlife native to the state of Chiapas. In our exhibits we have "
                    f"representative species such as {ej_texto}, among many others from the region. "
                    f"We invite you to discover all species during your visit!"
                )
            ejemplos_texto = ", ".join(seleccionadas[:-1]) + f" y {seleccionadas[-1]}"
            return (
                f"El ZooMAT alberga y protege exclusivamente fauna nativa del estado de Chiapas. En nuestros registros y exhibiciones "
                f"contamos con especies representativas como {ejemplos_texto}, entre muchas otras más de la región. "
                f"¡Te invitamos a descubrir todas las especies durante tu recorrido!"
            )
            
    return None

def formatear_nombre_especie(nombre):
    """Aplica formato de nombre propio sin dejar en mayúsculas completas los nombres de archivo/metadatos."""
    if not nombre:
        return ""
    nombre = nombre.strip()
    if nombre.isupper():
        return nombre.title()
    return nombre[0].upper() + nombre[1:]

ANIMALES_EXOTICOS = sorted([
    "leon", "leona", "leones", "elefante", "elefantes", "jirafa", "jirafas",
    "rinoceronte", "rinocerontes", "rinocero", "hipopotamo", "hipopotamos", "cebra", "cebras",
    "canguro", "canguros", "oso polar", "osos polares", "oso panda", "osos pandas",
    "oso pardo", "osos pardos", "pinguino", "pinguinos", "tigre", "tigres",
    "lobo", "lobos", "lobo marino", "lobos marinos", "panda", "pandas",
    "gorila", "gorilas", "chimpance", "chimpances", "camello", "camellos",
    "dromedario", "dromedarios", "ballena", "ballenas", "delfin", "delfines",
    "koala", "koalas", "avestruz", "avestruces", "chita", "chitas", "guepardo", "guepardos",
    "hiena", "hienas", "foca", "focas", "morsa", "morsas"
], key=len, reverse=True)

FAUNA_CHIAPAS_EMBLEMATICA = {
    "jaguar": "el jaguar", "jaguares": "el jaguar",
    "ocelote": "el ocelote", "ocelotes": "el ocelote",
    "tapir": "el tapir centroamericano", "tapires": "el tapir centroamericano",
    "quetzal": "el quetzal", "quetzales": "el quetzal",
    "guacamaya": "la guacamaya roja", "guacamayas": "la guacamaya roja",
    "mono arana": "el mono araña", "monos arana": "los monos araña",
    "saraguato": "el mono saraguato", "saraguatos": "los monos saraguato",
    "nutria": "la nutria de río", "nutrias": "las nutrias de río",
    "aguila harpia": "el águila harpía", "aguila": "el águila harpía",
    "pavon": "el pavón", "hocofaisan": "el hocofaisán",
    "cocodrilo": "el cocodrilo de río", "cocodrilos": "los cocodrilos de río",
    "caiman": "el caimán", "caimanes": "los caimanes",
    "venado": "el venado cola blanca", "venados": "los venados cola blanca",
    "pecari": "el pecarí de collar", "jabali": "el pecarí de collar"
}

PALABRAS_DESCARTADAS_EXISTENCIA = {
    'tienen', 'tiene', 'hay', 'cuentan', 'cuenta', 'albergan', 'alberga', 'exhiben', 'exhibe',
    'puede', 'pueden', 'podemos', 'puedo', 'encuentra', 'encuentran', 'encuentro', 'existe', 'existen',
    'ver', 'para', 'con', 'del', 'los', 'las', 'les', 'que', 'una', 'uno', 'unos', 'unas', 'por', 'sobre',
    'zoomat', 'zoologico', 'parque', 'aqui', 'alla', 'dentro', 'ejemplar', 'ejemplares', 'algun', 'alguna',
    'algunos', 'algunas', 'tipo', 'tipos', 'clase', 'clases', 'visita', 'visitar', 'recorrido',
    'do', 'you', 'have', 'does', 'the', 'zoo', 'are', 'there', 'is', 'can', 'we', 'see', 'i', 'find',
    'house', 'exhibit', 'any'
}

def responder_consulta_existencia_animal(pregunta, idioma='es'):
    """Responde de forma directa, certera y concisa si el ZooMAT tiene o no tiene determinada especie animal (ES / EN)."""
    p_norm = re.sub(r'[^\w\s]', '', quitar_acentos(pregunta.lower())).strip()
    
    # 0. Filtros de exclusión: consultas históricas, temáticas de anfibios, preguntas de causa/tiempo, biológicas o logísticas
    if motor_rag.es_consulta_historia(pregunta) or enrutador_semantico.es_consulta_tematica_anfibios(pregunta):
        return None
    if re.match(r'^(por que|desde cuando|como|cuantos|cuantas|quien|quienes)\b', p_norm):
        return None

    if any(re.search(rf'\b{w}\b', p_norm) for w in ["cuanto", "cuantos", "cuanta", "cuantas", "how many", "how much", "how old"]):
        if any(re.search(rf'\b{attr}\b', p_norm) for attr in ["ano", "anos", "edad", "mide", "pesa", "cuesta", "vale", "cobra", "dura", "tiempo", "years", "old", "weigh", "cost"]):
            return None

    palabras_biologicas = [
        "ano", "anos", "edad", "cuantos anos", "cuantos anos tiene", "cuanto vive", "cuantos anos vive", "longevidad", "esperanza de vida", "tiempo de vida", "how old", "how many years", "lifespan",
        "come", "comen", "comiendo", "alimenta", "alimentan", "dieta", "alimentacion", 
        "donde vive", "donde viven", "habitat", "viven", "vive",
        "reproduce", "reproducen", "reproduccion", "nacen", "huevo", "huevos",
        "respira", "respiran", "respiracion", "branquia", "pulmon", "piel",
        "veneno", "venenoso", "venenosa", "toxina", "toxico", "parotoides",
        "tamano", "mide", "miden", "cuanto mide", "peso", "pesan",
        "hablame de", "cuentame de", "informacion sobre", "caracteristicas", "descripcion",
        "que hacen", "como son", "de que color", "coloracion",
        "eat", "eats", "feed", "diet", "live", "lives", "habitat", "reproduce", "size", "weight"
    ]
    if any(b in p_norm for b in palabras_biologicas):
        return None

    palabras_logisticas = [
        "precio", "costo", "costos", "cuanto cuesta", "cuanto vale", "cuanto cobra", "cuanto cobran",
        "boleto", "boletos", "entrada", "entradas", "tarifa", "tarifas", "horario", "horarios",
        "abren", "cierran", "apertura", "cierre", "taquilla", "estacionamiento", "bano", "banos",
        "sanitario", "sanitarios", "wc", "modulo", "modulos", "descuento", "descuentos", "credencial", "credenciales",
        "recorrido", "recorridos", "caminata", "caminatas", "visitas nocturnas", "visita nocturna", "de noche",
        "tour guiado", "visita guiada", "guiado", "regla", "reglas", "mascota", "mascotas",
        "alcohol", "carriola", "carriolas", "carreola", "carreolas", "rueditas", "llantas",
        "tocar", "acariciar", "alimentar", "dar comida", "darle comida", "darle fruta", "aventarles",
        "sandalias", "chanclas", "tenis", "comida", "restaurante", "tienda", "souvenir", "recuerdos",
        "biblioteca", "limite", "cupo", "aforo", "ubicacion", "donde queda", "como llegar",
        "parking", "ticket", "tickets", "admission", "schedule", "hours", "pet", "pets", "restroom", "restrooms"
    ]
    if any(re.search(rf'\b{re.escape(l)}\b', p_norm) for l in palabras_logisticas):
        return None

    # Excluir "donde esta" del parque pero manejar "¿Dónde están los [animales]?" hacia recintos
    if re.search(r'\bdonde esta\b', p_norm) and any(z in p_norm for z in ["zoomat", "zoologico", "parque", "entrada"]):
        return None

    # Caso especial: ubicación interna de exhibidores ("¿Dónde están los monos o el águila?") sin mencionar baños
    if re.search(r'\bdonde\s+(estan|esta)\b', p_norm) and not any(b in p_norm for b in ["bano", "banos", "sanitario", "wc", "comida", "tienda", "biblioteca", "taquilla", "zoomat", "zoologico", "parque"]):
        especies_mencionadas = motor_rag.detectar_especies_relacionadas(pregunta)
        if especies_mencionadas or any(re.search(rf'\b{re.escape(c)}\b', p_norm) for c in FAUNA_CHIAPAS_EMBLEMATICA):
            if idioma == 'en':
                return "At ZooMAT you can observe Chiapas native wildlife such as monkeys and eagles distributed along the trails in their natural exhibits. We warmly invite you to discover every recinto during your tour!"
            return "¡Con gusto! En el ZooMAT albergamos especies nativas de Chiapas como monos y águilas en sus respectivos recintos naturales a lo largo del recorrido. ¡Te invitamos a descubrirlos todos durante tu visita!"

    # Evitar interceptar si el enrutador semántico detecta intención logística clara
    if enrutador_semantico.analizar_intencion(pregunta)["ruta"] == "mysql":
        return None

    palabras_inventario = [
        "que animales hay", "cuales animales hay", "que especies hay", "cuales especies hay",
        "que animales tienen", "cuales animales tienen", "que fauna hay", "que fauna tienen",
        "que podemos ver", "cuales podemos ver", "que ejemplares hay", "que ejemplares tienen",
        "animales del zoomat", "especies del zoomat", "catalogo de animales", "catalogo de especies",
        "animales que hay", "especies que hay", "cuales hay", "cuales tienen", "que es especies hay",
        "que fauna albergan", "que especies albergan", "que animales albergan",
        "what animals do you have", "what animals are there", "which animals are there", "what species are there"
    ]
    if any(p in p_norm for p in palabras_inventario):
        return None

    # Verificar si es una consulta sobre presencia o existencia
    patron_existencia = re.compile(
        r'\b(tienen|tiene|hay|cuentan con|cuenta con|cuentan|cuenta|albergan|alberga|exhiben|exhibe|'
        r'se puede ver|se pueden ver|podemos ver|puedo ver|se encuentra|se encuentran|'
        r'encuentro|existen|existe|do you have|does the zoo have|are there|is there|can we see|can i see|do you house|do you exhibit)\b',
        re.IGNORECASE
    )
    if not patron_existencia.search(p_norm):
        return None

    # 1. Animales exóticos (no pertenecen a la fauna regional de Chiapas)
    for exotico in ANIMALES_EXOTICOS_EN:
        if re.search(rf'\b{re.escape(exotico)}\b', p_norm):
            return f"No, at ZooMAT we do not have {exotico}, as our zoo exclusively houses and preserves species native to the state of Chiapas and not exotic wildlife from other continents."
    for exotico in ANIMALES_EXOTICOS:
        if re.search(rf'\b{re.escape(exotico)}\b', p_norm):
            if idioma == 'en':
                return f"No, at ZooMAT we do not have {exotico}, as our zoo exclusively houses and preserves species native to the state of Chiapas and not exotic wildlife from other continents."
            return f"No, en el ZooMAT no contamos con {exotico}, ya que nuestro zoológico alberga y exhibe exclusivamente fauna nativa del estado de Chiapas y no especies exóticas de otros continentes."

    # 2. Extraer tokens candidatos a nombre de animal
    tokens = [t for t in re.findall(r'\b\w+\b', p_norm) if t not in PALABRAS_DESCARTADAS_EXISTENCIA and len(t) >= 4]

    # Caso de consulta general sobre si hay animales o fauna
    if tokens and all(t in {'animal', 'animales', 'fauna', 'especie', 'especies', 'animals', 'species', 'wildlife'} for t in tokens):
        if idioma == 'en':
            return "Of course! ZooMAT exclusively houses and protects wildlife native to the state of Chiapas, featuring over 200 species of birds, mammals, reptiles, and amphibians. We warmly invite you to discover them all during your tour!"
        return "¡Por supuesto! El ZooMAT alberga y protege exclusivamente fauna nativa del estado de Chiapas, con más de 200 especies de aves, mamíferos, reptiles y anfibios. ¡Te invitamos a descubrir todas las especies durante tu recorrido!"

    tokens_no_especie = {'animal', 'animales', 'fauna', 'especie', 'especies', 'animals', 'species', 'wildlife', 'desde', 'nombre', 'algo', 'solo', 'todo', 'nada', 'aqui', 'alla', 'camino', 'caminos', 'gente', 'publico'}
    tokens_animales = [t for t in tokens if t not in tokens_no_especie]

    # 3. Búsqueda en especies registradas en ChromaDB (incluyendo plurales y traducción EN -> ES)
    for token in tokens_animales:
        token_esp = ANIMALES_INGLES_A_ESP.get(token, token)
        formas = motor_rag.obtener_formas_base(token_esp)
        coincidencias = []
        for forma in formas:
            for esp_norm, esp_orig in motor_rag.ESPECIES_CONOCIDAS.items():
                toks = esp_norm.split()
                if forma == esp_norm or (toks and forma == toks[0]):
                    if esp_orig not in coincidencias:
                        coincidencias.append(esp_orig)
        if coincidencias:
            esp_nombre = formatear_nombre_especie(coincidencias[0])
            if idioma == 'en':
                return f"Yes! At ZooMAT we house and exhibit {esp_nombre}, a representative species of Chiapas wildlife. We warmly invite you to visit its exhibit during your tour!"
            if len(coincidencias) == 1:
                return f"¡Sí! En el ZooMAT contamos con {esp_nombre}, una especie representativa de la fauna de Chiapas. ¡Te invitamos cordialmente a conocer su recinto durante tu recorrido!"
            else:
                ejemplos = f"{formatear_nombre_especie(coincidencias[0])} o {formatear_nombre_especie(coincidencias[1])}"
                return f"¡Sí! En el ZooMAT albergamos y exhibimos {token} (como {ejemplos}), especies representativas de la fauna de Chiapas. ¡Te invitamos cordialmente a conocer sus recintos durante tu recorrido!"

    # 4. Búsqueda en fauna emblemática de Chiapas
    for clave, nombre_mostrado in FAUNA_CHIAPAS_EMBLEMATICA.items():
        if re.search(rf'\b{re.escape(clave)}\b', p_norm) or re.search(rf'\b{re.escape(ANIMALES_INGLES_A_ESP.get(clave, clave))}\b', p_norm):
            if idioma == 'en':
                return f"Yes! ZooMAT houses and exhibits {nombre_mostrado} as an emblematic species of Chiapas. We warmly invite you to visit its exhibit during your tour!"
            articulo = "al " + nombre_mostrado[3:] if nombre_mostrado.startswith("el ") else "a " + nombre_mostrado
            return f"¡Sí! El ZooMAT alberga y exhibe {articulo} como una especie emblemática de Chiapas. ¡Te invitamos cordialmente a conocer su recinto durante tu recorrido!"

    # 5. Especie no registrada en el zoológico
    if tokens_animales:
        animal_consultado = tokens_animales[0]
        if idioma == 'en':
            return f"We do not currently have {animal_consultado} specimens at ZooMAT. Remember that our zoo exclusively houses and preserves wildlife native to the state of Chiapas."
        return f"No contamos con ejemplares de {animal_consultado} en el ZooMAT. Recuerda que nuestro zoológico alberga y exhibe exclusivamente fauna nativa del estado de Chiapas."

    return None

def responder_fuera_de_dominio_o_especie(pregunta, idioma='es'):
    """Genera respuestas amables y precisas cuando una consulta no corresponde a la fauna de Chiapas cargada (ES / EN)."""
    p_norm = quitar_acentos(pregunta.lower())
    
    # 1. Animales no regionales / exóticos
    for exotico in ANIMALES_EXOTICOS_EN:
        if re.search(rf"\b{re.escape(exotico)}\b", p_norm):
            return "ZooMAT is a zoo dedicated exclusively to the regional wildlife of Chiapas, so we do not house exotic species from other continents."
    for exotico in ANIMALES_EXOTICOS:
        if re.search(rf"\b{re.escape(exotico)}\b", p_norm):
            if idioma == 'en':
                return "ZooMAT is a zoo dedicated exclusively to the regional wildlife of Chiapas, so we do not house exotic species from other continents."
            return "El ZooMAT es un zoológico dedicado exclusivamente a la fauna regional de Chiapas, por lo que no albergamos especies exóticas de otros continentes."

    # 2. Fauna regional de Chiapas que el ZooMAT sí alberga pero cuyas fichas aún no están en la BD digital
    for clave, nombre_mostrado in FAUNA_CHIAPAS_EMBLEMATICA.items():
        if re.search(rf"\b{re.escape(clave)}\b", p_norm):
            if any(clave in esp_norm for esp_norm in motor_rag.ESPECIES_CONOCIDAS):
                break
            if idioma == 'en':
                return (
                    f"ZooMAT protects and houses {nombre_mostrado} as an emblematic species of Chiapas; "
                    f"however, we are currently expanding its technical sheet in this digital module. "
                    f"We warmly invite you to visit its exhibit during your tour!"
                )
            return (
                f"El ZooMAT alberga y protege a {nombre_mostrado} como una especie emblemática de Chiapas; "
                f"sin embargo, en este módulo digital actualmente nos encontramos ampliando su ficha técnica. "
                f"¡Te invitamos cordialmente a conocer su recinto durante tu recorrido!"
            )

    # 3. Preguntas abiertas sobre animales o qué fauna ver (Muestreo Dinámico de la BD)
    if any(p in p_norm for p in ["animal", "animales", "especie", "especies", "fauna", "animals", "species", "wildlife"]):
        todas = obtener_especies_registradas()
        if todas:
            muestras = random.sample(todas, min(3, len(todas)))
            if idioma == 'en':
                ej_texto = ", ".join(muestras[:-1]) + f", and {muestras[-1]}" if len(muestras) > 1 else muestras[0]
                return f"ZooMAT exclusively protects wildlife native to the state of Chiapas. In this interactive module we have technical sheets for regional species such as {ej_texto}, among many others. Would you like to inquire about one of them?"
            ejemplos_texto = ", ".join(muestras[:-1]) + f" y {muestras[-1]}" if len(muestras) > 1 else muestras[0]
            return f"El ZooMAT resguarda exclusivamente fauna nativa del estado de Chiapas. En este módulo interactivo contamos con fichas de especies regionales como {ejemplos_texto}, entre muchas otras más. ¿Te gustaría consultar sobre alguna de ellas?"
        if idioma == 'en':
            return "ZooMAT exclusively protects wildlife native to the state of Chiapas. Which particular species would you like to inquire about?"
        return "El ZooMAT resguarda exclusivamente fauna nativa del estado de Chiapas. ¿Sobre qué especie en particular te gustaría consultar?"

    # 4. Totalmente fuera de dominio (matemáticas, cultura pop, música, etc.)
    if idioma == 'en':
        return "I am the official virtual guide of ZooMAT. My role is to provide information regarding Chiapas animals and your visit to the zoo. How can I assist you with species, entrance fees, schedules, or facilities?"
    return "Soy el asistente virtual oficial del ZooMAT. Mi función es brindarte información sobre los animales de Chiapas y la visita al zoológico. ¿En qué duda sobre especies, costos, horarios o instalaciones te puedo apoyar?"

def es_fuera_de_dominio(pregunta):
    """Detecta consultas manifiestamente ajenas a la misión y alcance del ZooMAT."""
    p_norm = quitar_acentos(pregunta.lower().strip())

    # Permitir preguntas filosóficas/históricas sobre la exclusividad regional del ZooMAT
    if motor_rag.es_consulta_historia(pregunta):
        return False

    # Excepciones de especies nativas cuyo nombre contiene palabras homónimas (ej. escarabajo rinoceronte, oso hormiguero)
    especies_compuestas_nativas = ["escarabajo rinoceronte", "oso hormiguero", "leon marin", "leoncillo"]
    p_sin_compuestas = p_norm
    for comp in especies_compuestas_nativas:
        p_sin_compuestas = p_sin_compuestas.replace(comp, "")

    # Permitir autocorrecciones explícitas hacia fauna nativa (ej. "el tigre de aquí... digo, el jaguar") sin trampa de taquilla
    tiene_autocorreccion_nativa = (
        any(w in p_norm for w in ["digo", "mejor dicho", "perdon", "quise decir", "o sea"])
        and any(re.search(rf'\b{re.escape(nat)}\b', p_norm) for nat in ["jaguar", "ocelote", "puma", "tapir", "quetzal", "cocodrilo", "nutria", "mono", "aguila"])
    )

    # Fauna exótica ajena a Chiapas (león, oso polar, jirafa, elefante, pingüino, etc.)
    if not tiene_autocorreccion_nativa:
        for exotico in ANIMALES_EXOTICOS + ANIMALES_EXOTICOS_EN:
            if re.search(rf'\b{re.escape(exotico)}\b', p_sin_compuestas):
                return True
    
    # Deportes y eventos deportivos (excluyendo 'tenis' cuando se refiere a calzado/vestimenta)
    es_calzado_tenis = any(c in p_norm for c in ["sandalias", "chanclas", "calzado", "zapato", "zapatos", "vestimenta", "ropa", "shorts", "traer tenis", "en tenis", "con tenis"])
    patron_deportes = r'\b(futbol|soccer|partido|mundial|champions|gol|goles|liga mx|barcelona|real madrid|america|chivas|cruz azul|pumas|messi|ronaldo|cr7|gano mexico|seleccion mexicana|quien gano|torneo|marcador|penales|nfl|super bowl|beisbol|baloncesto|nba)\b'
    if re.search(patron_deportes, p_norm) or (re.search(r'\btenis\b', p_norm) and not es_calzado_tenis):
        return True

    # Computación, software y programación
    patron_software = r'\b(python|javascript|java|c\+\+|html|css|github|docker|linux|windows|compilar|script|algoritmo|sql|programar|programacion|desarrollo web|api rest|servidor web|framework)\b'
    if re.search(patron_software, p_norm):
        return True

    # Política, elecciones y países lejanos no relacionados
    patron_politica = r'\b(presidente|elecciones|politica|gobernador|senador|diputado|partido politico|votar|eleccion|guerra en ucrania|rusia|ucrania|china|francia|alemania|espana|estados unidos|quien descubrio america|segunda guerra)\b'
    if re.search(patron_politica, p_norm):
        if not any(k in p_norm for k in ["zoologico", "zoomat", "parque", "fundacion", "fundador", "proyecto", "pascacio", "palacios", "historia", "creacion", "origen"]):
            return True

    # Cultura pop, cine, música y farándula
    patron_cultura = r'\b(avengers|marvel|hollywood|pelicula|peliculas|cine|serie|series|netflix|cancion|canciones|cantante|musica|album|shakira|bad bunny|taylor swift|peso pluma|estreno de la pelicula)\b'
    if re.search(patron_cultura, p_norm):
        return True

    # Matemáticas o cálculos explícitos
    patron_mate = r'(\b\d+\s*[\+\-\*/\^]\s*\d+\b|\braiz cuadrada\b|\bcuanto es \d+|\bsuma \d+|\bresta \d+|\bmultiplica \d+)'
    if re.search(patron_mate, p_norm):
        return True

    # Otros zoológicos no relacionados con Chiapas
    patron_otros_zoos = r'\b(chapultepec|zoologico de guadalajara|africam safari|san diego zoo|bronx zoo|bioparque)\b'
    if re.search(patron_otros_zoos, p_norm):
        return True

    # Preguntas personales / existenciales dirigidas al asistente
    patron_asistente_personal = r'\b(sales ahi|sales tu|tienes novia|tienes novio|te gusta alguien|donde vives tu|cuantos anos tienes tu|que edad tienes tu|que opinas de|que piensas de|eres real|tienes sentimientos|te puedo besar|quieres ser mi)\b'
    if re.search(patron_asistente_personal, p_norm):
        return True

    return False

def procesar_logica_hibrida(pregunta, idioma='es'):
    """Contiene la lógica de enrutamiento RAG y MySQL blindada contra fugas y falsos positivos (ES / EN)."""
    p_norm_clean = re.sub(r'[^\w\s]', '', quitar_acentos(pregunta.lower())).strip()

    # PASO 1: Saludo, despedida o texto basura
    respuesta_rapida = verificar_interaccion_basica(pregunta, idioma=idioma)
    if respuesta_rapida:
        return respuesta_rapida

    # PASO 1.5: Fast-Path para sugerencias rápidas fijas
    texto_sugerencia, _ = verificar_sugerencia_rapida(pregunta, idioma=idioma)
    if texto_sugerencia:
        return texto_sugerencia

    # PASO 1.6: Blindaje contra entradas fuera de contexto (Out-of-Domain)
    if es_fuera_de_dominio(pregunta):
        return responder_fuera_de_dominio_o_especie(pregunta, idioma=idioma)

    # PASO 1.7: Intercepción de consultas combinadas o ultra-ambiguas sin sujeto
    if p_norm_clean in {"que comen aqui", "que se come aqui", "que comen", "what do they eat here", "what do animals eat here"}:
        if idioma == 'en':
            return "At ZooMAT we exclusively protect native wildlife from Chiapas, and each species follows a specialized biological diet. Please tell me which Chiapas animal you would like to know about, or remember our food kiosks open at 09:00 hours and feeding animals is prohibited."
        return "En el ZooMAT protegemos exclusivamente fauna nativa de Chiapas y cada especie cuenta con una dieta biológica especializada. Dime el nombre de algún animal específico para contarte de su alimentación, o recuerda que los kioscos de comida abren a las 09:00 horas y está prohibido alimentar a los ejemplares."

    if "biblioteca" in p_norm_clean and any(c in p_norm_clean for c in ["cuesta", "costo", "pagar", "gratis", "precio", "boleto", "cost", "free", "ticket"]) and any(h in p_norm_clean for h in ["hora", "abre", "horario", "dias", "hours", "open"]):
        if idioma == 'en':
            return "Access to the ZooMAT scientific library is completely free without purchasing a zoo ticket by registering with an ID at the security booth, and it is open Tuesday through Friday from 09:00 to 15:00 hours."
        return "El acceso a la biblioteca del ZooMAT es completamente gratuito y puedes ingresar sin pagar boleto del zoológico registrándote en la caseta de vigilancia con una identificación, y brinda atención al público de martes a viernes de 09:00 a 15:00 horas."

    # PASO 1.8: Consultas de catálogo general de especies o definiciones
    catalogo_resp = consultar_catalogo_general(pregunta, idioma=idioma)
    if catalogo_resp:
        return catalogo_resp

    # PASO 1.9: Consultas directas sobre existencia de fauna
    existencia_resp = responder_consulta_existencia_animal(pregunta, idioma=idioma)
    if existencia_resp:
        return existencia_resp

    # PASO 2: Detección jerárquica de ruta (Historia -> Logística prioritaria -> Especies RAG -> Resto)
    decision_semantica = enrutador_semantico.analizar_intencion(pregunta)
    especie_detectada = motor_rag.detectar_especie(pregunta)

    if decision_semantica.get("entidad") == "institucional":
        decision = decision_semantica
    elif decision_semantica.get("ruta") == "mysql" and (
        (decision_semantica.get("entidad") == "ubicacion" and decision_semantica.get("tipo") == "baños")
        or decision_semantica.get("entidad") in {"regla", "boleto"}
        or (decision_semantica.get("entidad") == "servicio" and decision_semantica.get("tipo") in {"recorrido_nocturno", "guiado_diurno", "aforo", "curadores"})
        or (decision_semantica.get("entidad") == "horario")
    ):
        decision = decision_semantica
    elif especie_detectada:
        decision = {"ruta": "rag"}
    else:
        p_norm = quitar_acentos(pregunta.lower())
        fauna_especial = [
            "leon", "leona", "leones", "elefante", "elefantes", "jirafa", "jirafas",
            "rinoceronte", "rinocerontes", "rinocero", "hipopotamo", "hipopotamos", "cebra", "cebras",
            "canguro", "canguros", "oso polar", "pinguino", "pinguinos", "tigre", "tigres",
            "lobo", "lobos", "panda", "pandas", "gorila", "gorilas", "chimpance", "chimpances",
            "jaguar", "jaguares", "ocelote", "ocelotes", "tapir", "tapires", "quetzal", "quetzales",
            "guacamaya", "guacamayas", "mono arana", "saraguato", "nutria", "nutrias", "aguila", "pavon",
            "lion", "lions", "elephant", "elephants", "giraffe", "giraffes", "zebra", "zebras",
            "polar bear", "penguin", "penguins", "tiger", "tigers", "monkey", "crocodile"
        ]
        if any(re.search(rf"\b{f}\b", p_norm) for f in fauna_especial):
            decision = {"ruta": "rag"}
        else:
            decision = decision_semantica
        
    respuesta_ia = "" 

    # PASO 3: Ejecución en MySQL (con caída de respaldo a RAG si fue un falso positivo)
    if decision["ruta"] == "mysql":
        if idioma == 'en':
            dato_en = DATOS_LOGISTICA_EN.get((decision["entidad"], decision["tipo"]))
            if dato_en:
                return dato_en

        dato_exacto = motor_mysql.consultar_logistica(decision["entidad"], decision["tipo"])
        if dato_exacto:
            return dato_exacto
        else:
            palabras_logisticas = [
                "precio", "costo", "cuanto", "horario", "abren", "cierran", "boleto", "taquilla",
                "estacionamiento", "baño", "bano", "banos", "sanitario", "ubicacion", "direccion",
                "regla", "servicio", "historia", "fundacion", "fundador", "creacion",
                "schedule", "ticket", "price", "cost", "hours", "parking", "restroom", "restrooms",
                "rules", "service", "services", "history", "founded"
            ]
            if any(palabra in quitar_acentos(pregunta.lower()) for palabra in palabras_logisticas):
                if idioma == 'en':
                    return "I do not have that logistical information in my official records. Please inquire directly at the ticket office."
                return "No cuento con ese dato logístico en mis registros oficiales. Por favor, consulta directamente en taquilla."
            else:
                print("[INFO] Redirigiendo de MySQL a RAG por ausencia de datos logisticos...")
                decision["ruta"] = "rag"

    # PASO 4: Ejecución en RAG (Búsqueda Biológica y Control de Datos Faltantes)
    if decision["ruta"] == "rag":
        contexto_zoomat = motor_rag.buscar_contexto(pregunta)
        if contexto_zoomat:
            # Solo remover la línea de plantilla en Dieta si el resto del documento sí detalla presas o alimentación (ej. Hábitos)
            ctx_sin_dieta_vacia = re.sub(r'Dieta:\s*No se contiene informaci[oó]n acerca de esto\.?\s*', '', contexto_zoomat, flags=re.IGNORECASE)
            if any(k in quitar_acentos(ctx_sin_dieta_vacia) for k in ["presas", "se alimenta", "comen ", "consume ", "cazan", "frugivor", "carnivor", "fitofag", "depredador"]):
                contexto_zoomat = ctx_sin_dieta_vacia
            ctx_sin_cat_vacia = re.sub(r'Categoria:\s*No se contiene informaci[oó]n acerca de esto\.?\s*', '', contexto_zoomat, flags=re.IGNORECASE)
            if any(k in quitar_acentos(ctx_sin_cat_vacia) for k in ["nom-059", "iucn", "uicn", "cites", "peligro de extincion", "preocupacion menor", "amenazada"]):
                contexto_zoomat = ctx_sin_cat_vacia
        
        # CANDADO DINÁMICO: Si no es una especie registrada del ZooMAT y la palabra buscada no existe en el fragmento
        if not contexto_zoomat or (not especie_detectada and not contexto_es_relevante(pregunta, contexto_zoomat)):
            return responder_fuera_de_dominio_o_especie(pregunta, idioma=idioma)

        # CANDADO ANTI-ALUCINACIÓN DE LONGEVIDAD: Detecta preguntas de tiempo/años de vida sin datos de longevidad
        preg_norm_sin_acentos = quitar_acentos(pregunta.lower())
        ctx_norm_sin_acentos = quitar_acentos(contexto_zoomat.lower())
        pide_longevidad = re.search(
            r'\b(cuantos?\s+anos?\s+vive|cuanto\s+tiempo\s+vive|longevidad|esperanza\s+de\s+vida|edad\s+maxima|how\s+long\s+(?:does|do)\b.*?\blive|lifespan)\b',
            preg_norm_sin_acentos
        )
        tiene_datos_longevidad = re.search(
            r'\b(ano|anos|longevidad|esperanza\s+de\s+vida|tiempo\s+de\s+vida|ciclo\s+de\s+vida|vive(?:n)?\s+(?:entre|hasta|aproximadamente|de|alrededor|\d+)|vida\s+(?:de\s+)?\d+|lifespan|years?)\b',
            ctx_norm_sin_acentos
        )
        falta_longevidad = bool(pide_longevidad and not motor_rag.es_consulta_historia(pregunta) and not tiene_datos_longevidad)

        if idioma == 'en':
            reglas_rag = "You are the official virtual guide of ZooMAT. You answer biological questions about animals of Chiapas strictly based on the provided official database fragment."
            prompt_usuario = f"""OFFICIAL DATABASE FRAGMENT:
{contexto_zoomat}

VISITOR INQUIRY: "{pregunta}"

MANDATORY INSTRUCTIONS:
- Answer directly to the visitor inquiry in English in a friendly, natural, and informative tone using exclusively the facts from the fragment.
- MULTI-SPECIES DISAMBIGUATION: If the fragment contains sheets for multiple related species (e.g. different chachalacas, monkeys, eagles, crocodiles, or scorpions), synthesize the answer clearly mentioning which specific ZooMAT species each fact belongs to.
- STRICT BIOLOGICAL SYNONYMS: Terms like "food", "feed", "prey", "diet", "feeding", and "what it eats" are strictly equivalent. If the fragment mentions any of them (e.g. "Alimentation: ..."), answer the species diet. Likewise, "where it lives", "distribution", and "habitat" are equivalent; and "how long it lives", "age", "how old", and "lifespan" ask strictly for lifetime duration (never substitute with habitat).
- HISTORY AND INSTITUTION: If the visitor asks about the history, founding, origins, or creators of ZooMAT, answer with the facts and dates documented in the fragment (questions like "since when does it exist", "when did it open", or "founding year" are answered directly with the documented founding year 1942 without claiming the fact is missing).
- AMPHIBIAN MYTHS AND SCIENCE: If the visitor asks about popular myths or beliefs regarding frogs, toads, or amphibians, explicitly debunk what is false and explain the documented scientific truth strictly based on the fragment.
- HYBRID QUESTIONS (BIOLOGY + HISTORY): Answer both facets directly and concisely within 2 to 3 sentences without introductory filler phrases.
- SPECIFIC QUESTION: If the visitor asks for a concrete fact about wildlife (e.g. diet, habitat, size, distribution, or characteristics) and that fact appears in the text, answer it accurately.
- EXISTENCE OR PRESENCE: If the visitor asks whether the zoo has, houses, or exhibits the animal, confirm that ZooMAT does house the species and warmly invite them to see its exhibit.
- MISSING FACT: If the visitor asks for a concrete fact (biological, historical, numerical, financial, or construction detail, such as diet, lifespan, cost, budget, workers, exact dates not mentioned, or numbers) that does NOT appear in the text or says "No se contiene información", NEVER invent or guess from general biological knowledge; answer ONLY: "I apologize, in my official ZooMAT records I do not have specific information regarding that fact." NEVER start with "I apologize" when useful facts ARE present in the fragment.
- GENERAL INQUIRY OR NAME: If the visitor only provided the name of the animal or asked for general information, provide a brief descriptive summary based on the fragment.
- NO META-LANGUAGE: NEVER write explanations in parentheses, justifications, or meta-comments. Answer directly to the public without instruction headers.
- 24-HOUR FORMAT SCHEDULES: ALWAYS express any schedule, hour, opening, closing, or tour time in strict 24-hour format (e.g. "09:00 to 16:00 hours", "16:00 hours", "18:00 hours", "19:00 and 20:00 hours"). NEVER use 12-hour format ("9:00", "4:00", "6:00") and NEVER add suffixes like "a.m.", "p.m.", "am", "pm", "de la mañana", "de la tarde" or "de la noche".
- FORMAT FOR VOICE: Write in ONE SINGLE continuous paragraph (STRICTLY maximum 3 to 4 brief sentences), without lists, without bullet points, without asterisks, without quotation marks, and without asking questions at the end. Spell out measurement units in full ("millimeters", "centimeters", "meters").

Direct answer to visitor:"""
            respuesta_ia = preguntar_a_llama(prompt_usuario, reglas_rag)
            if falta_longevidad and not respuesta_ia.startswith("__MOCK_RAG__|"):
                respuesta_ia = "I apologize, in my official ZooMAT records I do not have specific information regarding the lifespan of this species."
        else:
            reglas_rag = "Eres el asistente virtual oficial del ZooMAT. Respondes dudas biológicas sobre animales de Chiapas basándote estrictamente en el fragmento oficial proporcionado."
            prompt_usuario = f"""FRAGMENTO DE BASE DE DATOS OFICIAL:
{contexto_zoomat}

CONSULTA DEL VISITANTE: "{pregunta}"

INSTRUCCIONES OBLIGATORIAS:
- Responde directamente a la consulta del visitante de manera amable, fluida y natural usando exclusivamente los datos del fragmento.
- DESAMBIGUACIÓN MULTI-ESPECIE: Si el fragmento incluye información de varias especies emparentadas (por ejemplo distintas chachalacas, monos, águilas, cocodrilos, alacranes o armadillos), integra la respuesta aclarando explícitamente a qué especies registradas del ZooMAT corresponde cada dato.
- SINÓNIMOS BIOLÓGICOS Y PRESAS: Los términos "comida", "alimento", "presas", "alimentación", "qué come" y "dieta" son estrictamente equivalentes. Si el documento dice "Dieta: No se contiene información" pero en la sección de Hábitos u otra parte del texto describe sus presas o lo que caza (por ejemplo, mamíferos arborícolas, monos, aves, reptiles), DEBES responder con esas presas como su comida y alimentación. De igual modo, "dónde vive", "distribución" y "hábitat" son equivalentes; en cambio, "años que vive", "edad" y "longevidad" preguntan SOLO por duración de vida y NO deben sustituirse por hábitat.
- HISTORIA E INSTITUCIÓN: Si el visitante pregunta sobre la historia, fundación, antecedentes o creadores del ZooMAT, responde con los hechos y fechas documentados en el fragmento (preguntas como "desde cuándo existe", "cuándo abrió" o "año de inicio" se responden directamente con el año de fundación documentado 1942 sin decir que falta el dato).
- MITOS Y CIENCIA DE ANFIBIOS: Si el visitante pregunta por mitos, leyendas o creencias populares sobre sapos, ranas o anfibios, desmiente explícitamente lo que sea falso y explica la realidad científica o importancia ecológica documentada en el fragmento sin inventar datos.
- PREGUNTAS HÍBRIDAS (BIOLOGÍA + HISTORIA): Responde ambas partes directamente en un máximo de 2 o 3 oraciones concisas, sin introducciones ni disculpas iniciales.
- PREGUNTA ESPECÍFICA: Si el visitante pregunta por un dato concreto de fauna (ej. qué come, dónde vive, cuánto mide, su distribución o características) y ese dato aparece en el texto, respóndelo con exactitud.
- EXISTENCIA O PRESENCIA: Si el visitante pregunta si el zoológico tiene, alberga o exhibe al animal, responde afirmativamente confirmando que el ZooMAT sí cuenta con la especie y te invita cordialmente a conocer su recinto.
- DATO FALTANTE (PROHIBIDO USAR CONOCIMIENTO PREVIO): Si el visitante pregunta por un dato concreto (como dieta, longevidad, alimentación, categoría, medidas, costos, presupuestos, albañiles o fechas) que NO aparece en el fragmento o indica literalmente "No se contiene información", NUNCA supongas ni deduzcas datos de biología general (no inventes que comen insectos o plantas); responde ÚNICAMENTE: "Lo siento, en mis registros oficiales del ZooMAT no cuento con información específica sobre ese dato." Está ESTRICTAMENTE PROHIBIDO agregar resúmenes generales, hábitat o datos no solicitados cuando el dato pedido no existe.
- CONSULTA GENERAL O NOMBRE: Si el visitante escribió solo el nombre del animal o pidió información general sobre él, brinda un resumen descriptivo breve de la especie basado en el fragmento.
- PROHIBIDO META-LENGUAJE Y RAZONAMIENTO: NUNCA escribas explicaciones entre paréntesis, justificaciones ni menciones al "fragmento" o a "la consulta del visitante". Da directamente la respuesta al público sin prefijos de encabezado ni etiquetas.
- FORMATO DE 24 HORAS OBLIGATORIO: SIEMPRE expresa cualquier horario, hora de apertura, cierre, taquilla o recorridos en formato estricto de 24 horas (ejemplo: "09:00 a 16:00 horas", "16:00 horas", "18:00 horas", "19:00 y 20:00 horas"). NUNCA uses formato de 12 horas ("9:00", "4:00", "6:00") y NUNCA agregues sufijos como "a.m.", "p.m.", "am", "pm", "de la mañana", "de la tarde" ni "de la noche".
- FORMATO PARA VOZ: Redacta en UN SOLO PÁRRAFO breve y continuo (ESTRICTAMENTE máximo 3 o 4 oraciones concisas), sin listas, sin viñetas, sin asteriscos, sin comillas envolventes y sin hacer preguntas al final. Escribe las unidades de medida completas ("milímetros", "centímetros", "metros").

Respuesta directa al visitante:"""
            respuesta_ia = preguntar_a_llama(prompt_usuario, reglas_rag)
            if falta_longevidad and not respuesta_ia.startswith("__MOCK_RAG__|"):
                respuesta_ia = "Lo siento, en mis registros oficiales del ZooMAT no cuento con información específica sobre la longevidad o años de vida de esta especie."
            
    return respuesta_ia

# --- Endpoints Web ---
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/chat', methods=['POST'])
def chat():
    # 0. Idioma solicitado (es / en)
    idioma = request.form.get('idioma', '').strip().lower() or 'es'
    if idioma not in ['es', 'en']:
        idioma = 'es'

    # Auto-detección de idioma por vocabulario inconfundible
    if 'pregunta' in request.form:
        p_raw = request.form.get('pregunta', '').lower().strip()
        tokens_en_claros = {"what", "where", "how", "when", "why", "who", "which", "ticket", "tickets", "admission", "hours", "schedule", "restroom", "restrooms", "bathroom", "bathrooms", "price", "prices", "open", "close", "cost", "costs"}
        tokens_es_claros = {"que", "donde", "cuanto", "cuanta", "cuantos", "cuantas", "cuando", "quien", "quienes", "horario", "horarios", "boleto", "boletos", "entrada", "entradas", "banos", "baño", "baños", "costo", "costos", "precio", "precios", "abren", "cierran"}
        p_palabras = set(re.findall(r'\b\w+\b', quitar_acentos(p_raw)))
        if idioma == 'es' and len(p_palabras & tokens_en_claros) >= 2 and len(p_palabras & tokens_es_claros) == 0:
            idioma = 'en'
        elif idioma == 'en' and len(p_palabras & tokens_es_claros) >= 2 and len(p_palabras & tokens_en_claros) == 0:
            idioma = 'es'

    # 1. Verificar si recibimos texto o audio
    pregunta = ""
    if 'audio' in request.files:
        archivo_audio = request.files['audio']
        ruta_webm = "uploads/temp.webm"
        archivo_audio.save(ruta_webm)
        pregunta = transcribir_audio_subido(ruta_webm, idioma=idioma)
        if not pregunta:
            msg_error = "Could not understand the audio. Please try again." if idioma == 'en' else "No pude entender el audio. Por favor intenta de nuevo."
            return jsonify({"error": msg_error})
    else:
        pregunta = request.form.get('pregunta', '')

    if not pregunta:
        msg_vacio = "Empty inquiry." if idioma == 'en' else "Consulta vacía."
        return jsonify({"error": msg_vacio})

    inicio_tiempo = time.time()

    # FAST-PATH: Sugerencias rápidas predefinidas con audio estático instantáneo (< 0.01s)
    respuesta_sugerencia, audio_sugerencia = verificar_sugerencia_rapida(pregunta, idioma=idioma)
    if respuesta_sugerencia:
        tiempo_respuesta = time.time() - inicio_tiempo
        registrar_log(pregunta, respuesta_sugerencia, tiempo_respuesta, idioma=idioma)
        return jsonify({
            "pregunta_transcrita": pregunta,
            "respuesta": respuesta_sugerencia,
            "audio_url": f"/assets/{audio_sugerencia}",
            "tiempo_respuesta": f"{tiempo_respuesta:.2f}s"
        })

    # 2. Procesar con Llama y RAG/MySQL
    respuesta_ia = procesar_logica_hibrida(pregunta, idioma=idioma)
    tiempo_respuesta = time.time() - inicio_tiempo
    registrar_log(pregunta, respuesta_ia, tiempo_respuesta, idioma=idioma)

    # 3. Generar audio con el sistema Híbrido en la nube
    nombre_audio = f"respuesta_{idioma}.mp3" if idioma == 'en' else "respuesta.mp3"
    asyncio.run(generar_audio_hibrido(respuesta_ia, nombre_audio, idioma=idioma))

    # 4. Devolver respuesta al frontend
    return jsonify({
        "pregunta_transcrita": pregunta,
        "respuesta": respuesta_ia,
        "audio_url": f"/assets/{nombre_audio}",
        "tiempo_respuesta": f"{tiempo_respuesta:.2f}s"
    })

def regenerar_audios_estaticos():
    """Regenera los audios de sugerencias rápidas tanto en español como en inglés."""
    for tipo, item in SUGERENCIAS_RAPIDAS.items():
        print(f"[INFO] Generando {item['audio']} (ES) para {tipo}...")
        asyncio.run(generar_audio_hibrido(item["texto"], item["audio"], idioma='es'))
    for tipo, item in SUGERENCIAS_RAPIDAS_EN.items():
        print(f"[INFO] Generando {item['audio']} (EN) para {tipo}...")
        asyncio.run(generar_audio_hibrido(item["texto"], item["audio"], idioma='en'))
    print("[EXITO] Audios de sugerencias rápidas sincronizados (ES + EN).")

if __name__ == '__main__':
    if len(sys.argv) > 1 and sys.argv[1] == '--regenerar-audios':
        regenerar_audios_estaticos()
    else:
        debug = os.getenv('CHATBOT_DEBUG', '').lower() in {'1', 'true', 'yes'}
        port  = int(os.getenv('CHATBOT_PORT', 5000))
        app.run(host='0.0.0.0', port=port, debug=debug)
import spacy
import re
import unicodedata
from motor_mysql import obtener_catalogo_logistica

# Cargar el modelo de Procesamiento de Lenguaje Natural en español
try:
    nlp = spacy.load("es_core_news_sm")
except OSError:
    print("Error: No se encontró el modelo de spaCy. Ejecuta: python -m spacy download es_core_news_sm")
    nlp = None


def normalizar_texto(texto):
    """Normaliza texto removiendo diacríticos y convirtiendo a minúsculas."""
    texto_normalizado = unicodedata.normalize("NFD", texto.lower())
    return "".join(
        caracter for caracter in texto_normalizado
        if unicodedata.category(caracter) != "Mn"
    )


def coincide_palabra_clave(palabra, pregunta, lemas_usuario):
    """Verifica si una palabra clave coincide exactamente por lema o delimitador de palabra."""
    palabra_normalizada = normalizar_texto(palabra)
    if palabra_normalizada in lemas_usuario:
        return True

    pregunta_normalizada = normalizar_texto(pregunta)
    patron = rf"(?<!\w){re.escape(palabra_normalizada)}(?!\w)"
    return re.search(patron, pregunta_normalizada) is not None


# Vocabulario base para categorías logísticas
INTENCIONES_BASE = {
    "horario": [
        "horario", "horarios", "hora", "horas", "abrir", "abren", "abierto",
        "apertura", "cerrar", "cierran", "cierra", "cierre", "semana",
        "lunes", "martes", "miércoles", "miercoles", "jueves", "viernes",
        "sábado", "sabado", "domingo", "fin de semana", "entre semana",
        "qué hora", "a que hora", "a qué hora", "cuando abren", "cuándo abren",
        "cuando cierran", "cuándo cierran", "hasta que hora", "hasta qué hora",
        "desde que hora", "desde qué hora", "hora de entrada", "tiempo de visita",
        "cuánto dura", "cuanto dura", "duración", "duracion", "que dias abren",
        "dias abren", "dias de atencion", "salida máxima", "salida maxima",
        "schedule", "hours", "opening hours", "open", "opens", "close", "closes",
        "closing", "what time", "when do you open", "when do you close", "tour duration",
        "duration", "how long"
    ],
    "boleto": [
        "boleto", "boletos", "ticket", "tickets", "entrada", "entradas",
        "admisión", "admision", "acceso", "pase", "pases", "costo", "costos",
        "precio", "precios", "tarifa", "tarifas", "cuánto cuesta", "cuanto cuesta",
        "cuánto vale", "cuanto vale", "valor", "pagar", "pago", "paga", "pagan", "cobrar", "cobro", "cobran",
        "comprar", "compra", "venta", "taquilla", "boletería", "boleteria",
        "descuento", "descuentos", "promoción", "promocion", "rebaja", "gratis", "gratuito",
        "credencial", "prepa", "preparatoria", "bachillerato",
        "admission", "admission fee", "admission fees", "prices", "how much",
        "fee", "fees", "discounts", "free", "pay", "cost for students", "student ticket"
    ],
    "ubicacion": [
        "ubicación", "ubicacion", "ubicado", "ubicada", "ubicados",
        "dónde", "donde", "mapa", "dirección", "direccion", "domicilio", "localización", "localizacion", "lugar",
        "sitio", "zona", "área", "area", "sección", "seccion", "quedar", "queda",
        "quedan", "está", "esta", "están", "estan", "llegar", "llego", "llegada",
        "cómo llego", "como llego", "cómo llegar", "como llegar", "camino", "ruta",
        "cerca", "lejos", "entrada principal", "acceso principal",
        "location", "where is", "where are", "address", "how to get",
        "restroom", "restrooms", "bathroom", "bathrooms", "toilet", "toilets", "wc"
    ],
    "regla": [
        "regla", "reglas", "norma", "normas", "reglamento", "reglamentos", "política", "politica",
        "políticas", "politicas", "prohibido", "prohibida", "prohibición",
        "prohibicion", "permitido", "permitida", "permiten", "se puede", "puedo",
        "dejar", "llevar", "meter", "entrar con", "ingresar con", "acceso con",
        "restricción", "restriccion", "restricciones", "limitación", "limitacion",
        "no se permite", "no dejan", "qué puedo llevar", "que puedo llevar",
        "qué no puedo llevar", "que no puedo llevar",
        "rule", "rules", "allowed", "prohibited", "forbidden", "can i bring",
        "can i enter with", "pet", "pets", "dog", "dogs", "cat", "cats",
        "alcohol", "beer", "stroller", "strollers", "plastics", "touch", "feed"
    ],
    "servicio": [
        "servicio", "servicios", "atención", "atencion", "información", "informacion",
        "módulo", "modulo", "ayuda", "asistencia", "guía", "guia", "guías", "guias",
        "recorrido", "tour", "visita guiada",
        "service", "services", "guided tour", "night tour", "day tour",
        "guide", "guides", "library", "gift shop", "souvenirs"
    ]
}

# Palabras clave oficiales y afinadas para los registros estándar del ZooMAT
PALABRAS_CLAVE_OFICIALES = {
    ('horario', 'general'): 'horario, horarios, hora, horas, abrir, abren, abierto, apertura, semana, que dias abren, dias de atencion, toda la semana, dejar entrar, nos vemos manana, schedule, hours, opening hours, what time do you open, when do you open, what days are you open',
    ('horario', 'cierre'): 'cierre, cerrar, cierran, cierra, hora de cierre, salida, hora de salida, hasta que hora, hora maxima, a que hora cierran, salir, nos corren, ya estamos adentro, dejan pasar, todavia me venden, closing time, what time do you close, when do you close, exit time, park close',
    ('horario', 'recorrido'): 'recorrido, duracion, cuanto dura, tiempo dura, tarda, tiempo de visita, cuanto tiempo, en cuanto tiempo se recorre, tiempo del recorrido, how long does the tour take, tour duration, visit time, how long is the tour',
    ('horario', 'biblioteca'): 'horario biblioteca, que dias abre la biblioteca, que dias atienden en la biblioteca, a que hora abre la biblioteca, atencion biblioteca, horario de la biblioteca',
    ('horario', 'tienda'): 'horario tienda, a que hora abre la tienda, a que hora cierra la tienda, atencion tienda, comprar recuerdos, recuerdos a la tienda, pasar a comprar recuerdos',
    ('horario', 'comida'): 'horario comida, a que hora abren los restaurantes, horario restaurante, a que hora abren los kioscos, venden comida, a que hora comen, comida alla adentro, horario de comida',

    ('boleto', 'general'): 'boleto, boletos, ticket, tickets, entrada, entradas, admision, acceso, pase, costo, costos, precio, precios, tarifa, tarifas, cuanto cuesta, cuanto vale, valor, pagar, pago, cobran, cobrar, cobro, comprar, compra, venta, taquilla, entrance fee, admission fee, ticket price, general admission, adult ticket, how much is admission',
    ('boleto', 'adulto'): 'adulto, adultos, personas adultas, boleto adulto, costo adulto, entrada adulto, adulto normal, sin descuentos, adult, adults, adult ticket, adult admission',
    ('boleto', 'estudiante'): 'estudiante, estudiantes, alumno, alumnos, escolar, colegial, credencial de estudiante, credencial escolar, universidad, prepa, preparatoria, bachillerato, secundaria, student, students, student discount, student id, student credential',
    ('boleto', 'profesor'): 'profesor, profesores, maestro, maestros, docente, docentes, magisterio, teacher, teachers, teacher discount, teacher credential',
    ('boleto', 'inapam'): 'inapam, insen, tercera edad, adulto mayor, adultos mayores, anciano, ancianos, jubilado, jubilados, pensionado, pensionados, abuelito, abuelita, abuelitos, abuelos, senil, senior, seniors, elderly, retired, senior citizen, senior discount',
    ('boleto', 'niño'): 'niño, niños, nina, ninas, nin, menor, menores, estatura, altura, un metro, metro, centimetros, infantil, bebe, menores de un metro, child, children, kids, kid, under one meter, height, baby',
    ('boleto', 'martes'): 'martes, martes del pueblo, martes gratis, gratis los martes, ine, ine chiapas, chiapaneco, chiapanecos, chiapaneca, residentes chiapas, licencia de conducir, sustituir, tuesday, free tuesday, free on tuesday, tuesdays',
    ('boleto', 'credencial_desconocida'): 'insem, issemym, imss, issste, convenio, convenios, sindicato, descuento credencial, alguna credencial',
    ('boleto', 'escuelas'): 'escuela, escuelas, escuela publica, escuelas publicas, escuelas privadas, colegio, colegios, particulares, oficio, exoneracion, visita escolar, viaje escolar',
    ('boleto', 'biblioteca'): 'biblioteca gratis, boleto biblioteca, pagar boleto del zoologico, caseta 1, entrada biblioteca, acceso biblioteca, caseta de vigilancia, consultar un libro',

    ('servicio', 'guiado_diurno'): 'tour guiado, tours guiados, recorrido guiado, recorridos guiados, visita guiada, guia, guias, guia diurno, guia turistico, alguien que nos explique, asignar alguien, guided tour, guided tours, tour guide, day tour',
    ('servicio', 'recorrido_nocturno'): 'recorrido nocturno, recorridos nocturnos, tour nocturno, tours nocturnos, de noche, en la noche, visita nocturna, visitas nocturnas, caminatas en la oscuridad, recorridos de noche, nocturno, night tour, night tours, evening tour, night visit',
    ('servicio', 'biblioteca'): 'biblioteca, libros, sala de lectura, investigacion',
    ('servicio', 'tienda'): 'tienda, souvenirs, recuerdos, artesanias, regalos, comprar recuerdo, playeras, llaveros',
    ('servicio', 'curadores'): 'curador, curadores, biologo, biologos, entrevistar a un biologo, entrevista, entrevistas, proyecto escolar, area de difusion',
    ('servicio', 'aforo'): 'aforo, cupo, limite de personas, limite de visitantes, limite de gente, mucha gente, lleno, llena el cupo, aglomeracion, cupo limite, mucha afluencia',

    ('regla', 'mascotas'): 'mascota, mascotas, perro, perros, perrito, perrita, chihuahua, cachorro, gato, gatos, animal de compania, animal de compañia, pet, pets, dog, dogs, puppy, cat, cats, companion animal',
    ('regla', 'alcohol'): 'alcohol, cerveza, vino, licor, bebida alcoholica, bebidas alcoholicas, ebrio, tomar, chela, chelas, borracho, embriagante, hielera, beer, wine, liquor, alcoholic beverages, drinking, drunk',
    ('regla', 'plasticos'): 'plastico, plasticos, unicel, desechable, desechables, envases desechables, botellas desechables, cero plasticos, bolsas de plastico, popotes, quitan envases, plastic, plastics, styrofoam, single use plastics, plastic bags',
    ('regla', 'carriolas'): 'carriola, carriolas, llantas de plastico, llantas de goma, carriola de bebe, carreola, carreolas, ruedas de plastico, ruedas rigidas, rueditas rigidas, ruedas de goma, ruedas de hule, stroller, strollers, plastic wheels, rubber wheels, baby stroller',
    ('regla', 'vestimenta'): 'ropa, vestimenta, calzado, zapato, zapatos, tenis, sandalias, chanclas, shorts, antiderrapante, que ropa llevar, como ir vestido',
    ('regla', 'tocar_animales'): 'tocar, tocar animales, puedo tocar, acariciar, agarrar animales, manipular fauna, meto la mano, meter la mano, en la reja, morder, mordedura, muerde, mordio, touch animals, pet animals, handle wildlife, touch the animals',
    ('regla', 'alimentar_animales'): 'alimentar animales, dar de comer, darle comida, darles de comer, dar comida a los animales, prohibido alimentar, dar comida, comida para animales, aventarles, darle fruta, cachitos de pan, feed animals, feed the animals, give food, feeding animals',
    ('regla', 'andadores'): 'andador, andadores, sendero, senderos, camino pavimentado, salirse del camino, sendero peatonal',
    ('regla', 'daños'): 'danar, danar las instalaciones, grafitear, pintar, rayar, graffiti, vandalismo, destruir, sancion',

    ('ubicacion', 'general'): 'ubicacion, donde esta, donde queda, en que parte, direccion, domicilio, como llegar, localizacion, mapa, zapotal, cerro hueco, location, where is the zoo, how to get there, address, where is zoomat',
    ('ubicacion', 'baños'): 'bano, banos, bano publico, banos publicos, sanitario, sanitarios, wc, modulos de wc, toilet, sanitarios publicos, casa blanca, plaza monos, banos por, sanitario mas cerca, bathroom, bathrooms, restroom, restrooms, toilets',
    ('ubicacion', 'transporte'): 'transporte, colectivo, colectivos, combi, combis, camion, ruta, parada de transporte, transporte publico'
}

# Estructuras dinámicas pobladas desde la base de datos o memoria
INTENCIONES_LOGISTICA = {}
MAPA_SUBTIPOS = {}

palabras_fuertes_boleto = [
    "gratis", "gratuito", "costo", "costos", "precio", "precios",
    "cobro", "cobran", "cobrar", "tarifa", "tarifas", "boleto",
    "boletos", "entrada", "entradas", "descuento", "descuentos", "rebaja",
    "cuanto cuesta", "cuánto cuesta", "cuanto vale", "cuánto vale", "pagar", "paga", "pagan",
    "credencial", "prepa", "preparatoria", "bachillerato",
    "ticket", "tickets", "admission", "cost", "price", "fee", "free", "discount"
]

palabras_fuertes_regla = [
    "mascota", "mascotas", "perro", "perros", "perrito", "perrita", "chihuahua", "cachorro",
    "gato", "gatos", "animal de compania", "animal de compañia",
    "alcohol", "cerveza", "chela", "chelas", "vino", "fumar", "cigarro", "bicicleta", "patineta", "armas",
    "desechable", "desechables", "unicel", "plasticos", "plastico",
    "carriola", "carriolas", "carreola", "carreolas", "rueditas",
    "sandalias", "chanclas", "vestimenta",
    "tocar", "acariciar", "aventarles", "darle fruta", "darle comida", "darles de comer", "muerde", "andadores", "grafitear", "graffiti",
    "pet", "pets", "dog", "dogs", "cat", "cats", "beer", "stroller", "strollers"
]

PALABRAS_VACIAS_LOGISTICA = {
    'para', 'como', 'este', 'esta', 'estos', 'estas', 'pero', 'porque', 'cuando',
    'donde', 'desde', 'hasta', 'hacia', 'sobre', 'entre', 'durante', 'mediante',
    'cuenta', 'ofrece', 'brinda', 'puede', 'pueden', 'debe', 'deben', 'tener',
    'tiene', 'tienen', 'haber', 'habra', 'sido', 'cada', 'todo', 'toda', 'todos',
    'todas', 'otro', 'otra', 'otros', 'otras', 'mismo', 'misma', 'mismos', 'mismas',
    'zoomat', 'parque', 'visita', 'visitante', 'visitantes', 'publico'
}


def extraer_palabras_clave_de_texto(texto):
    """Extrae automáticamente términos y lemas significativos del texto informativo para entradas nuevas."""
    if nlp is None or not texto:
        return []
    doc = nlp(texto.lower())
    palabras = set()
    for token in doc:
        t_clean = normalizar_texto(token.text)
        lemma_clean = normalizar_texto(token.lemma_)
        if len(t_clean) >= 4 and t_clean not in PALABRAS_VACIAS_LOGISTICA and not token.is_stop:
            palabras.add(t_clean)
        if len(lemma_clean) >= 4 and lemma_clean not in PALABRAS_VACIAS_LOGISTICA and not token.is_stop:
            palabras.add(lemma_clean)
    return [p for p in palabras if p and len(p) >= 3]


def cargar_catalogo_dinamico():
    """
    Carga dinámicamente las entidades, subtipos y palabras clave desde el catálogo
    logístico (MySQL o DATOS_LOGISTICA_MEMORIA).
    Puebla INTENCIONES_LOGISTICA y MAPA_SUBTIPOS. Para cualquier servicio nuevo,
    deriva automáticamente sus palabras clave a partir del nombre del subtipo
    y de las palabras descriptivas en el texto de su respuesta.
    """
    global INTENCIONES_LOGISTICA, MAPA_SUBTIPOS
    INTENCIONES_LOGISTICA = {cat: list(palabras) for cat, palabras in INTENCIONES_BASE.items()}
    MAPA_SUBTIPOS = {cat: {} for cat in INTENCIONES_BASE}

    catalogo = obtener_catalogo_logistica()
    for (entidad, tipo), texto in catalogo.items():
        if entidad not in INTENCIONES_LOGISTICA:
            INTENCIONES_LOGISTICA[entidad] = []
            MAPA_SUBTIPOS[entidad] = {}
        if entidad not in MAPA_SUBTIPOS:
            MAPA_SUBTIPOS[entidad] = {}

        palabras = []

        # 1. Si cuenta con palabras clave oficiales predefinidas, utilizarlas
        if (entidad, tipo) in PALABRAS_CLAVE_OFICIALES:
            for kw in PALABRAS_CLAVE_OFICIALES[(entidad, tipo)].split(','):
                k = normalizar_texto(kw.strip())
                if k and k not in palabras:
                    palabras.append(k)
        else:
            # 2. Para entradas NUEVAS: derivación automática a partir del nombre del 'tipo'
            tipo_frase = normalizar_texto(tipo.replace('_', ' ').strip())
            if tipo_frase and tipo_frase not in palabras:
                palabras.append(tipo_frase)

            for token_tipo in tipo.split('_'):
                t_norm = normalizar_texto(token_tipo.strip())
                if t_norm and len(t_norm) >= 3 and t_norm not in palabras:
                    palabras.append(t_norm)
                # Formas verbales derivadas (ej. estacionamiento -> estacionar)
                if t_norm.endswith('miento'):
                    v = t_norm[:-6] + 'r'
                    if len(v) >= 4 and v not in palabras:
                        palabras.append(v)
                elif t_norm.endswith('s'):
                    sing = t_norm[:-1]
                    if len(sing) >= 3 and sing not in palabras:
                        palabras.append(sing)

            # Extracción automática desde el texto informativo para entradas nuevas
            if texto:
                palabras_extraidas = extraer_palabras_clave_de_texto(texto)
                for p in palabras_extraidas:
                    if p not in palabras:
                        palabras.append(p)

        MAPA_SUBTIPOS[entidad][tipo] = palabras
        for p in palabras:
            if p not in INTENCIONES_LOGISTICA[entidad]:
                INTENCIONES_LOGISTICA[entidad].append(p)


def recargar_catalogo():
    """Permite refrescar el catálogo en caliente durante la ejecución."""
    cargar_catalogo_dinamico()


# Inicialización al importar el módulo
cargar_catalogo_dinamico()


def es_consulta_tematica_anfibios(pregunta):
    """
    Detecta consultas sobre mitos, leyendas, creencias, diferencias anatómicas, medicina,
    bioturbación, bioindicadores, plagas y conservación de anfibios (ES/EN),
    dirigiéndolas a RAG y evitando colisiones con reglas logísticas o respuestas de catálogo.
    """
    p_norm = " ".join(normalizar_texto(pregunta).split())
    if not p_norm:
        return False

    # Excluir consultas explícitas de logística del parque (salvo preguntas claras sobre mitos)
    es_logistica_parque = any(
        w in p_norm for w in [
            "boleto", "boletos", "entrada", "precio", "costo", "tarifa",
            "horario", "a que hora", "taquilla", "bano", "banos", "sanitario",
            "estacionamiento", "mascota", "mascotas", "en la reja", "en el andador",
            "ticket", "admission", "schedule", "hours", "restroom", "pet", "pets"
        ]
    )

    # Términos inequívocos de mitos, ecología acuática y farmacología de anfibios
    terminos_inequivocos = [
        "verruga", "verrugas", "vph", "papiloma", "orina", "orinan", "orinarte",
        "ceguera", "dejan ciego", "deja ciego", "ciego", "blind", "blindness", "urine", "wart", "warts",
        "bioturbacion", "bioturbation", "bioindicador", "bioindicadores", "bioindicator", "bioindicators",
        "indicador ambiental", "indicadores ambientales", "indicadores de salud ambiental",
        "indicador de salud ambiental", "salud ambiental",
        "caeruleina", "caerulein", "epibatidina", "salamandrina", "bufotoxina", "bufogenina",
        "pumiliotoxina", "batracotoxina", "pseudin", "aposematismo", "aposematism",
        "dendrobatid", "ranas dardo", "poison dart",
        "controladores de plagas", "biopolicias", "dengue", "malaria", "zika",
        "lluvia de sapos", "lluvia de ranas", "caen sapos", "rain of frogs", "rain of toads",
        "sapo fuma", "fuma como", "cigarro", "cigarrillo", "fumar", "cigarette", "smoking",
        "glandulas parotidas", "parotoides", "falsa verruga", "falsas verrugas",
        "escupen veneno", "escupir veneno", "escupitajo", "spit poison", "spit venom"
    ]
    if any(t in p_norm for t in terminos_inequivocos):
        return not es_logistica_parque

    tiene_anfibio = re.search(
        r'\b(sapo|sapos|sapito|sapitos|rana|ranas|ranita|ranitas|anfibio|anfibios|cecilia|cecilias|'
        r'salamandra|salamandras|renacuajo|renacuajos|toad|toads|frog|frogs|amphibian|amphibians|'
        r'caecilian|caecilians|salamander|salamanders|tadpole|tadpoles)\b',
        p_norm
    ) is not None
    if not tiene_anfibio:
        return False

    # Evitar confundir el nombre común de la especie "Rana de lluvia" con el mito de pedir lluvia
    p_sin_especie_lluvia = p_norm.replace("rana de lluvia", "").replace("rana ladradora de lluvia", "")

    # Contacto o mordida fuera de reglas del recinto (ej. "¿Qué pasa si toco un sapo?", "¿Qué pasa si me muerde un sapo?")
    if re.search(r'\b(toco|tocas|toca|tocar|touch|touching|muerde|muerden|morder|mordida|mordedura|bite|bites|bitten)\b', p_sin_especie_lluvia):
        if not any(z in p_norm for z in ["reja", "andador", "zoomat", "zoologico", "parque", "puedo tocar a los animales"]):
            return not es_logistica_parque

    disparadores_subcadena = [
        "mito", "mitos", "leyenda", "leyendas", "creencia", "creencias", "realidad", "verdad",
        "es cierto", "es verdad", "es falso", "mentira", "myth", "myths", "legend", "legends", "true that",
        "diferencia", "diferencias", "iguales", "distinguir", "parecen", "confunden",
        "difference", "differences", "different", "same as",
        "escup", "spit", "veneno", "venenoso", "venenosa", "venenosos", "venenosas", "toxina", "toxinas", "inofensiv",
        "venom", "venomous", "poison", "poisonous", "toxic", "harmless",
        "medicina", "medicamento", "medicamentos", "farmaco", "diabetes", "analgesico", "cardiaco",
        "medicine", "medical", "drugs",
        "pedir lluvia", "llamar la lluvia", "llamar a la lluvia", "atraer la lluvia", "atraen lluvias",
        "cantan cuando", "por que cantan", "cantan para", "canto nupcial", "cuando llueve",
        "epocas de lluvia", "temporada de lluvias", "call the rain", "when it rains", "rainy season", "why do frogs sing", "sing before rain",
        "vivienda", "viviendas", "carretera", "carreteras", "luz artificial", "foco", "focos",
        "streetlights", "artificial light",
        "agua y tierra", "agua y en la tierra", "importancia del agua", "ciclo de vida", "deshidrat",
        "branquias", "pulmones", "parpados", "water and land", "importance of water", "gills", "lungs", "eyelids",
        "proteger", "protegerlos", "protegemos", "cuidar", "cuidarlos", "ayudar", "amenaza", "amenazas",
        "lastimar", "matar", "reubicar", "lavarse las manos", "lavar las manos", "manipular", "hongos",
        "protect", "threat", "threats", "wash hands", "rehome", "ecologica", "ecologico", "importancia ecologica",
        "plaga", "plagas", "ecosistema", "cadena alimenticia", "cadenas troficas", "pest", "pests", "ecosystem",
        "australia", "amazonas", "rito", "ritos", "ritual", "rituales", "salamandra", "salamandras", "salamander"
    ]
    if any(dt in p_sin_especie_lluvia for dt in disparadores_subcadena):
        return not es_logistica_parque

    if re.search(r'\b(casa|casas|patio|patios|house|houses|home|yard)\b', p_sin_especie_lluvia):
        return not es_logistica_parque

    return False


def analizar_intencion(pregunta):
    """
    Analiza la pregunta del usuario y decide la ruta arquitectónica (MySQL o RAG).
    Asigna de forma dinámica y scoring la entidad y el subtipo correspondiente.
    """
    # 1. Procesar el texto con spaCy
    if nlp is not None:
        doc = nlp(pregunta.lower())
        lemas_usuario = [normalizar_texto(token.lemma_) for token in doc]
    else:
        lemas_usuario = []

    preg_norm = normalizar_texto(pregunta)

    # Consultas históricas o institucionales del ZooMAT se derivan a RAG para consultar documentos
    es_historia = False
    raices_historia = [
        "historia", "historico", "historica", "history", "historical",
        "fundacion", "fundador", "fundadores", "fundar", "fundo", "fundada", "fundado",
        "founded", "founder", "founders", "founding",
        "alvarez del toro", "don miguel", "eliseo palacios", "pascacio gamboa",
        "cesar dominguez", "becky alvarez", "eve alvarez"
    ]
    if any(rh in preg_norm for rh in raices_historia) or any(coincide_palabra_clave(rh, pregunta, lemas_usuario) for rh in raices_historia):
        es_historia = True

    temas_institucionales_adicionales = [
        "eliseo palacios", "pascacio gamboa", "cesar dominguez", "becky alvarez", "eve alvarez",
        "marcelo aranda", "antonio ramirez", "gobernador", "governor", "hijas de don miguel", "daughters of don miguel",
        "primer director", "first director", "director del zoologico", "primer jefe",
        "tres sedes", "cuantas sedes", "sedes del", "sedes que", "ubicaciones del", "three locations", "locations of the zoo",
        "parque madero", "parque centenario", "convivencia infantil",
        "nacimientos de agua", "manantiales", "cueva de cerro hueco", "pozos de agua", "natural springs",
        "perfume", "perfumes", "desodorante", "desodorantes", "deodorant", "deodorants",
        "uniforme del personal", "uniforme de los cuidadores", "tonos neutros", "no domesticar", "improntacion",
        "tratar como mascotas", "tratar como perritos", "no dejan acariciar o tratar",
        "primer jaguar negro", "first black jaguar", "rey zopilote", "king vulture", "cocodrilo de chicoasen",
        "cocodrilos del canon del sumidero", "aguila harpia de brasil", "harpy eagle from brazil",
        "quetzal en cautiverio", "quetzales en cautiverio",
        "quien trajo", "who brought", "trajo", "trajeron", "quien llevo", "de que pais", "from which country",
        "de donde provienen", "where do they come from", "desde sudamerica", "zopilote grandote", "aguila grandota",
        "areas naturales protegidas", "areas protegidas", "reservas de la biosfera", "reserva el triunfo",
        "la encrucijada", "selva el ocote", "la sepultura", "montes azules",
        "abrieron el", "abrieron la", "abrio el zoomat", "por primera vez", "estaba antes", "habia antes",
        "antes este lugar", "por que tiene ese nombre", "desde cuando existe", "nomina", "presupuesto",
        "de donde sale el dinero", "sueltos por los caminos", "en libertad en el zapotal", "en libertad",
        "cocodrilo viejo", "andador central", "no compran jirafas", "desde su fundacion", "mancha urbana",
        "unicach", "en los ochenta", "1944", "1942", "1980", "1982", "1987", "1990", "1996"
    ]
    if any(tia in preg_norm for tia in temas_institucionales_adicionales):
        es_historia = True

    if "cuantos anos tiene" in preg_norm and ("zoologico" in preg_norm or "zoomat" in preg_norm):
        es_historia = True

    terminos_origen = ["creacion", "creado", "creador", "creo", "inicios", "origen", "origenes", "antecedentes", "traslado", "trasladar", "origin", "origins", "beginnings", "moved", "relocated"]
    terminos_entidad_hist = ["zoomat", "zoologico", "zoo", "parque", "zapotal", "ninfa"]
    if any(to in preg_norm for to in terminos_origen):
        if any(te in preg_norm for te in terminos_entidad_hist) or any(to in preg_norm for to in ["quien creo", "cuando fue creado", "quien lo creo", "who created", "when was it created"]):
            es_historia = True

    if ("originalmente" in preg_norm or "originally" in preg_norm or "en sus inicios" in preg_norm) and ("ubic" in preg_norm or "donde" in preg_norm or "where" in preg_norm or "localiz" in preg_norm):
        es_historia = True

    if es_historia:
        return {"ruta": "rag", "entidad": "institucional", "tipo": "historia"}

    # Exclusión de hora de reloj y fecha calendario para no desviar erróneamente a horarios del parque
    if any(p in preg_norm for p in ["que hora es", "tienes la hora", "me das la hora", "dame la hora", "que dia es hoy", "que fecha es hoy", "what time is it", "what day is it", "what day is today"]):
        return {"ruta": "rag", "entidad": None, "tipo": None}

    # Consultas temáticas/mitos/ecología/medicina de anfibios y Sapo Borracho se atienden vía RAG
    if any(k in preg_norm for k in ["sapo borracho", "sapo de rebano", "rhinophrynus"]) or es_consulta_tematica_anfibios(pregunta):
        return {"ruta": "rag", "entidad": None, "tipo": None}

    # Exclusión de consultas biológicas (hábitat, dieta, longevidad, reproducción, talla o cría/adulto) cuando NO hay señal logística
    es_pregunta_biologica = re.search(
        r'\b(vive|viven|vivir|longevidad|esperanza\s+de\s+vida|anos\s+de\s+vida|habita|habitan|reproduce|reproducen|gestacion|incubacion|cria|crias|come|comen|alimenta|alimentan|dieta|presas|ovipara|ovovivipara|lifespan)\b',
        preg_norm
    ) or (
        re.search(r'\b(mide|miden|pesa|pesan)\b', preg_norm)
        and not any(w in preg_norm for w in ["paga", "pagan", "entrada", "boleto", "cuesta", "costo", "centimetros", "metro", "altura", "estatura", "nino", "ninos", "nina", "ninas"])
    )
    if es_pregunta_biologica and not any(
        loc in preg_norm for loc in [
            "bano", "banos", "sanitario", "sanitarios", "wc", "parque", "zoologico", "zoomat",
            "tienda", "biblioteca", "taquilla", "restaurante", "horario", "a que hora", "abren", "cierran",
            "transporte", "colectivo", "cuesta", "costo", "precio", "boleto", "entrada", "pagar",
            "paga", "pagan", "gratis", "descuento", "tocar", "acariciar", "dar de comer",
            "darle comida", "darles de comer", "darle fruta", "aventarles", "prohibido",
            "recorrido nocturno", "recorridos de noche", "recorridos nocturnos", "tour nocturno"
        ]
    ):
        return {"ruta": "rag", "entidad": None, "tipo": None}

    # 2. Prioridades absolutas de desambiguación en fronteras (baños, reglas críticas, servicios nocturnos/guiados)
    if re.search(r'\b(bano|banos|sanitario|sanitarios|wc|toilet|toilets|restroom|restrooms|bathroom|bathrooms)\b', preg_norm):
        return {"ruta": "mysql", "entidad": "ubicacion", "tipo": "baños"}

    if any(coincide_palabra_clave(t, pregunta, lemas_usuario) for t in ["recorrido nocturno", "recorridos nocturnos", "tour nocturno", "recorridos de noche", "tour de noche", "visita nocturna", "visitas nocturnas", "caminatas en la oscuridad", "night tour", "night tours"]):
        return {"ruta": "mysql", "entidad": "servicio", "tipo": "recorrido_nocturno"}
    if any(coincide_palabra_clave(t, pregunta, lemas_usuario) for t in ["de noche", "en la noche"]) and not any(a in preg_norm for a in ["animal", "fauna", "especie"]):
        return {"ruta": "mysql", "entidad": "servicio", "tipo": "recorrido_nocturno"}

    if any(coincide_palabra_clave(t, pregunta, lemas_usuario) for t in ["tour guiado", "tours guiados", "recorrido guiado", "recorridos guiados", "visita guiada", "guia diurno", "alguien que nos explique", "asignar alguien", "explique los animales"]):
        return {"ruta": "mysql", "entidad": "servicio", "tipo": "guiado_diurno"}

    # Reglas de seguridad que prevalecen sobre precios/días/carriolas
    if re.search(r'\b(mascota|mascotas|perro|perros|perrito|perrita|chihuahua|cachorro|gato|gatos|pet|pets|dog|dogs)\b', preg_norm):
        return {"ruta": "mysql", "entidad": "regla", "tipo": "mascotas"}
    if re.search(r'\b(alcohol|cerveza|chela|chelas|vino|licor|bebida alcoholica|bebidas alcoholicas|beer|wine)\b', preg_norm):
        return {"ruta": "mysql", "entidad": "regla", "tipo": "alcohol"}
    if re.search(r'\b(unicel|desechable|desechables|cero plasticos|envases desechables|botellas desechables|popotes)\b', preg_norm) or ("plastico" in preg_norm and not re.search(r'\b(carriola|carreola|rueda|ruedas|rueditas|llanta|llantas)\b', preg_norm)):
        return {"ruta": "mysql", "entidad": "regla", "tipo": "plasticos"}
    if any(t in preg_norm for t in ["dar de comer", "darle comida", "darles de comer", "darle fruta", "dar comida", "aventarles", "alimentar animales", "alimentar a los"]):
        return {"ruta": "mysql", "entidad": "regla", "tipo": "alimentar_animales"}
    if any(t in preg_norm for t in ["tocar animales", "puedo tocar", "se puede tocar", "acariciar", "meto la mano", "meter la mano", "muerde", "mordedura"]):
        return {"ruta": "mysql", "entidad": "regla", "tipo": "tocar_animales"}

    # Prioridad de instalaciones con horario vs entrada/cierre
    if "biblioteca" in preg_norm:
        pide_costo_bib = any(w in preg_norm for w in ["cuesta", "costo", "pagar", "boleto", "gratis", "gratuito", "caseta", "piden"])
        pide_horario_bib = any(w in preg_norm for w in ["que dias", "atienden", "horario", "a que hora", "abre", "abren", "cierran"])
        if pide_horario_bib and not pide_costo_bib:
            return {"ruta": "mysql", "entidad": "horario", "tipo": "biblioteca"}
        if pide_costo_bib and not pide_horario_bib:
            return {"ruta": "mysql", "entidad": "boleto", "tipo": "biblioteca"}

    if any(t in preg_norm for t in ["tienda", "recuerdos", "playeras", "llaveros", "artesanias", "souvenirs"]):
        return {"ruta": "mysql", "entidad": "horario", "tipo": "tienda"}

    if any(t in preg_norm for t in ["venden comida", "a que hora comen", "donde comer", "restaurantes", "kioscos", "comida alla adentro"]):
        return {"ruta": "mysql", "entidad": "horario", "tipo": "comida"}

    # Llegada tardía / límite de venta de boletos en taquilla -> horario de cierre (16:00) y salida (18:00)
    if any(t in preg_norm for t in ["4:15", "todavia me venden", "dejan de vender", "nos corren", "ya estamos adentro"]):
        return {"ruta": "mysql", "entidad": "horario", "tipo": "cierre"}

    # 3. Búsqueda dinámica de subtipos específicos por scoring (excluyendo 'general')
    mejor_entidad = None
    mejor_subtipo = None
    max_score = 0

    es_consulta_boleto = any(coincide_palabra_clave(p, pregunta, lemas_usuario) for p in palabras_fuertes_boleto)
    es_consulta_regla = any(coincide_palabra_clave(p, pregunta, lemas_usuario) for p in palabras_fuertes_regla)

    entidades_a_evaluar = list(MAPA_SUBTIPOS.keys())
    if es_consulta_boleto and "boleto" in entidades_a_evaluar:
        entidades_a_evaluar.remove("boleto")
        entidades_a_evaluar.insert(0, "boleto")
    elif es_consulta_regla and "regla" in entidades_a_evaluar:
        entidades_a_evaluar.remove("regla")
        entidades_a_evaluar.insert(0, "regla")

    for entidad in entidades_a_evaluar:
        subtipos = MAPA_SUBTIPOS.get(entidad, {})
        for sub_tipo, terminos in subtipos.items():
            if sub_tipo == "general":
                continue
            for termino in terminos:
                if not termino or len(termino) < 3:
                    continue
                if coincide_palabra_clave(termino, pregunta, lemas_usuario):
                    score = len(termino)
                    if " " in termino:
                        score += 15
                    # Prioridad contextual por palabras fuertes
                    if es_consulta_boleto and entidad == "boleto":
                        score += 20
                    elif es_consulta_regla and entidad == "regla":
                        score += 20
                    if score > max_score:
                        max_score = score
                        mejor_entidad = entidad
                        mejor_subtipo = sub_tipo

    if mejor_entidad and mejor_subtipo:
        return {
            "ruta": "mysql",
            "entidad": mejor_entidad,
            "tipo": mejor_subtipo
        }

    # 4. Si no coincidió ningún subtipo específico, buscar por categoría general
    entidad_detectada = None
    if es_consulta_boleto:
        entidad_detectada = "boleto"
    elif es_consulta_regla:
        entidad_detectada = "regla"
    else:
        for entidad, palabras_clave in INTENCIONES_LOGISTICA.items():
            for palabra in palabras_clave:
                if coincide_palabra_clave(palabra, pregunta, lemas_usuario):
                    entidad_detectada = entidad
                    break
            if entidad_detectada:
                break

    if not entidad_detectada:
        return {"ruta": "rag", "entidad": None, "tipo": None}

    # Asignación de subtipo fallback (evitando caer erróneamente a 'mascotas' en reglas genéricas)
    if "credencial" in preg_norm and entidad_detectada == "boleto":
        tipo_detectado = "credencial_desconocida"
    elif entidad_detectada == "regla":
        subtipos_regla = MAPA_SUBTIPOS.get("regla", {})
        tipo_detectado = "vestimenta" if "vestimenta" in subtipos_regla else list(subtipos_regla.keys())[0]
    else:
        subtipos_disponibles = MAPA_SUBTIPOS.get(entidad_detectada, {})
        tipo_detectado = "general" if "general" in subtipos_disponibles else list(subtipos_disponibles.keys())[0]

    return {
        "ruta": "mysql",
        "entidad": entidad_detectada,
        "tipo": tipo_detectado
    }


if __name__ == "__main__":
    print(analizar_intencion("¿A qué hora abren el zoológico?"))
    print(analizar_intencion("¿Cuánto cuesta la entrada para estudiantes?"))
    print(analizar_intencion("¿Qué come el jaguar en la selva?"))

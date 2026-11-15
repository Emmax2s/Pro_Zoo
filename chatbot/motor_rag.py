import difflib
import warnings
warnings.filterwarnings("ignore", category=UserWarning)

import re
import unicodedata
from pathlib import Path

from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings
from enrutador_semantico import es_consulta_tematica_anfibios

# Apuntamos a la nueva base de datos que creaste hoy con el script de ingesta
BASE_DIR = Path(__file__).resolve().parent
RUTA_BASE_DATOS = str(BASE_DIR / "chroma_db_zoomat")


def normalizar_texto(texto):
    """Normaliza mayúsculas, acentos y espacios para comparar consultas."""
    texto_normalizado = unicodedata.normalize("NFD", texto.lower())
    texto_sin_acentos = "".join(
        caracter for caracter in texto_normalizado
        if unicodedata.category(caracter) != "Mn"
    )
    return " ".join(texto_sin_acentos.split())


print("Cargando motor de búsqueda semántica...")
try:
    modelo_embeddings = HuggingFaceEmbeddings(
        model_name="paraphrase-multilingual-MiniLM-L12-v2",
        model_kwargs={"local_files_only": True}
    )
except Exception:
    modelo_embeddings = HuggingFaceEmbeddings(
        model_name="paraphrase-multilingual-MiniLM-L12-v2"
    )

# Conectamos con la base de datos vectorial de LangChain
vectorstore = Chroma(
    persist_directory=RUTA_BASE_DATOS, 
    embedding_function=modelo_embeddings
)

metadatos_chromadb = vectorstore.get(include=["metadatas"])["metadatas"]

# Estructuras dinámicas de taxonomía biológica pobladas desde ChromaDB
ESPECIES_CONOCIDAS = {}       # { "sapo centroamericano": "Sapo centroamericano" }
TAXONOMIA_MAPA = {}          # { "incilius bocourti": "Sapo centroamericano", "incilius": "Sapo centroamericano" }
CLASES_CONOCIDAS = {}        # { "anfibios": ["Sapo centroamericano", ...], "mamiferos": [...] }
FAMILIAS_CONOCIDAS = {}      # { "bufonidae": ["Sapo centroamericano", ...], ... }
TAXONOMIA_METADATOS = {}     # { "sapo centroamericano": { "clase": "Anfibios", "familia": "Bufonidae", ... } }

for metadato in metadatos_chromadb:
    if not metadato:
        continue
    nombre_original = metadato.get("nombre_comun")
    nombre_cientifico = metadato.get("nombre_cientifico")
    clase = metadato.get("clase")
    familia = metadato.get("familia")
    es_tematico = metadato.get("es_tematico") == "si"

    if es_tematico or (nombre_original and any(t in normalizar_texto(nombre_original) for t in ["mitos y realidades", "diferencias y adaptaciones", "importancia ecologica"])):
        continue

    if nombre_original and not any(excl in nombre_original.lower() for excl in ['.pdf', 'traduccion', 'herpetario']):
        comun_norm = normalizar_texto(nombre_original)
        ESPECIES_CONOCIDAS[comun_norm] = nombre_original
        TAXONOMIA_METADATOS[comun_norm] = metadato

        if clase and clase not in ["General", "No especificado", "No especificada", ""]:
            clase_norm = normalizar_texto(clase)
            if clase_norm not in ["general", "no especificado", "no especificada", ""]:
                CLASES_CONOCIDAS.setdefault(clase_norm, set()).add(nombre_original)
                # Agregar versiones singular y plural correctas (ej. "aves" -> "ave", "reptiles" -> "reptil")
                if clase_norm == "aves":
                    CLASES_CONOCIDAS.setdefault("ave", set()).add(nombre_original)
                elif clase_norm.endswith("ces"):
                    CLASES_CONOCIDAS.setdefault(clase_norm[:-3] + "z", set()).add(nombre_original)
                elif clase_norm.endswith("es") and not clase_norm.endswith(("aes", "ees", "oes")):
                    CLASES_CONOCIDAS.setdefault(clase_norm[:-2], set()).add(nombre_original)
                elif clase_norm.endswith("s"):
                    CLASES_CONOCIDAS.setdefault(clase_norm[:-1], set()).add(nombre_original)
                else:
                    CLASES_CONOCIDAS.setdefault(clase_norm + "s", set()).add(nombre_original)

        if familia and familia not in ["General", "No especificado", "No especificada", ""]:
            familia_norm = normalizar_texto(familia)
            # Ignorar si es "No especificada", "General", vacía, o si coincide erróneamente con la clase
            if (familia_norm not in ["general", "no especificado", "no especificada", ""]
                and (not clase or familia_norm != normalizar_texto(clase))):
                FAMILIAS_CONOCIDAS.setdefault(familia_norm, set()).add(nombre_original)

        if nombre_cientifico and nombre_cientifico not in ["No especificado", "No aplica"]:
            cient_txt = nombre_cientifico.strip()
            while cient_txt.startswith("(") and cient_txt.endswith(")") and len(cient_txt) > 2:
                cient_txt = cient_txt[1:-1].strip()
            cient_limpio = re.sub(r'\(.*?\)', '', cient_txt).strip()
            if not cient_limpio:
                cient_limpio = cient_txt
            cient_norm = normalizar_texto(cient_limpio)
            if cient_norm and len(cient_norm) >= 3:
                if "sapo borracho" in comun_norm:
                    TAXONOMIA_MAPA[cient_norm] = nombre_original
                else:
                    TAXONOMIA_MAPA.setdefault(cient_norm, nombre_original)
                partes_cient = [p for p in cient_norm.split() if not p.isdigit() and len(p) >= 2]
                if len(partes_cient) >= 2:
                    binomial = ' '.join(partes_cient[:2])
                    if "sapo borracho" in comun_norm:
                        TAXONOMIA_MAPA[binomial] = nombre_original
                    else:
                        TAXONOMIA_MAPA.setdefault(binomial, nombre_original)
                homonimos_espanol = {
                    "habia", "como", "para", "entre", "sobre", "este", "esta", "alta", "baja",
                    "casa", "pico", "cola", "pata", "rojo", "verde", "azul", "gris", "negro", "blanco"
                }
                if len(partes_cient) >= 1 and len(partes_cient[0]) >= 4 and partes_cient[0] not in homonimos_espanol:
                    # Género científico (protegido contra homónimos del español como 'habia')
                    if "sapo borracho" in comun_norm:
                        TAXONOMIA_MAPA[partes_cient[0]] = nombre_original
                    else:
                        TAXONOMIA_MAPA.setdefault(partes_cient[0], nombre_original)

# Convertir sets a listas ordenadas
for k in CLASES_CONOCIDAS:
    CLASES_CONOCIDAS[k] = sorted(list(CLASES_CONOCIDAS[k]))
for k in FAMILIAS_CONOCIDAS:
    FAMILIAS_CONOCIDAS[k] = sorted(list(FAMILIAS_CONOCIDAS[k]))

def obtener_formas_base(palabra):
    """Genera formas base lematizadas de sustantivos en español (deshaciendo diminutivos y plurales)."""
    formas = [palabra]
    sufijos_diminutivos = [
        ('itos', ['o', 'os', '']),
        ('itas', ['a', 'as', '']),
        ('ito', ['o', '']),
        ('ita', ['a', '']),
        ('citos', ['']),
        ('citas', ['']),
        ('cito', ['']),
        ('cita', ['']),
        ('uitos', ['o']),
        ('uitas', ['a']),
        ('cillos', ['']),
        ('cillas', ['']),
        ('cillo', ['']),
        ('cilla', ['']),
    ]
    for sufijo, reemplazos in sufijos_diminutivos:
        if palabra.endswith(sufijo) and len(palabra) > len(sufijo) + 2:
            raiz = palabra[:-len(sufijo)]
            for r in reemplazos:
                formas.append(raiz + r)
                
    if palabra.endswith('es') and len(palabra) > 4:
        formas.append(palabra[:-2])
        formas.append(palabra[:-1])
    elif palabra.endswith('s') and len(palabra) > 3:
        formas.append(palabra[:-1])
    else:
        formas.append(palabra + 's')
        formas.append(palabra + 'es')
        
    return list(dict.fromkeys(formas))

PALABRAS_DESCARTADAS_FUZZY = {
    "celebra", "celebran", "celebrar", "celebracion", "celebre", "carrera", "cancion",
    "cerebro", "precio", "entrada", "boleto", "horario", "tiempo", "persona", "personas",
    "visita", "visitas", "cuando", "donde", "cuanto", "cuanta", "cuantos", "cuantas",
    "porque", "quien", "quienes", "cuenta", "cuentan", "bueno", "buenos", "gracias",
    "sales", "salen", "salir", "salida", "favor", "puedo", "puede", "pueden", "vamos",
    "ayer", "ahora", "tarde", "noche", "lunes", "martes", "miercoles", "jueves", "viernes",
    "sabado", "domingo", "enero", "febrero", "marzo", "abril", "mayo", "junio", "julio",
    "agosto", "septiembre", "octubre", "noviembre", "diciembre", "mexico", "ecuador",
    "futbol", "partido", "mundial", "campeon", "campeonato", "copa",
    "corren", "corre", "cerca", "lejos", "licencia", "credencial", "prepa", "rebaja",
    "chihuahua", "mochila", "sandalias", "tenis", "carreola", "carriola", "rueditas",
    "nombre", "desde", "existe", "existen", "recorridos", "caminatas", "limite", "cupo",
    "modulos", "aventarles", "muerde", "manana", "tacos", "blanca", "blanco", "chiquito",
    "chiquita", "grande", "grandote", "viejo", "nueva", "nuevo", "adentro", "afuera",
    "dinero", "sueltos", "caminos", "acariciar", "perritos", "abrieron", "abrio",
    "ensenar", "conducir", "urgencia", "sanitario", "sanitarios", "bano", "banos",
    "recuerdos", "comida", "venden", "atienden", "biblioteca", "tienda", "todavia"
}

PALABRAS_DESCARTADAS_GENERICAS = {
    "dame", "informacion", "sobre", "quiero", "saber", "como", "cual", "cuales",
    "donde", "esta", "estan", "vive", "viven", "come", "comen", "mide", "pesa",
    "animal", "animales", "especie", "especies", "zoomat", "zoologico", "chiapas",
    "habitat", "tienen", "tiene", "cuenta", "cuentan", "albergan", "alberga",
    "exhiben", "exhibe", "puedo", "podemos", "chiquito", "chiquita", "grande",
    "grandote", "viejo", "blanca", "blanco", "negro", "verde"
}

ESPECIES_COMPUESTAS_KEYS = [k for k in ESPECIES_CONOCIDAS.keys() if " " in k]
ESPECIES_SIMPLES_KEYS = [k for k in ESPECIES_CONOCIDAS.keys() if " " not in k]


def _primer_sustantivo_especie(especie_norm):
    """Obtiene el sustantivo principal de una especie, limpiando puntuación y omitiendo preposiciones iniciales."""
    tokens = re.findall(r'\b\w+\b', especie_norm)
    preposiciones_inicio = {"de", "el", "la", "los", "las"}
    while len(tokens) > 1 and tokens[0] in preposiciones_inicio:
        tokens.pop(0)
    return tokens[0] if tokens else ""


def es_consulta_historia(pregunta):
    """Determina si una consulta pertenece al acervo histórico/institucional del ZooMAT."""
    pregunta_normalizada = normalizar_texto(pregunta)
    terminos_historia_rag = [
        "historia", "historico", "historica", "history", "historical",
        "fundacion", "fundador", "fundadores", "fundar", "fundo", "fundada", "fundado",
        "founded", "founder", "founders", "founding", "who founded", "when was the zoo founded",
        "quien fundo", "cuando se fundo", "alvarez del toro", "don miguel",
        "creacion", "creador", "creo", "creado", "inicios", "origen", "origenes", "antecedentes",
        "origin", "origins", "beginnings", "traslado", "relocated", "moved",
        "primer director", "first director", "director del zoologico", "director del parque",
        "primer jefe", "eliseo palacios", "pascacio gamboa", "cesar dominguez", "becky alvarez", "eve alvarez",
        "marcelo aranda", "antonio ramirez", "gobernador", "governor", "hijas de don miguel",
        "tres sedes", "cuantas sedes", "sedes", "locations", "parque madero", "parque centenario",
        "convivencia infantil", "1941", "1942", "1944", "1949", "1980", "1982", "1987", "1962", "1990", "1996",
        "nacimientos de agua", "manantiales", "cerro hueco", "pozos de agua", "natural springs",
        "perfume", "perfumes", "desodorante", "desodorantes", "deodorant", "deodorants", "uniforme",
        "improntacion", "no domesticar", "tratar como perritos", "no dejan acariciar",
        "primer jaguar negro", "first black jaguar", "rey zopilote", "king vulture", "chicoasen",
        "canon del sumidero", "quetzal en cautiverio", "quetzales en cautiverio",
        "quien trajo", "who brought", "trajo", "trajeron", "quien llevo", "de que pais", "from which country",
        "de donde provienen", "where do they come from", "desde sudamerica", "zopilote grandote", "aguila grandota",
        "areas naturales protegidas", "areas protegidas", "reservas naturales", "el triunfo", "la encrucijada",
        "el ocote", "la sepultura", "montes azules", "protected areas",
        "estaba antes", "habia antes", "antes este lugar", "abrieron el", "abrieron la", "abrio el zoomat",
        "por que tiene ese nombre", "desde cuando existe", "nomina", "presupuesto", "de donde sale el dinero",
        "sueltos por los caminos", "en libertad", "cocodrilo viejo", "andador central", "no compran jirafas",
        "desde su fundacion", "mancha urbana", "unicach", "en los ochenta"
    ]
    if any(th in pregunta_normalizada for th in terminos_historia_rag):
        return True
    if ("originally" in pregunta_normalizada or "originalmente" in pregunta_normalizada) and ("located" in pregunta_normalizada or "ubicado" in pregunta_normalizada or "donde" in pregunta_normalizada or "where" in pregunta_normalizada):
        return True
    if "zapotal" in pregunta_normalizada and ("traslado" in pregunta_normalizada or "ano" in pregunta_normalizada or "year" in pregunta_normalizada or "sueltos" in pregunta_normalizada):
        return True
    if ("costo" in pregunta_normalizada or "cost" in pregunta_normalizada or "albanil" in pregunta_normalizada or "construir" in pregunta_normalizada or "build" in pregunta_normalizada) and ("1942" in pregunta_normalizada or "original" in pregunta_normalizada):
        return True
    if "politica" in pregunta_normalizada and ("mascota" in pregunta_normalizada or "domesticacion" in pregunta_normalizada):
        return True
    if "cuantos anos tiene" in pregunta_normalizada and ("zoologico" in pregunta_normalizada or "zoomat" in pregunta_normalizada):
        return True
    return False


def _detectar_especie_especifica_compuesta(pregunta_normalizada):
    """Detecta coincidencia directa de una especie específica compuesta o nombre científico."""
    # 0. Sinónimos regionales especiales registrados (ej. Sapo de rebaño / Chaac -> Sapo borracho)
    if "sapo borracho" in ESPECIES_CONOCIDAS:
        for alias in ("sapo borracho", "sapo de rebano", "rhinophrynus dorsalis", "chaac"):
            if re.search(rf'\b{re.escape(alias)}\b', pregunta_normalizada):
                return ESPECIES_CONOCIDAS["sapo borracho"]

    # 1. Búsqueda exacta de nombre común compuesto (2+ palabras) con delimitadores de palabra
    for especie_norm, especie_original in sorted(ESPECIES_CONOCIDAS.items(), key=lambda x: len(x[0]), reverse=True):
        if " " in especie_norm and len(especie_norm) >= 3 and "historia" not in especie_norm:
            if re.search(rf'\b{re.escape(especie_norm)}\b', pregunta_normalizada):
                return especie_original

    # 1.2 Búsqueda de nombre científico completo o binomio taxonómico con delimitadores de palabra
    for cient_norm, especie_original in sorted(TAXONOMIA_MAPA.items(), key=lambda x: len(x[0]), reverse=True):
        if cient_norm and len(cient_norm) >= 3:
            if re.search(rf'\b{re.escape(cient_norm)}\b', pregunta_normalizada):
                return especie_original

    # 1.3 Bigramas/Trigramas con tolerancia tipográfica alta SOLO contra especies compuestas
    # Ej: 'sapo chiquitooo' -> 'Sapo chiquito', 'aguila harpia' -> 'Águila arpía'.
    tokens_crudos = [
        t for t in re.findall(r'\b\w+\b', pregunta_normalizada)
        if t not in PALABRAS_DESCARTADAS_FUZZY and t not in {"el", "la", "los", "las", "mi", "tu", "su", "es", "en", "una", "un"} and len(t) >= 2
    ]
    for n in (3, 2):
        for i in range(len(tokens_crudos) - n + 1):
            ngram = ' '.join(tokens_crudos[i:i+n])
            if len(ngram) >= 7:
                matches_ng = difflib.get_close_matches(ngram, ESPECIES_COMPUESTAS_KEYS, n=1, cutoff=0.84)
                if matches_ng:
                    return ESPECIES_CONOCIDAS[matches_ng[0]]

    return None


def _detectar_especie_biologica(pregunta_normalizada):
    """Detecta especie biológica registrada sin interceptar temas institucionales."""
    compuesta = _detectar_especie_especifica_compuesta(pregunta_normalizada)
    if compuesta:
        return compuesta

    # 1.4 Búsqueda exacta de nombre común simple (1 palabra) con delimitadores de palabra
    for especie_norm, especie_original in sorted(ESPECIES_CONOCIDAS.items(), key=lambda x: len(x[0]), reverse=True):
        if " " not in especie_norm and len(especie_norm) >= 3 and "historia" not in especie_norm:
            if re.search(rf'\b{re.escape(especie_norm)}\b', pregunta_normalizada):
                return especie_original

    # 1.5 Mapeo dinámico universal de formas morfológicas exactas (diminutivos y plurales)
    tokens = [
        t for t in re.findall(r'\b\w+\b', pregunta_normalizada)
        if t not in PALABRAS_DESCARTADAS_GENERICAS and t not in PALABRAS_DESCARTADAS_FUZZY and len(t) >= 4
    ]
    for token in tokens:
        for forma in obtener_formas_base(token):
            if forma in ESPECIES_CONOCIDAS and "historia" not in forma:
                return ESPECIES_CONOCIDAS[forma]
            if forma in TAXONOMIA_MAPA:
                return TAXONOMIA_MAPA[forma]

    # 2. Búsqueda de sustantivo distintivo (incluyendo nombres con 'DE ' al inicio como 'DE ARMADILLO...')
    for palabra in tokens:
        for forma in obtener_formas_base(palabra):
            for especie_norm, especie_original in sorted(ESPECIES_CONOCIDAS.items(), key=lambda x: len(x[0]), reverse=True):
                if "historia" in especie_norm:
                    continue
                primer_sust = _primer_sustantivo_especie(especie_norm)
                if primer_sust and forma == primer_sust:
                    return especie_original

    # 2.5 Tolerancia tipográfica secundaria (bigramas más flexibles 0.76 y palabras sueltas 0.86)
    tokens_limpios = [t for t in tokens if len(t) >= 4]
    bigramas = [' '.join(tokens_limpios[i:i+2]) for i in range(len(tokens_limpios)-1)]
    for bg in bigramas:
        if len(bg) >= 8:
            matches_bg = difflib.get_close_matches(bg, ESPECIES_COMPUESTAS_KEYS, n=1, cutoff=0.76)
            if matches_bg:
                return ESPECIES_CONOCIDAS[matches_bg[0]]

    first_words = {_primer_sustantivo_especie(esp): esp for esp in ESPECIES_CONOCIDAS.keys() if "historia" not in esp and _primer_sustantivo_especie(esp) not in PALABRAS_DESCARTADAS_FUZZY}
    for t in tokens_limpios:
        if len(t) >= 5:
            matches_single = difflib.get_close_matches(t, ESPECIES_SIMPLES_KEYS, n=1, cutoff=0.86)
            if matches_single:
                return ESPECIES_CONOCIDAS[matches_single[0]]
            matches_first = difflib.get_close_matches(t, first_words.keys(), n=1, cutoff=0.86)
            if matches_first:
                return ESPECIES_CONOCIDAS[first_words[matches_first[0]]]

    return None


def detectar_especie(pregunta):
    """Detecta la entidad histórica o biológica más probable para una pregunta."""
    pregunta_normalizada = normalizar_texto(pregunta)
    if es_consulta_historia(pregunta):
        for esp_norm, esp_orig in ESPECIES_CONOCIDAS.items():
            if any(k in esp_norm for k in ["historia", "institucional", "fundacion"]):
                return esp_orig

    return _detectar_especie_biologica(pregunta_normalizada)


def detectar_especies_relacionadas(pregunta):
    """
    Cuando la pregunta usa un sustantivo genérico que agrupa varias especies registradas
    (ej. 'chachalaca', 'mono', 'aguila', 'cocodrilo', 'alacran', 'armadillo', 'nauyaca', 'arana', 'tortuga'),
    devuelve la lista completa de especies emparentadas para recuperar un contexto diverso.
    """
    pregunta_normalizada = normalizar_texto(pregunta)
    # Si ya coincidió una especie específica compuesta o científica (exacta o tipográfica, ej. 'Águila arpía' / 'águila harpía'), no expandir a todo el género
    especie_especifica = _detectar_especie_especifica_compuesta(pregunta_normalizada)
    if especie_especifica:
        return [especie_especifica]

    tokens = [
        t for t in re.findall(r'\b\w+\b', pregunta_normalizada)
        if t not in PALABRAS_DESCARTADAS_GENERICAS and t not in PALABRAS_DESCARTADAS_FUZZY and len(t) >= 4
    ]
    coincidencias = []
    for palabra in tokens:
        for forma in obtener_formas_base(palabra):
            for especie_norm, especie_original in ESPECIES_CONOCIDAS.items():
                if "historia" in especie_norm:
                    continue
                primer_sust = _primer_sustantivo_especie(especie_norm)
                if primer_sust and forma == primer_sust and especie_original not in coincidencias:
                    coincidencias.append(especie_original)
    return coincidencias


SINONIMOS_HISTORIA = {
    "antes": ["primera sede", "segunda sede", "avenida central", "parque centenario", "parque madero", "tres sedes"],
    "estaba": ["primera sede", "segunda sede", "avenida central", "parque centenario", "parque madero", "tres sedes"],
    "nombre": ["miguel alvarez del toro", "zoologico regional"],
    "1944": ["1944", "eliseo palacios", "miguel alvarez del toro", "asumio la direccion"],
    "direccion": ["1944", "director", "eliseo palacios", "miguel alvarez del toro"],
    "sueltos": ["libertad", "saraguatos", "venados", "guaqueques", "andadores"],
    "caminos": ["libertad", "saraguatos", "andadores", "zapotal"],
    "aguila": ["aguila harpia", "brasil", "cites", "criadero"],
    "grandota": ["aguila harpia", "zopilote", "rey zopilote"],
    "sudamerica": ["aguila harpia", "brasil", "cites"],
    "areas": ["areas naturales protegidas", "reservas", "el triunfo", "encrucijada", "montes azules"],
    "protegidas": ["areas naturales protegidas", "reservas", "el triunfo", "encrucijada", "montes azules"],
    "impulso": ["promotores del decreto", "reservas", "el triunfo"],
    "compran": ["exclusividad regional", "rechazando la compra", "especies exoticas", "fauna nativa"],
    "jirafas": ["exclusividad regional", "especies exoticas", "fauna nativa", "rechazando la compra"],
    "elefantes": ["exclusividad regional", "especies exoticas", "fauna nativa", "rechazando la compra"],
    "fundacion": ["fundado", "1942", "pascacio gamboa", "exclusividad regional", "fauna nativa"],
    "dinero": ["presupuesto", "nomina", "gobierno del estado", "taquilla"],
    "nomina": ["presupuesto", "nomina", "gobierno del estado", "taquilla"],
    "agua": ["manantiales", "siete", "cerro hueco", "pozos"],
    "cerro": ["manantiales", "cerro hueco", "zapotal"],
    "cocodrilo": ["chicoasen", "sumidero", "chico", "cincuenta anos", "juarez"],
    "zopilote": ["rey zopilote", "1982", "cesar dominguez"],
    "quetzal": ["quetzal", "1990", "reproduccion", "el triunfo"],
    "hijas": ["becky", "eve"],
    "perfume": ["perfumes", "desodorantes", "olfato", "uniforme"],
    "aroma": ["perfumes", "desodorantes", "olfato", "uniforme"],
    "acariciar": ["no domesticacion", "improntacion", "mascotas domesticas"],
    "perritos": ["no domesticacion", "improntacion", "mascotas domesticas"],
}


def _buscar_chunks_institucionales_hibrido(pregunta, especie_hist, k=5):
    """Combina similitud vectorial con re-ranking léxico-conceptual sobre fragmentos institucionales."""
    pregunta_norm = normalizar_texto(pregunta)
    tokens_preg = [t for t in re.findall(r'\b\w+\b', pregunta_norm) if len(t) >= 4 and t not in {"como", "donde", "cuando", "quien", "cual", "porque", "este", "esta", "lugar", "zoologico", "zoomat", "parque", "tiene"}]

    # Obtener todos los fragmentos institucionales (con ranking semántico inicial)
    sem_docs = vectorstore.similarity_search(pregunta, k=20, filter={"nombre_comun": especie_hist})
    raw_res = vectorstore.get(where={"nombre_comun": especie_hist}, include=["documents"])
    todos_textos = raw_res.get("documents", []) or [d.page_content for d in sem_docs]

    # Mapear rango semántico
    sem_rank = {}
    for idx, d in enumerate(sem_docs):
        if d.page_content not in sem_rank:
            sem_rank[d.page_content] = max(0, 20 - idx)

    puntuados = []
    for texto in todos_textos:
        t_norm = normalizar_texto(texto)
        score = sem_rank.get(texto, 0) * 1.5
        for tok in tokens_preg:
            if tok in t_norm:
                score += 10
            for exp in SINONIMOS_HISTORIA.get(tok, []):
                if exp in t_norm:
                    score += 18
        puntuados.append((score, texto))

    puntuados.sort(key=lambda x: x[0], reverse=True)
    seleccionados = [t for _, t in puntuados[:k]]
    return seleccionados


SINONIMOS_TEMATICOS_ANFIBIOS = {
    "verruga": ["verruga", "verrugas", "vph", "papiloma", "glandulas parotidas", "falso"],
    "verrugas": ["verruga", "verrugas", "vph", "papiloma", "glandulas parotidas", "falso"],
    "wart": ["verruga", "verrugas", "vph", "papiloma"],
    "warts": ["verruga", "verrugas", "vph", "papiloma"],
    "orina": ["orina", "orinar", "ceguera", "urea", "acido urico", "estres"],
    "urine": ["orina", "orinar", "ceguera", "urea", "acido urico"],
    "ceguera": ["ceguera", "ciegas", "ojos", "orina"],
    "blind": ["ceguera", "ciegas", "ojos", "orina"],
    "blindness": ["ceguera", "ciegas", "ojos", "orina"],
    "escupen": ["escupen", "lengua pegajosa", "toxinas", "lavarse"],
    "spit": ["escupen", "lengua pegajosa", "toxinas", "lavarse"],
    "mordida": ["mordida", "venenosa", "desprenda", "arrancar"],
    "bite": ["mordida", "venenosa", "desprenda"],
    "fuma": ["fuma", "cigarrillos", "humo", "pulmones", "maltrato"],
    "smoke": ["fuma", "cigarrillos", "humo", "pulmones"],
    "cigarrillo": ["fuma", "cigarrillos", "humo", "pulmones"],
    "cigarro": ["fuma", "cigarrillos", "humo", "pulmones"],
    "lluvia": ["canto nupcial", "presion atmosferica", "trombas marinas", "tornados", "charcas", "australia", "amazonas"],
    "cantan": ["canto nupcial", "presion atmosferica", "hembras", "charcas"],
    "rain": ["canto nupcial", "lluvia de ranas", "trombas marinas", "tornados", "charcas"],
    "casa": ["luz artificial", "focos", "artropodos", "carreteras", "patios", "reubicarse"],
    "houses": ["luz artificial", "focos", "artropodos", "viviendas"],
    "diferencia": ["piel suave", "piel rugosa", "glándulas parotidas", "glandulas parotidas", "cecilias", "salamandras"],
    "difference": ["piel suave", "piel rugosa", "glandulas parotidas", "cecilias", "salamandras"],
    "salamandra": ["salamandras", "cecilias", "lagartijas", "escamas"],
    "salamander": ["salamandras", "cecilias", "lagartijas"],
    "agua": ["eclosionar", "renacuajos", "hidratados", "temperatura corporal", "pulmones", "parpados"],
    "water": ["eclosionar", "renacuajos", "hidratados", "temperatura corporal", "pulmones", "parpados"],
    "medicina": ["analgesicos", "caeruleina", "pseudin-2", "diabetes", "epibatidinas", "cardiacos"],
    "medicine": ["analgesicos", "caeruleina", "pseudin-2", "diabetes", "cardiacos"],
    "diabetes": ["pseudin-2", "diabetes", "colombiano", "orinoquia"],
    "caeruleina": ["caeruleina", "analgesicos", "epibatidinas"],
    "dengue": ["dengue", "malaria", "zika", "mosquitos", "zancudos", "plagas", "biopolicias"],
    "malaria": ["dengue", "malaria", "zika", "mosquitos", "plagas"],
    "zika": ["dengue", "malaria", "zika", "mosquitos", "plagas"],
    "plagas": ["plagas agricolas", "cosechas", "biopolicias", "cucarachas", "mosquitos"],
    "bioturbacion": ["bioturbacion", "sedimentos", "renacuajos", "oxigena", "filtra", "nutrientes", "peces"],
    "bioturbation": ["bioturbacion", "sedimentos", "renacuajos", "oxigena", "nutrientes"],
    "bioindicadores": ["bioindicadores", "piel altamente permeable", "contaminantes", "cambio climatico", "biodiversidad"],
    "bioindicators": ["bioindicadores", "piel altamente permeable", "contaminantes", "biodiversidad"],
    "dendrobatidos": ["dendrobatidae", "ranas dardo", "colores brillantes", "aposematismo"],
    "aposematismo": ["aposematismo", "colores brillantes", "dendrobatidae", "ranas dardo"],
    "proteger": ["reubicarse", "lavarse las manos", "hongos", "basura", "charcas", "fauna silvestre", "mitos"],
    "protect": ["reubicarse", "lavarse las manos", "hongos", "basura", "charcas", "fauna silvestre"],
}


def _buscar_chunks_tematicos_anfibios(pregunta, k=4):
    """Combina búsqueda vectorial y re-ranking conceptual bilingüe en documentos temáticos de anfibios."""
    pregunta_norm = normalizar_texto(pregunta)
    tokens_preg = [t for t in re.findall(r'\b\w+\b', pregunta_norm) if len(t) >= 4]

    sem_docs = vectorstore.similarity_search(pregunta, k=20, filter={"es_tematico": "si"})
    raw_res = vectorstore.get(where={"es_tematico": "si"}, include=["documents"])
    todos_textos = raw_res.get("documents", []) or [d.page_content for d in sem_docs]
    if not todos_textos:
        return []

    sem_rank = {}
    for idx, d in enumerate(sem_docs):
        if d.page_content not in sem_rank:
            sem_rank[d.page_content] = max(0, 20 - idx)

    puntuados = []
    for texto in todos_textos:
        t_norm = normalizar_texto(texto)
        score = sem_rank.get(texto, 0) * 1.5
        for tok in tokens_preg:
            if tok in t_norm:
                score += 12
            for exp in SINONIMOS_TEMATICOS_ANFIBIOS.get(tok, []):
                if exp in t_norm:
                    score += 18
        puntuados.append((score, texto))

    puntuados.sort(key=lambda x: x[0], reverse=True)
    return [t for _, t in puntuados[:k]]


def buscar_contexto(pregunta):
    """
    Busca los fragmentos más relevantes y diversos en los documentos
    para alimentar a Llama 3.1 utilizando MMR, re-ranking institucional y soporte multi-especie e híbrido.
    """
    try:
        pregunta_norm = normalizar_texto(pregunta)
        especie_hist = None
        for esp_norm, esp_orig in ESPECIES_CONOCIDAS.items():
            if any(k in esp_norm for k in ["historia", "institucional", "fundacion"]):
                especie_hist = esp_orig
                break

        es_hist = es_consulta_historia(pregunta)
        especie_bio = _detectar_especie_biologica(pregunta_norm)
        pide_biologia_explicita = re.search(
            r'\b(alimenta|come|comen|presas|dieta|reproduce|habitat|vive|viven|mide|pesa)\b',
            pregunta_norm
        ) is not None

        # Caso Híbrido real (Historia + Biología en la misma pregunta, ej. dieta del águila harpía vs origen de Brasil)
        if es_hist and especie_bio and especie_hist and especie_bio != especie_hist and pide_biologia_explicita:
            res_hist_texts = _buscar_chunks_institucionales_hibrido(pregunta, especie_hist, k=3)
            res_bio = vectorstore.max_marginal_relevance_search(
                pregunta, k=3, fetch_k=10, lambda_mult=0.6,
                filter={"nombre_comun": especie_bio}
            )
            return "\n\n".join(res_hist_texts + [doc.page_content for doc in res_bio])

        # Caso Institucional puro (re-ranking híbrido semántico + conceptual sobre los 5 archivos .txt)
        if es_hist and especie_hist:
            res_inst = _buscar_chunks_institucionales_hibrido(pregunta, especie_hist, k=5)
            if res_inst:
                return "\n\n".join(res_inst)

        # Especie culturalmente relevante específica (Sapo borracho / Rhinophrynus dorsalis)
        if especie_bio and "sapo borracho" in normalizar_texto(especie_bio):
            resultados_borracho = vectorstore.max_marginal_relevance_search(
                pregunta, k=4, fetch_k=10, lambda_mult=0.7,
                filter={"nombre_comun": especie_bio}
            )
            if resultados_borracho:
                return "\n\n".join([doc.page_content for doc in resultados_borracho])

        # Consultas temáticas sobre mitos, diferencias, medicina, ecología y conservación de anfibios
        if es_consulta_tematica_anfibios(pregunta):
            res_tematicos = _buscar_chunks_tematicos_anfibios(pregunta, k=4)
            if res_tematicos:
                return "\n\n".join(res_tematicos)

        # Caso Biológico con ambigüedad de género (múltiples especies emparentadas, ej. 'águila', 'chachalaca', 'mono')
        especies_rel = detectar_especies_relacionadas(pregunta)
        if len(especies_rel) > 1 and not any(g in re.findall(r'\b\w+\b', pregunta_norm) for g in ["rana", "ranas", "ranita", "ranitas", "sapo", "sapos", "sapito", "sapitos", "cecilia", "cecilias"]):
            # Obtener fragmentos diversos distribuidos entre hasta 4 especies emparentadas
            resultados = []
            vistas = set()
            for esp_cand in especies_rel[:6]:
                if len(resultados) >= 6:
                    break
                hits = vectorstore.similarity_search(pregunta, k=1, filter={"nombre_comun": esp_cand})
                for h in hits:
                    if h.page_content not in vistas:
                        resultados.append(h)
                        vistas.add(h.page_content)
            if resultados:
                return "\n\n".join([doc.page_content for doc in resultados])

        especie_detectada = detectar_especie(pregunta)
        resultados = []

        if especie_detectada:
            # El filtro exacto evita mezclar especies específicas con homónimos
            resultados = vectorstore.max_marginal_relevance_search(
                pregunta,
                k=4,
                fetch_k=10,
                lambda_mult=0.7,
                filter={"nombre_comun": especie_detectada}
            )

        if not resultados:
            # Respaldo semántico para consultas sin mapeo o sin coincidencia en Chroma
            resultados = vectorstore.max_marginal_relevance_search(
                pregunta,
                k=4,
                fetch_k=10,
                lambda_mult=0.7
            )

        return "\n\n".join([doc.page_content for doc in resultados])
    except Exception as e:
        print(f"Error en la recuperación RAG: {e}")
        return ""
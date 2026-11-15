import warnings
warnings.filterwarnings("ignore", category=UserWarning)

import os
import re
import shutil
import unicodedata
from pathlib import Path
from langchain_community.document_loaders import PyPDFLoader, Docx2txtLoader, TextLoader
from langchain_community.vectorstores import Chroma
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter

# 1. Configuración de rutas
BASE_DIR = Path(__file__).resolve().parent
RUTA_DOCUMENTOS = str(BASE_DIR / "documentos_zoomat")
RUTA_BASE_DATOS = str(BASE_DIR / "chroma_db_zoomat")

# Catálogo de las 8 clases biológicas oficiales del ZooMAT
CLASES_OFICIALES_ZOOMAT = [
    "Mamíferos",
    "Aves",
    "Reptiles",
    "Cocodrilos",
    "Arácnidos",
    "Insectos",
    "Invertebrados",
    "Anfibios"
]

MAPA_CLASES_CANONICAS = {
    # Anfibios
    "anfibio": "Anfibios",
    "anfibios": "Anfibios",
    "amphibia": "Anfibios",
    "amphibian": "Anfibios",
    "amphibians": "Anfibios",
    # Mamíferos
    "mamifero": "Mamíferos",
    "mamiferos": "Mamíferos",
    "mammalia": "Mamíferos",
    "mammal": "Mamíferos",
    "mammals": "Mamíferos",
    # Aves
    "ave": "Aves",
    "aves": "Aves",
    "pajaro": "Aves",
    "pajaros": "Aves",
    "bird": "Aves",
    "birds": "Aves",
    # Reptiles
    "reptil": "Reptiles",
    "reptiles": "Reptiles",
    "reptilia": "Reptiles",
    "reptile": "Reptiles",
    # Cocodrilos
    "cocodrilo": "Cocodrilos",
    "cocodrilos": "Cocodrilos",
    "crocodylia": "Cocodrilos",
    "crocodilia": "Cocodrilos",
    # Arácnidos
    "aracnido": "Arácnidos",
    "aracnidos": "Arácnidos",
    "arachnida": "Arácnidos",
    "arana": "Arácnidos",
    "aranas": "Arácnidos",
    # Insectos
    "insecto": "Insectos",
    "insectos": "Insectos",
    "insecta": "Insectos",
    # Invertebrados
    "invertebrado": "Invertebrados",
    "invertebrados": "Invertebrados",
    "invertebrata": "Invertebrados",
}

MAPA_FAMILIA_A_CLASE = {
    # Anfibios
    "bufonidae": "Anfibios",
    "hylidae": "Anfibios",
    "ranidae": "Anfibios",
    "plethodontidae": "Anfibios",
    "craugastoridae": "Anfibios",
    "centrolenidae": "Anfibios",
    "dermophiidae": "Anfibios",
    "microhylidae": "Anfibios",
    "rhinophrynidae": "Anfibios",
    "eleutherodactylidae": "Anfibios",
    "ambystomatidae": "Anfibios",
    # Mamíferos
    "felidae": "Mamíferos",
    "tapiridae": "Mamíferos",
    "cebidae": "Mamíferos",
    "ateliadae": "Mamíferos",
    "atelidae": "Mamíferos",
    "mustelidae": "Mamíferos",
    "procyonidae": "Mamíferos",
    "canidae": "Mamíferos",
    "cervidae": "Mamíferos",
    "tayassuidae": "Mamíferos",
    "dasyproctidae": "Mamíferos",
    "myrmecophagidae": "Mamíferos",
    "dasypodidae": "Mamíferos",
    "didelphidae": "Mamíferos",
    "sciuridae": "Mamíferos",
    "cuniculidae": "Mamíferos",
    "vespertilionidae": "Mamíferos",
    "phyllostomidae": "Mamíferos",
    # Aves
    "accipitridae": "Aves",
    "psittacidae": "Aves",
    "ramphastidae": "Aves",
    "trogonidae": "Aves",
    "cracidae": "Aves",
    "strigidae": "Aves",
    "falconidae": "Aves",
    "tinamidae": "Aves",
    "ardeidae": "Aves",
    "trochilidae": "Aves",
    "cathartidae": "Aves",
    "picidae": "Aves",
    "tytonidae": "Aves",
    "columbidae": "Aves",
    # Cocodrilos
    "crocodylidae": "Cocodrilos",
    "alligatoridae": "Cocodrilos",
    # Reptiles
    "viperidae": "Reptiles",
    "colubridae": "Reptiles",
    "boidae": "Reptiles",
    "iguanidae": "Reptiles",
    "anguidae": "Reptiles",
    "cheloniidae": "Reptiles",
    "geoemydidae": "Reptiles",
    "kinosternidae": "Reptiles",
    "dactyloidae": "Reptiles",
    "corytophanidae": "Reptiles",
    "elapidae": "Reptiles",
    "emydidae": "Reptiles",
    "testudinidae": "Reptiles",
    # Arácnidos
    "theraphosidae": "Arácnidos",
    "buthidae": "Arácnidos",
    "diplocentridae": "Arácnidos",
    # Insectos
    "lepidoptera": "Insectos",
    "coleoptera": "Insectos",
    "hymenoptera": "Insectos",
    "formicidae": "Insectos",
    "apidae": "Insectos",
    "scarabaeidae": "Insectos",
}

VOCABULARIO_CLASES = {
    "Anfibios": {
        "nombres": [
            "sapo", "sapos", "sapito", "sapitos", "rana", "ranas", "ranita", "ranitas",
            "cecilia", "cecilias", "salamandra", "salamandras", "triton", "tritón", "tritones",
            "ajolote", "ajolotes", "anuro", "anuros", "caudado", "caudados", "urodelo", "urodelos"
        ],
        "palabras": [
            "anfibio", "anfibios", "amphibia", "renacuajo", "renacuajos", "metamorfosis",
            "piel desnuda", "piel permeable", "desove acuatico", "desove acuático", "huevos gelatinosos"
        ]
    },
    "Mamíferos": {
        "nombres": [
            "jaguar", "jaguares", "ocelote", "ocelotes", "tigrillo", "puma", "pumas",
            "jaguarundi", "mono", "monos", "mono aullador", "mono arana", "mono araña",
            "saraguato", "tapir", "tapires", "venado", "venados", "temazate", "pecari",
            "pecarí", "jabali", "jabalí", "murcielago", "murciélago", "murcielagos",
            "armadillo", "armadillos", "oso hormiguero", "tamandua", "tamandúa", "coati",
            "coatí", "tejon", "tejón", "mapache", "mapaches", "nutria", "nutrias",
            "tlacuache", "tlacuaches", "comadreja", "zorrillo", "cacomixtle", "tepezcuintle",
            "serete", "guatusa"
        ],
        "palabras": [
            "mamifero", "mamiferos", "mamífero", "mamíferos", "mammalia", "glandulas mamarias",
            "glándulas mamarias", "pelaje", "pelo", "amamantar", "gestacion", "gestación",
            "viviparo", "vivíparo", "lactancia"
        ]
    },
    "Aves": {
        "nombres": [
            "aguila", "águila", "aguilas", "águilas", "harpia", "harpía", "halcon",
            "halcón", "gavilan", "gavilán", "buho", "búho", "tecolote", "lechuza",
            "quetzal", "quetzales", "tucan", "tucán", "tucanes", "tucancillo", "guacamaya",
            "guacamayas", "loro", "loros", "perico", "pericos", "cotorra", "cotorras",
            "hocofaisan", "hocofaisán", "chachalaca", "chachalacas", "pajuil", "tinamu",
            "tinamú", "garza", "garzas", "pelicano", "pelícano", "colibri", "colibrí",
            "carpintero", "zopilote", "rey zopilote", "pajaro", "pájaro", "pajaros", "pájaros"
        ],
        "palabras": [
            "ave", "aves", "pluma", "plumas", "plumaje", "pico", "alas", "vuelo",
            "nidificacion", "nidificación", "empollar", "oviparo", "ovíparo"
        ]
    },
    "Cocodrilos": {
        "nombres": [
            "cocodrilo", "cocodrilos", "caiman", "caimán", "caimanes", "aligator", "aligátor"
        ],
        "palabras": [
            "crocodylia", "crocodilia", "osteodermos", "escudos oseos", "escudos óseos",
            "cocodriliano", "cocodrilianos"
        ]
    },
    "Reptiles": {
        "nombres": [
            "serpiente", "serpientes", "vibora", "víbora", "viboras", "víboras", "nauyaca",
            "nauyacas", "cascabel", "coralillo", "boa", "boas", "mazacuata", "culebra",
            "culebras", "iguana", "iguanas", "garrobo", "garrobos", "lagarto", "lagartos",
            "lagartija", "lagartijas", "gecko", "geckos", "tortuga", "tortugas", "dragoncito",
            "dragoncitos", "abronia", "camaleon", "camaleón"
        ],
        "palabras": [
            "reptil", "reptiles", "reptilia", "escamas", "muda de piel", "veneno",
            "foseta loreal", "squamata", "testudines"
        ]
    },
    "Arácnidos": {
        "nombres": [
            "tarantula", "tarántula", "tarantulas", "tarántulas", "arana", "araña",
            "aranas", "arañas", "escorpion", "escorpión", "escorpiones", "alacran",
            "alacrán", "alacranes", "acaro", "ácaro", "acaros", "ácaros", "opilion", "opilión"
        ],
        "palabras": [
            "aracnido", "arácnido", "aracnidos", "arácnidos", "arachnida", "queliceros",
            "quelíceros", "pedipalpos", "ocho patas", "cefalotorax", "cefalotórax", "telarana", "telaraña"
        ]
    },
    "Insectos": {
        "nombres": [
            "mariposa", "mariposas", "escarabajo", "escarabajos", "hormiga", "hormigas",
            "abeja", "abejas", "avispa", "avispas", "libelula", "libélula", "saltamontes",
            "grillo", "grillos", "mantis", "chinche", "chinches", "termita", "termitas"
        ],
        "palabras": [
            "insecto", "insectos", "insecta", "seis patas", "exoesqueleto", "antenas",
            "cabeza torax y abdomen"
        ]
    },
    "Invertebrados": {
        "nombres": [
            "caracol", "caracoles", "babosa", "babosas", "lombriz", "lombrices",
            "ciempies", "ciempiés", "milpies", "milpiés", "cangrejo", "cangrejos", "acocil", "acociles"
        ],
        "palabras": [
            "invertebrado", "invertebrados", "invertebrata", "sin columna vertebral", "molusco", "anelido", "anélido"
        ]
    }
}


def normalizar_clase_biologica(clase_raw):
    """Normaliza cualquier texto de clase biológica a una de las 8 clases oficiales del ZooMAT."""
    if not clase_raw or clase_raw in ["No especificado", "No especificada", "General", ""]:
        return "No especificada"
    
    limpio = re.sub(r'[\(\)\[\]:,\.]', '', clase_raw).strip()
    norm = unicodedata.normalize("NFD", limpio.lower())
    sin_acento = "".join(c for c in norm if unicodedata.category(c) != "Mn").strip()
    
    if sin_acento in MAPA_CLASES_CANONICAS:
        return MAPA_CLASES_CANONICAS[sin_acento]
        
    for clave, clase_oficial in MAPA_CLASES_CANONICAS.items():
        if re.search(rf'\b{re.escape(clave)}\b', sin_acento):
            return clase_oficial
            
    for oficial in CLASES_OFICIALES_ZOOMAT:
        norm_oficial = "".join(c for c in unicodedata.normalize("NFD", oficial.lower()) if unicodedata.category(c) != "Mn")
        if norm_oficial in sin_acento or sin_acento in norm_oficial:
            return oficial
            
    return clase_raw.strip().capitalize()


def inferir_familia_desde_texto(texto):
    """
    Busca términos zoológicos con sufijo taxonómico latino de familia o subfamilia
    (-idae, -inae) en las primeras líneas o párrafos de encabezado del documento.
    """
    if not texto:
        return None
        
    lineas = [l.strip() for l in texto.splitlines() if l.strip()]
    texto_encabezado = "\n".join(lineas[:35])
    
    patron = r'\b([A-Za-z]{2,}(?:idae|inae))\b'
    coincidencias = re.findall(patron, texto_encabezado, flags=re.IGNORECASE)
    
    if coincidencias:
        return coincidencias[0].capitalize()
        
    return None


def inferir_clase_desde_texto(texto, nombre_comun="", familia_detectada=""):
    """
    Infiere la clase biológica entre las 8 oficiales del ZooMAT basándose en:
    1. Si la familia detectada está mapeada a una clase.
    2. Vocabulario y palabras clave en el nombre común y cuerpo del texto.
    """
    # 1. Si la familia pertenece a un mapeo conocido
    if familia_detectada:
        fam_norm = unicodedata.normalize("NFD", familia_detectada.lower())
        fam_sin_acento = "".join(c for c in fam_norm if unicodedata.category(c) != "Mn").strip()
        if fam_sin_acento in MAPA_FAMILIA_A_CLASE:
            return MAPA_FAMILIA_A_CLASE[fam_sin_acento]
            
    # 2. Puntuación por vocabulario
    texto_norm = unicodedata.normalize("NFD", (texto or "").lower())
    texto_sin = "".join(c for c in texto_norm if unicodedata.category(c) != "Mn")
    
    nombre_norm = unicodedata.normalize("NFD", (nombre_comun or "").lower())
    nombre_sin = "".join(c for c in nombre_norm if unicodedata.category(c) != "Mn")
    
    puntuaciones = {clase: 0 for clase in CLASES_OFICIALES_ZOOMAT}
    
    for clase, datos in VOCABULARIO_CLASES.items():
        # Coincidencia en nombre común (máximo peso)
        for nom in datos["nombres"]:
            nom_sin = "".join(c for c in unicodedata.normalize("NFD", nom.lower()) if unicodedata.category(c) != "Mn")
            if re.search(rf'\b{re.escape(nom_sin)}\b', nombre_sin):
                puntuaciones[clase] += 10
                break
                
        # Coincidencia en el texto
        for nom in datos["nombres"]:
            nom_sin = "".join(c for c in unicodedata.normalize("NFD", nom.lower()) if unicodedata.category(c) != "Mn")
            if re.search(rf'\b{re.escape(nom_sin)}\b', texto_sin):
                puntuaciones[clase] += 3
                
        for pal in datos["palabras"]:
            pal_sin = "".join(c for c in unicodedata.normalize("NFD", pal.lower()) if unicodedata.category(c) != "Mn")
            if re.search(rf'\b{re.escape(pal_sin)}\b', texto_sin):
                puntuaciones[clase] += 1

    clase_ganadora = max(puntuaciones, key=puntuaciones.get)
    if puntuaciones[clase_ganadora] > 0:
        return clase_ganadora
        
    return "No especificada"


def extraer_metadatos_especie(texto, nombre_comun=""):
    """
    Extrae los nombres y atributos biológicos de la especie desde las etiquetas de una ficha
    o infiere automáticamente la taxonomía (Clase y Familia) a partir del texto y el nombre común.
    """
    patrones = {
        "nombre_cientifico": (
            r"^\s*(?:Especie\s*/\s*)?Nombre\s+Cient[ií]fico\s*:\s*(.+?)\s*$",
            r"^\s*Especie\s*:\s*(.+?)\s*$",
            r"^\s*Scientific\s+Name\s*:\s*(.+?)\s*$"
        ),
        "nombre_comun": (
            r"^\s*Nombre\s+Com[uú]n\s*:\s*(.+?)\s*$",
            r"^\s*Nombre\s+Popular\s*:\s*(.+?)\s*$",
            r"^\s*Common\s+Name\s*:\s*(.+?)\s*$"
        ),
        "clase": (
            r"^\s*Clase\s+biol[oó]gica\s*:\s*(.+?)\s*$",
            r"^\s*Clase\s*:\s*(.+?)\s*$",
            r"^\s*Class\s*:\s*(.+?)\s*$",
            r"^\s*Grupo\s+taxon[oó]mico\s*:\s*(.+?)\s*$",
            r"^\s*Grupo\s*:\s*(.+?)\s*$"
        ),
        "familia": (
            r"^\s*Familia\s*(?:biol[oó]gica)?\s*:\s*(.+?)\s*$",
            r"^\s*Familia\s*:\s*(.+?)\s*$",
            r"^\s*Family\s*:\s*(.+?)\s*$",
            r"^\s*Subfamilia\s*:\s*(.+?)\s*$",
            r"^\s*Subfamily\s*:\s*(.+?)\s*$"
        ),
        "categoria_conservacion": (
            r"^\s*Categor[ií]a(?:\s+de\s+riesgo)?\s*:\s*(.+?)\s*$",
            r"^\s*Estado\s+de\s+conservaci[oó]n\s*:\s*(.+?)\s*$"
        ),
        "tipo": (
            r"^\s*Tipo(?:\s+de\s+documento)?\s*:\s*(.+?)\s*$",
        ),
    }
    metadatos = {}

    for campo, patrones_campo in patrones.items():
        for linea in (texto or "").splitlines():
            for patron in patrones_campo:
                coincidencia = re.search(patron, linea, flags=re.IGNORECASE)
                if coincidencia:
                    metadatos[campo] = coincidencia.group(1).strip()
                    break
            if campo in metadatos:
                break

    # Detección de documentos temáticos/educativos (mitos, ecología, diferencias, medicina)
    tipo_norm = unicodedata.normalize("NFD", metadatos.get("tipo", "").lower())
    tipo_sin = "".join(c for c in tipo_norm if unicodedata.category(c) != "Mn")
    nom_check = unicodedata.normalize("NFD", (metadatos.get("nombre_comun") or nombre_comun or "").lower())
    nom_sin = "".join(c for c in nom_check if unicodedata.category(c) != "Mn")
    es_tematico = (
        "tematic" in tipo_sin
        or any(t in nom_sin for t in ["mitos", "diferencias", "importancia ecologica", "ecologia y medicina", "adaptaciones de anfibios"])
    )
    metadatos["es_tematico"] = "si" if es_tematico else "no"

    # Si se proporcionó un nombre común alternativo y no se encontró en las etiquetas
    if (not metadatos.get("nombre_comun") or metadatos["nombre_comun"] in ["No especificado", ""]) and nombre_comun:
        metadatos["nombre_comun"] = nombre_comun

    # 1. Normalización / Inferencia de Familia
    if es_tematico:
        metadatos["familia"] = "No especificada"
    elif "familia" in metadatos:
        fam_limpia = re.sub(r'[\(\)\[\]]', '', metadatos["familia"]).strip()
        fam_limpia = fam_limpia.split(",")[0].strip()
        if fam_limpia.lower() in ["no especificado", "no especificada", "general", ""]:
            del metadatos["familia"]
        else:
            metadatos["familia"] = fam_limpia.capitalize()

    if "familia" not in metadatos:
        fam_latina = inferir_familia_desde_texto(texto)
        if fam_latina:
            metadatos["familia"] = fam_latina
        else:
            metadatos["familia"] = "No especificada"

    # 2. Normalización / Inferencia de Clase
    if "clase" in metadatos:
        clase_norm = normalizar_clase_biologica(metadatos["clase"])
        if clase_norm != "No especificada":
            metadatos["clase"] = clase_norm
        else:
            del metadatos["clase"]

    if "clase" not in metadatos:
        clase_inf = inferir_clase_desde_texto(
            texto,
            nombre_comun=metadatos.get("nombre_comun", "") or nombre_comun,
            familia_detectada=metadatos.get("familia", "")
        )
        metadatos["clase"] = clase_inf if clase_inf else "No especificada"

    # Valores por defecto para el resto
    metadatos.setdefault("nombre_cientifico", "No especificado")
    metadatos.setdefault("nombre_comun", "No especificado")
    metadatos.setdefault("categoria_conservacion", "No especificado")
    metadatos.setdefault("clase", "No especificada")
    metadatos.setdefault("familia", "No especificada")

    return metadatos


def nombre_comun_desde_archivo(archivo):
    """Obtiene el nombre común a partir del nombre del archivo."""
    nombre, _ = os.path.splitext(archivo)
    nombre = nombre.replace("-", " ").replace("_", " ").strip()
    if re.match(r'^de\s+', nombre, flags=re.IGNORECASE):
        nombre = re.sub(r'^de\s+', '', nombre, flags=re.IGNORECASE).strip()
    return nombre

def extraer_taxonomia_de_ruta(ruta_raiz, ruta_base):
    """
    Extrae Clase y Familia biológica limpias a partir de la estructura de carpetas.
    Soporta:
    - 3 niveles: Clase / Familia / Ejemplar.docx -> (Clase, Familia)
    - 2 niveles: Clase / Ejemplar.docx -> (Clase, "No especificada")
    - 1 nivel (raíz): Ejemplar.docx en la raíz de documentos_zoomat -> ("", "") pendientes de inferir
    - Excepción institucional: documentos en 'Institucional/' o con 'institucional'/'historia' -> ("General", "No especificada")
    """
    nombre_archivo = ""
    if os.path.isfile(ruta_raiz) or any(ruta_raiz.lower().endswith(ext) for ext in ['.docx', '.pdf', '.txt', '.doc']):
        nombre_archivo = os.path.basename(ruta_raiz)
        ruta_dir = os.path.dirname(ruta_raiz)
    else:
        ruta_dir = ruta_raiz

    relativa = os.path.relpath(ruta_dir, ruta_base)
    partes = [re.sub(r'\s*\d+$', '', p).strip() for p in relativa.split(os.sep) if p and p != '.']
    
    # Excepción para documentos históricos / institucionales
    es_institucional = False
    if partes and partes[0].lower() in ["institucional", "general", "historia"]:
        es_institucional = True
    elif nombre_archivo and any(palabra in nombre_archivo.lower() for palabra in ["institucional", "historia"]):
        es_institucional = True
        
    if es_institucional:
        return "General", "No especificada"

    if len(partes) >= 2:
        clase = partes[0]
        familia = partes[1]
    elif len(partes) == 1:
        clase = partes[0]
        familia = "No especificada"
    else:
        # Archivo suelto en la raíz de documentos_zoomat (0 subcarpetas)
        clase = ""
        familia = ""
        
    return clase, familia

def _asignar_metadatos_docs(docs, clase_taxo, familia_taxo, metadatos_especie, nombre_comun_archivo, cientifico_default="No especificado"):
    """Aplica resolución unificada de clase, familia, nombre común y marca temática sobre un lote de documentos."""
    if clase_taxo and clase_taxo not in ["No especificada", "No especificado", ""]:
        clase_final = clase_taxo
    else:
        clase_doc = metadatos_especie.get("clase")
        if clase_doc and clase_doc not in ["No especificada", "No especificado", "General", ""]:
            clase_final = clase_doc
        elif clase_taxo == "General":
            clase_final = "General"
        else:
            clase_final = "No especificada"

    if familia_taxo and familia_taxo not in ["No especificada", "No especificado", "General", ""]:
        familia_final = familia_taxo
    else:
        fam_doc = metadatos_especie.get("familia")
        if fam_doc and fam_doc not in ["No especificado", "No especificada", "General", ""]:
            familia_final = fam_doc
        else:
            familia_final = "No especificada"

    nombre_final = metadatos_especie.get('nombre_comun')
    if not nombre_final or nombre_final in ["No especificado", "No especificada", ""]:
        nombre_final = nombre_comun_archivo

    for doc in docs:
        doc.metadata['clase'] = clase_final
        doc.metadata.update(metadatos_especie)
        doc.metadata['clase'] = clase_final
        doc.metadata['familia'] = familia_final
        doc.metadata['categoria'] = familia_final
        doc.metadata['nombre_comun'] = nombre_final
        doc.metadata['es_tematico'] = metadatos_especie.get('es_tematico', 'no')
        if doc.metadata.get('nombre_cientifico') in [None, "No especificado"]:
            doc.metadata['nombre_cientifico'] = cientifico_default

    return clase_final, familia_final, nombre_final


def cargar_documentos(ruta):
    print("Iniciando lectura recursiva de documentos...")
    documentos = []
    
    for raiz, directorios, archivos in os.walk(ruta):
        for archivo in archivos:
            if archivo.startswith('~$') or archivo.startswith('.'):
                continue
                
            ruta_completa = os.path.join(raiz, archivo)
            clase_taxo, familia_taxo = extraer_taxonomia_de_ruta(ruta_completa, ruta)
            nombre_comun_archivo = nombre_comun_desde_archivo(archivo)
            extension = os.path.splitext(archivo)[1].lower()

            if extension == '.pdf':
                try:
                    loader = PyPDFLoader(ruta_completa)
                    docs = loader.load()
                    texto_pdf = "\n".join(doc.page_content for doc in docs)
                    metadatos_especie = extraer_metadatos_especie(texto_pdf, nombre_comun=nombre_comun_archivo)
                    clase_final, familia_final, _ = _asignar_metadatos_docs(
                        docs, clase_taxo, familia_taxo, metadatos_especie, nombre_comun_archivo,
                        cientifico_default=metadatos_especie.get('nombre_cientifico', "No especificado")
                    )
                    documentos.extend(docs)
                    print(f"Cargado PDF: {archivo} (Clase: {clase_final}, Familia: {familia_final})")
                except Exception as e:
                    print(f"[ALERTA] ERROR saltado en {archivo}: {e}")
                    
            elif extension == '.docx':
                try:
                    loader = Docx2txtLoader(ruta_completa)
                    docs = loader.load()
                    texto_ficha = "\n".join(doc.page_content for doc in docs)
                    metadatos_especie = extraer_metadatos_especie(texto_ficha, nombre_comun=nombre_comun_archivo)
                    clase_final, familia_final, _ = _asignar_metadatos_docs(
                        docs, clase_taxo, familia_taxo, metadatos_especie, nombre_comun_archivo,
                        cientifico_default=metadatos_especie.get('nombre_cientifico', "No especificado")
                    )
                    documentos.extend(docs)
                    print(f"Cargado DOCX: {archivo} (Clase: {clase_final}, Familia: {familia_final}, Científico: {metadatos_especie.get('nombre_cientifico', 'N/A')})")
                except Exception as e:
                    print(f"[ALERTA] ERROR saltado en {archivo}. Detalle: {e}")
            elif extension == '.txt':
                for enc in ['utf-8', 'latin-1']:
                    try:
                        loader = TextLoader(ruta_completa, encoding=enc)
                        docs = loader.load()
                        texto_txt = "\n".join(doc.page_content for doc in docs)
                        metadatos_especie = extraer_metadatos_especie(texto_txt, nombre_comun=nombre_comun_archivo)
                        clase_final, familia_final, nombre_final = _asignar_metadatos_docs(
                            docs, clase_taxo, familia_taxo, metadatos_especie, nombre_comun_archivo,
                            cientifico_default="No aplica"
                        )
                        documentos.extend(docs)
                        print(f"Cargado TXT ({enc}): {archivo} (Clase: {clase_final}, Familia: {familia_final}, Nombre: {nombre_final}, Temático: {metadatos_especie.get('es_tematico')})")
                        break
                    except Exception as e:
                        if enc == 'latin-1':
                            print(f"[ALERTA] ERROR saltado en TXT {archivo}. Detalle: {e}")
            
    return documentos

def procesar_e_indexar():
    # --- Borrado automático de la base de datos anterior ---
    if os.path.exists(RUTA_BASE_DATOS):
        print(f"[INFO] Detectada base de datos antigua. Borrando '{RUTA_BASE_DATOS}' para evitar duplicados...")
        shutil.rmtree(RUTA_BASE_DATOS, ignore_errors=True)
        print("[EXITO] Base de datos anterior eliminada con éxito.\n")
    # --------------------------------------------------------------

    # 2. Extraer el texto bruto
    docs_brutos = cargar_documentos(RUTA_DOCUMENTOS)
    
    if not docs_brutos:
        print("No se encontraron documentos válidos en la carpeta.")
        return

    # 3. Conservamos fichas biológicas completas y fragmentamos documentos institucionales y temáticos por bloques
    splitter_institucional = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=150,
        separators=["\n\n", "\n", ". ", " "]
    )
    splitter_tematico = RecursiveCharacterTextSplitter(
        chunk_size=750,
        chunk_overlap=100,
        separators=["\n\n", "\n", ". ", " "]
    )
    docs_fragmentados = []
    for doc in docs_brutos:
        if doc.metadata.get('es_tematico') == 'si':
            sub_docs = splitter_tematico.split_documents([doc])
            docs_fragmentados.extend(sub_docs)
        elif doc.metadata.get('clase') == 'General' or doc.metadata.get('nombre_comun') == 'Historia del ZooMAT':
            sub_docs = splitter_institucional.split_documents([doc])
            docs_fragmentados.extend(sub_docs)
        else:
            docs_fragmentados.append(doc)

    print(f"\nSe prepararon {len(docs_fragmentados)} fragmentos/documentos para la indexación.")

    # 4. Vectorización (Embeddings)
    print("Cargando modelo de Embeddings...")
    try:
        modelo_embeddings = HuggingFaceEmbeddings(
            model_name="paraphrase-multilingual-MiniLM-L12-v2",
            model_kwargs={"local_files_only": True}
        )
    except Exception:
        modelo_embeddings = HuggingFaceEmbeddings(
            model_name="paraphrase-multilingual-MiniLM-L12-v2"
        )

    # 5. Creación y guardado en ChromaDB
    print("Guardando vectores en nueva ChromaDB...")
    vectorstore = Chroma.from_documents(
        documents=docs_fragmentados,
        embedding=modelo_embeddings,
        persist_directory=RUTA_BASE_DATOS
    )
    
    print(f"¡Éxito! Base de datos vectorial limpia y creada en la carpeta: {RUTA_BASE_DATOS}")

if __name__ == "__main__":
    procesar_e_indexar()

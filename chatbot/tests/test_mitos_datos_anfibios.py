import re
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


CASOS_NIVEL_1 = [
    # --- Mito 1: Verrugas (ES / EN) ---
    {
        "id": "ANF-01",
        "tema": "Mito verrugas",
        "idioma": "es",
        "pregunta": "¿Si toco una rana o un sapo me salen verrugas?",
        "keywords_esperadas": ["vph", "virus", "falso", "glandulas parotidas"],
        "nivel2": True,
        "desmentir_mito": True,
    },
    {
        "id": "ANF-02",
        "tema": "Tocar sapo mito",
        "idioma": "es",
        "pregunta": "¿Qué pasa si toco un sapo con las manos?",
        "keywords_esperadas": ["verrugas", "falso", "lavarse", "manos"],
    },
    {
        "id": "ANF-03",
        "tema": "Mito verrugas EN",
        "idioma": "en",
        "pregunta": "Do toads give you warts if you touch them?",
        "keywords_esperadas": ["verrugas", "vph", "glandulas parotidas"],
    },
    # --- Mito 2: Orina y ceguera (ES / EN) ---
    {
        "id": "ANF-04",
        "tema": "Mito orina y ceguera",
        "idioma": "es",
        "pregunta": "¿La orina de sapo quema la piel o deja ciego?",
        "keywords_esperadas": ["orina", "estres", "urea", "ceguera"],
        "nivel2": True,
        "desmentir_mito": True,
    },
    {
        "id": "ANF-05",
        "tema": "Mito orina EN",
        "idioma": "en",
        "pregunta": "Can toad urine make people go blind?",
        "keywords_esperadas": ["orina", "ceguera", "estres", "urea"],
    },
    # --- Mito 3: Escupir veneno (ES / EN) ---
    {
        "id": "ANF-06",
        "tema": "Mito escupir veneno",
        "idioma": "es",
        "pregunta": "¿Los sapos escupen veneno a los ojos?",
        "keywords_esperadas": ["escupen", "lengua pegajosa", "toxinas", "depredadores"],
        "nivel2": True,
        "desmentir_mito": True,
    },
    {
        "id": "ANF-07",
        "tema": "Mito escupir EN",
        "idioma": "en",
        "pregunta": "Do frogs spit poison into your eyes?",
        "keywords_esperadas": ["escupen", "lengua", "toxinas"],
    },
    # --- Mito 4: Mordida del sapo ---
    {
        "id": "ANF-08",
        "tema": "Mito mordida sapo",
        "idioma": "es",
        "pregunta": "¿Qué pasa si me muerde un sapo, es venenosa su mordida?",
        "keywords_esperadas": ["mordida", "falso", "venenosa"],
        "nivel2": True,
        "desmentir_mito": True,
    },
    # --- Mito 5: Sapo fumando ---
    {
        "id": "ANF-09",
        "tema": "Mito sapo fuma",
        "idioma": "es",
        "pregunta": "¿Es verdad que los sapos fuman cigarros?",
        "keywords_esperadas": ["cigarrillos", "humo", "pulmones", "maltrato"],
        "nivel2": True,
        "desmentir_mito": True,
    },
    {
        "id": "ANF-10",
        "tema": "Maltrato cigarrillo sapo",
        "idioma": "es",
        "pregunta": "¿Qué ocurre si alguien le acerca un cigarrillo encendido a un sapo?",
        "keywords_esperadas": ["cigarrillos", "humo", "muere"],
    },
    # --- Mito 6: Canto nupcial y lluvia de sapos (ES / EN) ---
    {
        "id": "ANF-11",
        "tema": "Canto cuando llueve",
        "idioma": "es",
        "pregunta": "¿Por qué cantan los sapos y las ranas cuando llueve?",
        "keywords_esperadas": ["canto nupcial", "hembras", "presion atmosferica"],
    },
    {
        "id": "ANF-12",
        "tema": "Pedir lluvia mito",
        "idioma": "es",
        "pregunta": "¿Cantan los sapos para pedir lluvia?",
        "keywords_esperadas": ["canto nupcial", "hembras", "humedad"],
        "nivel2": True,
        "desmentir_mito": True,
    },
    {
        "id": "ANF-13",
        "tema": "Lluvia de sapos y ritos",
        "idioma": "es",
        "pregunta": "¿Existen las lluvias de ranas o sapos y ritos en Australia o Amazonas?",
        "keywords_esperadas": ["trombas marinas", "tornados", "australia", "amazonas"],
    },
    {
        "id": "ANF-14",
        "tema": "Canto lluvia EN",
        "idioma": "en",
        "pregunta": "Why do frogs sing before rain?",
        "keywords_esperadas": ["canto nupcial", "presion atmosferica", "charcas"],
    },
    # --- Tema: Luz artificial y casas (ES / EN) ---
    {
        "id": "ANF-15",
        "tema": "Sapos en casas lluvias",
        "idioma": "es",
        "pregunta": "¿Por qué entran sapos a mi casa en temporada de lluvias?",
        "keywords_esperadas": ["luz artificial", "focos", "artropodos", "insectos"],
        "nivel2": True,
    },
    {
        "id": "ANF-16",
        "tema": "Sapos y focos EN",
        "idioma": "en",
        "pregunta": "Why do toads enter houses near artificial lights at night?",
        "keywords_esperadas": ["luz artificial", "focos", "insectos"],
    },
    # --- Bloque 1: Diferencias anatómicas, agua y adaptaciones ---
    {
        "id": "ANF-17",
        "tema": "Diferencia rana y sapo",
        "idioma": "es",
        "pregunta": "¿Las ranas y los sapos son iguales o cuál es su diferencia?",
        "keywords_esperadas": ["piel suave", "piel rugosa", "glandulas parotidas", "patas"],
        "nivel2": True,
    },
    {
        "id": "ANF-18",
        "tema": "Diferencia rana y sapo EN",
        "idioma": "en",
        "pregunta": "What is the difference between a frog and a toad?",
        "keywords_esperadas": ["piel suave", "piel rugosa", "patas"],
    },
    {
        "id": "ANF-19",
        "tema": "Cecilias y salamandras",
        "idioma": "es",
        "pregunta": "¿Las cecilias y las salamandras son anfibios o lagartijas?",
        "keywords_esperadas": ["cecilias", "salamandras", "culebras", "lagartijas"],
    },
    {
        "id": "ANF-20",
        "tema": "Importancia del agua",
        "idioma": "es",
        "pregunta": "¿Cuál es la importancia del agua en el ciclo de vida de los anfibios?",
        "keywords_esperadas": ["huevos", "eclosionar", "renacuajos", "deshidratarse"],
    },
    {
        "id": "ANF-21",
        "tema": "Adaptaciones agua y tierra ES",
        "idioma": "es",
        "pregunta": "¿Por qué los anfibios pueden vivir en el agua y en la tierra?",
        "keywords_esperadas": ["branquias", "pulmones", "parpados", "piel especial"],
    },
    {
        "id": "ANF-22",
        "tema": "Adaptaciones agua y tierra EN",
        "idioma": "en",
        "pregunta": "How can amphibians live in both water and on land?",
        "keywords_esperadas": ["branquias", "pulmones", "parpados"],
    },
    # --- Bloque 3: Sapo Borracho / Rhinophrynus dorsalis / Chaac ---
    {
        "id": "ANF-23",
        "tema": "Sapo Borracho origen",
        "idioma": "es",
        "pregunta": "¿Qué es el famoso Sapo Borracho y por qué se llama así?",
        "keywords_esperadas": ["rhinophrynus dorsalis", "fosil viviente", "mugido", "canto nupcial"],
        "nivel2": True,
    },
    {
        "id": "ANF-24",
        "tema": "Sapo de rebaño y Chaac maya",
        "idioma": "es",
        "pregunta": "¿Qué simbolizaba el sapo de rebaño o Rhinophrynus dorsalis para los mayas y Chaac?",
        "keywords_esperadas": ["chaac", "mayas", "cosechas", "sagrados"],
    },
    {
        "id": "ANF-25",
        "tema": "Sapo Borracho EN",
        "idioma": "en",
        "pregunta": "What is Rhinophrynus dorsalis and why is it called Sapo Borracho?",
        "keywords_esperadas": ["rhinophrynus dorsalis", "fosil viviente", "chaac"],
    },
    # --- Bloque 4: Toxicidad, Medicina, Plagas, Bioturbación, Bioindicadores, Conservación ---
    {
        "id": "ANF-26",
        "tema": "Toxicidad Chiapas vs Dendrobátidos",
        "idioma": "es",
        "pregunta": "¿Todos los anfibios de Chiapas son venenosos o qué son las ranas dardo?",
        "keywords_esperadas": ["inofensivos", "dendrobatidae", "aposematismo"],
    },
    {
        "id": "ANF-27",
        "tema": "Medicina caeruleína y fármacos",
        "idioma": "es",
        "pregunta": "¿Para qué sirven las toxinas de los anfibios en la medicina humana?",
        "keywords_esperadas": ["caeruleina", "analgesicos", "cardiacos", "epibatidinas"],
        "nivel2": True,
    },
    {
        "id": "ANF-28",
        "tema": "Pseudin-2 y diabetes tipo 2",
        "idioma": "es",
        "pregunta": "¿Qué compuesto de rana ayuda contra la diabetes tipo 2?",
        "keywords_esperadas": ["pseudin-2", "diabetes", "colombiano"],
    },
    {
        "id": "ANF-29",
        "tema": "Medicina EN",
        "idioma": "en",
        "pregunta": "How are amphibian toxins used in medicine and diabetes research?",
        "keywords_esperadas": ["caeruleina", "pseudin-2", "diabetes"],
    },
    {
        "id": "ANF-30",
        "tema": "Control de plagas dengue malaria zika",
        "idioma": "es",
        "pregunta": "¿Cómo ayudan las ranas y sapos contra plagas, dengue, malaria y zika?",
        "keywords_esperadas": ["dengue", "malaria", "zika", "mosquitos", "cosechas"],
    },
    {
        "id": "ANF-31",
        "tema": "Bioturbación ES",
        "idioma": "es",
        "pregunta": "¿Qué es la bioturbación de los renacuajos y anfibios en el agua?",
        "keywords_esperadas": ["bioturbacion", "sedimentos", "oxigena", "nutrientes"],
        "nivel2": True,
    },
    {
        "id": "ANF-32",
        "tema": "Bioturbación EN",
        "idioma": "en",
        "pregunta": "What is amphibian bioturbation in aquatic environments?",
        "keywords_esperadas": ["bioturbacion", "sedimentos", "nutrientes"],
    },
    {
        "id": "ANF-33",
        "tema": "Bioindicadores ES",
        "idioma": "es",
        "pregunta": "¿Por qué los anfibios son bioindicadores de salud ambiental?",
        "keywords_esperadas": ["bioindicadores", "piel altamente permeable", "contaminantes", "cambio climatico"],
    },
    {
        "id": "ANF-34",
        "tema": "Bioindicadores EN",
        "idioma": "en",
        "pregunta": "Why are amphibians good bioindicators of environmental health?",
        "keywords_esperadas": ["bioindicadores", "contaminantes", "salud"],
    },
    {
        "id": "ANF-35",
        "tema": "Amenazas y conservación ES",
        "idioma": "es",
        "pregunta": "¿Cuáles son las amenazas de los anfibios y cómo podemos protegerlos si entra un sapo al patio?",
        "keywords_esperadas": ["reubicarse", "manos", "hongos", "charcas"],
        "nivel2": True,
    },
    {
        "id": "ANF-36",
        "tema": "Protección EN",
        "idioma": "en",
        "pregunta": "How can we protect frogs and toads if we find one at home?",
        "keywords_esperadas": ["reubicarse", "hongos", "lastimar", "fauna silvestre"],
    },
]


class TestInventarioYDeteccionAnfibios:
    """Valida metadatos limpios en inventario dinámico y detección del Sapo Borracho."""

    def test_documentos_tematicos_no_contaminan_catalogo_especies(self):
        especies_globales = app.obtener_especies_registradas()
        especies_anfibios = app.obtener_especies_registradas("anfibios")

        titulos_prohibidos = [
            "mitos y realidades",
            "diferencias y adaptaciones",
            "importancia ecologica",
            "ecologia y medicina",
        ]
        for lista in (especies_globales, especies_anfibios):
            for esp in lista:
                esp_n = norm(esp)
                assert not any(t in esp_n for t in titulos_prohibidos), (
                    f"Documento temático contaminó el inventario de especies: '{esp}'"
                )

    def test_sapo_borracho_registrado_y_detectado(self):
        anfibios = [norm(e) for e in app.obtener_especies_registradas("anfibios")]
        assert "sapo borracho" in anfibios, "Sapo borracho debe figurar en obtener_especies_registradas('anfibios')"

        for consulta in [
            "¿Qué es el Sapo Borracho?",
            "Háblame del sapo de rebaño",
            "¿Qué sabes de Rhinophrynus dorsalis?",
        ]:
            detectada = motor_rag.detectar_especie(consulta)
            assert detectada is not None and norm(detectada) == "sapo borracho", (
                f"Para '{consulta}' se esperaba 'Sapo borracho', pero detectó '{detectada}'"
            )

    @pytest.mark.parametrize("pregunta", [
        "¿Qué pasa si toco un sapo?",
        "¿Si toco una rana me salen verrugas?",
        "¿Qué pasa si me muerde un sapo?",
        "¿Por qué entran sapos a mi casa?",
        "¿Es verdad que los sapos fuman cigarro?",
        "¿Qué es el famoso Sapo Borracho?",
    ])
    def test_enrutador_y_filtros_no_desvian_mitos_a_mysql(self, pregunta):
        decision = enrutador_semantico.analizar_intencion(pregunta)
        assert decision["ruta"] == "rag", f"Fallo enrutamiento en '{pregunta}': {decision}"
        assert app.consultar_catalogo_general(pregunta) is None, f"Catálogo interceptó indebidamente: '{pregunta}'"
        assert app.responder_consulta_existencia_animal(pregunta) is None, f"Existencia interceptó indebidamente: '{pregunta}'"


class TestNivel1RecuperacionTematicaAnfibios:
    """Nivel 1 (<1s por caso, sin LLM ni TTS): 36 casos bilingües de mitos, diferencias, Sapo Borracho y ecología."""

    @pytest.mark.parametrize("caso", CASOS_NIVEL_1, ids=lambda c: f"{c['id']}:{c['tema']}")
    def test_nivel1_enrutamiento_y_contexto(self, caso):
        capturado = {}

        def fake_llama(prompt_usuario, instrucciones_sistema=""):
            capturado["prompt"] = prompt_usuario
            return f"__MOCK_RAG__|{prompt_usuario}"

        with patch("app.preguntar_a_llama", side_effect=fake_llama), \
             patch("app.generar_audio_hibrido") as mock_tts:
            resp = app.procesar_logica_hibrida(caso["pregunta"], idioma=caso["idioma"])
            assert not mock_tts.called, "Prohibido invocar TTS durante las pruebas"

        assert resp.startswith("__MOCK_RAG__|"), (
            f"[{caso['id']}] Se esperaba ruta 'rag', pero cayó en: {resp}"
        )

        contexto_norm = norm(capturado["prompt"])
        for kw in caso["keywords_esperadas"]:
            assert norm(kw) in contexto_norm, (
                f"[{caso['id']}] Falta palabra clave '{kw}' en fragmento recuperado para '{caso['pregunta']}'.\n"
                f"Fragmento:\n{capturado['prompt'][:700]}"
            )


CASOS_NIVEL_2 = [c for c in CASOS_NIVEL_1 if c.get("nivel2")]


class TestNivel2SintesisMitosLlama:
    """Nivel 2 (Integración con Llama 3.1 en Ollama): verifica desmentido científico y formato de voz TTS."""

    @pytest.mark.parametrize("caso", CASOS_NIVEL_2, ids=lambda c: f"{c['id']}:{c['tema']}")
    def test_nivel2_sintesis_mitos_y_datos(self, caso):
        with patch("app.generar_audio_hibrido") as mock_tts:
            resp = app.procesar_logica_hibrida(caso["pregunta"], idioma=caso["idioma"])
            assert not mock_tts.called

        resp_limpia = resp.strip()
        resp_norm = norm(resp_limpia)
        print(f"\n[{caso['id']}] {caso['pregunta']} -> {resp_limpia}")

        # Reglas estrictas de formato para TTS
        assert len(resp_limpia) > 30
        assert "\n" not in resp_limpia, f"[{caso['id']}] Contiene saltos de línea:\n{resp_limpia}"
        assert "*" not in resp_limpia, f"[{caso['id']}] Contiene asteriscos:\n{resp_limpia}"
        assert "$" not in resp_limpia, f"[{caso['id']}] Contiene símbolo '$':\n{resp_limpia}"
        assert not resp_limpia.endswith("?"), f"[{caso['id']}] Termina con pregunta al visitante:\n{resp_limpia}"

        oraciones = [o.strip() for o in re.split(r'(?<!\d)\.(?!\d)\s+', resp_limpia) if o.strip()]
        assert len(oraciones) <= 4, f"[{caso['id']}] Excede 4 oraciones ({len(oraciones)}):\n{resp_limpia}"

        if caso.get("desmentir_mito"):
            marcadores_desmentido = [
                "falso", "no es cierto", "no es verdad", "no producen", "no produce", "no causa",
                "no escupen", "no te saldran", "nunca", "no transmiten",
                "no existe", "no es venenosa", "maltrato", "no cantan para", "no fuma", "mito", "creencia"
            ]
            assert any(m in resp_norm for m in marcadores_desmentido), (
                f"[{caso['id']}] Debió desmentir explícitamente el mito:\n{resp_limpia}"
            )

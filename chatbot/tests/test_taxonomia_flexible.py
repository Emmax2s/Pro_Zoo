import pytest
import os
import motor_rag
from app import obtener_especies_registradas
from ingesta_datos import (
    extraer_taxonomia_de_ruta,
    extraer_metadatos_especie,
    nombre_comun_desde_archivo,
    inferir_familia_desde_texto,
    inferir_clase_desde_texto,
    normalizar_clase_biologica,
    CLASES_OFICIALES_ZOOMAT
)

RUTA_BASE_DOCS = os.path.join(os.path.dirname(os.path.dirname(__file__)), "documentos_zoomat")


class TestTaxonomiaFlexibleRutas:
    """Verifica el comportamiento de extraer_taxonomia_de_ruta en escenarios de 3 niveles, 2 niveles y 1 nivel (raíz)."""

    def test_tres_niveles_con_directorio_familia(self):
        # Escenario A: Clase / Familia
        ruta_dir = os.path.join(RUTA_BASE_DOCS, "Anfibios", "Bufonidae")
        clase, familia = extraer_taxonomia_de_ruta(ruta_dir, RUTA_BASE_DOCS)
        assert clase == "Anfibios"
        assert familia == "Bufonidae"

    def test_tres_niveles_con_archivo_completo(self):
        # Escenario A con ruta al archivo: Clase / Familia / Ejemplar.docx
        ruta_archivo = os.path.join(RUTA_BASE_DOCS, "Anfibios", "Bufonidae", "Sapo centroamericano.docx")
        clase, familia = extraer_taxonomia_de_ruta(ruta_archivo, RUTA_BASE_DOCS)
        assert clase == "Anfibios"
        assert familia == "Bufonidae"

    def test_dos_niveles_sin_carpeta_familia_directorio(self):
        # Escenario B: Clase directa (sin subcarpeta)
        ruta_dir = os.path.join(RUTA_BASE_DOCS, "Anfibios")
        clase, familia = extraer_taxonomia_de_ruta(ruta_dir, RUTA_BASE_DOCS)
        assert clase == "Anfibios"
        assert familia == "No especificada"

    def test_dos_niveles_sin_carpeta_familia_archivo_anfibio(self):
        # Escenario B con archivo directo: Anfibios / Sapo centroamericano.docx
        ruta_archivo = os.path.join(RUTA_BASE_DOCS, "Anfibios", "Sapo centroamericano.docx")
        clase, familia = extraer_taxonomia_de_ruta(ruta_archivo, RUTA_BASE_DOCS)
        assert clase == "Anfibios"
        assert familia == "No especificada"

    def test_dos_niveles_sin_carpeta_familia_archivo_mamifero(self):
        # Escenario B con archivo directo: Mamíferos / Tapir.docx
        ruta_archivo = os.path.join(RUTA_BASE_DOCS, "Mamíferos", "Tapir.docx")
        clase, familia = extraer_taxonomia_de_ruta(ruta_archivo, RUTA_BASE_DOCS)
        assert clase == "Mamíferos"
        assert familia == "No especificada"

    def test_escenario_c_raiz_archivo_suelto_sapo(self):
        # Escenario C: Archivo suelto en la raíz (0 subcarpetas intermedias)
        ruta_archivo = os.path.join(RUTA_BASE_DOCS, "Sapo centroamericano.docx")
        clase, familia = extraer_taxonomia_de_ruta(ruta_archivo, RUTA_BASE_DOCS)
        assert clase == "", "En la raíz debe retornar clase vacía para activar inferencia del texto"
        assert familia == "", "En la raíz debe retornar familia vacía para activar inferencia del texto"

    def test_escenario_c_raiz_archivo_suelto_jaguar(self):
        # Escenario C: Archivo suelto en la raíz (0 subcarpetas intermedias)
        ruta_archivo = os.path.join(RUTA_BASE_DOCS, "Jaguar.docx")
        clase, familia = extraer_taxonomia_de_ruta(ruta_archivo, RUTA_BASE_DOCS)
        assert clase == ""
        assert familia == ""

    def test_escenario_c_raiz_archivo_suelto_aguila(self):
        # Escenario C: Archivo suelto en la raíz (0 subcarpetas intermedias)
        ruta_archivo = os.path.join(RUTA_BASE_DOCS, "Aguila harpia.docx")
        clase, familia = extraer_taxonomia_de_ruta(ruta_archivo, RUTA_BASE_DOCS)
        assert clase == ""
        assert familia == ""

    def test_escenario_c_directorio_raiz(self):
        # Directorio raíz sin subcarpetas
        clase, familia = extraer_taxonomia_de_ruta(RUTA_BASE_DOCS, RUTA_BASE_DOCS)
        assert clase == ""
        assert familia == ""

    def test_archivo_en_raiz_institucional_historia(self):
        # Excepción institucional: archivo en raíz con 'Historia' / 'Institucional'
        ruta_archivo = os.path.join(RUTA_BASE_DOCS, "Historia_Institucional_ZooMAT.docx")
        clase, familia = extraer_taxonomia_de_ruta(ruta_archivo, RUTA_BASE_DOCS)
        assert clase == "General"
        assert familia == "No especificada"

    def test_carpeta_institucional_general(self):
        # Excepción institucional: carpeta Institucional / Archivo.docx
        ruta_archivo = os.path.join(RUTA_BASE_DOCS, "Institucional", "Historia.docx")
        clase, familia = extraer_taxonomia_de_ruta(ruta_archivo, RUTA_BASE_DOCS)
        assert clase == "General"
        assert familia == "No especificada"

    def test_limpieza_sufijos_numericos_en_carpetas(self):
        # Carpetas con números de orden: Aves 1 / Psittacidae 2 / Loro.docx
        ruta_archivo = os.path.join(RUTA_BASE_DOCS, "Aves 1", "Psittacidae 2", "Loro.docx")
        clase, familia = extraer_taxonomia_de_ruta(ruta_archivo, RUTA_BASE_DOCS)
        assert clase == "Aves"
        assert familia == "Psittacidae"


class TestExtraccionMetadatosFamiliaTexto:
    """Verifica la extracción del campo Familia del contenido del documento."""

    def test_extraccion_familia_etiqueta_estandar(self):
        texto = """
        Nombre Común: Tapir centroamericano
        Nombre Científico: Tapirus bairdii
        Familia: Tapiridae
        Categoría de riesgo: En peligro de extinción
        """
        metadatos = extraer_metadatos_especie(texto)
        assert metadatos.get("familia") == "Tapiridae"
        assert metadatos.get("nombre_comun") == "Tapir centroamericano"

    def test_extraccion_familia_etiqueta_biologica(self):
        texto = """
        Nombre Común: Sapo gigante
        Familia biológica: Bufonidae
        Nombre Científico: Rhinella marina
        """
        metadatos = extraer_metadatos_especie(texto)
        assert metadatos.get("familia") == "Bufonidae"

    def test_extraccion_familia_etiqueta_ingles(self):
        texto = """
        Common Name: Jaguar
        Family: Felidae
        Scientific Name: Panthera onca
        """
        metadatos = extraer_metadatos_especie(texto)
        assert metadatos.get("familia") == "Felidae"

    def test_extraccion_familia_morfologica_latina_bufonidae(self):
        # Detección morfológica por sufijo latino -idae en encabezado (sin etiqueta explícita 'Familia:')
        texto = """
        FICHA TÉCNICA DE BIODIVERSIDAD
        El sapo centroamericano es un anuro representativo de la familia Bufonidae en Chiapas.
        Nombre Común: Sapo centroamericano
        Nombre Científico: Incilius bocourti
        """
        metadatos = extraer_metadatos_especie(texto)
        assert metadatos.get("familia") == "Bufonidae"

    def test_extraccion_familia_morfologica_latina_felidae(self):
        texto = """
        INFORMACIÓN TAXONÓMICA
        Especie icónica de carnívoro perteneciente a Felidae, distribuida en selvas tropicales.
        Nombre Común: Ocelote
        Nombre Científico: Leopardus pardalis
        """
        metadatos = extraer_metadatos_especie(texto)
        assert metadatos.get("familia") == "Felidae"

    def test_extraccion_familia_morfologica_latina_accipitridae(self):
        texto = """
        MONITOREO DE RAPACES
        Gran rapaz diurna clasificada dentro de Accipitridae en el dosel de la selva chiapaneca.
        Nombre Común: Águila harpía
        Nombre Científico: Harpia harpyja
        """
        metadatos = extraer_metadatos_especie(texto)
        assert metadatos.get("familia") == "Accipitridae"

    def test_ausencia_total_de_familia_asigna_no_especificada(self):
        texto = """
        Nombre Común: Espécimen Desconocido
        Nombre Científico: Animalus rarus
        Dieta: Omnívoro
        """
        metadatos = extraer_metadatos_especie(texto)
        assert metadatos.get("familia") == "No especificada"


class TestExtraccionMetadatosClaseTexto:
    """Verifica la extracción e inferencia de la Clase biológica."""

    def test_extraccion_clase_etiqueta_estandar(self):
        texto = """
        Nombre Común: Rana de árbol
        Clase: Anfibios
        Familia: Hylidae
        """
        metadatos = extraer_metadatos_especie(texto)
        assert metadatos.get("clase") == "Anfibios"

    def test_extraccion_clase_etiqueta_biologica(self):
        texto = """
        Nombre Común: Mono araña
        Clase biológica: Mamíferos
        Familia: Atelidae
        """
        metadatos = extraer_metadatos_especie(texto)
        assert metadatos.get("clase") == "Mamíferos"

    def test_extraccion_clase_etiqueta_ingles_normalizada(self):
        texto = """
        Common Name: Iguana verde
        Class: Reptilia
        Family: Iguanidae
        """
        metadatos = extraer_metadatos_especie(texto)
        assert metadatos.get("clase") == "Reptiles"

    def test_extraccion_clase_etiqueta_grupo_taxonomico(self):
        texto = """
        Nombre Común: Quetzal
        Grupo taxonómico: Aves
        Familia: Trogonidae
        """
        metadatos = extraer_metadatos_especie(texto)
        assert metadatos.get("clase") == "Aves"

    def test_inferencia_clase_por_mapeo_de_familia(self):
        # Si la clase no viene indicada pero la familia sí, se mapea automáticamente
        texto_anfibio = "Nombre Común: Sapo\nFamilia: Bufonidae\nNombre Científico: Incilius sp."
        assert extraer_metadatos_especie(texto_anfibio)["clase"] == "Anfibios"

        texto_mamifero = "Nombre Común: Jaguar\nFamilia: Felidae\nNombre Científico: Panthera onca"
        assert extraer_metadatos_especie(texto_mamifero)["clase"] == "Mamíferos"

        texto_ave = "Nombre Común: Tucán pico iris\nFamilia: Ramphastidae\nNombre Científico: Ramphastos sulfuratus"
        assert extraer_metadatos_especie(texto_ave)["clase"] == "Aves"

        texto_cocodrilo = "Nombre Común: Caimán de anteojos\nFamilia: Alligatoridae\nNombre Científico: Caiman crocodilus"
        assert extraer_metadatos_especie(texto_cocodrilo)["clase"] == "Cocodrilos"

        texto_reptil = "Nombre Común: Nauyaca real\nFamilia: Viperidae\nNombre Científico: Bothrops asper"
        assert extraer_metadatos_especie(texto_reptil)["clase"] == "Reptiles"

        texto_aracnido = "Nombre Común: Tarántula chiapaneca\nFamilia: Theraphosidae\nNombre Científico: Brachypelma sp."
        assert extraer_metadatos_especie(texto_aracnido)["clase"] == "Arácnidos"

    def test_inferencia_clase_heuristica_por_vocabulario(self):
        # Sin etiquetas de clase ni familia, pero con vocabulario biológico y nombre común
        texto_sapo = """
        El sapo de montaña es un animal de piel rugosa y permeable que realiza su desove en charcas temporales.
        Los renacuajos experimentan una metamorfosis acuática completa antes de salir al andador.
        """
        metadatos_sapo = extraer_metadatos_especie(texto_sapo, nombre_comun="Sapo de montaña")
        assert metadatos_sapo["clase"] == "Anfibios"

        texto_jaguar = """
        El jaguar es el felino más poderoso de la selva Lacandona.
        Posee pelaje amarillento con rosetas, y las hembras amamantan a sus crías tras un periodo de gestación.
        """
        metadatos_jaguar = extraer_metadatos_especie(texto_jaguar, nombre_comun="Jaguar")
        assert metadatos_jaguar["clase"] == "Mamíferos"

        texto_aguila = """
        El águila harpía es un ave rapaz con alas anchas y plumaje denso adaptado para cazar en el dosel de la selva.
        Construye grandes nidos en árboles altos donde empolla sus huevos.
        """
        metadatos_aguila = extraer_metadatos_especie(texto_aguila, nombre_comun="Águila harpía")
        assert metadatos_aguila["clase"] == "Aves"

        texto_cocodrilo = """
        El cocodrilo de río habita en los esteros de Chiapas.
        Posee osteodermos y escudos óseos en el lomo, y mandíbulas fuertes adaptadas para la captura de presas acuáticas.
        """
        metadatos_cocodrilo = extraer_metadatos_especie(texto_cocodrilo, nombre_comun="Cocodrilo de río")
        assert metadatos_cocodrilo["clase"] == "Cocodrilos"

    def test_clase_desconocida_asigna_no_especificada(self):
        texto_neutro = "Ficha descriptiva genérica de una entidad sin descriptores biológicos."
        metadatos = extraer_metadatos_especie(texto_neutro, nombre_comun="Organismo X")
        assert metadatos["clase"] == "No especificada"


class TestEscenariosCompletosIngesta:
    """Valida los 3 escenarios de subida de archivos (3 niveles, 2 niveles y 1 nivel en raíz)."""

    def test_simulacion_escenario_a_tres_niveles(self):
        # Escenario A: Clase / Familia / Ejemplar.docx
        ruta_archivo = os.path.join(RUTA_BASE_DOCS, "Anfibios", "Bufonidae", "Sapo centroamericano.docx")
        clase_taxo, familia_taxo = extraer_taxonomia_de_ruta(ruta_archivo, RUTA_BASE_DOCS)
        assert clase_taxo == "Anfibios"
        assert familia_taxo == "Bufonidae"

        # Simular lectura del documento
        texto = "Nombre Común: Sapo centroamericano\nNombre Científico: Incilius bocourti\nFamilia: Bufonidae"
        metadatos = extraer_metadatos_especie(texto, nombre_comun=nombre_comun_desde_archivo("Sapo centroamericano.docx"))

        # Resolución en ingesta
        clase_final = clase_taxo if clase_taxo not in ["", "No especificada"] else metadatos["clase"]
        familia_final = familia_taxo if familia_taxo not in ["", "No especificada", "General"] else metadatos["familia"]

        assert clase_final == "Anfibios"
        assert familia_final == "Bufonidae"

    def test_simulacion_escenario_b_dos_niveles_sin_carpeta_familia(self):
        # Escenario B: Clase / Ejemplar.docx
        ruta_archivo = os.path.join(RUTA_BASE_DOCS, "Mamíferos", "Tapir centroamericano.docx")
        clase_taxo, familia_taxo = extraer_taxonomia_de_ruta(ruta_archivo, RUTA_BASE_DOCS)
        assert clase_taxo == "Mamíferos"
        assert familia_taxo == "No especificada"

        # El texto contiene la familia
        texto = "Nombre Común: Tapir centroamericano\nFamilia: Tapiridae\nNombre Científico: Tapirus bairdii"
        metadatos = extraer_metadatos_especie(texto, nombre_comun=nombre_comun_desde_archivo("Tapir centroamericano.docx"))

        clase_final = clase_taxo if clase_taxo not in ["", "No especificada"] else metadatos["clase"]
        familia_final = familia_taxo if familia_taxo not in ["", "No especificada", "General"] else metadatos["familia"]

        assert clase_final == "Mamíferos"
        assert familia_final == "Tapiridae"

    def test_simulacion_escenario_c_raiz_sapo_centroamericano(self):
        # Escenario C: Archivo suelto en la raíz documentos_zoomat / Sapo centroamericano.docx
        ruta_archivo = os.path.join(RUTA_BASE_DOCS, "Sapo centroamericano.docx")
        clase_taxo, familia_taxo = extraer_taxonomia_de_ruta(ruta_archivo, RUTA_BASE_DOCS)
        assert clase_taxo == ""
        assert familia_taxo == ""

        # Texto del archivo con mención de familia Bufonidae y nombre científico
        texto = """
        El sapo centroamericano es un anuro de la familia Bufonidae.
        Nombre Común: Sapo centroamericano
        Nombre Científico: Incilius bocourti
        """
        metadatos = extraer_metadatos_especie(texto, nombre_comun=nombre_comun_desde_archivo("Sapo centroamericano.docx"))

        clase_final = clase_taxo if clase_taxo not in ["", "No especificada"] else metadatos["clase"]
        familia_final = familia_taxo if familia_taxo not in ["", "No especificada", "General"] else metadatos["familia"]

        assert clase_final == "Anfibios", f"Esperado 'Anfibios', obtenido '{clase_final}'"
        assert familia_final == "Bufonidae", f"Esperado 'Bufonidae', obtenido '{familia_final}'"

    def test_simulacion_escenario_c_raiz_jaguar(self):
        # Escenario C: Archivo suelto en la raíz documentos_zoomat / Jaguar.docx
        ruta_archivo = os.path.join(RUTA_BASE_DOCS, "Jaguar.docx")
        clase_taxo, familia_taxo = extraer_taxonomia_de_ruta(ruta_archivo, RUTA_BASE_DOCS)
        assert clase_taxo == ""
        assert familia_taxo == ""

        texto = """
        Nombre Común: Jaguar
        Nombre Científico: Panthera onca
        Familia: Felidae
        Descripción: Gran felino carnívoro de la selva chiapaneca.
        """
        metadatos = extraer_metadatos_especie(texto, nombre_comun=nombre_comun_desde_archivo("Jaguar.docx"))

        clase_final = clase_taxo if clase_taxo not in ["", "No especificada"] else metadatos["clase"]
        familia_final = familia_taxo if familia_taxo not in ["", "No especificada", "General"] else metadatos["familia"]

        assert clase_final == "Mamíferos"
        assert familia_final == "Felidae"

    def test_simulacion_escenario_c_raiz_aguila_harpia(self):
        # Escenario C: Archivo suelto en la raíz documentos_zoomat / Aguila harpia.docx
        ruta_archivo = os.path.join(RUTA_BASE_DOCS, "Aguila harpia.docx")
        clase_taxo, familia_taxo = extraer_taxonomia_de_ruta(ruta_archivo, RUTA_BASE_DOCS)
        assert clase_taxo == ""
        assert familia_taxo == ""

        texto = """
        Nombre Común: Águila harpía
        Nombre Científico: Harpia harpyja
        Familia: Accipitridae
        """
        metadatos = extraer_metadatos_especie(texto, nombre_comun=nombre_comun_desde_archivo("Aguila harpia.docx"))

        clase_final = clase_taxo if clase_taxo not in ["", "No especificada"] else metadatos["clase"]
        familia_final = familia_taxo if familia_taxo not in ["", "No especificada", "General"] else metadatos["familia"]

        assert clase_final == "Aves"
        assert familia_final == "Accipitridae"

    def test_simulacion_escenario_c_raiz_sin_familia_fallback_seguro(self):
        # Escenario C: Archivo suelto en la raíz sin indicación de familia
        ruta_archivo = os.path.join(RUTA_BASE_DOCS, "Venado cola blanca.docx")
        clase_taxo, familia_taxo = extraer_taxonomia_de_ruta(ruta_archivo, RUTA_BASE_DOCS)
        assert clase_taxo == ""
        assert familia_taxo == ""

        texto = """
        Nombre Común: Venado cola blanca
        Nombre Científico: Odocoileus virginianus
        Dieta: Herbívoro ramoneador.
        """
        metadatos = extraer_metadatos_especie(texto, nombre_comun=nombre_comun_desde_archivo("Venado cola blanca.docx"))

        clase_final = clase_taxo if clase_taxo not in ["", "No especificada"] else metadatos["clase"]
        familia_final = familia_taxo if familia_taxo not in ["", "No especificada", "General"] else metadatos["familia"]

        assert clase_final == "Mamíferos"
        assert familia_final == "No especificada"


class TestIntegracionTaxonomiaRAG:
    """Valida que motor_rag y app manejen ejemplares con y sin familia sin contaminar los índices."""

    def test_familias_conocidas_no_contiene_no_especificada_ni_clases(self):
        assert "no especificada" not in motor_rag.FAMILIAS_CONOCIDAS
        assert "no especificado" not in motor_rag.FAMILIAS_CONOCIDAS
        assert "general" not in motor_rag.FAMILIAS_CONOCIDAS
        assert "anfibios" not in motor_rag.FAMILIAS_CONOCIDAS
        assert "mamiferos" not in motor_rag.FAMILIAS_CONOCIDAS

    def test_clasificacion_en_clases_conocidas_activa(self):
        assert "anfibios" in motor_rag.CLASES_CONOCIDAS
        assert len(motor_rag.CLASES_CONOCIDAS["anfibios"]) > 0
        assert "mamiferos" in motor_rag.CLASES_CONOCIDAS
        assert len(motor_rag.CLASES_CONOCIDAS["mamiferos"]) > 0

    def test_obtener_especies_registradas_por_clase(self):
        anfibios = obtener_especies_registradas("anfibios")
        assert len(anfibios) > 0

        mamiferos = obtener_especies_registradas("mamíferos")
        assert len(mamiferos) > 0

    def test_obtener_especies_registradas_por_familia_valida(self):
        bufonidos = obtener_especies_registradas("bufonidae")
        assert len(bufonidos) > 0

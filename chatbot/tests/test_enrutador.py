from enrutador_semantico import analizar_intencion


def test_pregunta_de_horario_va_a_mysql():
    resultado = analizar_intencion("¿A qué hora abren?")

    assert resultado == {
        "ruta": "mysql",
        "entidad": "horario",
        "tipo": "general",
    }


def test_precio_estudiante_detecta_subtipo():
    resultado = analizar_intencion("¿Cuánto cuesta la entrada para estudiantes?")

    assert resultado["ruta"] == "mysql"
    assert resultado["entidad"] == "boleto"
    assert resultado["tipo"] == "estudiante"


def test_nombre_de_animal_no_coincide_con_subcadena_agua():
    resultado = analizar_intencion("¿Qué come el jaguar?")

    assert resultado["ruta"] == "rag"


def test_consulta_de_especie_no_se_desvía_por_acentos():
    resultado = analizar_intencion("Háblame del sapo común")

    assert resultado["ruta"] == "rag"


def test_credencial_inapam_detecta_subtipo():
    resultado = analizar_intencion("¿Aceptan credencial del INAPAM?")

    assert resultado["ruta"] == "mysql"
    assert resultado["entidad"] == "boleto"
    assert resultado["tipo"] == "inapam"


def test_credencial_desconocida_o_insem_detecta_subtipo():
    resultado = analizar_intencion("¿Tienen descuento con credencial insem?")

    assert resultado["ruta"] == "mysql"
    assert resultado["entidad"] == "boleto"
    assert resultado["tipo"] == "credencial_desconocida"


def test_profesor_detecta_subtipo():
    resultado = analizar_intencion("¿Cuánto pagan los maestros?")

    assert resultado["ruta"] == "mysql"
    assert resultado["entidad"] == "boleto"
    assert resultado["tipo"] == "profesor"


def test_martes_gratis_prioriza_boleto():
    resultado = analizar_intencion("¿Los martes se puede entrar gratis?")

    assert resultado["ruta"] == "mysql"
    assert resultado["entidad"] == "boleto"
    assert resultado["tipo"] == "martes"


def test_costo_los_martes_prioriza_boleto():
    resultado = analizar_intencion("¿Qué costo tiene la entrada los días martes?")

    assert resultado["ruta"] == "mysql"
    assert resultado["entidad"] == "boleto"
    assert resultado["tipo"] == "martes"


def test_horario_cierre_detecta_subtipo():
    resultado = analizar_intencion("¿A qué hora cierran?")

    assert resultado["ruta"] == "mysql"
    assert resultado["entidad"] == "horario"
    assert resultado["tipo"] == "cierre"


def test_recorrido_nocturno_detecta_subtipo():
    resultado = analizar_intencion("¿Cuánto cuesta el recorrido nocturno?")

    assert resultado["ruta"] == "mysql"
    assert resultado["entidad"] == "servicio"
    assert resultado["tipo"] == "recorrido_nocturno"


def test_tour_guiado_diurno_detecta_subtipo():
    resultado = analizar_intencion("¿Tienen servicio de tour guiado?")

    assert resultado["ruta"] == "mysql"
    assert resultado["entidad"] == "servicio"
    assert resultado["tipo"] == "guiado_diurno"


def test_regla_carriolas_detecta_subtipo():
    resultado = analizar_intencion("¿Se permiten carriolas con llantas de plástico?")

    assert resultado["ruta"] == "mysql"
    assert resultado["entidad"] == "regla"
    assert resultado["tipo"] == "carriolas"


def test_regla_alcohol_detecta_subtipo():
    resultado = analizar_intencion("¿Se puede ingresar con cerveza o alcohol?")

    assert resultado["ruta"] == "mysql"
    assert resultado["entidad"] == "regla"
    assert resultado["tipo"] == "alcohol"


def test_regla_plasticos_detecta_subtipo():
    resultado = analizar_intencion("¿Se puede ingresar unicel o desechables?")

    assert resultado["ruta"] == "mysql"
    assert resultado["entidad"] == "regla"
    assert resultado["tipo"] == "plasticos"


def test_escuelas_publicas_exoneracion():
    resultado = analizar_intencion("¿Tienen precio para escuelas públicas?")

    assert resultado["ruta"] == "mysql"
    assert resultado["entidad"] == "boleto"
    assert resultado["tipo"] == "escuelas"


def test_biblioteca_acceso():
    resultado = analizar_intencion("¿La entrada a la biblioteca es gratis?")

    assert resultado["ruta"] == "mysql"
    assert resultado["entidad"] == "boleto"
    assert resultado["tipo"] == "biblioteca"





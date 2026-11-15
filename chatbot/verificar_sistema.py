"""
Script interactivo de verificación integral para el Asistente Virtual ZooMAT.
Ejecuta diagnósticos rápidos y muestra los resultados de forma clara y visual en la terminal.
Uso: python verificar_sistema.py
"""

import sys
import time

def print_header(titulo):
    print("\n" + "=" * 70)
    print(f"  {titulo}")
    print("=" * 70)

def print_test(num, descripcion, input_val, resultado_esperado, resultado_obtenido, exito):
    estado = "[OK] PASÓ" if exito else "[X] FALLÓ"
    print(f"\nPrueba #{num}: {descripcion}")
    print(f"  Entrada   : \"{input_val}\"")
    print(f"  Esperado  : {resultado_esperado}")
    print(f"  Obtenido  : {resultado_obtenido}")
    print(f"  Resultado : {estado}")

def main():
    print_header("DIAGNÓSTICO Y VERIFICACIÓN INTEGRAL - ASISTENTE ZOOMAT")
    print("Iniciando componentes del sistema (ChromaDB, spaCy, Enrutador Semántico)...")
    t0 = time.time()

    import motor_rag
    import enrutador_semantico
    from app import obtener_especies_registradas, consultar_catalogo_general, responder_consulta_existencia_animal

    print(f"Componentes cargados en {time.time() - t0:.2f} segundos.")

    pruebas_totales = 0
    pruebas_pasadas = 0

    # =========================================================================
    # BLOQUE 1: DETECCIÓN TAXONÓMICA Y MORFOLÓGICA (motor_rag.py)
    # =========================================================================
    print_header("BLOQUE 1: RECONOCIMIENTO TAXONÓMICO Y MORFOLOGÍA UNIVERSAL")

    casos_taxo = [
        ("Nombre común canónico", "Háblame del Sapo centroamericano", "Sapo centroamericano"),
        ("Nombre científico binomial", "¿Qué es Incilius bocourti?", "Sapo centroamericano"),
        ("Nombre científico (Craugastor)", "Información sobre Craugastor taylori", "Rana ladradora"),
        ("Nombre científico (Siphonops)", "Háblame de Siphonops syntremus", "Cecilia chiapaneca"),
        ("Diminutivo en plural (-itos)", "Háblame de los sapitos", "Sapo"),
        ("Diminutivo en plural (-itas)", "¿Qué comen las ranitas?", "Rana"),
        ("Plural regular (-as)", "¿Dónde habitan las cecilias?", "Cecilia"),
        ("Plural de clase (-os)", "Información general sobre los anfibios", "Anfibios")
    ]

    for desc, entrada, esperado in casos_taxo:
        pruebas_totales += 1
        obtenido = motor_rag.detectar_especie(entrada)
        exito = (obtenido == esperado)
        if exito:
            pruebas_pasadas += 1
        print_test(pruebas_totales, desc, entrada, esperado, obtenido, exito)

    # =========================================================================
    # BLOQUE 2: CATÁLOGO DINÁMICO DESDE CHROMADB (app.py)
    # =========================================================================
    print_header("BLOQUE 2: CATÁLOGO DINÁMICO Y AGRUPACIONES TAXONÓMICAS")

    # Prueba de obtención de especies
    pruebas_totales += 1
    todas = obtener_especies_registradas()
    exito_todas = len(todas) >= 20 and all('.pdf' not in e for e in todas)
    if exito_todas:
        pruebas_pasadas += 1
    print_test(
        pruebas_totales, 
        "Carga dinámica de especies registradas desde ChromaDB",
        "obtener_especies_registradas()",
        ">= 20 especies limpias",
        f"{len(todas)} especies encontradas",
        exito_todas
    )

    # Prueba de filtrado por familia
    pruebas_totales += 1
    bufonidos = obtener_especies_registradas("bufonidae")
    exito_buf = len(bufonidos) >= 4
    if exito_buf:
        pruebas_pasadas += 1
    print_test(
        pruebas_totales,
        "Filtrado taxonómico automático por Familia biológica (Bufonidae)",
        "obtener_especies_registradas('bufonidae')",
        ">= 4 especies de Bufonidae",
        f"{len(bufonidos)} especies ({', '.join(bufonidos[:3])}...)",
        exito_buf
    )

    # Prueba de filtrado por familia Craugastoridae
    pruebas_totales += 1
    craugastoridos = obtener_especies_registradas("craugastoridae")
    exito_crau = len(craugastoridos) >= 10
    if exito_crau:
        pruebas_pasadas += 1
    print_test(
        pruebas_totales,
        "Filtrado taxonómico automático por Familia biológica (Craugastoridae)",
        "obtener_especies_registradas('craugastoridae')",
        ">= 10 especies de Craugastoridae",
        f"{len(craugastoridos)} especies encontradas",
        exito_crau
    )

    # Prueba de inventario dinámico aleatorio
    pruebas_totales += 1
    resp_inv = consultar_catalogo_general("¿Qué animales hay en el ZooMAT?")
    exito_inv = resp_inv is not None and "fauna nativa del estado de Chiapas" in resp_inv
    if exito_inv:
        pruebas_pasadas += 1
    print_test(
        pruebas_totales,
        "Respuesta de inventario general con muestreo aleatorio",
        "¿Qué animales hay en el ZooMAT?",
        "Texto de fauna regional con 5 especies aleatorias",
        (resp_inv[:90] + "...") if resp_inv else "None",
        exito_inv
    )

    # =========================================================================
    # BLOQUE 3: ENRUTADOR SEMÁNTICO (enrutador_semantico.py)
    # =========================================================================
    print_header("BLOQUE 3: ENRUTADOR SEMÁNTICO (LOGÍSTICA MYSQL VS BIOLOGÍA RAG)")

    casos_enrutador = [
        ("Horario general", "¿A qué hora abren el zoológico?", {"ruta": "mysql", "entidad": "horario", "tipo": "general"}),
        ("Horario de cierre", "¿A qué hora cierran?", {"ruta": "mysql", "entidad": "horario", "tipo": "cierre"}),
        ("Duración de recorrido", "¿Cuánto dura en promedio el recorrido?", {"ruta": "mysql", "entidad": "horario", "tipo": "recorrido"}),
        ("Boleto estudiante", "¿Cuánto cuesta la entrada para estudiantes?", {"ruta": "mysql", "entidad": "boleto", "tipo": "estudiante"}),
        ("Boleto INAPAM / INSEN", "¿Tienen descuento con credencial INSEN?", {"ruta": "mysql", "entidad": "boleto", "tipo": "inapam"}),
        ("Boleto niños por estatura", "¿Cuánto pagan los niños menores de un metro?", {"ruta": "mysql", "entidad": "boleto", "tipo": "niño"}),
        ("Boleto docentes / maestros", "¿Cuánto pagan los maestros?", {"ruta": "mysql", "entidad": "boleto", "tipo": "profesor"}),
        ("Boleto martes gratuito INE Chiapas", "¿Los martes se puede entrar gratis con INE?", {"ruta": "mysql", "entidad": "boleto", "tipo": "martes"}),
        ("Exoneración para escuelas públicas", "¿Tienen precio para escuelas públicas?", {"ruta": "mysql", "entidad": "boleto", "tipo": "escuelas"}),
        ("Acceso a biblioteca", "¿La entrada a la biblioteca es gratis?", {"ruta": "mysql", "entidad": "boleto", "tipo": "biblioteca"}),
        ("Recorrido nocturno", "¿Cuánto cuesta el recorrido nocturno?", {"ruta": "mysql", "entidad": "servicio", "tipo": "recorrido_nocturno"}),
        ("Tour guiado diurno", "¿Tienen servicio de tour guiado?", {"ruta": "mysql", "entidad": "servicio", "tipo": "guiado_diurno"}),
        ("Regla de mascotas", "¿Puedo llevar a mi perro al zoológico?", {"ruta": "mysql", "entidad": "regla", "tipo": "mascotas"}),
        ("Regla de bebidas alcohólicas", "¿Se puede ingresar con cerveza o alcohol?", {"ruta": "mysql", "entidad": "regla", "tipo": "alcohol"}),
        ("Regla de carriolas ruidosas", "¿Se permiten carriolas con llantas de plástico?", {"ruta": "mysql", "entidad": "regla", "tipo": "carriolas"}),
        ("Regla de plásticos / unicel", "¿Se puede ingresar unicel o desechables?", {"ruta": "mysql", "entidad": "regla", "tipo": "plasticos"}),
        ("Regla de tocar animales", "¿Se puede tocar a los animales?", {"ruta": "mysql", "entidad": "regla", "tipo": "tocar_animales"}),
        ("Ubicación de baños", "¿Dónde están los baños?", {"ruta": "mysql", "entidad": "ubicacion", "tipo": "baños"}),
        ("Consulta biológica (canalizada a RAG)", "¿Qué come el jaguar en la selva?", {"ruta": "rag", "entidad": None, "tipo": None}),
        ("Consulta biológica de anfibio (RAG)", "¿De qué se alimenta el sapo común?", {"ruta": "rag", "entidad": None, "tipo": None})
    ]

    for desc, entrada, esperado in casos_enrutador:
        pruebas_totales += 1
        obtenido = enrutador_semantico.analizar_intencion(entrada)
        exito = (
            obtenido.get("ruta") == esperado.get("ruta") and
            obtenido.get("entidad") == esperado.get("entidad") and
            obtenido.get("tipo") == esperado.get("tipo")
        )
        if exito:
            pruebas_pasadas += 1
        print_test(pruebas_totales, desc, entrada, esperado, obtenido, exito)

    # =========================================================================
    # BLOQUE 4: CONSULTAS DE EXISTENCIA Y PRESENCIA DE FAUNA (SÍ / NO)
    # =========================================================================
    print_header("BLOQUE 4: CONSULTAS DE EXISTENCIA Y PRESENCIA DE FAUNA (SÍ / NO)")

    casos_existencia = [
        ("Existencia de especie registrada (Zopilote)", "Tienen zopilotes", "¡Sí! En el ZooMAT contamos con Zopilote rey", lambda r: r is not None and "¡Sí!" in r and "Zopilote rey" in r),
        ("Existencia de especie en plural (Chachalacas)", "Tienen chachalacas?", "¡Sí! En el ZooMAT albergamos y exhibimos chachalacas", lambda r: r is not None and "¡Sí!" in r and "chachalacas" in r.lower()),
        ("Existencia con 'hay' al final", "Las chachalacas hay?", "¡Sí! En el ZooMAT albergamos y exhibimos chachalacas", lambda r: r is not None and "¡Sí!" in r),
        ("Existencia de fauna emblemática (Jaguar)", "¿Tienen jaguares?", "¡Sí! En el ZooMAT contamos con Jaguar", lambda r: r is not None and "¡Sí!" in r and "jaguar" in r.lower()),
        ("Animal exótico no nativo (León)", "¿Cuentan con leones?", "No, en el ZooMAT no contamos con leones", lambda r: r is not None and "No, en el ZooMAT no contamos con" in r and "exclusivamente fauna nativa" in r),
        ("Animal exótico no nativo (Jirafa)", "¿Tienen jirafas?", "No, en el ZooMAT no contamos con jirafas", lambda r: r is not None and "No, en el ZooMAT no contamos con" in r),
        ("Especie no registrada en ZooMAT", "¿Tienen flamencos?", "No contamos con ejemplares de flamencos", lambda r: r is not None and "No contamos con ejemplares de flamencos" in r)
    ]

    for desc, entrada, esperado_texto, validador in casos_existencia:
        pruebas_totales += 1
        obtenido = responder_consulta_existencia_animal(entrada)
        exito = validador(obtenido)
        if exito:
            pruebas_pasadas += 1
        print_test(pruebas_totales, desc, entrada, esperado_texto, (obtenido[:90] + "...") if obtenido else "None", exito)

    # =========================================================================
    # RESUMEN FINAL
    # =========================================================================
    print_header("RESUMEN DE RESULTADOS")
    porcentaje = (pruebas_pasadas / pruebas_totales) * 100
    print(f"Total de pruebas ejecutadas: {pruebas_totales}")
    print(f"Pruebas aprobadas          : {pruebas_pasadas}")
    print(f"Tasa de éxito              : {porcentaje:.1f}%")

    if pruebas_pasadas == pruebas_totales:
        print("\n>>> ¡TODAS LAS PRUEBAS PASARON EXITOSAMENTE! El sistema está 100% operativo y escalable.")
    else:
        print("\n>>> ALERTA: Algunas pruebas no pasaron. Revisa los detalles anteriores.")

if __name__ == "__main__":
    main()

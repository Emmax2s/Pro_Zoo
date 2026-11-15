# Reporte de Auditoría de Preguntas Ambiguas (NLP / RAG / Logística / Historia)

## 1. Resumen Ejecutivo

Se diseñó y ejecutó una auditoría integral de **166 pruebas automatizadas** en [`tests/test_preguntas_ambiguas.py`](file:///c:/Users/Angel/Desktop/Chatbot_Zoomat/tests/test_preguntas_ambiguas.py) estructurada en dos niveles de verificación independientes, evitando cualquier invocación a síntesis de voz externa (`generar_audio_hibrido`) durante las ejecuciones:

- **Nivel 1 (`TestNivel1EnrutamientoYRecuperacion` — 145 casos, sin LLM):** Evalúa en Python puro la clasificación de intención (`enrutador_semantico.py`), detección taxonómica/histórica (`motor_rag.py`), filtros de dominio e identidad (`app.py`) y la recuperación efectiva desde MySQL y ChromaDB simulando `preguntar_a_llama`.
  - **Distribución por bloques:**
    - Bloque 1 — Logística ambigua y fronteras de reglas/servicios/horarios: **45 casos** (`B1-01` a `B1-45`).
    - Bloque 2 — Taxonomía y Biología de las 8 clases de fauna + control de datos faltantes: **50 casos** (`B2-01` a `B2-50`).
    - Bloque 3 — Historia Institucional del ZooMAT: **25 casos** (`B3-01` a `B3-25`).
    - Bloque 4 — Colisiones Híbridas (Logística vs. Biología vs. Historia vs. Exclusividad Regional): **25 casos** (`B4-01` a `B4-25`).
- **Nivel 2 (`TestNivel2SintesisLlama` — 21 casos reales sobre Ollama `llama3.1`):** Valida síntesis multi-especie, estricto cumplimiento de formato TTS (1 solo párrafo, máximo 4 oraciones, sin saltos de línea, sin asteriscos, sin `$`, sin preguntas de cierre al visitante, horario estricto de 24 horas y unidades métricas completas) y cumplimiento de la regla de Cero Alucinaciones en datos faltantes (`B2-31`, `B2-46`, `B2-47`, `B2-49`, `B3-25`) y especies sin categoría de protección (`B2-48`).

---

## 2. Hallazgos Críticos, Causas Raíz y Correcciones Implementadas

Durante la auditoría iterativa (Nivel 1, Nivel 2 y validación cruzada contra toda la suite del repositorio) se detectaron y resolvieron **14 fallos estructurales**:

### A. Base de Datos MySQL y Formato 24 Horas
1. **Desincronización de registros vivos en MySQL (`zoomat_db`):**
   - *Causa raíz:* [`consultar_logistica`](file:///c:/Users/Angel/Desktop/Chatbot_Zoomat/motor_mysql.py) consulta primero la tabla viva de MySQL antes de usar [`DATOS_LOGISTICA_MEMORIA`](file:///c:/Users/Angel/Desktop/Chatbot_Zoomat/motor_mysql.py); la base local conservaba horarios antiguos en formato de 12 horas (`"9:00 de la mañana"`).
   - *Solución:* Se ejecutó [`inicializar_base_datos`](file:///c:/Users/Angel/Desktop/Chatbot_Zoomat/motor_mysql.py) sincronizando de forma idempotente todas las entradas oficiales en formato estricto de 24 horas (`09:00 a 16:00 horas`, `18:00 horas`, `19:00 y 20:00 horas`).

### B. Detección Taxonómica, Léxica y Multi-Especie (`motor_rag.py`)
2. **Plural de clase `"aves"` truncado:**
   - *Causa raíz:* La regla genérica de pluralización en `CLASES_CONOCIDAS` recortaba `"es"` dejando `"av"` en lugar de `"ave"`.
   - *Solución:* Se añadió regla explícita `if clase_norm == "aves"` para indexar `"ave"` correctamente.
3. **Colisión de subcadena `"rana"` dentro de `"araña"`:**
   - *Causa raíz:* La coincidencia por subcadena sin delimitadores de palabra (`\b`) desviaba preguntas sobre arañas hacia `Rana`.
   - *Solución:* Todas las búsquedas de nombre común y nombre científico emplean delimitadores `\b...\b`.
4. **Homónimo latino-español `Habia rubica`:**
   - *Causa raíz:* El género científico `Habia` secuestraba consultas históricas como `"¿Qué había antes donde ahora está Convivencia Infantil?"` hacia `Tangara matorralera`.
   - *Solución:* Se filtraron homónimos verbales/comunes del español (incluido `"habia"`) en `TAXONOMIA_MAPA` y se reforzó la detección institucional en `es_consulta_historia`.
5. **Falsos positivos en fuzzy matching (`"la ine" -> "LINCE"`, `"corren" -> "Correa"`, `"cerca" -> "Cerceta"`, `"es chiquito" -> "Sapo chiquito"`):**
   - *Causa raíz:* Comparación difusa de bigramas contra especies de 1 palabra y umbral permisivo con palabras logísticas/verbos comunes.
   - *Solución:* Se amplió `PALABRAS_DESCARTADAS_FUZZY`, se restringió el emparejamiento de bigramas/trigramas únicamente a `ESPECIES_COMPUESTAS_KEYS` (longitud mínima >= 7) y se elevó el umbral primario a `cutoff=0.84`.
6. **Priorización de especie genérica sobre especie compuesta con typo (`"sapo chiquitooo" -> "Sapo"`) y pérdida de expansión multi-especie (`"águila harpía"`):**
   - *Causa raíz:* El escaneo plano de nombres exactos de 1 palabra (`sapo`) se ejecutaba antes que la tolerancia difusa para especies compuestas (`sapo chiquito`), mientras que `detectar_especies_relacionadas` no reutilizaba la detección compuesta difusa (`águila harpía` con `'h'` frente a `Águila arpía` en ChromaDB), expandiendo la búsqueda hacia `Aguila cola blanca`.
   - *Solución:* Se extrajo el helper compartido [`_detectar_especie_especifica_compuesta`](file:///c:/Users/Angel/Desktop/Chatbot_Zoomat/motor_rag.py#L239-L269) y se ordenó [`_detectar_especie_biologica`](file:///c:/Users/Angel/Desktop/Chatbot_Zoomat/motor_rag.py#L272-L324) así: (1) compuesto exacto -> (2) nombre científico exacto -> (3) compuesto difuso de alta precisión (`cutoff=0.84`) -> (4) simple exacto (1 palabra) -> (5) morfología (`obtener_formas_base`) -> (6) sustantivo distintivo -> (7) respaldo difuso secundario (`0.76`/`0.86`). Tanto `_detectar_especie_biologica` como [`detectar_especies_relacionadas`](file:///c:/Users/Angel/Desktop/Chatbot_Zoomat/motor_rag.py#L337-L362) consumen `_detectar_especie_especifica_compuesta` sin duplicar lógica.
7. **Puntuación y preposiciones iniciales en nombres comunes (`"DE ARMADILLO..."` y `"Casampulga, capulina o viuda Negra"`):**
   - *Causa raíz:* `.split()` en [`_primer_sustantivo_especie`](file:///c:/Users/Angel/Desktop/Chatbot_Zoomat/motor_rag.py#L186-L192) conservaba comas finales (`"casampulga,"`) y no omitía artículos/preposiciones iniciales (`"DE"`).
   - *Solución:* Se reemplazó por `re.findall(r'\b\w+\b', especie_norm)` omitiendo preposiciones iniciales (`de`, `el`, `la`, `los`, `las`), habilitando la recuperación conjunta multi-especie (`Casampulga castaña` + `Casampulga, capulina o viuda Negra` en `B2-36`).
8. **Recuperación institucional híbrida (semántica + léxica) y soporte multi-especie:**
   - *Solución:* Se implementó [`_buscar_chunks_institucionales_hibrido`](file:///c:/Users/Angel/Desktop/Chatbot_Zoomat/motor_rag.py#L398-L428) apoyado en [`SINONIMOS_HISTORIA`](file:///c:/Users/Angel/Desktop/Chatbot_Zoomat/motor_rag.py#L365-L395) (incluyendo `antes`, `estaba`, `agua`, `cocodrilo`, `zopilote`, `nomina`, `jirafas`, `perritos`, etc.) y el muestreo diverso hasta 6 especies emparentadas y modo híbrido Biología+Historia en [`buscar_contexto`](file:///c:/Users/Angel/Desktop/Chatbot_Zoomat/motor_rag.py#L431-L508).

### C. Enrutamiento Semántico y Fronteras Logística vs. Biología/Historia (`enrutador_semantico.py`)
9. **Colisiones de frontera (baños, reglas sanitarias, horarios tardíos, biología vs. recorrido/adulto/ubicación):**
   - *Solución:* En [`analizar_intencion`](file:///c:/Users/Angel/Desktop/Chatbot_Zoomat/enrutador_semantico.py#L254-L471) se fijó jerarquía explícita: (1) detonantes institucionales en pasado y origen -> `rag`; (2) consultas biológicas puras (incluido `vivir`, `longevidad`, `esperanza de vida`, `lifespan` para evitar desviar `"cuanto tiempo puede vivir el jaguar"` a `horario: recorrido`, además de hábitat/dieta/gestación/talla animal sin señal logística); (3) prioridad de módulos sanitarios (`baños`) sobre nombres de animales usados como referencia espacial (`plaza monos`, `nutrias`, `aguila`); (4) prioridad de reglas críticas (`mascotas`, `alcohol`, `plasticos`, `alimentar_animales`, `tocar_animales`) sobre días gratuitos (`martes`) y sobre `carriolas`; (5) `recorrido_nocturno` y cortes de cierre tardío (`4:15`, `nos corren`) por encima de menciones incidentales de fauna; (6) eliminación de fallback genérico ciego que devolvía `regla: mascotas`.

### D. Síntesis con Llama 3.1, Determinismo y Control Anti-Alucinaciones (`app.py`)
10. **Falso rechazo en existencia/dominio (`"tenis"`, `"escarabajo rinoceronte"`, autocorrección `"tigre... digo jaguar"`, ubicación de recintos `"¿Dónde están los monos o el águila?"`):**
    - *Solución:* Se refinaron [`contexto_es_relevante`](file:///c:/Users/Angel/Desktop/Chatbot_Zoomat/app.py), [`responder_consulta_existencia_animal`](file:///c:/Users/Angel/Desktop/Chatbot_Zoomat/app.py), [`es_fuera_de_dominio`](file:///c:/Users/Angel/Desktop/Chatbot_Zoomat/app.py) y [`procesar_logica_hibrida`](file:///c:/Users/Angel/Desktop/Chatbot_Zoomat/app.py) para distinguir fauna nativa compuesta con palabras exóticas, calzado frente a deportes, consultas combinadas (`biblioteca` gratuita + horario) y respuestas ultra-ambiguas (`"¿Qué comen aquí?"`).
11. **Parámetro `temperature` ignorado por Ollama (raíz del JSON fuera de `"options"`):**
    - *Causa raíz:* [`preguntar_a_llama`](file:///c:/Users/Angel/Desktop/Chatbot_Zoomat/app.py#L513-L584) enviaba `"temperature": 0.0` en el nivel raíz del payload JSON a `/api/generate` en lugar de anidarlo dentro de `"options"`. Ollama ignoraba el campo y ejecutaba muestreo estocástico (`temperature: 0.8`), generando respuestas inestables en longitud (`5–7` oraciones) y contenido entre ejecuciones idénticas.
    - *Solución:* Se configuró `"options": {"temperature": 0.0, "seed": 42}` logrando determinismo completo en las respuestas de Llama 3.1.
12. **Alucinaciones por plantilla vacía de dieta y confusión de longevidad (`Sapo chiquito` / `Cucaracha silvestre`):**
    - *Causa raíz:* Remover incondicionalmente `Dieta: No se contiene información` provocaba que el modelo inventara dieta insectívora para `Sapo chiquito`; mientras que preguntar `"¿Cuántos años vive la cucaracha silvestre?"` hacía que el modelo sustituyera la longevidad ausente por información de hábitat/dieta.
    - *Solución:* En [`procesar_logica_hibrida`](file:///c:/Users/Angel/Desktop/Chatbot_Zoomat/app.py#L1457-L1553) solo se limpia la línea `Dieta: No se contiene información` cuando existen verbos reales de presas/alimentación en otra sección (como `Hábitos` del `Águila arpía`), y se incorporó un candado post-LLM verificando ausencia de datos reales de longevidad en el fragmento antes de devolver la respuesta al visitante (sin romper el enrutamiento mockeable de Nivel 1).
13. **Higiene de salida TTS en [`preguntar_a_llama`](file:///c:/Users/Angel/Desktop/Chatbot_Zoomat/app.py#L529-L575):**
    - Eliminación de comillas internas residuales (`"`), disculpas espurias `"Lo siento, ..."` cuando la respuesta sí aporta datos válidos, ecos de preguntas al inicio, espacios previos a comas/puntos, expansión automática de unidades (`mm`/`cm`/`kg`) a palabra completa y tope estricto en Python de 4 oraciones por respuesta.
14. **Veracidad de Ground Truth en `Alacrán común` (`B2-48`):**
    - Se verificó directamente en ChromaDB que la ficha de `Alacrán común (Centruroides chiapanensis)` declara textualmente: *"Hasta el momento en México no se encuentra en ninguna categoría de protección, ni en la Lista Roja de la IUCN ni en CITES"*, ajustando la aserción de `B2-48` en `test_preguntas_ambiguas.py` para validar tanto esa afirmación literal como la declaración de ausencia en NOM-059 sin falsas alarmas.

---

## 3. Evidencia Final de Resultados (100% de Aprobación)

Todas las verificaciones se ejecutaron **después de la última edición de código**, sin llamadas a TTS en pruebas y con Ollama (`llama3.1`) activo:

| Suite / Script | Comando Ejecutado | Casos | Resultado |
| :--- | :--- | :---: | :--- |
| Auditoría Nivel 1 + Nivel 2 | `.\venv\Scripts\pytest tests/test_preguntas_ambiguas.py -v -s` | 166 (145 N1 + 21 N2) | **166 passed (100%)** |
| Suite completa `pytest` | `.\venv\Scripts\pytest -v --tb=short` | **416** | **416 passed, 0 failed (270.71s)** |
| Diagnóstico integral | `.\venv\Scripts\python verificar_sistema.py` | **39** (288 especies en ChromaDB) | **39 / 39 (100.0%)** |

Desglose verificado por archivo en la corrida final de `pytest` (416 pruebas):
- `tests/test_preguntas_ambiguas.py`: 166 (`1_logistica`: 45, `2_biologia`: 50, `3_historia`: 25, `4_colisiones`: 25; Nivel 2 LLM: 21)
- `tests/test_auditoria_completa.py`: 107
- `tests/test_historia_institucional.py`: 62
- `tests/test_taxonomia_flexible.py`: 36
- `tests/test_enrutador.py`: 17
- `tests/test_catalogo.py`: 14
- `tests/test_bilingue.py`: 8
- `tests/test_avatares_frontend.py`: 3
- `tests/test_horarios_tts.py`: 3

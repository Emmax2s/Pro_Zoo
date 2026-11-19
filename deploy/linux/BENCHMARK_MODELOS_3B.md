# REPORTE COMPARATIVO DE BENCHMARK OFICIAL: MODELOS 3B PARA ZOOMAT
**Fecha y Hora de Ejecución:** 2026-11-19 16:21:31  
**Directorio de Ejecución:** `C:\Users\Angel\Desktop\Chatbot_Zoomat\Pro_zoo\chatbot`  
**Parámetros de Inferencia:** `OLLAMA_NUM_CTX=4096`, `temperature=0.0`, `seed=42`, `timeout=150s`, síntesis TTS omitida  

## Diagnóstico del Problema Anterior (Causa Raíz del Fallo en Bloque B con `num_ctx=2048`)

Al auditar las respuestas del benchmark previo donde ambos modelos perdían el contexto RAG, se descubrió la causa raíz técnica:
1. **Tamaño Real del Prompt y Contexto RAG:**
   - **"¿En qué libro Don Miguel Álvarez del Toro redacta sus historias y cómo se llaman sus otros libros?":** Ocupa `8500 caracteres` (aproximadamente **`2656.2 tokens`**).
   - **"Mi mamá dice que si toco un sapo me van a salir verrugas en las manos, ¿es cierto?":** Ocupa `6990 caracteres` (aproximadamente **`2184.4 tokens`**).
   - En consultas de fauna extensa como el águila harpía, el contexto RAG de documentos oficiales alcanza hasta `11,054 caracteres` (~`3,454 tokens`).
2. **Causa del Fallo con `num_ctx=2048`:** Al fijar `OLLAMA_NUM_CTX=2048`, cualquier prompt superior a 2,048 tokens era truncado severamente por el servidor Ollama antes de la inferencia. Esto cortaba las secciones críticas del acervo biológico/histórico, provocando que los modelos 3B alucinaran especies inexistentes en el contexto (como cuervos, monos araña o salamandras) o respondieran con muletillas de datos faltantes.
3. **Por qué `test_mitos_datos_anfibios.py` aprobaba en pytest:** En Nivel 1 (tests 1 al 44), las pruebas se ejecutan con `unittest.mock.patch` sobre `preguntar_a_llama`, evaluando la presencia de palabras clave en el fragmento RAG sin enviar peticiones a Ollama. En Nivel 2, la aserción comprobaba la presencia de cualquier marcador (`mito`, `creencia`, `falso`), el cual casualmente aparecía en respuestas truncadas. Al evaluar las 12 preguntas con validación semántica real en el Bloque B, las fallas de truncamiento salieron a la luz.
4. **Solución Aplicada:** Se elevó `OLLAMA_NUM_CTX` a **`4096`**, permitiendo que hasta 13,100 caracteres ingresen íntegros al modelo sin pérdida de información, aumentando la memoria RAM del KV-cache en apenas ~180 MB (perfectamente tolerable para la VM de 8 GB RAM).

## Sección 1: Tabla Resumen Comparativa

| Dimensión / Métrica | Qwen 2.5 3B (`qwen2.5:3b`) | Llama 3.2 3B (`llama3.2:3b`) |
| :--- | :---: | :---: |
| **Tamaño en Disco (Ollama)** | **1.9 GB** | 2.0 GB |
| **Bloque B: Precisión Cualitativa (12 Preguntas Críticas)** | **8/12 (66.7%)** | **11/12 (91.7%)** |
| **Suite 1: verificar_sistema.py (39 tests)** | ✅ 39/39 (20.6s) | ✅ 39/39 (22.0s) |
| **Suite 2: test_auditoria_log_17_nov.py (32 tests)** | ❌ 31/32 (82.5s) | ✅ 32/32 (85.2s) |
| **Suite 3: test_mitos_datos_anfibios.py (56 tests)** | ❌ 55/56 (64.4s) | ❌ 55/56 (71.8s) |
| **Suite 4: test_bilingue.py (8 tests)** | ✅ 8/8 (21.9s) | ✅ 8/8 (23.5s) |
| **Latencia Promedio Bloque B** | **3.20 s** | **3.17 s** |
| **Rango Latencia (Mín - Máx)** | 2.88 s - 3.90 s | 2.84 s - 3.48 s |
| **Veredicto Técnico Final** | Alternativa | 🏆 GANADOR RECOMENDADO PARA PRODUCCIÓN |

## Sección 2: Detalle de Pruebas Fallidas por Modelo en Suites Automatizadas

### Modelo: `qwen2.5:3b`
- **Suite 2: test_auditoria_log_17_nov.py (32 tests):** 1 pruebas fallidas.
  * `E       AssertionError: assert 'asi era chiapas' in 'don miguel alvarez del toro escribio los siguientes libros sobre la fauna de chiapas: l`
  * `tests\test_auditoria_log_17_nov.py:275: AssertionError`
  * `FAILED tests/test_auditoria_log_17_nov.py::TestAuditoriaLog17Nov::test_seguimiento_libros_nombre`
- **Suite 3: test_mitos_datos_anfibios.py (56 tests):** 1 pruebas fallidas.
  * `E   AssertionError: [ANF-04] Debió desmentir explícitamente el mito:`
  * `C:\Users\Angel\Desktop\Chatbot_Zoomat\tests\test_mitos_datos_anfibios.py:410: AssertionError`
  * `FAILED tests/test_mitos_datos_anfibios.py::TestNivel2SintesisMitosLlama::test_nivel2_sintesis_mitos_y_datos[ANF-04:Mito orina y ceguera]`

### Modelo: `llama3.2:3b`
- **Suite 3: test_mitos_datos_anfibios.py (56 tests):** 1 pruebas fallidas.
  * `E   AssertionError: [ANF-01] Debió desmentir explícitamente el mito:`
  * `C:\Users\Angel\Desktop\Chatbot_Zoomat\tests\test_mitos_datos_anfibios.py:410: AssertionError`
  * `FAILED tests/test_mitos_datos_anfibios.py::TestNivel2SintesisMitosLlama::test_nivel2_sintesis_mitos_y_datos[ANF-01:Mito verrugas]`

## Sección 3: Comparativa Pregunta por Pregunta y Veredicto Cualitativo (Bloque B)

### Pregunta 1: "¿De qué se alimenta el águila harpía?"
- **Categoría:** Precisión biológica | **Idioma:** `es`
- **Criterio Estricto:** Debe mencionar águila harpía/arpía y mamíferos arborícolas, monos, perezosos, etc. (NO águila real ni cuervo)

#### 1. Qwen 2.5 3B (`qwen2.5:3b`) — `3.04 s` — **✅ APROBADA**
> El águila harpía se alimenta de mamíferos arborícolas como monos, perezosos y armadillos, así como de aves y reptiles.
> *Evaluación:* Cumple al 100% con precisión biológica/histórica y fidelidad RAG.

#### 2. Llama 3.2 3B (`llama3.2:3b`) — `3.48 s` — **✅ APROBADA**
> El águila harpía se alimenta principalmente de mamíferos arborícolas, como monos, perezosos o coatíes, tlacuaches, conejos, crías de venado y tapir, pecaríes, armadillos, puercoespín, oso hormiguero. También se alimenta de aves y reptiles.
> *Evaluación:* Cumple al 100% con precisión biológica/histórica y fidelidad RAG.

---

### Pregunta 2: "¿Cuánto pesa el jaguar y dónde vive?"
- **Categoría:** Datos numéricos + distribución | **Idioma:** `es`
- **Criterio Estricto:** Peso en kg (56, 96 o 158) y hábitat selvático/chiapaneco

#### 1. Qwen 2.5 3B (`qwen2.5:3b`) — `3.13 s` — **❌ FALLIDA**
> El jaguar pesa entre 36 y 120 kilogramos, dependiendo de su tamaño. Vive en América del Norte, Centroamérica y Sudamérica, principalmente en selvas tropicales y montañas.
> *Evaluación:* Debe incluir el rango de peso en kg (56-96/158 kg) y su hábitat selvático/distribución.

#### 2. Llama 3.2 3B (`llama3.2:3b`) — `2.97 s` — **✅ APROBADA**
> El jaguar pesa entre 56 y 100 kilogramos y se encuentra en América Central, del Sur y del Oeste, desde México hasta Argentina.
> *Evaluación:* Cumple al 100% con precisión biológica/histórica y fidelidad RAG.

---

### Pregunta 3: "¿Qué es el famoso sapo borracho y por qué era importante para los mayas?"
- **Categoría:** RAG temático + cultura maya | **Idioma:** `es`
- **Criterio Estricto:** Mencionar Rhinophrynus dorsalis o sapo borracho, lluvia y Chaac o mayas

#### 1. Qwen 2.5 3B (`qwen2.5:3b`) — `3.55 s` — **✅ APROBADA**
> El famoso Sapo borracho es una especie única de anfibio subterráneo muy común en el estado de Chiapas. Para los antiguos mayas, estos sapos eran considerados animales sagrados y ayudantes del dios Chaac, responsable de la lluvia. Su aparición anunciaba el inicio de las lluvias y auguraba cosechas abundantes. El Sapo borracho tiene una distribución en tierras bajas del Golfo de México, Pacífico y Depresión Central, en selvas tropicales perennifolias y caducifolias.
> *Evaluación:* Cumple al 100% con precisión biológica/histórica y fidelidad RAG.

#### 2. Llama 3.2 3B (`llama3.2:3b`) — `3.45 s` — **✅ APROBADA**
> El Sapo borracho es una especie de anfibio subterráneo único considerada un fósil viviente y muy común en el estado de Chiapas. Presenta un cuerpo robusto y globoso de piel lisa color pardo rojizo con manchas anaranjadas o amarillentas en el dorso, extremidades cortas provistas de callosidades excavadoras para enterrarse bajo tierra y una longitud cercana a 80 milímetros. Este sapo es conocido por su canto nupcial muy estridente y potente durante la temporada de lluvias, lo que le valió el nombre popular de Sapo borracho. Para los antiguos mayas, estos sapos eran considerados animales sagrados y ayudantes de Chaac, dios de la lluvia.
> *Evaluación:* Cumple al 100% con precisión biológica/histórica y fidelidad RAG.

---

### Pregunta 4: "Mi mamá dice que si toco un sapo me van a salir verrugas en las manos, ¿es cierto?"
- **Categoría:** Mitos de anfibios | **Idioma:** `es`
- **Criterio Estricto:** Desmentir mito (no es cierto/falso) y mencionar VPH o papiloma humano

#### 1. Qwen 2.5 3B (`qwen2.5:3b`) — `2.95 s` — **✅ APROBADA**
> No es cierto que tocar un sapo te dará verrugas en las manos. Las verrugas humanas son causadas por el virus del papiloma humano, no por contacto con la piel de los sapos. Los bultos visibles en la piel de los sapos son glándulas parótidas de defensa y no verrugas contagiosas.
> *Evaluación:* Cumple al 100% con precisión biológica/histórica y fidelidad RAG.

#### 2. Llama 3.2 3B (`llama3.2:3b`) — `3.30 s` — **✅ APROBADA**
> Es totalmente falso que tocar la piel de un sapo o entrar en contacto con su orina produzca verrugas en las manos. Las verrugas humanas son causadas exclusivamente por el virus del papiloma humano, conocido como VPH, el cual actúa solamente sobre la piel humana y nunca es portado ni transmitido por los anfibios. Los bultos visibles en la piel del sapo son en realidad glándulas parótidas de defensa natural y no verrugas contagiosas.
> *Evaluación:* Cumple al 100% con precisión biológica/histórica y fidelidad RAG.

---

### Pregunta 5: "¿Para qué sirven las sustancias de la piel de las ranas en la medicina humana y contra la diabetes?"
- **Categoría:** Datos técnicos exactos (pseudin-2) | **Idioma:** `es`
- **Criterio Estricto:** Mencionar pseudin-2 y diabetes/insulina

#### 1. Qwen 2.5 3B (`qwen2.5:3b`) — `3.05 s` — **✅ APROBADA**
> Las sustancias de la piel de ranas en la medicina humana, como epibatidinas, salamandrinas y pseudin-2, sirven para desarrollar fármacos cardíacos y analgésicos potentes. En particular, el compuesto pseudin-2 ha sido investigado para combatir la diabetes humana tipo 2. Las ranas de la Orinoquía y el Caribe colombiano son las que contienen este compuesto.
> *Evaluación:* Cumple al 100% con precisión biológica/histórica y fidelidad RAG.

#### 2. Llama 3.2 3B (`llama3.2:3b`) — `3.25 s` — **✅ APROBADA**
> Las sustancias y toxinas presentes en la piel de los anfibios se aprovechan en investigación médica para desarrollar medicamentos que alivian enfermedades humanas. Compuestos como epibatidinas, salamandrinas, bufotoxinas, bufogeninas, pumiliotoxinas y batracotoxinas sirven para fabricar analgésicos potentes como la caeruleína y fármacos cardíacos. Además, en la piel de ranas de la Orinoquía y el Caribe colombiano se descubrió el compuesto pseudin-2 investigado para combatir la diabetes humana tipo 2.
> *Evaluación:* Cumple al 100% con precisión biológica/histórica y fidelidad RAG.

---

### Pregunta 6: "¿En qué libro Don Miguel Álvarez del Toro redacta sus historias y cómo se llaman sus otros libros?"
- **Categoría:** Historia institucional | **Idioma:** `es`
- **Criterio Estricto:** Mencionar 'Así era Chiapas' y al menos otra obra (animales silvestres, aves, reptiles, mamíferos)

#### 1. Qwen 2.5 3B (`qwen2.5:3b`) — `2.98 s` — **✅ APROBADA**
> Don Miguel Álvarez del Toro redacta sus historias en su obra autobiográfica y célebre Así era Chiapas. Sus otros libros son Los animales silvestres de Chiapas, Los reptiles de Chiapas, Las aves de Chiapas, Los mamíferos de Chiapas y Las arañas de Chiapas.
> *Evaluación:* Cumple al 100% con precisión biológica/histórica y fidelidad RAG.

#### 2. Llama 3.2 3B (`llama3.2:3b`) — `2.98 s` — **✅ APROBADA**
> Don Miguel Álvarez del Toro redactó sus historias y experiencias en el libro Así era Chiapas. Sus otros libros sobre fauna silvestre de Chiapas son Los animales silvestres de Chiapas, Los reptiles de Chiapas, Las aves de Chiapas, Los mamíferos de Chiapas y Las arañas de Chiapas.
> *Evaluación:* Cumple al 100% con precisión biológica/histórica y fidelidad RAG.

---

### Pregunta 7: "¿Cuántos años vive el tapir?"
- **Categoría:** Control anti-alucinación (dato faltante) | **Idioma:** `es`
- **Criterio Estricto:** Admitir que no se cuenta con registro oficial de longevidad sin inventar cifras ni cambiar de especie

#### 1. Qwen 2.5 3B (`qwen2.5:3b`) — `2.96 s` — **❌ FALLIDA**
> El tapir mesoamericano vive aproximadamente 13 años, como máximo. Su longevidad se estima en este rango basándose en estudios de vida real y registros del ZooMAT.
> *Evaluación:* Debe admitir que en los registros del ZooMAT no se cuenta con datos de longevidad del tapir; no debe inventar años ni atribuir la respuesta a otra especie.

#### 2. Llama 3.2 3B (`llama3.2:3b`) — `2.87 s` — **❌ FALLIDA**
> El tapir centroamericano tiene una vida útil promedio de aproximadamente 30 años en el campo y hasta los 40 años en cautiverio.
> *Evaluación:* Debe admitir que en los registros del ZooMAT no se cuenta con datos de longevidad del tapir; no debe inventar años ni atribuir la respuesta a otra especie.

---

### Pregunta 8: "¿Qué come el sapo chiquito?"
- **Categoría:** Control anti-alucinación (dato faltante) | **Idioma:** `es`
- **Criterio Estricto:** Admitir que no se cuenta con información específica sobre su dieta

#### 1. Qwen 2.5 3B (`qwen2.5:3b`) — `2.88 s` — **❌ FALLIDA**
> Su hábitat es bosques secos y húmedos de tierras bajas, incluyendo pastos, cunetas de carreteras y terrenos urbanos.
> *Evaluación:* Debe admitir que los registros no detallan la dieta específica del sapo chiquito.

#### 2. Llama 3.2 3B (`llama3.2:3b`) — `2.84 s` — **✅ APROBADA**
> El sapo chiquito es un anfibio que se alimenta principalmente de insectos y otros invertebrados pequeños, como escarabajos, grillos y hormigas. No se contiene información específica sobre su dieta en los registros oficiales del ZooMAT.
> *Evaluación:* Cumple al 100% con precisión biológica/histórica y fidelidad RAG.

---

### Pregunta 9: "Me gusta la jaula de un ave muy bonita de colores principalmente rojo y hay muchas en el zoomat, ¿cómo se llama?"
- **Categoría:** Consulta descriptiva -> Guacamaya roja | **Idioma:** `es`
- **Criterio Estricto:** Identificar a la Guacamaya roja (Ara macao) (NO zorro ni ave genérica)

#### 1. Qwen 2.5 3B (`qwen2.5:3b`) — `3.50 s` — **✅ APROBADA**
> La ave que mencionas es la Guacamaya roja. Esta especie vive en la selva Lacandona del estado de Chiapas y come semillas, frutas, néctar, insectos y otras partes de plantas. El ZooMAT alberga ejemplares de esta guacamaya. Visítanos para conocerla mejor.
> *Evaluación:* Cumple al 100% con precisión biológica/histórica y fidelidad RAG.

#### 2. Llama 3.2 3B (`llama3.2:3b`) — `3.36 s` — **✅ APROBADA**
> La jaula que mencionas es probablemente la de una Guacamaya roja, una ave muy bonita con plumaje rojo escarlata y colores amarillos. Estas aves son comunes en el ZooMAT, donde se pueden observar en un hábitat recreado que simula su hábitat natural en la selva Lacandona de Chiapas.
> *Evaluación:* Cumple al 100% con precisión biológica/histórica y fidelidad RAG.

---

### Pregunta 10: "¿Cuál es la historia del primer jaguar negro que llegó al ZooMAT en 1987 y de los cocodrilos de Chicoasén?"
- **Categoría:** Síntesis de doble tema histórico | **Idioma:** `es`
- **Criterio Estricto:** Síntesis de rescate de jaguar negro en 1987 y cocodrilos de Chicoasén / Sumidero

#### 1. Qwen 2.5 3B (`qwen2.5:3b`) — `3.12 s` — **✅ APROBADA**
> El primer jaguar negro en el ZooMAT llegó en 1987 tras ser decomisado por autoridades y trasladado desde un particular a Chiapas, donde vivió durante catorce años. Los cocodrilos de Chicoasén que actualmente habitan en libertad en el Cañón del Sumidero provienen de una hembra rescatada atropellada en la carretera hacia Chicoasén y rehabilitada por el ZooMAT, logrando su reproducción exitosa para repoblar el área.
> *Evaluación:* Cumple al 100% con precisión biológica/histórica y fidelidad RAG.

#### 2. Llama 3.2 3B (`llama3.2:3b`) — `3.34 s` — **✅ APROBADA**
> El primer jaguar negro que llegó al ZooMAT en 1987 fue un animal rescatado por las autoridades a un particular y trasladado a Chiapas por ser su hábitat natural idóneo. Este jaguar negro vivió catorce años en el ZooMAT y fue uno de los ejemplares más emblemáticos para el público. Los cocodrilos que actualmente habitan en libertad en el Cañón del Sumidero provienen de una hembra de cocodrilo de río rescatada tras ser atropellada en la carretera hacia Chicoasén y reproducida exitosamente para repoblar el Cañón del Sumidero.
> *Evaluación:* Cumple al 100% con precisión biológica/histórica y fidelidad RAG.

---

### Pregunta 11: "What does the Baird's tapir eat and what is its habitat like?"
- **Categoría:** Respuesta 100% en inglés natural | **Idioma:** `en`
- **Criterio Estricto:** Respuesta 100% en inglés sobre dieta (leaves, fruits, plants) y hábitat del tapir

#### 1. Qwen 2.5 3B (`qwen2.5:3b`) — `3.90 s` — **❌ FALLIDA**
> The Baird's tapir eats a diet that consists of leaves, buds, fruits, flowers, and bark from hundreds of different plant species. It prefers living in extensive forest areas with little human disturbance and permanent water sources, inhabiting tropical evergreen forests, semi-evergreen forests, and mountain mesophilic forests. In Mexico, it can be found from sea level up to 2,500 meters above sea level, typically at lower elevations. These tapirs are usually solitary animals active primarily during the early and late parts of the night but may move during daylight in areas with low human activity.
> *Evaluación:* Debe responder en inglés fluido y exclusivo detallando la dieta herbívora y el hábitat selvático del tapir de Baird.

#### 2. Llama 3.2 3B (`llama3.2:3b`) — `3.23 s` — **✅ APROBADA**
> The Baird's tapir is a herbivore, its diet consisting of leaves, shoots, fruits, flowers, and bark from various plant species. Its habitat includes extensive areas of tropical forests with minimal human disturbance, where it can be found in Mexico, specifically in the states of Oaxaca, Campeche, Chiapas, Quintana Roo, and possibly Veracruz, as well as in Ecuador, up to an elevation of 2,500 meters above sea level.
> *Evaluación:* Cumple al 100% con precisión biológica/histórica y fidelidad RAG.

---

### Pregunta 12: "Where does the jaguar live?"
- **Categoría:** Respuesta 100% en inglés | **Idioma:** `en`
- **Criterio Estricto:** Respuesta 100% en inglés sobre distribución y hábitat del jaguar

#### 1. Qwen 2.5 3B (`qwen2.5:3b`) — `3.36 s` — **✅ APROBADA**
> The jaguar lives primarily in Central and South America, inhabiting various habitats including rainforests, swamps, and mountains. It is a solitary animal that establishes its territory and prefers areas with dense vegetation for hunting prey like deer, monkeys, and birds. Visitors can see this magnificent predator at our ZooMAT exhibit where we house jaguars and provide educational tours about their natural habitat and behavior.
> *Evaluación:* Cumple al 100% con precisión biológica/histórica y fidelidad RAG.

#### 2. Llama 3.2 3B (`llama3.2:3b`) — `3.00 s` — **✅ APROBADA**
> The jaguar lives in various habitats across Central and South America, including rainforests, open terrains, and even wetlands.
> *Evaluación:* Cumple al 100% con precisión biológica/histórica y fidelidad RAG.

---

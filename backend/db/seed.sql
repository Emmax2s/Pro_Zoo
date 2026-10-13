-- Script de seed para Pro Zoo Database con datos de especies
-- Ejecutar después de init.sql

-- Insertar especies de ejemplo con datos científicos completos

INSERT INTO species (
  name, slug, species_name, description, image_url, habitat, diet,
  conservation_status, lifespan, size, weight, activity, distribution,
  audio_description_url, scientific_classification, conservation_iucn,
  threats, ecosystem_role
) VALUES
(
  'León Africano',
  'leon-africano',
  'Panthera leo',
  'El león africano es el segundo felino más grande después del tigre. Vive en manadas y es el único felino verdaderamente social. Los machos son conocidos por su distintiva melena, que puede ser de color rojo oscuro a casi negro.',
  'https://images.unsplash.com/photo-1563826990-37a9cc003b25?w=600&h=400&fit=crop',
  'Sabana africana',
  'Carnívoro (cebras, ñús, gacelas)',
  'Vulnerable',
  '10-14 años en vida silvestre',
  '1.7-2.5 metros',
  '150-250 kg',
  'Nocturno',
  'África subsahariana',
  'https://example.com/audio/leon-africano.mp3',
  '{
    "kingdom": "Animalia",
    "phylum": "Chordata",
    "class": "Mammalia",
    "order": "Carnivora",
    "family": "Felidae",
    "genus": "Panthera",
    "species": "P. leo"
  }',
  'VU',
  '[
    {"threat": "Pérdida de hábitat", "severity": "alta"},
    {"threat": "Caza de represalia", "severity": "alta"},
    {"threat": "Disminución de presas", "severity": "media"}
  ]',
  'Depredador tope que regula poblaciones de herbívoros y mantiene el equilibrio ecosistémico'
),
(
  'Elefante Africano',
  'elefante-africano',
  'Loxodonta africana',
  'El elefante africano es el animal terrestre más grande del mundo. Son altamente inteligentes, tienen excelente memoria y viven en sociedades matriarcales complejas. Utilizan su trompa para manipular objetos, comunicarse y explorar el mundo.',
  'https://images.unsplash.com/photo-1551318679-9c6ae9dec224?w=600&h=400&fit=crop',
  'Sabana y bosque africano',
  'Herbívoro (pasto, corteza, frutos)',
  'Vulnerable',
  '60-70 años',
  '5.5-6.7 metros',
  '4000-6000 kg',
  'Diurno',
  'África subsahariana',
  'https://example.com/audio/elefante-africano.mp3',
  '{
    "kingdom": "Animalia",
    "phylum": "Chordata",
    "class": "Mammalia",
    "order": "Proboscidea",
    "family": "Elephantidae",
    "genus": "Loxodonta",
    "species": "L. africana"
  }',
  'VU',
  '[
    {"threat": "Caza furtiva por marfil", "severity": "crítica"},
    {"threat": "Pérdida de hábitat", "severity": "alta"},
    {"threat": "Conflicto humano-vida silvestre", "severity": "alta"}
  ]',
  'Ingeniero ecosistémico que modifica el paisaje mediante su alimentación, creando hábitats para otras especies'
),
(
  'Jirafa',
  'jirafa',
  'Giraffa camelopardalis',
  'La jirafa es el animal terrestre más alto, con un cuello extremadamente largo que le permite alcanzar hojas en lo alto de los árboles. Su altura puede alcanzar hasta 5.5 metros y utiliza su lengua prensil de 45 cm para alimentarse.',
  'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=600&h=400&fit=crop',
  'Sabana africana seca',
  'Herbívoro (hojas de acacia y mimosa)',
  'Vulnerable',
  '25-28 años',
  '4.3-5.5 metros',
  '900-1400 kg',
  'Diurno',
  'África subsahariana',
  'https://example.com/audio/jirafa.mp3',
  '{
    "kingdom": "Animalia",
    "phylum": "Chordata",
    "class": "Mammalia",
    "order": "Artiodactyla",
    "family": "Giraffidae",
    "genus": "Giraffa",
    "species": "G. camelopardalis"
  }',
  'VU',
  '[
    {"threat": "Pérdida de hábitat", "severity": "alta"},
    {"threat": "Cambio climático", "severity": "media"},
    {"threat": "Caza ilegal", "severity": "media"}
  ]',
  'Herbívoro especializado que controla el crecimiento de árboles espinosos en la sabana'
),
(
  'Panda Gigante',
  'panda-gigante',
  'Ailuropoda melanoleuca',
  'El panda gigante es uno de los animales más reconocibles del mundo, con su distintiva pelota blanca y negra. A pesar de ser clasificado como carnívoro, el 99% de su dieta consiste en bambú. Son animales solitarios y generalmente tímidos.',
  'https://images.unsplash.com/photo-1564349503-d0d680c67bfd?w=600&h=400&fit=crop',
  'Bosque de bambú en montaña',
  'Principalmente bambú (99%), ocasionalmente pequeños roedores',
  'Vulnerable',
  '25-30 años',
  '1.2-1.5 metros',
  '80-125 kg',
  'Crepuscular',
  'China central (montañas de Sichuan)',
  'https://example.com/audio/panda-gigante.mp3',
  '{
    "kingdom": "Animalia",
    "phylum": "Chordata",
    "class": "Mammalia",
    "order": "Carnivora",
    "family": "Ursidae",
    "genus": "Ailuropoda",
    "species": "A. melanoleuca"
  }',
  'VU',
  '[
    {"threat": "Pérdida de hábitat de bambú", "severity": "alta"},
    {"threat": "Fragmentación de poblaciones", "severity": "media"},
    {"threat": "Depredación de crías", "severity": "baja"}
  ]',
  'Indicador de salud del ecosistema de bosques montañosos de bambú'
),
(
  'Tigre de Bengala',
  'tigre-bengala',
  'Panthera tigris bengalensis',
  'El tigre de Bengala es una subespecie crítica del tigre asiático. Son depredadores solitarios y territoriales, con un rango de distribución que abarca India, Bangladesh y Nepal. Poseen una fuerza excepcional y pueden derribar presas muchas veces su tamaño.',
  'https://images.unsplash.com/photo-1615583849420-c27b92f2f96d?w=600&h=400&fit=crop',
  'Bosque tropical y manglares',
  'Carnívoro (ciervos, jabalíes, búfalos)',
  'En Peligro',
  '15-20 años en vida silvestre',
  '1.4-2.8 metros',
  '90-260 kg',
  'Nocturno',
  'Subcontinente indio',
  'https://example.com/audio/tigre-bengala.mp3',
  '{
    "kingdom": "Animalia",
    "phylum": "Chordata",
    "class": "Mammalia",
    "order": "Carnivora",
    "family": "Felidae",
    "genus": "Panthera",
    "species": "P. tigris bengalensis"
  }',
  'EN',
  '[
    {"threat": "Caza furtiva", "severity": "crítica"},
    {"threat": "Pérdida de hábitat", "severity": "crítica"},
    {"threat": "Disminución de presas", "severity": "alta"},
    {"threat": "Conflicto con humanos", "severity": "media"}
  ]',
  'Depredador tope en ecosistemas tropicales, regulador de herbívoros grandes'
),
(
  'Pinguino Emperador',
  'pinguino-emperador',
  'Aptenodytes forsteri',
  'El pingüino emperador es la especie de pingüino más grande y la única que se reproduce durante el invierno antártico. Los machos tienen notables habilidades de paternidad, cuidando el huevo sin alimentarse durante meses en temperaturas extremas.',
  'https://images.unsplash.com/photo-1551628221-159381cbf1f3?w=600&h=400&fit=crop',
  'Hielo marino antártico',
  'Piscívoro (peces y krill)',
  'En Peligro',
  '15-20 años',
  '1.1-1.3 metros',
  '22-45 kg',
  'Diurno y nocturno',
  'Antártida',
  'https://example.com/audio/pinguino-emperador.mp3',
  '{
    "kingdom": "Animalia",
    "phylum": "Chordata",
    "class": "Aves",
    "order": "Sphenisciformes",
    "family": "Spheniscidae",
    "genus": "Aptenodytes",
    "species": "A. forsteri"
  }',
  'EN',
  '[
    {"threat": "Cambio climático y pérdida de hielo marino", "severity": "crítica"},
    {"threat": "Contaminación por plástico marino", "severity": "media"},
    {"threat": "Cambios en distribución de presas", "severity": "alta"}
  ]',
  'Indicador biológico de la salud de los océanos antárticos'
),
(
  'Lince Ibérico',
  'lince-iberico',
  'Lynx pardinus',
  'El lince ibérico es uno de los félidos más amenazados del mundo. Era el felino más raro del planeta hace solo dos décadas. Es un cazador ágil especializado en capturar conejos, su principal fuente de alimento.',
  'https://images.unsplash.com/photo-1617362935129-34e06d1eb32f?w=600&h=400&fit=crop',
  'Bosque mediterráneo de matorral',
  'Carnívoro (conejos principalmente)',
  'En Peligro',
  '13 años',
  '0.6-1.0 metros',
  '1.5-3.6 kg',
  'Nocturno',
  'Península Ibérica',
  'https://example.com/audio/lince-iberico.mp3',
  '{
    "kingdom": "Animalia",
    "phylum": "Chordata",
    "class": "Mammalia",
    "order": "Carnivora",
    "family": "Felidae",
    "genus": "Lynx",
    "species": "L. pardinus"
  }',
  'EN',
  '[
    {"threat": "Caza accidental en trampas", "severity": "crítica"},
    {"threat": "Pérdida de hábitat", "severity": "alta"},
    {"threat": "Disminución de poblaciones de conejo", "severity": "alta"},
    {"threat": "Atropello vehicular", "severity": "media"}
  ]',
  'Depredador de mesocarnívoro en ecosistemas de matorral mediterráneo'
),
(
  'Delfín de Irrawaddy',
  'delfin-irrawaddy',
  'Orcaella brevirostris',
  'El delfín de Irrawaddy es uno de los cetáceos más amenazados del mundo. Se encuentran principalmente en ríos y aguas costeras de Asia del Sudeste, con solo 100 individuos en el río Mekong en Camboya. Son inteligentes y colaboran con pescadores locales.',
  'https://images.unsplash.com/photo-1567868381869-b4f1c1c51ae6?w=600&h=400&fit=crop',
  'Ríos y aguas costeras',
  'Piscívoro (peces y camarones)',
  'En Peligro Crítico',
  '30-40 años',
  '2.2-2.8 metros',
  '100-150 kg',
  'Diurno',
  'Sudeste asiático (ríos Irrawaddy, Mekong, Malaca)',
  'https://example.com/audio/delfin-irrawaddy.mp3',
  '{
    "kingdom": "Animalia",
    "phylum": "Chordata",
    "class": "Mammalia",
    "order": "Cetacea",
    "family": "Delphinidae",
    "genus": "Orcaella",
    "species": "O. brevirostris"
  }',
  'CR',
  '[
    {"threat": "Redes de pesca (enredos)", "severity": "crítica"},
    {"threat": "Contaminación de agua dulce", "severity": "crítica"},
    {"threat": "Fragmentación del hábitat", "severity": "alta"},
    {"threat": "Construcción de represas", "severity": "alta"}
  ]',
  'Mamífero marino indicador de salud de ríos tropicales'
),
(
  'Rinoceronte de Java',
  'rinoceronte-java',
  'Rhinoceros sondaicus',
  'El rinoceronte de Java es el mamífero más raro del mundo, con menos de 75 individuos en la naturaleza, todos en una sola población en Java, Indonesia. Es más pequeño que sus parientes africanos y tiene un solo cuerno en los machos.',
  'https://images.unsplash.com/photo-1577720643272-265f434c3e5c?w=600&h=400&fit=crop',
  'Bosque tropical denso',
  'Herbívoro (hojas, frutas)',
  'En Peligro Crítico',
  '30-45 años',
  '3-3.2 metros',
  '1500-2300 kg',
  'Nocturno',
  'Isla de Java, Indonesia',
  'https://example.com/audio/rinoceronte-java.mp3',
  '{
    "kingdom": "Animalia",
    "phylum": "Chordata",
    "class": "Mammalia",
    "order": "Perissodactyla",
    "family": "Rhinocerotidae",
    "genus": "Rhinoceros",
    "species": "R. sondaicus"
  }',
  'CR',
  '[
    {"threat": "Caza de represalia", "severity": "crítica"},
    {"threat": "Pérdida de hábitat", "severity": "crítica"},
    {"threat": "Enfermedad", "severity": "media"},
    {"threat": "Baja diversidad genética", "severity": "alta"}
  ]',
  'Megaherviboro que modifica estructura del bosque tropical'
);

-- Mostrar especies insertadas
SELECT id, name, slug, conservation_iucn FROM species;

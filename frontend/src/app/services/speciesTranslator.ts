import { useState, useEffect } from "react";

export interface LocalizedAnimalData {
  name: string;
  scientificName: string;
  category: string;
  status: string;
  habitat: string;
  diet: string;
  funFact: string;
  audioUrl?: string;
  mediaImages: string[];
  mediaVideos: string[];
  lsmVideoUrl?: string;
}

const CATEGORY_MAP_EN: Record<string, string> = {
  "Mamífero": "Mammal",
  "Ave": "Bird",
  "Reptil": "Reptile",
  "Anfibio": "Amphibian",
  "Pez": "Fish",
  "Invertebrado": "Invertebrate",
};

const STATUS_MAP_EN: Record<string, string> = {
  "En Peligro de Extinción": "Least Concern",
  "Amenazada": "Threatened",
  "Protegida Especial": "Special Protection",
  "Preocupación Menor": "Least Concern",
  "Preocupacion Menor": "Least Concern",
  "Vulnerable": "Vulnerable",
  "En Peligro": "Endangered",
};

const CATEGORY_MAP_ES: Record<string, string> = {
  "Mammal": "Mamífero",
  "Bird": "Ave",
  "Reptile": "Reptil",
  "Amphibian": "Anfibio",
  "Fish": "Pez",
  "Invertebrate": "Invertebrado",
};

const STATUS_MAP_ES: Record<string, string> = {
  "Endangered": "En Peligro de Extinción",
  "Threatened": "Amenazada",
  "Special Protection": "Protegida Especial",
  "Least Concern": "Preocupación Menor",
  "Vulnerable": "Amenazada",
};

const COMMON_NAMES_EN: Record<string, string> = {
  "puma": "Puma",
  "jaguar": "Jaguar",
  "ocelote": "Ocelot",
  "mono araña": "Spider Monkey",
  "mono aullador": "Howler Monkey",
  "saraguato": "Howler Monkey",
  "tapir": "Baird's Tapir",
  "tapir centroamericano": "Baird's Tapir",
  "quetzal": "Resplendent Quetzal",
  "guacamaya roja": "Scarlet Macaw",
  "tucán": "Toucan",
  "tucán real": "Keel-billed Toucan",
  "cocodrilo de río": "American Crocodile",
  "cocodrilo de pantano": "Morelet's Crocodile",
  "nutria de río": "Neotropical River Otter",
  "venado cola blanca": "White-tailed Deer",
  "pecarí de collar": "Collared Peccary",
  "tejón": "White-nosed Coati",
  "coatí": "White-nosed Coati",
  "armadillo": "Nine-banded Armadillo",
  "oso hormiguero": "Northern Tamandua",
  "oso hormiguero norteño": "Northern Tamandua",
  "oso hormiguero norteño (tamandúa)": "Northern Tamandua (Tamandua)",
  "oso hormiguero norteño (tamandua)": "Northern Tamandua (Tamandua)",
  "tamandúa": "Northern Tamandua",
  "tamandua": "Northern Tamandua",
  "kinkajú": "Kinkajou",
  "kinkaju": "Kinkajou",
  "tepezcuintle": "Lowland Paca",
  "tepezcuintle (o paca centroamericana)": "Lowland Paca (Tepezcuintle)",
  "paca centroamericana": "Lowland Paca",
  "mapache": "Raccoon",
  "mapache norteño": "Northern Raccoon",
  "mapache común": "Northern Raccoon",
  "mapache norteño (o mapache común)": "Northern Raccoon (Common Raccoon)",
  "águila harpía": "Harpy Eagle",
  "águila elegante": "Ornate Hawk-Eagle",
  "pavón": "Horned Guan",
  "nauyaca": "Fer-de-lance / Pit Viper",
  "zopilote rey": "King Vulture",
  "iguana verde": "Green Iguana",
  "serpiente de cascabel": "Rattlesnake",
};

// Diccionario precargado para traducciones instantáneas de ZooMAT (sin latencia de red)
const PRE_TRANSLATED_EN: Record<string, string> = {
  // Tamandúa / Oso hormiguero
  "posee garras delanteras enormes y muy poderosas que utiliza tanto para abrir nidos de insectos como para defenderse eficientemente de los depredadores.":
    "It has enormous and very powerful front claws that it uses both to break open insect nests and to efficiently defend itself against predators.",
  "elvas tropicales húmedas y secas, manglares y zonas arbóreas":
    "Humid and dry tropical forests, mangroves, and arboreal areas",
  "selvas tropicales húmedas y secas, manglares y zonas arbóreas":
    "Humid and dry tropical forests, mangroves, and arboreal areas",
  "hormigas, termitas e insectos arborícolas que captura con su larga lengua pegajosa.":
    "Ants, termites, and arboreal insects that it catches with its long sticky tongue.",

  // Kinkajú
  "selvas tropicales altas y perennifolias en el dosel de los árboles":
    "Tall evergreen tropical rainforests in the tree canopy.",
  "frugívora y nectarívora (frutas dulces, néctar de flores, insectos y pequeños vertebrados)":
    "Frugivorous and nectarivorous (sweet fruits, flower nectar, insects, and small vertebrates).",
  "aunque pertenece al orden de los carnívoros, tiene una dieta mayoritariamente frugívora y un cuerpo adaptado para vivir en los árboles.":
    "Although it belongs to the order Carnivora, its diet is mostly frugivorous, with a body fully adapted for life in the treetops.",

  // Tepezcuintle
  "elvas tropicales húmedas y bosques cercanos a ríos, arroyos y cañadas":
    "Humid tropical forests and woodlands near rivers, streams, and ravines.",
  "selvas tropicales húmedas y bosques cercanos a ríos, arroyos y cañadas":
    "Humid tropical forests and woodlands near rivers, streams, and ravines.",
  "frugívora y herbívora (frutos caídos, semillas, raíces y tubérculos)":
    "Frugivorous and herbivorous (fallen fruits, seeds, roots, and tubers).",
  "es un roedor nocturno de hábitos terrestres y solitarios, clave en la dispersión de semillas en los ecosistemas chiapanecos.":
    "It is a nocturnal rodent of terrestrial and solitary habits, essential for seed dispersal across Chiapan ecosystems.",

  // Mapache norteño
  "zonas riparias, manglares, selvas tropicales y áreas cercanas a cuerpos de agua":
    "Riparian zones, mangroves, tropical forests, and areas near bodies of water.",
  "omnívora oportunista (crustáceos, peces, insectos, frutas, semillas y pequeños vertebrados)":
    "Opportunistic omnivore (crustaceans, fish, insects, fruits, seeds, and small vertebrates).",
  "omnívora": "Omnivorous",

  // Puma y felinos
  "es un felino mayor que no ruge, su sonido se asemeja al maullido de un gato":
    "It is a large feline that does not roar; its sound resembles the meow of a cat.",
  "bosques troppcales, bosques de coniferas, desde canada hasta la patagonia":
    "Tropical forests, coniferous forests, from Canada to Patagonia.",
  "carnívoro , consumiendo desde ratones hasta presas mayores":
    "Carnivorous, consuming from mice to larger prey.",
  "carnívoro": "Carnivorous",
  "herbívoro": "Herbivorous",
  "omnívoro": "Omnivorous",
  "frugívoro": "Frugivorous",
  "insectívoro": "Insectivorous",
};

// Caché en memoria para evitar llamadas redundantes a la API de traducción
const memoryTranslationCache = new Map<string, string>();

/**
 * Traduce un nombre común de animal al inglés limpiando paréntesis o subtítulos.
 */
function translateAnimalName(rawName: string): string {
  const trimmed = rawName.trim();
  if (!trimmed) return "";

  const lower = trimmed.toLowerCase();
  if (COMMON_NAMES_EN[lower]) return COMMON_NAMES_EN[lower];

  // Checar si tiene paréntesis e.g. "Oso hormiguero norteño (Tamandúa)"
  const match = trimmed.match(/^([^(]+)(?:\s*\(([^)]+)\))?$/);
  if (match) {
    const main = match[1].trim().toLowerCase();
    const sub = match[2] ? match[2].trim().toLowerCase() : "";

    const mainTr = COMMON_NAMES_EN[main] || (PRE_TRANSLATED_EN[main]);
    if (mainTr) {
      if (sub && COMMON_NAMES_EN[sub]) {
        return `${mainTr} (${COMMON_NAMES_EN[sub]})`;
      } else if (sub) {
        return `${mainTr} (${match[2].trim()})`;
      }
      return mainTr;
    }
  }

  // Revisar si empieza con alguna de las llaves conocidas
  for (const [key, value] of Object.entries(COMMON_NAMES_EN)) {
    if (lower.startsWith(key)) {
      return value;
    }
  }

  return "";
}

/**
 * Traduce texto de forma asíncrona entre español e inglés utilizando
 * proxy de servidor (/api/translate), Google Translate GTX, con fallback a MyMemory
 * y persistencia en localStorage.
 */
export async function translateTextAsync(
  text: string,
  fromLang: "es" | "en" = "es",
  toLang: "es" | "en" = "en"
): Promise<string> {
  const trimmed = typeof text === "string" ? text.trim() : "";
  if (!trimmed || fromLang === toLang) return text || "";

  // 1. Revisar nombre de animal
  if (toLang === "en") {
    const nameMatch = translateAnimalName(trimmed);
    if (nameMatch) return nameMatch;
  }

  // 2. Revisar diccionario estático precargado
  const lower = trimmed.toLowerCase();
  if (toLang === "en") {
    if (PRE_TRANSLATED_EN[trimmed]) return PRE_TRANSLATED_EN[trimmed];
    if (PRE_TRANSLATED_EN[lower]) return PRE_TRANSLATED_EN[lower];
  }

  // 3. Revisar caché en memoria
  const cacheKey = `zoomat_tr_${fromLang}_${toLang}_${trimmed}`;
  if (memoryTranslationCache.has(cacheKey)) {
    return memoryTranslationCache.get(cacheKey)!;
  }

  // 4. Revisar caché en localStorage
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      memoryTranslationCache.set(cacheKey, cached);
      return cached;
    }
  } catch {}

  // 5. Intentar endpoint proxy del servidor Vite / Backend (/api/translate o /api/species/translate)
  try {
    const res = await fetch(`/api/translate?sl=${fromLang}&tl=${toLang}&text=${encodeURIComponent(trimmed)}`);
    if (res.ok) {
      const json = await res.json();
      if (json && typeof json.translated === "string" && json.translated.trim()) {
        const translated = json.translated.trim();
        memoryTranslationCache.set(cacheKey, translated);
        try {
          localStorage.setItem(cacheKey, translated);
        } catch {}
        return translated;
      }
    }
  } catch {}

  // 6. Intentar Google Translate GTX API directa (por si el entorno lo permite)
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${fromLang}&tl=${toLang}&dt=t&q=${encodeURIComponent(trimmed)}`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && Array.isArray(data[0])) {
        const translated = data[0].map((item: any) => item[0]).join("");
        if (translated && translated.trim()) {
          memoryTranslationCache.set(cacheKey, translated);
          try {
            localStorage.setItem(cacheKey, translated);
          } catch {}
          return translated;
        }
      }
    }
  } catch {}

  // 7. Fallback a MyMemory API
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(trimmed)}&langpair=${fromLang}|${toLang}`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      const translated = data?.responseData?.translatedText;
      if (typeof translated === "string" && translated.trim() && !translated.includes("MYMEMORY WARNING")) {
        memoryTranslationCache.set(cacheKey, translated);
        try {
          localStorage.setItem(cacheKey, translated);
        } catch {}
        return translated;
      }
    }
  } catch {}

  return text;
}

export function translateText(text: string): string {
  return text || "";
}

/**
 * Obtiene la representación localizada síncrona de un animal.
 * Si isEs es falso, aplica los mapeos de categorías, estados de conservación,
 * nombres comunes y traducciones previamente cacheadas en localStorage o diccionario.
 */
export function getLocalizedAnimal(
  animal: Record<string, unknown> | null | undefined,
  isEs: boolean
): LocalizedAnimalData {
  if (!animal) {
    return {
      name: "",
      scientificName: "",
      category: "",
      status: "",
      habitat: "",
      diet: "",
      funFact: "",
      mediaImages: [],
      mediaVideos: [],
      lsmVideoUrl: "",
    };
  }

  const rawName = String(animal.name || "");
  const rawCat = String(animal.category || "");
  const rawStat = String(animal.translatedStatus || animal.status || animal.conservation || "");
  const rawFunFact = String(animal.funFact || animal.description || "");
  const rawHabitat = String(animal.habitat || "");
  const rawDiet = String(animal.diet || "");

  const category = isEs
    ? CATEGORY_MAP_ES[rawCat] || rawCat
    : CATEGORY_MAP_EN[rawCat] || rawCat;

  const status = isEs
    ? STATUS_MAP_ES[rawStat] || rawStat
    : STATUS_MAP_EN[rawStat] || rawStat;

  let name = rawName;
  let funFact = rawFunFact;
  let habitat = rawHabitat;
  let diet = rawDiet;

  if (!isEs) {
    // 1. Nombre de animal en inglés
    const nameTr = translateAnimalName(rawName);
    if (nameTr) {
      name = nameTr;
    } else {
      try {
        const cachedName = localStorage.getItem(`zoomat_tr_es_en_${rawName.trim()}`);
        if (cachedName) name = cachedName;
      } catch {}
    }

    // 2. Dato curioso / descripción
    const lowerFunFact = rawFunFact.trim().toLowerCase();
    if (PRE_TRANSLATED_EN[rawFunFact.trim()] || PRE_TRANSLATED_EN[lowerFunFact]) {
      funFact = PRE_TRANSLATED_EN[rawFunFact.trim()] || PRE_TRANSLATED_EN[lowerFunFact];
    } else {
      try {
        const cached = localStorage.getItem(`zoomat_tr_es_en_${rawFunFact.trim()}`);
        if (cached) funFact = cached;
      } catch {}
    }

    // 3. Hábitat
    const lowerHabitat = rawHabitat.trim().toLowerCase();
    if (PRE_TRANSLATED_EN[rawHabitat.trim()] || PRE_TRANSLATED_EN[lowerHabitat]) {
      habitat = PRE_TRANSLATED_EN[rawHabitat.trim()] || PRE_TRANSLATED_EN[lowerHabitat];
    } else {
      try {
        const cached = localStorage.getItem(`zoomat_tr_es_en_${rawHabitat.trim()}`);
        if (cached) habitat = cached;
      } catch {}
    }

    // 4. Dieta
    const lowerDiet = rawDiet.trim().toLowerCase();
    if (PRE_TRANSLATED_EN[rawDiet.trim()] || PRE_TRANSLATED_EN[lowerDiet]) {
      diet = PRE_TRANSLATED_EN[rawDiet.trim()] || PRE_TRANSLATED_EN[lowerDiet];
    } else {
      try {
        const cached = localStorage.getItem(`zoomat_tr_es_en_${rawDiet.trim()}`);
        if (cached) diet = cached;
      } catch {}
    }
  }

  return {
    name,
    scientificName: String(animal.scientificName || animal.species || ""),
    category,
    status,
    habitat,
    diet,
    funFact,
    audioUrl: String(animal.audioUrl || animal.audioDescriptionUrl || "") || undefined,
    mediaImages: Array.isArray(animal.mediaImages) && animal.mediaImages.length > 0
      ? animal.mediaImages.map(String).slice(0, 4)
      : (animal.image || animal.imageUrl ? [String(animal.image || animal.imageUrl)] : []),
    mediaVideos: Array.isArray(animal.mediaVideos) ? animal.mediaVideos.map(String).slice(0, 2) : [],
    lsmVideoUrl: String(animal.lsmVideoUrl || "") || undefined,
  };
}

/**
 * Hook de React que devuelve los datos del animal totalmente traducidos.
 * Cuando isEs es falso (inglés), traduce de inmediato los datos disponibles y ejecuta
 * en segundo plano la traducción de nombre, hábitat, dieta y funFact para actualizar
 * la vista dinámicamente si no estaban cacheados.
 */
export function useLocalizedAnimal(
  animal: Record<string, unknown> | null | undefined,
  isEs: boolean
): LocalizedAnimalData {
  const [data, setData] = useState<LocalizedAnimalData>(() => {
    return getLocalizedAnimal(animal, isEs);
  });

  useEffect(() => {
    setData(getLocalizedAnimal(animal, isEs));
    if (!animal) return;

    // 1. Si es español, revertir inmediatamente a los datos originales en español
    if (isEs) {
      return;
    }

    // 2. Si es inglés, renderizar primero lo que esté disponible en caché síncrona
    const immediate = getLocalizedAnimal(animal, false);
    setData(immediate);

    let active = true;

    // 3. Traducir asíncronamente cualquier texto que aún no esté traducido
    const translateMissingFields = async () => {
      const rawName = String(animal.name || "");
      const rawFunFact = String(animal.funFact || animal.description || "");
      const rawHabitat = String(animal.habitat || "");
      const rawDiet = String(animal.diet || "");

      const [transName, transFunFact, transHabitat, transDiet] = await Promise.all([
        translateAnimalName(rawName) || translateTextAsync(rawName, "es", "en"),
        translateTextAsync(rawFunFact, "es", "en"),
        translateTextAsync(rawHabitat, "es", "en"),
        translateTextAsync(rawDiet, "es", "en"),
      ]);

      if (active) {
        setData((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            name: transName || prev.name,
            funFact: transFunFact || prev.funFact,
            habitat: transHabitat || prev.habitat,
            diet: transDiet || prev.diet,
          };
        });
      }
    };

    void translateMissingFields();

    return () => {
      active = false;
    };
  }, [animal, isEs]);

  return data;
}

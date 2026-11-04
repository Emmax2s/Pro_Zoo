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
  "En Peligro de Extinción": "Endangere",
  "Amenazada": "Threatened",
  "Protegida Especial": ,
  "Preocupación Menor": ,
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
  "águila harpía": "Harpy Eagle",
  "águila elegante": "Ornate Hawk-Eagle",
  "pavón": "Horned Guan",
};

// Diccionario precargado para traducciones instantáneas de ZooMAT (sin latencia de red)
const PRE_TRANSLATED_EN: Record<string, string> = {
  "es un felino mayor que no ruge, su sonido se asemeja al maullido de un gato":
    "It is a large feline that does not roar; its sound resembles the meow of a cat.",
  "bosques troppcales, bosques de coniferas, desde Canada hasta la patagonia":
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
 * Traduce texto de forma asíncrona entre español e inglés utilizando
 * Google Translate GTX con fallback a MyMemory API y persistencia en localStorage.
 */
export async function translateTextAsync(
  text: string,
  fromLang: "es" | "en" = "es",
  toLang: "es" | "en" = "en"
): Promise<string> {
  const trimmed = typeof text === "string" ? text.trim() : "";
  if (!trimmed || fromLang === toLang) return text || "";

  // 1. Revisar diccionario estático precargado
  const lower = trimmed.toLowerCase();
  if (toLang === "en") {
    if (PRE_TRANSLATED_EN[trimmed]) return PRE_TRANSLATED_EN[trimmed];
    if (PRE_TRANSLATED_EN[lower]) return PRE_TRANSLATED_EN[lower];
    if (COMMON_NAMES_EN[lower]) return COMMON_NAMES_EN[lower];
  }

  // 2. Revisar caché en memoria
  const cacheKey = `zoomat_tr_${fromLang}_${toLang}_${trimmed}`;
  if (memoryTranslationCache.has(cacheKey)) {
    return memoryTranslationCache.get(cacheKey)!;
  }

  // 3. Revisar caché en localStorage
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      memoryTranslationCache.set(cacheKey, cached);
      return cached;
    }
  } catch {}

  // 4. Intentar Google Translate GTX API (CORS habilitado público y veloz)
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

  // 5. Fallback a MyMemory API
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(trimmed)}&langpair=${fromLang}|${toLang}`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      const translated = data?.responseData?.translatedText;
      if (typeof translated === "string" && translated.trim()) {
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
    // Si tenemos traducción en diccionario estático o caché de localStorage, usarla de inmediato
    const lowerName = rawName.toLowerCase();
    if (COMMON_NAMES_EN[lowerName]) {
      name = COMMON_NAMES_EN[lowerName];
    } else {
      try {
        const cachedName = localStorage.getItem(`zoomat_tr_es_en_${rawName.trim()}`);
        if (cachedName) name = cachedName;
      } catch {}
    }

    if (PRE_TRANSLATED_EN[rawFunFact.trim()] || PRE_TRANSLATED_EN[rawFunFact.trim().toLowerCase()]) {
      funFact = PRE_TRANSLATED_EN[rawFunFact.trim()] || PRE_TRANSLATED_EN[rawFunFact.trim().toLowerCase()];
    } else {
      try {
        const cached = localStorage.getItem(`zoomat_tr_es_en_${rawFunFact.trim()}`);
        if (cached) funFact = cached;
      } catch {}
    }

    if (PRE_TRANSLATED_EN[rawHabitat.trim()] || PRE_TRANSLATED_EN[rawHabitat.trim().toLowerCase()]) {
      habitat = PRE_TRANSLATED_EN[rawHabitat.trim()] || PRE_TRANSLATED_EN[rawHabitat.trim().toLowerCase()];
    } else {
      try {
        const cached = localStorage.getItem(`zoomat_tr_es_en_${rawHabitat.trim()}`);
        if (cached) habitat = cached;
      } catch {}
    }

    if (PRE_TRANSLATED_EN[rawDiet.trim()] || PRE_TRANSLATED_EN[rawDiet.trim().toLowerCase()]) {
      diet = PRE_TRANSLATED_EN[rawDiet.trim()] || PRE_TRANSLATED_EN[rawDiet.trim().toLowerCase()];
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
    mediaImages: Array.isArray(animal.mediaImages) ? animal.mediaImages.map(String).slice(0, 4) : [],
    mediaVideos: Array.isArray(animal.mediaVideos) ? animal.mediaVideos.map(String).slice(0, 2) : [],
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
): LocalizedAnimalData | null {
  const [data, setData] = useState<LocalizedAnimalData | null>(() => {
    return animal ? getLocalizedAnimal(animal, isEs) : null;
  });

  useEffect(() => {
    if (!animal) {
      setData(null);
      return;
    }

    // 1. Si es español, revertir inmediatamente a los datos originales en español
    if (isEs) {
      setData(getLocalizedAnimal(animal, true));
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
        COMMON_NAMES_EN[rawName.toLowerCase()] || translateTextAsync(rawName, "es", "en"),
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

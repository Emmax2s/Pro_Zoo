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

export function translateText(text: string): string {
  return text || "";
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
  "En Peligro de Extinción": "Endangered",
  "Amenazada": "Threatened",
  "Protegida Especial": "Special Protection",
  "Preocupación Menor": "Least Concern",
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

export function getLocalizedAnimal(animal: Record<string, unknown> | null | undefined, isEs: boolean): LocalizedAnimalData {
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

  const rawCat = String(animal.category || "");
  const rawStat = String(animal.translatedStatus || animal.status || animal.conservation || "");

  const category = isEs
    ? CATEGORY_MAP_ES[rawCat] || rawCat
    : CATEGORY_MAP_EN[rawCat] || rawCat;

  const status = isEs
    ? STATUS_MAP_ES[rawStat] || rawStat
    : STATUS_MAP_EN[rawStat] || rawStat;

  return {
    name: String(animal.name || ""),
    scientificName: String(animal.scientificName || animal.species || ""),
    category,
    status,
    habitat: String(animal.habitat || ""),
    diet: String(animal.diet || ""),
    funFact: String(animal.funFact || animal.description || ""),
    audioUrl: String(animal.audioUrl || animal.audioDescriptionUrl || "") || undefined,
    mediaImages: Array.isArray(animal.mediaImages) ? animal.mediaImages.map(String).slice(0, 4) : [],
    mediaVideos: Array.isArray(animal.mediaVideos) ? animal.mediaVideos.map(String).slice(0, 2) : [],
  };
}

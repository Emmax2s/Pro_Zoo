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

  return {
    name: String(animal.name || ""),
    scientificName: String(animal.scientificName || animal.species || ""),
    category: String(animal.category || ""),
    status: String(animal.translatedStatus || animal.status || animal.conservation || ""),
    habitat: String(animal.habitat || ""),
    diet: String(animal.diet || ""),
    funFact: String(animal.funFact || animal.description || ""),
    audioUrl: String(animal.audioUrl || animal.audioDescriptionUrl || "") || undefined,
    mediaImages: Array.isArray(animal.mediaImages) ? animal.mediaImages.map(String).slice(0, 4) : [],
    mediaVideos: Array.isArray(animal.mediaVideos) ? animal.mediaVideos.map(String).slice(0, 2) : [],
  };
}

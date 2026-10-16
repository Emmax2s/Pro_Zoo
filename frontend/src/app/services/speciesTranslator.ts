export interface LocalizedAnimalData {
  name: string;
  scientificName: string;
  category: string;
  status: string;
  habitat: string;
  diet: string;
  funFact: string;
  audioUrl?: string;
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
    };
  }

  return {
    name: String((isEs ? animal.name : animal.nameEn || animal.name) || ""),
    scientificName: String(animal.scientificName || animal.species || ""),
    category: String(animal.category || ""),
    status: String(animal.status || animal.conservation || ""),
    habitat: String((isEs ? animal.habitat : animal.habitatEn || animal.habitat) || ""),
    diet: String((isEs ? animal.diet : animal.dietEn || animal.diet) || ""),
    funFact: String((isEs ? animal.funFact : animal.funFactEn || animal.funFact || animal.description) || ""),
    audioUrl: String(animal.audioUrl || animal.audioDescriptionUrl || "") || undefined,
  };
}

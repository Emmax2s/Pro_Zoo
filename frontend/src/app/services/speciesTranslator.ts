// speciesTranslator.ts — Comprehensive bilingual dictionary and audio helper for ZooMAT species

import { Animal, INITIAL_ANIMALS } from "../data/zooStore";

// Known translations for ZooMAT species
const SPECIES_TRANSLATIONS: Record<
  string,
  {
    nameEn: string;
    scientificName?: string;
    habitatEn: string;
    dietEn: string;
    funFactEn: string;
    audioUrl?: string;
  }
> = {
  "guacamaya roja": {
    nameEn: "Scarlet Macaw",
    scientificName: "Ara macao",
    habitatEn: "Lowland tropical rainforests and tall canopy trees of Chiapas.",
    dietEn: "Fruits, seeds, nuts, and fresh tender sprouts.",
    funFactEn: "Its beak is large and lightweight relative to its body size. They mate for life and can crack open extremely hard seeds.",
    audioUrl: "https://www.xeno-canto.org/sounds/uploaded/RMPZMKKZGN/XC584025-Scarlet_Macaw_Ara_macao.mp3",
  },
  "jaguar": {
    nameEn: "Jaguar",
    scientificName: "Panthera onca",
    habitatEn: "Lacandon Jungle and dense forest reserves of Chiapas.",
    dietEn: "Carnivore: peccaries, deer, tapirs, turtles, and fish.",
    funFactEn: "It is the largest feline in the Americas. Its powerful bite can pierce turtle shells.",
  },
  "tucán pico iris": {
    nameEn: "Keel-billed Toucan",
    scientificName: "Ramphastos sulfuratus",
    habitatEn: "Lowland tropical rainforests of Chiapas.",
    dietEn: "Frugivore: wild fruits, small insects, and tree frogs.",
    funFactEn: "Its colorful beak measures up to one third of its body length but is very light because it is hollow inside.",
  },
  "tapir centroamericano": {
    nameEn: "Baird's Tapir",
    scientificName: "Tapirus bairdii",
    habitatEn: "Cloud forests and dense tropical vegetation near riverbanks.",
    dietEn: "Herbivore: fresh leaves, fallen fruits, aquatic plants, and tree twigs.",
    funFactEn: "It is the largest land mammal in Central America and an exceptional swimmer and diver.",
  },
  "quetzal": {
    nameEn: "Resplendent Quetzal",
    scientificName: "Pharomachrus mocinno",
    habitatEn: "Cloud forests in the Sierra Madre highlands of Chiapas.",
    dietEn: "Omnivore: wild avocados, tree fruits, insects, and small tree frogs.",
    funFactEn: "The male's twin tail feathers can grow over 60 cm long during the mating season.",
  },
  "cocodrilo de río": {
    nameEn: "American Crocodile",
    scientificName: "Crocodylus acutus",
    habitatEn: "Coastal rivers, lagoons, and mangroves of Chiapas.",
    dietEn: "Carnivore: freshwater fish, waterfowl, and small river mammals.",
    funFactEn: "They regulate their internal temperature by sunbathing on riverbanks with their mouths wide open.",
  },
  "cocodrilo de pantano": {
    nameEn: "Morelet's Crocodile",
    scientificName: "Crocodylus moreletii",
    habitatEn: "Freshwater swamps, wetlands, and slow-moving rivers.",
    dietEn: "Carnivore: fish, mollusks, turtles, and wading birds.",
    funFactEn: "Endemic to southeastern Mexico and Central America, well adapted to marshland waters.",
  },
  "pavón cornudo": {
    nameEn: "Horned Guan",
    scientificName: "Oreophasis derbianus",
    habitatEn: "High-altitude cloud forests of the Sierra Madre of Chiapas.",
    dietEn: "Herbivore/Frugivore: mountain fruits, flowers, and tender leaves.",
    funFactEn: "Distinctive scarlet horn on its head made of bare bone covered in bright red skin.",
  },
  "mono araña": {
    nameEn: "Geoffroy's Spider Monkey",
    scientificName: "Ateles geoffroyi",
    habitatEn: "Upper canopy of tropical evergreen rainforests.",
    dietEn: "Frugivore: ripe fruits, seeds, nuts, and young leaves.",
    funFactEn: "Their prehensile tail acts as a fifth limb, capable of supporting their entire body weight.",
  },
  "mono aullador": {
    nameEn: "Mantled Howler Monkey",
    scientificName: "Alouatta palliata",
    habitatEn: "Tropical rainforest canopy and riverside forests.",
    dietEn: "Folivore/Frugivore: leaves, flowers, and forest fruits.",
    funFactEn: "Their deep guttural roar can be heard over 3 miles away through dense jungle.",
  },
  "saraguato": {
    nameEn: "Howler Monkey",
    scientificName: "Alouatta pigra",
    habitatEn: "Tropical evergreen forests of southern Mexico.",
    dietEn: "Leaves, seasonal fruits, and forest flowers.",
    funFactEn: "One of the loudest land animals in the world, vocalizing to defend their troop's territory.",
  },
  "ocelote": {
    nameEn: "Ocelot",
    scientificName: "Leopardus pardalis",
    habitatEn: "Tropical dry forests and dense subtropical brush of Chiapas.",
    dietEn: "Carnivore: small rodents, reptiles, birds, and armadillos.",
    funFactEn: "Possesses beautiful chain-like coat patterns unique to each individual.",
  },
  "león africano": {
    nameEn: "African Lion",
    scientificName: "Panthera leo",
    habitatEn: "African savannah and open grasslands.",
    dietEn: "Carnivore (zebras, wildebeest, antelopes).",
    funFactEn: "The second largest big cat after the tiger, living in family prides.",
  },
  "elefante africano": {
    nameEn: "African Elephant",
    scientificName: "Loxodonta africana",
    habitatEn: "Savannah and open woodland habitats.",
    dietEn: "Herbivore (tall grass, bark, roots, fruits).",
    funFactEn: "The largest living terrestrial animal, possessing remarkable memory and empathy.",
  },
  "jirafa": {
    nameEn: "Giraffe",
    scientificName: "Giraffa camelopardalis",
    habitatEn: "Dry savannahs and open acacia woodlands.",
    dietEn: "Herbivore (acacia leaves, twigs, and shrubs).",
    funFactEn: "The tallest terrestrial mammal, using its 45 cm prehensile tongue to harvest leaves.",
  },
};

// Common phrases dictionary for database records
const PHRASE_DICTIONARY: [RegExp, string][] = [
  [/selvas tropicales húmedas y bosques altos/gi, "tropical rainforests and tall canopy forests"],
  [/selvas tropicales\./gi, "Tropical rainforests."],
  [/selvas tropicales/gi, "tropical rainforests"],
  [/selva tropical/gi, "tropical rainforest"],
  [/selva lacandona/gi, "Lacandon Jungle"],
  [/bosques tropicales/gi, "tropical forests"],
  [/bosques de niebla/gi, "cloud forests"],
  [/sabana africana/gi, "African savannah"],
  [/frutos, semillas y nueces\./gi, "Fruits, seeds, and nuts."],
  [/frutos, semillas y nueces/gi, "fruits, seeds, and nuts"],
  [/su pico es grande y ligero en relación con su tamaño\./gi, "Its beak is large and lightweight relative to its body size."],
  [/su pico es grande y ligero en relación con su tamaño/gi, "its beak is large and lightweight relative to its body size"],
  [/carnívoro/gi, "Carnivore"],
  [/herbívoro/gi, "Herbivore"],
  [/frugívoro/gi, "Frugivore"],
  [/omnívoro/gi, "Omnivore"],
  [/nocturno/gi, "Nocturnal"],
  [/diurno/gi, "Diurnal"],
  [/en peligro de extinción/gi, "Endangered"],
  [/amenazada/gi, "Threatened"],
  [/protegida especial/gi, "Special Protection"],
  [/preocupación menor/gi, "Least Concern"],
];

function translateText(text: string): string {
  if (!text) return "";
  let result = text;
  for (const [pattern, replacement] of PHRASE_DICTIONARY) {
    result = result.replace(pattern, replacement);
  }
  return result;
}

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

export function getLocalizedAnimal(animal: any, isEs: boolean): LocalizedAnimalData {
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

  // 1. If Spanish, return original data
  if (isEs) {
    return {
      name: animal.name || "",
      scientificName: animal.scientificName || animal.species || "",
      category: animal.category || "Mamífero",
      status: animal.status || animal.conservation || "Amenazada",
      habitat: animal.habitat || "",
      diet: animal.diet || "",
      funFact: animal.funFact || animal.description || "",
      audioUrl: animal.audioUrl || animal.audioDescriptionUrl,
    };
  }

  // 2. English requested: Check if explicit En properties exist
  let nameEn = animal.nameEn;
  let habitatEn = animal.habitatEn;
  let dietEn = animal.dietEn;
  let funFactEn = animal.funFactEn;
  let audioUrl = animal.audioUrl || animal.audioDescriptionUrl;

  // 3. Match against known dictionary
  const key = (animal.name || "").toLowerCase().trim();
  const matched = SPECIES_TRANSLATIONS[key];

  if (matched) {
    nameEn = nameEn || matched.nameEn;
    habitatEn = habitatEn || matched.habitatEn;
    dietEn = dietEn || matched.dietEn;
    funFactEn = funFactEn || matched.funFactEn;
    if (!audioUrl || audioUrl.includes("example.com")) {
      audioUrl = matched.audioUrl || audioUrl;
    }
  }

  // Also check against INITIAL_ANIMALS
  const initialMatch = INITIAL_ANIMALS.find(
    (a) =>
      a.name.toLowerCase() === key ||
      (a.scientificName && animal.scientificName && a.scientificName.toLowerCase() === animal.scientificName.toLowerCase())
  );

  if (initialMatch) {
    nameEn = nameEn || initialMatch.nameEn;
    habitatEn = habitatEn || initialMatch.habitatEn;
    dietEn = dietEn || initialMatch.dietEn;
    funFactEn = funFactEn || initialMatch.funFactEn;
    if (!audioUrl || audioUrl.includes("example.com")) {
      audioUrl = initialMatch.audioUrl || audioUrl;
    }
  }

  // 4. Translate fallback using phrase dictionary
  nameEn = nameEn || translateText(animal.name);
  habitatEn = habitatEn || translateText(animal.habitat || "");
  dietEn = dietEn || translateText(animal.diet || "");
  funFactEn = funFactEn || translateText(animal.funFact || animal.description || "");

  // Clean audio URL if it's example.com dummy
  if (audioUrl && audioUrl.includes("example.com")) {
    audioUrl = undefined;
  }

  // Map category to English
  const cat = animal.category || "Mamífero";
  const categoryEn =
    cat === "Mamífero"
      ? "Mammal"
      : cat === "Ave"
      ? "Bird"
      : cat === "Reptil"
      ? "Reptile"
      : cat === "Anfibio"
      ? "Amphibian"
      : cat;

  // Map status to English
  const st = animal.status || animal.conservation || "Amenazada";
  const statusEn =
    st.includes("Peligro") || st.toLowerCase().includes("danger")
      ? "Endangered"
      : st.includes("Amenaz") || st.toLowerCase().includes("threat")
      ? "Threatened"
      : st.includes("Protegida")
      ? "Special Protection"
      : "Least Concern";

  return {
    name: nameEn || animal.name,
    scientificName: animal.scientificName || animal.species || "",
    category: categoryEn,
    status: statusEn,
    habitat: habitatEn || animal.habitat || "",
    diet: dietEn || animal.diet || "",
    funFact: funFactEn || animal.funFact || animal.description || "",
    audioUrl,
  };
}

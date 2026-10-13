// Shared data store — single source of truth for animals, enclosures, and users.

export type ConservationStatus =
  | "En Peligro de Extinción"
  | "Amenazada"
  | "Protegida Especial"
  | "Preocupación Menor";

export type AnimalCategory = "Mamífero" | "Ave" | "Reptil" | "Anfibio" | "Pez" | "Invertebrado";

export interface Enclosure {
  id: string;
  name: string;
  description: string;
  color: string; // tailwind bg color token
  icon: string;  // icon name
}

export interface Animal {
  id: number;
  name: string;
  nameEn?: string;
  scientificName: string;
  category: AnimalCategory;
  status: ConservationStatus;
  habitat: string;
  habitatEn?: string;
  diet: string;
  dietEn?: string;
  funFact: string;
  funFactEn?: string;
  image: string;
  audioUrl?: string;
  enclosureId: string | null;
}

export type UserRole = "superadmin" | "enclosure_admin";

export interface ZooUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  enclosureId: string | null; // only set for enclosure_admin
  status: "Activo" | "Inactivo";
}

// ── Enclosures ──────────────────────────────────────────────────────────────

export const DEFAULT_ENCLOSURES: Enclosure[] = [];

// ── Animals ─────────────────────────────────────────────────────────────────

export const INITIAL_ANIMALS: Animal[] = [
  {
    id: 1,
    name: "Guacamaya Roja",
    nameEn: "Scarlet Macaw",
    scientificName: "Ara macao",
    category: "Ave",
    status: "En Peligro de Extinción",
    habitat: "Selvas tropicales húmedas y bosques altos de Chiapas",
    habitatEn: "Tropical rainforests and tall canopy forests of Chiapas",
    diet: "Herbívoro/Frugívoro: semillas duras, frutos, brotes y néctar",
    dietEn: "Herbivore/Frugivore: hard seeds, fruits, sprouts, and nectar",
    funFact: "Se aparean de por vida (monógamas) y su fuerte pico puede romper nueces de cáscara extremadamente dura con facilidad.",
    funFactEn: "They mate for life (monogamous) and their strong beak can easily crack open extremely hard-shelled nuts.",
    image: "https://images.unsplash.com/photo-1552728089-57bdde30beb3?auto=format&fit=crop&q=80&w=1000",
    audioUrl: "https://www.xeno-canto.org/sounds/uploaded/RMPZMKKZGN/XC584025-Scarlet_Macaw_Ara_macao.mp3",
    enclosureId: null,
  },
  {
    id: 2,
    name: "Jaguar",
    nameEn: "Jaguar",
    scientificName: "Panthera onca",
    category: "Mamífero",
    status: "En Peligro de Extinción",
    habitat: "Selva Lacandona y reservas forestales de Chiapas",
    habitatEn: "Lacandon Jungle and forest reserves of Chiapas",
    diet: "Carnívoro: pecaríes, venados, tapires y peces",
    dietEn: "Carnivore: peccaries, deer, tapirs, and fish",
    funFact: "Es el felino más grande de América. Posee una mordida tan potente que puede atravesar el caparazón de una tortuga.",
    funFactEn: "It is the largest feline in the Americas. Its bite is so powerful it can pierce a turtle's shell.",
    image: "https://images.unsplash.com/photo-1561731216-c3a4d99437d5?auto=format&fit=crop&q=80&w=1000",
    enclosureId: null,
  },
  {
    id: 3,
    name: "Tucán Pico Iris",
    nameEn: "Keel-billed Toucan",
    scientificName: "Ramphastos sulfuratus",
    category: "Ave",
    status: "Amenazada",
    habitat: "Bosques tropicales y selvas de baja altitud de Chiapas",
    habitatEn: "Lowland tropical rainforests of Chiapas",
    diet: "Frugívoro: frutas silvestres, pequeños insectos y huevos",
    dietEn: "Frugivore: wild fruits, small insects, and eggs",
    funFact: "Su colorido pico mide hasta un tercio de su cuerpo pero es muy ligero porque es hueco por dentro.",
    funFactEn: "Its colorful beak measures up to one third of its body length but is very light because it is hollow inside.",
    image: "https://images.unsplash.com/photo-1546182990-dffeafbe841d?auto=format&fit=crop&q=80&w=1000",
    enclosureId: null,
  },
  {
    id: 4,
    name: "Tapir Centroamericano",
    nameEn: "Baird's Tapir",
    scientificName: "Tapirus bairdii",
    category: "Mamífero",
    status: "En Peligro de Extinción",
    habitat: "Bosques de niebla y selva tropical cerca de ríos",
    habitatEn: "Cloud forests and tropical rainforests near rivers",
    diet: "Herbívoro: hojas, frutos, ramas tiernas y plantas acuáticas",
    dietEn: "Herbivore: leaves, fruits, tender twigs, and aquatic plants",
    funFact: "Es el mamífero terrestre más grande de Centroamérica y un excelente nadador.",
    funFactEn: "It is the largest land mammal in Central America and an excellent swimmer.",
    image: "https://images.unsplash.com/photo-1574063413132-355dbfd83e0c?auto=format&fit=crop&q=80&w=1000",
    enclosureId: null,
  },
  {
    id: 5,
    name: "Quetzal",
    nameEn: "Resplendent Quetzal",
    scientificName: "Pharomachrus mocinno",
    category: "Ave",
    status: "Protegida Especial",
    habitat: "Bosques nubosos de la Sierra Madre de Chiapas",
    habitatEn: "Cloud forests of the Sierra Madre of Chiapas",
    diet: "Omnívoro: aguacatillos silvestres, insectos y pequeñas ranas",
    dietEn: "Omnivore: wild avocados, insects, and small frogs",
    funFact: "Las plumas de la cola del macho pueden medir más de 60 cm de largo durante la época de reproducción.",
    funFactEn: "The male's tail feathers can measure over 60 cm long during the breeding season.",
    image: "https://images.unsplash.com/photo-1618281381339-7ca650c133e3?auto=format&fit=crop&q=80&w=1000",
    enclosureId: null,
  },
  {
    id: 6,
    name: "Cocodrilo de Río",
    nameEn: "American Crocodile",
    scientificName: "Crocodylus acutus",
    category: "Reptil",
    status: "Protegida Especial",
    habitat: "Ríos, estuarios y manglares de Chiapas",
    habitatEn: "Rivers, estuaries, and mangroves of Chiapas",
    diet: "Carnívoro: peces, aves acuáticas y pequeños mamíferos",
    dietEn: "Carnivore: fish, waterfowl, and small mammals",
    funFact: "Pueden regular su temperatura tomando el sol en las orillas de los ríos con la boca abierta.",
    funFactEn: "They can regulate their temperature by sunbathing on riverbanks with their mouths open.",
    image: "https://images.unsplash.com/photo-1525869916826-97fe88508861?auto=format&fit=crop&q=80&w=1000",
    enclosureId: null,
  },
];

// ── Users ────────────────────────────────────────────────────────────────────

export const INITIAL_USERS: ZooUser[] = [];

// ── Home carousel ────────────────────────────────────────────────────────────

export type SlideItem =
  | { id: string; type: "image"; src: string; alt: string }
  | { id: string; type: "video"; src: string; poster: string; alt: string };

export const INITIAL_SLIDES: SlideItem[] = [
  {
    id: "1",
    type: "image",
    src: "https://images.unsplash.com/photo-1552728089-57bdde30beb3?auto=format&fit=crop&q=80&w=1600",
    alt: "Guacamaya Roja ZooMAT",
  },
  {
    id: "2",
    type: "image",
    src: "https://images.unsplash.com/photo-1561731216-c3a4d99437d5?auto=format&fit=crop&q=80&w=1600",
    alt: "Jaguar de Chiapas ZooMAT",
  },
  {
    id: "3",
    type: "image",
    src: "https://images.unsplash.com/photo-1546182990-dffeafbe841d?auto=format&fit=crop&q=80&w=1600",
    alt: "Tucán Pico Iris ZooMAT",
  },
  {
    id: "4",
    type: "image",
    src: "https://images.unsplash.com/photo-1574063413132-355dbfd83e0c?auto=format&fit=crop&q=80&w=1600",
    alt: "Fauna Silvestre ZooMAT",
  },
];

// ── Status helpers ────────────────────────────────────────────────────────────

export const STATUS_COLORS: Record<ConservationStatus, string> = {
  "En Peligro de Extinción": "bg-red-100 text-red-800",
  "Amenazada": "bg-yellow-100 text-yellow-800",
  "Protegida Especial": "bg-orange-100 text-orange-800",
  "Preocupación Menor": "bg-green-100 text-green-800",
};

export const ANIMAL_CATEGORIES: AnimalCategory[] = ["Mamífero", "Ave", "Reptil", "Anfibio", "Pez", "Invertebrado"];
export const CONSERVATION_STATUSES: ConservationStatus[] = [
  "En Peligro de Extinción",
  "Amenazada",
  "Protegida Especial",
  "Preocupación Menor",
];

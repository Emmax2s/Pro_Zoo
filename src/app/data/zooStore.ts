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

export const DEFAULT_ENCLOSURES: Enclosure[] = [
  {
    id: "herpetario",
    name: "Herpetario",
    description: "Reptiles y anfibios de la región",
    color: "bg-amber-500",
    icon: "ShieldAlert",
  },
  {
    id: "casa-nocturna",
    name: "Casa Nocturna",
    description: "Fauna de hábitos nocturnos",
    color: "bg-indigo-600",
    icon: "Moon",
  },
  {
    id: "vivario",
    name: "Vivario",
    description: "Ecosistemas controlados con flora y fauna",
    color: "bg-emerald-600",
    icon: "Trees",
  },
];

// ── Animals ─────────────────────────────────────────────────────────────────

export const INITIAL_ANIMALS: Animal[] = [
  {
    id: 1,
    name: "Jaguar",
    nameEn: "Jaguar",
    scientificName: "Panthera onca",
    category: "Mamífero",
    status: "En Peligro de Extinción",
    habitat: "Selvas tropicales y bosques húmedos de Chiapas",
    habitatEn: "Tropical rainforests and cloud forests of Chiapas",
    diet: "Carnívoro: pecaríes, venados, tapires, aves y reptiles",
    dietEn: "Carnivore: peccaries, deer, tapirs, birds and reptiles",
    funFact: "El jaguar tiene la mordida más fuerte de todos los felinos y puede romper el caparazón de una tortuga.",
    funFactEn: "The jaguar has the strongest bite of all big cats and can pierce turtle shells.",
    image: "/assets/images/jaguar.svg",
    audioUrl: "https://actions.google.com/sounds/v1/animals/jaguar_roar.ogg",
    enclosureId: null,
  },
  {
    id: 2,
    name: "Tucán Pico Iris",
    nameEn: "Keel-billed Toucan",
    scientificName: "Ramphastos sulfuratus",
    category: "Ave",
    status: "Amenazada",
    habitat: "Selva tropical húmeda, desde el sur de México hasta Colombia",
    habitatEn: "Tropical rainforest, from southern Mexico to Colombia",
    diet: "Omnívoro: frutas, insectos, huevos y pequeños vertebrados",
    dietEn: "Omnivore: fruits, insects, eggs and small vertebrates",
    funFact: "Su pico grande y colorido representa el 30% de su longitud total.",
    funFactEn: "Its large, colorful bill accounts for 30% of its total body length.",
    image: "/assets/images/toucan.svg",
    audioUrl: "https://actions.google.com/sounds/v1/animals/bird_call.ogg",
    enclosureId: "vivario",
  },
  {
    id: 3,
    name: "Tapir Centroamericano",
    nameEn: "Central American Tapir",
    scientificName: "Tapirus bairdii",
    category: "Mamífero",
    status: "En Peligro de Extinción",
    habitat: "Bosques tropicales y humedales del sur de México",
    habitatEn: "Tropical forests and wetlands of southern Mexico",
    diet: "Herbívoro: hojas, frutas, ramas y plantas acuáticas",
    dietEn: "Herbivore: leaves, fruits, twigs and aquatic plants",
    funFact: "Son excelentes nadadores y pueden sumergirse completamente en el agua.",
    funFactEn: "They are excellent swimmers and can fully submerge under water.",
    image: "/assets/images/tapir.svg",
    audioUrl: "https://actions.google.com/sounds/v1/animals/large_mammal.ogg",
    enclosureId: null,
  },
  {
    id: 4,
    name: "Mono Araña",
    nameEn: "Geoffroy's Spider Monkey",
    scientificName: "Ateles geoffroyi",
    category: "Mamífero",
    status: "En Peligro de Extinción",
    habitat: "Selvas tropicales del sureste mexicano",
    habitatEn: "Tropical rainforests of southeastern Mexico",
    diet: "Omnívoro principalmente frugívoro: frutas, flores, semillas e insectos",
    dietEn: "Frugivorous omnivore: fruits, flowers, seeds and insects",
    funFact: "Su cola prensil actúa como una quinta mano.",
    funFactEn: "Its prehensile tail acts as a fifth hand to swing between branches.",
    image: "/assets/images/monkey.svg",
    audioUrl: "https://actions.google.com/sounds/v1/animals/monkey_chatter.ogg",
    enclosureId: "casa-nocturna",
  },
  {
    id: 5,
    name: "Guacamaya Roja",
    nameEn: "Scarlet Macaw",
    scientificName: "Ara macao",
    category: "Ave",
    status: "Amenazada",
    habitat: "Selvas tropicales húmedas de Chiapas",
    habitatEn: "Humid tropical rainforests of Chiapas",
    diet: "Herbívoro: frutas, nueces, semillas y flores",
    dietEn: "Herbivore: fruits, nuts, seeds and flowers",
    funFact: "Forman parejas de por vida y pueden vivir hasta 50 años.",
    funFactEn: "They form lifelong pairs and can live up to 50 years.",
    image: "/assets/images/macaw.svg",
    audioUrl: "https://actions.google.com/sounds/v1/animals/macaw_squawk.ogg",
    enclosureId: "vivario",
  },
  {
    id: 6,
    name: "Cocodrilo de Pantano",
    nameEn: "Morelet's Crocodile",
    scientificName: "Crocodylus moreletii",
    category: "Reptil",
    status: "Protegida Especial",
    habitat: "Ríos, lagos y pantanos de Chiapas y la costa del Golfo",
    habitatEn: "Rivers, lakes and marshes of Chiapas and the Gulf coast",
    diet: "Carnívoro: peces, aves, mamíferos pequeños y crustáceos",
    dietEn: "Carnivore: fish, birds, small mammals and crustaceans",
    funFact: "Es el cocodrilo más pequeño de México, alcanzando un máximo de 3 metros.",
    funFactEn: "It is the smaller crocodile species in Mexico, reaching up to 3 meters.",
    image: "/assets/images/rocodile.svg",
    audioUrl: "https://actions.google.com/sounds/v1/animals/alligator_hiss.ogg",
    enclosureId: "herpetario",
  },
];

// ── Users ────────────────────────────────────────────────────────────────────

export const INITIAL_USERS: ZooUser[] = [
  {
    id: 1,
    name: "Admin Principal",
    email: "admin@zoomat.mx",
    role: "superadmin",
    enclosureId: null,
    status: "Activo",
  },
  {
    id: 2,
    name: "María Ramos",
    email: "mramos@zoomat.mx",
    role: "enclosure_admin",
    enclosureId: "herpetario",
    status: "Activo",
  },
  {
    id: 3,
    name: "Carlos Núñez",
    email: "cnunez@zoomat.mx",
    role: "enclosure_admin",
    enclosureId: "vivario",
    status: "Activo",
  },
];

// ── Home carousel ────────────────────────────────────────────────────────────

export type SlideItem =
  | { id: string; type: "image"; src: string; alt: string }
  | { id: string; type: "video"; src: string; poster: string; alt: string };

export const INITIAL_SLIDES: SlideItem[] = [
  {
    id: "s1",
    type: "image",
    src: "/assets/images/jaguar.svg",
    alt: "Jaguar en Chiapas",
  },
  {
    id: "s2",
    type: "image",
    src: "/assets/images/toucan.svg",
    alt: "Tucán Pico Iris",
  },
  {
    id: "s3",
    type: "video",
    src: "/assets/videos/sample.mp4",
    poster: "/assets/images/poster.svg",
    alt: "Video — fauna del ZooMAT",
  },
  {
    id: "s4",
    type: "image",
    src: "/assets/images/monkey.svg",
    alt: "Mono Araña",
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

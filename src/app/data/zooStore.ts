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
  icon: string;  // emoji
}

export interface Animal {
  id: number;
  name: string;
  scientificName: string;
  category: AnimalCategory;
  status: ConservationStatus;
  habitat: string;
  diet: string;
  funFact: string;
  image: string;
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
    icon: "🦎",
  },
  {
    id: "casa-nocturna",
    name: "Casa Nocturna",
    description: "Fauna de hábitos nocturnos",
    color: "bg-indigo-600",
    icon: "🦇",
  },
  {
    id: "vivario",
    name: "Vivario",
    description: "Ecosistemas controlados con flora y fauna",
    color: "bg-emerald-600",
    icon: "🌿",
  },
];

// ── Animals ─────────────────────────────────────────────────────────────────

export const INITIAL_ANIMALS: Animal[] = [
  {
    id: 1,
    name: "Jaguar",
    scientificName: "Panthera onca",
    category: "Mamífero",
    status: "En Peligro de Extinción",
    habitat: "Selvas tropicales y bosques húmedos de Chiapas",
    diet: "Carnívoro: pecaríes, venados, tapires, aves y reptiles",
    funFact: "El jaguar tiene la mordida más fuerte de todos los felinos y puede romper el caparazón de una tortuga.",
    image: "/assets/images/jaguar.svg",
    enclosureId: null,
  },
  {
    id: 2,
    name: "Tucán Pico Iris",
    scientificName: "Ramphastos sulfuratus",
    category: "Ave",
    status: "Amenazada",
    habitat: "Selva tropical húmeda, desde el sur de México hasta Colombia",
    diet: "Omnívoro: frutas, insectos, huevos y pequeños vertebrados",
    funFact: "Su pico grande y colorido representa el 30% de su longitud total.",
    image: "/assets/images/toucan.svg",
    enclosureId: "vivario",
  },
  {
    id: 3,
    name: "Tapir Centroamericano",
    scientificName: "Tapirus bairdii",
    category: "Mamífero",
    status: "En Peligro de Extinción",
    habitat: "Bosques tropicales y humedales del sur de México",
    diet: "Herbívoro: hojas, frutas, ramas y plantas acuáticas",
    funFact: "Son excelentes nadadores y pueden sumergirse completamente en el agua.",
    image: "/assets/images/tapir.svg",
    enclosureId: null,
  },
  {
    id: 4,
    name: "Mono Araña",
    scientificName: "Ateles geoffroyi",
    category: "Mamífero",
    status: "En Peligro de Extinción",
    habitat: "Selvas tropicales del sureste mexicano",
    diet: "Omnívoro principalmente frugívoro: frutas, flores, semillas e insectos",
    funFact: "Su cola prensil actúa como una quinta mano.",
    image: "/assets/images/monkey.svg",
    enclosureId: "casa-nocturna",
  },
  {
    id: 5,
    name: "Guacamaya Roja",
    scientificName: "Ara macao",
    category: "Ave",
    status: "Amenazada",
    habitat: "Selvas tropicales húmedas de Chiapas",
    diet: "Herbívoro: frutas, nueces, semillas y flores",
    funFact: "Forman parejas de por vida y pueden vivir hasta 50 años.",
    image: "/assets/images/macaw.svg",
    enclosureId: "vivario",
  },
  {
    id: 6,
    name: "Cocodrilo de Pantano",
    scientificName: "Crocodylus moreletii",
    category: "Reptil",
    status: "Protegida Especial",
    habitat: "Ríos, lagos y pantanos de Chiapas y la costa del Golfo",
    diet: "Carnívoro: peces, aves, mamíferos pequeños y crustáceos",
    funFact: "Es el cocodrilo más pequeño de México, alcanzando un máximo de 3 metros.",
    image: "/assets/images/rocodile.svg",
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

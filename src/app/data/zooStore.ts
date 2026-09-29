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
  nameEn?: string;
  scientificName: string;
  category: AnimalCategory;
  status: ConservationStatus;
  statusEn?: string;
  habitat: string;
  habitatEn?: string;
  diet: string;
  dietEn?: string;
  funFact: string;
  funFactEn?: string;
  image: string;
  audioUrl?: string;
  enclosureId: string | null;
  lifespan?: string;
  weight?: string;
  height?: string;
  feedingTime?: string;
  zone?: string;
  num?: string;
  description?: string;
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
    icon: "reptile",
  },
  {
    id: "casa-nocturna",
    name: "Casa Nocturna",
    description: "Fauna de hábitos nocturnos",
    color: "bg-indigo-600",
    icon: "nocturnal",
  },
  {
    id: "vivario",
    name: "Vivario",
    description: "Ecosistemas controlados con flora y fauna",
    color: "bg-emerald-600",
    icon: "vivarium",
  },
];

// ── Animals ─────────────────────────────────────────────────────────────────

export const INITIAL_ANIMALS: Animal[] = [
  {
    id: 1,
    num: "01",
    name: "Jaguar",
    nameEn: "Jaguar",
    scientificName: "Panthera onca",
    category: "Mamífero",
    status: "En Peligro de Extinción",
    statusEn: "Endangered",
    habitat: "Selvas tropicales y bosques húmedos de Chiapas",
    habitatEn: "Tropical rainforests and humid cloud forests of Chiapas",
    diet: "Carnívoro",
    dietEn: "Carnivore",
    lifespan: "12–15 años",
    weight: "56–96 kg",
    height: "63–76 cm",
    feedingTime: "11:00 · 17:00",
    zone: "Zona Felinos",
    description: "El felino más grande de América y símbolo sagrado de las culturas mesoamericanas. Habita las selvas húmedas de Chiapas en recintos naturales adaptados.",
    funFact: "El jaguar tiene la mordida más fuerte de todos los felinos y puede romper el caparazón de una tortuga.",
    funFactEn: "The jaguar has the strongest bite of all big cats and can pierce turtle shells.",
    image: "/assets/images/jaguar.svg",
    audioUrl: "https://actions.google.com/sounds/v1/animals/jaguar_roar.ogg",
    enclosureId: null,
  },
  {
    id: 2,
    num: "02",
    name: "Tucán Pico Iris",
    nameEn: "Keel-billed Toucan",
    scientificName: "Ramphastos sulfuratus",
    category: "Ave",
    status: "Amenazada",
    statusEn: "Threatened",
    habitat: "Selva tropical húmeda, desde el sur de México hasta Colombia",
    habitatEn: "Humid tropical jungle, from Southern Mexico to Colombia",
    diet: "Omnívoro",
    dietEn: "Omnivore",
    lifespan: "15–20 años",
    weight: "400–500 g",
    height: "42–55 cm",
    feedingTime: "09:30 · 15:00",
    zone: "Aviario Tropical",
    description: "Emblemática ave de plumaje vistoso y pico de colores arcoíris. Habita la canopia de las selvas chiapanecas en vuelo libre.",
    funFact: "Su pico grande y colorido representa el 30% de su longitud total.",
    funFactEn: "Its large, colorful beak represents about 30% of its total body length.",
    image: "/assets/images/toucan.svg",
    enclosureId: "vivario",
  },
  {
    id: 3,
    num: "03",
    name: "Tapir Centroamericano",
    nameEn: "Baird's Tapir",
    scientificName: "Tapirus bairdii",
    category: "Mamífero",
    status: "En Peligro de Extinción",
    statusEn: "Endangered",
    habitat: "Bosques tropicales y humedales del sur de México",
    habitatEn: "Tropical forests and wetlands of Southern Mexico",
    diet: "Herbívoro",
    dietEn: "Herbivore",
    lifespan: "25–30 años",
    weight: "150–300 kg",
    height: "1.2 m",
    feedingTime: "10:00 · 16:00",
    zone: "Reserva Herbívoros",
    description: "El mamífero terrestre autóctono más grande del sureste mexicano. Posee una pequeña trompa prensil ideal para alimentarse de brotes frescos.",
    funFact: "Son excelentes nadadores y pueden sumergirse completamente en el agua.",
    funFactEn: "They are excellent swimmers and can fully submerge under water.",
    image: "/assets/images/tapir.svg",
    enclosureId: null,
  },
  {
    id: 4,
    num: "04",
    name: "Mono Araña",
    nameEn: "Geoffroy's Spider Monkey",
    scientificName: "Ateles geoffroyi",
    category: "Mamífero",
    status: "En Peligro de Extinción",
    statusEn: "Endangered",
    habitat: "Selvas tropicales del sureste mexicano",
    habitatEn: "Tropical rainforests of Southeastern Mexico",
    diet: "Frugívoro",
    dietEn: "Frugivore",
    lifespan: "20–25 años",
    weight: "6–9 kg",
    height: "35–63 cm",
    feedingTime: "10:30 · 16:30",
    zone: "Isla de Primates",
    description: "Primate ágil que habita en las copas de los árboles de la selva alta. Su cola prensil le permite desplazarse con rapidez entre ramas.",
    funFact: "Su cola prensil actúa como una quinta mano.",
    funFactEn: "Its prehensile tail functions effectively as a fifth hand.",
    image: "/assets/images/monkey.svg",
    enclosureId: "casa-nocturna",
  },
  {
    id: 5,
    num: "05",
    name: "Guacamaya Roja",
    nameEn: "Scarlet Macaw",
    scientificName: "Ara macao",
    category: "Ave",
    status: "Amenazada",
    statusEn: "Threatened",
    habitat: "Selvas tropicales húmedas de Chiapas",
    habitatEn: "Humid tropical rainforests of Chiapas",
    diet: "Herbívoro",
    dietEn: "Herbivore",
    lifespan: "40–50 años",
    weight: "1 kg",
    height: "85–90 cm",
    feedingTime: "09:00 · 14:30",
    zone: "Aviario Tropical",
    description: "Majestuosa ave psitácida de deslumbrante colorido rojo, azul y amarillo. Forma parte esencial del ecosistema forestal de Lacandona.",
    funFact: "Forman parejas de por vida y pueden vivir hasta 50 años.",
    funFactEn: "They mate for life and can live up to 50 years in protected habitats.",
    image: "/assets/images/macaw.svg",
    enclosureId: "vivario",
  },
  {
    id: 6,
    num: "06",
    name: "Cocodrilo de Pantano",
    nameEn: "Morelet's Crocodile",
    scientificName: "Crocodylus moreletii",
    category: "Reptil",
    status: "Protegida Especial",
    statusEn: "Special Protection",
    habitat: "Ríos, lagos y pantanos de Chiapas y la costa del Golfo",
    habitatEn: "Rivers, lakes, and freshwater swamps of Chiapas",
    diet: "Carnívoro",
    dietEn: "Carnivore",
    lifespan: "50–65 años",
    weight: "50–150 kg",
    height: "1.5–3 m",
    feedingTime: "12:00",
    zone: "Herpetario",
    description: "Reptil semiacuático nativo de cuerpos de agua dulce. Juega un rol clave en el equilibrio biológico de humedales regionales.",
    funFact: "Es el cocodrilo más pequeño de México, alcanzando un máximo de 3 metros.",
    funFactEn: "It is one of Mexico's native crocodile species, growing up to 3 meters in length.",
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

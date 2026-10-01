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
  username?: string;
  name: string;
  email: string;
  role: UserRole;
  enclosureId: string | null; // only set for enclosure_admin
  status: "Activo" | "Inactivo";
}

// ── Enclosures ──────────────────────────────────────────────────────────────

export const DEFAULT_ENCLOSURES: Enclosure[] = [];

// ── Animals ─────────────────────────────────────────────────────────────────

export const INITIAL_ANIMALS: Animal[] = [];

// ── Users ────────────────────────────────────────────────────────────────────

export const INITIAL_USERS: ZooUser[] = [];

// ── Home carousel ────────────────────────────────────────────────────────────

export type SlideItem =
  | { id: string; type: "image"; src: string; alt: string }
  | { id: string; type: "video"; src: string; poster: string; alt: string };

export const INITIAL_SLIDES: SlideItem[] = [];

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

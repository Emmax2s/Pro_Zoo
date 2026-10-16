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
  scientificName: string;
  category: AnimalCategory;
  status: ConservationStatus;
  habitat: string;
  diet: string;
  funFact: string;
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
  enclosureId: string | null; // primary / legacy enclosure
  enclosureIds?: string[];    // up to 3 enclosures (1 to 3 recintos)
  status: "Activo" | "Inactivo";
}

export function getUserEnclosures(user: Partial<ZooUser> | null | undefined): string[] {
  if (!user) return [];
  if (Array.isArray(user.enclosureIds) && user.enclosureIds.length > 0) {
    return user.enclosureIds;
  }
  if (user.enclosureId) {
    return user.enclosureId.split(",").map((s) => s.trim()).filter(Boolean);
  }
  return [];
}

export type AuditActionType = "CREAR" | "ACTUALIZAR" | "ELIMINAR" | "ASIGNAR_RECINTO";

export interface AdminAuditLog {
  id: string | number;
  timestamp: string;
  userId: number;
  userName: string;
  userEmail: string;
  userRole: UserRole;
  assignedEnclosures: string[]; // List of 1 to 3 enclosure names or IDs
  actionType: AuditActionType;
  entityType: "especie" | "recinto" | "administrador" | "sistema";
  entityName: string;
  enclosureName?: string;
  details: string;
}

// ── Enclosures ──────────────────────────────────────────────────────────────

export const DEFAULT_ENCLOSURES: Enclosure[] = [
  { id: "felinos", name: "Felinos", description: "Hábitat de grandes felinos chiapanecos", color: "bg-orange-500", icon: "🐆" },
  { id: "vivario", name: "Vivario", description: "Reptiles y anfibios de la región", color: "bg-emerald-600", icon: "🐍" },
  { id: "aviario", name: "Aviario", description: "Aves tropicales y rapaces", color: "bg-sky-500", icon: "🦜" },
  { id: "nocturnario", name: "Nocturnario", description: "Especies de hábitos nocturnos", color: "bg-indigo-600", icon: "🦇" },
  { id: "herpetario", name: "Herpetario", description: "Colección herpetológica", color: "bg-teal-600", icon: "🦎" },
  { id: "acuario", name: "Acuario", description: "Fauna acuática dulceacuícola", color: "bg-blue-600", icon: "🐟" },
];

// ── Animals ─────────────────────────────────────────────────────────────────

export const INITIAL_ANIMALS: Animal[] = [];

// ── Users ────────────────────────────────────────────────────────────────────

export const INITIAL_USERS: ZooUser[] = [
  {
    id: 1,
    name: "sergiodominguezmijares27",
    email: "sergiodominguezmijares27@gmail.com",
    role: "superadmin",
    enclosureId: null,
    enclosureIds: [],
    status: "Activo",
  },
  {
    id: 2,
    name: "emmaxing51@gmail.com",
    email: "emmaxing51@gmail.com",
    role: "superadmin",
    enclosureId: null,
    enclosureIds: [],
    status: "Activo",
  },
  {
    id: 3,
    name: "Jesús dom5",
    email: "Vader8983@gmail.com",
    role: "enclosure_admin",
    enclosureId: "felinos",
    enclosureIds: ["felinos"],
    status: "Activo",
  },
];

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

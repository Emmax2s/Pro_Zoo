import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
  Animal,
  Enclosure,
  ZooUser,
  SlideItem,
  INITIAL_ANIMALS,
  DEFAULT_ENCLOSURES,
  INITIAL_USERS,
  INITIAL_SLIDES,
} from "../data/zooStore";
import i18n from "../i18n";

interface ZooContextValue {
  // Auth
  currentUser: ZooUser;
  setCurrentUser: (user: ZooUser) => void;
  // Animals
  animals: Animal[];
  setAnimals: (animals: Animal[]) => void;
  // Enclosures
  enclosures: Enclosure[];
  setEnclosures: (enclosures: Enclosure[]) => void;
  // Users
  users: ZooUser[];
  setUsers: (users: ZooUser[]) => void;
  // Home carousel
  slides: SlideItem[];
  setSlides: (slides: SlideItem[]) => void;
  // Language
  currentLang: "es" | "en";
  toggleLanguage: () => void;
  setLanguage: (lang: "es" | "en") => void;
}

const ZooContext = createContext<ZooContextValue | null>(null);

const API_BASE_URL = ((import.meta.env.VITE_API_BASE_URL as string | undefined) || '').replace(/\/$/, '');

const EMPTY_CURRENT_USER: ZooUser = {
  id: 0,
  name: "",
  email: "",
  role: "superadmin",
  enclosureId: null,
  status: "Activo",
};

type ApiSpecies = {
  id: string;
  name: string;
  species?: string;
  habitat?: string;
  diet?: string;
  description?: string;
  imageUrl?: string;
  audioDescriptionUrl?: string;
  conservation?: string;
  category?: Animal["category"];
  enclosureId?: string | null;
};

const mapConservationStatus = (value: string | undefined): Animal["status"] => {
  if (value?.toLowerCase().includes("peligro")) return "En Peligro de Extinción";
  if (value?.toLowerCase().includes("vulnerable") || value?.toLowerCase().includes("amenaz")) return "Amenazada";
  return "Preocupación Menor";
};

const mapSpecies = (species: ApiSpecies): Animal => {
  const cleanAudio =
    species.audioDescriptionUrl && !species.audioDescriptionUrl.includes("example.com")
      ? species.audioDescriptionUrl
      : undefined;

  return {
    id: Number(species.id),
    name: species.name,
    scientificName: species.species || "",
    category: species.category || "Mamífero",
    status: mapConservationStatus(species.conservation),
    habitat: species.habitat || "",
    diet: species.diet || "",
    funFact: species.description || "",
    image: species.imageUrl || "",
    audioUrl: cleanAudio,
    enclosureId: species.enclosureId ?? null,
  };
};

const FALLBACK: ZooContextValue = {
  currentUser: EMPTY_CURRENT_USER,
  setCurrentUser: () => {},
  animals: INITIAL_ANIMALS,
  setAnimals: () => {},
  enclosures: DEFAULT_ENCLOSURES,
  setEnclosures: () => {},
  users: INITIAL_USERS,
  setUsers: () => {},
  slides: INITIAL_SLIDES,
  setSlides: () => {},
  currentLang: "es",
  toggleLanguage: () => {},
  setLanguage: () => {},
};

export function ZooProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<ZooUser>(EMPTY_CURRENT_USER);
  const [animals, setAnimals] = useState<Animal[]>(INITIAL_ANIMALS);
  const [enclosures, setEnclosures] = useState<Enclosure[]>(DEFAULT_ENCLOSURES);
  const [users, setUsers] = useState<ZooUser[]>(INITIAL_USERS);
  const [slides, setSlides] = useState<SlideItem[]>(INITIAL_SLIDES);
  const [currentLang, setCurrentLangState] = useState<"es" | "en">(() => {
    try {
      const saved = localStorage.getItem("zoomat_lang");
      if (saved === "en" || saved === "es") return saved;
      if (typeof navigator !== "undefined" && navigator.language?.toLowerCase().startsWith("en")) {
        return "en";
      }
    } catch {}
    return "es";
  });

  const setLanguage = (lang: "es" | "en") => {
    setCurrentLangState(lang);
    try {
      localStorage.setItem("zoomat_lang", lang);
      document.documentElement.lang = lang;
    } catch {}
    void i18n.changeLanguage(lang);
  };

  const toggleLanguage = () => {
    const next = currentLang === "es" ? "en" : "es";
    setLanguage(next);
  };

  useEffect(() => {
    try {
      document.documentElement.lang = currentLang;
      void i18n.changeLanguage(currentLang);
    } catch {}
  }, [currentLang]);

  useEffect(() => {
    if (!API_BASE_URL) return;

    let active = true;
    fetch(`${API_BASE_URL}/api/species?lang=${currentLang}`, { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`Species request failed with status ${response.status}`);
        }
        return (await response.json()) as ApiSpecies[];
      })
      .then((species) => {
        if (active && Array.isArray(species)) {
          setAnimals(species.map(mapSpecies));
        }
      })
      .catch((error) => {
        console.error("Unable to load species from API:", error);
      });

    return () => {
      active = false;
    };
  }, [currentLang]);

  useEffect(() => {
    if (!API_BASE_URL) return;
    let active = true;
    fetch(`${API_BASE_URL}/api/site-content`, { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error(`Carousel request failed with status ${response.status}`);
        return response.json();
      })
      .then((carousel) => {
        if (active && Array.isArray(carousel)) {
          setSlides(carousel as SlideItem[]);
        }
      })
      .catch((error) => console.error("Unable to load carousel from API:", error));
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!API_BASE_URL) return;
    let active = true;
    fetch(`${API_BASE_URL}/api/enclosures`, { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error(`Enclosures request failed with status ${response.status}`);
        return response.json();
      })
      .then((data) => {
        if (active && Array.isArray(data)) setEnclosures(data as Enclosure[]);
      })
      .catch((error) => console.error("Unable to load enclosures from API:", error));
    return () => {
      active = false;
    };
  }, []);

  return (
    <ZooContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        animals,
        setAnimals,
        enclosures,
        setEnclosures,
        users,
        setUsers,
        slides,
        setSlides,
        currentLang,
        toggleLanguage,
        setLanguage,
      }}
    >
      {children}
    </ZooContext.Provider>
  );
}

export function useZoo() {
  const ctx = useContext(ZooContext);
  if (!ctx) {
    // Don't throw in production; return a safe fallback and warn in console.
    // This prevents the whole app from crashing if a component is rendered outside the provider.
    // Prefer fixing the provider hierarchy, but the fallback improves resilience during development.
    // eslint-disable-next-line no-console
    console.warn("useZoo used outside ZooProvider — returning fallback values.");
    return FALLBACK;
  }
  return ctx;
}

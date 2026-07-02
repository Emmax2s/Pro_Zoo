import { createContext, useContext, useState, ReactNode } from "react";
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
}

const ZooContext = createContext<ZooContextValue | null>(null);

const FALLBACK: ZooContextValue = {
  currentUser: INITIAL_USERS[0],
  setCurrentUser: () => {},
  animals: INITIAL_ANIMALS,
  setAnimals: () => {},
  enclosures: DEFAULT_ENCLOSURES,
  setEnclosures: () => {},
  users: INITIAL_USERS,
  setUsers: () => {},
  slides: INITIAL_SLIDES,
  setSlides: () => {},
};

export function ZooProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<ZooUser>(INITIAL_USERS[0]);
  const [animals, setAnimals] = useState<Animal[]>(INITIAL_ANIMALS);
  const [enclosures, setEnclosures] = useState<Enclosure[]>(DEFAULT_ENCLOSURES);
  const [users, setUsers] = useState<ZooUser[]>(INITIAL_USERS);
  const [slides, setSlides] = useState<SlideItem[]>(INITIAL_SLIDES);

  return (
    <ZooContext.Provider value={{ currentUser, setCurrentUser, animals, setAnimals, enclosures, setEnclosures, users, setUsers, slides, setSlides }}>
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

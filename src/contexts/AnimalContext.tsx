import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { idbGetItem, idbSetItem } from '../utils/persistentStorage';

export type ConservationStatus = 'Vulnerable' | 'En Peligro' | 'No Amenazado';
export type MediaType = 'image' | 'video';

export interface MediaItem {
  url: string;
  type: MediaType;
}

export interface Animal {
  id: string;
  slug?: string;
  name: string;
  species: string;
  habitat: string;
  imageUrl: string;
  imageUrls?: string[];
  mediaUrls?: MediaItem[];
  audioUrl?: string;
  conservation: ConservationStatus;
  description?: string;
  diet?: string;
  lifespan?: string;
  activity?: 'Diurno' | 'Nocturno' | 'Crepuscular';
  size?: string;
  weight?: string;
  threats?: string[];
  importance?: string;
  distribution?: string;
  funFacts?: string[];
}

interface AnimalContextType {
  animals: Animal[];
  addAnimal: (animal: Omit<Animal, 'id'>) => void;
  updateAnimal: (id: string, animal: Partial<Animal>) => void;
  deleteAnimal: (id: string) => void;
}

interface SharedContentPayload {
  animals?: Animal[];
}

const ANIMALS_STORAGE_KEY = 'pro-zoo-animals';
const SHARED_CONTENT_URL = '/site-content.json';
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '') || '';
const ADMIN_API_KEY = (import.meta.env.VITE_ADMIN_API_KEY as string | undefined) || '';

const AnimalContext = createContext<AnimalContextType | undefined>(undefined);

const isValidAnimals = (value: unknown): value is Animal[] => Array.isArray(value) && value.length > 0;

const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const normalizeAnimal = (animal: Animal): Animal => {
  const hasImageInMedia = animal.mediaUrls?.some((media) => media.type === 'image');
  const mediaUrls = hasImageInMedia
    ? animal.mediaUrls
    : animal.imageUrl
      ? [...(animal.mediaUrls || []), { type: 'image', url: animal.imageUrl }]
      : animal.mediaUrls;

  return {
    ...animal,
    slug: animal.slug || slugify(animal.name || animal.species || animal.id),
    mediaUrls,
  };
};

const loadAnimalsFromApi = async (): Promise<Animal[] | null> => {
  if (!API_BASE_URL) {
    return null;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/species?lang=es`, { cache: 'no-store' });
    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as Animal[];
    return isValidAnimals(payload) ? payload.map(normalizeAnimal) : null;
  } catch {
    return null;
  }
};

const loadPublishedAnimals = async (): Promise<Animal[] | null> => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const response = await fetch(SHARED_CONTENT_URL, { cache: 'no-store' });
    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as SharedContentPayload;
    return isValidAnimals(payload.animals) ? payload.animals.map(normalizeAnimal) : null;
  } catch {
    return null;
  }
};

const loadAnimalsFromLocalStorage = () => {
  if (typeof window === 'undefined') {
    return { animals: [] as Animal[], hasLocalOverride: false };
  }

  const savedAnimals = window.localStorage.getItem(ANIMALS_STORAGE_KEY);
  if (!savedAnimals) {
    return { animals: [] as Animal[], hasLocalOverride: false };
  }

  try {
    const parsedAnimals = JSON.parse(savedAnimals) as Animal[];
    return {
      animals: isValidAnimals(parsedAnimals) ? parsedAnimals.map(normalizeAnimal) : [],
      hasLocalOverride: isValidAnimals(parsedAnimals),
    };
  } catch {
    return { animals: [] as Animal[], hasLocalOverride: false };
  }
};

const syncAnimalToApi = async (animal: Animal) => {
  if (!API_BASE_URL || !ADMIN_API_KEY) {
    return;
  }

  await fetch(`${API_BASE_URL}/api/species/${encodeURIComponent(animal.id)}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-key': ADMIN_API_KEY,
    },
    body: JSON.stringify(animal),
  });
};

const removeAnimalFromApi = async (id: string) => {
  if (!API_BASE_URL || !ADMIN_API_KEY) {
    return;
  }

  await fetch(`${API_BASE_URL}/api/species/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: {
      'x-admin-key': ADMIN_API_KEY,
    },
  });
};

export const AnimalProvider = ({ children }: { children: ReactNode }) => {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let active = true;

    const hydrateAnimals = async () => {
      if (typeof window === 'undefined') {
        if (active) {
          setHydrated(true);
        }
        return;
      }

      try {
        const localIdbAnimals = await idbGetItem<Animal[]>(ANIMALS_STORAGE_KEY);
        if (active && isValidAnimals(localIdbAnimals)) {
          setAnimals(localIdbAnimals.map(normalizeAnimal));
          setHydrated(true);
          return;
        }
      } catch {
        // Continue with next sources.
      }

      const localAnimals = loadAnimalsFromLocalStorage();
      let baseAnimals = localAnimals.animals;

      if (!localAnimals.hasLocalOverride) {
        const apiAnimals = await loadAnimalsFromApi();
        if (apiAnimals) {
          baseAnimals = apiAnimals;
        } else {
          const publishedAnimals = await loadPublishedAnimals();
          if (publishedAnimals) {
            baseAnimals = publishedAnimals;
          }
        }
      }

      if (active) {
        setAnimals(baseAnimals);
      }

      try {
        await idbSetItem(ANIMALS_STORAGE_KEY, baseAnimals);
      } catch {
        // Ignore persistence errors.
      }

      if (active) {
        setHydrated(true);
      }
    };

    void hydrateAnimals();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !hydrated) {
      return;
    }

    void idbSetItem(ANIMALS_STORAGE_KEY, animals).catch(() => {
      try {
        window.localStorage.setItem(ANIMALS_STORAGE_KEY, JSON.stringify(animals));
      } catch {
        // Ignore quota errors.
      }
    });
  }, [animals, hydrated]);

  const addAnimal = (animal: Omit<Animal, 'id'>) => {
    const generatedId =
      typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : Date.now().toString();

    const newAnimal = normalizeAnimal({ ...animal, id: generatedId });
    setAnimals((prev) => [...prev, newAnimal]);
    void syncAnimalToApi(newAnimal);
  };

  const updateAnimal = (id: string, updatedData: Partial<Animal>) => {
    setAnimals((prev) => {
      const updatedAnimals = prev.map((animal) =>
        animal.id === id ? normalizeAnimal({ ...animal, ...updatedData, id }) : animal
      );
      const editedAnimal = updatedAnimals.find((animal) => animal.id === id);
      if (editedAnimal) {
        void syncAnimalToApi(editedAnimal);
      }
      return updatedAnimals;
    });
  };

  const deleteAnimal = (id: string) => {
    setAnimals((prev) => prev.filter((animal) => animal.id !== id));
    void removeAnimalFromApi(id);
  };

  return <AnimalContext.Provider value={{ animals, addAnimal, updateAnimal, deleteAnimal }}>{children}</AnimalContext.Provider>;
};

export const useAnimals = () => {
  const context = useContext(AnimalContext);
  if (context === undefined) {
    throw new Error('useAnimals must be used within an AnimalProvider');
  }
  return context;
};

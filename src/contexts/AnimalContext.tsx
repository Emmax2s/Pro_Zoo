import { createContext, useEffect, useState, useContext, ReactNode } from 'react';
import { idbGetItem, idbSetItem } from '../utils/persistentStorage';

export type ConservationStatus = 'Vulnerable' | 'En Peligro' | 'No Amenazado';

export type MediaType = 'image' | 'video';

export interface MediaItem {
  url: string;
  type: MediaType;
}

export interface Animal {
  id: string;
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

const AnimalContext = createContext<AnimalContextType | undefined>(undefined);

const initialAnimals: Animal[] = [
  {
    id: '1',
    name: 'LeÃ³n Africano',
    species: 'Panthera leo',
    habitat: 'Sabana Africana',
    imageUrl: 'https://images.unsplash.com/photo-1680858592943-dd599a244ea8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsaW9uJTIwd2lsZGxpZmV8ZW58MXx8fHwxNzYxNDAxMTY2fDA&ixlib=rb-4.1.0&q=80&w=1080',
    imageUrls: [
      'https://images.unsplash.com/photo-1680858592943-dd599a244ea8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsaW9uJTIwd2lsZGxpZmV8ZW58MXx8fHwxNzYxNDAxMTY2fDA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1516811166-2b6c9f7f3e16?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxNDA4MTN8MHwxfHNlYXJjaHwxfHxsaW9ufGVufDB8fHx8MTYwMzQ5NTM4Nw&ixlib=rb-4.0.3&q=80&w=1080',
      'https://images.unsplash.com/photo-1603325222963-a14741b0f284?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxNDA4MTN8MHwxfHNlYXJjaHwxfHxsaW9uJTIwd2lsZGxpZmV8ZW58MHx8fHx8MTYwMzQ5NTQxOA&ixlib=rb-4.0.3&q=80&w=1080'
    ],
    conservation: 'Vulnerable',
    description: 'El leÃ³n africano es conocido como el "rey de la selva" y es el segundo felino mÃ¡s grande del mundo. Poseen una estructura social Ãºnica entre los felinos, viviendo en manadas que comparten territorio.',
    diet: 'CarnÃ­voro - Ã±us, cebras y bÃºfalos',
    lifespan: '10 a 14 aÃ±os en estado salvaje',
    activity: 'Diurno',
    size: '1.5 a 2 metros de altura a la hombra',
    weight: '150 a 250 kg',
    threats: ['Caza ilegal', 'PÃ©rdida de hÃ¡bitat'],
    importance: 'Son clave para mantener el equilibrio ecolÃ³gico de las sabanas.',
    distribution: 'Sabanas de Ãfrica',
    funFacts: ['Los leones son los Ãºnicos felinos sociales.', 'Pueden correr a velocidades de hasta 80 km/h.'],
  },
  {
    id: '2',
    name: 'Elefante Africano',
    species: 'Loxodonta africana',
    habitat: 'Reserva de Elefantes',
    imageUrl: 'https://images.unsplash.com/photo-1650709244950-ea43a544da6a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVwaGFudCUyMHdpbGRsaWZlfGVufDF8fHx8MTc2MTMyMTYxMHww&ixlib=rb-4.1.0&q=80&w=1080',
    conservation: 'En Peligro',
    description: 'El elefante africano es el mamÃ­fero terrestre mÃ¡s grande del planeta. Son animales muy inteligentes que muestran emociones profundas y tienen una memoria extraordinaria.',
    diet: 'HerbÃ­voro - pastos, hojas y corteza',
    lifespan: 'Hasta 70 aÃ±os',
    activity: 'Diurno',
    size: '2.5 a 3 metros de altura a la hombra',
    weight: '3,000 a 7,000 kg',
    threats: ['Caza ilegal', 'PÃ©rdida de hÃ¡bitat'],
    importance: 'Son clave para mantener la biodiversidad de los bosques y sabanas.',
    distribution: 'Ãfrica Subsahariana',
    funFacts: ['Pueden recordar a otros elefantes durante dÃ©cadas.', 'Tienen una piel gruesa y rugosa para protegerse del sol.'],
  },
  {
    id: '3',
    name: 'Jirafa',
    species: 'Giraffa camelopardalis',
    habitat: 'Pradera Africana',
    imageUrl: 'https://images.unsplash.com/photo-1657298446502-30a2a27d413e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnaXJhZmZlJTIwd2lsZGxpZmV8ZW58MXx8fHwxNzYxNDE2NTM1fDA&ixlib=rb-4.1.0&q=80&w=1080',
    conservation: 'Vulnerable',
    description: 'La jirafa es el mamÃ­fero mÃ¡s alto del mundo, alcanzando hasta 5.5 metros de altura. Su largo cuello les permite alimentarse de hojas de Ã¡rboles altos, fuera del alcance de otros herbÃ­voros.',
    diet: 'HerbÃ­voro - hojas de acacia',
    lifespan: '20 a 25 aÃ±os',
    activity: 'Diurno',
    size: '4.5 a 5.5 metros de altura',
    weight: '1,100 a 1,600 kg',
    threats: ['Caza ilegal', 'PÃ©rdida de hÃ¡bitat'],
    importance: 'Son importantes para la dispersiÃ³n de semillas y el mantenimiento de los ecosistemas.',
    distribution: 'Ãfrica Subsahariana',
    funFacts: ['Tienen un corazÃ³n de 11 kg para bombear sangre a su cabeza.', 'Pueden dormir solo 20 minutos al dÃ­a.'],
  },
  {
    id: '4',
    name: 'Panda Gigante',
    species: 'Ailuropoda melanoleuca',
    habitat: 'Bosque de BambÃº',
    imageUrl: 'https://images.unsplash.com/photo-1703248187251-c897f32fe4ec?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYW5kYSUyMGJlYXJ8ZW58MXx8fHwxNzYxNDA4MzE2fDA&ixlib=rb-4.1.0&q=80&w=1080',
    conservation: 'Vulnerable',
    description: 'Originarios de China, los pandas gigantes son un sÃ­mbolo mundial de la conservaciÃ³n de la vida silvestre. Dedican entre 10 y 16 horas al dÃ­a a buscar alimento y a comer.',
    diet: 'HerbÃ­voro (99% BambÃº)',
    lifespan: '20 aÃ±os en estado salvaje',
    activity: 'Diurno',
    size: '1.2 a 1.5 metros de altura',
    weight: '80 a 150 kg',
    threats: ['Caza ilegal', 'PÃ©rdida de hÃ¡bitat'],
    importance: 'Son importantes para la conservaciÃ³n de los bosques de bambÃº.',
    distribution: 'China',
    funFacts: ['Tienen una lengua especializada para rasgar bambÃº.', 'Pueden dormir hasta 16 horas al dÃ­a.'],
  },
  {
    id: '5',
    name: 'Tigre de Bengala',
    species: 'Panthera tigris',
    habitat: 'Selva AsiÃ¡tica',
    imageUrl: 'https://images.unsplash.com/photo-1727036752580-957404758267?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0aWdlciUyMHdpbGRsaWZlfGVufDF8fHx8MTc2MTM5NTk3N3ww&ixlib=rb-4.1.0&q=80&w=1080',
    conservation: 'En Peligro',
    description: 'El tigre de Bengala es un depredador solitario y nocturno con un pelaje inconfundible, cuyas rayas funcionan como camuflaje perfecto en la selva. Son grandes nadadores.',
    diet: 'CarnÃ­voro - jabalÃ­es, ciervos',
    lifespan: '8 a 10 aÃ±os en estado salvaje',
    activity: 'Nocturno',
    size: '2.5 a 3 metros de longitud',
    weight: '100 a 220 kg',
    threats: ['Caza ilegal', 'PÃ©rdida de hÃ¡bitat'],
    importance: 'Son clave para mantener el equilibrio ecolÃ³gico de las selvas.',
    distribution: 'Asia',
    funFacts: ['Tienen una fuerza increÃ­ble para arrastrar presas pesadas.', 'Pueden nadar hasta 6 kilÃ³metros a la vez.'],
  },
  {
    id: '6',
    name: 'PingÃ¼ino',
    species: 'Spheniscus demersus',
    habitat: 'Acuario AntÃ¡rtico',
    imageUrl: 'https://images.unsplash.com/photo-1638704957265-0817f29d9b6b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZW5ndWluJTIwd2lsZGxpZmV8ZW58MXx8fHwxNzYxNDE2NTM2fDA&ixlib=rb-4.1.0&q=80&w=1080',
    conservation: 'En Peligro',
    description: 'Aunque no pueden volar, los pingÃ¼inos son excepcionales nadadores, utilizando sus alas como aletas. Son conocidos por sus habilidades de buceo y estructura social.',
    diet: 'CarnÃ­voro - peces, krill y calamares',
    lifespan: '15 a 20 aÃ±os',
    activity: 'Diurno',
    size: '70 a 75 centÃ­metros de altura',
    weight: '4 a 5 kg',
    threats: ['Caza ilegal', 'Cambio climÃ¡tico'],
    importance: 'Son importantes para el equilibrio ecolÃ³gico de los ecosistemas marinos.',
    distribution: 'AntÃ¡rtica y regiones cercanas',
    funFacts: ['Pueden bucear hasta 150 metros de profundidad.', 'Tienen una capa de grasa para mantenerse cÃ¡lidos en el agua frÃ­a.'],
  },
  {
    id: '7',
    name: 'Mono Capuchino',
    species: 'Cebus capucinus',
    habitat: 'Selva Tropical',
    imageUrl: 'https://images.unsplash.com/photo-1613213541901-3f1408daf859?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb25rZXklMjB3aWxkbGlmZXxlbnwxfHx8fDE3NjEzMDYyMTl8MA&ixlib=rb-4.1.0&q=80&w=1080',
    conservation: 'No Amenazado',
  },
  {
    id: '9',
    name: 'Jaguar',
    species: 'Panthera onca',
    habitat: 'Bosques y selvas tropicales',
    imageUrl: 'https://images.unsplash.com/photo-1572018676888-90d4c8f7630d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxNjA5NjZ8MHwxfHNlYXJjaHwxfHxqYWd1YXJ8ZW58MHx8fHwxNjg0NjYzNTk5&ixlib=rb-4.0.3&q=80&w=1080',
    imageUrls: [
      'https://images.unsplash.com/photo-1572018676888-90d4c8f7630d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxNjA5NjZ8MHwxfHNlYXJjaHwxfHxqYWd1YXJ8ZW58MHx8fHwxNjg0NjYzNTk5&ixlib=rb-4.0.3&q=80&w=1080',
      'https://images.unsplash.com/photo-1526481280690-7cb04dcaa319?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxNjA5NjZ8MHwxfHNlYXJjaHwxfHxtYWx0aWNhfGVufDB8fHx8MTY4NDY2MzY0NQ&ixlib=rb-4.0.3&q=80&w=1080',
      'https://images.unsplash.com/photo-1544725176-7c40e5a7270c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxNjA5NjZ8MHwxfHNlYXJjaHwxfHxqYWd1YXJ8ZW58MHx8fHwxNjg0NjYzNjky&ixlib=rb-4.0.3&q=80&w=1080'
    ],
    conservation: 'Vulnerable',
    description: 'El jaguar es un felino emblemÃ¡tico de AmÃ©rica, poderoso y elegante, que vive en selvas tropicales y bosques densos.',
    diet: 'CarnÃ­voro - venados, pecarÃ­es, caimanes',
    lifespan: '12 a 15 aÃ±os en estado salvaje',
    activity: 'Nocturno',
    size: '1.1 a 1.8 metros de longitud corporal',
    weight: '45 a 100 kg',
    threats: ['PÃ©rdida de hÃ¡bitat', 'Caza ilegal'],
    importance: 'Clave para el equilibrio de los ecosistemas de la AmazonÃ­a y Gran Chaco.',
    distribution: 'AmÃ©rica Central y del Sur',
    funFacts: ['Su mordida es la mÃ¡s fuerte entre los felinos.', 'Puede nadar muy bien y cazar peces.'],
  },
  {
    id: '8',
    name: 'Cebra de Grevy',
    species: 'Equus grevyi',
    habitat: 'Sabana Africana',
    imageUrl: 'https://images.unsplash.com/photo-1638910939569-7f88cf71ebbc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx6ZWJyYSUyMHdpbGRsaWZlfGVufDF8fHx8MTc2MTQxNjUzN3ww&ixlib=rb-4.1.0&q=80&w=1080',
    conservation: 'En Peligro',
    description: 'Estos pequeÃ±os primates son altamente inteligentes y muy activos. Son famosos por su habilidad para utilizar herramientas rudimentarias para abrir frutos o nueces.',
    diet: 'OmnÃ­voro - frutas, insectos y hojas',
    lifespan: '15 a 25 aÃ±os en estado salvaje',
    activity: 'Diurno',
    size: '40 a 50 centÃ­metros de longitud',
    weight: '2 a 3 kg',
    threats: ['Caza ilegal', 'PÃ©rdida de hÃ¡bitat'],
    importance: 'Son importantes para la dispersiÃ³n de semillas y el mantenimiento de los ecosistemas.',
    distribution: 'AmÃ©rica Central y del Sur',
    funFacts: ['Pueden usar herramientas para abrir frutos duros.', 'Tienen una gran capacidad para aprender y adaptarse.'],
  },
  {
    id: '8',
    name: 'Cebra de Grevy',
    species: 'Equus grevyi',
    habitat: 'Sabana Africana',
    imageUrl: 'https://images.unsplash.com/photo-1638910939569-7f88cf71ebbc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx6ZWJyYSUyMHdpbGRsaWZlfGVufDF8fHx8MTc2MTQxNjUzN3ww&ixlib=rb-4.1.0&q=80&w=1080',
    conservation: 'En Peligro',
    description: 'La cebra de GrÃ©vy es la mÃ¡s grande de todas las especies de cebras. Se distinguen por tener un patrÃ³n de rayas mÃ¡s finas y orejas grandes y redondeadas parecidas a las de los burros.',
    diet: 'HerbÃ­voro - pastos secos y duros',
    lifespan: '12 a 20 aÃ±os',
    activity: 'Diurno',
    size: '2.5 a 3 metros de altura a la hombra',
    weight: '350 a 450 kg',
    threats: ['Caza ilegal', 'PÃ©rdida de hÃ¡bitat'],
    importance: 'Son importantes para la biodiversidad de las sabanas.',
    distribution: 'Ãfrica Oriental',
    funFacts: ['Tienen una gran capacidad para encontrar agua en tierras secas.', 'Pueden correr a velocidades de hasta 70 km/h.'],
  },
];

const ANIMALS_STORAGE_KEY = 'pro-zoo-animals';

const isValidAnimals = (value: unknown): value is Animal[] => {
  return Array.isArray(value) && value.length > 0;
};

const loadAnimals = (): Animal[] => {
  if (typeof window === 'undefined') {
    return initialAnimals;
  }

  const savedAnimals = window.localStorage.getItem(ANIMALS_STORAGE_KEY);
  if (!savedAnimals) {
    return initialAnimals;
  }

  try {
    const parsedAnimals = JSON.parse(savedAnimals) as Animal[];
    return Array.isArray(parsedAnimals) && parsedAnimals.length > 0 ? parsedAnimals : initialAnimals;
  } catch {
    return initialAnimals;
  }
};

export const AnimalProvider = ({ children }: { children: ReactNode }) => {
  const [animals, setAnimals] = useState<Animal[]>(initialAnimals);
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
        const savedInDb = await idbGetItem<Animal[]>(ANIMALS_STORAGE_KEY);
        if (active && isValidAnimals(savedInDb)) {
          setAnimals(savedInDb);
          setHydrated(true);
          return;
        }
      } catch {
        // Fallback below to legacy localStorage
      }

      const localAnimals = loadAnimals();
      if (active) {
        setAnimals(localAnimals);
      }

      try {
        await idbSetItem(ANIMALS_STORAGE_KEY, localAnimals);
      } catch {
        // Ignore: app can still run with in-memory state
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
        // Prevent quota errors from crashing the app
      }
    });
  }, [animals, hydrated]);

  const addAnimal = (animal: Omit<Animal, 'id'>) => {
    const newAnimal = { ...animal, id: Date.now().toString() };
    setAnimals(prev => [...prev, newAnimal]);
  };

  const updateAnimal = (id: string, updatedData: Partial<Animal>) => {
    setAnimals(prev => prev.map(a => a.id === id ? { ...a, ...updatedData } : a));
  };

  const deleteAnimal = (id: string) => {
    setAnimals(prev => prev.filter(a => a.id !== id));
  };

  return (
    <AnimalContext.Provider value={{ animals, addAnimal, updateAnimal, deleteAnimal }}>
      {children}
    </AnimalContext.Provider>
  );
};

export const useAnimals = () => {
  const context = useContext(AnimalContext);
  if (context === undefined) {
    throw new Error('useAnimals must be used within an AnimalProvider');
  }
  return context;
};

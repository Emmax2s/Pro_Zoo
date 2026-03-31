import { createContext, useEffect, useState, useContext, ReactNode } from 'react';

export type ConservationStatus = 'Vulnerable' | 'En Peligro' | 'No Amenazado';

export interface Animal {
  id: string;
  name: string;
  species: string;
  habitat: string;
  imageUrl: string;
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
    name: 'León Africano',
    species: 'Panthera leo',
    habitat: 'Sabana Africana',
    imageUrl: 'https://images.unsplash.com/photo-1680858592943-dd599a244ea8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsaW9uJTIwd2lsZGxpZmV8ZW58MXx8fHwxNzYxNDAxMTY2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    conservation: 'Vulnerable',
    description: 'El león africano es conocido como el "rey de la selva" y es el segundo felino más grande del mundo. Poseen una estructura social única entre los felinos, viviendo en manadas que comparten territorio.',
    diet: 'Carnívoro - ñus, cebras y búfalos',
    lifespan: '10 a 14 años en estado salvaje',
    activity: 'Diurno',
    size: '1.5 a 2 metros de altura a la hombra',
    weight: '150 a 250 kg',
    threats: ['Caza ilegal', 'Pérdida de hábitat'],
    importance: 'Son clave para mantener el equilibrio ecológico de las sabanas.',
    distribution: 'Sabanas de África',
    funFacts: ['Los leones son los únicos felinos sociales.', 'Pueden correr a velocidades de hasta 80 km/h.'],
  },
  {
    id: '2',
    name: 'Elefante Africano',
    species: 'Loxodonta africana',
    habitat: 'Reserva de Elefantes',
    imageUrl: 'https://images.unsplash.com/photo-1650709244950-ea43a544da6a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVwaGFudCUyMHdpbGRsaWZlfGVufDF8fHx8MTc2MTMyMTYxMHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    conservation: 'En Peligro',
    description: 'El elefante africano es el mamífero terrestre más grande del planeta. Son animales muy inteligentes que muestran emociones profundas y tienen una memoria extraordinaria.',
    diet: 'Herbívoro - pastos, hojas y corteza',
    lifespan: 'Hasta 70 años',
    activity: 'Diurno',
    size: '2.5 a 3 metros de altura a la hombra',
    weight: '3,000 a 7,000 kg',
    threats: ['Caza ilegal', 'Pérdida de hábitat'],
    importance: 'Son clave para mantener la biodiversidad de los bosques y sabanas.',
    distribution: 'África Subsahariana',
    funFacts: ['Pueden recordar a otros elefantes durante décadas.', 'Tienen una piel gruesa y rugosa para protegerse del sol.'],
  },
  {
    id: '3',
    name: 'Jirafa',
    species: 'Giraffa camelopardalis',
    habitat: 'Pradera Africana',
    imageUrl: 'https://images.unsplash.com/photo-1657298446502-30a2a27d413e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnaXJhZmZlJTIwd2lsZGxpZmV8ZW58MXx8fHwxNzYxNDE2NTM1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    conservation: 'Vulnerable',
    description: 'La jirafa es el mamífero más alto del mundo, alcanzando hasta 5.5 metros de altura. Su largo cuello les permite alimentarse de hojas de árboles altos, fuera del alcance de otros herbívoros.',
    diet: 'Herbívoro - hojas de acacia',
    lifespan: '20 a 25 años',
    activity: 'Diurno',
    size: '4.5 a 5.5 metros de altura',
    weight: '1,100 a 1,600 kg',
    threats: ['Caza ilegal', 'Pérdida de hábitat'],
    importance: 'Son importantes para la dispersión de semillas y el mantenimiento de los ecosistemas.',
    distribution: 'África Subsahariana',
    funFacts: ['Tienen un corazón de 11 kg para bombear sangre a su cabeza.', 'Pueden dormir solo 20 minutos al día.'],
  },
  {
    id: '4',
    name: 'Panda Gigante',
    species: 'Ailuropoda melanoleuca',
    habitat: 'Bosque de Bambú',
    imageUrl: 'https://images.unsplash.com/photo-1703248187251-c897f32fe4ec?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYW5kYSUyMGJlYXJ8ZW58MXx8fHwxNzYxNDA4MzE2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    conservation: 'Vulnerable',
    description: 'Originarios de China, los pandas gigantes son un símbolo mundial de la conservación de la vida silvestre. Dedican entre 10 y 16 horas al día a buscar alimento y a comer.',
    diet: 'Herbívoro (99% Bambú)',
    lifespan: '20 años en estado salvaje',
    activity: 'Diurno',
    size: '1.2 a 1.5 metros de altura',
    weight: '80 a 150 kg',
    threats: ['Caza ilegal', 'Pérdida de hábitat'],
    importance: 'Son importantes para la conservación de los bosques de bambú.',
    distribution: 'China',
    funFacts: ['Tienen una lengua especializada para rasgar bambú.', 'Pueden dormir hasta 16 horas al día.'],
  },
  {
    id: '5',
    name: 'Tigre de Bengala',
    species: 'Panthera tigris',
    habitat: 'Selva Asiática',
    imageUrl: 'https://images.unsplash.com/photo-1727036752580-957404758267?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0aWdlciUyMHdpbGRsaWZlfGVufDF8fHx8MTc2MTM5NTk3N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    conservation: 'En Peligro',
    description: 'El tigre de Bengala es un depredador solitario y nocturno con un pelaje inconfundible, cuyas rayas funcionan como camuflaje perfecto en la selva. Son grandes nadadores.',
    diet: 'Carnívoro - jabalíes, ciervos',
    lifespan: '8 a 10 años en estado salvaje',
    activity: 'Nocturno',
    size: '2.5 a 3 metros de longitud',
    weight: '100 a 220 kg',
    threats: ['Caza ilegal', 'Pérdida de hábitat'],
    importance: 'Son clave para mantener el equilibrio ecológico de las selvas.',
    distribution: 'Asia',
    funFacts: ['Tienen una fuerza increíble para arrastrar presas pesadas.', 'Pueden nadar hasta 6 kilómetros a la vez.'],
  },
  {
    id: '6',
    name: 'Pingüino',
    species: 'Spheniscus demersus',
    habitat: 'Acuario Antártico',
    imageUrl: 'https://images.unsplash.com/photo-1638704957265-0817f29d9b6b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZW5ndWluJTIwd2lsZGxpZmV8ZW58MXx8fHwxNzYxNDE2NTM2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    conservation: 'En Peligro',
    description: 'Aunque no pueden volar, los pingüinos son excepcionales nadadores, utilizando sus alas como aletas. Son conocidos por sus habilidades de buceo y estructura social.',
    diet: 'Carnívoro - peces, krill y calamares',
    lifespan: '15 a 20 años',
    activity: 'Diurno',
    size: '70 a 75 centímetros de altura',
    weight: '4 a 5 kg',
    threats: ['Caza ilegal', 'Cambio climático'],
    importance: 'Son importantes para el equilibrio ecológico de los ecosistemas marinos.',
    distribution: 'Antártica y regiones cercanas',
    funFacts: ['Pueden bucear hasta 150 metros de profundidad.', 'Tienen una capa de grasa para mantenerse cálidos en el agua fría.'],
  },
  {
    id: '7',
    name: 'Mono Capuchino',
    species: 'Cebus capucinus',
    habitat: 'Selva Tropical',
    imageUrl: 'https://images.unsplash.com/photo-1613213541901-3f1408daf859?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb25rZXklMjB3aWxkbGlmZXxlbnwxfHx8fDE3NjEzMDYyMTl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    conservation: 'No Amenazado',
    description: 'Estos pequeños primates son altamente inteligentes y muy activos. Son famosos por su habilidad para utilizar herramientas rudimentarias para abrir frutos o nueces.',
    diet: 'Omnívoro - frutas, insectos y hojas',
    lifespan: '15 a 25 años en estado salvaje',
    activity: 'Diurno',
    size: '40 a 50 centímetros de longitud',
    weight: '2 a 3 kg',
    threats: ['Caza ilegal', 'Pérdida de hábitat'],
    importance: 'Son importantes para la dispersión de semillas y el mantenimiento de los ecosistemas.',
    distribution: 'América Central y del Sur',
    funFacts: ['Pueden usar herramientas para abrir frutos duros.', 'Tienen una gran capacidad para aprender y adaptarse.'],
  },
  {
    id: '8',
    name: 'Cebra de Grevy',
    species: 'Equus grevyi',
    habitat: 'Sabana Africana',
    imageUrl: 'https://images.unsplash.com/photo-1638910939569-7f88cf71ebbc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx6ZWJyYSUyMHdpbGRsaWZlfGVufDF8fHx8MTc2MTQxNjUzN3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    conservation: 'En Peligro',
    description: 'La cebra de Grévy es la más grande de todas las especies de cebras. Se distinguen por tener un patrón de rayas más finas y orejas grandes y redondeadas parecidas a las de los burros.',
    diet: 'Herbívoro - pastos secos y duros',
    lifespan: '12 a 20 años',
    activity: 'Diurno',
    size: '2.5 a 3 metros de altura a la hombra',
    weight: '350 a 450 kg',
    threats: ['Caza ilegal', 'Pérdida de hábitat'],
    importance: 'Son importantes para la biodiversidad de las sabanas.',
    distribution: 'África Oriental',
    funFacts: ['Tienen una gran capacidad para encontrar agua en tierras secas.', 'Pueden correr a velocidades de hasta 70 km/h.'],
  },
];

const ANIMALS_STORAGE_KEY = 'pro-zoo-animals';

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
  const [animals, setAnimals] = useState<Animal[]>(loadAnimals);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(ANIMALS_STORAGE_KEY, JSON.stringify(animals));
    }
  }, [animals]);

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
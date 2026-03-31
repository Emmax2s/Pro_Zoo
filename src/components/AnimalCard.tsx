import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { useState } from 'react';
import { AnimalInfoPanel } from './AnimalInfoPanel';
import { Animal } from '../contexts/AnimalContext';

interface AnimalCardProps extends Animal {}

export function AnimalCard(animal: AnimalCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  const getConservationColor = (status: string) => {
    switch (status) {
      case 'En Peligro':
        return 'bg-red-500';
      case 'Vulnerable':
        return 'bg-orange-500';
      default:
        return 'bg-green-500';
    }
  };

  return (
    <>
      <Card 
        className="overflow-hidden hover:shadow-xl transition-shadow duration-300 group cursor-pointer"
        onClick={() => setIsOpen(true)}
      >
        <div className="relative overflow-hidden h-64">
          <img
            src={animal.imageUrl}
            alt={animal.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute top-4 right-4">
            <Badge className={`${getConservationColor(animal.conservation)} text-white`}>
              {animal.conservation}
            </Badge>
          </div>
        </div>
        <CardContent className="p-6">
          <h3 className="text-green-800 mb-2">{animal.name}</h3>
          <p className="text-gray-600 text-sm mb-1">{animal.species}</p>
          <p className="text-gray-500 text-sm">📍 {animal.habitat}</p>
        </CardContent>
      </Card>

      {isOpen && (
        <AnimalInfoPanel animal={animal} onClose={() => setIsOpen(false)} />
      )}
    </>
  );
}
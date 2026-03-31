import { AnimalCard } from './AnimalCard';
import { useAnimals } from '../contexts/AnimalContext';

export function AnimalsSection() {
  const { animals } = useAnimals();

  return (
    <section id="animales" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-green-800 mb-4">Nuestros Animales</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Conoce a algunos de los increíbles animales que llaman hogar a nuestro zoológico
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {animals.map((animal) => (
            <AnimalCard key={animal.id} {...animal} />
          ))}
        </div>
      </div>
    </section>
  );
}

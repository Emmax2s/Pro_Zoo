import { AnimalCard } from './AnimalCard';
import { useAnimals } from '../contexts/AnimalContext';
import { useLanguage } from '../contexts/LanguageContext';

export function AnimalsSection() {
  const { animals } = useAnimals();
  const { t } = useLanguage();

  return (
    <section id="animales" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-8 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-emerald-900 mb-4">{t.animalsSection.title}</h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            {t.animalsSection.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {animals.map((animal) => (
            <div key={animal.id} className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg hover:translate-y-[-10px] transition-all duration-300">
              <AnimalCard {...animal} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

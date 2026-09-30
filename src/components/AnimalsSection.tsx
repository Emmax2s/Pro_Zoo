import { AnimalCard } from './AnimalCard';
import { useAnimals } from '../contexts/AnimalContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Sparkles } from 'lucide-react';

export function AnimalsSection() {
  const { animals } = useAnimals();
  const { t, language } = useLanguage();

  return (
    <section id="animales" className="py-20 bg-gradient-to-b from-stone-50 via-emerald-50/30 to-stone-50 border-y border-stone-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/80 text-emerald-800 text-xs font-bold uppercase tracking-widest mb-3">
            <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
            <span>{language === 'en' ? 'Biodiversity & Wildlife' : 'Biodiversidad del ZooMAT'}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-emerald-950 mb-4 tracking-tight">
            {t.animalsSection.title}
          </h2>
          <p className="text-stone-600 max-w-2xl mx-auto text-base leading-relaxed">
            {t.animalsSection.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {animals.map((animal) => (
            <div
              key={animal.id}
              className="transform transition-all duration-300 hover:-translate-y-1"
            >
              <AnimalCard {...animal} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Button } from '../components/ui/button';
import { AnimalInfoPanel } from '../components/AnimalInfoPanel';
import { useAnimals } from '../contexts/AnimalContext';
import { useLanguage } from '../contexts/LanguageContext';

export default function Species() {
  const navigate = useNavigate();
  const { animalId } = useParams<{ animalId: string }>();
  const { animals } = useAnimals();
  const { t } = useLanguage();

  const animal = useMemo(() => {
    if (!animalId) {
      return null;
    }

    return animals.find((item) => item.id === animalId || item.slug === animalId) || null;
  }, [animalId, animals]);

  if (!animal) {
    return (
      <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center gap-4 px-6 text-center">
        <h1 className="text-3xl font-bold text-green-800">{t.notFound.title}</h1>
        <p className="text-gray-600">{t.notFound.message}</p>
        <Button onClick={() => navigate('/animales')}>{t.notFound.goHome}</Button>
      </main>
    );
  }

  return <AnimalInfoPanel animal={animal} onClose={() => navigate('/animales')} />;
}

import { Button } from './ui/button';
import { Calendar, Clock } from 'lucide-react';
import { useSite } from '../contexts/SiteContext';
import { useLanguage } from '../contexts/LanguageContext';

export function Hero() {
  const { siteData } = useSite();
  const { translateContent } = useLanguage();
  const { hero } = siteData;

  const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      id="inicio"
      className="relative flex min-h-[100svh] items-center justify-center overflow-hidden bg-green-900"
    >
      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center px-4 py-24 text-center text-white sm:px-6 md:py-28 lg:py-32">
        <div className="max-w-4xl rounded-3xl border border-white/10 bg-black/20 px-5 py-8 backdrop-blur-sm sm:px-8 sm:py-10">
          <h1 className="mb-4 text-3xl font-semibold leading-tight sm:text-4xl md:mb-6 md:text-6xl lg:text-7xl">{translateContent(hero.title)}</h1>
          <p className="mx-auto mb-8 max-w-3xl text-base leading-relaxed text-white/90 sm:text-lg md:text-2xl">
            {translateContent(hero.subtitle)}
          </p>
          <div className="flex flex-col justify-center gap-3 sm:flex-row sm:gap-4">
          <Button
            size="lg"
            className="bg-green-600 text-base sm:text-lg hover:bg-green-700"
            onClick={() => scrollToSection('animales')}
          >
            <Calendar className="mr-2 h-5 w-5" />
            {translateContent(hero.button1Text)}
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-white bg-white/10 text-base text-white backdrop-blur-sm hover:bg-white/20 sm:text-lg"
            onClick={() => scrollToSection('info')}
          >
            <Clock className="mr-2 h-5 w-5" />
            {translateContent(hero.button2Text)}
          </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

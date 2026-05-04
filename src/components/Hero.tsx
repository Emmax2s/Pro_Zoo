import { Button } from './ui/button';
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
      className="relative flex h-[70vh] items-center justify-center overflow-hidden bg-gradient-to-r from-emerald-900 to-emerald-800"
    >
      <div className="absolute inset-0 bg-cover bg-center opacity-20" style={{backgroundImage: 'url(https://via.placeholder.com/1920x1080)'}} />
      <div className="relative z-10 mx-auto flex w-full flex-col items-center px-4 text-center text-white">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-4">{translateContent(hero.title)}</h1>
        <p className="mx-auto mb-8 max-w-2xl text-base sm:text-lg leading-relaxed text-white/90">
          {translateContent(hero.subtitle)}
        </p>
        <Button
          size="lg"
          className="bg-emerald-600 text-white font-bold hover:bg-emerald-700 px-8 py-3 rounded-full"
          onClick={() => scrollToSection('animales')}
        >
          {translateContent(hero.button1Text)}
        </Button>
      </div>
    </section>
  );
}

import { useEffect, useMemo, useState } from 'react';
import { Button } from './ui/button';
import { Calendar, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { useSite } from '../contexts/SiteContext';
import { useLanguage } from '../contexts/LanguageContext';

export function Hero() {
  const { siteData } = useSite();
  const { t, translateContent } = useLanguage();
  const { hero } = siteData;
  const mediaItems = useMemo(
    () => hero.backgroundMedia.filter((item) => item.url.trim() !== ''),
    [hero.backgroundMedia]
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const hasMultipleItems = mediaItems.length > 1;

  useEffect(() => {
    setCurrentIndex(0);
  }, [mediaItems]);

  useEffect(() => {
    if (!hasMultipleItems) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % mediaItems.length);
    }, 4000);

    return () => window.clearInterval(intervalId);
  }, [hasMultipleItems, mediaItems.length]);

  const goToPrevious = () => {
    if (!hasMultipleItems) {
      return;
    }
    setCurrentIndex((prev) => (prev - 1 + mediaItems.length) % mediaItems.length);
  };

  const goToNext = () => {
    if (!hasMultipleItems) {
      return;
    }
    setCurrentIndex((prev) => (prev + 1) % mediaItems.length);
  };

  const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      id="inicio"
      className="relative flex min-h-[100svh] items-center justify-center overflow-hidden bg-gray-900"
    >
      <div className="absolute inset-0 overflow-hidden">
        {mediaItems.map((item, index) => (
          <div
            key={`${item.url}-${index}`}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentIndex ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {item.type === 'video' ? (
              <video
                src={item.url}
                className="h-full w-full object-cover object-center"
                autoPlay={index === currentIndex}
                muted
                loop
                playsInline
                preload="metadata"
              />
            ) : (
              <img
                src={item.url}
                alt={`${t.hero.zooViewAlt} ${index + 1}`}
                className="h-full w-full object-cover object-center"
              />
            )}
          </div>
        ))}
        <div className="absolute inset-0 bg-black/45"></div>
      </div>

      {hasMultipleItems && (
        <>
          <button
            type="button"
            onClick={goToPrevious}
            aria-label={t.hero.previousItemAria}
            className="absolute left-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/35 p-2 text-white backdrop-blur-sm transition hover:bg-black/55 md:left-6"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            type="button"
            onClick={goToNext}
            aria-label={t.hero.nextItemAria}
            className="absolute right-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/35 p-2 text-white backdrop-blur-sm transition hover:bg-black/55 md:right-6"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}

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

      {hasMultipleItems && (
        <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-2 sm:bottom-6">
          {mediaItems.map((_, index) => (
            <button
              key={`indicator-${index}`}
              type="button"
              onClick={() => setCurrentIndex(index)}
              aria-label={`${t.hero.goToItemAria} ${index + 1}`}
              className={`h-2.5 w-2.5 rounded-full border border-white/80 transition-all ${
                index === currentIndex
                  ? 'scale-110 bg-white'
                  : 'bg-white/40 hover:bg-white/70'
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}

import { Button } from './ui/button';
import { Calendar, Clock } from 'lucide-react';
import { useSite } from '../contexts/SiteContext';

export function Hero() {
  const { siteData } = useSite();
  const { hero } = siteData;

  return (
    <section id="inicio" className="relative h-screen flex items-center justify-center">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img
          src={hero.backgroundImageUrl}
          alt="Zoo entrance"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
        <h1 className="text-5xl md:text-7xl mb-6">
          {hero.title}
        </h1>
        <p className="text-xl md:text-2xl mb-8">
          {hero.subtitle}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" className="bg-green-600 hover:bg-green-700 text-lg">
            <Calendar className="mr-2 h-5 w-5" />
            {hero.button1Text}
          </Button>
          <Button size="lg" variant="outline" className="bg-white/10 backdrop-blur-sm text-white border-white hover:bg-white/20 text-lg">
            <Clock className="mr-2 h-5 w-5" />
            {hero.button2Text}
          </Button>
        </div>
      </div>
    </section>
  );
}

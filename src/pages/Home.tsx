import { useEffect } from 'react';
import { useLocation } from 'react-router';
import { Navbar } from '../components/Navbar';
import { Hero } from '../components/Hero';
import { InterestSection } from '../components/InterestSection';
import { AnimalsSection } from '../components/AnimalsSection';
import { InfoSection } from '../components/InfoSection';
import { Footer } from '../components/Footer';

export default function Home() {
  const { pathname } = useLocation();

  useEffect(() => {
    const pathSegment = pathname.split('/').filter(Boolean)[0];
    const sectionId = pathSegment || 'inicio';

    window.requestAnimationFrame(() => {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }, [pathname]);

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      <Navbar />
      <Hero />
      <AnimalsSection />
      <InterestSection />
      <InfoSection />
      <Footer />
    </div>
  );
}
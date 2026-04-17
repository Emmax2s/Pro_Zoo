import { useEffect } from 'react';
import { useLocation } from 'react-router';
import { Navbar } from '../components/Navbar';
import { Hero } from '../components/Hero';
import { AnimalsSection } from '../components/AnimalsSection';
import { InfoSection } from '../components/InfoSection';
import { Footer } from '../components/Footer';

export default function Home() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Extract section name from path (e.g., '/info' -> 'info')
    const pathSegment = pathname.split('/').filter(Boolean)[0];
    const sectionId = pathSegment || 'inicio';

    // Wait one frame to ensure the target section is mounted.
    window.requestAnimationFrame(() => {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'auto' });
      }
    });
  }, [pathname]);

  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <AnimalsSection />
      <InfoSection />
      <Footer />
    </div>
  );
}
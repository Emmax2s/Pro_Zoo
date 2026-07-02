import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Hero } from '../components/Hero';
import { InterestSection } from '../components/InterestSection';
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
        element.scrollIntoView({ behavior: 'auto' });
      }
    });
  }, [pathname]);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      <InterestSection />
      <InfoSection />
      <Footer />
    </div>
  );
}
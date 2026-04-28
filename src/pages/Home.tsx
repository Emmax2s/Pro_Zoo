import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Hero } from '../components/Hero';
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
    <div className="min-h-screen">
      <Navbar />
      <Hero />

      <section className="text-center py-16 bg-green-100">
        <h2 className="text-3xl font-bold">Bienvenido a ZooMAT</h2>
        <p className="mt-4 text-lg">
          Explora la biodiversidad de Chiapas
        </p>
      </section>

      <InfoSection />
      <Footer />
    </div>
  );
}
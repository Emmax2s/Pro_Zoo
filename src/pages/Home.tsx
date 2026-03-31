import { Navbar } from '../components/Navbar';
import { Hero } from '../components/Hero';
import { AnimalsSection } from '../components/AnimalsSection';
import { InfoSection } from '../components/InfoSection';
import { Footer } from '../components/Footer';

export default function Home() {
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
import { createContext, useState, useContext, ReactNode } from 'react';
import heroBg from 'figma:asset/a2dedec3d43b2289cc48881763d33f0dae3e4378.png';

export interface HeroData {
  title: string;
  subtitle: string;
  backgroundImageUrl: string;
  button1Text: string;
  button2Text: string;
}

export interface InfoData {
  title: string;
  description: string;
}

export interface SiteData {
  hero: HeroData;
  info: InfoData;
}

interface SiteContextType {
  siteData: SiteData;
  updateHero: (data: Partial<HeroData>) => void;
  updateInfo: (data: Partial<InfoData>) => void;
}

const SiteContext = createContext<SiteContextType | undefined>(undefined);

const initialSiteData: SiteData = {
  hero: {
    title: 'Bienvenidos a Zoomat',
    subtitle: 'Descubre más de 200 especies de todo el mundo en un entorno natural y sostenible',
    backgroundImageUrl: heroBg,
    button1Text: 'Planifica tu Visita',
    button2Text: 'Horarios',
  },
  info: {
    title: 'Información para tu Visita',
    description: 'Todo lo que necesitas saber para planificar tu día perfecto en el zoológico',
  }
};

export function SiteProvider({ children }: { children: ReactNode }) {
  const [siteData, setSiteData] = useState<SiteData>(initialSiteData);

  const updateHero = (data: Partial<HeroData>) => {
    setSiteData(prev => ({ ...prev, hero: { ...prev.hero, ...data } }));
  };

  const updateInfo = (data: Partial<InfoData>) => {
    setSiteData(prev => ({ ...prev, info: { ...prev.info, ...data } }));
  };

  return (
    <SiteContext.Provider value={{ siteData, updateHero, updateInfo }}>
      {children}
    </SiteContext.Provider>
  );
}

export function useSite() {
  const context = useContext(SiteContext);
  if (context === undefined) {
    throw new Error('useSite must be used within a SiteProvider');
  }
  return context;
}
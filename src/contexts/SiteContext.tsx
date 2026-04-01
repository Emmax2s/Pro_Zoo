import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import heroBg from 'figma:asset/a2dedec3d43b2289cc48881763d33f0dae3e4378.png';

const SITE_STORAGE_KEY = 'pro-zoo-site-data';

export interface HeroData {
  title: string;
  subtitle: string;
  backgroundImages: string[];
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
    title: 'Proyecto de Zoológico',
    subtitle: 'Vive una aventura salvaje y descubre especies increíbles en un espacio natural para toda la familia.',
    backgroundImages: [heroBg],
    button1Text: 'Explorar animales',
    button2Text: 'Ver horarios',
  },
  info: {
    title: 'Planifica tu visita al zoológico',
    description: 'Encuentra horarios, actividades y recomendaciones para disfrutar una experiencia inolvidable.',
  },
};

const normalizeHeroData = (
  hero?: Partial<HeroData> & { backgroundImageUrl?: string }
): HeroData => {
  const filteredImages = Array.isArray(hero?.backgroundImages)
    ? hero.backgroundImages.filter(
        (image): image is string => typeof image === 'string' && image.trim() !== ''
      )
    : hero?.backgroundImageUrl?.trim()
      ? [hero.backgroundImageUrl.trim()]
      : [];

  const backgroundImages = filteredImages.length > 0 ? filteredImages : initialSiteData.hero.backgroundImages;

  return {
    ...initialSiteData.hero,
    ...hero,
    backgroundImages,
  };
};

const loadSiteData = (): SiteData => {
  if (typeof window === 'undefined') {
    return initialSiteData;
  }

  const savedData = window.localStorage.getItem(SITE_STORAGE_KEY);
  if (!savedData) {
    return initialSiteData;
  }

  try {
    const parsedData = JSON.parse(savedData) as Partial<SiteData> & {
      hero?: Partial<HeroData> & { backgroundImageUrl?: string };
    };

    return {
      hero: normalizeHeroData(parsedData.hero),
      info: {
        ...initialSiteData.info,
        ...parsedData.info,
      },
    };
  } catch {
    return initialSiteData;
  }
};

export function SiteProvider({ children }: { children: ReactNode }) {
  const [siteData, setSiteData] = useState<SiteData>(loadSiteData);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(SITE_STORAGE_KEY, JSON.stringify(siteData));
    }
  }, [siteData]);

  const updateHero = (data: Partial<HeroData>) => {
    setSiteData((prev) => ({
      ...prev,
      hero: normalizeHeroData({
        ...prev.hero,
        ...data,
      }),
    }));
  };

  const updateInfo = (data: Partial<InfoData>) => {
    setSiteData((prev) => ({
      ...prev,
      info: { ...prev.info, ...data },
    }));
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
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import heroBg from '../assets/hero-bg.png';
import { idbGetItem, idbSetItem } from '../utils/persistentStorage';

const SITE_STORAGE_KEY = 'pro-zoo-site-data';
const SHARED_CONTENT_URL = '/site-content.json';
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '') || '';
const ADMIN_API_KEY = (import.meta.env.VITE_ADMIN_API_KEY as string | undefined) || '';

export type HeroMediaType = 'image' | 'video';

export interface HeroMediaItem {
  url: string;
  type: HeroMediaType;
}

export interface HeroData {
  title: string;
  subtitle: string;
  backgroundMedia: HeroMediaItem[];
  button1Text: string;
  button2Text: string;
}

export interface InfoData {
  title: string;
  description: string;
  tabHoursLabel: string;
  tabPricesLabel: string;
  tabLocationLabel: string;
  hoursCardTitle: string;
  weekdayLabel: string;
  weekdayHours: string;
  weekendLabel: string;
  weekendHours: string;
  holidayLabel: string;
  holidayHours: string;
  lastEntryNote: string;
  pricesCardTitle: string;
  adultLabel: string;
  adultDetail: string;
  adultPrice: string;
  childLabel: string;
  childDetail: string;
  childPrice: string;
  seniorLabel: string;
  seniorDetail: string;
  seniorPrice: string;
  toddlerLabel: string;
  toddlerPrice: string;
  groupDiscountNote: string;
  locationCardTitle: string;
  addressLabel: string;
  address: string;
  contactLabel: string;
  phone: string;
  email: string;
  mapPlaceholderText: string;
  parkingNote: string;
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

interface SharedContentPayload {
  siteData?: Partial<SiteData>;
}

const SiteContext = createContext<SiteContextType | undefined>(undefined);

const initialSiteData: SiteData = {
  hero: {
    title: 'Bienvenidos al Centro de Conservación y Reserva Natural "Miguel Álvarez del Toro"Proyecto de Zoológico',
    subtitle: 'Vive una aventura salvaje y descubre especies increíbles en un espacio natural para toda la familia.',
    backgroundMedia: [{ url: heroBg, type: 'image' }],
    button1Text: 'Explorar animales',
    button2Text: 'Ver horarios',
  },
  info: {
    title: 'Planifica tu visita al zoológico',
    description: 'Encuentra horarios, actividades y recomendaciones para disfrutar una experiencia inolvidable.',
    tabHoursLabel: 'Horarios',
    tabPricesLabel: 'Precios',
    tabLocationLabel: 'Ubicación',
    hoursCardTitle: 'Horarios de Apertura',
    weekdayLabel: 'Lunes - Viernes',
    weekdayHours: '9:00 AM - 6:00 PM',
    weekendLabel: 'Sábados y Domingos',
    weekendHours: '8:00 AM - 7:00 PM',
    holidayLabel: 'Días Festivos',
    holidayHours: '8:00 AM - 8:00 PM',
    lastEntryNote: 'Última entrada: 1 hora antes del cierre',
    pricesCardTitle: 'Precios de Entrada',
    adultLabel: 'Adultos',
    adultDetail: '13 años y más',
    adultPrice: '$25.00',
    childLabel: 'Niños',
    childDetail: '3-12 años',
    childPrice: '$15.00',
    seniorLabel: 'Adultos Mayores',
    seniorDetail: '65 años y más',
    seniorPrice: '$18.00',
    toddlerLabel: 'Menores de 3 años',
    toddlerPrice: 'Gratis',
    groupDiscountNote: 'Descuentos especiales para grupos de más de 10 personas',
    locationCardTitle: 'Cómo Llegar',
    addressLabel: 'Dirección:',
    address: 'Calz. Cerro Hueco s/n, El Zapotal, 29094 Tuxtla Gutiérrez, Chis.',
    contactLabel: 'Contacto:',
    phone: '+1 (555) 123-4567',
    email: 'info@zoomat.com',
    mapPlaceholderText: 'Mapa interactivo',
    parkingNote: 'Estacionamiento gratuito disponible',
  },
};

const normalizeHeroData = (
  hero?: Partial<HeroData> & { backgroundImageUrl?: string }
): HeroData => {
  const toMediaItem = (value: string): HeroMediaItem => ({
    url: value,
    type: 'image',
  });

  const validBackgroundMedia = Array.isArray(hero?.backgroundMedia)
    ? hero.backgroundMedia.filter(
        (item): item is HeroMediaItem =>
          typeof item?.url === 'string' &&
          item.url.trim() !== '' &&
          (item.type === 'image' || item.type === 'video')
      )
    : [];

  const legacyBackgroundImages = Array.isArray((hero as { backgroundImages?: unknown[] } | undefined)?.backgroundImages)
    ? ((hero as { backgroundImages?: string[] }).backgroundImages ?? [])
        .filter((image): image is string => typeof image === 'string' && image.trim() !== '')
        .map((image) => toMediaItem(image.trim()))
    : hero?.backgroundImageUrl?.trim()
      ? [toMediaItem(hero.backgroundImageUrl.trim())]
      : [];

  const backgroundMedia =
    validBackgroundMedia.length > 0
      ? validBackgroundMedia
      : legacyBackgroundImages.length > 0
        ? legacyBackgroundImages
        : initialSiteData.hero.backgroundMedia;

  return {
    ...initialSiteData.hero,
    ...hero,
    backgroundMedia,
  };
};

const normalizeInfoData = (info?: Partial<InfoData>): InfoData => {
  const merged = {
    ...initialSiteData.info,
    ...info,
  };

  if (merged.address === 'Avenida Zoomat 1234, Ciudad, País') {
    merged.address = initialSiteData.info.address;
  }

  return merged;
};

const loadSiteData = (): { siteData: SiteData; hasLocalOverride: boolean } => {
  if (typeof window === 'undefined') {
    return { siteData: initialSiteData, hasLocalOverride: false };
  }

  const savedData = window.localStorage.getItem(SITE_STORAGE_KEY);
  if (!savedData) {
    return { siteData: initialSiteData, hasLocalOverride: false };
  }

  try {
    const parsedData = JSON.parse(savedData) as Partial<SiteData> & {
      hero?: Partial<HeroData> & { backgroundImageUrl?: string };
    };

    return {
      siteData: {
        hero: normalizeHeroData(parsedData.hero),
        info: normalizeInfoData(parsedData.info),
      },
      hasLocalOverride: true,
    };
  } catch {
    return { siteData: initialSiteData, hasLocalOverride: false };
  }
};

const loadPublishedSiteData = async (): Promise<SiteData | null> => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const response = await fetch(SHARED_CONTENT_URL, { cache: 'no-store' });
    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as SharedContentPayload;
    if (!payload.siteData) {
      return null;
    }

    return {
      hero: normalizeHeroData(payload.siteData.hero),
      info: normalizeInfoData(payload.siteData.info),
    };
  } catch {
    return null;
  }
};

const loadApiSiteData = async (): Promise<SiteData | null> => {
  if (!API_BASE_URL) {
    return null;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/site-content`, { cache: 'no-store' });
    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as Partial<SiteData>;
    if (!payload?.hero || !payload?.info) {
      return null;
    }

    return {
      hero: normalizeHeroData(payload.hero),
      info: normalizeInfoData(payload.info),
    };
  } catch {
    return null;
  }
};

const syncSiteDataToApi = async (siteData: SiteData) => {
  if (!API_BASE_URL || !ADMIN_API_KEY) {
    return;
  }

  await fetch(`${API_BASE_URL}/api/site-content`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-key': ADMIN_API_KEY,
    },
    body: JSON.stringify(siteData),
  });
};

export function SiteProvider({ children }: { children: ReactNode }) {
  const [siteData, setSiteData] = useState<SiteData>(initialSiteData);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let active = true;

    const hydrateSite = async () => {
      if (typeof window === 'undefined') {
        if (active) {
          setHydrated(true);
        }
        return;
      }

      try {
        const savedInDb = await idbGetItem<SiteData>(SITE_STORAGE_KEY);
        if (active && savedInDb) {
          setSiteData({
            hero: normalizeHeroData(savedInDb.hero),
            info: normalizeInfoData(savedInDb.info),
          });
          setHydrated(true);
          return;
        }
      } catch {
        // Fallback below to legacy localStorage
      }

      const localData = loadSiteData();
      let baseSiteData = localData.siteData;

      if (!localData.hasLocalOverride) {
        const apiSiteData = await loadApiSiteData();
        if (apiSiteData) {
          baseSiteData = apiSiteData;
        } else {
          const publishedSiteData = await loadPublishedSiteData();
          if (publishedSiteData) {
            baseSiteData = publishedSiteData;
          }
        }
      }

      if (active) {
        setSiteData(baseSiteData);
      }

      try {
        await idbSetItem(SITE_STORAGE_KEY, baseSiteData);
      } catch {
        // Ignore persistence failure to keep app usable
      }

      if (active) {
        setHydrated(true);
      }
    };

    void hydrateSite();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !hydrated) {
      return;
    }

    void idbSetItem(SITE_STORAGE_KEY, siteData).catch(() => {
      try {
        window.localStorage.setItem(SITE_STORAGE_KEY, JSON.stringify(siteData));
      } catch {
        // Prevent quota errors from crashing the app
      }
    });
  }, [siteData, hydrated]);

  const updateHero = (data: Partial<HeroData>) => {
    setSiteData((prev) => {
      const next = {
        ...prev,
        hero: normalizeHeroData({
          ...prev.hero,
          ...data,
        }),
      };
      void syncSiteDataToApi(next);
      return next;
    });
  };

  const updateInfo = (data: Partial<InfoData>) => {
    setSiteData((prev) => {
      const next = {
        ...prev,
        info: { ...prev.info, ...data },
      };
      void syncSiteDataToApi(next);
      return next;
    });
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
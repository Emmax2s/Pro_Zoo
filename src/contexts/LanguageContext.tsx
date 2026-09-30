import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import esResource from '../i18n/es.json';
import enResource from '../i18n/en.json';

const LANGUAGE_STORAGE_KEY = 'pro-zoo-language';

export type Language = 'es' | 'en';

type TranslationMap = {
  navbar: {
    home: string;
    animals: string;
    info: string;
    contact: string;
    languageLabel: string;
  };
  animalsSection: {
    title: string;
    subtitle: string;
  };
  hero: {
    zooViewAlt: string;
    previousItemAria: string;
    nextItemAria: string;
    goToItemAria: string;
  };
  infoSection: {
    mapTitle: string;
    openInMaps: string;
    openNow: string;
    closedNow: string;
    lastEntryIn: string;
    lastEntryClosed: string;
    closesIn: string;
    reopensAt: string;
  };
  footer: {
    about: string;
    quickLinks: string;
    followUs: string;
    rightsReserved: string;
  };
  notFound: {
    title: string;
    message: string;
    goHome: string;
  };
  routeError: {
    routeNotFound: string;
    unexpectedError: string;
    somethingWentWrong: string;
    loadProblem: string;
    backHome: string;
  };
  animalCard: {
    mediaUnavailable: string;
    habitatLabel: string;
  };
  animalPanel: {
    closePanelAria: string;
    mediaError: string;
    audioTitle: string;
    audioDirectError: string;
    browserNoAudio: string;
    openAudio: string;
    noAudioMessage: string;
    stopNarration: string;
    listenNarration: string;
    features: string;
    activity: string;
    feeding: string;
    size: string;
    weight: string;
    lifespan: string;
    aboutSpecies: string;
    aboutFallback: string;
    distribution: string;
    naturalHabitat: string;
    importance: string;
    threats: string;
    funFacts: string;
    footerMessage: string;
    notSpecified: string;
    variedDiet: string;
  };
};

interface LanguageResource {
  ui: TranslationMap;
  dynamicFromEs: Record<string, string>;
}

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: TranslationMap;
  translateConservationStatus: (status: string) => string;
  translateActivity: (activity?: string) => string;
  translateContent: (value?: string) => string;
  translateList: (values?: string[]) => string[];
}

const resources: Record<Language, LanguageResource> = {
  es: esResource as LanguageResource,
  en: enResource as LanguageResource,
};

const translateConservationStatusMap: Record<Language, Record<string, string>> = {
  es: {
    'En Peligro': 'En Peligro',
    Vulnerable: 'Vulnerable',
    'No Amenazado': 'No Amenazado',
  },
  en: {
    'En Peligro': 'Endangered',
    Vulnerable: 'Vulnerable',
    'No Amenazado': 'Least Concern',
  },
};

const translateActivityMap: Record<Language, Record<string, string>> = {
  es: {
    Diurno: 'Diurno',
    Nocturno: 'Nocturno',
    Crepuscular: 'Crepuscular',
  },
  en: {
    Diurno: 'Diurnal',
    Nocturno: 'Nocturnal',
    Crepuscular: 'Crepuscular',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const getInitialLanguage = (): Language => {
  if (typeof window === 'undefined') {
    return 'es';
  }

  const saved = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
  if (saved === 'es' || saved === 'en') {
    return saved;
  }

  return 'es';
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(getInitialLanguage);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    document.documentElement.lang = language;
  }, [language]);

  const value = useMemo<LanguageContextType>(() => {
    const translateConservationStatus = (status: string) => {
      return translateConservationStatusMap[language][status] ?? status;
    };

    const translateActivity = (activity?: string) => {
      if (!activity) {
        return resources[language].ui.animalPanel.notSpecified;
      }
      return translateActivityMap[language][activity] ?? activity;
    };

    const translateContent = (content?: string) => {
      if (!content) {
        return '';
      }

      if (language === 'es') {
        return content;
      }

      return resources.en.dynamicFromEs[content] ?? content;
    };

    const translateList = (values?: string[]) => {
      if (!values) {
        return [];
      }

      return values.map((item) => translateContent(item));
    };

    return {
      language,
      setLanguage: setLanguageState,
      t: resources[language].ui,
      translateConservationStatus,
      translateActivity,
      translateContent,
      translateList,
    };
  }, [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

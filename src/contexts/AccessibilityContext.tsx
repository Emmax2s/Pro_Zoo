import React, { createContext, useContext, useState, useEffect } from 'react';

interface AccessibilityPreferences {
  highContrast: boolean;
  fontSize: 'normal' | 'large' | 'extra-large';
  autoPlayAudio: boolean;
  reduceMotion: boolean;
}

interface AccessibilityContextType {
  preferences: AccessibilityPreferences;
  setHighContrast: (value: boolean) => void;
  setFontSize: (size: 'normal' | 'large' | 'extra-large') => void;
  setAutoPlayAudio: (value: boolean) => void;
  setReduceMotion: (value: boolean) => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

const DEFAULT_PREFERENCES: AccessibilityPreferences = {
  highContrast: false,
  fontSize: 'normal',
  autoPlayAudio: false,
  reduceMotion: false,
};

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [preferences, setPreferences] = useState<AccessibilityPreferences>(DEFAULT_PREFERENCES);

  // Load preferences from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('pro-zoo-accessibility-preferences');
      if (stored) {
        setPreferences(JSON.parse(stored));
      }
    } catch {
      // Ignore parsing errors
    }
  }, []);

  // Check for prefers-reduced-motion media query
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = (e: MediaQueryListEvent) => {
      setPreferences(prev => ({
        ...prev,
        reduceMotion: e.matches,
      }));
    };

    if (mediaQuery.matches) {
      setPreferences(prev => ({
        ...prev,
        reduceMotion: true,
      }));
    }

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const updateAndPersist = (updatedPrefs: AccessibilityPreferences) => {
    setPreferences(updatedPrefs);
    try {
      localStorage.setItem('pro-zoo-accessibility-preferences', JSON.stringify(updatedPrefs));
    } catch {
      // Ignore storage errors
    }
  };

  const setHighContrast = (value: boolean) => {
    updateAndPersist({ ...preferences, highContrast: value });
  };

  const setFontSize = (size: 'normal' | 'large' | 'extra-large') => {
    updateAndPersist({ ...preferences, fontSize: size });
  };

  const setAutoPlayAudio = (value: boolean) => {
    updateAndPersist({ ...preferences, autoPlayAudio: value });
  };

  const setReduceMotion = (value: boolean) => {
    updateAndPersist({ ...preferences, reduceMotion: value });
  };

  // Apply preferences to document
  useEffect(() => {
    const root = document.documentElement;

    if (preferences.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    switch (preferences.fontSize) {
      case 'large':
        root.style.fontSize = '18px';
        break;
      case 'extra-large':
        root.style.fontSize = '20px';
        break;
      default:
        root.style.fontSize = '16px';
    }

    if (preferences.reduceMotion) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }
  }, [preferences]);

  return (
    <AccessibilityContext.Provider
      value={{
        preferences,
        setHighContrast,
        setFontSize,
        setAutoPlayAudio,
        setReduceMotion,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within AccessibilityProvider');
  }
  return context;
};

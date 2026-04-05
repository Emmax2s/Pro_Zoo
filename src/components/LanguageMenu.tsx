import { useEffect, useState } from 'react';

type SupportedLanguage = 'es' | 'en';

type TranslateWindow = Window & {
  google?: {
    translate?: {
      TranslateElement?: {
        new (
          options: {
            pageLanguage: string;
            includedLanguages?: string;
            autoDisplay?: boolean;
            layout?: number;
          },
          elementId: string
        ): unknown;
        InlineLayout?: {
          SIMPLE?: number;
        };
      };
    };
  };
  googleTranslateElementInit?: () => void;
};

const GOOGLE_SCRIPT_ID = 'google-translate-script';

const getCookieValue = (name: string): string | null => {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
};

const setGoogTransCookie = (language: SupportedLanguage) => {
  const value = language === 'en' ? '/es/en' : '/es/es';
  document.cookie = `googtrans=${value}; path=/`;
};

const detectLanguage = (): SupportedLanguage => {
  const cookieValue = getCookieValue('googtrans');
  if (cookieValue?.endsWith('/en')) {
    return 'en';
  }
  return 'es';
};

const hideTranslateChrome = () => {
  const shouldHideFrame = (frame: HTMLIFrameElement) => {
    const className = typeof frame.className === 'string' ? frame.className : '';
    const id = frame.id ?? '';
    const src = frame.getAttribute('src') ?? '';

    return (
      className.includes('goog-te-banner-frame') ||
      className.includes('skiptranslate') ||
      id.includes('goog-te-banner-frame') ||
      src.includes('translate.google.com')
    );
  };

  document.querySelectorAll('iframe').forEach((node) => {
    if (!(node instanceof HTMLIFrameElement)) {
      return;
    }

    if (!shouldHideFrame(node)) {
      return;
    }

    node.style.setProperty('display', 'none', 'important');
    node.style.setProperty('visibility', 'hidden', 'important');
    node.style.setProperty('height', '0', 'important');
    node.style.setProperty('min-height', '0', 'important');
    node.style.setProperty('max-height', '0', 'important');
    node.remove();
  });

  document.querySelectorAll('.goog-te-banner-frame, .goog-te-banner-frame.skiptranslate').forEach((node) => {
    if (node instanceof HTMLElement) {
      node.style.setProperty('display', 'none', 'important');
      node.remove();
    }
  });

  document.documentElement.style.setProperty('top', '0px', 'important');
  document.documentElement.style.setProperty('margin-top', '0px', 'important');
  document.body.style.setProperty('top', '0px', 'important');
  document.body.style.setProperty('margin-top', '0px', 'important');
};

export function LanguageMenu() {
  const [language, setLanguage] = useState<SupportedLanguage>(() =>
    typeof document !== 'undefined' ? detectLanguage() : 'es'
  );

  useEffect(() => {
    const win = window as TranslateWindow;

    const initWidget = () => {
      if (!win.google?.translate?.TranslateElement) {
        return;
      }

      const container = document.getElementById('google_translate_element');
      if (!container || container.childElementCount > 0) {
        return;
      }

      new win.google.translate.TranslateElement(
        {
          pageLanguage: 'es',
          includedLanguages: 'en,es',
          autoDisplay: false,
          layout: win.google.translate.TranslateElement.InlineLayout?.SIMPLE,
        },
        'google_translate_element'
      );
    };

    win.googleTranslateElementInit = initWidget;

    if (win.google?.translate?.TranslateElement) {
      initWidget();
    } else if (!document.getElementById(GOOGLE_SCRIPT_ID)) {
      const script = document.createElement('script');
      script.id = GOOGLE_SCRIPT_ID;
      script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.body.appendChild(script);
    }

    const syncCurrentLanguage = () => {
      const combo = document.querySelector<HTMLSelectElement>('select.goog-te-combo');
      if (combo) {
        setLanguage(combo.value === 'en' ? 'en' : detectLanguage());
      } else {
        setLanguage(detectLanguage());
      }
    };

    const timeoutId = window.setTimeout(syncCurrentLanguage, 600);

    hideTranslateChrome();
    const observer = new MutationObserver(() => {
      hideTranslateChrome();
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class'],
    });

    const intervalId = window.setInterval(hideTranslateChrome, 500);

    return () => {
      window.clearTimeout(timeoutId);
      window.clearInterval(intervalId);
      observer.disconnect();
    };
  }, []);

  const applyLanguage = (nextLanguage: SupportedLanguage) => {
    setLanguage(nextLanguage);
    setGoogTransCookie(nextLanguage);

    const combo = document.querySelector<HTMLSelectElement>('select.goog-te-combo');
    const targetValue = nextLanguage;

    if (combo) {
      combo.value = targetValue;
      combo.dispatchEvent(new Event('change', { bubbles: true }));
      return;
    }

    // If Google combo is not ready yet, force language persistence and reload once.
    window.setTimeout(() => {
      const delayedCombo = document.querySelector<HTMLSelectElement>('select.goog-te-combo');
      if (delayedCombo) {
        delayedCombo.value = targetValue;
        delayedCombo.dispatchEvent(new Event('change', { bubbles: true }));
        return;
      }

      window.location.reload();
    }, 500);
  };

  return (
    <div className="language-menu">
      <label htmlFor="language-select" className="sr-only">
        Seleccionar idioma
      </label>
      <select
        id="language-select"
        value={language}
        onChange={(event) => applyLanguage(event.target.value as SupportedLanguage)}
        className="language-menu__select"
        aria-label="Seleccionar idioma"
      >
        <option value="es">ES</option>
        <option value="en">EN</option>
      </select>
      <div id="google_translate_element" className="language-menu__google-hook" aria-hidden="true" />
    </div>
  );
}

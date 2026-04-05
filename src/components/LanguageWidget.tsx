import { useEffect } from 'react';

type GoogleTranslateWindow = Window & {
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

export function LanguageWidget() {
  useEffect(() => {
    const win = window as GoogleTranslateWindow;

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
          includedLanguages: 'de,it,ko,pt,ru,uk,en,fr',
          autoDisplay: false,
          layout: win.google.translate.TranslateElement.InlineLayout?.SIMPLE,
        },
        'google_translate_element'
      );
    };

    win.googleTranslateElementInit = initWidget;

    if (win.google?.translate?.TranslateElement) {
      initWidget();
      return;
    }

    const existingScript = document.getElementById(GOOGLE_SCRIPT_ID);
    if (existingScript) {
      return;
    }

    const script = document.createElement('script');
    script.id = GOOGLE_SCRIPT_ID;
    script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    script.async = true;
    document.body.appendChild(script);
  }, []);

  return (
    <div className="language-widget fixed bottom-4 right-4 z-[70] rounded-md border border-gray-200 bg-white/95 p-2 shadow-lg backdrop-blur-sm">
      <div id="google_translate_element" aria-label="Selector de idioma" />
    </div>
  );
}

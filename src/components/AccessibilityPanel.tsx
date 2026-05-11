import React from 'react';
import { Settings } from 'lucide-react';
import { useAccessibility } from '../contexts/AccessibilityContext';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from './ui/sheet';
import { Button } from './ui/button';
import { Switch } from './ui/switch';

export const AccessibilityPanel: React.FC = () => {
  const { preferences, setHighContrast, setFontSize, setAutoPlayAudio } = useAccessibility();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="rounded-full"
          title="Opciones de accesibilidad"
        >
          <Settings className="w-4 h-4" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Opciones de Accesibilidad</SheetTitle>
          <SheetDescription>
            Personaliza la experiencia de visualización
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 py-6">
          {/* High Contrast */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-700">
              Alto Contraste
            </label>
            <p className="text-xs text-gray-600">
              Aumenta el contraste entre elementos para mejor legibilidad
            </p>
            <div className="flex items-center gap-3">
              <Switch
                checked={preferences.highContrast}
                onCheckedChange={setHighContrast}
                aria-label="Alternar alto contraste"
              />
              <span className="text-sm text-gray-700">
                {preferences.highContrast ? 'Activado' : 'Desactivado'}
              </span>
            </div>
          </div>

          {/* Font Size */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-700">
              Tamaño de Fuente
            </label>
            <p className="text-xs text-gray-600">
              Ajusta el tamaño del texto para mejor lectura
            </p>
            <div className="flex gap-2">
              {(['normal', 'large', 'extra-large'] as const).map((size) => (
                <button
                  key={size}
                  onClick={() => setFontSize(size)}
                  className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                    preferences.fontSize === size
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {size === 'normal' ? 'Normal' : size === 'large' ? 'Grande' : 'Extra Grande'}
                </button>
              ))}
            </div>
            <div className="mt-3 p-3 bg-gray-100 rounded text-sm">
              Ejemplo de texto con tamaño {preferences.fontSize}
            </div>
          </div>

          {/* Auto-play Audio */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-700">
              Reproducción Automática de Audio
            </label>
            <p className="text-xs text-gray-600">
              Reproduce automáticamente el audio descriptivo al cargar
            </p>
            <div className="flex items-center gap-3">
              <Switch
                checked={preferences.autoPlayAudio}
                onCheckedChange={setAutoPlayAudio}
                aria-label="Alternar reproducción automática de audio"
              />
              <span className="text-sm text-gray-700">
                {preferences.autoPlayAudio ? 'Activado' : 'Desactivado'}
              </span>
            </div>
          </div>

          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-700">
            <p>
              <strong>Nota:</strong> Tus preferencias se guardan automáticamente en este navegador.
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

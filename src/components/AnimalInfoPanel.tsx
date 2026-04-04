import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  AlertTriangle,
  Info,
  Lightbulb,
  MapPin,
  Ruler,
  Volume2,
  Weight,
  X,
} from 'lucide-react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Animal } from '../contexts/AnimalContext';

interface AnimalInfoPanelProps {
  animal: Animal;
  onClose: () => void;
}

const buildAnimalSummary = (animal: Animal) => {
  return [
    `Nombre: ${animal.name}`,
    `Especie: ${animal.species}`,
    `Hábitat: ${animal.habitat}`,
    `Conservación: ${animal.conservation}`,
    animal.activity ? `Actividad: ${animal.activity}` : '',
    animal.diet ? `Dieta: ${animal.diet}` : '',
    animal.lifespan ? `Esperanza de vida: ${animal.lifespan}` : '',
    animal.distribution ? `Distribución: ${animal.distribution}` : '',
    animal.description ? `Descripción: ${animal.description}` : '',
  ]
    .filter(Boolean)
    .join('\n');
};

const getDriveFileId = (url?: string) => {
  if (!url) {
    return '';
  }

  const match =
    url.match(/\/file\/d\/([^/]+)/) ??
    url.match(/[?&]id=([^&]+)/) ??
    url.match(/\/uc\?(?:export=[^&]+&)?id=([^&]+)/);

  return match?.[1] ?? '';
};

const isMegaUrl = (url?: string) => Boolean(url && /mega\.(nz|io)\//i.test(url));
const isDriveUrl = (url?: string) => Boolean(url && /drive\.google\.com/i.test(url));

const toMegaEmbedUrl = (url: string) => {
  return url.replace('/file/', '/embed/').replace('/folder/', '/embed/');
};

const toDrivePreviewUrl = (url: string) => {
  const fileId = getDriveFileId(url);
  return fileId ? `https://drive.google.com/file/d/${fileId}/preview` : url;
};

const getDriveImageSources = (url?: string) => {
  if (!url) {
    return [] as string[];
  }

  const fileId = getDriveFileId(url);
  if (!fileId) {
    return [] as string[];
  }

  return [
    `https://drive.google.com/thumbnail?id=${fileId}&sz=w1200`,
    `https://drive.usercontent.google.com/uc?id=${fileId}&export=view`,
    `https://lh3.googleusercontent.com/d/${fileId}=w1200`,
  ];
};

const normalizeImageUrl = (url?: string) => {
  if (!url) {
    return '';
  }

  const trimmed = url.trim();

  if (isDriveUrl(trimmed)) {
    const driveSources = getDriveImageSources(trimmed);
    return driveSources[0] ?? trimmed;
  }

  if (/dropbox\.com/i.test(trimmed)) {
    return trimmed
      .replace('www.dropbox.com', 'dl.dropboxusercontent.com')
      .replace('?dl=0', '?raw=1')
      .replace('&dl=0', '&raw=1')
      .replace('?dl=1', '?raw=1');
  }

  return trimmed;
};

const normalizeAudioUrl = (url?: string) => {
  if (!url) {
    return '';
  }

  const trimmed = url.trim();

  if (isDriveUrl(trimmed)) {
    const fileId = getDriveFileId(trimmed);
    if (fileId) {
      return `https://drive.google.com/uc?export=download&id=${fileId}`;
    }
  }

  if (/dropbox\.com/i.test(trimmed)) {
    return trimmed
      .replace('www.dropbox.com', 'dl.dropboxusercontent.com')
      .replace('?dl=0', '?raw=1')
      .replace('&dl=0', '&raw=1')
      .replace('?dl=1', '?raw=1');
  }

  return trimmed;
};

export function AnimalInfoPanel({ animal, onClose }: AnimalInfoPanelProps) {
  const [audioError, setAudioError] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
      window.speechSynthesis?.cancel();
      setIsSpeaking(false);
    };
  }, [onClose]);

  const handleClose = () => {
    onClose();
  };

  const getConservationColor = (status: string) => {
    switch (status) {
      case 'En Peligro':
        return 'bg-red-500';
      case 'Vulnerable':
        return 'bg-orange-500';
      default:
        return 'bg-green-500';
    }
  };

  const getActivityIcon = (activity?: string) => {
    if (activity === 'Nocturno') return '🌙';
    if (activity === 'Crepuscular') return '🌅';
    return '☀️';
  };

  const animalSummary = buildAnimalSummary(animal);
 
  const primaryMedia = useMemo(() => {
    if (animal.mediaUrls && animal.mediaUrls.length > 0) {
      const firstMedia = animal.mediaUrls[0];
      return {
        url: normalizeImageUrl(firstMedia.url),
        type: firstMedia.type,
      };
    }

    const rawImageUrl = animal.imageUrls && animal.imageUrls.length > 0 ? animal.imageUrls[0] : animal.imageUrl;
    const normalized = normalizeImageUrl(rawImageUrl);

    if (!normalized) {
      return null;
    }

    return {
      url: normalized,
      type: 'image' as const,
    };
  }, [animal]);

  const [mediaError, setMediaError] = useState(false);
  const currentImageUrl = primaryMedia?.url || '';
  const normalizedAudioUrl = normalizeAudioUrl(animal.audioUrl);
  const usesMegaAudio = isMegaUrl(animal.audioUrl);
  const usesDriveAudio = isDriveUrl(animal.audioUrl);

  const openExternalLink = (url?: string) => {
    if (!url) {
      return;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleSpeakSummary = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }

    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(animalSummary);
    utterance.lang = 'es-ES';
    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    const availableVoices = window.speechSynthesis.getVoices();
    const spanishVoice = availableVoices.find((voice) => voice.lang.toLowerCase().startsWith('es'));
    if (spanishVoice) {
      utterance.voice = spanishVoice;
    }

    setIsSpeaking(true);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onMouseDown={handleClose}>
      <div
        className="relative max-h-[95vh] w-full max-w-6xl overflow-hidden rounded-2xl bg-gradient-to-br from-green-50 to-yellow-50 shadow-2xl animate-in fade-in zoom-in duration-300"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-4 right-4 z-20 rounded-full bg-green-800 p-2 text-white shadow-lg transition-colors hover:bg-green-900"
          aria-label="Cerrar ficha de la especie"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="relative h-48 overflow-hidden bg-gradient-to-r from-green-700 to-green-600">
          <div className="absolute inset-0 bg-black/30"></div>
          <div className="relative z-10 p-8 text-white">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="mb-2 text-4xl font-bold drop-shadow-lg">{animal.name}</h1>
                <p className="text-xl italic drop-shadow-md">({animal.species})</p>
              </div>
              <Badge className={`${getConservationColor(animal.conservation)} px-4 py-2 text-sm text-white shadow-md`}>
                {animal.conservation}
              </Badge>
            </div>
          </div>
        </div>

        <div className="max-h-[calc(95vh-12rem)] overflow-y-auto p-8">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="space-y-4 lg:col-span-1">
              <div className="relative overflow-hidden rounded-xl border-4 border-yellow-400 bg-white shadow-lg">
                {primaryMedia?.type === 'video' ? (
                  <video
                    src={primaryMedia.url}
                    className="h-64 w-full object-contain bg-black"
                    controls
                    onError={() => setMediaError(true)}
                  />
                ) : mediaError || !currentImageUrl ? (
                  <div className="flex h-64 flex-col items-center justify-center gap-3 bg-gray-100 p-4 text-center">
                    <p className="text-sm text-gray-600">
                      No se pudo mostrar este contenido.
                    </p>
                  </div>
                ) : (
                  <img
                    src={currentImageUrl}
                    alt={animal.name}
                    className="h-64 w-full object-contain bg-white"
                    onError={() => setMediaError(true)}
                  />
                )}
              </div>

              <div className="rounded-xl border-2 border-green-600 bg-white p-4 shadow-md">
                <div className="mb-3 flex items-center gap-2 border-b border-green-100 pb-2">
                  <Volume2 className="h-5 w-5 text-green-700" />
                  <h3 className="font-bold text-green-800">AUDIO DE LA ESPECIE</h3>
                </div>
                {animal.audioUrl ? (
                  <>
                    {usesMegaAudio || usesDriveAudio ? (
                      <iframe
                        src={usesMegaAudio ? toMegaEmbedUrl(animal.audioUrl) : toDrivePreviewUrl(animal.audioUrl)}
                        title={`Audio de ${animal.name}`}
                        className="h-24 w-full rounded-lg border border-green-100"
                        allow="autoplay"
                      />
                    ) : audioError ? (
                      <p className="rounded-md bg-yellow-50 p-3 text-sm text-gray-700">
                        No se pudo reproducir el audio directamente desde este enlace.
                      </p>
                    ) : (
                      <audio controls preload="none" className="w-full" onError={() => setAudioError(true)}>
                        <source src={normalizedAudioUrl} />
                        Tu navegador no soporta audio HTML5.
                      </audio>
                    )}
                    <div className="mt-3">
                      <Button variant="outline" className="w-full sm:w-auto" onClick={() => openExternalLink(animal.audioUrl)}>
                        Abrir audio
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-700">
                      Esta especie no tiene un archivo de audio cargado todavía. Puedes escuchar una narración automática con su información.
                    </p>
                    <Button className="bg-green-600 hover:bg-green-700" onClick={handleSpeakSummary}>
                      <Volume2 className="mr-2 h-4 w-4" />
                      {isSpeaking ? 'Detener narración' : 'Escuchar narración'}
                    </Button>
                  </div>
                )}
              </div>

              <div className="overflow-hidden rounded-xl border-2 border-green-600 bg-white shadow-md">
                <div className="bg-gradient-to-r from-green-700 to-green-600 p-3">
                  <h3 className="text-center font-bold text-white">CARACTERÍSTICAS</h3>
                </div>
                <div className="space-y-3 p-4">
                  <div className="rounded-lg border-l-4 border-yellow-500 bg-yellow-100 p-3">
                    <div className="mb-1 flex items-center gap-2">
                      <span className="text-2xl">{getActivityIcon(animal.activity)}</span>
                      <h4 className="font-semibold text-green-800">ACTIVIDAD</h4>
                    </div>
                    <p className="ml-9 text-sm text-gray-700">{animal.activity || 'No especificado'}</p>
                  </div>

                  <div className="rounded-lg border-l-4 border-yellow-500 bg-yellow-100 p-3">
                    <div className="mb-1 flex items-center gap-2">
                      <span className="text-2xl">🍽️</span>
                      <h4 className="font-semibold text-green-800">ALIMENTACIÓN</h4>
                    </div>
                    <p className="ml-9 text-sm text-gray-700">{animal.diet || 'Variada'}</p>
                  </div>

                  {animal.size && (
                    <div className="rounded-lg border-l-4 border-yellow-500 bg-yellow-100 p-3">
                      <div className="mb-1 flex items-center gap-2">
                        <Ruler className="h-5 w-5 text-green-700" />
                        <h4 className="font-semibold text-green-800">TAMAÑO</h4>
                      </div>
                      <p className="ml-7 text-sm text-gray-700">{animal.size}</p>
                    </div>
                  )}

                  {animal.weight && (
                    <div className="rounded-lg border-l-4 border-yellow-500 bg-yellow-100 p-3">
                      <div className="mb-1 flex items-center gap-2">
                        <Weight className="h-5 w-5 text-green-700" />
                        <h4 className="font-semibold text-green-800">PESO</h4>
                      </div>
                      <p className="ml-7 text-sm text-gray-700">{animal.weight}</p>
                    </div>
                  )}

                  <div className="rounded-lg border-l-4 border-yellow-500 bg-yellow-100 p-3">
                    <div className="mb-1 flex items-center gap-2">
                      <span className="text-2xl">⏱️</span>
                      <h4 className="font-semibold text-green-800">ESPERANZA DE VIDA</h4>
                    </div>
                    <p className="ml-9 text-sm text-gray-700">{animal.lifespan || 'No especificado'}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4 lg:col-span-2">
              <div className="rounded-xl border-2 border-green-600 bg-white p-6 shadow-md">
                <div className="mb-4 flex items-center gap-2 border-b-2 border-yellow-400 pb-3">
                  <Info className="h-6 w-6 text-green-700" />
                  <h3 className="text-xl font-bold text-green-800">SOBRE ESTA ESPECIE</h3>
                </div>
                <p className="leading-relaxed text-gray-700">
                  {animal.description || 'Información detallada sobre esta especie se encuentra en proceso de actualización.'}
                </p>
              </div>


              {animal.distribution && (
                <div className="rounded-xl border-2 border-green-600 bg-white p-6 shadow-md">
                  <div className="mb-4 flex items-center gap-2 border-b-2 border-yellow-400 pb-3">
                    <MapPin className="h-6 w-6 text-green-700" />
                    <h3 className="text-xl font-bold text-green-800">DISTRIBUCIÓN</h3>
                  </div>
                  <p className="text-gray-700">{animal.distribution}</p>
                  <div className="mt-4 rounded-lg bg-green-100 p-4">
                    <p className="text-sm italic text-gray-600">📍 Hábitat natural: {animal.habitat}</p>
                  </div>
                </div>
              )}

              {animal.importance && (
                <div className="rounded-xl border-2 border-green-600 bg-white p-6 shadow-md">
                  <div className="mb-4 flex items-center gap-2 border-b-2 border-yellow-400 pb-3">
                    <span className="text-2xl">⭐</span>
                    <h3 className="text-xl font-bold text-green-800">IMPORTANCIA</h3>
                  </div>
                  <p className="text-gray-700">{animal.importance}</p>
                </div>
              )}

              {animal.threats && animal.threats.length > 0 && (
                <div className="rounded-xl border-2 border-red-400 bg-white p-6 shadow-md">
                  <div className="mb-4 flex items-center gap-2 border-b-2 border-red-300 pb-3">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                    <h3 className="text-xl font-bold text-red-700">AMENAZAS</h3>
                  </div>
                  <ul className="space-y-2">
                    {animal.threats.map((threat, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="mt-1 text-red-500">⚠️</span>
                        <span className="text-gray-700">{threat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {animal.funFacts && animal.funFacts.length > 0 && (
                <div className="rounded-xl border-2 border-yellow-400 bg-gradient-to-br from-yellow-100 to-orange-100 p-6 shadow-md">
                  <div className="mb-4 flex items-center gap-2 border-b-2 border-yellow-500 pb-3">
                    <Lightbulb className="h-6 w-6 text-yellow-700" />
                    <h3 className="text-xl font-bold text-yellow-800">DATOS CURIOSOS</h3>
                  </div>
                  <ul className="space-y-2">
                    {animal.funFacts.map((fact, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="mt-1 text-yellow-600">💡</span>
                        <span className="text-gray-700">{fact}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-700 to-green-600 p-4 text-center">
          <p className="text-sm text-white">
            <strong>ZOOMAT</strong> - Comprometidos con la conservación y educación sobre la vida silvestre
          </p>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined'
    ? createPortal(modalContent, document.body)
    : modalContent;
}

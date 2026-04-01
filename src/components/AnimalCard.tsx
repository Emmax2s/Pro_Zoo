import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { useEffect, useMemo, useState } from 'react';
import { AnimalInfoPanel } from './AnimalInfoPanel';
import { Animal } from '../contexts/AnimalContext';

interface AnimalCardProps extends Animal {}

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

const IMAGE_PLACEHOLDER =
  'data:image/svg+xml;charset=UTF-8,' +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="320" height="240" viewBox="0 0 320 240">
      <rect width="320" height="240" fill="#f3f4f6" />
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#6b7280" font-family="Arial, sans-serif" font-size="18">
        Imagen no disponible
      </text>
    </svg>
  `);

const getDriveImageSources = (url?: string) => {
  if (!url) {
    return [] as string[];
  }

  const fileId = getDriveFileId(url);
  if (!fileId) {
    return [] as string[];
  }

  return [
    `https://drive.google.com/thumbnail?id=${fileId}&sz=w800`,
    `https://drive.usercontent.google.com/uc?id=${fileId}&export=view`,
    `https://lh3.googleusercontent.com/d/${fileId}=w800`,
  ];
};

const normalizeImageUrl = (url?: string) => {
  if (!url) {
    return '';
  }

  const trimmed = url.trim();

  if (/drive\.google\.com/i.test(trimmed)) {
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

export function AnimalCard(animal: AnimalCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const imageCandidates = useMemo(() => {
    const sources = animal.imageUrls && animal.imageUrls.length > 0 ? animal.imageUrls : [animal.imageUrl];
    return sources
      .map((url) => normalizeImageUrl(url))
      .filter((url): url is string => !!url);
  }, [animal.imageUrl, animal.imageUrls]);

  const hasMultipleImages = imageCandidates.length > 1;

  useEffect(() => {
    setCurrentIndex(0);
  }, [imageCandidates]);

  useEffect(() => {
    if (!hasMultipleImages) return;

    const intervalId = window.setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % imageCandidates.length);
    }, 4000);

    return () => window.clearInterval(intervalId);
  }, [hasMultipleImages, imageCandidates.length]);

  const currentImageUrl = imageCandidates[currentIndex] || '';

  const handleImageError = () => {
    if (currentIndex < imageCandidates.length - 1) {
      setCurrentIndex((prev) => (prev + 1) % imageCandidates.length);
      return;
    }

    setImageError(true);
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

  return (
    <>
      <Card
        className="cursor-pointer overflow-hidden border border-gray-200 bg-white shadow-sm transition-shadow duration-300 hover:shadow-md"
        onClick={() => setIsOpen(true)}
      >
        <div className="relative h-[200px] w-full overflow-hidden bg-gray-50">
          {imageError || !currentImageUrl ? (
            <img
              src={IMAGE_PLACEHOLDER}
              alt="Imagen no disponible"
              className="h-full w-full object-cover"
            />
          ) : (
            <img
              src={currentImageUrl}
              alt={animal.name}
              className="h-full w-full object-cover"
              onError={handleImageError}
            />
          )}

          {hasMultipleImages && (
            <>
              <div className="absolute left-2 top-2 z-10 rounded-md bg-black/60 px-2 py-1 text-xs font-medium text-white">
                Carrusel {currentIndex + 1}/{imageCandidates.length}
              </div>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setCurrentIndex((prev) => (prev - 1 + imageCandidates.length) % imageCandidates.length);
                }}
                className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/30 p-1 text-white"
                aria-label="Anterior imagen"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setCurrentIndex((prev) => (prev + 1) % imageCandidates.length);
                }}
                className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/30 p-1 text-white"
                aria-label="Siguiente imagen"
              >
                ›
              </button>
              <div className="absolute bottom-2 left-1/2 z-10 flex -translate-x-1/2 gap-1">
                {imageCandidates.map((_, index) => (
                  <button
                    key={`indicator-${index}`}
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      setCurrentIndex(index);
                    }}
                    className={`h-2 w-2 rounded-full ${index === currentIndex ? 'bg-white' : 'bg-white/50'}`}
                    aria-label={`Ir a imagen ${index + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
        <CardContent className="space-y-1 p-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="text-green-800">{animal.name}</h3>
              <p className="text-sm text-gray-600">{animal.species}</p>
            </div>
            <Badge className={`${getConservationColor(animal.conservation)} text-white`}>
              {animal.conservation}
            </Badge>
          </div>
          <p className="text-sm text-gray-500">📍 {animal.habitat}</p>
        </CardContent>
      </Card>

      {isOpen && (
        <AnimalInfoPanel animal={animal} onClose={() => setIsOpen(false)} />
      )}
    </>
  );
}
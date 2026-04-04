import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { useMemo, useState } from 'react';
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
        Media no disponible
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

const normalizeMediaUrl = (url?: string) => {
  if (!url) return '';
  return normalizeImageUrl(url);
};

export function AnimalCard(animal: AnimalCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mediaError, setMediaError] = useState(false);

  const currentMedia = useMemo(() => {
    if (animal.mediaUrls && animal.mediaUrls.length > 0) {
      const firstMedia = animal.mediaUrls[0];
      return {
        url: normalizeMediaUrl(firstMedia.url),
        type: firstMedia.type,
      };
    }

    const fallbackImage = animal.imageUrls && animal.imageUrls.length > 0 ? animal.imageUrls[0] : animal.imageUrl;
    const normalized = normalizeImageUrl(fallbackImage);

    if (!normalized) {
      return null;
    }

    return {
      url: normalized,
      type: 'image' as const,
    };
  }, [animal.imageUrl, animal.imageUrls, animal.mediaUrls]);

  const handleMediaError = () => {
    setMediaError(true);
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
          {mediaError || !currentMedia ? (
            <img
              src={IMAGE_PLACEHOLDER}
              alt="Media no disponible"
              className="h-full w-full object-cover"
            />
          ) : currentMedia.type === 'video' ? (
            <video
              src={currentMedia.url}
              className="h-full w-full object-cover"
              onError={handleMediaError}
            />
          ) : (
            <img
              src={currentMedia.url}
              alt={animal.name}
              className="h-full w-full object-cover"
              onError={handleMediaError}
            />
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
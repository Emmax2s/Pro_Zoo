import { useEffect, useState } from 'react';
import { Download, QrCode } from 'lucide-react';
import QRCode from 'qrcode';
import { Animal } from '../contexts/AnimalContext';
import { Button } from './ui/button';
import { useLanguage } from '../contexts/LanguageContext';

interface AnimalQrToolsProps {
  animal: Partial<Animal>;
  animalId?: string | null;
}

const buildAnimalSummary = (animal: Partial<Animal>) => {
  return [
    `Nombre: ${animal.name ?? 'No especificado'}`,
    `Especie: ${animal.species ?? 'No especificada'}`,
    `Hábitat: ${animal.habitat ?? 'No especificado'}`,
    `Conservación: ${animal.conservation ?? 'No especificado'}`,
    animal.activity ? `Actividad: ${animal.activity}` : '',
    animal.diet ? `Dieta: ${animal.diet}` : '',
    animal.lifespan ? `Esperanza de vida: ${animal.lifespan}` : '',
    animal.distribution ? `Distribución: ${animal.distribution}` : '',
    animal.description ? `Descripción: ${animal.description}` : '',
  ]
    .filter(Boolean)
    .join('\n');
};

const buildDownloadContent = (animal: Partial<Animal>) => {
  const summary = buildAnimalSummary(animal);
  const funFacts = animal.funFacts?.length ? `\nDatos curiosos: ${animal.funFacts.join('; ')}` : '';
  const threats = animal.threats?.length ? `\nAmenazas: ${animal.threats.join(', ')}` : '';

  return `${summary}${funFacts}${threats}`;
};

const sanitizeFileName = (value?: string | null) => {
  return (value || 'animal')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export function AnimalQrTools({ animal, animalId }: AnimalQrToolsProps) {
  const { language } = useLanguage();
  const stableId = (animal.id || animalId || '').trim();
  const canGenerateQr = Boolean(stableId);
  const qrTargetUrl = canGenerateQr && typeof window !== 'undefined' ? `${window.location.origin}/especie/${stableId}` : '';
  const fileName = sanitizeFileName(animal.name || animalId || 'animal');

  const qrData = qrTargetUrl || buildAnimalSummary(animal);
  const [previewQrUrl, setPreviewQrUrl] = useState<string>('');

  useEffect(() => {
    let cancelled = false;

    const createPreview = async () => {
      if (!canGenerateQr || !qrData) {
        setPreviewQrUrl('');
        return;
      }

      try {
        const dataUrl = await QRCode.toDataURL(qrData, {
          width: 220,
          margin: 1,
          errorCorrectionLevel: 'M',
        });
        if (!cancelled) {
          setPreviewQrUrl(dataUrl);
        }
      } catch {
        if (!cancelled) {
          setPreviewQrUrl('');
        }
      }
    };

    void createPreview();

    return () => {
      cancelled = true;
    };
  }, [canGenerateQr, qrData]);

  const downloadAnimalInfo = () => {
    if (!canGenerateQr) {
      return;
    }

    const blob = new Blob([buildDownloadContent(animal)], {
      type: 'text/plain;charset=utf-8',
    });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${fileName || 'animal'}-info.txt`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const downloadQr = async () => {
    if (!canGenerateQr) {
      return;
    }

    try {
      const dataUrl = await QRCode.toDataURL(qrData, {
        width: 1024,
        margin: 2,
        errorCorrectionLevel: 'H',
      });
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${fileName || 'animal'}-qr.png`;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch {
      if (qrTargetUrl) {
        window.open(qrTargetUrl, '_blank', 'noopener,noreferrer');
      }
    }
  };

  return (
    <div className="md:col-span-2 rounded-xl border-2 border-emerald-200 bg-emerald-50/70 p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2 border-b border-emerald-200 pb-2">
        <QrCode className="h-5 w-5 text-green-700" />
        <div>
          <h4 className="font-bold text-green-800">{language === 'en' ? 'QR Management' : 'Gestion de QR'}</h4>
          <p className="text-sm text-gray-600">
            {language === 'en'
              ? 'Admin tool to download this species file and QR code.'
              : 'Herramienta administrativa para descargar la ficha y el codigo QR de esta especie.'}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
        <div className="flex h-44 w-44 items-center justify-center rounded-lg border border-emerald-100 bg-white p-2 shadow-sm">
          {canGenerateQr ? (
            <img
              src={previewQrUrl}
              alt={language === 'en' ? `QR for ${animal.name ?? 'the species'}` : `QR de ${animal.name ?? 'la especie'}`}
              className="h-40 w-40"
            />
          ) : (
            <p className="px-3 text-center text-sm text-gray-500">
              {language === 'en'
                ? 'Enter at least the name and species to generate the QR code.'
                : 'Completa al menos el nombre y la especie para generar el QR.'}
            </p>
          )}
        </div>

        <div className="flex-1 space-y-3">
          {animalId && (
            <p className="text-xs text-gray-500">
              {language === 'en' ? 'Species ID:' : 'ID de la especie:'} <span className="font-mono">{animalId}</span>
            </p>
          )}
          <p className="text-sm text-gray-700">
            {language === 'en'
              ? 'Permanent QR that points to the stable URL of this species.'
              : 'QR permanente que apunta a la URL estable de esta especie.'}
          </p>
          {qrTargetUrl ? (
            <p className="break-all rounded bg-white p-2 text-xs text-gray-600">{qrTargetUrl}</p>
          ) : null}
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              className="bg-green-600 hover:bg-green-700"
              onClick={downloadAnimalInfo}
              disabled={!canGenerateQr}
            >
              <Download className="mr-2 h-4 w-4" />
              {language === 'en' ? 'Download file' : 'Descargar ficha'}
            </Button>
            <Button type="button" variant="outline" onClick={() => void downloadQr()} disabled={!canGenerateQr}>
              <QrCode className="mr-2 h-4 w-4" />
              {language === 'en' ? 'Download QR' : 'Descargar QR'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { QrCode, Download, X, Search, FileText, Check } from 'lucide-react';
import { useAnimals } from '../contexts/AnimalContext';
import { useLanguage } from '../contexts/LanguageContext';
import { AnimalQrTools } from './AnimalQrTools';
import { Button } from './ui/button';

interface QrDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function QrDownloadModal({ isOpen, onClose }: QrDownloadModalProps) {
  const { animals } = useAnimals();
  const { language, translateContent } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAnimalId, setSelectedAnimalId] = useState<string>(animals[0]?.id || '');

  if (!isOpen) return null;

  const filteredAnimals = animals.filter(
    (animal) =>
      animal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      animal.species.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedAnimal = animals.find((a) => a.id === selectedAnimalId) || animals[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-2xl bg-white p-6 shadow-2xl transition-all my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-200 pb-4 mb-4">
          <div className="flex items-center space-x-3">
            <div className="rounded-xl bg-emerald-100 p-2.5 text-emerald-800">
              <QrCode className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-emerald-950">
                {language === 'en' ? 'Download QR & Species Files' : 'Códigos QR y Fichas para Descarga'}
              </h3>
              <p className="text-sm text-stone-500">
                {language === 'en'
                  ? 'Select any species to view or download its official QR code and technical file.'
                  : 'Selecciona una especie para ver y descargar su código QR oficial o ficha informativa.'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-stone-400 hover:bg-stone-100 hover:text-stone-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 overflow-hidden flex-1 min-h-[360px]">
          {/* Species List Selection Column */}
          <div className="md:col-span-1 border-r border-stone-200 pr-4 flex flex-col h-full overflow-hidden">
            <div className="relative mb-3">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
              <input
                type="text"
                placeholder={language === 'en' ? 'Search species...' : 'Buscar especie...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-stone-300 pl-9 pr-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-1 pr-1 max-h-[300px] md:max-h-[400px]">
              {filteredAnimals.length === 0 ? (
                <p className="text-center text-xs text-stone-400 py-6">
                  {language === 'en' ? 'No species found' : 'No se encontraron especies'}
                </p>
              ) : (
                filteredAnimals.map((animal) => (
                  <button
                    key={animal.id}
                    onClick={() => setSelectedAnimalId(animal.id)}
                    className={`w-full flex items-center justify-between text-left px-3 py-2.5 rounded-lg text-sm transition-all ${
                      selectedAnimalId === animal.id
                        ? 'bg-emerald-800 text-white font-medium shadow-sm'
                        : 'hover:bg-emerald-50 text-stone-700'
                    }`}
                  >
                    <div className="truncate pr-2">
                      <div className="truncate font-semibold">{translateContent(animal.name)}</div>
                      <div className={`text-xs truncate ${selectedAnimalId === animal.id ? 'text-emerald-100' : 'text-stone-500'}`}>
                        {animal.species}
                      </div>
                    </div>
                    {selectedAnimalId === animal.id && <Check className="h-4 w-4 shrink-0 text-white" />}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* QR Tools Column */}
          <div className="md:col-span-2 flex flex-col justify-between overflow-y-auto pr-1">
            {selectedAnimal ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4 bg-emerald-50/60 p-3 rounded-xl border border-emerald-100">
                  {selectedAnimal.imageUrl && (
                    <img
                      src={selectedAnimal.imageUrl}
                      alt={translateContent(selectedAnimal.name)}
                      className="h-16 w-16 rounded-lg object-cover border border-emerald-200"
                    />
                  )}
                  <div>
                    <h4 className="text-lg font-bold text-emerald-900">{translateContent(selectedAnimal.name)}</h4>
                    <p className="text-xs text-emerald-700 italic">{selectedAnimal.species}</p>
                    <p className="text-xs text-stone-600 mt-1">📍 {translateContent(selectedAnimal.habitat)}</p>
                  </div>
                </div>

                <AnimalQrTools animal={selectedAnimal} animalId={selectedAnimal.id} />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-stone-400 py-10">
                <FileText className="h-12 w-12 mb-2 text-stone-300" />
                <p>{language === 'en' ? 'Select a species to view QR' : 'Selecciona una especie para ver el QR'}</p>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="mt-4 pt-3 border-t border-stone-200 flex justify-end">
          <Button variant="outline" onClick={onClose}>
            {language === 'en' ? 'Close' : 'Cerrar'}
          </Button>
        </div>
      </div>
    </div>
  );
}

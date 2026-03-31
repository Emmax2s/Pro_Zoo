import { X, Info, MapPin, AlertTriangle, Lightbulb, Ruler, Weight } from 'lucide-react';
import { Badge } from './ui/badge';
import { Animal } from '../contexts/AnimalContext';
import educationalPanelBg from 'figma:asset/5dae238f5bf37d694ddc8db6ba2998be0d5fc8d3.png';

interface AnimalInfoPanelProps {
  animal: Animal;
  onClose: () => void;
}

export function AnimalInfoPanel({ animal, onClose }: AnimalInfoPanelProps) {
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-gradient-to-br from-green-50 to-yellow-50 rounded-2xl overflow-hidden max-w-6xl w-full max-h-[95vh] shadow-2xl relative animate-in fade-in zoom-in duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-green-800 hover:bg-green-900 text-white rounded-full transition-colors shadow-lg"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header con imagen de fondo */}
        <div className="relative h-48 bg-gradient-to-r from-green-700 to-green-600 overflow-hidden">
          <div className="absolute inset-0 bg-black/30"></div>
          <div className="relative z-10 p-8 text-white">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-4xl font-bold mb-2 drop-shadow-lg">{animal.name}</h1>
                <p className="text-xl italic drop-shadow-md">({animal.species})</p>
              </div>
              <Badge className={`${getConservationColor(animal.conservation)} text-white text-sm px-4 py-2 shadow-md`}>
                {animal.conservation}
              </Badge>
            </div>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(95vh-12rem)] p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Columna izquierda - Imagen y características principales */}
            <div className="lg:col-span-1 space-y-4">
              <div className="rounded-xl overflow-hidden shadow-lg border-4 border-yellow-400">
                <img
                  src={animal.imageUrl}
                  alt={animal.name}
                  className="w-full h-64 object-cover"
                />
              </div>

              {/* Características principales en estilo panel educativo */}
              <div className="bg-white rounded-xl shadow-md overflow-hidden border-2 border-green-600">
                <div className="bg-gradient-to-r from-green-700 to-green-600 p-3">
                  <h3 className="text-white font-bold text-center">CARACTERÍSTICAS</h3>
                </div>
                <div className="p-4 space-y-3">
                  <div className="bg-yellow-100 rounded-lg p-3 border-l-4 border-yellow-500">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-2xl">{getActivityIcon(animal.activity)}</span>
                      <h4 className="font-semibold text-green-800">ACTIVIDAD</h4>
                    </div>
                    <p className="text-sm text-gray-700 ml-9">{animal.activity || 'No especificado'}</p>
                  </div>

                  <div className="bg-yellow-100 rounded-lg p-3 border-l-4 border-yellow-500">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-2xl">🍽️</span>
                      <h4 className="font-semibold text-green-800">ALIMENTACIÓN</h4>
                    </div>
                    <p className="text-sm text-gray-700 ml-9">{animal.diet || 'Variada'}</p>
                  </div>

                  {animal.size && (
                    <div className="bg-yellow-100 rounded-lg p-3 border-l-4 border-yellow-500">
                      <div className="flex items-center gap-2 mb-1">
                        <Ruler className="w-5 h-5 text-green-700" />
                        <h4 className="font-semibold text-green-800">TAMAÑO</h4>
                      </div>
                      <p className="text-sm text-gray-700 ml-7">{animal.size}</p>
                    </div>
                  )}

                  {animal.weight && (
                    <div className="bg-yellow-100 rounded-lg p-3 border-l-4 border-yellow-500">
                      <div className="flex items-center gap-2 mb-1">
                        <Weight className="w-5 h-5 text-green-700" />
                        <h4 className="font-semibold text-green-800">PESO</h4>
                      </div>
                      <p className="text-sm text-gray-700 ml-7">{animal.weight}</p>
                    </div>
                  )}

                  <div className="bg-yellow-100 rounded-lg p-3 border-l-4 border-yellow-500">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-2xl">⏱️</span>
                      <h4 className="font-semibold text-green-800">ESPERANZA DE VIDA</h4>
                    </div>
                    <p className="text-sm text-gray-700 ml-9">{animal.lifespan || 'No especificado'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Columna derecha - Información detallada */}
            <div className="lg:col-span-2 space-y-4">
              
              {/* Descripción */}
              <div className="bg-white rounded-xl shadow-md p-6 border-2 border-green-600">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b-2 border-yellow-400">
                  <Info className="w-6 h-6 text-green-700" />
                  <h3 className="text-xl font-bold text-green-800">SOBRE ESTA ESPECIE</h3>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  {animal.description || 'Información detallada sobre esta especie se encuentra en proceso de actualización.'}
                </p>
              </div>

              {/* Distribución */}
              {animal.distribution && (
                <div className="bg-white rounded-xl shadow-md p-6 border-2 border-green-600">
                  <div className="flex items-center gap-2 mb-4 pb-3 border-b-2 border-yellow-400">
                    <MapPin className="w-6 h-6 text-green-700" />
                    <h3 className="text-xl font-bold text-green-800">DISTRIBUCIÓN</h3>
                  </div>
                  <p className="text-gray-700">{animal.distribution}</p>
                  <div className="mt-4 p-4 bg-green-100 rounded-lg">
                    <p className="text-sm text-gray-600 italic">
                      📍 Hábitat natural: {animal.habitat}
                    </p>
                  </div>
                </div>
              )}

              {/* Importancia */}
              {animal.importance && (
                <div className="bg-white rounded-xl shadow-md p-6 border-2 border-green-600">
                  <div className="flex items-center gap-2 mb-4 pb-3 border-b-2 border-yellow-400">
                    <span className="text-2xl">⭐</span>
                    <h3 className="text-xl font-bold text-green-800">IMPORTANCIA</h3>
                  </div>
                  <p className="text-gray-700">{animal.importance}</p>
                </div>
              )}

              {/* Amenazas */}
              {animal.threats && animal.threats.length > 0 && (
                <div className="bg-white rounded-xl shadow-md p-6 border-2 border-red-400">
                  <div className="flex items-center gap-2 mb-4 pb-3 border-b-2 border-red-300">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                    <h3 className="text-xl font-bold text-red-700">AMENAZAS</h3>
                  </div>
                  <ul className="space-y-2">
                    {animal.threats.map((threat, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-red-500 mt-1">⚠️</span>
                        <span className="text-gray-700">{threat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Datos curiosos */}
              {animal.funFacts && animal.funFacts.length > 0 && (
                <div className="bg-gradient-to-br from-yellow-100 to-orange-100 rounded-xl shadow-md p-6 border-2 border-yellow-400">
                  <div className="flex items-center gap-2 mb-4 pb-3 border-b-2 border-yellow-500">
                    <Lightbulb className="w-6 h-6 text-yellow-700" />
                    <h3 className="text-xl font-bold text-yellow-800">DATOS CURIOSOS</h3>
                  </div>
                  <ul className="space-y-2">
                    {animal.funFacts.map((fact, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-yellow-600 mt-1">💡</span>
                        <span className="text-gray-700">{fact}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gradient-to-r from-green-700 to-green-600 p-4 text-center">
          <p className="text-white text-sm">
            <strong>ZOOMAT</strong> - Comprometidos con la conservación y educación sobre la vida silvestre
          </p>
        </div>
      </div>
    </div>
  );
}

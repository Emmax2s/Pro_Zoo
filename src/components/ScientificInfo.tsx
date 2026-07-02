import React from 'react';
import { ChevronRight } from 'lucide-react';

interface ScientificClassification {
  kingdom?: string;
  phylum?: string;
  class?: string;
  order?: string;
  family?: string;
  genus?: string;
  species?: string;
}

const CLASSIFICATION_LABELS: Record<string, string> = {
  kingdom: 'Reino',
  phylum: 'Filo',
  class: 'Clase',
  order: 'Orden',
  family: 'Familia',
  genus: 'Género',
  species: 'Especie',
};

const IUCN_CATEGORIES: Record<string, { label: string; color: string; bgColor: string; description: string }> = {
  EX: { label: 'Extinto', color: 'text-black', bgColor: 'bg-gray-700', description: 'Sin poblaciones vivas conocidas' },
  EW: { label: 'Extinto en Estado Silvestre', color: 'text-purple-700', bgColor: 'bg-purple-100', description: 'Solo sobrevive en cautividad' },
  CR: { label: 'En Peligro Crítico', color: 'text-red-700', bgColor: 'bg-red-100', description: 'Riesgo extremo de extinción' },
  EN: { label: 'En Peligro', color: 'text-orange-700', bgColor: 'bg-orange-100', description: 'Riesgo alto de extinción' },
  VU: { label: 'Vulnerable', color: 'text-yellow-700', bgColor: 'bg-yellow-100', description: 'Riesgo moderado de extinción' },
  NT: { label: 'Casi Amenazado', color: 'text-yellow-600', bgColor: 'bg-yellow-50', description: 'Cercano a criterios de amenaza' },
  LC: { label: 'Preocupación Menor', color: 'text-green-700', bgColor: 'bg-green-100', description: 'Bajo riesgo de extinción' },
  DD: { label: 'Datos Insuficientes', color: 'text-gray-600', bgColor: 'bg-gray-100', description: 'Información disponible limitada' },
};

interface ScientificInfoProps {
  classification?: ScientificClassification;
  conservationIucn?: string;
  ecosystemRole?: string;
}

export const ScientificInfo: React.FC<ScientificInfoProps> = ({
  classification = {},
  conservationIucn = 'DD',
  ecosystemRole,
}) => {
  const classificationEntries = Object.entries(classification).filter(([_, value]) => value);
  const iucnInfo = IUCN_CATEGORIES[conservationIucn] || IUCN_CATEGORIES.DD;

  return (
    <div className="space-y-6">
      {/* Conservation Status */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <span className="inline-block w-4 h-4 rounded-full" style={{ backgroundColor: iucnInfo.bgColor.replace('bg-', '').split('-')[0] }}></span>
          Estado de Conservación (IUCN)
        </h3>
        <div className={`${iucnInfo.bgColor} ${iucnInfo.color} rounded-lg p-4 border-l-4 border-current`}>
          <div className="font-semibold text-lg">{iucnInfo.label}</div>
          <div className="text-sm opacity-90 mt-1">{iucnInfo.description}</div>
          <div className="text-xs opacity-75 mt-2">Categoría IUCN: {conservationIucn}</div>
        </div>
      </div>

      {/* Taxonomic Classification */}
      {classificationEntries.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-800">Clasificación Taxonómica</h3>
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            {classificationEntries.map(([key, value], index) => (
              <div key={key} className="flex items-center gap-3">
                <div className="flex items-center gap-2 flex-1">
                  {index > 0 && <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />}
                  <div className="min-w-[100px]">
                    <span className="text-xs uppercase tracking-wider text-gray-500 font-semibold">
                      {CLASSIFICATION_LABELS[key] || key}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-gray-800 font-medium italic">{value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ecosystem Role */}
      {ecosystemRole && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-800">Rol en el Ecosistema</h3>
          <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500 text-gray-800">
            {ecosystemRole}
          </div>
        </div>
      )}

      {/* IUCN Scale Reference */}
      <div className="bg-gray-100 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Escala de Riesgo IUCN</h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          {Object.entries(IUCN_CATEGORIES).map(([code, info]) => (
            <div key={code} className={`${info.bgColor} ${info.color} rounded px-2 py-1 font-semibold text-center`}>
              {code}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

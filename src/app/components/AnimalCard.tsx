import { Info, MapPin, AlertCircle } from 'lucide-react';
import { Card } from './ui/card';

interface AnimalCardProps {
  name: string;
  scientificName: string;
  image: string;
  habitat: string;
  diet: string;
  status: string;
  funFact: string;
  statusColor: string;
}

export function AnimalCard({
  name,
  scientificName,
  image,
  habitat,
  diet,
  status,
  funFact,
  statusColor,
}: AnimalCardProps) {
  return (
    <Card className="overflow-hidden bg-white border border-emerald-100 shadow-sm hover:shadow-xl hover:shadow-emerald-900/5 transition-all duration-300 group">
      {/* Imagen del animal */}
      <div className="relative h-64 overflow-hidden bg-emerald-50">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out"
        />
      </div>

      {/* Contenido informativo */}
      <div className="p-6 md:p-8 space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-emerald-950 tracking-tight">{name}</h2>
          <p className="text-sm text-emerald-600 italic mt-1 font-medium">{scientificName}</p>
        </div>

        {/* Estado de conservación */}
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm ${statusColor}`}>
          <AlertCircle className="w-3.5 h-3.5" />
          <span>{status}</span>
        </div>

        <div className="space-y-4">
          {/* Hábitat */}
          <div className="flex items-start gap-3">
            <div className="bg-emerald-50 p-1.5 rounded-md mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-emerald-700/70 uppercase tracking-widest">Hábitat</p>
              <p className="text-sm text-emerald-900 mt-0.5 leading-relaxed font-medium">{habitat}</p>
            </div>
          </div>

          {/* Dieta */}
          <div className="flex items-start gap-3">
            <div className="bg-emerald-50 p-1.5 rounded-md mt-0.5">
              <Info className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-emerald-700/70 uppercase tracking-widest">Alimentación</p>
              <p className="text-sm text-emerald-900 mt-0.5 leading-relaxed font-medium">{diet}</p>
            </div>
          </div>
        </div>

        {/* Dato curioso */}
        <div className="pt-6 border-t border-emerald-100">
          <p className="text-sm text-emerald-800/80 leading-relaxed bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
            <span className="font-bold text-emerald-900 block mb-1">Sabías que... </span>
            {funFact}
          </p>
        </div>
      </div>
    </Card>
  );
}

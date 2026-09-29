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
    <Card className="overflow-hidden bg-white border-2 border-emerald-100/80 shadow-md hover:shadow-2xl hover:border-emerald-300 transition-all duration-300 group rounded-3xl flex flex-col h-full">
      {/* Imagen del animal */}
      <div className="relative h-72 overflow-hidden bg-emerald-50">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out"
        />
        <div className={`absolute top-4 right-4 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wide shadow-md ${statusColor}`}>
          <AlertCircle className="w-4 h-4" />
          <span>{status}</span>
        </div>
      </div>

      {/* Contenido informativo */}
      <div className="p-6 md:p-8 space-y-5 flex-1 flex flex-col justify-between">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-emerald-950 tracking-tight leading-snug">{name}</h2>
          <p className="text-base text-emerald-700 italic font-semibold mt-1">({scientificName})</p>
        </div>

        <div className="space-y-4 pt-2">
          {/* Hábitat */}
          <div className="flex items-start gap-3.5">
            <div className="bg-emerald-100 p-2 rounded-xl mt-0.5 text-emerald-800">
              <MapPin className="w-4 h-4 flex-shrink-0" />
            </div>
            <div>
              <p className="text-xs font-extrabold text-emerald-800 uppercase tracking-wider">Hábitat</p>
              <p className="text-base text-emerald-950 font-medium leading-snug">{habitat}</p>
            </div>
          </div>

          {/* Dieta */}
          <div className="flex items-start gap-3.5">
            <div className="bg-emerald-100 p-2 rounded-xl mt-0.5 text-emerald-800">
              <Info className="w-4 h-4 flex-shrink-0" />
            </div>
            <div>
              <p className="text-xs font-extrabold text-emerald-800 uppercase tracking-wider">Alimentación</p>
              <p className="text-base text-emerald-950 font-medium leading-snug">{diet}</p>
            </div>
          </div>
        </div>

        {/* Dato curioso */}
        <div className="pt-4 border-t border-emerald-100">
          <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200">
            <div className="flex items-center gap-2 mb-1.5 text-emerald-950 font-extrabold text-sm uppercase tracking-wide">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              <span>DATO INTERESANTE</span>
            </div>
            <p className="text-base text-emerald-950 font-medium leading-relaxed">
              {funFact}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}

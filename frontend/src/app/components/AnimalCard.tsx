import { Info, MapPin, AlertCircle, Lightbulb } from "lucide-react";
import { Card } from "./ui/card";
import { getLocalizedAnimal } from "../services/speciesTranslator";
import { Animal } from "../data/zooStore";
import { useZoo } from "../context/ZooContext";

interface AnimalCardProps {
  id?: string;
  name: string;
  nameEn?: string;
  scientificName: string;
  image: string;
  habitat: string;
  habitatEn?: string;
  diet: string;
  dietEn?: string;
  status: string;
  funFact: string;
  funFactEn?: string;
  statusColor: string;
  category?: string;
}

export function AnimalCard(props: AnimalCardProps) {
  const {
    name,
    nameEn,
    scientificName,
    image,
    habitat,
    habitatEn,
    diet,
    dietEn,
    status,
    funFact,
    funFactEn,
    statusColor,
  } = props;
  const { currentLang } = useZoo();
  const isEs = currentLang === "es";

  const loc = getLocalizedAnimal(props as unknown as Animal, isEs);
  const displayName = isEs ? name : (nameEn || loc.name);
  const displayScientificName = isEs ? scientificName : (loc.scientificName || scientificName);
  const displayHabitat = isEs ? habitat : (habitatEn || loc.habitat);
  const displayDiet = isEs ? diet : (dietEn || loc.diet);
  const displayFunFact = isEs ? funFact : (funFactEn || loc.funFact);
  const displayStatus = isEs ? status : loc.status;

  return (
    <Card className="overflow-hidden bg-white border-2 border-[#e2d5bd] shadow-lg hover:shadow-2xl hover:border-amber-600/50 transition-all duration-300 group rounded-3xl flex flex-col h-full">
      {/* Imagen del animal */}
      <div className="relative h-72 sm:h-80 overflow-hidden bg-stone-900">
        {/* Ambient backdrop */}
        <img
          src={image}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover blur-xl opacity-40 scale-110 pointer-events-none"
        />
        <img
          src={image}
          alt={displayName}
          className="relative z-10 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out"
        />
        <div
          className={`absolute top-4 right-4 z-20 inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider shadow-lg ${statusColor}`}
        >
          <AlertCircle className="w-4 h-4" />
          <span>{displayStatus}</span>
        </div>
      </div>

      {/* Contenido informativo con tipografía agrandada */}
      <div className="p-6 md:p-8 space-y-5 flex-1 flex flex-col justify-between bg-[#faf8f2]/60">
        <div>
          <h2 className="font-adventure text-2xl sm:text-3xl text-[#2b1810] tracking-wide group-hover:text-amber-800 transition-colors leading-tight">
            {displayName}
          </h2>
          <p className="text-base sm:text-lg text-amber-900 font-serif italic font-semibold mt-1">
            ({displayScientificName})
          </p>
        </div>

        <div className="space-y-4 pt-1">
          {/* Hábitat */}
          <div className="flex items-start gap-3.5">
            <div className="bg-amber-100 p-2.5 rounded-xl mt-0.5 text-amber-900 border border-amber-300">
              <MapPin className="w-5 h-5 flex-shrink-0" />
            </div>
            <div>
              <p className="text-xs font-black text-amber-900 uppercase tracking-wider">
                {isEs ? "HÁBITAT" : "HABITAT"}
              </p>
              <p className="text-base sm:text-lg text-stone-800 font-medium leading-snug">
                {displayHabitat}
              </p>
            </div>
          </div>

          {/* Dieta */}
          <div className="flex items-start gap-3.5">
            <div className="bg-amber-100 p-2.5 rounded-xl mt-0.5 text-amber-900 border border-amber-300">
              <Info className="w-5 h-5 flex-shrink-0" />
            </div>
            <div>
              <p className="text-xs font-black text-amber-900 uppercase tracking-wider">
                {isEs ? "ALIMENTACIÓN" : "DIET"}
              </p>
              <p className="text-base sm:text-lg text-stone-800 font-medium leading-snug">
                {displayDiet}
              </p>
            </div>
          </div>
        </div>

        {/* Dato curioso */}
        <div className="pt-4 border-t border-amber-900/10">
          <div className="bg-white p-4 rounded-2xl border border-amber-900/15 shadow-xs">
            <div className="flex items-center gap-2 mb-1.5 text-stone-900 font-adventure text-sm tracking-wide">
              <Lightbulb className="w-4 h-4 text-amber-600" />
              <span>{isEs ? "DATO INTERESANTE" : "INTERESTING FACT"}</span>
            </div>
            <p className="text-sm sm:text-base text-stone-700 font-medium leading-relaxed">
              {displayFunFact}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}

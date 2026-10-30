import { useState, useEffect } from "react";
import { Lock, LogIn, MapPin, Phone } from "lucide-react";
import { 
  loadStoredDocuments, 
  InstitutionalDocument 
} from "../../services/documentStore";
import { DocumentModal } from "../ui/DocumentModal";

// Humanismo Que Transforma SVG Emblem (Chiapas Gobierno 2024 - 2030)
function HumanismoGlyph({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Cyan geometric hand / wing */}
      <path
        d="M10 40L35 15L45 25L25 45L40 60L30 70L10 40Z"
        fill="#06b6d4"
      />
      {/* Magenta geometric hand / heart knot */}
      <path
        d="M90 40L65 15L55 25L75 45L60 60L70 70L90 40Z"
        fill="#e11d48"
      />
      {/* Central diamond heart embrace */}
      <path
        d="M50 28L62 40L50 52L38 40L50 28Z"
        fill="#ec4899"
      />
    </svg>
  );
}

export function Footer() {
  const [documents, setDocuments] = useState<InstitutionalDocument[]>(loadStoredDocuments());
  const [selectedDoc, setSelectedDoc] = useState<InstitutionalDocument | null>(null);

  useEffect(() => {
    const handleUpdate = () => {
      setDocuments(loadStoredDocuments());
    };
    window.addEventListener("zoomat-documents-changed", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("zoomat-documents-changed", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  const openDoc = (id: string) => {
    const doc = documents.find((d) => d.id === id);
    if (doc) {
      setSelectedDoc(doc);
    } else {
      setSelectedDoc({
        id,
        category: "institucional",
        title: id === "institucional-declara-chiapas" ? "Declara Chiapas" : "Aviso de Privacidad",
        description: "Documento oficial del Gobierno de Chiapas.",
        pdfUrl: id === "institucional-declara-chiapas" ? "https://declara.chiapas.gob.mx/" : "",
      });
    }
  };

  return (
    <>
      <footer className="bg-[#242629] text-stone-200 border-t border-stone-800 select-none">
        <div className="max-w-7xl mx-auto px-6 py-5 sm:py-6">
          <div className="flex flex-col md:flex-row items-start justify-between gap-6 sm:gap-8">
            
            {/* ── COLUMNA IZQUIERDA: LOGOTIPOS Y ENLACES INSTITUCIONALES (FOTO 2) ── */}
            <div className="space-y-3">
              <div className="flex items-center gap-3.5 sm:gap-4">
                {/* Glifo Humanismo que Transforma */}
                <div className="flex flex-col items-center">
                  <HumanismoGlyph className="w-10 h-8 sm:w-11 sm:h-9 text-emerald-400" />
                  <span className="text-[7px] font-black text-[#e11d48] tracking-widest uppercase mt-0.5 text-center leading-none">
                    HUMANISMO QUE<br />TRANSFORMA
                  </span>
                </div>

                {/* Texto Borgoña Institucional */}
                <div className="flex flex-col text-[#b82950] font-sans">
                  <span className="text-[10.5px] sm:text-[11.5px] font-black uppercase tracking-wider leading-tight">
                    Coordinación Estatal
                  </span>
                  <span className="text-[10.5px] sm:text-[11.5px] font-black uppercase tracking-wider leading-tight">
                    Para el Mejoramiento
                  </span>
                  <span className="text-[10.5px] sm:text-[11.5px] font-black uppercase tracking-wider leading-tight">
                    del ZooMAT
                  </span>
                  <span className="text-[8px] sm:text-[8.5px] font-bold text-[#b82950]/80 tracking-widest uppercase mt-0.5 leading-tight">
                    Gobierno de Chiapas
                  </span>
                  <span className="text-[7.5px] font-bold text-[#b82950]/70 tracking-widest leading-tight">
                    2024 - 2030
                  </span>
                </div>
              </div>

              {/* Enlaces con iconos (Foto 2) */}
              <div className="flex flex-wrap sm:flex-col gap-x-5 gap-y-1.5 pt-0.5">
                <button
                  onClick={() => openDoc("datos-personales-aviso-privacidad")}
                  className="flex items-center gap-2 text-xs sm:text-sm text-stone-300 hover:text-white transition-colors cursor-pointer group"
                >
                  <Lock className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
                  <span className="underline-offset-4 hover:underline">Aviso de Privacidad</span>
                </button>

                <button
                  onClick={() => openDoc("institucional-declara-chiapas")}
                  className="flex items-center gap-2 text-xs sm:text-sm text-stone-300 hover:text-white transition-colors cursor-pointer group"
                >
                  <LogIn className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
                  <span className="underline-offset-4 hover:underline">Declara Chiapas</span>
                </button>
              </div>
            </div>

            {/* ── COLUMNA DERECHA: CONTÁCTANOS (FOTO 2) ── */}
            <div className="space-y-2 md:text-right">
              <h3 className="text-white text-sm sm:text-base font-bold tracking-tight">
                Contáctanos
              </h3>

              <div className="space-y-2 text-xs sm:text-sm text-stone-300 max-w-sm md:ml-auto">
                {/* Dirección con icono de pin */}
                <div className="flex items-start md:justify-end gap-2">
                  <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 flex-shrink-0 mt-0.5 md:order-2" />
                  <span className="leading-relaxed">
                    Calzada Cerro Hueco S/N, Col. El Zapotal,<br />
                    Tuxtla Gutiérrez, Chiapas, C. P. 29094.
                  </span>
                </div>

                {/* Teléfono con icono de teléfono */}
                <div className="flex items-center md:justify-end gap-2">
                  <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 flex-shrink-0 md:order-2" />
                  <a
                    href="tel:9615438890"
                    className="hover:text-amber-300 transition-colors font-semibold"
                  >
                    Conmutador: 961 543 88 90 Ext. 1001
                  </a>
                </div>
              </div>
            </div>

          </div>
        </div>
      </footer>

      {/* Modal para ver o descargar PDFs de privacidad y Declara Chiapas */}
      <DocumentModal
        document={selectedDoc}
        onClose={() => setSelectedDoc(null)}
      />
    </>
  );
}

import { useState, useEffect } from "react";
import { Link } from "react-router";
import { ShieldCheck, ChevronRight } from "lucide-react";
import { 
  loadSexenioInfo, 
  SexenioInfo
} from "../services/documentStore";

export function EthicsCommittee() {
  const [sexenio, setSexenio] = useState<SexenioInfo>(loadSexenioInfo());

  useEffect(() => {
    const handleSexenio = () => setSexenio(loadSexenioInfo());
    window.addEventListener("zoomat-sexenio-changed", handleSexenio);

    return () => {
      window.removeEventListener("zoomat-sexenio-changed", handleSexenio);
    };
  }, []);

  return (
    <div className="bg-[#f8f9fa] min-h-screen py-6 md:py-10 font-sans text-stone-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-stone-500 uppercase tracking-wider font-semibold">
          <Link to="/" className="hover:text-[#731c34] transition-colors">Inicio</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link to="/nosotros" className="hover:text-[#731c34] transition-colors">Quienes somos</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-[#731c34]">Comité de Ética</span>
        </div>

        {/* Tarjeta de Objetivos del Comité de Ética (FOTO DEL USUARIO) */}
        <div className="bg-white rounded-2xl border border-stone-200/90 shadow-sm p-6 sm:p-10 space-y-6">
          <div className="space-y-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
              {sexenio.ethicsTitle || "Objetivos del Comité de Ética"}
            </h1>
            
            {/* Barra rosa/magenta característica de la imagen institucional */}
            <div className="w-16 h-1.5 bg-[#e08aa3] rounded-full" />
          </div>

          <div className="space-y-4 text-stone-700 text-base sm:text-[17px] leading-relaxed text-justify">
            <p>
              {sexenio.ethicsP1}
            </p>
            <p>
              {sexenio.ethicsP2}
            </p>
            <p>
              {sexenio.ethicsP3}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-stone-200/90 shadow-sm p-6 sm:p-10 space-y-5">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-stone-900">Videos del Comité de Ética</h2>
            <p className="text-sm text-stone-500 mt-1">
              {sexenio.ethicsVideos?.length
                ? "Material audiovisual institucional."
                : "Los videos institucionales se mostrarán aquí cuando sean publicados desde el panel administrativo."}
            </p>
          </div>
          {sexenio.ethicsVideos?.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {sexenio.ethicsVideos.map((video, index) => (
                <video
                  key={`${video}-${index}`}
                  src={video}
                  controls
                  playsInline
                  preload="metadata"
                  className="w-full max-w-full aspect-video rounded-xl bg-black object-contain shadow-sm"
                  aria-label={`Video del Comité de Ética ${index + 1}`}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-stone-300 bg-stone-50 px-4 py-8 text-center text-sm text-stone-500">
              No hay videos publicados todavía.
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
export default EthicsCommittee;

import { useState, useEffect } from "react";
import { Link } from "react-router";
import { 
  CheckCircle2, FileText, Download, Eye, ShieldCheck, ChevronRight 
} from "lucide-react";
import { 
  loadSexenioInfo, 
  loadStoredDocuments, 
  SexenioInfo, 
  InstitutionalDocument 
} from "../services/documentStore";
import { DocumentModal } from "../components/ui/DocumentModal";

export function EthicsCommittee() {
  const [sexenio, setSexenio] = useState<SexenioInfo>(loadSexenioInfo());
  const [documents, setDocuments] = useState<InstitutionalDocument[]>(loadStoredDocuments());
  const [selectedDoc, setSelectedDoc] = useState<InstitutionalDocument | null>(null);
  const [activeSection, setActiveSection] = useState<"todos" | "vigentes" | "protocolos" | "historico">("todos");

  useEffect(() => {
    const handleSexenio = () => setSexenio(loadSexenioInfo());
    const handleDocs = () => setDocuments(loadStoredDocuments());

    window.addEventListener("zoomat-sexenio-changed", handleSexenio);
    window.addEventListener("zoomat-documents-changed", handleDocs);

    return () => {
      window.removeEventListener("zoomat-sexenio-changed", handleSexenio);
      window.removeEventListener("zoomat-documents-changed", handleDocs);
    };
  }, []);

  const ethicsDocs = documents.filter((d) => d.category === "comite_etica");

  const filteredDocs = ethicsDocs.filter((doc) => {
    if (activeSection === "todos") return true;
    if (activeSection === "vigentes") return doc.year === "2023" || !doc.year;
    if (activeSection === "protocolos") return doc.year === "Protocolos";
    if (activeSection === "historico") return doc.year === "Archivo";
    return true;
  });

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

        {/* Sección de Documentos, Actas y Protocolos */}
        <div className="bg-white rounded-2xl border border-stone-200/90 shadow-sm p-6 sm:p-10 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-5">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight flex items-center gap-2.5">
                <ShieldCheck className="w-6 h-6 text-emerald-700" />
                <span>Normatividad, Actas y Protocolos del Comité de Ética</span>
              </h2>
              <p className="text-xs sm:text-sm text-stone-500 mt-1">
                Consulta y descarga los instrumentos normativos, actas de integración y protocolos de actuación oficial.
              </p>
            </div>

            {/* Filtros de Categoría */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 flex-shrink-0">
              {[
                { id: "todos", label: "Todos" },
                { id: "vigentes", label: "Vigentes / Actas" },
                { id: "protocolos", label: "Protocolos" },
                { id: "historico", label: "Directorio y Bases" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveSection(tab.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeSection === tab.id
                      ? "bg-[#731c34] text-white shadow-sm"
                      : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Listado de Documentos con estilo de la página oficial */}
          <div className="divide-y divide-stone-100">
            {filteredDocs.map((doc, index) => (
              <div
                key={doc.id || index}
                className="py-3.5 sm:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-stone-50/80 px-3 rounded-xl transition-colors group"
              >
                <div className="flex items-start gap-3.5 flex-1 pr-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm sm:text-base font-semibold text-stone-800 group-hover:text-[#731c34] transition-colors leading-snug">
                      {doc.title}
                    </h3>
                    {doc.description && (
                      <p className="text-xs text-stone-500 mt-0.5 line-clamp-2">
                        {doc.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-center">
                  <button
                    onClick={() => setSelectedDoc(doc)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-300 bg-white hover:bg-stone-100 text-stone-700 text-xs font-bold transition cursor-pointer shadow-2xs"
                  >
                    <Eye className="w-3.5 h-3.5 text-stone-500" />
                    <span>Ver</span>
                  </button>

                  <a
                    href={doc.pdfUrl || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    download={doc.fileName || true}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#731c34] hover:bg-[#591427] text-white text-xs font-bold transition shadow-2xs"
                  >
                    <Download className="w-3.5 h-3.5 text-amber-300" />
                    <span>Descargar</span>
                  </a>
                </div>
              </div>
            ))}
          </div>

          {filteredDocs.length === 0 && (
            <div className="text-center py-12 text-stone-500 text-sm">
              No hay documentos registrados en esta sección.
            </div>
          )}
        </div>

      </div>

      {/* Modal para visualizar documento */}
      {selectedDoc && (
        <DocumentModal
          document={selectedDoc}
          isOpen={Boolean(selectedDoc)}
          onClose={() => setSelectedDoc(null)}
        />
      )}
    </div>
  );
}
export default EthicsCommittee;

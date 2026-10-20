import { useState, useEffect } from "react";
import { Link } from "react-router";
import { 
  MapPin, Phone, Globe, ExternalLink, FileText, Download, 
  Eye, Facebook, ChevronRight, ShieldCheck, Building2, BookOpen
} from "lucide-react";
import { 
  loadSexenioInfo, 
  loadStoredDocuments, 
  SexenioInfo, 
  InstitutionalDocument,
  DEFAULT_SEXENIO_INFO 
} from "../services/documentStore";
import { DocumentModal } from "../components/ui/DocumentModal";

export function AboutUs() {
  const [sexenio, setSexenio] = useState<SexenioInfo>(loadSexenioInfo());
  const [documents, setDocuments] = useState<InstitutionalDocument[]>(loadStoredDocuments());
  const [selectedDoc, setSelectedDoc] = useState<InstitutionalDocument | null>(null);

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

  const getDoc = (id: string): InstitutionalDocument | undefined => {
    return documents.find((d) => d.id === id);
  };

  const handleDocClick = (id: string, fallbackTitle: string, fallbackUrl?: string) => {
    const found = getDoc(id);
    if (found) {
      setSelectedDoc(found);
    } else {
      setSelectedDoc({
        id,
        category: "quienes_somos",
        title: fallbackTitle,
        description: "Documento oficial de la Coordinación Estatal para el Mejoramiento del ZooMAT.",
        pdfUrl: fallbackUrl || "",
      });
    }
  };

  const organigramaDoc = getDoc("qs-organigrama-pdf");
  const codigoEticaDoc = getDoc("qs-codigo-etica-pdf");

  return (
    <div className="bg-[#f8f9fa] min-h-screen py-8 md:py-12 font-sans text-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb de navegación institucional */}
        <div className="mb-6 flex items-center gap-2 text-xs text-stone-500 uppercase tracking-wider font-semibold">
          <Link to="/" className="hover:text-[#731c34] transition-colors">Inicio</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-[#731c34]">Quienes somos</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ── COLUMNA IZQUIERDA: TITULAR, DATOS DE CONTACTO Y NORMATIVIDAD (4 COLS) ── */}
          <aside className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-2xl border border-stone-200/90 shadow-sm p-6 overflow-hidden">
              {/* Foto y Nombre del Director General */}
              <div className="text-center">
                <div className="relative inline-block mx-auto mb-4">
                  <img
                    src={sexenio.directorPhoto || "/assets/images/DirZoo.jpg"}
                    alt={sexenio.directorName}
                    className="w-48 h-56 sm:w-52 sm:h-60 object-cover object-top rounded-xl border-4 border-stone-100 shadow-md mx-auto"
                    onError={(e) => {
                      // Fallback if image fails
                      (e.target as HTMLImageElement).src = "/assets/images/DirZoo.jpg";
                    }}
                  />
                  <div className="absolute -bottom-2 -right-2 bg-[#731c34] text-white p-2 rounded-xl shadow-md">
                    <Building2 className="w-4 h-4" />
                  </div>
                </div>

                <h3 className="text-lg font-bold text-stone-900 leading-snug">
                  {sexenio.directorName}
                </h3>
                <p className="text-sm text-stone-600 font-medium mt-0.5">
                  {sexenio.directorTitle}
                </p>
              </div>

              <hr className="my-5 border-emerald-700/60 border-t-2" />

              {/* Ubicación y Contacto */}
              <div className="space-y-4 text-stone-700">
                <h4 className="text-base font-bold text-[#731c34] uppercase tracking-wide">
                  Ubicación
                </h4>
                
                <div className="flex items-start gap-3 text-sm">
                  <div className="p-2 rounded-lg bg-stone-100 text-[#731c34] flex-shrink-0 mt-0.5">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <p className="leading-relaxed text-stone-700">{sexenio.location}</p>
                </div>

                <div className="flex items-start gap-3 text-sm">
                  <div className="p-2 rounded-lg bg-stone-100 text-[#731c34] flex-shrink-0 mt-0.5">
                    <Phone className="w-4 h-4" />
                  </div>
                  <p className="leading-relaxed text-stone-700">{sexenio.phone}</p>
                </div>

                <div className="flex items-start gap-3 text-sm">
                  <div className="p-2 rounded-lg bg-stone-100 text-[#731c34] flex-shrink-0 mt-0.5">
                    <Globe className="w-4 h-4" />
                  </div>
                  <a
                    href={sexenio.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#731c34] hover:underline break-all"
                  >
                    {sexenio.website}
                  </a>
                </div>
              </div>

              <hr className="my-5 border-emerald-700/60 border-t-2" />

              {/* Redes Sociales */}
              <div className="space-y-3">
                <h4 className="text-base font-bold text-[#731c34] uppercase tracking-wide">
                  Redes Sociales
                </h4>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-50 text-blue-700 flex-shrink-0">
                    <Facebook className="w-4 h-4" />
                  </div>
                  <a
                    href={sexenio.facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-stone-700 hover:text-blue-700 font-semibold text-sm transition-colors"
                  >
                    Facebook ZooMAT Oficial
                  </a>
                </div>
              </div>

              <hr className="my-5 border-emerald-700/60 border-t-2" />

              {/* Tabla de Normatividad Institucional */}
              <div className="space-y-3">
                <h4 className="text-base font-bold text-[#731c34] uppercase tracking-wide flex items-center justify-between">
                  <span>Normatividad</span>
                  <BookOpen className="w-4 h-4 text-emerald-700" />
                </h4>

                <div className="border border-stone-200 rounded-xl overflow-hidden divide-y divide-stone-200 shadow-xs">
                  {[
                    { id: "qs-marco-normativo", label: "Marco Normativo" },
                    { id: "qs-decreto-creacion", label: "Decreto de creación" },
                    { id: "qs-reglamento-interior", label: "Reglamento interior" },
                    { id: "qs-dictamen", label: "Dictamen CEMZOOMAT" },
                    { id: "qs-manual-induccion", label: "Manual de inducción" },
                    { id: "qs-manual-organizacion", label: "Manual de organización" },
                    { id: "qs-manual-procedimientos", label: "Manual de procedimientos" },
                  ].map((norma) => {
                    const doc = getDoc(norma.id);
                    return (
                      <button
                        key={norma.id}
                        onClick={() => handleDocClick(norma.id, norma.label, doc?.pdfUrl)}
                        className="w-full text-left px-3.5 py-2.5 text-xs sm:text-sm font-medium text-stone-700 hover:bg-[#731c34] hover:text-white transition-all flex items-center justify-between group cursor-pointer"
                      >
                        <span className="truncate pr-2">{norma.label}</span>
                        {doc?.pdfUrl ? (
                          <span className="text-[10px] bg-red-100 text-red-700 group-hover:bg-white group-hover:text-[#731c34] font-bold px-1.5 py-0.5 rounded">
                            PDF
                          </span>
                        ) : (
                          <FileText className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100" />
                        )}
                      </button>
                    );
                  })}
                  <Link
                    to="/comite-de-etica"
                    className="w-full text-left px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-700 hover:text-white transition-all flex items-center justify-between group"
                  >
                    <span>Código de Ética y Conducta</span>
                    <ChevronRight className="w-4 h-4 opacity-70 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>

              <hr className="my-5 border-emerald-700/60 border-t-2" />

              {/* Enlace al Directorio Oficial de Funcionarios */}
              <div className="bg-stone-50 rounded-xl p-4 border border-stone-200">
                <h4 className="text-sm font-bold text-stone-900 mb-1">Directorio</h4>
                <p className="text-xs text-stone-600 leading-relaxed mb-3">
                  Conoce el directorio de funcionarios de la Coordinación Estatal para el Mejoramiento del ZooMAT.
                </p>
                <a
                  href={sexenio.directoryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#731c34] hover:text-stone-900 transition-colors"
                >
                  <span>Consultar Directorio en Línea</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </aside>

          {/* ── COLUMNA DERECHA: BIENVENIDOS, MISIÓN, VISIÓN, ORGANIGRAMA Y CÓDIGO (8 COLS) ── */}
          <main className="lg:col-span-8 space-y-6">
            <div className="bg-white rounded-2xl border border-stone-200/90 shadow-sm p-6 sm:p-8 space-y-8">
              
              {/* Sección Bienvenidos */}
              <section>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
                  Bienvenidos al ZooMAT
                </h2>
                <hr className="my-3 border-emerald-700/60 border-t-2 w-full" />
                <div className="space-y-4 text-stone-700 text-base leading-relaxed text-justify">
                  <p>{sexenio.welcomeP1}</p>
                  <p>{sexenio.welcomeP2}</p>
                </div>
              </section>

              {/* Sección Nuestra Misión */}
              <section>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
                  Nuestra Misión
                </h2>
                <hr className="my-3 border-emerald-700/60 border-t-2 w-full" />
                <p className="text-stone-700 text-base leading-relaxed text-justify">
                  {sexenio.mision}
                </p>
              </section>

              {/* Sección Nuestra Visión */}
              <section>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
                  Nuestra Visión
                </h2>
                <hr className="my-3 border-emerald-700/60 border-t-2 w-full" />
                <p className="text-stone-700 text-base leading-relaxed text-justify">
                  {sexenio.vision}
                </p>
              </section>

              {/* Sección Organigrama */}
              <section>
                <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight">
                  Organigrama de la Coordinación Estatal para el Mejoramiento del ZooMAT
                </h2>
                <hr className="my-3 border-emerald-700/60 border-t-2 w-full" />
                
                <div className="my-4 bg-stone-50 p-3 sm:p-4 rounded-xl border border-stone-200 text-center">
                  <img
                    src={sexenio.organigramaImage || "/assets/images/OrgZoomat_23.jpg"}
                    alt="Organigrama ZooMAT"
                    className="max-h-[500px] w-auto mx-auto object-contain rounded-lg shadow-sm border border-stone-200"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/assets/images/OrgZoomat_23.jpg";
                    }}
                  />
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    onClick={() => handleDocClick("qs-organigrama-pdf", "Organigrama Institucional ZooMAT", organigramaDoc?.pdfUrl)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#731c34] hover:bg-[#591427] text-white text-xs sm:text-sm font-bold shadow-sm transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-amber-300" />
                    <span>Descargar Organigrama (PDF {organigramaDoc?.fileSize || "115 KB"})</span>
                  </button>

                  {organigramaDoc?.pdfUrl && (
                    <button
                      onClick={() => setSelectedDoc(organigramaDoc)}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 text-xs sm:text-sm font-bold transition-all cursor-pointer"
                    >
                      <Eye className="w-4 h-4 text-stone-500" />
                      <span>Ver en línea</span>
                    </button>
                  )}
                </div>
              </section>

              {/* Sección Código de Ética */}
              <section>
                <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight">
                  Código de Ética
                </h2>
                <hr className="my-3 border-emerald-700/60 border-t-2 w-full" />
                
                <p className="text-sm text-stone-600 mb-4">
                  Consulta el Código de Ética y Conducta aplicable a las y los servidores públicos de la Coordinación Estatal para el Mejoramiento del ZooMAT.
                </p>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => handleDocClick("qs-codigo-etica-pdf", "Código de Ética y Conducta", codigoEticaDoc?.pdfUrl)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs sm:text-sm font-bold shadow-sm transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-emerald-200" />
                    <span>Descargar Código de Ética (PDF {codigoEticaDoc?.fileSize || "2.29 MB"})</span>
                  </button>

                  <Link
                    to="/comite-de-etica"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#731c34] text-[#731c34] hover:bg-[#731c34] hover:text-white text-xs sm:text-sm font-bold transition-all"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Ir a la sección Comité de Ética</span>
                  </Link>
                </div>
              </section>

            </div>
          </main>

        </div>
      </div>

      {/* Modal para visualizar o descargar cualquier documento */}
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
export default AboutUs;

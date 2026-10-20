import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router";
import { Search, ChevronDown, Menu, X, Shield, FileText, Lock } from "lucide-react";
import { 
  loadStoredDocuments, 
  InstitutionalDocument 
} from "../../services/documentStore";
import { DocumentModal } from "../ui/DocumentModal";
import logoZoomat from "../../../assets/logo-zoomat.png";
import logoChiapasGob from "../../../assets/logo-chiapas-gob.png";
import logoCoordinacionZoomat from "../../../assets/logo-coordinacion-zoomat.png";

// SVG Oficial del Glifo Escudo de Chiapas
export function ChiapasGlyph({ className = "w-7 h-7" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M50 8L20 38L32 50L50 32L68 50L80 38L50 8Z"
        fill="currentColor"
      />
      <path
        d="M50 24L30 44L40 54L50 44L60 54L70 44L50 24Z"
        fill="currentColor"
        opacity="0.9"
      />
      <path
        d="M14 44L50 80L86 44L76 34L50 60L24 34L14 44Z"
        fill="currentColor"
      />
      <path
        d="M24 54L50 80L76 54L66 44L50 60L34 44L24 54Z"
        fill="currentColor"
        opacity="0.8"
      />
      <path
        d="M50 66L38 54L50 42L62 54L50 66Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function Navigation() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [transparencyOpen, setTransparencyOpen] = useState(false);
  const [datosPersonalesOpen, setDatosPersonalesOpen] = useState(false);
  const [documents, setDocuments] = useState<InstitutionalDocument[]>(loadStoredDocuments());
  const [selectedDoc, setSelectedDoc] = useState<InstitutionalDocument | null>(null);

  const transparencyRef = useRef<HTMLDivElement>(null);
  const datosRef = useRef<HTMLDivElement>(null);

  // Sync documents with store updates
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

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (transparencyRef.current && !transparencyRef.current.contains(e.target as Node)) {
        setTransparencyOpen(false);
      }
      if (datosRef.current && !datosRef.current.contains(e.target as Node)) {
        setDatosPersonalesOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const openDocById = (id: string) => {
    const doc = documents.find((d) => d.id === id);
    if (doc) {
      setSelectedDoc(doc);
    } else {
      // Fallback
      setSelectedDoc({
        id,
        category: "transparencia",
        title: id,
        description: "Documento oficial del Gobierno de Chiapas.",
      });
    }
    setTransparencyOpen(false);
    setDatosPersonalesOpen(false);
    setMobileMenuOpen(false);
  };

  const transparencyDocs = documents.filter((d) => d.category === "transparencia");
  const datosPersonalesDocs = documents.filter((d) => d.category === "datos_personales");

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <>
      <header className="sticky top-0 z-40 select-none shadow-md">
        {/* 1. BARRA SUPERIOR INSTITUCIONAL (chiapas.gob.mx - FOTO 2) */}
        <div className="bg-[#212529] text-white border-b border-white/10 font-sans tracking-wide">
          <div className="max-w-[1650px] mx-auto px-4 sm:px-8 xl:px-12 flex items-center justify-between min-h-[52px] sm:min-h-[58px] py-2">
            {/* Izquierda: Logotipo oficial chiapas.gob.mx (Foto 2) */}
            <a
              href="https://www.chiapas.gob.mx"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center py-0.5 group"
            >
              <img
                src={logoChiapasGob}
                alt="chiapas.gob.mx"
                style={{ height: "36px" }}
                className="h-[32px] sm:h-[36px] md:h-[40px] w-auto object-contain group-hover:opacity-90 transition-opacity"
              />
            </a>

            {/* Derecha: Enlaces Rápidos del Gobierno y Búsqueda (16px estándar gubernamental) */}
            <div className="flex items-center gap-6 sm:gap-8 md:gap-10 text-stone-200">
              <a
                href="https://www.chiapas.gob.mx/tramites"
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: "16px" }}
                className="text-stone-300 hover:text-white transition-colors font-semibold hidden sm:inline"
              >
                Trámites
              </a>
              <a
                href="https://www.chiapas.gob.mx/gobierno"
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: "16px" }}
                className="text-stone-300 hover:text-white transition-colors font-semibold hidden sm:inline"
              >
                Gobierno
              </a>
              <a
                href="https://www.chiapas.gob.mx/participa"
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: "16px" }}
                className="text-stone-300 hover:text-white transition-colors font-semibold hidden md:inline"
              >
                Participa
              </a>
              <button
                onClick={() => openDocById("transparencia-portal")}
                style={{ fontSize: "16px" }}
                className="text-stone-300 hover:text-white transition-colors font-semibold cursor-pointer"
              >
                Transparencia
              </button>
              <button
                onClick={() => alert("Búsqueda institucional en línea")}
                className="p-1 hover:text-white transition-colors cursor-pointer"
                aria-label="Buscar"
              >
                <Search className="w-5 h-5 text-stone-300 hover:text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* 2. BARRA PRINCIPAL DE NAVEGACIÓN (FOTO 1 & FOTO 3) */}
        <div className="bg-white border-b border-stone-200 shadow-sm">
          <div className="max-w-[1650px] mx-auto px-4 sm:px-8 xl:px-12">
            <div className="flex items-center justify-between min-h-[105px] sm:min-h-[115px] lg:min-h-[125px] py-3 sm:py-4 gap-6">
              
              {/* IZQUIERDA: LOGOTIPO OFICIAL COORDINACIÓN ESTATAL (FOTO 3) */}
              <Link to="/" className="flex items-center flex-shrink-0 group py-1">
                <img
                  src={logoCoordinacionZoomat}
                  alt="Coordinación Estatal para el Mejoramiento del ZooMAT - Gobierno de Chiapas"
                  style={{ height: "92px" }}
                  className="h-[84px] sm:h-[92px] md:h-[100px] w-auto object-contain group-hover:scale-[1.02] transition-transform"
                />
              </Link>

              {/* CENTRO / DERECHA: ENLACES DEL MENÚ (Tamaño idéntico a Foto 1: 26px - 28px) */}
              <nav className="hidden lg:flex flex-wrap items-center justify-end gap-x-5 xl:gap-x-6 2xl:gap-x-8 gap-y-1 text-stone-900">
                <Link
                  to="/"
                  style={{ fontSize: "26px" }}
                  className={`py-1 px-2 transition-colors hover:text-[#731c34] font-bold font-adventure tracking-wide ${
                    isActive("/") && location.pathname === "/" ? "text-[#731c34]" : "text-stone-900"
                  }`}
                >
                  Inicio
                </Link>

                <button
                  onClick={() => openDocById("institucional-quienes-somos")}
                  style={{ fontSize: "26px" }}
                  className="py-1 px-2 transition-colors text-stone-900 hover:text-[#731c34] font-bold font-adventure tracking-wide cursor-pointer"
                >
                  Quienes somos
                </button>

                <button
                  onClick={() => openDocById("institucional-comite-etica")}
                  style={{ fontSize: "26px" }}
                  className="py-1 px-2 transition-colors text-stone-900 hover:text-[#731c34] font-bold font-adventure tracking-wide cursor-pointer"
                >
                  Comité de Ética
                </button>

                {/* DROPDOWN TRANSPARENCIA (FOTO 4 - 14 ELEMENTOS) */}
                <div
                  ref={transparencyRef}
                  className="relative"
                  onMouseEnter={() => setTransparencyOpen(true)}
                  onMouseLeave={() => setTransparencyOpen(false)}
                >
                  <button
                    onClick={() => setTransparencyOpen(!transparencyOpen)}
                    style={{ fontSize: "26px" }}
                    className={`flex items-center gap-1.5 py-1 px-2 transition-colors hover:text-[#731c34] font-bold font-adventure tracking-wide cursor-pointer ${
                      transparencyOpen ? "text-[#731c34]" : "text-stone-900"
                    }`}
                  >
                    <span>Transparencia</span>
                    <ChevronDown className="w-5 h-5 stroke-[2.5]" />
                  </button>

                  {transparencyOpen && (
                    <div className="absolute left-0 top-full mt-1 w-80 bg-white rounded-xl shadow-2xl border border-stone-200 py-2.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                      <div className="px-4 py-1.5 mb-1 border-b border-stone-100 flex items-center justify-between text-xs font-bold text-stone-500 uppercase tracking-wider font-sans">
                        <span>Portal de Transparencia</span>
                        <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[11px]">14</span>
                      </div>
                      <div className="max-h-[420px] overflow-y-auto divide-y divide-stone-50">
                        {transparencyDocs.map((item) => (
                          <button
                            key={item.id}
                            onClick={() => openDocById(item.id)}
                            style={{ fontSize: "15px" }}
                            className="w-full text-left px-4 py-2.5 text-stone-700 hover:bg-stone-50 hover:text-[#731c34] transition-colors flex items-center justify-between group cursor-pointer font-sans"
                          >
                            <span className="font-medium group-hover:font-semibold">{item.title}</span>
                            {item.pdfUrl ? (
                              <span className="text-[10px] bg-red-100 text-red-700 font-bold px-1.5 py-0.5 rounded">PDF</span>
                            ) : null}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* DROPDOWN DATOS PERSONALES (FOTO 3 - 2 ELEMENTOS) */}
                <div
                  ref={datosRef}
                  className="relative"
                  onMouseEnter={() => setDatosPersonalesOpen(true)}
                  onMouseLeave={() => setDatosPersonalesOpen(false)}
                >
                  <button
                    onClick={() => setDatosPersonalesOpen(!datosPersonalesOpen)}
                    style={{ fontSize: "26px" }}
                    className={`flex items-center gap-1.5 py-1 px-2 transition-colors hover:text-[#731c34] font-bold font-adventure tracking-wide cursor-pointer ${
                      datosPersonalesOpen ? "text-[#731c34]" : "text-stone-900"
                    }`}
                  >
                    <span>Datos Personales</span>
                    <ChevronDown className="w-5 h-5 stroke-[2.5]" />
                  </button>

                  {datosPersonalesOpen && (
                    <div className="absolute left-0 top-full mt-1 w-72 bg-white rounded-xl shadow-2xl border border-stone-200 py-2.5 z-50 animate-in fade-in zoom-in-95 duration-150 font-sans">
                      <div className="px-4 py-1.5 mb-1 border-b border-stone-100 text-xs font-bold text-stone-500 uppercase tracking-wider">
                        Protección de Datos
                      </div>
                      {datosPersonalesDocs.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => openDocById(item.id)}
                          style={{ fontSize: "15px" }}
                          className="w-full text-left px-4 py-2.5 text-stone-700 hover:bg-stone-50 hover:text-[#731c34] transition-colors flex items-center justify-between group cursor-pointer font-sans"
                        >
                          <span className="font-medium group-hover:font-semibold">{item.title}</span>
                          {item.pdfUrl ? (
                            <span className="text-[10px] bg-red-100 text-red-700 font-bold px-1.5 py-0.5 rounded">PDF</span>
                          ) : null}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* ENLACES RESTANTES: ANIMALES, VISITA, MAPA, CONTACTO */}
                <Link
                  to="/animales"
                  style={{ fontSize: "26px" }}
                  className={`py-1 px-2 transition-colors hover:text-[#731c34] font-bold font-adventure tracking-wide ${
                    isActive("/animales") ? "text-[#731c34]" : "text-stone-900"
                  }`}
                >
                  Animales
                </Link>

                <Link
                  to="/visita"
                  style={{ fontSize: "26px" }}
                  className={`py-1 px-2 transition-colors hover:text-[#731c34] font-bold font-adventure tracking-wide ${
                    isActive("/visita") ? "text-[#731c34]" : "text-stone-900"
                  }`}
                >
                  Visita
                </Link>

                <Link
                  to="/mapa"
                  style={{ fontSize: "26px" }}
                  className={`py-1 px-2 transition-colors hover:text-[#731c34] font-bold font-adventure tracking-wide ${
                    isActive("/mapa") ? "text-[#731c34]" : "text-stone-900"
                  }`}
                >
                  Mapa
                </Link>

                <Link
                  to="/contacto"
                  style={{ fontSize: "26px" }}
                  className={`py-1 px-2 transition-colors hover:text-[#731c34] font-bold font-adventure tracking-wide ${
                    isActive("/contacto") ? "text-[#731c34]" : "text-stone-900"
                  }`}
                >
                  Contacto
                </Link>
              </nav>

              {/* BOTÓN MÓVIL / PANTALLAS MEDIANAS */}
              <div className="lg:hidden flex items-center gap-2">
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="p-2.5 rounded-xl text-stone-800 hover:text-[#731c34] hover:bg-stone-100 transition-colors cursor-pointer"
                  aria-label="Abrir menú"
                >
                  {mobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* MENÚ MÓVIL DESPLEGABLE */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-b-2 border-[#731c34] shadow-2xl px-6 py-5 space-y-3.5 max-h-[80vh] overflow-y-auto">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-semibold text-stone-800 hover:text-[#731c34] py-1.5"
            >
              Inicio
            </Link>

            <button
              onClick={() => openDocById("institucional-quienes-somos")}
              className="block w-full text-left text-sm font-semibold text-stone-800 hover:text-[#731c34] py-1.5 cursor-pointer"
            >
              Quienes somos
            </button>

            <button
              onClick={() => openDocById("institucional-comite-etica")}
              className="block w-full text-left text-sm font-semibold text-stone-800 hover:text-[#731c34] py-1.5 cursor-pointer"
            >
              Comité de Ética
            </button>

            {/* Apartado Móvil Transparencia */}
            <div className="border-t border-stone-100 pt-2">
              <p className="text-xs font-bold text-[#731c34] uppercase tracking-wider mb-1">
                Transparencia (14 apartados)
              </p>
              <div className="pl-2 space-y-1">
                {transparencyDocs.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => openDocById(item.id)}
                    className="block w-full text-left text-xs text-stone-600 hover:text-[#731c34] py-1 cursor-pointer"
                  >
                    • {item.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Apartado Móvil Datos Personales */}
            <div className="border-t border-stone-100 pt-2">
              <p className="text-xs font-bold text-[#731c34] uppercase tracking-wider mb-1">
                Datos Personales
              </p>
              <div className="pl-2 space-y-1">
                {datosPersonalesDocs.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => openDocById(item.id)}
                    className="block w-full text-left text-xs text-stone-600 hover:text-[#731c34] py-1 cursor-pointer"
                  >
                    • {item.title}
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-stone-100 pt-2 space-y-2">
              <Link
                to="/animales"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm font-semibold text-stone-800 hover:text-[#731c34] py-1"
              >
                Animales
              </Link>
              <Link
                to="/visita"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm font-semibold text-stone-800 hover:text-[#731c34] py-1"
              >
                Visita
              </Link>
              <Link
                to="/mapa"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm font-semibold text-stone-800 hover:text-[#731c34] py-1"
              >
                Mapa
              </Link>
              <Link
                to="/contacto"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm font-semibold text-stone-800 hover:text-[#731c34] py-1"
              >
                Contacto
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Modal Institucional para Ver o Descargar Documentos PDF */}
      <DocumentModal
        document={selectedDoc}
        onClose={() => setSelectedDoc(null)}
      />
    </>
  );
}

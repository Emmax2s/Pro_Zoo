import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router";
import { Search, ChevronDown, Menu, X, Shield, FileText, Lock } from "lucide-react";
import { 
  loadStoredDocuments, 
  InstitutionalDocument 
} from "../../services/documentStore";
import { DocumentModal } from "../ui/DocumentModal";
import logoZoomat from "../../../assets/logo-zoomat.png";

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
        {/* 1. BARRA SUPERIOR INSTITUCIONAL (chiapas.gob.mx - FOTO 1) */}
        <div className="bg-[#1c1d1f] text-white border-b border-white/10 text-xs font-sans tracking-wide">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-9 sm:h-10">
            {/* Izquierda: Escudo de Chiapas y chiapas.gob.mx */}
            <a
              href="https://www.chiapas.gob.mx"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-stone-200 hover:text-white transition-colors group"
            >
              <ChiapasGlyph className="w-5 h-5 text-stone-300 group-hover:text-white transition-colors" />
              <div className="flex flex-col leading-none">
                <span className="font-extrabold text-[12px] sm:text-[13px] tracking-tight text-white">chiapas</span>
                <span className="text-[9px] sm:text-[10px] text-stone-300 font-light tracking-wide">.gob.mx</span>
              </div>
            </a>

            {/* Derecha: Enlaces Rápidos del Gobierno y Búsqueda */}
            <div className="flex items-center gap-4 sm:gap-6 text-[11px] sm:text-[12px] font-medium text-stone-300">
              <a
                href="https://www.chiapas.gob.mx/tramites"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors hidden sm:inline"
              >
                Trámites
              </a>
              <a
                href="https://www.chiapas.gob.mx/gobierno"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors hidden sm:inline"
              >
                Gobierno
              </a>
              <a
                href="https://www.chiapas.gob.mx/participa"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors hidden md:inline"
              >
                Participa
              </a>
              <button
                onClick={() => openDocById("transparencia-portal")}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Transparencia
              </button>
              <button
                onClick={() => alert("Búsqueda institucional en línea")}
                className="p-1 hover:text-white transition-colors cursor-pointer"
                aria-label="Buscar"
              >
                <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-stone-300 hover:text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* 2. BARRA PRINCIPAL DE NAVEGACIÓN (FOTO 1) */}
        <div className="bg-white border-b border-stone-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between min-h-[72px] sm:min-h-[80px] py-2 gap-3">
              
              {/* IZQUIERDA: IDENTIDAD INSTITUCIONAL GOBIERNO DE CHIAPAS / ZOOMAT */}
              <Link to="/" className="flex items-center gap-3 sm:gap-4 flex-shrink-0 group">
                <img
                  src={logoZoomat}
                  alt="ZooMAT Logo Oficial"
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-contain p-0.5 border border-stone-200 shadow-sm group-hover:scale-105 transition-transform"
                />
                <div className="flex flex-col text-[#731c34]">
                  <span className="text-[11px] sm:text-[13px] font-black uppercase tracking-wider leading-tight">
                    Coordinación Estatal
                  </span>
                  <span className="text-[11px] sm:text-[13px] font-black uppercase tracking-wider leading-tight">
                    Para el Mejoramiento
                  </span>
                  <span className="text-[11px] sm:text-[13px] font-black uppercase tracking-wider leading-tight">
                    del ZooMAT
                  </span>
                  <div className="flex items-center gap-1 mt-0.5 text-[8.5px] sm:text-[9.5px] font-bold text-[#8c2642] tracking-widest uppercase">
                    <span>Gobierno de Chiapas</span>
                    <span className="text-[7px] text-amber-700">✦</span>
                    <span>2018 - 2024</span>
                  </div>
                </div>
              </Link>

              {/* CENTRO / DERECHA: ENLACES DEL MENÚ (FOTO 1) */}
              <nav className="hidden xl:flex items-center gap-4 text-[13.5px] font-medium text-stone-800">
                <Link
                  to="/"
                  className={`py-1.5 px-2 transition-colors hover:text-[#731c34] ${
                    isActive("/") && location.pathname === "/" ? "text-[#731c34] font-bold" : ""
                  }`}
                >
                  Inicio
                </Link>

                <button
                  onClick={() => openDocById("institucional-quienes-somos")}
                  className="py-1.5 px-2 transition-colors hover:text-[#731c34] cursor-pointer"
                >
                  Quienes somos
                </button>

                <button
                  onClick={() => openDocById("institucional-comite-etica")}
                  className="py-1.5 px-2 transition-colors hover:text-[#731c34] cursor-pointer"
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
                    className={`flex items-center gap-1 py-1.5 px-2 transition-colors hover:text-[#731c34] cursor-pointer ${
                      transparencyOpen ? "text-[#731c34] font-bold" : ""
                    }`}
                  >
                    <span>Transparencia</span>
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>

                  {transparencyOpen && (
                    <div className="absolute left-0 top-full mt-1 w-64 bg-white rounded-xl shadow-2xl border border-stone-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                      <div className="px-3 py-1 mb-1 border-b border-stone-100 flex items-center justify-between text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                        <span>Portal de Transparencia</span>
                        <span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded">14</span>
                      </div>
                      <div className="max-h-[380px] overflow-y-auto divide-y divide-stone-50">
                        {transparencyDocs.map((item) => (
                          <button
                            key={item.id}
                            onClick={() => openDocById(item.id)}
                            className="w-full text-left px-3.5 py-2 text-xs text-stone-700 hover:bg-stone-50 hover:text-[#731c34] transition-colors flex items-center justify-between group cursor-pointer"
                          >
                            <span className="font-medium group-hover:font-semibold">{item.title}</span>
                            {item.pdfUrl ? (
                              <span className="text-[9px] bg-red-100 text-red-700 font-bold px-1.5 py-0.5 rounded">PDF</span>
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
                    className={`flex items-center gap-1 py-1.5 px-2 transition-colors hover:text-[#731c34] cursor-pointer ${
                      datosPersonalesOpen ? "text-[#731c34] font-bold" : ""
                    }`}
                  >
                    <span>Datos Personales</span>
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>

                  {datosPersonalesOpen && (
                    <div className="absolute left-0 top-full mt-1 w-56 bg-white rounded-xl shadow-2xl border border-stone-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                      <div className="px-3 py-1 mb-1 border-b border-stone-100 text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                        Protección de Datos
                      </div>
                      {datosPersonalesDocs.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => openDocById(item.id)}
                          className="w-full text-left px-3.5 py-2 text-xs text-stone-700 hover:bg-stone-50 hover:text-[#731c34] transition-colors flex items-center justify-between group cursor-pointer"
                        >
                          <span className="font-medium group-hover:font-semibold">{item.title}</span>
                          {item.pdfUrl ? (
                            <span className="text-[9px] bg-red-100 text-red-700 font-bold px-1.5 py-0.5 rounded">PDF</span>
                          ) : null}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* ENLACES RESTANTES: ANIMALES, VISITA, MAPA, CONTACTO */}
                <Link
                  to="/animales"
                  className={`py-1.5 px-2 transition-colors hover:text-[#731c34] ${
                    isActive("/animales") ? "text-[#731c34] font-bold" : ""
                  }`}
                >
                  Animales
                </Link>

                <Link
                  to="/visita"
                  className={`py-1.5 px-2 transition-colors hover:text-[#731c34] ${
                    isActive("/visita") ? "text-[#731c34] font-bold" : ""
                  }`}
                >
                  Visita
                </Link>

                <Link
                  to="/mapa"
                  className={`py-1.5 px-2 transition-colors hover:text-[#731c34] ${
                    isActive("/mapa") ? "text-[#731c34] font-bold" : ""
                  }`}
                >
                  Mapa
                </Link>

                <Link
                  to="/contacto"
                  className={`py-1.5 px-2 transition-colors hover:text-[#731c34] ${
                    isActive("/contacto") ? "text-[#731c34] font-bold" : ""
                  }`}
                >
                  Contacto
                </Link>
              </nav>

              {/* BOTÓN MÓVIL / PANTALLAS MEDIANAS */}
              <div className="xl:hidden flex items-center gap-2">
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="p-2 rounded-xl text-stone-800 hover:text-[#731c34] hover:bg-stone-100 transition-colors cursor-pointer"
                  aria-label="Abrir menú"
                >
                  {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* MENÚ MÓVIL DESPLEGABLE */}
        {mobileMenuOpen && (
          <div className="xl:hidden bg-white border-b-2 border-[#731c34] shadow-2xl px-5 py-4 space-y-3 max-h-[80vh] overflow-y-auto">
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

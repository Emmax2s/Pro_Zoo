import { X, FileText, Download, ExternalLink, ShieldCheck, AlertCircle } from "lucide-react";
import { InstitutionalDocument } from "../../services/documentStore";

interface DocumentModalProps {
  document: InstitutionalDocument | null;
  onClose: () => void;
}

export function DocumentModal({ document, onClose }: DocumentModalProps) {
  if (!document) return null;

  const hasPdf = Boolean(document.pdfUrl && document.pdfUrl.trim().length > 0);
  const isExternalUrl = Boolean(document.pdfUrl && /^https?:\/\//i.test(document.pdfUrl));

  const getCategoryBadge = () => {
    switch (document.category) {
      case "transparencia":
        return { text: "Obligación de Transparencia", color: "bg-emerald-100 text-emerald-900 border-emerald-300" };
      case "datos_personales":
        return { text: "Protección de Datos Personales", color: "bg-blue-100 text-blue-900 border-blue-300" };
      default:
        return { text: "Documento Institucional", color: "bg-amber-100 text-amber-900 border-amber-300" };
    }
  };

  const badge = getCategoryBadge();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-stone-200 text-stone-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header institucional */}
        <div className="bg-[#1c1c1c] text-white px-5 sm:px-6 py-4 flex items-center justify-between border-b-2 border-[#731c34]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#731c34] flex items-center justify-center text-white font-bold text-xs shadow-sm">
              ZM
            </div>
            <div>
              <p className="text-[10px] sm:text-xs text-amber-300 font-bold uppercase tracking-widest leading-none">
                Gobierno de Chiapas
              </p>
              <h3 className="text-xs sm:text-sm md:text-base font-extrabold text-white tracking-tight mt-0.5">
                Coordinación Estatal para el Mejoramiento del ZooMAT
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Info del Documento */}
        <div className="px-5 sm:px-6 py-4 bg-stone-50 border-b border-stone-200 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-[10px] sm:text-xs font-bold px-2.5 py-0.5 rounded-full border ${badge.color}`}>
                {badge.text}
              </span>
              {document.updatedAt && (
                <span className="text-[10px] sm:text-xs text-stone-500 font-medium">
                  Actualizado: {document.updatedAt}
                </span>
              )}
            </div>
            <h2 className="text-lg sm:text-xl md:text-2xl font-black text-stone-900 leading-tight">
              {document.title}
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-2xl leading-relaxed">
              {document.description}
            </p>
          </div>

          {/* Botones de acción si hay PDF */}
          {hasPdf && (
            <div className="flex items-center gap-2">
              <a
                href={document.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 bg-[#731c34] hover:bg-[#5b1528] text-white text-xs sm:text-sm font-bold px-3.5 py-2 rounded-xl shadow-md transition-all cursor-pointer"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Abrir en nueva pestaña</span>
              </a>
              <a
                href={document.pdfUrl}
                download={document.fileName || `${document.title}.pdf`}
                className="inline-flex items-center gap-1.5 bg-stone-800 hover:bg-stone-900 text-white text-xs sm:text-sm font-bold px-3 py-2 rounded-xl shadow-md transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Descargar</span>
              </a>
            </div>
          )}
        </div>

        {/* Visor de Contenido / Placeholder */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-stone-100 flex flex-col items-center justify-center min-h-[300px]">
          {hasPdf ? (
            <div className="w-full h-full min-h-[420px] flex flex-col bg-white rounded-xl shadow-inner border border-stone-300 overflow-hidden">
              {document.pdfUrl?.endsWith(".pdf") || document.pdfUrl?.includes("data:application/pdf") ? (
                <iframe
                  src={document.pdfUrl}
                  title={document.title}
                  className="w-full h-[480px] sm:h-[540px] border-0"
                />
              ) : isExternalUrl ? (
                <div className="p-8 text-center flex flex-col items-center justify-center flex-1">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-4">
                    <ExternalLink className="w-8 h-8" />
                  </div>
                  <h4 className="text-lg font-bold text-stone-900 mb-2">Portal Oficial Externo</h4>
                  <p className="text-sm text-stone-600 max-w-md mb-6 leading-relaxed">
                    Este apartado vincula directamente con el portal oficial del Gobierno del Estado de Chiapas o Plataforma Nacional de Transparencia.
                  </p>
                  <a
                    href={document.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-[#731c34] hover:bg-[#591427] text-white font-bold px-6 py-3 rounded-xl shadow-lg transition-transform hover:scale-105"
                  >
                    <span>Ir al Sitio Oficial</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              ) : (
                <iframe
                  src={document.pdfUrl}
                  title={document.title}
                  className="w-full h-[480px] sm:h-[540px] border-0"
                />
              )}
            </div>
          ) : (
            <div className="max-w-md w-full bg-white rounded-2xl p-6 sm:p-8 text-center shadow-lg border border-stone-200">
              <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8" />
              </div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-200 mb-3">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Documento Oficial</span>
              </div>
              <h4 className="text-lg sm:text-xl font-black text-stone-900 mb-2">
                Documento en Proceso de Actualización
              </h4>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed mb-6">
                La Coordinación Estatal para el Mejoramiento del ZooMAT está actualizando este apartado para dar cumplimiento a los lineamientos vigentes en materia de transparencia y rendición de cuentas.
              </p>
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-left flex items-start gap-2.5 text-xs text-stone-500">
                <AlertCircle className="w-4 h-4 text-[#731c34] flex-shrink-0 mt-0.5" />
                <span>
                  El archivo PDF correspondiente puede ser cargado por el Superadministrador desde el <strong>Panel de Control &gt; Transparencia y PDFs</strong>.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer del Modal */}
        <div className="px-5 py-3 bg-white border-t border-stone-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-stone-700 bg-stone-100 hover:bg-stone-200 font-bold text-xs sm:text-sm transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

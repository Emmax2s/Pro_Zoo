import { useState, useEffect, useRef } from "react";
import { 
  FileText, Upload, Link as LinkIcon, Trash2, Eye, Download, 
  CheckCircle2, AlertCircle, RefreshCw, Search, ShieldCheck 
} from "lucide-react";
import { 
  InstitutionalDocument, 
  loadStoredDocuments, 
  updateDocument, 
  resetToDefaults 
} from "../../services/documentStore";
import { DocumentModal } from "../../components/ui/DocumentModal";

export function AdminDocuments() {
  const [documents, setDocuments] = useState<InstitutionalDocument[]>(loadStoredDocuments());
  const [activeTab, setActiveTab] = useState<"all" | "transparencia" | "datos_personales" | "institucional">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingUrlId, setEditingUrlId] = useState<string | null>(null);
  const [tempUrl, setTempUrl] = useState("");
  const [previewDoc, setPreviewDoc] = useState<InstitutionalDocument | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  useEffect(() => {
    const handleUpdate = () => {
      setDocuments(loadStoredDocuments());
    };
    window.addEventListener("zoomat-documents-changed", handleUpdate);
    return () => window.removeEventListener("zoomat-documents-changed", handleUpdate);
  }, []);

  const showToast = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 3500);
  };

  // Handle local PDF file upload
  const handleFileUpload = async (id: string, file: File) => {
    if (!file) return;

    if (!file.type.includes("pdf") && !file.name.toLowerCase().endsWith(".pdf")) {
      alert("Por favor selecciona un archivo en formato PDF (.pdf).");
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      alert("El archivo supera el límite de 25 MB.");
      return;
    }

    setUploadingId(id);

    try {
      // Convert to base64 data URL
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = reader.result as string;
        
        let finalUrl = base64Data;

        // Attempt server upload via /api/upload
        try {
          const res = await fetch("/api/upload", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              filename: file.name,
              data: base64Data,
            }),
          });
          if (res.ok) {
            const json = await res.json();
            if (json.url) {
              finalUrl = json.url;
            }
          }
        } catch {
          // If server upload fails, base64 data is preserved in storage
        }

        const sizeInMb = (file.size / (1024 * 1024)).toFixed(2) + " MB";
        const updatedList = updateDocument(id, {
          pdfUrl: finalUrl,
          fileName: file.name,
          fileSize: sizeInMb,
        });
        setDocuments(updatedList);
        setUploadingId(null);
        showToast(`Documento PDF "${file.name}" cargado exitosamente.`);
      };

      reader.onerror = () => {
        alert("Error al leer el archivo PDF.");
        setUploadingId(null);
      };

      reader.readAsDataURL(file);
    } catch {
      alert("Ocurrió un error inesperado al procesar el archivo.");
      setUploadingId(null);
    }
  };

  // Handle external URL link
  const handleSaveUrl = (id: string) => {
    if (!tempUrl.trim()) return;
    const updatedList = updateDocument(id, {
      pdfUrl: tempUrl.trim(),
      fileName: tempUrl.split("/").pop() || "enlace-documento.pdf",
    });
    setDocuments(updatedList);
    setEditingUrlId(null);
    setTempUrl("");
    showToast("Enlace de documento guardado exitosamente.");
  };

  // Remove PDF
  const handleRemovePdf = (id: string, title: string) => {
    if (window.confirm(`¿Estás seguro de quitar el archivo PDF asignado a "${title}"?`)) {
      const updatedList = updateDocument(id, {
        pdfUrl: "",
        fileName: undefined,
        fileSize: undefined,
      });
      setDocuments(updatedList);
      showToast(`Se ha removido el PDF de "${title}".`);
    }
  };

  // Reset all
  const handleReset = () => {
    if (window.confirm("¿Restablecer todos los apartados a los valores institucionales por defecto?")) {
      const reset = resetToDefaults();
      setDocuments(reset);
      showToast("Se han restablecido los documentos por defecto.");
    }
  };

  const filteredDocuments = documents.filter((doc) => {
    const matchesTab = activeTab === "all" || doc.category === activeTab;
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          doc.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case "transparencia":
        return <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-300">Transparencia</span>;
      case "datos_personales":
        return <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-blue-300">Datos Personales</span>;
      default:
        return <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-purple-300">Institucional</span>;
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {successMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-emerald-500 flex items-center gap-3 animate-in fade-in slide-in-from-bottom duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-sm font-bold">{successMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-6">
        <div>
          <div className="flex items-center gap-2.5 text-xs font-bold text-emerald-800 uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Coordinación Estatal ZooMAT • Superadministrador</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
            Gestión de Transparencia y Documentos PDF
          </h1>
          <p className="text-sm text-stone-600 mt-1 max-w-2xl leading-relaxed">
            Asigna, sube o actualiza los archivos PDF oficiales para cada uno de los 14 apartados de <strong>Transparencia</strong>, los 2 de <strong>Datos Personales</strong> y documentos institucionales.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 text-xs sm:text-sm font-bold shadow-sm transition cursor-pointer"
            title="Restablecer documentos a los valores predeterminados"
          >
            <RefreshCw className="w-4 h-4 text-stone-500" />
            <span>Restablecer</span>
          </button>
        </div>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-stone-500 uppercase tracking-wider">Transparencia</p>
            <p className="text-2xl font-black text-emerald-800 mt-1">14 Apartados</p>
            <p className="text-xs text-stone-600 mt-0.5">
              {documents.filter((d) => d.category === "transparencia" && Boolean(d.pdfUrl)).length} con PDF asignado
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-black text-lg">
            14
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-stone-500 uppercase tracking-wider">Datos Personales</p>
            <p className="text-2xl font-black text-blue-800 mt-1">2 Apartados</p>
            <p className="text-xs text-stone-600 mt-0.5">
              {documents.filter((d) => d.category === "datos_personales" && Boolean(d.pdfUrl)).length} con PDF asignado
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center font-black text-lg">
            2
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-stone-500 uppercase tracking-wider">Institucionales</p>
            <p className="text-2xl font-black text-purple-800 mt-1">3 Apartados</p>
            <p className="text-xs text-stone-600 mt-0.5">
              {documents.filter((d) => d.category === "institucional" && Boolean(d.pdfUrl)).length} con PDF asignado
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center font-black text-lg">
            3
          </div>
        </div>
      </div>

      {/* Tabs and Search Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-3 rounded-2xl border border-stone-200 shadow-sm">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === "all"
                ? "bg-[#731c34] text-white shadow-md"
                : "text-stone-600 hover:bg-stone-100"
            }`}
          >
            Todos ({documents.length})
          </button>
          <button
            onClick={() => setActiveTab("transparencia")}
            className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === "transparencia"
                ? "bg-[#731c34] text-white shadow-md"
                : "text-stone-600 hover:bg-stone-100"
            }`}
          >
            Transparencia (14)
          </button>
          <button
            onClick={() => setActiveTab("datos_personales")}
            className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === "datos_personales"
                ? "bg-[#731c34] text-white shadow-md"
                : "text-stone-600 hover:bg-stone-100"
            }`}
          >
            Datos Personales (2)
          </button>
          <button
            onClick={() => setActiveTab("institucional")}
            className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === "institucional"
                ? "bg-[#731c34] text-white shadow-md"
                : "text-stone-600 hover:bg-stone-100"
            }`}
          >
            Institucional (3)
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar apartado..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-stone-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#731c34]/30"
          />
        </div>
      </div>

      {/* Document Items List */}
      <div className="space-y-4">
        {filteredDocuments.map((doc) => {
          const hasPdf = Boolean(doc.pdfUrl && doc.pdfUrl.trim().length > 0);
          const isUploading = uploadingId === doc.id;

          return (
            <div
              key={doc.id}
              className={`bg-white rounded-2xl border p-5 transition-all shadow-sm ${
                hasPdf ? "border-emerald-200 bg-emerald-50/15" : "border-stone-200"
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                
                {/* Info del Documento */}
                <div className="space-y-1.5 max-w-xl">
                  <div className="flex items-center gap-2">
                    {getCategoryBadge(doc.category)}
                    {hasPdf ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>PDF Asignado</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300">
                        <AlertCircle className="w-3 h-3 text-amber-600" />
                        <span>Sin PDF (En actualización)</span>
                      </span>
                    )}
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-stone-900 leading-snug">
                    {doc.title}
                  </h3>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    {doc.description}
                  </p>

                  {/* Metadata de archivo si existe */}
                  {hasPdf && (
                    <div className="pt-1 flex flex-wrap items-center gap-3 text-xs text-stone-500 font-medium">
                      <span className="flex items-center gap-1 text-emerald-800 font-semibold truncate max-w-xs">
                        <FileText className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                        {doc.fileName || "documento.pdf"}
                      </span>
                      {doc.fileSize && <span>• {doc.fileSize}</span>}
                      {doc.updatedAt && <span>• Modificado: {doc.updatedAt}</span>}
                    </div>
                  )}
                </div>

                {/* Acciones de Carga y Visualización */}
                <div className="flex flex-wrap items-center gap-2.5">
                  {/* Hidden file input */}
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    ref={(el) => { fileInputRefs.current[doc.id] = el; }}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(doc.id, file);
                    }}
                    className="hidden"
                  />

                  {/* Botón Subir PDF */}
                  <button
                    onClick={() => fileInputRefs.current[doc.id]?.click()}
                    disabled={isUploading}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    <Upload className="w-3.5 h-3.5 text-amber-400" />
                    <span>{isUploading ? "Cargando..." : hasPdf ? "Reemplazar PDF" : "Subir PDF"}</span>
                  </button>

                  {/* Botón Enlace URL */}
                  <button
                    onClick={() => {
                      if (editingUrlId === doc.id) {
                        setEditingUrlId(null);
                      } else {
                        setEditingUrlId(doc.id);
                        setTempUrl(doc.pdfUrl || "");
                      }
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 text-xs font-bold transition shadow-sm cursor-pointer"
                  >
                    <LinkIcon className="w-3.5 h-3.5 text-stone-500" />
                    <span>Enlace URL</span>
                  </button>

                  {/* Botón Previsualizar */}
                  <button
                    onClick={() => setPreviewDoc(doc)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold transition cursor-pointer"
                    title="Previsualizar cómo lo verá el visitante"
                  >
                    <Eye className="w-3.5 h-3.5 text-[#731c34]" />
                    <span>Ver</span>
                  </button>

                  {/* Botón Descargar (si tiene PDF) */}
                  {hasPdf && (
                    <a
                      href={doc.pdfUrl}
                      download={doc.fileName || `${doc.title}.pdf`}
                      className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition cursor-pointer"
                      title="Descargar archivo"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  )}

                  {/* Botón Eliminar PDF (si tiene PDF) */}
                  {hasPdf && (
                    <button
                      onClick={() => handleRemovePdf(doc.id, doc.title)}
                      className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 transition cursor-pointer"
                      title="Quitar PDF"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

              </div>

              {/* Input desplegable para URL externa */}
              {editingUrlId === doc.id && (
                <div className="mt-4 pt-3 border-t border-stone-200 flex flex-col sm:flex-row items-center gap-2">
                  <input
                    type="url"
                    value={tempUrl}
                    onChange={(e) => setTempUrl(e.target.value)}
                    placeholder="https://ejemplo.chiapas.gob.mx/documento.pdf"
                    className="flex-1 px-3.5 py-2 rounded-xl border border-stone-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#731c34]"
                  />
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <button
                      onClick={() => handleSaveUrl(doc.id)}
                      className="px-4 py-2 bg-[#731c34] hover:bg-[#5a1528] text-white text-xs font-bold rounded-xl transition cursor-pointer"
                    >
                      Guardar URL
                    </button>
                    <button
                      onClick={() => setEditingUrlId(null)}
                      className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-600 text-xs font-bold rounded-xl transition cursor-pointer"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal de Previsualización */}
      <DocumentModal
        document={previewDoc}
        onClose={() => setPreviewDoc(null)}
      />
    </div>
  );
}

import { useState, useEffect, useRef } from "react";
import { 
  FileText, Upload, Link as LinkIcon, Trash2, Eye, Download, 
  CheckCircle2, AlertCircle, RefreshCw, Search, ShieldCheck, 
  Building2, Users, Save, Image, BookOpen, HeartHandshake,
  Check, ArrowUpRight
} from "lucide-react";
import { 
  InstitutionalDocument, 
  DocumentCategory,
  loadStoredDocuments, 
  updateDocument, 
  resetToDefaults,
  loadSexenioInfo,
  saveSexenioInfo,
  resetSexenioInfo,
  SexenioInfo,
  DEFAULT_SEXENIO_INFO
} from "../../services/documentStore";
import { DocumentModal } from "../../components/ui/DocumentModal";
import { useAuth } from "../../context/AuthContext";

const API_BASE_URL = ((import.meta.env.VITE_API_BASE_URL as string | undefined) || "").replace(/\/$/, "");

export function AdminDocuments() {
  const { token } = useAuth();
  const [documents, setDocuments] = useState<InstitutionalDocument[]>(loadStoredDocuments());
  const [sexenio, setSexenio] = useState<SexenioInfo>(loadSexenioInfo());
  const [activeTab, setActiveTab] = useState<
    "transparencia" | "datos_personales" | "quienes_somos" | "comite_etica" | "sexenio_editor" | "all"
  >("transparencia");
  
  const [searchQuery, setSearchQuery] = useState("");
  const [editingUrlId, setEditingUrlId] = useState<string | null>(null);
  const [tempUrl, setTempUrl] = useState("");
  const [previewDoc, setPreviewDoc] = useState<InstitutionalDocument | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  // Form state for Sexenio editor
  const [sexenioForm, setSexenioForm] = useState<SexenioInfo>(loadSexenioInfo());
  const [isSexenioDirty, setIsSexenioDirty] = useState(false);

  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
  const photoInputRef = useRef<HTMLInputElement | null>(null);
  const organigramaImgInputRef = useRef<HTMLInputElement | null>(null);
  const bannerImgInputRef = useRef<HTMLInputElement | null>(null);
  const ethicsVideoInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const handleDocUpdate = () => setDocuments(loadStoredDocuments());
    const handleSexenioUpdate = () => {
      const current = loadSexenioInfo();
      setSexenio(current);
      setSexenioForm(current);
    };

    window.addEventListener("zoomat-documents-changed", handleDocUpdate);
    window.addEventListener("zoomat-sexenio-changed", handleSexenioUpdate);

    return () => {
      window.removeEventListener("zoomat-documents-changed", handleDocUpdate);
      window.removeEventListener("zoomat-sexenio-changed", handleSexenioUpdate);
    };
  }, []);

  const showToast = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 3500);
  };

  // Handle PDF file upload
  const handleFileUpload = async (id: string, files: FileList | null) => {
    if (!files?.length) return;
    const selectedFiles = Array.from(files);

    if (selectedFiles.length > 5) {
      alert("Puedes seleccionar un máximo de 5 archivos PDF.");
      return;
    }

    const invalidFile = selectedFiles.find((file) =>
      !file.type.includes("pdf") && !file.name.toLowerCase().endsWith(".pdf")
    );
    if (invalidFile) {
      alert(`"${invalidFile.name}" no es un archivo PDF válido.`);
      return;
    }

    const oversizedFile = selectedFiles.find((file) => file.size > 25 * 1024 * 1024);
    if (oversizedFile) {
      alert(`"${oversizedFile.name}" supera el límite de 25 MB.`);
      return;
    }

    setUploadingId(id);

    try {
      const uploadedFiles = await Promise.all(selectedFiles.map(async (file) => {
        const base64Data = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => reject(new Error(`No se pudo leer "${file.name}".`));
          reader.readAsDataURL(file);
        });
        let finalUrl = base64Data;
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
          // Keep the local data URL when the optional upload endpoint is unavailable.
        }
        return {
          url: finalUrl,
          name: file.name,
          size: (file.size / (1024 * 1024)).toFixed(2) + " MB",
        };
      }));
      const updatedList = updateDocument(id, {
        pdfUrl: uploadedFiles[0].url,
        pdfUrls: uploadedFiles.map((file) => file.url),
        fileName: uploadedFiles.map((file) => file.name).join(", "),
        fileSize: uploadedFiles.map((file) => file.size).join(", "),
      });
      setDocuments(updatedList);
      showToast(`${uploadedFiles.length} PDF(s) cargado(s) exitosamente.`);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Ocurrió un error inesperado al procesar los archivos.");
    } finally {
      setUploadingId(null);
    }
  };

  // Save manual external URL
  const handleSaveUrl = (id: string) => {
    if (!tempUrl.trim()) return;
    const updatedList = updateDocument(id, {
      pdfUrl: tempUrl.trim(),
      fileName: tempUrl.split("/").pop() || "documento.pdf",
    });
    setDocuments(updatedList);
    setEditingUrlId(null);
    setTempUrl("");
    showToast("Enlace de documento guardado exitosamente.");
  };

  const handleEthicsVideoUpload = async (files: FileList | null) => {
    if (!files?.length) return;

    const selectedFiles = Array.from(files);
    const currentVideos = sexenioForm.ethicsVideos || [];
    if (currentVideos.length + selectedFiles.length > 4) {
      alert(`El Comité de Ética permite un máximo de 4 videos. Ya hay ${currentVideos.length} registrados.`);
      return;
    }

    const invalidFile = selectedFiles.find((file) => !file.type.startsWith("video/"));
    if (invalidFile) {
      alert(`"${invalidFile.name}" no es un video válido.`);
      return;
    }

    const oversizedFile = selectedFiles.find((file) => file.size > 25 * 1024 * 1024);
    if (oversizedFile) {
      alert(`"${oversizedFile.name}" supera el límite de 25 MB.`);
      return;
    }

    try {
      const uploadResults = await Promise.allSettled(selectedFiles.map(async (file) => {
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => reject(new Error(`No se pudo leer "${file.name}".`));
          reader.readAsDataURL(file);
        });

        try {
          const response = await fetch(`${API_BASE_URL}/api/upload`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token || localStorage.getItem("pro-zoo-admin-token") || ""}`,
            },
            body: JSON.stringify({ filename: file.name, data: dataUrl }),
          });
          const result = await response.json();
          if (response.ok && result.url) return result.url as string;
          throw new Error(result.message || "No se pudo guardar el video en el servidor.");
        } catch {
          throw new Error(`No se pudo guardar "${file.name}" en el servidor.`);
        }
      }));

      const uploadedVideos = uploadResults
        .filter((result): result is PromiseFulfilledResult<string> => result.status === "fulfilled")
        .map((result) => result.value);
      const failedVideos = uploadResults.filter((result) => result.status === "rejected");

      if (uploadedVideos.length === 0) {
        throw new Error("No se pudo guardar ningún video. Verifica el tamaño y formato de los archivos.");
      }

      const updated = saveSexenioInfo({ ethicsVideos: [...currentVideos, ...uploadedVideos] });
      setSexenio(updated);
      setSexenioForm(updated);
      showToast(`${uploadedVideos.length} video(s) del Comité de Ética cargado(s) exitosamente.`);
      if (failedVideos.length > 0) {
        alert(`${failedVideos.length} video(s) no se pudieron guardar. Los demás sí fueron guardados.`);
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : "No se pudieron cargar los videos.");
    } finally {
      if (ethicsVideoInputRef.current) ethicsVideoInputRef.current.value = "";
    }
  };

  const handleRemoveEthicsVideo = (index: number) => {
    const videos = (sexenioForm.ethicsVideos || []).filter((_, videoIndex) => videoIndex !== index);
    const updated = saveSexenioInfo({ ethicsVideos: videos });
    setSexenio(updated);
    setSexenioForm(updated);
    showToast("Video removido del Comité de Ética.");
  };

  // Remove PDF from a document
  const handleRemovePdf = (id: string, title: string) => {
    if (window.confirm(`¿Estás seguro de quitar el archivo PDF asignado a "${title}"?`)) {
      const updatedList = updateDocument(id, {
        pdfUrl: "",
        pdfUrls: [],
        fileName: undefined,
        fileSize: undefined,
      });
      setDocuments(updatedList);
      showToast(`Se ha removido el PDF de "${title}".`);
    }
  };

  // Reset documents to default
  const handleResetDocs = () => {
    if (window.confirm("¿Restablecer todos los apartados a los documentos institucionales por defecto?")) {
      const reset = resetToDefaults();
      setDocuments(reset);
      showToast("Se han restablecido los documentos oficiales.");
    }
  };

  // Sexenio info form handlers
  const handleSexenioChange = (field: keyof SexenioInfo, value: string) => {
    setSexenioForm((prev) => ({ ...prev, [field]: value }));
    setIsSexenioDirty(true);
  };

  const handleSaveSexenio = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    saveSexenioInfo(sexenioForm);
    setIsSexenioDirty(false);
    showToast("Información institucional del sexenio guardada exitosamente.");
  };

  const handleResetSexenio = () => {
    if (window.confirm("¿Restablecer los textos e información institucional a los valores originales de fábrica?")) {
      const reset = resetSexenioInfo();
      setSexenioForm(reset);
      setIsSexenioDirty(false);
      showToast("Información del sexenio restablecida.");
    }
  };

  // Handle image upload for Sexenio (Director, Organigrama, Banner)
  const handleImageUpload = (field: "directorPhoto" | "organigramaImage" | "ethicsBanner", file: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Por favor selecciona una imagen válida (.jpg, .png, .webp).");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      handleSexenioChange(field, dataUrl);
      showToast(`Imagen para ${field} cargada en el formulario. Recuerda hacer clic en "Guardar Cambios".`);
    };
    reader.readAsDataURL(file);
  };

  const filteredDocuments = documents.filter((doc) => {
    if (doc.category === "comite_etica") return false;
    const matchesTab = activeTab === "all" || doc.category === activeTab;
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          doc.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const getCategoryBadge = (category: DocumentCategory) => {
    switch (category) {
      case "transparencia":
        return <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-300">Transparencia</span>;
      case "datos_personales":
        return <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-blue-300">Datos Personales</span>;
      case "quienes_somos":
        return <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-amber-300">Quienes somos</span>;
      case "comite_etica":
        return <span className="bg-pink-100 text-pink-900 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-pink-300">Comité de Ética</span>;
      default:
        return <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-purple-300">Institucional</span>;
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-8 max-w-7xl mx-auto font-sans">
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
            <span>Coordinación Estatal ZooMAT • Panel Superadministrador</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
            Gestión Institucional de Sexenio y Documentos PDF
          </h1>
          <p className="text-sm text-stone-600 mt-1 max-w-3xl leading-relaxed">
            Actualiza en tiempo real toda la información institucional y gestiona los PDFs de <strong>Transparencia</strong> y <strong>Datos Personales</strong>. El apartado de <strong>Comité de Ética</strong> se utiliza únicamente para videos.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-shrink-0">
          <button
            onClick={handleResetDocs}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 text-xs sm:text-sm font-bold shadow-xs transition cursor-pointer"
            title="Restablecer documentos a los valores predeterminados"
          >
            <RefreshCw className="w-4 h-4 text-stone-500" />
            <span>Restablecer PDFs</span>
          </button>
        </div>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <button
          onClick={() => setActiveTab("transparencia")}
          className={`p-4 rounded-2xl border text-left transition cursor-pointer ${
            activeTab === "transparencia" ? "bg-emerald-50 border-emerald-400 shadow-sm" : "bg-white border-stone-200 hover:border-stone-300"
          }`}
        >
          <p className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Transparencia</p>
          <p className="text-xl sm:text-2xl font-black text-emerald-800 mt-0.5">14 Apartados</p>
          <p className="text-xs text-stone-600 mt-0.5">
            {documents.filter((d) => d.category === "transparencia" && Boolean(d.pdfUrl)).length} con PDF activo
          </p>
        </button>

        <button
          onClick={() => setActiveTab("datos_personales")}
          className={`p-4 rounded-2xl border text-left transition cursor-pointer ${
            activeTab === "datos_personales" ? "bg-blue-50 border-blue-400 shadow-sm" : "bg-white border-stone-200 hover:border-stone-300"
          }`}
        >
          <p className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Datos Personales</p>
          <p className="text-xl sm:text-2xl font-black text-blue-800 mt-0.5">2 Apartados</p>
          <p className="text-xs text-stone-600 mt-0.5">
            {documents.filter((d) => d.category === "datos_personales" && Boolean(d.pdfUrl)).length} con PDF activo
          </p>
        </button>

        <button
          onClick={() => setActiveTab("quienes_somos")}
          className={`p-4 rounded-2xl border text-left transition cursor-pointer ${
            activeTab === "quienes_somos" ? "bg-amber-50 border-amber-400 shadow-sm" : "bg-white border-stone-200 hover:border-stone-300"
          }`}
        >
          <p className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Quienes Somos</p>
          <p className="text-xl sm:text-2xl font-black text-amber-900 mt-0.5">9 Documentos</p>
          <p className="text-xs text-stone-600 mt-0.5">
            Normatividad y Organigrama
          </p>
        </button>

        <button
          onClick={() => setActiveTab("sexenio_editor")}
          className={`p-4 rounded-2xl border text-left transition cursor-pointer ${
            activeTab === "sexenio_editor" ? "bg-pink-50 border-pink-400 shadow-sm" : "bg-white border-stone-200 hover:border-stone-300"
          }`}
        >
          <p className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Comité de Ética</p>
          <p className="text-xl sm:text-2xl font-black text-[#731c34] mt-0.5">Videos</p>
          <p className="text-xs text-stone-600 mt-0.5">
            Máximo 4 archivos
          </p>
        </button>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-2 sm:p-3 rounded-2xl border border-stone-200 shadow-sm">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setActiveTab("transparencia")}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "transparencia" ? "bg-[#731c34] text-white shadow-md" : "text-stone-600 hover:bg-stone-100"
            }`}
          >
            Transparencia (14)
          </button>
          
          <button
            onClick={() => setActiveTab("datos_personales")}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "datos_personales" ? "bg-[#731c34] text-white shadow-md" : "text-stone-600 hover:bg-stone-100"
            }`}
          >
            Datos Personales (2)
          </button>

          <button
            onClick={() => setActiveTab("quienes_somos")}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "quienes_somos" ? "bg-[#731c34] text-white shadow-md" : "text-stone-600 hover:bg-stone-100"
            }`}
          >
            Quienes Somos (PDFs)
          </button>

          <button
            onClick={() => setActiveTab("sexenio_editor")}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "sexenio_editor" ? "bg-[#731c34] text-white shadow-md" : "text-stone-600 hover:bg-stone-100"
            }`}
          >
            Comité de Ética (videos)
          </button>

          <button
            onClick={() => setActiveTab("sexenio_editor")}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === "sexenio_editor" ? "bg-emerald-800 text-white shadow-md" : "text-emerald-800 hover:bg-emerald-50 border border-emerald-300"
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Editar Información del Sexenio</span>
          </button>

          <button
            onClick={() => setActiveTab("all")}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "all" ? "bg-[#731c34] text-white shadow-md" : "text-stone-600 hover:bg-stone-100"
            }`}
          >
            Ver Todos ({documents.length})
          </button>
        </div>

        {activeTab !== "sexenio_editor" && (
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar documento..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#731c34]/20 transition"
            />
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* PESTAÑA: EDITOR DE INFORMACIÓN INSTITUCIONAL DEL SEXENIO            */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {activeTab === "sexenio_editor" ? (
        <form onSubmit={handleSaveSexenio} className="space-y-8">
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-4">
              <div>
                <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-emerald-700" />
                  <span>Datos Institucionales y Titular del Sexenio</span>
                </h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  Esta información aparece en la barra lateral y bienvenida de <strong>Quienes Somos</strong>.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleResetSexenio}
                  className="px-3 py-1.5 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-50 text-xs font-bold transition cursor-pointer"
                >
                  Valores de Fábrica
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#731c34] hover:bg-[#591427] text-white text-xs sm:text-sm font-bold shadow-md transition flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Guardar Cambios</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wide mb-1">
                  Nombre del Titular / Director General
                </label>
                <input
                  type="text"
                  value={sexenioForm.directorName}
                  onChange={(e) => handleSexenioChange("directorName", e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-stone-300 focus:ring-2 focus:ring-[#731c34]/20 focus:border-[#731c34]"
                  placeholder="Ej. MVZ. Joe Miceli Hernández"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wide mb-1">
                  Cargo / Título Institucional
                </label>
                <input
                  type="text"
                  value={sexenioForm.directorTitle}
                  onChange={(e) => handleSexenioChange("directorTitle", e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-stone-300 focus:ring-2 focus:ring-[#731c34]/20 focus:border-[#731c34]"
                  placeholder="Ej. Director General"
                />
              </div>

              {/* Foto del Titular */}
              <div className="md:col-span-2 bg-stone-50 p-4 rounded-xl border border-stone-200">
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wide mb-2">
                  Fotografía Oficial del Director General
                </label>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <img
                    src={sexenioForm.directorPhoto || "/assets/images/DirZoo.jpg"}
                    alt="Foto Director"
                    className="w-24 h-28 object-cover rounded-xl border-2 border-stone-300 shadow-xs"
                  />
                  <div className="flex-1 space-y-2 w-full">
                    <input
                      type="text"
                      value={sexenioForm.directorPhoto}
                      onChange={(e) => handleSexenioChange("directorPhoto", e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-xl border border-stone-300 bg-white"
                      placeholder="URL o ruta de la fotografía"
                    />
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        accept="image/*"
                        ref={photoInputRef}
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload("directorPhoto", file);
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => photoInputRef.current?.click()}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-800 text-white hover:bg-black text-xs font-bold transition cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Subir Foto desde la computadora</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Ubicación y Teléfono */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wide mb-1">
                  Dirección y Ubicación
                </label>
                <textarea
                  rows={2}
                  value={sexenioForm.location}
                  onChange={(e) => handleSexenioChange("location", e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-stone-300 focus:ring-2 focus:ring-[#731c34]/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wide mb-1">
                  Teléfono / Conmutador
                </label>
                <textarea
                  rows={2}
                  value={sexenioForm.phone}
                  onChange={(e) => handleSexenioChange("phone", e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-stone-300 focus:ring-2 focus:ring-[#731c34]/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wide mb-1">
                  Enlace al Directorio de Funcionarios Oficial del Estado
                </label>
                <input
                  type="text"
                  value={sexenioForm.directoryUrl}
                  onChange={(e) => handleSexenioChange("directoryUrl", e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-stone-300"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wide mb-1">
                  Página de Facebook Oficial
                </label>
                <input
                  type="text"
                  value={sexenioForm.facebookUrl}
                  onChange={(e) => handleSexenioChange("facebookUrl", e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-stone-300"
                />
              </div>
            </div>
          </div>

          {/* Bienvenida, Misión y Visión */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-sm space-y-6">
            <h2 className="text-xl font-bold text-stone-900 border-b border-stone-200 pb-3 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-emerald-700" />
              <span>Textos de Quienes Somos (Bienvenida, Misión y Visión)</span>
            </h2>

            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wide mb-1">
                  Bienvenida al ZooMAT (Párrafo 1)
                </label>
                <textarea
                  rows={3}
                  value={sexenioForm.welcomeP1}
                  onChange={(e) => handleSexenioChange("welcomeP1", e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-stone-300"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wide mb-1">
                  Bienvenida al ZooMAT (Párrafo 2)
                </label>
                <textarea
                  rows={3}
                  value={sexenioForm.welcomeP2}
                  onChange={(e) => handleSexenioChange("welcomeP2", e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-stone-300"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wide mb-1">
                  Nuestra Misión
                </label>
                <textarea
                  rows={4}
                  value={sexenioForm.mision}
                  onChange={(e) => handleSexenioChange("mision", e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-stone-300"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wide mb-1">
                  Nuestra Visión
                </label>
                <textarea
                  rows={4}
                  value={sexenioForm.vision}
                  onChange={(e) => handleSexenioChange("vision", e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-stone-300"
                />
              </div>

              {/* Imagen del Organigrama */}
              <div className="bg-stone-50 p-4 rounded-xl border border-stone-200">
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wide mb-2">
                  Imagen del Organigrama Institucional
                </label>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <img
                    src={sexenioForm.organigramaImage || "/assets/images/OrgZoomat_23.jpg"}
                    alt="Organigrama"
                    className="w-48 h-28 object-contain bg-white rounded-lg border border-stone-300 p-1"
                  />
                  <div className="flex-1 space-y-2 w-full">
                    <input
                      type="text"
                      value={sexenioForm.organigramaImage}
                      onChange={(e) => handleSexenioChange("organigramaImage", e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-xl border border-stone-300 bg-white"
                      placeholder="Ruta o URL de la imagen del organigrama"
                    />
                    <input
                      type="file"
                      accept="image/*"
                      ref={organigramaImgInputRef}
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload("organigramaImage", file);
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => organigramaImgInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-800 text-white hover:bg-black text-xs font-bold transition cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Subir Nueva Imagen del Organigrama</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Comité de Ética (Textos y Objetivos del Sexenio) */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-sm space-y-6">
            <h2 className="text-xl font-bold text-stone-900 border-b border-stone-200 pb-3 flex items-center gap-2">
              <HeartHandshake className="w-5 h-5 text-emerald-700" />
              <span>Comité de Ética: Objetivos y Texto del Sexenio (Foto Oficial)</span>
            </h2>

            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wide mb-1">
                  Título de la Sección de Objetivos
                </label>
                <input
                  type="text"
                  value={sexenioForm.ethicsTitle}
                  onChange={(e) => handleSexenioChange("ethicsTitle", e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-stone-300"
                  placeholder="Objetivos del Comité de Ética"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wide mb-1">
                  Objetivo Principal (Párrafo 1)
                </label>
                <textarea
                  rows={4}
                  value={sexenioForm.ethicsP1}
                  onChange={(e) => handleSexenioChange("ethicsP1", e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-stone-300"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wide mb-1">
                  Vigilancia del Código de Conducta (Párrafo 2)
                </label>
                <textarea
                  rows={3}
                  value={sexenioForm.ethicsP2}
                  onChange={(e) => handleSexenioChange("ethicsP2", e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-stone-300"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wide mb-1">
                  Promoción de Valores e Identidad (Párrafo 3)
                </label>
                <textarea
                  rows={3}
                  value={sexenioForm.ethicsP3}
                  onChange={(e) => handleSexenioChange("ethicsP3", e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-stone-300"
                />
              </div>

              <div className="bg-[#fff8fb] rounded-2xl border border-pink-200 p-5 sm:p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-black text-[#731c34]">Videos debajo del Código de Ética</h3>
                    <p className="text-sm text-stone-600 mt-1">
                      Sube únicamente videos, con un máximo de 4 archivos y 25 MB por archivo.
                    </p>
                  </div>
                  <div>
                    <input
                      ref={ethicsVideoInputRef}
                      type="file"
                      accept="video/*"
                      multiple
                      className="hidden"
                      onChange={(event) => handleEthicsVideoUpload(event.target.files)}
                    />
                    <button
                      type="button"
                      onClick={() => ethicsVideoInputRef.current?.click()}
                      disabled={(sexenioForm.ethicsVideos || []).length >= 4}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#731c34] hover:bg-[#591427] active:scale-95 text-white text-sm font-bold transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Upload className="w-4 h-4" />
                      Subir videos ({(sexenioForm.ethicsVideos || []).length}/4)
                    </button>
                  </div>
                </div>
                {(sexenioForm.ethicsVideos || []).length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {(sexenioForm.ethicsVideos || []).map((video, index) => (
                      <div key={`${video}-${index}`} className="relative rounded-xl overflow-hidden border border-pink-200 bg-black">
                        <video src={video} controls playsInline className="w-full aspect-video object-contain" />
                        <button
                          type="button"
                          onClick={() => handleRemoveEthicsVideo(index)}
                          className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 text-white hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white transition-colors cursor-pointer"
                          aria-label={`Quitar video ${index + 1}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>

          <div className="flex items-center justify-end gap-3 sticky bottom-4 bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-stone-200 shadow-xl">
            {isSexenioDirty && (
              <span className="text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
                Tienes cambios sin guardar
              </span>
            )}
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#731c34] hover:bg-[#591427] text-white text-sm font-bold shadow-md transition flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Toda la Información del Sexenio</span>
            </button>
          </div>
        </form>
      ) : (
        /* ─────────────────────────────────────────────────────────────────── */
        /* LISTADO Y GESTIÓN DE DOCUMENTOS PDF                                 */
        /* ─────────────────────────────────────────────────────────────────── */
        activeTab !== "comite_etica" ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {filteredDocuments.map((doc) => {
              const hasPdf = Boolean(doc.pdfUrl);
              const isUploading = uploadingId === doc.id;
              const isEditingUrl = editingUrlId === doc.id;

              return (
                <div
                  key={doc.id}
                  className="bg-white rounded-2xl border border-stone-200 shadow-xs hover:shadow-md transition-shadow p-5 sm:p-6"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Info */}
                    <div className="space-y-1.5 flex-1 pr-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        {getCategoryBadge(doc.category)}
                        {hasPdf ? (
                          <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                            <Check className="w-3 h-3" /> PDF Activo
                          </span>
                        ) : (
                          <span className="bg-amber-50 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-md">
                            Sin PDF Asignado
                          </span>
                        )}
                        {doc.updatedAt && (
                          <span className="text-[10px] text-stone-400">
                            Actualizado: {doc.updatedAt}
                          </span>
                        )}
                      </div>

                      <h3 className="text-base sm:text-lg font-bold text-stone-900 leading-snug">
                        {doc.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-stone-500 max-w-3xl leading-relaxed">
                        {doc.description}
                      </p>

                      {hasPdf && (
                        <div className="flex items-center gap-2 pt-1 text-xs text-stone-600 font-mono">
                          <FileText className="w-3.5 h-3.5 text-red-600" />
                          <span className="truncate max-w-xs sm:max-w-md font-semibold text-stone-700">
                            {doc.fileName || doc.pdfUrl}
                          </span>
                          {doc.fileSize && (
                            <span className="text-stone-400">({doc.fileSize})</span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    {doc.category !== "comite_etica" && (
                    <div className="flex flex-wrap items-center gap-2 flex-shrink-0 self-start lg:self-center">
                      {/* Hidden File Input */}
                      <input
                        type="file"
                        accept="application/pdf"
                        multiple
                        ref={(el) => { fileInputRefs.current[doc.id] = el; }}
                        className="hidden"
                        onChange={(e) => {
                          handleFileUpload(doc.id, e.target.files);
                          e.currentTarget.value = "";
                        }}
                      />

                      <button
                        type="button"
                        onClick={() => fileInputRefs.current[doc.id]?.click()}
                        disabled={isUploading}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-bold transition shadow-2xs cursor-pointer disabled:opacity-50"
                        title="Subir archivo PDF desde tu equipo"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>{isUploading ? "Cargando..." : "Subir PDF"}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (isEditingUrl) {
                            setEditingUrlId(null);
                          } else {
                            setEditingUrlId(doc.id);
                            setTempUrl(doc.pdfUrl || "");
                          }
                        }}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-stone-300 hover:bg-stone-50 text-stone-700 text-xs font-bold transition cursor-pointer"
                        title="Asignar URL externa al PDF"
                      >
                        <LinkIcon className="w-3.5 h-3.5 text-stone-500" />
                        <span>Enlace URL</span>
                      </button>

                      {hasPdf && (
                        <button
                          type="button"
                          onClick={() => setPreviewDoc(doc)}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition cursor-pointer"
                          title="Previsualizar PDF"
                        >
                          <Eye className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Ver</span>
                        </button>
                      )}

                      {hasPdf && (
                        <a
                          href={doc.pdfUrl}
                          download={doc.fileName || `${doc.id}.pdf`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-stone-300 hover:bg-stone-50 text-stone-700 text-xs font-bold transition"
                          title="Descargar archivo"
                        >
                          <Download className="w-3.5 h-3.5 text-stone-500" />
                          <span>Descargar</span>
                        </a>
                      )}

                      {hasPdf && (
                        <button
                          type="button"
                          onClick={() => handleRemovePdf(doc.id, doc.title)}
                          className="p-2 rounded-xl hover:bg-red-50 text-red-600 hover:text-red-700 transition cursor-pointer"
                          title="Quitar PDF"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    )}
                  </div>

                  {/* Formulario de URL Externa Inline */}
                  {isEditingUrl && (
                    <div className="mt-4 pt-4 border-t border-stone-100 flex flex-col sm:flex-row items-center gap-2 animate-in fade-in duration-200">
                      <input
                        type="url"
                        placeholder="https://ejemplo.chiapas.gob.mx/documento.pdf"
                        value={tempUrl}
                        onChange={(e) => setTempUrl(e.target.value)}
                        className="w-full sm:flex-1 px-3 py-1.5 text-xs sm:text-sm rounded-xl border border-stone-300 bg-stone-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#731c34]/20"
                      />
                      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                        <button
                          onClick={() => handleSaveUrl(doc.id)}
                          className="px-3.5 py-1.5 rounded-xl bg-[#731c34] text-white text-xs font-bold hover:bg-[#591427] transition cursor-pointer"
                        >
                          Guardar Enlace
                        </button>
                        <button
                          onClick={() => setEditingUrlId(null)}
                          className="px-3 py-1.5 rounded-xl border border-stone-300 text-stone-600 text-xs font-bold hover:bg-stone-50 transition cursor-pointer"
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

          {filteredDocuments.length === 0 && (
            <div className="text-center py-12 bg-white rounded-2xl border border-stone-200">
              <AlertCircle className="w-8 h-8 text-stone-400 mx-auto mb-2" />
              <p className="text-stone-600 text-sm font-semibold">
                No se encontraron documentos en esta categoría o búsqueda.
              </p>
            </div>
          )}
        </div>
        ) : null
      )}

      {/* Modal de Previsualización */}
      {previewDoc && (
        <DocumentModal
          document={previewDoc}
          isOpen={Boolean(previewDoc)}
          onClose={() => setPreviewDoc(null)}
        />
      )}
    </div>
  );
}
export default AdminDocuments;

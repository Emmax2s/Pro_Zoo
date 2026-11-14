import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Search, X, AlertTriangle, MapPin, Volume2, QrCode, Download, Hand, Crop, Sparkles, Star, Check, Upload, Video } from "lucide-react";
import QRCode from "qrcode";
import { useZoo } from "../../context/ZooContext";
import { useAuth } from "../../context/AuthContext";
import { ImageCropperModal } from "../../components/admin/ImageCropperModal";
import {
  Animal,
  ANIMAL_CATEGORIES,
  CONSERVATION_STATUSES,
  STATUS_COLORS,
} from "../../data/zooStore";
import { saveAuditLog } from "../../services/auditService";

const emptyForm: Omit<Animal, "id"> = {
  name: "",
  scientificName: "",
  category: "Mamífero",
  status: "Amenazada",
  habitat: "",
  diet: "",
  funFact: "",
  image: "",
  mediaImages: [],
  mediaVideos: [],
  lsmVideoUrl: "",
  audioUrl: "",
  enclosureId: null,
  isVisibleToPublic: true,
};

const API_BASE_URL = ((import.meta.env.VITE_API_BASE_URL as string | undefined) || '').replace(/\/$/, '');
function QrModal({ animal, onClose }: { animal: Animal; onClose: () => void }) {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const qrTargetUrl = origin ? `${origin}/especies/${animal.id}?scan=qr` : "";
  const [qrDataUrl, setQrDataUrl] = useState<string>("");

  useEffect(() => {
    if (!qrTargetUrl) return;
    QRCode.toDataURL(qrTargetUrl, { width: 340, margin: 2 })
      .then((url) => setQrDataUrl(url))
      .catch(() => setQrDataUrl(""));
  }, [qrTargetUrl]);

  const downloadQr = async () => {
    if (!qrTargetUrl) return;
    try {
      const dataUrl = await QRCode.toDataURL(qrTargetUrl, { width: 1024, margin: 2 });
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `QR-ZooMAT-${animal.name.replace(/\s+/g, "_")}.png`;
      link.click();
    } catch (err) {
      console.error("Failed to download QR", err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg p-7 text-center border-4 border-amber-900/20"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 transition-colors"
        >
          <X size={20} />
        </button>

        <div className="flex items-center justify-center gap-2 text-stone-900 font-adventure text-2xl mb-1">
          <QrCode className="w-7 h-7 text-amber-700" />
          <span>Código QR del Exhibidor ZooMAT</span>
        </div>
        <p className="text-sm text-stone-600 mb-2">
          Placa interactiva y audioguía para el recinto de <strong className="text-amber-950 font-bold">{animal.name}</strong>
        </p>
        <p className="text-xs text-emerald-800 font-semibold mb-4 bg-emerald-50 py-1.5 px-3 rounded-xl border border-emerald-200 inline-block">
           Modo Automático: Detecta el idioma del teléfono del visitante (Español o Inglés) y reproduce el audio
        </p>

        <div className="bg-[#fcfaf5] border-2 border-amber-900/20 rounded-3xl p-5 inline-block mb-4 shadow-sm">
          {qrDataUrl ? (
            <img src={qrDataUrl} alt={`QR ${animal.name}`} className="w-60 h-60 mx-auto rounded-xl shadow-xs" />
          ) : (
            <div className="w-60 h-60 flex items-center justify-center text-stone-400 text-sm">Generando QR...</div>
          )}
        </div>

        <p className="text-xs text-amber-950 font-mono bg-amber-50 border border-amber-200 p-2.5 rounded-xl break-all mb-5">
          {qrTargetUrl}
        </p>

        <button
          onClick={downloadQr}
          className="w-full wood-texture-bg text-amber-200 hover:text-white font-adventure text-base py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg border-2 border-amber-600 hover:scale-102 transition-all wood-button-shadow cursor-pointer"
        >
          <Download size={20} className="text-amber-300" />
          <span>Descargar Imagen QR de Alta Resolución (PNG)</span>
        </button>
      </div>
    </div>
  );
}

function AnimalModal({
  animal,
  onSave,
  onClose,
}: {
  animal: Omit<Animal, "id"> | Animal;
  onSave: (data: Omit<Animal, "id">) => void;
  onClose: () => void;
}) {
  const { enclosures, currentUser } = useZoo();
  const [form, setForm] = useState<Omit<Animal, "id">>({
    name: animal.name,
    scientificName: animal.scientificName,
    category: animal.category,
    status: animal.status,
    habitat: animal.habitat,
    diet: animal.diet,
    funFact: animal.funFact,
    image: animal.image,
    mediaImages: animal.mediaImages?.slice(0, 4) || (animal.image ? [animal.image] : []),
    mediaVideos: animal.mediaVideos?.slice(0, 2) || [],
    lsmVideoUrl: animal.lsmVideoUrl || "",
    audioUrl: animal.audioUrl || "",
    enclosureId: animal.enclosureId,
    isVisibleToPublic: animal.isVisibleToPublic !== false,
  });
  const [videoUrl, setVideoUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [lsmVideoUrl, setLsmVideoUrl] = useState(animal.lsmVideoUrl || "");
  const [cropperState, setCropperState] = useState<{
    open: boolean;
    imageUrl: string;
    imageIndex?: number;
  }>({ open: false, imageUrl: "" });

  // ── Estado de validación: campos tocados y errores ──
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [showAllErrors, setShowAllErrors] = useState(false);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);

  // Campos obligatorios con sus mensajes
  const requiredFields: { key: keyof typeof form; label: string }[] = [
    { key: "name", label: "Nombre Común" },
    { key: "scientificName", label: "Nombre Científico" },
    { key: "habitat", label: "Hábitat" },
    { key: "diet", label: "Dieta" },
    { key: "funFact", label: "Datos Curiosos" },
  ];

  function getFieldError(fieldKey: string): string | null {
    const val = form[fieldKey as keyof typeof form];
    if (typeof val === "string" && !val.trim()) {
      return "Favor de llenar este campo";
    }
    return null;
  }

  function shouldShowError(fieldKey: string): boolean {
    return (showAllErrors || touched[fieldKey] === true) && getFieldError(fieldKey) !== null;
  }

  // Detectar si el formulario tiene cambios sin guardar
  function hasUnsavedChanges(): boolean {
    return (
      form.name !== animal.name ||
      form.scientificName !== animal.scientificName ||
      form.habitat !== animal.habitat ||
      form.diet !== animal.diet ||
      form.funFact !== animal.funFact ||
      form.category !== animal.category ||
      form.status !== animal.status ||
      form.image !== animal.image ||
      form.audioUrl !== (animal.audioUrl || "") ||
      form.enclosureId !== animal.enclosureId ||
      form.lsmVideoUrl !== (animal.lsmVideoUrl || "") ||
      JSON.stringify(form.mediaImages) !== JSON.stringify(animal.mediaImages?.slice(0, 4) || (animal.image ? [animal.image] : [])) ||
      JSON.stringify(form.mediaVideos) !== JSON.stringify(animal.mediaVideos?.slice(0, 2) || [])
    );
  }

  // Manejo de cierre con validación de cambios sin guardar
  function handleClose() {
    if (hasUnsavedChanges()) {
      setShowUnsavedDialog(true);
    } else {
      onClose();
    }
  }

  function handleBlur(fieldKey: string) {
    setTouched((prev) => ({ ...prev, [fieldKey]: true }));
  }

  async function handleSaveCroppedImage(croppedDataUrl: string) {
    let finalUrl = croppedDataUrl;
    try {
      const token = sessionStorage.getItem("pro-zoo-admin-token") || "";
      const res = await fetch(`${API_BASE_URL || ""}/api/upload`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({
          filename: `encuadre-${(form.name || "especie").replace(/\s+/g, "_")}-${Date.now()}.jpg`,
          data: croppedDataUrl,
        }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json?.url) finalUrl = json.url;
      }
    } catch (e) {
      console.warn("Upload fallback to dataUrl", e);
    }

    setForm((prev) => {
      const newMedia = [...prev.mediaImages];
      if (cropperState.imageIndex !== undefined && cropperState.imageIndex >= 0 && cropperState.imageIndex < newMedia.length) {
        newMedia[cropperState.imageIndex] = finalUrl;
      } else if (!newMedia.includes(finalUrl)) {
        newMedia.unshift(finalUrl);
      }
      return {
        ...prev,
        image: finalUrl,
        mediaImages: newMedia.slice(0, 4),
      };
    });
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const dataURL = reader.result as string;
      try {
        const res = await fetch(`${API_BASE_URL}/api/upload`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: "Bearer " + (sessionStorage.getItem("pro-zoo-admin-token") || ""),
          },
          body: JSON.stringify({ filename: file.name, data: dataURL }),
        });
        const json = await res.json();
        if (!res.ok) {
          window.alert(json.message || "No se pudo subir la imagen.");
          return;
        }

        setForm((p) => ({ ...p, image: json.url }));
      } catch (err) {
        console.error('Upload failed', err);
      }
    };
    reader.readAsDataURL(file);
  }

  const isEditing = "id" in animal;

  async function uploadMediaFiles(files: FileList | null, kind: "image" | "video" | "lsm") {
    if (!files?.length) return;
    const selected = Array.from(files);
    const current =
      kind === "image"
        ? form.mediaImages
        : kind === "video"
        ? form.mediaVideos
        : form.lsmVideoUrl
        ? [form.lsmVideoUrl]
        : [];
    const limit = kind === "image" ? 4 : kind === "video" ? 2 : 1;
    if (current.length + selected.length > limit) {
      window.alert(`Puedes registrar máximo ${limit} ${kind === "image" ? "imágenes" : "videos"}.`);
      return;
    }
    try {
      const urls: string[] = [];
      for (const file of selected) {
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const fileReader = new FileReader();
          fileReader.onload = () => resolve(String(fileReader.result));
          fileReader.onerror = () => reject(new Error("No se pudo leer el archivo."));
          fileReader.readAsDataURL(file);
        });
        const response = await fetch(`${API_BASE_URL}/api/upload`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + (sessionStorage.getItem("pro-zoo-admin-token") || ""),
          },
          body: JSON.stringify({ filename: file.name, data: dataUrl }),
        });
        const result = await response.json().catch(() => ({}));
        if (!response.ok || typeof result.url !== "string") {
          throw new Error(result.message || "No se pudo subir el archivo.");
        }
        urls.push(result.url);
      }
      setForm((previous) => ({
        ...previous,
        ...(kind === "image"
          ? { mediaImages: [...previous.mediaImages, ...urls].slice(0, 4), image: previous.image || urls[0] }
          : kind === "video"
          ? { mediaVideos: [...previous.mediaVideos, ...urls].slice(0, 2) }
          : { lsmVideoUrl: urls[0] }),
      }));

      // Abrir el ajustador de encuadre para centrar la imagen recién agregada
      if (kind === "image" && urls.length > 0) {
        setCropperState({
          open: true,
          imageUrl: urls[0],
          imageIndex: form.mediaImages.length,
        });
      }
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "No se pudo subir el archivo.");
    }
  }

  async function uploadAudioFile(file: File | undefined) {
    if (!file) return;
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const fileReader = new FileReader();
        fileReader.onload = () => resolve(String(fileReader.result));
        fileReader.onerror = () => reject(new Error("No se pudo leer el archivo."));
        fileReader.readAsDataURL(file);
      });
      const response = await fetch(`${API_BASE_URL}/api/upload`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + (sessionStorage.getItem("pro-zoo-admin-token") || ""),
        },
        body: JSON.stringify({ filename: file.name, data: dataUrl }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || typeof result.url !== "string") {
        throw new Error(result.message || "No se pudo subir el audio.");
      }
      setForm((previous) => ({ ...previous, audioUrl: result.url }));
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "No se pudo subir el audio.");
    }
  }

  function addImageUrl() {
    const url = imageUrl.trim();
    if (!url || form.mediaImages.length >= 4) return;
    if (!/^https?:\/\/\S+$/i.test(url)) {
      window.alert("Ingresa una URL válida para la imagen.");
      return;
    }

    setForm((previous) => ({
      ...previous,
      mediaImages: [...previous.mediaImages, url].slice(0, 4),
      image: previous.image || url,
    }));
    setImageUrl("");
  }

  function addVideoUrl() {
    const url = videoUrl.trim();
    if (!url || form.mediaVideos.length >= 2) return;
    if (!/^https?:\/\/\S+$/i.test(url)) {
      window.alert("Ingresa una URL válida para el video.");
      return;
    }

    setForm((previous) => ({ ...previous, mediaVideos: [...previous.mediaVideos, url] }));
    setVideoUrl("");
  }

  function addLsmVideoUrl() {
    const url = lsmVideoUrl.trim();
    if (!url || !/^https?:\/\/\S+$/i.test(url)) {
      window.alert("Ingresa una URL válida para el video LSM.");
      return;
    }
    setForm((previous) => ({ ...previous, lsmVideoUrl: url }));
  }

  function handle(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value === "" ? "" : value }));
    setTouched((prev) => ({ ...prev, [name]: true }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Validar todos los campos obligatorios
    const hasErrors = requiredFields.some(({ key }) => getFieldError(key as string) !== null);
    if (hasErrors) {
      setShowAllErrors(true);
      return;
    }

    const userEnclosureIds = currentUser.enclosureIds && currentUser.enclosureIds.length > 0
      ? currentUser.enclosureIds
      : currentUser.enclosureId
      ? currentUser.enclosureId.split(",").map((s) => s.trim()).filter(Boolean)
      : [];

    const saved = currentUser.role === "enclosure_admin"
      ? {
          ...form,
          enclosureId: userEnclosureIds.includes(String(form.enclosureId))
            ? form.enclosureId
            : userEnclosureIds[0] || null,
          isVisibleToPublic: animal.isVisibleToPublic !== false,
        }
      : form;
    onSave(saved);
  }

  const userEnclosureIds = currentUser.enclosureIds && currentUser.enclosureIds.length > 0
    ? currentUser.enclosureIds
    : currentUser.enclosureId
    ? currentUser.enclosureId.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  const availableEnclosures = currentUser.role === "enclosure_admin"
    ? enclosures.filter((e) => userEnclosureIds.includes(e.id))
    : enclosures;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={handleClose}>
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white z-10 shadow-xs">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {isEditing ? "Editar Especie" : "Nueva Especie"}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {isEditing ? "Modifica los datos y recursos multimedia de la especie" : "Completa la ficha técnica para registrar un nuevo ejemplar"}
            </p>
          </div>
          <button onClick={handleClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Columna Izquierda: Información de la Especie (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Nombre Común <span className="text-red-500">*</span>
                </label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handle}
                  onBlur={() => handleBlur("name")}
                  placeholder="Nombre común de la especie"
                  className={`w-full px-3.5 py-2.5 border rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm ${shouldShowError("name") ? "border-red-400 bg-red-50" : "border-gray-200"}`}
                />
                {shouldShowError("name") && (
                  <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Por favor, rellena este campo
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Nombre Científico
                </label>
                <input
                  name="scientificName"
                  value={form.scientificName}
                  onChange={handle}
                  onBlur={() => handleBlur("scientificName")}
                  placeholder="ej. Panthera onca"
                  className={`w-full px-3.5 py-2.5 border rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 italic text-sm ${shouldShowError("scientificName") ? "border-red-400 bg-red-50" : "border-gray-200"}`}
                />
                {shouldShowError("scientificName") && (
                  <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Por favor, rellena este campo
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Categoría</label>
                  <select
                    name="category"
                    value={form.category}
                    onChange={handle}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-sm"
                  >
                    {ANIMAL_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Estado de Conservación</label>
                  <select
                    name="status"
                    value={form.status}
                    onChange={handle}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-sm"
                  >
                    {CONSERVATION_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Recinto */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  <MapPin className="inline w-3.5 h-3.5 mr-1 text-emerald-700" />
                  Recinto
                </label>
                {currentUser.role === "enclosure_admin" ? (
                  <select
                    name="enclosureId"
                    value={form.enclosureId ?? ""}
                    onChange={handle}
                    required
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-sm"
                  >
                    {availableEnclosures.map((enc) => (
                      <option key={enc.id} value={enc.id}>
                        {enc.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <select
                    name="enclosureId"
                    value={form.enclosureId ?? ""}
                    onChange={handle}
                    disabled={currentUser.role !== "superadmin"}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-sm"
                  >
                    <option value="">Sin recinto asignado</option>
                    {enclosures.map((enc) => (
                      <option key={enc.id} value={enc.id}>
                        {enc.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Hábitat</label>
                  <input
                    name="habitat"
                    value={form.habitat}
                    onChange={handle}
                    onBlur={() => handleBlur("habitat")}
                    placeholder="ej. Selvas tropicales de Chiapas"
                    className={`w-full px-3.5 py-2.5 border rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm ${shouldShowError("habitat") ? "border-red-400 bg-red-50" : "border-gray-200"}`}
                  />
                  {shouldShowError("habitat") && (
                    <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Por favor, rellena este campo
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Dieta</label>
                  <input
                    name="diet"
                    value={form.diet}
                    onChange={handle}
                    onBlur={() => handleBlur("diet")}
                    placeholder="ej. Carnívoro: pecaríes, venados..."
                    className={`w-full px-3.5 py-2.5 border rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm ${shouldShowError("diet") ? "border-red-400 bg-red-50" : "border-gray-200"}`}
                  />
                  {shouldShowError("diet") && (
                    <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Por favor, rellena este campo
                    </p>
                  )}
                </div>
              </div>

              {/* Audio URL Input Field */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 uppercase tracking-wider mb-1.5">
                  <Volume2 className="w-4 h-4 text-emerald-600" />
                  URL de Audio de la Especie (MP3 / Sonido Real)
                </label>
                <input
                  name="audioUrl"
                  value={form.audioUrl || ""}
                  onChange={handle}
                  placeholder="https://ejemplo.com/audio-jaguar.mp3"
                  className="w-full px-3.5 py-2.5 border border-emerald-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-emerald-50/40 text-sm"
                />
                <label className="mt-2 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white cursor-pointer transition-all shadow-xs hover:shadow-md active:scale-[0.98]">
                  <Upload size={16} />
                  <span>Cargar audio desde equipo</span>
                  <input
                    type="file"
                    accept="audio/mpeg,audio/wav,audio/ogg,audio/webm,audio/mp4"
                    className="sr-only"
                    onChange={(event) => {
                      void uploadAudioFile(event.target.files?.[0]);
                      event.target.value = "";
                    }}
                  />
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Datos Curiosos</label>
                <textarea
                  name="funFact"
                  value={form.funFact}
                  onChange={handle}
                  onBlur={() => handleBlur("funFact")}
                  rows={3}
                  placeholder="Un dato interesante sobre esta especie..."
                  className={`w-full px-3.5 py-2.5 border rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none text-sm ${shouldShowError("funFact") ? "border-red-400 bg-red-50" : "border-gray-200"}`}
                />
                {shouldShowError("funFact") && (
                  <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Por favor, rellena este campo
                  </p>
                )}
              </div>
            </div>

            {/* Columna Derecha: Galería Multimedia (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 sm:p-5 space-y-4 shadow-xs">
                <div>
                  <p className="text-sm font-bold text-emerald-950 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    Galería multimedia
                  </p>
                  <p className="text-xs text-emerald-800 mt-0.5">Sube hasta 4 imágenes y 2 videos oficiales.</p>
                </div>

                {/* Botón Cargar Imágenes estilizado */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Imágenes ({form.mediaImages.length}/4)
                    </span>
                    {form.mediaImages.length >= 4 && (
                      <span className="text-[11px] text-amber-700 font-bold">Máximo alcanzado</span>
                    )}
                  </div>
                  <label
                    className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs ${
                      form.mediaImages.length >= 4
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
                        : "bg-emerald-700 hover:bg-emerald-800 text-white cursor-pointer hover:shadow-md active:scale-[0.98]"
                    }`}
                  >
                    <Upload size={16} />
                    <span>{form.mediaImages.length >= 4 ? "Máximo 4 imágenes alcanzado" : "Cargar Imágenes"}</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      multiple
                      disabled={form.mediaImages.length >= 4}
                      onChange={(event) => {
                        void uploadMediaFiles(event.target.files, "image");
                        event.target.value = "";
                      }}
                      className="sr-only"
                    />
                  </label>
                  <div className="flex gap-2 mt-2">
                    <input
                      value={imageUrl}
                      onChange={(event) => setImageUrl(event.target.value)}
                      placeholder="https://sitio.com/imagen.jpg"
                      disabled={form.mediaImages.length >= 4}
                      className="min-w-0 flex-1 rounded-xl border border-gray-300 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                    />
                    <button
                      type="button"
                      onClick={addImageUrl}
                      disabled={form.mediaImages.length >= 4}
                      className="rounded-xl bg-emerald-700 hover:bg-emerald-800 px-3.5 py-2 text-xs font-bold text-white disabled:opacity-50 transition-colors shadow-xs shrink-0 cursor-pointer"
                    >
                      Agregar URL
                    </button>
                  </div>
                </div>

                {/* Botón Cargar Videos y URL estilizados */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Videos ({form.mediaVideos.length}/2)
                    </span>
                    {form.mediaVideos.length >= 2 && (
                      <span className="text-[11px] text-amber-700 font-bold">Máximo alcanzado</span>
                    )}
                  </div>
                  <label
                    className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs ${
                      form.mediaVideos.length >= 2
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
                        : "bg-emerald-700 hover:bg-emerald-800 text-white cursor-pointer hover:shadow-md active:scale-[0.98]"
                    }`}
                  >
                    <Video size={16} />
                    <span>{form.mediaVideos.length >= 2 ? "Máximo 2 videos alcanzado" : "Cargar Videos (MP4)"}</span>
                    <input
                      type="file"
                      accept="video/mp4"
                      multiple
                      disabled={form.mediaVideos.length >= 2}
                      onChange={(event) => {
                        void uploadMediaFiles(event.target.files, "video");
                        event.target.value = "";
                      }}
                      className="sr-only"
                    />
                  </label>
                  <div className="flex gap-2">
                    <input
                      value={videoUrl}
                      onChange={(event) => setVideoUrl(event.target.value)}
                      placeholder="https://sitio.com/video.mp4"
                      disabled={form.mediaVideos.length >= 2}
                      className="min-w-0 flex-1 rounded-xl border border-gray-300 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                    />
                    <button
                      type="button"
                      onClick={addVideoUrl}
                      disabled={form.mediaVideos.length >= 2}
                      className="rounded-xl bg-emerald-700 hover:bg-emerald-800 px-3.5 py-2 text-xs font-bold text-white disabled:opacity-50 transition-colors shadow-xs shrink-0 cursor-pointer"
                    >
                      Agregar URL
                    </button>
                  </div>
                </div>

                {/* Foto Principal de Portada */}
                {form.image && (
                  <div className="bg-white p-3 rounded-xl border border-emerald-300 shadow-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> Foto Principal (Portada)
                      </span>
                      <button
                        type="button"
                        onClick={() => setCropperState({ open: true, imageUrl: form.image })}
                        className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1 shadow-xs cursor-pointer hover:scale-105"
                      >
                        <Crop className="w-3.5 h-3.5" /> Centrar / Ajustar
                      </button>
                    </div>
                    <div className="relative aspect-[4/3] w-full rounded-lg overflow-hidden bg-stone-900 border border-stone-200">
                      <img src={form.image} alt="Portada" className="h-full w-full object-cover object-center" />
                    </div>
                  </div>
                )}

                {/* Miniaturas de la Galería */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-stone-600 uppercase tracking-wider">Miniaturas cargadas:</span>
                  {form.mediaImages.length === 0 && form.mediaVideos.length === 0 ? (
                    <p className="text-xs text-gray-400 italic">No hay archivos multimedia cargados aún.</p>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {form.mediaImages.map((url, index) => {
                        const isCover = form.image === url;
                        return (
                          <div key={url} className="relative aspect-square overflow-hidden rounded-xl bg-stone-900 border-2 border-stone-200 group">
                            <img src={url} alt={`Imagen ${index + 1}`} className="h-full w-full object-cover object-center" />
                            {isCover && (
                              <span className="absolute top-1 left-1 bg-amber-500 text-stone-950 font-black text-[9px] px-1.5 py-0.5 rounded shadow-xs uppercase">
                                Portada
                              </span>
                            )}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 p-1">
                              <button
                                type="button"
                                onClick={() => setCropperState({ open: true, imageUrl: url, imageIndex: index })}
                                className="w-full py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold transition-colors cursor-pointer flex items-center justify-center gap-1"
                              >
                                <Crop className="w-3 h-3" /> Centrar
                              </button>
                              {!isCover && (
                                <button
                                  type="button"
                                  onClick={() => setForm((p) => ({ ...p, image: url }))}
                                  className="w-full py-0.5 bg-amber-500 hover:bg-amber-600 text-stone-950 rounded text-[9px] font-bold transition-colors cursor-pointer"
                                >
                                  Portada
                                </button>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                setForm((p) => {
                                  const filtered = p.mediaImages.filter((_, i) => i !== index);
                                  return {
                                    ...p,
                                    mediaImages: filtered,
                                    image: isCover ? filtered[0] || "" : p.image,
                                  };
                                })
                              }
                              className="absolute right-1 top-1 rounded-full bg-red-600 hover:bg-red-700 p-1 text-[10px] text-white transition-colors cursor-pointer shadow-xs"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        );
                      })}
                      {form.mediaVideos.map((url, index) => (
                        <div key={url} className="relative aspect-square overflow-hidden rounded-xl bg-gray-900 border border-gray-300">
                          <video src={url} muted playsInline controls className="h-full w-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setForm((p) => ({ ...p, mediaVideos: p.mediaVideos.filter((_, i) => i !== index) }))}
                            className="absolute right-1 top-1 rounded-full bg-red-600 hover:bg-red-700 px-2 py-0.5 text-xs text-white shadow-xs cursor-pointer"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Sección Video LSM */}
                <div className="border-t border-emerald-200 pt-3.5 space-y-2.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-950">
                    <Hand className="h-4 w-4 text-amber-500" />
                    <span>Video en lengua de señas (LSM)</span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      value={lsmVideoUrl}
                      onChange={(event) => setLsmVideoUrl(event.target.value)}
                      placeholder="https://video.zoologico.mx/lsm/puma"
                      className="min-w-0 flex-1 rounded-xl border border-emerald-300 bg-white px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={addLsmVideoUrl}
                      className="rounded-xl bg-emerald-700 hover:bg-emerald-800 px-3.5 py-2 text-xs font-bold text-white transition-colors shadow-xs shrink-0 cursor-pointer"
                    >
                      Guardar URL
                    </button>
                  </div>
                  <label className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white cursor-pointer transition-all shadow-xs hover:shadow-md active:scale-[0.98]">
                    <Hand size={16} className="text-amber-300" />
                    <span>Cargar Video LSM desde equipo</span>
                    <input
                      type="file"
                      accept="video/mp4,video/webm,video/quicktime"
                      className="sr-only"
                      onChange={(event) => {
                        void uploadMediaFiles(event.target.files, "lsm");
                        event.target.value = "";
                      }}
                    />
                  </label>
                  <p className="text-[10px] text-emerald-700">Formatos locales: MP4, WebM o MOV. Proporción 16:9.</p>
                  {form.lsmVideoUrl ? (
                    <div className="relative overflow-hidden rounded-xl bg-slate-950 mt-2">
                      <video src={form.lsmVideoUrl} muted playsInline controls className="aspect-video w-full object-contain" />
                      <button
                        type="button"
                        onClick={() => setForm((previous) => ({ ...previous, lsmVideoUrl: "" }))}
                        className="absolute right-2 top-2 rounded-full bg-red-600 hover:bg-red-700 px-2 py-1 text-xs text-white shadow-xs cursor-pointer"
                      >
                        ×
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          {/* Footer de botones */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-sm font-bold bg-emerald-700 text-white rounded-xl hover:bg-emerald-800 transition-colors shadow-xs cursor-pointer"
            >
              {isEditing ? "Guardar Cambios" : "Crear Especie"}
            </button>
          </div>
        </form>

        {/* Modal Interactivo de Ajuste y Centrado de Imagen */}
        {cropperState.open && (
          <ImageCropperModal
            imageUrl={cropperState.imageUrl}
            speciesName={form.name}
            onSave={handleSaveCroppedImage}
            onClose={() => setCropperState({ open: false, imageUrl: "" })}
          />
        )}
        {showUnsavedDialog && (
          <div
            className="fixed inset-0 z-[60] flex items-center justify-center p-4"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="unsaved-changes-title"
            onClick={() => setShowUnsavedDialog(false)}
          >
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <div
              className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
              onClick={(event) => event.stopPropagation()}
            >
              <h3 id="unsaved-changes-title" className="text-lg font-bold text-gray-900">
                ¿Seguro que quieres cerrar sin guardar?
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                Se perderán los datos y cambios realizados en esta especie.
              </p>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowUnsavedDialog(false)}
                  className="rounded-xl px-4 py-2.5 text-sm font-bold text-gray-600 transition-colors hover:bg-gray-100"
                >
                  Seguir editando
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-red-700"
                >
                  Cerrar sin guardar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function DeleteDialog({ animal, onConfirm, onClose }: { animal: Animal; onConfirm: () => void; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start gap-4 mb-6">
          <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <AlertTriangle size={20} className="text-red-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-1">Eliminar Especie</h2>
            <p className="text-sm text-gray-500">
              ¿Seguro que quieres eliminar <span className="font-semibold text-gray-900">{animal.name}</span>? Esta acción no se puede deshacer.
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">Cancelar</button>
          <button onClick={onConfirm} className="px-5 py-2.5 text-sm font-bold bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors">Eliminar</button>
        </div>
      </div>
    </div>
  );
}

export function AdminAnimals() {
  const { animals, setAnimals, enclosures, currentUser } = useZoo();
  const { token } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEnclosure, setFilterEnclosure] = useState<string>("all");
  const [modalState, setModalState] = useState<{ open: boolean; animal: Animal | null }>({ open: false, animal: null });
  const [qrModalAnimal, setQrModalAnimal] = useState<Animal | null>(null);
  const [tableCropperAnimal, setTableCropperAnimal] = useState<Animal | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Animal | null>(null);
  const [nextId, setNextId] = useState(100);

  useEffect(() => {
    if (!API_BASE_URL || !token || currentUser.role !== "superadmin") return;
    fetch(`${API_BASE_URL}/api/species/manage/all`, {
      headers: { Authorization: "Bearer " + token },
      cache: "no-store",
    })
      .then(async (response) => {
        const data = await response.json().catch(() => []);
        if (!response.ok) throw new Error(data.message || "No se pudieron cargar las especies.");
        return data;
      })
      .then((data) => {
        if (!Array.isArray(data)) return;
        setAnimals(data.map((species) => ({
          id: Number(species.id),
          name: String(species.name || ""),
          scientificName: String(species.species || ""),
          category: species.category || "Mamífero",
          status: species.conservation || "Preocupación Menor",
          habitat: String(species.habitat || ""),
          diet: String(species.diet || ""),
          funFact: String(species.description || ""),
          image: String(species.imageUrl || ""),
          mediaImages: Array.isArray(species.mediaImages) ? species.mediaImages.slice(0, 4) : species.imageUrl ? [String(species.imageUrl)] : [],
          mediaVideos: Array.isArray(species.mediaVideos) ? species.mediaVideos.slice(0, 2) : [],
          lsmVideoUrl: String(species.lsmVideoUrl || ""),
          audioUrl: species.audioDescriptionUrl || "",
          enclosureId: species.enclosureId ?? null,
          isVisibleToPublic: species.isVisibleToPublic !== false,
        })));
      })
      .catch((error) => console.error("Unable to load managed species:", error));
  }, [currentUser.role, setAnimals, token]);

  const userEnclosureIds = currentUser.enclosureIds && currentUser.enclosureIds.length > 0
    ? currentUser.enclosureIds
    : currentUser.enclosureId
    ? currentUser.enclosureId.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  const scopedAnimals = currentUser.role === "enclosure_admin"
    ? animals.filter((a) => a.enclosureId && userEnclosureIds.includes(a.enclosureId))
    : animals;

  const filteredAnimals = scopedAnimals.filter((a) => {
    const matchSearch = a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.scientificName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchEnclosure = filterEnclosure === "all" || a.enclosureId === filterEnclosure ||
      (filterEnclosure === "none" && !a.enclosureId);
    return matchSearch && matchEnclosure;
  });

  async function handleSave(data: Omit<Animal, "id">) {
    const isEditing = Boolean(modalState.animal);
    const encName = enclosures.find((e) => e.id === data.enclosureId)?.name || data.enclosureId || "General";

    if (API_BASE_URL && token) {
      const payload = {
        slug: (data.name.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")),
        name: data.name,
        species: data.scientificName,
        category: data.category,
        enclosureId: data.enclosureId,
        habitat: data.habitat,
        imageUrl: data.image,
        conservation: data.status,
        description: data.funFact,
        diet: data.diet,
        audioDescriptionUrl: data.audioUrl,
        mediaImages: data.mediaImages.slice(0, 4),
        mediaVideos: data.mediaVideos.slice(0, 2),
        lsmVideoUrl: data.lsmVideoUrl,
        ...(currentUser.role === "superadmin"
          ? { isVisibleToPublic: data.isVisibleToPublic }
          : {}),
      };
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/species${isEditing ? `/${modalState.animal!.id}` : ""}`,
          {
            method: isEditing ? "PUT" : "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer " + token,
            },
            body: JSON.stringify(payload),
          }
        );
        const result = await response.json().catch(() => ({}));
        if (!response.ok) {
          window.alert(result.message || `No se pudo ${isEditing ? "actualizar" : "guardar"} la especie.`);
          return;
        }
        const savedAnimal: Animal = { ...data, id: Number(result.id), isVisibleToPublic: result.isVisibleToPublic !== false };
        setAnimals(isEditing
          ? animals.map((animal) => (animal.id === savedAnimal.id ? savedAnimal : animal))
          : [...animals, savedAnimal]);
        if (!isEditing) setNextId((n) => Math.max(n, savedAnimal.id + 1));
      } catch (error) {
        console.warn("API offline or error, applying local save:", error);
        applyLocalAnimalSave(data, isEditing);
      }
    } else {
      applyLocalAnimalSave(data, isEditing);
    }

    // Register in audit log
    saveAuditLog({
      userId: currentUser.id || 1,
      userName: currentUser.name || "Administrador",
      userEmail: currentUser.email || "admin@zoomat.mx",
      userRole: currentUser.role,
      assignedEnclosures: userEnclosureIds.length > 0
        ? userEnclosureIds.map((id) => enclosures.find((e) => e.id === id)?.name || id)
        : ["Todos los recintos"],
      actionType: isEditing ? "ACTUALIZAR" : "CREAR",
      entityType: "especie",
      entityName: `${data.name} (${data.scientificName || "Especie"})`,
      enclosureName: encName,
      details: isEditing
        ? `Actualizó la información, dieta, estatus (${data.status}) o recursos multimedia de "${data.name}" en el recinto ${encName}.`
        : `Registró la nueva especie "${data.name}" en el catálogo del recinto ${encName}.`,
    });

    setModalState({ open: false, animal: null });
  }

  function applyLocalAnimalSave(data: Omit<Animal, "id">, isEditing: boolean) {
    if (isEditing && modalState.animal) {
      const savedAnimal: Animal = { ...data, id: modalState.animal.id };
      setAnimals(animals.map((a) => (a.id === savedAnimal.id ? savedAnimal : a)));
    } else {
      const newId = Math.max(...animals.map((a) => a.id), 0) + 1;
      const savedAnimal: Animal = { ...data, id: newId };
      setAnimals([...animals, savedAnimal]);
      setNextId((n) => Math.max(n, newId + 1));
    }
  }

  async function handleSaveTableCroppedImage(croppedDataUrl: string) {
    if (!tableCropperAnimal) return;
    let finalUrl = croppedDataUrl;
    try {
      const res = await fetch(`${API_BASE_URL || ""}/api/upload`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({
          filename: `encuadre-${(tableCropperAnimal.name || "especie").replace(/\s+/g, "_")}-${Date.now()}.jpg`,
          data: croppedDataUrl,
        }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json?.url) finalUrl = json.url;
      }
    } catch (e) {
      console.warn("Upload fallback to dataUrl", e);
    }

    const updatedAnimal: Animal = {
      ...tableCropperAnimal,
      image: finalUrl,
      mediaImages: tableCropperAnimal.mediaImages?.length
        ? [finalUrl, ...tableCropperAnimal.mediaImages.filter((u) => u !== tableCropperAnimal.image).slice(0, 3)]
        : [finalUrl],
    };

    if (token) {
      try {
        await fetch(`${API_BASE_URL || ""}/api/species/${tableCropperAnimal.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            slug: tableCropperAnimal.name.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-"),
            name: tableCropperAnimal.name,
            species: tableCropperAnimal.scientificName,
            category: tableCropperAnimal.category,
            enclosureId: tableCropperAnimal.enclosureId,
            isVisibleToPublic: tableCropperAnimal.isVisibleToPublic !== false,
            habitat: tableCropperAnimal.habitat,
            imageUrl: finalUrl,
            conservation: tableCropperAnimal.status,
            description: tableCropperAnimal.funFact,
            diet: tableCropperAnimal.diet,
            audioDescriptionUrl: tableCropperAnimal.audioUrl,
            mediaImages: updatedAnimal.mediaImages,
            mediaVideos: tableCropperAnimal.mediaVideos,
            lsmVideoUrl: tableCropperAnimal.lsmVideoUrl,
          }),
        });
      } catch (err) {
        console.warn("Error updating cropped image in DB:", err);
      }
    }

    setAnimals(animals.map((a) => (a.id === tableCropperAnimal.id ? updatedAnimal : a)));
    setTableCropperAnimal(null);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    const encName = enclosures.find((e) => e.id === deleteTarget.enclosureId)?.name || deleteTarget.enclosureId || "General";

    try {
      const response = await fetch(`${API_BASE_URL || ""}/api/species/${deleteTarget.id}`, {
        method: "DELETE",
        headers: { Authorization: "Bearer " + token },
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        window.alert(result.message || "No se pudo eliminar la especie.");
        return;
      }
    } catch (error) {
      console.error("Error deleting species from database:", error);
      window.alert("No se pudo eliminar la especie de la base de datos.");
      return;
    }

    setAnimals(animals.filter((animal) => animal.id !== deleteTarget.id));

    // Register in audit log
    saveAuditLog({
      userId: currentUser.id || 1,
      userName: currentUser.name || "Administrador",
      userEmail: currentUser.email || "admin@zoomat.mx",
      userRole: currentUser.role,
      assignedEnclosures: userEnclosureIds.length > 0
        ? userEnclosureIds.map((id) => enclosures.find((e) => e.id === id)?.name || id)
        : ["Todos los recintos"],
      actionType: "ELIMINAR",
      entityType: "especie",
      entityName: deleteTarget.name,
      enclosureName: encName,
      details: `Eliminó la especie "${deleteTarget.name}" del catálogo y del recinto ${encName}.`,
    });

    setDeleteTarget(null);
  }

  async function togglePublicVisibility(animal: Animal) {
    if (!isSuperAdmin) return;
    // Primero cerrar el modal si está abierto para evitar conflictos
    setModalState({ open: false, animal: null });
    const newVisibility = !animal.isVisibleToPublic;

    if (API_BASE_URL && token) {
      try {
        const payload = {
          slug: (animal.name.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")),
          name: animal.name,
          species: animal.scientificName,
          category: animal.category,
          enclosureId: animal.enclosureId,
          isVisibleToPublic: newVisibility,
          habitat: animal.habitat,
          imageUrl: animal.image,
          conservation: animal.status,
          description: animal.funFact,
          diet: animal.diet,
          audioDescriptionUrl: animal.audioUrl,
          mediaImages: animal.mediaImages?.slice(0, 4) || [],
          mediaVideos: animal.mediaVideos?.slice(0, 2) || [],
          lsmVideoUrl: animal.lsmVideoUrl,
        };
        const response = await fetch(
          `${API_BASE_URL}/api/species/${animal.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer " + token,
            },
            body: JSON.stringify(payload),
          }
        );
        const result = await response.json().catch(() => ({}));
        if (!response.ok) {
          window.alert(result.message || "No se pudo cambiar la visibilidad.");
          return;
        }
        setAnimals(animals.map((a) =>
          a.id === animal.id ? { ...a, isVisibleToPublic: newVisibility } : a
        ));
      } catch (error) {
        console.warn("Error toggling visibility:", error);
        setAnimals(animals.map((a) =>
          a.id === animal.id ? { ...a, isVisibleToPublic: newVisibility } : a
        ));
      }
    } else {
      setAnimals(animals.map((a) =>
        a.id === animal.id ? { ...a, isVisibleToPublic: newVisibility } : a
      ));
    }
  }

  const getEnclosure = (id: string | null) => enclosures.find((e) => e.id === id);

  const isSuperAdmin = currentUser.role === "superadmin";
  const userEnclosures = enclosures.filter((e) => userEnclosureIds.includes(e.id));
  const myEnclosure = userEnclosures[0] || (currentUser.enclosureId ? enclosures.find((e) => e.id === currentUser.enclosureId) : null);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isSuperAdmin
              ? "Gestión de especies"
              : userEnclosures.length > 0
              ? `Especies — ${userEnclosures.map((e) => `${e.icon || ""} ${e.name}`).join(", ")}`
              : `Especies — ${myEnclosure?.name ?? "Sin recinto"}`}
          </h1>
          <p className="text-sm text-gray-500 mt-1">{filteredAnimals.length} especie{filteredAnimals.length !== 1 ? "s" : ""}</p>
        </div>
        <button
          onClick={() => setModalState({ open: true, animal: null })}
          className="bg-emerald-700 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 hover:bg-emerald-800 transition-colors font-bold text-sm"
        >
          <Plus size={18} /> Nueva Especie
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text" placeholder="Buscar especie..." value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
          />
        </div>
        {isSuperAdmin && (
          <select
            value={filterEnclosure}
            onChange={(e) => setFilterEnclosure(e.target.value)}
            className="px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
          >
            <option value="all">Todos los recintos</option>
            <option value="none">Sin recinto</option>
            {enclosures.map((enc) => (
              <option key={enc.id} value={enc.id}>{enc.name}</option>
            ))}
          </select>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                <th className="p-4 font-semibold border-b border-gray-100 w-12"></th>
                <th className="p-4 font-semibold border-b border-gray-100">Especie</th>
                <th className="p-4 font-semibold border-b border-gray-100">Audio</th>
                <th className="p-4 font-semibold border-b border-gray-100">Recinto</th>
                <th className="p-4 font-semibold border-b border-gray-100">Conservación</th>
                <th className="p-4 font-semibold border-b border-gray-100 text-right">Acciones & QR</th>
              </tr>
            </thead>
            <tbody>
              {filteredAnimals.map((animal) => {
                const enc = getEnclosure(animal.enclosureId);
                return (
                  <tr key={animal.id} className="hover:bg-gray-50/50 transition-colors border-b border-gray-50 last:border-0">
                    <td className="p-4">
                      {animal.image ? (
                        <div
                          className="relative w-12 h-12 rounded-xl overflow-hidden bg-stone-900 group cursor-pointer border-2 border-stone-200 shadow-xs hover:border-emerald-500 transition-all"
                          title="🎯 Clic para centrar o ajustar la foto de esta especie"
                          onClick={() => setTableCropperAnimal(animal)}
                        >
                          <img
                            src={animal.image}
                            alt={animal.name}
                            className="w-full h-full object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                          />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                            <Crop size={16} className="text-amber-300" />
                          </div>
                        </div>
                      ) : (
                        <div
                          onClick={() => setModalState({ open: true, animal })}
                          className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 text-sm font-bold cursor-pointer hover:bg-emerald-100"
                        >
                          {animal.name.charAt(0)}
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <p className="font-semibold text-gray-900">{animal.name}</p>
                      <p className="text-xs text-gray-400 italic mt-0.5">{animal.scientificName}</p>
                    </td>
                    <td className="p-4">
                      {animal.audioUrl ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                          <Volume2 size={13} /> Con Audio
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400 italic">Sin audio</span>
                      )}
                    </td>
                    <td className="p-4">
                      {enc ? (
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full text-white ${enc.color}`}>
                          {enc.name}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400 italic">Sin recinto</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-full ${STATUS_COLORS[animal.status]}`}>
                        {animal.status}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-1">
                      <button
                        onClick={() => setTableCropperAnimal(animal)}
                        className="p-2 text-amber-900 hover:bg-amber-100 rounded-lg transition-colors font-bold text-xs inline-flex items-center gap-1 bg-amber-50 border border-amber-300 cursor-pointer shadow-xs"
                        title="🎯 Centrar o encuadrar la imagen para que no salga descuadrada"
                      >
                        <Crop size={15} className="text-amber-700" />
                        <span>Ajustar Foto</span>
                      </button>
                      <button
                        onClick={() => setQrModalAnimal(animal)}
                        className="p-2 text-emerald-700 hover:bg-emerald-100 rounded-lg transition-colors font-bold text-xs inline-flex items-center gap-1 bg-emerald-50 border border-emerald-200"
                        title="Generar Código QR"
                      >
                        <QrCode size={16} />
                        <span>Generar QR</span>
                      </button>
                      <button onClick={() => setModalState({ open: true, animal })}
                        className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Editar">
                        <Edit2 size={16} />
                      </button>
                      {isSuperAdmin && (
                        <button
                          onClick={() => void togglePublicVisibility(animal)}
                          className={`rounded-lg px-2 py-1 text-xs font-bold transition-colors ${
                            animal.isVisibleToPublic === false
                              ? "bg-gray-100 text-gray-600 hover:bg-emerald-100 hover:text-emerald-700"
                              : "bg-emerald-50 text-emerald-700 hover:bg-amber-100 hover:text-amber-800"
                          }`}
                          title={animal.isVisibleToPublic === false ? "Mostrar al público" : "Ocultar del público"}
                        >
                          {animal.isVisibleToPublic === false ? "Oculta" : "Visible"}
                        </button>
                      )}
                      <button onClick={() => setDeleteTarget(animal)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Eliminar">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredAnimals.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-10 text-center text-gray-400 text-sm">No se encontraron especies.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalState.open && (
        <AnimalModal
          animal={modalState.animal ?? {
            ...emptyForm,
            enclosureId: currentUser.role === "enclosure_admin" ? userEnclosureIds[0] || null : null,
          }}
          onSave={handleSave}
          onClose={() => setModalState({ open: false, animal: null })}
        />
      )}
      {qrModalAnimal && (
        <QrModal animal={qrModalAnimal} onClose={() => setQrModalAnimal(null)} />
      )}
      {deleteTarget && (
        <DeleteDialog animal={deleteTarget} onConfirm={handleDelete} onClose={() => setDeleteTarget(null)} />
      )}
      {tableCropperAnimal && (
        <ImageCropperModal
          imageUrl={tableCropperAnimal.image}
          speciesName={tableCropperAnimal.name}
          onSave={handleSaveTableCroppedImage}
          onClose={() => setTableCropperAnimal(null)}
        />
      )}
    </div>
  );
}

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Search, X, AlertTriangle, MapPin, Volume2, QrCode, Download, Hand } from "lucide-react";
import QRCode from "qrcode";
import { useZoo } from "../../context/ZooContext";
import { useAuth } from "../../context/AuthContext";
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
  const qrTargetUrl = origin ? `${origin}/especie/${animal.id}?scan=qr` : "";
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
  const [lsmVideoUrl, setLsmVideoUrl] = useState(animal.lsmVideoUrl || "");

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

        async function uploadMediaFiles(files: FileList | null, kind: "image" | "video" | "lsm") {
          if (!files?.length) return;
          const selected = Array.from(files);
          const current = kind === "image" ? form.mediaImages : kind === "video" ? form.mediaVideos : form.lsmVideoUrl ? [form.lsmVideoUrl] : [];
          const limit = kind === "image" ? 4 : kind === "video" ? 2 : 1;
          if (current.length + selected.length > limit) {
            window.alert(`Puedes registrar máximo ${limit} ${kind === "image" ? "imágenes" : "videos"}.`);
            return;
          }
          const urls: string[] = [];
          for (const file of selected) {
            const reader = new FileReader();
            const dataUrl = await new Promise<string>((resolve, reject) => {
              reader.onload = () => resolve(String(reader.result));
              reader.onerror = () => reject(new Error("No se pudo leer el archivo."));
              reader.readAsDataURL(file);
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
              ? { mediaImages: [...previous.mediaImages, ...urls], image: previous.image || urls[0] }
              : kind === "video"
              ? { mediaVideos: [...previous.mediaVideos, ...urls] }
              : { lsmVideoUrl: urls[0] }),
          }));
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
          ? { mediaImages: [...previous.mediaImages, ...urls], image: previous.image || urls[0] }
          : kind === "video"
          ? { mediaVideos: [...previous.mediaVideos, ...urls] }
          : { lsmVideoUrl: urls[0] }),
      }));
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "No se pudo subir el archivo.");
    }
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
    setForm((p) => ({ ...p, [name]: value === "" ? null : value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;

    const userEnclosureIds = currentUser.enclosureIds && currentUser.enclosureIds.length > 0
      ? currentUser.enclosureIds
      : currentUser.enclosureId
      ? currentUser.enclosureId.split(",").map((s) => s.trim()).filter(Boolean)
      : [];

    const saved = currentUser.role === "enclosure_admin"
      ? { ...form, enclosureId: animal.enclosureId || userEnclosureIds[0] || null, isVisibleToPublic: animal.isVisibleToPublic !== false }
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold text-gray-900">
            {isEditing ? "Editar Especie" : "Nueva Especie"}
          </h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                Nombre Común <span className="text-red-500">*</span>
              </label>
              <input
                name="name" value={form.name} onChange={handle} required
                placeholder="Nombre común de la especie"
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 space-y-4">
              <div>
                <p className="text-sm font-bold text-emerald-950">Galería multimedia</p>
                <p className="text-xs text-emerald-800">Sube hasta 4 imágenes y 2 videos.</p>
              </div>
              <label className="block text-xs font-bold text-gray-600">
                Imágenes ({form.mediaImages.length}/4)
                <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple
                  disabled={form.mediaImages.length >= 4}
                  onChange={(event) => void uploadMediaFiles(event.target.files, "image")}
                  className="mt-1 block w-full text-sm" />
              </label>
              <label className="block text-xs font-bold text-gray-600">
                Videos ({form.mediaVideos.length}/2)
                <input type="file" accept="video/mp4" multiple
                  disabled={form.mediaVideos.length >= 2}
                  onChange={(event) => void uploadMediaFiles(event.target.files, "video")}
                  className="mt-1 block w-full text-sm" />
              </label>
              <div className="flex gap-2">
                <input
                  value={videoUrl}
                  onChange={(event) => setVideoUrl(event.target.value)}
                  placeholder="https://sitio.com/video.mp4"
                  className="min-w-0 flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />
                <button
                  type="button"
                  onClick={addVideoUrl}
                  disabled={form.mediaVideos.length >= 2}
                  className="rounded-lg bg-emerald-700 px-3 py-2 text-xs font-bold text-white disabled:opacity-50"
                >
                  Agregar URL
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {form.mediaImages.map((url, index) => (
                  <div key={url} className="relative aspect-square overflow-hidden rounded-lg bg-gray-200">
                    <img src={url} alt={`Imagen ${index + 1}`} className="h-full w-full object-cover" />
                    <button type="button" onClick={() => setForm((p) => ({ ...p, mediaImages: p.mediaImages.filter((_, i) => i !== index), image: p.mediaImages.filter((_, i) => i !== index)[0] || "" }))}
                      className="absolute right-1 top-1 rounded-full bg-red-600 px-2 py-1 text-xs text-white">×</button>
                  </div>
                ))}
                {form.mediaVideos.map((url, index) => (
                  <div key={url} className="relative aspect-square overflow-hidden rounded-lg bg-gray-900">
                    <video src={url} muted playsInline controls className="h-full w-full object-cover" />
                    <button type="button" onClick={() => setForm((p) => ({ ...p, mediaVideos: p.mediaVideos.filter((_, i) => i !== index) }))}
                      className="absolute right-1 top-1 rounded-full bg-red-600 px-2 py-1 text-xs text-white">×</button>
                  </div>
                ))}
              </div>
              <div className="border-t border-emerald-200 pt-4 space-y-3">
                <div className="flex items-center gap-2 text-sm font-bold text-emerald-950">
                  <Hand className="h-4 w-4 text-amber-500" />
                  <span>Video en lengua de señas (LSM)</span>
                </div>
                <div className="flex gap-2">
                  <input
                    value={lsmVideoUrl}
                    onChange={(event) => setLsmVideoUrl(event.target.value)}
                    placeholder="https://video.zoologico.mx/lsm/puma"
                    className="min-w-0 flex-1 rounded-lg border border-emerald-300 bg-white px-3 py-2 text-sm"
                  />
                  <button
                    type="button"
                    onClick={addLsmVideoUrl}
                    className="rounded-lg border border-emerald-500 px-3 py-2 text-xs font-bold text-emerald-800"
                  >
                    Guardar URL
                  </button>
                </div>
                <label className="flex cursor-pointer items-center justify-center rounded-lg border border-dashed border-emerald-500 px-3 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-50">
                  <input
                    type="file"
                    accept="video/mp4,video/webm,video/quicktime"
                    className="sr-only"
                    onChange={(event) => void uploadMediaFiles(event.target.files, "lsm")}
                  />
                  Subir video LSM desde el equipo
                </label>
                <p className="text-[10px] text-emerald-700">Formatos locales: MP4, WebM o MOV. Proporción recomendada 16:9.</p>
                {form.lsmVideoUrl ? (
                  <div className="relative overflow-hidden rounded-lg bg-slate-950">
                    <video src={form.lsmVideoUrl} muted playsInline controls className="aspect-video w-full object-contain" />
                    <button
                      type="button"
                      onClick={() => setForm((previous) => ({ ...previous, lsmVideoUrl: "" }))}
                      className="absolute right-2 top-2 rounded-full bg-red-600 px-2 py-1 text-xs text-white"
                    >
                      ×
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                Nombre Científico
              </label>
              <input
                name="scientificName" value={form.scientificName} onChange={handle}
                placeholder="ej. Panthera onca"
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 italic"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Categoría</label>
              <select name="category" value={form.category} onChange={handle}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white">
                {ANIMAL_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Estado de Conservación</label>
              <select name="status" value={form.status} onChange={handle}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white">
                {CONSERVATION_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Enclosure */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
              <MapPin className="inline w-3.5 h-3.5 mr-1" />
              Recinto
            </label>
            {currentUser.role === "enclosure_admin" ? (
              <div className="px-3.5 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-600 text-sm">
                {availableEnclosures[0]?.icon} {availableEnclosures[0]?.name} — asignado automáticamente
              </div>
            ) : (
              <select
                name="enclosureId"
                value={form.enclosureId ?? ""}
                onChange={handle}
                disabled={currentUser.role !== "superadmin"}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                <option value="">Sin recinto asignado</option>
                {enclosures.map((enc) => (
                  <option key={enc.id} value={enc.id}>{enc.icon} {enc.name}</option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Hábitat</label>
            <input name="habitat" value={form.habitat} onChange={handle}
              placeholder="ej. Selvas tropicales de Chiapas"
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Dieta</label>
            <input name="diet" value={form.diet} onChange={handle}
              placeholder="ej. Carnívoro: pecaríes, venados..."
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
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
            <p className="text-[11px] text-gray-500 mt-1">
              Ingresa el enlace al archivo de audio en formato MP3
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Datos Curiosos</label>
            <textarea name="funFact" value={form.funFact} onChange={handle} rows={3}
              placeholder="Un dato interesante sobre esta especie..."
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none" />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">URL de Imagen</label>
            <div className="flex gap-2">
              <input name="image" value={form.image} onChange={handle}
                placeholder="/assets/images/placeholder.svg"
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              <input type="file" accept="image/*" onChange={handleFileUpload} className="px-3 py-2 bg-white border border-gray-200 rounded-xl" />
            </div>
            {form.image && (
              <div className="mt-2 h-32 rounded-xl overflow-hidden bg-gray-100">
                <img src={form.image} alt="Vista previa" className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
              Cancelar
            </button>
            <button type="submit"
              className="px-5 py-2.5 text-sm font-bold bg-emerald-700 text-white rounded-xl hover:bg-emerald-800 transition-colors">
              {isEditing ? "Guardar Cambios" : "Crear Especie"}
            </button>
          </div>
        </form>
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
        isVisibleToPublic: data.isVisibleToPublic,
        habitat: data.habitat,
        imageUrl: data.image,
        conservation: data.status,
        description: data.funFact,
        diet: data.diet,
        audioDescriptionUrl: data.audioUrl,
        mediaImages: data.mediaImages.slice(0, 4),
        mediaVideos: data.mediaVideos.slice(0, 2),
        lsmVideoUrl: data.lsmVideoUrl,
      };
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/species${isEditing ? `/${modalState.animal!.id}` : ""}`,
          {
            method: isEditing ? "PUT" : "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${sessionStorage.getItem("pro-zoo-admin-token") || ""}`,
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

  async function handleDelete() {
    if (!deleteTarget) return;
    const encName = enclosures.find((e) => e.id === deleteTarget.enclosureId)?.name || deleteTarget.enclosureId || "General";

    if (API_BASE_URL && token) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/species/${deleteTarget.id}`, {
          method: "DELETE",
          headers: { Authorization: "Bearer " + token },
        });
        const result = await response.json().catch(() => ({}));
        if (!response.ok) {
          window.alert(result.message || "No se pudo eliminar la especie.");
          return;
        }
      } catch (error) {
        console.warn("API offline or error, deleting locally:", error);
      }
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
    await handleSave({
      ...animal,
      isVisibleToPublic: animal.isVisibleToPublic === false,
    });
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
              <option key={enc.id} value={enc.id}>{enc.icon} {enc.name}</option>
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
                        <img src={animal.image} alt={animal.name}
                          className="w-10 h-10 rounded-lg object-cover bg-gray-100"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-400 text-sm font-bold">
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
                          {enc.icon} {enc.name}
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
          animal={modalState.animal ?? { ...emptyForm, enclosureId: currentUser.role === "enclosure_admin" ? currentUser.enclosureId : null }}
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
    </div>
  );
}

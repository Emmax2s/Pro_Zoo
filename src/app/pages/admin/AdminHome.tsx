import { useState } from "react";
import { Plus, Trash2, GripVertical, X, Image, Video, Eye, EyeOff, AlertTriangle, ChevronLeft, ChevronRight } from "lucide-react";
import { useZoo } from "../../context/ZooContext";
import { SlideItem } from "../../data/zooStore";

// ── Add Slide Modal ───────────────────────────────────────────────────────────

type NewSlide =
  | { type: "image"; src: string; alt: string }
  | { type: "video"; src: string; poster: string; alt: string };

function AddSlideModal({ onSave, onClose }: { onSave: (s: NewSlide) => void; onClose: () => void }) {
  const [type, setType] = useState<"image" | "video">("image");
  const [form, setForm] = useState({ src: "", alt: "", poster: "" });

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>, target: 'src' | 'poster') {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const dataURL = reader.result as string;
      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filename: file.name, data: dataURL }),
        });
        const json = await res.json();
        setForm((p) => ({ ...p, [target]: json.url }));
        if (file.type.startsWith('video')) setType('video');
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Upload failed', err);
      }
    };
    reader.readAsDataURL(file);
  }

  function handle(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.src.trim()) return;
    if (type === "image") {
      onSave({ type: "image", src: form.src, alt: form.alt });
    } else {
      onSave({ type: "video", src: form.src, alt: form.alt, poster: form.poster });
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Agregar Slide</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Type selector */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setType("image")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 transition-colors font-semibold text-sm ${
                type === "image" ? "border-emerald-600 bg-emerald-50 text-emerald-700" : "border-gray-200 text-gray-500 hover:border-gray-300"
              }`}
            >
              <Image size={18} /> Imagen
            </button>
            <button
              type="button"
              onClick={() => setType("video")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 transition-colors font-semibold text-sm ${
                type === "video" ? "border-emerald-600 bg-emerald-50 text-emerald-700" : "border-gray-200 text-gray-500 hover:border-gray-300"
              }`}
            >
              <Video size={18} /> Video
            </button>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
              URL {type === "image" ? "de Imagen" : "de Video"} <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <input name="src" value={form.src} onChange={handle} required
                placeholder={type === "image" ? "/assets/images/placeholder.svg" : "/assets/videos/sample.mp4"}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              <input type="file" accept="image/*,video/*" onChange={(e) => handleFileUpload(e, 'src')} className="px-3 py-2 bg-white border border-gray-200 rounded-xl" />
            </div>
          </div>

          {type === "video" && (
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                URL de Portada (poster)
              </label>
              <input name="poster" value={form.poster} onChange={handle}
                placeholder="/assets/images/placeholder.svg"
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'poster')} className="mt-2 px-3 py-2 bg-white border border-gray-200 rounded-xl" />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
              Texto alternativo (descripción)
            </label>
            <input name="alt" value={form.alt} onChange={handle}
              placeholder="ej. Jaguar en su hábitat natural"
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>

          {/* Preview */}
          {form.src && type === "image" && (
            <div className="h-36 rounded-xl overflow-hidden bg-gray-100">
              <img src={form.src} alt="preview" className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
              Cancelar
            </button>
            <button type="submit"
              className="px-5 py-2.5 text-sm font-bold bg-emerald-700 text-white rounded-xl hover:bg-emerald-800 transition-colors">
              Agregar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Preview Modal ─────────────────────────────────────────────────────────────

function PreviewModal({ slides, onClose }: { slides: SlideItem[]; onClose: () => void }) {
  const [current, setCurrent] = useState(0);
  const total = slides.length;

  if (total === 0) return null;
  const slide = slides[current];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80" onClick={onClose}>
      <div className="relative w-full max-w-3xl aspect-[4/3] rounded-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {slide.type === "image" ? (
          <img src={slide.src} alt={slide.alt} className="w-full h-full object-cover" />
        ) : (
          <video src={slide.src} poster={slide.poster} controls className="w-full h-full object-cover" />
        )}
        {total > 1 && (
          <>
            <button onClick={() => setCurrent((c) => (c - 1 + total) % total)}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 text-white flex items-center justify-center">
              <ChevronLeft size={20} />
            </button>
            <button onClick={() => setCurrent((c) => (c + 1) % total)}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 text-white flex items-center justify-center">
              <ChevronRight size={20} />
            </button>
          </>
        )}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
          {slides.map((_, i) => (
            <button key={i} onClick={() => setCurrent(i)}
              className={`rounded-full transition-all ${i === current ? "w-5 h-2 bg-white" : "w-2 h-2 bg-white/50"}`} />
          ))}
        </div>
        <button onClick={onClose} className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center">
          <X size={16} />
        </button>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export function AdminHome() {
  const { slides, setSlides } = useZoo();
  const [showAdd, setShowAdd] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [dragging, setDragging] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);

  function addSlide(data: NewSlide) {
    const id = `slide-${Date.now()}`;
    if (data.type === "image") {
      setSlides([...slides, { id, type: "image", src: data.src, alt: data.alt }]);
    } else {
      setSlides([...slides, { id, type: "video", src: data.src, poster: data.poster, alt: data.alt }]);
    }
    setShowAdd(false);
  }

  function removeSlide(id: string) {
    setSlides(slides.filter((s) => s.id !== id));
    setDeleteTarget(null);
  }

  function moveUp(index: number) {
    if (index === 0) return;
    const next = [...slides];
    [next[index - 1], next[index]] = [next[index], next[index - 1]];
    setSlides(next);
  }

  function moveDown(index: number) {
    if (index === slides.length - 1) return;
    const next = [...slides];
    [next[index], next[index + 1]] = [next[index + 1], next[index]];
    setSlides(next);
  }

  // Drag-and-drop reorder
  function handleDragStart(index: number) { setDragging(index); }
  function handleDragEnter(index: number) { setDragOver(index); }
  function handleDragEnd() {
    if (dragging !== null && dragOver !== null && dragging !== dragOver) {
      const next = [...slides];
      const [moved] = next.splice(dragging, 1);
      next.splice(dragOver, 0, moved);
      setSlides(next);
    }
    setDragging(null);
    setDragOver(null);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inicio — Carrusel</h1>
          <p className="text-sm text-gray-500 mt-1">{slides.length} slide{slides.length !== 1 ? "s" : ""} en el carrusel del Home</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowPreview(true)}
            className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <Eye size={16} /> Vista previa
          </button>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-700 text-white rounded-xl text-sm font-bold hover:bg-emerald-800 transition-colors"
          >
            <Plus size={16} /> Agregar Slide
          </button>
        </div>
      </div>

      {/* Tip */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-sm text-blue-700 flex items-center gap-2">
        <GripVertical size={16} className="flex-shrink-0" />
        Arrastra los slides para cambiar el orden, o usa las flechas ↑ ↓.
      </div>

      {/* Slides list */}
      {slides.length === 0 ? (
        <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-14 text-center">
          <p className="text-gray-400 text-sm mb-4">No hay slides en el carrusel.</p>
          <button onClick={() => setShowAdd(true)}
            className="px-5 py-2.5 bg-emerald-700 text-white rounded-xl text-sm font-bold hover:bg-emerald-800 transition-colors">
            Agregar el primero
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {slides.map((slide, i) => (
            <div
              key={slide.id}
              draggable
              onDragStart={() => handleDragStart(i)}
              onDragEnter={() => handleDragEnter(i)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => e.preventDefault()}
              className={`bg-white rounded-2xl border border-gray-100 overflow-hidden flex items-stretch gap-0 shadow-sm transition-all cursor-grab active:cursor-grabbing ${
                dragOver === i ? "ring-2 ring-emerald-400 scale-[1.01]" : ""
              }`}
            >
              {/* Drag handle */}
              <div className="flex items-center px-3 text-gray-300 hover:text-gray-500 transition-colors border-r border-gray-100 bg-gray-50/50">
                <GripVertical size={20} />
              </div>

              {/* Thumbnail */}
              <div className="w-32 h-20 flex-shrink-0 relative bg-gray-100">
                {slide.type === "image" ? (
                  <img src={slide.src} alt={slide.alt} className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                ) : (
                  <>
                    {slide.poster && (
                      <img src={slide.poster} alt={slide.alt} className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                    )}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <Video size={20} className="text-white" />
                    </div>
                  </>
                )}
                {/* Order badge */}
                <span className="absolute top-1 left-1 w-5 h-5 rounded-full bg-black/50 text-white text-xs flex items-center justify-center font-bold">
                  {i + 1}
                </span>
              </div>

              {/* Info */}
              <div className="flex-1 flex items-center px-4 gap-3 min-w-0">
                <span className={`flex-shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                  slide.type === "image" ? "bg-sky-100 text-sky-700" : "bg-purple-100 text-purple-700"
                }`}>
                  {slide.type === "image" ? <><Image size={11} /> Imagen</> : <><Video size={11} /> Video</>}
                </span>
                <p className="text-sm text-gray-700 truncate">{slide.alt || <span className="italic text-gray-400">Sin descripción</span>}</p>
                <p className="text-xs text-gray-400 truncate hidden md:block">{slide.src}</p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 px-3 border-l border-gray-100 flex-shrink-0">
                <button onClick={() => moveUp(i)} disabled={i === 0}
                  className="p-1.5 text-gray-400 hover:text-gray-700 disabled:opacity-30 rounded-lg hover:bg-gray-100 transition-colors" title="Subir">
                  <ChevronLeft size={16} className="rotate-90" />
                </button>
                <button onClick={() => moveDown(i)} disabled={i === slides.length - 1}
                  className="p-1.5 text-gray-400 hover:text-gray-700 disabled:opacity-30 rounded-lg hover:bg-gray-100 transition-colors" title="Bajar">
                  <ChevronLeft size={16} className="-rotate-90" />
                </button>
                <button onClick={() => setDeleteTarget(slide.id)}
                  className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Eliminar">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      {showAdd && <AddSlideModal onSave={addSlide} onClose={() => setShowAdd(false)} />}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setDeleteTarget(null)}>
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start gap-4 mb-6">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <AlertTriangle size={20} className="text-red-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-1">Eliminar Slide</h2>
                <p className="text-sm text-gray-500">¿Seguro que quieres eliminar este slide del carrusel?</p>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteTarget(null)}
                className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">Cancelar</button>
              <button onClick={() => removeSlide(deleteTarget)}
                className="px-5 py-2.5 text-sm font-bold bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors">Eliminar</button>
            </div>
          </div>
        </div>
      )}

      {showPreview && <PreviewModal slides={slides} onClose={() => setShowPreview(false)} />}
    </div>
  );
}

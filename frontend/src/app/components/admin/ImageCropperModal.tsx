import { useState, useRef, useEffect, useCallback } from "react";
import { X, ZoomIn, ZoomOut, RotateCcw, Check, Move, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Eye, Sparkles } from "lucide-react";

interface ImageCropperModalProps {
  imageUrl: string;
  speciesName?: string;
  defaultAspectRatio?: "16/9" | "4/3" | "1/1";
  onSave: (croppedDataUrl: string) => Promise<void> | void;
  onClose: () => void;
}

export function ImageCropperModal({ imageUrl, speciesName, defaultAspectRatio = "4/3", onSave, onClose }: ImageCropperModalProps) {
  const [zoom, setZoom] = useState<number>(1.1);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [aspectRatio, setAspectRatio] = useState<"16/9" | "4/3" | "1/1">(defaultAspectRatio);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isSaving, setIsSaving] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  // Reset framing when image changes
  useEffect(() => {
    setZoom(1.1);
    setPosition({ x: 0, y: 0 });
    setImageLoaded(false);
  }, [imageUrl]);

  // Handle Drag / Pan with mouse
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Handle Drag with touch
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      setIsDragging(true);
      setDragStart({ x: touch.clientX - position.x, y: touch.clientY - position.y });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    const touch = e.touches[0];
    setPosition({
      x: touch.clientX - dragStart.x,
      y: touch.clientY - dragStart.y,
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Quick preset alignments
  const applyPreset = (preset: "center" | "top" | "bottom" | "left" | "right") => {
    const container = containerRef.current;
    if (!container) return;
    const height = container.clientHeight;
    const width = container.clientWidth;

    switch (preset) {
      case "center":
        setPosition({ x: 0, y: 0 });
        break;
      case "top":
        // Focus on animal head/upper body (pull down)
        setPosition({ x: 0, y: height * 0.18 });
        break;
      case "bottom":
        setPosition({ x: 0, y: -height * 0.18 });
        break;
      case "left":
        setPosition({ x: width * 0.18, y: 0 });
        break;
      case "right":
        setPosition({ x: -width * 0.18, y: 0 });
        break;
    }
  };

  // Export cropped canvas
  const handleCropAndSave = async () => {
    const container = containerRef.current;
    const img = imageRef.current;
    if (!container || !img) return;

    setIsSaving(true);
    try {
      const outputWidth = aspectRatio === "16/9" ? 1600 : aspectRatio === "4/3" ? 1200 : 1000;
      const outputHeight = aspectRatio === "16/9" ? 900 : aspectRatio === "4/3" ? 900 : 1000;

      const canvas = document.createElement("canvas");
      canvas.width = outputWidth;
      canvas.height = outputHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("No se pudo inicializar canvas 2D");

      // Fill neutral dark background
      ctx.fillStyle = "#1c1917";
      ctx.fillRect(0, 0, outputWidth, outputHeight);

      const containerRect = container.getBoundingClientRect();
      const scaleFactor = outputWidth / containerRect.width;

      // Draw image with current pan and zoom
      ctx.save();
      ctx.translate(outputWidth / 2 + position.x * scaleFactor, outputHeight / 2 + position.y * scaleFactor);
      ctx.scale(zoom, zoom);

      // Render image centered
      const natW = img.naturalWidth || 800;
      const natH = img.naturalHeight || 600;
      // Scale to cover container initially
      const imgAspect = natW / natH;
      const targetAspect = outputWidth / outputHeight;

      let drawW: number;
      let drawH: number;
      if (imgAspect > targetAspect) {
        drawH = outputHeight;
        drawW = outputHeight * imgAspect;
      } else {
        drawW = outputWidth;
        drawH = outputWidth / imgAspect;
      }

      ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
      ctx.restore();

      const croppedDataUrl = canvas.toDataURL("image/jpeg", 0.92);
      await onSave(croppedDataUrl);
      onClose();
    } catch (err) {
      console.error("Error cropping image:", err);
      alert("No se pudo guardar el encuadre de la imagen.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md" onClick={onClose}>
      <div
        className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh] border-2 border-emerald-900/20"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#242629] text-white px-6 py-4 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-600 rounded-xl text-white">
              <Move className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Ajustar y Centrar Imagen</h2>
              <p className="text-xs text-stone-300">
                {speciesName ? `Ficha: ${speciesName}` : "Encuadra la foto para que no se vea descuadrada en el catálogo"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-stone-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 bg-[#faf8f2]">
          {/* Instrucciones, formato de aspecto y presets de alineación */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-stone-200 shadow-xs">
            {/* Selector de formato / aspecto */}
            <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setAspectRatio("16/9")}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  aspectRatio === "16/9" ? "bg-white text-emerald-800 shadow-xs font-black" : "text-stone-600 hover:text-stone-900"
                }`}
              >
                16:9 Carrusel
              </button>
              <button
                type="button"
                onClick={() => setAspectRatio("4/3")}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  aspectRatio === "4/3" ? "bg-white text-emerald-800 shadow-xs font-black" : "text-stone-600 hover:text-stone-900"
                }`}
              >
                4:3 Ficha
              </button>
              <button
                type="button"
                onClick={() => setAspectRatio("1/1")}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  aspectRatio === "1/1" ? "bg-white text-emerald-800 shadow-xs font-black" : "text-stone-600 hover:text-stone-900"
                }`}
              >
                1:1 Cuadrada
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-bold text-stone-500 mr-1 hidden sm:inline">Alineación:</span>
              <button
                type="button"
                onClick={() => applyPreset("center")}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-stone-100 hover:bg-stone-200 text-stone-800 transition-colors cursor-pointer"
              >
                🎯 Centrar
              </button>
              <button
                type="button"
                onClick={() => applyPreset("top")}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 transition-colors cursor-pointer flex items-center gap-1"
                title="Alinea hacia arriba para no cortar la cabeza del animal"
              >
                <ArrowUp className="w-3.5 h-3.5" /> Arriba
              </button>
              <button
                type="button"
                onClick={() => applyPreset("bottom")}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-stone-100 hover:bg-stone-200 text-stone-800 transition-colors cursor-pointer flex items-center gap-1"
              >
                <ArrowDown className="w-3.5 h-3.5" /> Abajo
              </button>
              <button
                type="button"
                onClick={() => applyPreset("left")}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-stone-100 hover:bg-stone-200 text-stone-800 transition-colors cursor-pointer flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Izq
              </button>
              <button
                type="button"
                onClick={() => applyPreset("right")}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-stone-100 hover:bg-stone-200 text-stone-800 transition-colors cursor-pointer flex items-center gap-1"
              >
                <ArrowRight className="w-3.5 h-3.5" /> Der
              </button>
            </div>
          </div>

          {/* Interactive Crop Frame Viewport */}
          <div className="relative mx-auto max-w-2xl">
            <div
              ref={containerRef}
              onMouseDown={handleMouseDown}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              style={{ aspectRatio: aspectRatio === "16/9" ? "16/9" : aspectRatio === "4/3" ? "4/3" : "1/1" }}
              className="relative w-full rounded-3xl overflow-hidden bg-stone-950 border-4 border-amber-900/40 shadow-xl cursor-grab active:cursor-grabbing select-none flex items-center justify-center touch-none transition-[aspect-ratio] duration-200"
            >
              {/* Image rendered inside viewport with pan and zoom */}
              <img
                ref={imageRef}
                src={imageUrl}
                alt="Ajuste de especie"
                crossOrigin="anonymous"
                onLoad={() => setImageLoaded(true)}
                draggable={false}
                style={{
                  transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
                  transition: isDragging ? "none" : "transform 0.15s ease-out",
                  maxWidth: "100%",
                  maxHeight: "100%",
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
                className="pointer-events-none select-none"
              />

              {/* Viewport Crosshair / Grid overlay for precision centering */}
              <div className="absolute inset-0 pointer-events-none border border-white/20">
                <div className="absolute left-1/3 top-0 bottom-0 w-[1px] bg-white/20 border-dashed" />
                <div className="absolute right-1/3 top-0 bottom-0 w-[1px] bg-white/20 border-dashed" />
                <div className="absolute top-1/3 left-0 right-0 h-[1px] bg-white/20 border-dashed" />
                <div className="absolute bottom-1/3 left-0 right-0 h-[1px] bg-white/20 border-dashed" />
              </div>

              {/* Hint badge */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-sm text-white px-3 py-1 rounded-full text-[11px] font-semibold pointer-events-none flex items-center gap-1.5 shadow-md">
                <Move className="w-3 h-3 text-amber-400" />
                <span>Arrastra para mover • Ajusta el zoom abajo</span>
              </div>
            </div>
          </div>

          {/* Zoom and Controls Box */}
          <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs font-black text-stone-700 uppercase tracking-wider">
                <ZoomIn className="w-4 h-4 text-emerald-700" />
                <span>Zoom del encuadre: {Math.round(zoom * 100)}%</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setZoom(1.1);
                  setPosition({ x: 0, y: 0 });
                }}
                className="text-xs text-stone-600 hover:text-stone-900 font-bold flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Restablecer
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setZoom((z) => Math.max(1.0, Number((z - 0.1).toFixed(2))))}
                className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 transition-colors cursor-pointer"
                title="Alejar"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <input
                type="range"
                min="1.0"
                max="3.0"
                step="0.05"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="flex-1 accent-emerald-700 h-2 bg-stone-200 rounded-lg cursor-pointer"
              />
              <button
                type="button"
                onClick={() => setZoom((z) => Math.min(3.0, Number((z + 0.1).toFixed(2))))}
                className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 transition-colors cursor-pointer"
                title="Acercar"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>

            {/* Selector de proporción */}
            <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-xs text-stone-600">
              <span className="font-semibold">Formato de Ficha:</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setAspectRatio("4/3")}
                  className={`px-3 py-1 rounded-lg font-bold cursor-pointer transition-colors ${
                    aspectRatio === "4/3"
                      ? "bg-emerald-700 text-white"
                      : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                  }`}
                >
                  Tarjeta (4:3)
                </button>
                <button
                  type="button"
                  onClick={() => setAspectRatio("1/1")}
                  className={`px-3 py-1 rounded-lg font-bold cursor-pointer transition-colors ${
                    aspectRatio === "1/1"
                      ? "bg-emerald-700 text-white"
                      : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                  }`}
                >
                  Cuadrado (1:1)
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 bg-white border-t border-stone-200 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-stone-500 font-medium hidden sm:block">
            El encuadre se guardará en alta resolución para las tarjetas y la ficha pública.
          </p>
          <div className="flex items-center gap-3 ml-auto">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleCropAndSave}
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl text-sm font-bold bg-emerald-700 hover:bg-emerald-800 text-white shadow-md transition-all flex items-center gap-2 cursor-pointer hover:scale-105 active:scale-95"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Aplicar y Guardar Encuadre</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

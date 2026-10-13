import { useState, useRef } from "react";
import { Music, Upload, Play, Square, Search, Filter, CheckCircle2, AlertCircle, Trash2, Volume2, Link as LinkIcon, RefreshCw } from "lucide-react";
import { useZoo } from "../../context/ZooContext";
import { Animal } from "../../data/zooStore";
import { toast } from "sonner";

export function AdminAudios() {
  const { animals, setAnimals, enclosures, currentUser } = useZoo();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "has_audio" | "missing_audio">("all");
  const [filterEnclosure, setFilterEnclosure] = useState<string>("all");
  
  // Track currently playing audio URL
  const [playingUrl, setPlayingUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Filter animals based on user role scope
  const scopedAnimals = currentUser.role === "enclosure_admin"
    ? animals.filter((a) => a.enclosureId === currentUser.enclosureId)
    : animals;

  const filteredAnimals = scopedAnimals.filter((a) => {
    const matchesSearch =
      a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.scientificName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const hasAudio = Boolean(a.soundUrl && a.soundUrl.trim() !== "");
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "has_audio" && hasAudio) ||
      (filterStatus === "missing_audio" && !hasAudio);

    const matchesEnclosure =
      filterEnclosure === "all" ||
      a.enclosureId === filterEnclosure ||
      (filterEnclosure === "none" && !a.enclosureId);

    return matchesSearch && matchesStatus && matchesEnclosure;
  });

  const totalWithAudio = scopedAnimals.filter((a) => Boolean(a.soundUrl && a.soundUrl.trim() !== "")).length;
  const coveragePercent = scopedAnimals.length > 0 ? Math.round((totalWithAudio / scopedAnimals.length) * 100) : 0;

  function togglePlaySound(url: string) {
    if (playingUrl === url) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      setPlayingUrl(null);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => setPlayingUrl(null);
      audio.onerror = () => {
        setPlayingUrl(null);
        toast.error("Error al reproducir la vista previa del audio.");
      };
      setPlayingUrl(url);
      audio.play().catch((err) => {
        console.error(err);
        setPlayingUrl(null);
        toast.error("No se pudo reproducir este archivo de audio.");
      });
    }
  }

  function handleAudioFileSelect(animalId: number, file: File) {
    if (!file) return;
    if (!file.type.startsWith("audio/")) {
      toast.error("Por favor selecciona un archivo de audio válido (.mp3, .wav, .ogg, .m4a).");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      updateAnimalAudio(animalId, dataUrl);
      toast.success(`Audio actualizado para la especie.`);
    };
    reader.onerror = () => {
      toast.error("Error al leer el archivo de audio.");
    };
    reader.readAsDataURL(file);
  }

  function updateAnimalAudio(animalId: number, soundUrl: string) {
    setAnimals(
      animals.map((a) => (a.id === animalId ? { ...a, soundUrl } : a))
    );
  }

  function removeAudio(animalId: number) {
    setAnimals(
      animals.map((a) => (a.id === animalId ? { ...a, soundUrl: "" } : a))
    );
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setPlayingUrl(null);
    toast.info("Audio eliminado de la especie.");
  }

  const getEnclosure = (id: string | null) => enclosures.find((e) => e.id === id);

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-2">
            <Music size={14} /> Gestión Multimedia
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
            Gestión de Audios de Especies
          </h1>
          <p className="text-sm text-gray-500 mt-1 font-medium">
            Agrega, reproduce y administra los archivos de sonido reales para la fauna del zoo.
          </p>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Especies</p>
            <p className="text-3xl font-extrabold text-gray-900 mt-1">{scopedAnimals.length}</p>
          </div>
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center font-bold">
            <Volume2 size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Con Audio</p>
            <p className="text-3xl font-extrabold text-emerald-600 mt-1">{totalWithAudio}</p>
          </div>
          <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center">
            <CheckCircle2 size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Sin Audio</p>
            <p className="text-3xl font-extrabold text-amber-600 mt-1">{scopedAnimals.length - totalWithAudio}</p>
          </div>
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
            <AlertCircle size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Cobertura Audios</p>
            <p className="text-3xl font-extrabold text-teal-600 mt-1">{coveragePercent}%</p>
          </div>
          <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center">
            <RefreshCw size={24} />
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col md:flex-row gap-4 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Buscar especie por nombre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex flex-wrap sm:flex-nowrap gap-3">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">Todos los estados</option>
            <option value="has_audio">Con Audio Configurado</option>
            <option value="missing_audio">Sin Audio Configurado</option>
          </select>

          {currentUser.role === "superadmin" && (
            <select
              value={filterEnclosure}
              onChange={(e) => setFilterEnclosure(e.target.value)}
              className="px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">Todos los recintos</option>
              <option value="none">Sin recinto</option>
              {enclosures.map((enc) => (
                <option key={enc.id} value={enc.id}>
                  {enc.icon} {enc.name}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Animal Audio Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredAnimals.map((animal) => {
          const enc = getEnclosure(animal.enclosureId);
          const hasAudio = Boolean(animal.soundUrl && animal.soundUrl.trim() !== "");
          const isPlaying = playingUrl === animal.soundUrl;

          return (
            <div
              key={animal.id}
              className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden shadow-sm flex flex-col justify-between ${
                hasAudio ? "border-emerald-200 hover:border-emerald-400" : "border-amber-200 hover:border-amber-300"
              }`}
            >
              {/* Header Info */}
              <div className="p-5 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {animal.image ? (
                      <img
                        src={animal.image}
                        alt={animal.name}
                        className="w-14 h-14 rounded-xl object-cover border border-gray-100 bg-gray-50 flex-shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xl flex-shrink-0">
                        {animal.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h3 className="font-extrabold text-gray-900 text-lg leading-tight">{animal.name}</h3>
                      <p className="text-xs text-gray-400 italic mt-0.5">{animal.scientificName}</p>
                      <span className="inline-block mt-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-gray-100 text-gray-700">
                        {animal.category}
                      </span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  {hasAudio ? (
                    <span className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 flex-shrink-0">
                      <CheckCircle2 size={12} /> Audio Listo
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 flex-shrink-0">
                      <AlertCircle size={12} /> Sin Audio
                    </span>
                  )}
                </div>

                {/* Recinto */}
                {enc && (
                  <div className="text-xs font-semibold text-gray-500 flex items-center gap-1.5 pt-1">
                    <span>Recinto:</span>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-white text-[11px] ${enc.color}`}>
                      {enc.icon} {enc.name}
                    </span>
                  </div>
                )}

                {/* Audio Player Box */}
                {hasAudio ? (
                  <div className="bg-emerald-50/70 border border-emerald-100 rounded-xl p-3.5 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <button
                        onClick={() => togglePlaySound(animal.soundUrl!)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-sm ${
                          isPlaying
                            ? "bg-red-600 text-white hover:bg-red-700"
                            : "bg-emerald-700 text-white hover:bg-emerald-800"
                        }`}
                      >
                        {isPlaying ? (
                          <>
                            <Square size={14} className="fill-current" /> Detener Vista Previa
                          </>
                        ) : (
                          <>
                            <Play size={14} className="fill-current" /> Escuchar Audio Real
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => removeAudio(animal.id)}
                        className="p-2 text-red-500 hover:bg-red-100/60 rounded-lg transition-colors cursor-pointer"
                        title="Quitar audio"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    {/* Animated equalizer bars when playing */}
                    {isPlaying && (
                      <div className="flex items-center gap-2 pt-1 px-1">
                        <span className="text-[11px] font-bold text-emerald-800 animate-pulse">Reproduciendo...</span>
                        <div className="flex items-end gap-0.5 h-4 ml-auto">
                          <span className="w-1 bg-emerald-600 rounded-full h-3 animate-bounce"></span>
                          <span className="w-1 bg-emerald-600 rounded-full h-4 animate-bounce delay-100"></span>
                          <span className="w-1 bg-emerald-600 rounded-full h-2 animate-bounce delay-200"></span>
                        </div>
                      </div>
                    )}

                    <div className="text-[11px] text-gray-500 font-mono truncate max-w-full" title={animal.soundUrl}>
                      {animal.soundUrl}
                    </div>
                  </div>
                ) : (
                  <div className="bg-amber-50/60 border border-amber-100 rounded-xl p-3.5 text-center">
                    <p className="text-xs text-amber-800 font-medium mb-1">Esta especie aún no tiene un audio real cargado.</p>
                    <p className="text-[11px] text-amber-600">Sube un archivo de audio o ingresa un enlace URL a continuación.</p>
                  </div>
                )}
              </div>

              {/* Upload and Edit Form Footer */}
              <div className="p-4 bg-gray-50 border-t border-gray-100 space-y-2.5">
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  Cambiar / Asignar Audio
                </label>

                {/* Upload Button */}
                <div className="flex items-center gap-2">
                  <label className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-white border border-gray-200 hover:border-emerald-500 hover:bg-emerald-50/30 text-emerald-800 rounded-xl text-xs font-bold transition cursor-pointer shadow-sm">
                    <Upload size={14} /> Subir desde equipo (.mp3)
                    <input
                      type="file"
                      accept="audio/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleAudioFileSelect(animal.id, file);
                      }}
                    />
                  </label>
                </div>

                {/* Custom URL Input */}
                <div className="relative">
                  <input
                    type="url"
                    placeholder="o pega URL de audio (http://...)"
                    defaultValue={animal.soundUrl ?? ""}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        const val = (e.target as HTMLInputElement).value.trim();
                        updateAnimalAudio(animal.id, val);
                        toast.success("URL de audio guardada.");
                      }
                    }}
                    onBlur={(e) => {
                      const val = e.target.value.trim();
                      if (val !== (animal.soundUrl ?? "")) {
                        updateAnimalAudio(animal.id, val);
                        toast.success("URL de audio guardada.");
                      }
                    }}
                    className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-xl text-xs font-medium text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <LinkIcon size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              </div>
            </div>
          );
        })}

        {filteredAnimals.length === 0 && (
          <div className="col-span-full bg-white border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center text-gray-500 font-medium">
            No se encontraron especies con los filtros seleccionados.
          </div>
        )}
      </div>
    </div>
  );
}

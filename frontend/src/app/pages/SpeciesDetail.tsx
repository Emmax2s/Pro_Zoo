import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams, useSearchParams } from "react-router";
import { Volume2, VolumeX, Globe, TreePine, MapPin, Sparkles, ShieldCheck, Play, Pause, ArrowLeft, Video, Camera } from "lucide-react";
import { useZoo } from "../context/ZooContext";
import { recordSpeciesVisit } from "../services/analytics";
import { getLocalizedAnimal, useLocalizedAnimal, translateAnimalName, translateTextAsync, LocalizedAnimalData } from "../services/speciesTranslator";
import { pauseAllAudio, playChime, resumeAllAudio, speakNarration, stopAllAudio } from "../services/audioPlayer";
import { generateServerNarration } from "../services/ttsService";
import { Animal } from "../data/zooStore";

const API_BASE_URL = ((import.meta.env.VITE_API_BASE_URL as string | undefined) || "").replace(/\/$/, "");

function buildFullNarrationText(
  data: {
    name: string;
    scientificName?: string;
    category?: string;
    status?: string;
    funFact?: string;
    habitat?: string;
    diet?: string;
  },
  isEn: boolean
): string {
  const parts: string[] = [];

  if (isEn) {
    parts.push(`Official Wildlife Guide: ${data.name}.`);
    if (data.scientificName) {
      parts.push(`Scientific name: ${data.scientificName}.`);
    }
    if (data.category) {
      parts.push(`Classification: ${data.category}.`);
    }
    if (data.status) {
      parts.push(`Conservation status: ${data.status}.`);
    }
    if (data.funFact) {
      parts.push(`About this species: ${data.funFact}.`);
    }
    if (data.habitat) {
      parts.push(`Habitat and distribution: ${data.habitat}.`);
    }
    if (data.diet) {
      parts.push(`Diet and feeding habits: ${data.diet}.`);
    }
  } else {
    parts.push(`Ficha oficial de fauna: ${data.name}.`);
    if (data.scientificName) {
      parts.push(`Nombre científico: ${data.scientificName}.`);
    }
    if (data.category) {
      parts.push(`Clasificación: ${data.category}.`);
    }
    if (data.status) {
      parts.push(`Estado de conservación: ${data.status}.`);
    }
    if (data.funFact) {
      parts.push(`Sobre esta especie: ${data.funFact}.`);
    }
    if (data.habitat) {
      parts.push(`Hábitat y distribución: ${data.habitat}.`);
    }
    if (data.diet) {
      parts.push(`Alimentación: ${data.diet}.`);
    }
  }

  return parts.filter(Boolean).join(" ");
}

export function SpeciesDetail() {
  const { idOrSlug } = useParams<{ idOrSlug: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const { animals, enclosures } = useZoo();
  const { t } = useTranslation();

  // El idioma de la ficha se maneja de forma local para no alterar el idioma del resto de la página (navbar, pie de página, etc.)
  const [sheetLang, setSheetLang] = useState<"es" | "en">(() => {
    const urlLang = searchParams.get("lang");
    return urlLang === "en" || urlLang === "es" ? urlLang : "es";
  });

  const [species, setSpecies] = useState<Animal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isPausedAudio, setIsPausedAudio] = useState(false);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);

  const matchedEnclosure = useMemo(() => {
    if (!species) return null;
    return enclosures.find(
      (e) => e.id === species.enclosureId || e.name.toLowerCase() === String(species.enclosureId).toLowerCase()
    );
  }, [enclosures, species]);

  const getStatusBadgeStyle = (status: string) => {
    const s = (status || "").toLowerCase();
    if (s.includes("peligro") || s === "endangered") {
      return "bg-red-900/90 text-red-200 border-red-400/40";
    }
    if (s.includes("amenaz") || s === "threatened") {
      return "bg-amber-900/90 text-amber-200 border-amber-400/40";
    }
    if (s.includes("proteg") || s.includes("special")) {
      return "bg-blue-900/90 text-blue-200 border-blue-400/40";
    }
    return "bg-emerald-900/90 text-emerald-200 border-emerald-400/40";
  };

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const visitLoggedRef = useRef(false);

  // Sincronizar parámetro ?lang en URL si cambia externamente, sin alterar el idioma global del sitio
  useEffect(() => {
    const urlLang = searchParams.get("lang");
    if ((urlLang === "en" || urlLang === "es") && urlLang !== sheetLang) {
      setSheetLang(urlLang);
    }
  }, [searchParams, sheetLang]);

  const isEnglish = sheetLang === "en";

  // Carga de la especie (en el idioma específico de la ficha)
  useEffect(() => {
    if (!idOrSlug) {
      setError(t("speciesDetail.notFound", { lng: sheetLang }));
      setLoading(false);
      return;
    }

    const availableAnimals = animals;
    const findLocal = () =>
      availableAnimals.find(
        (a) =>
          String(a.id) === String(idOrSlug) ||
          a.name.toLowerCase().trim() === decodeURIComponent(idOrSlug).toLowerCase().trim() ||
          a.scientificName.toLowerCase().trim() === decodeURIComponent(idOrSlug).toLowerCase().trim()
      );

    const localMatch = findLocal();
    if (localMatch) {
      setSpecies(localMatch);
      setError("");
      setLoading(false);
    }

    let active = true;
    fetch(`${API_BASE_URL || ""}/api/species/${encodeURIComponent(idOrSlug)}?lang=${sheetLang}`, { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) throw new Error(t("speciesDetail.apiUnavailable", { lng: sheetLang }));
        const data = await res.json();
        if (active && data) {
          setSpecies({
            id: Number(data.id) || 1,
            name: data.name || "",
            scientificName: data.species || data.scientificName || "",
            category: data.category || "Mamífero",
            status: data.conservation || data.status || "Amenazada",
            habitat: data.habitat || "",
            diet: data.diet || "",
            funFact: data.description || data.funFact || "",
            image: data.imageUrl || data.image || "",
            audioUrl: data.audioDescriptionUrl || data.audioUrl,
            enclosureId: data.enclosureId ?? null,
            mediaImages: Array.isArray(data.mediaImages) && data.mediaImages.length > 0
              ? data.mediaImages.slice(0, 4)
              : data.imageUrl ? [data.imageUrl] : data.image ? [data.image] : [],
            mediaVideos: Array.isArray(data.mediaVideos) ? data.mediaVideos.slice(0, 2) : [],
            lsmVideoUrl: data.lsmVideoUrl || "",
            isVisibleToPublic: data.isVisibleToPublic !== false,
          });
          setError("");
        }
      })
      .catch(() => {
        if (active) {
          const fallback = findLocal();
          if (fallback) {
            setSpecies(fallback);
            setError("");
          } else if (!localMatch) {
            setError(t("speciesDetail.notFound", { lng: sheetLang }));
          }
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [idOrSlug, animals, sheetLang, t]);

  // Registro de analítica de visita
  useEffect(() => {
    if (!species || visitLoggedRef.current) return;
    visitLoggedRef.current = true;

    const isQr = searchParams.get("scan") === "qr" || window.location.search.includes("qr");
    recordSpeciesVisit(species.id, sheetLang, isQr ? "qr" : "direct");
  }, [species, searchParams, sheetLang]);

  // Propiedades localizadas exclusivamente para esta ficha
  const loc = useLocalizedAnimal(species, !isEnglish);

  // Reproducción de audio en el idioma de la ficha
  const startAudio = useCallback(async (targetLoc = loc) => {
    if (!targetLoc) return;

    stopAllAudio();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    playChime();

    // Cuando la ficha está en inglés, garantizar que todos los textos estén traducidos
    let activeLoc = targetLoc;
    if (isEnglish) {
      const [nameEn, funFactEn, habitatEn, dietEn] = await Promise.all([
        translateAnimalName(activeLoc.name) || translateTextAsync(activeLoc.name, "es", "en"),
        translateTextAsync(activeLoc.funFact, "es", "en"),
        translateTextAsync(activeLoc.habitat, "es", "en"),
        translateTextAsync(activeLoc.diet, "es", "en"),
      ]);
      activeLoc = {
        ...activeLoc,
        name: nameEn || activeLoc.name,
        funFact: funFactEn || activeLoc.funFact,
        habitat: habitatEn || activeLoc.habitat,
        diet: dietEn || activeLoc.diet,
      };
    }

    // Construir la narración completa que lee toda la ficha de la especie
    const narrationText = buildFullNarrationText(activeLoc, isEnglish);

    const playGeneratedNarration = (audioUrl: string) => {
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      audio.onplay = () => {
        setIsPlayingAudio(true);
        setIsPausedAudio(false);
        setAutoplayBlocked(false);
      };
      audio.onpause = () => setIsPlayingAudio(false);
      audio.onended = () => {
        setIsPlayingAudio(false);
        setIsPausedAudio(false);
      };
      audio.onerror = () => {
        audioRef.current = null;
        speakNarration(narrationText, !isEnglish, () => setIsPlayingAudio(true), () => setIsPlayingAudio(false));
      };
      void audio.play().catch(() => {
        audioRef.current = null;
        speakNarration(narrationText, !isEnglish, () => setIsPlayingAudio(true), () => setIsPlayingAudio(false));
      });
    };

    // Si estamos en español y el animal tiene un audio personalizado subido, reproducirlo
    // Pero si estamos en inglés, NUNCA reproducir el audio en español; leer toda la ficha en inglés
    if (!isEnglish && activeLoc.audioUrl && !activeLoc.audioUrl.includes("example.com")) {
      const audio = new Audio(activeLoc.audioUrl);
      audioRef.current = audio;

      audio.onplay = () => {
        setIsPlayingAudio(true);
        setIsPausedAudio(false);
        setAutoplayBlocked(false);
      };
      audio.onpause = () => setIsPlayingAudio(false);
      audio.onended = () => {
        setIsPlayingAudio(false);
        setIsPausedAudio(false);
      };
      audio.onerror = () => {
        audioRef.current = null;
        speakNarration(
          narrationText,
          true,
          () => setIsPlayingAudio(true),
          () => {
            setIsPlayingAudio(false);
            setIsPausedAudio(false);
          }
        );
      };

      audio.play().catch(() => {
        audioRef.current = null;
        speakNarration(
          narrationText,
          true,
          () => setIsPlayingAudio(true),
          () => {
            setIsPlayingAudio(false);
            setIsPausedAudio(false);
          }
        );
      });
      return;
    }

    // Intentar primero con el servicio de narración del servidor (Edge Neural / Google TTS)
    try {
      const generated = await generateServerNarration(narrationText, isEnglish ? "en" : "es");
      if (generated && generated.url) {
        playGeneratedNarration(generated.url);
        return;
      }
    } catch {
      // Continuar al sintetizador del navegador
    }

    // Fallback con sintetizador de voz del navegador con chunking y keepalive
    speakNarration(
      narrationText,
      !isEnglish,
      () => {
        setIsPlayingAudio(true);
        setIsPausedAudio(false);
      },
      () => {
        setIsPlayingAudio(false);
        setIsPausedAudio(false);
      }
    );
  }, [loc, isEnglish]);

  const toggleAudio = useCallback(() => {
    if (isPlayingAudio) {
      if (audioRef.current) {
        audioRef.current.pause();
      } else {
        pauseAllAudio();
      }
      setIsPlayingAudio(false);
      setIsPausedAudio(true);
    } else if (isPausedAudio) {
      if (audioRef.current) {
        void audioRef.current.play().catch(() => setIsPausedAudio(false));
      } else {
        resumeAllAudio();
      }
      setIsPlayingAudio(true);
      setIsPausedAudio(false);
    } else {
      startAudio();
    }
  }, [isPausedAudio, isPlayingAudio, startAudio]);

  // Reproducción automática una sola vez cuando se escanea por QR
  const hasAutoPlayedRef = useRef(false);
  useEffect(() => {
    if (!loc || hasAutoPlayedRef.current) return;

    const isQr = searchParams.get("scan") === "qr" || window.location.search.includes("qr");
    if (!isQr) return;
    hasAutoPlayedRef.current = true;

    const timer = setTimeout(() => {
      startAudio(loc);
    }, 600);

    return () => {
      clearTimeout(timer);
    };
  }, [loc, searchParams, startAudio]);

  // Limpieza al desmontar
  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
      stopAllAudio();
    };
  }, []);

  // Cambiar el idioma EXCLUSIVAMENTE de esta ficha sin afectar la página global
  const toggleLanguage = () => {
    stopAllAudio();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsPlayingAudio(false);
    setIsPausedAudio(false);
    const nextLang = isEnglish ? "es" : "en";
    setSheetLang(nextLang);
    const newParams = new URLSearchParams(searchParams);
    newParams.set("lang", nextLang);
    setSearchParams(newParams, { replace: true });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf8f2] flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="font-adventure text-2xl text-[#2b1810]">
            {t("speciesDetail.loading", { lng: sheetLang })}
          </p>
        </div>
      </div>
    );
  }

  if (error || !species || !loc) {
    return (
      <div className="min-h-screen bg-[#faf8f2] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border-2 border-amber-800/20 shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto text-amber-800">
            <TreePine className="w-8 h-8" />
          </div>
          <h2 className="font-adventure text-3xl text-[#2b1810] text-adventure-shadow">
            {t("speciesDetail.notFound", { lng: sheetLang })}
          </h2>
          <p className="text-stone-600 text-base">{error || t("speciesDetail.notFoundDescription", { lng: sheetLang })}</p>
          <Link
            to="/especies"
            className="inline-flex items-center gap-2 wood-texture-bg text-amber-200 border-2 border-amber-600 px-6 py-3 rounded-2xl font-adventure text-base shadow-lg hover:scale-105 transition-transform wood-button-shadow"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>{t("speciesDetail.backToCatalog", { lng: sheetLang })}</span>
          </Link>
        </div>
      </div>
    );
  }

  const extraImages = (loc.mediaImages || []).filter((url) => Boolean(url) && url !== species.image);
  const extraVideos = (loc.mediaVideos || []).filter(Boolean);
  const hasExtraMedia = extraImages.length > 0 || extraVideos.length > 0;

  return (
    <div className="min-h-screen bg-[#faf8f2] text-stone-900 pb-20">
      {/* 1. Header Banner de la ficha - Compacto y sin espacios excesivos */}
      <section className="relative bg-[#f7f3e8] border-b-2 border-amber-900/30 py-4 sm:py-6 overflow-hidden">
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(#854d0e 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <Link
              to="/especies"
              className="inline-flex items-center gap-2 text-stone-700 hover:text-amber-900 font-bold text-sm sm:text-base transition-all duration-200 hover:scale-105 active:scale-95 bg-white/90 hover:bg-white px-3.5 py-1.5 rounded-xl border border-amber-800/20 shadow-xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t("speciesDetail.backToWildlifeCatalog", { lng: sheetLang })}</span>
            </Link>

            {/* Selector de Idioma Exclusivo de la Ficha (Segmented Switch) */}
            <div className="inline-flex items-center rounded-xl bg-white p-1 shadow-sm border border-amber-700/30 gap-1 select-none">
              <Globe className="w-3.5 h-3.5 text-emerald-800 ml-1.5 mr-0.5" />
              <button
                type="button"
                onClick={() => {
                  if (sheetLang !== "es") toggleLanguage();
                }}
                className={`px-3 py-1 rounded-lg font-black text-xs transition-all duration-200 cursor-pointer ${
                  !isEnglish
                    ? "bg-[#2b1810] text-amber-200 shadow-sm"
                    : "text-stone-700 hover:text-stone-950 hover:bg-amber-100/60"
                }`}
              >
                ESPAÑOL
              </button>
              <button
                type="button"
                onClick={() => {
                  if (sheetLang !== "en") toggleLanguage();
                }}
                className={`px-3 py-1 rounded-lg font-black text-xs transition-all duration-200 cursor-pointer ${
                  isEnglish
                    ? "bg-[#2b1810] text-amber-200 shadow-sm"
                    : "text-stone-700 hover:text-stone-950 hover:bg-amber-100/60"
                }`}
              >
                ENGLISH
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 sm:gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-100/90 text-amber-950 text-xs font-black tracking-wide uppercase shadow-2xs border border-amber-300 mb-1.5">
                <TreePine className="w-3.5 h-3.5 text-emerald-800" />
                <span>{t("speciesDetail.qrGuide", { lng: sheetLang })}</span>
              </div>
              <h1 className="font-adventure text-3xl sm:text-4xl lg:text-5xl text-[#2b1810] tracking-wide text-adventure-shadow leading-tight">
                {loc.name || species.name}
              </h1>
            </div>

            {(loc.scientificName || species.scientificName) && (
              <p className="text-lg sm:text-xl font-serif italic text-amber-900 font-medium sm:text-right">
                ({loc.scientificName || species.scientificName})
              </p>
            )}
          </div>
        </div>

        {/* Rustic Wood Beam */}
        <div className="wood-texture-bg h-2.5 sm:h-3 w-full border-t border-b border-amber-950/70 shadow-xs mt-3 sm:mt-4" />
      </section>

      {/* 2. Main Content Card */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Distribución en 2 Columnas para vista balanceada y foto completa */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Columna Izquierda: Fotografía 4:3 + Audioguía */}
          <div className="lg:col-span-5 space-y-4">
            {species.image && (
              <div className="interactive-card relative aspect-[4/3] w-full rounded-3xl overflow-hidden bg-stone-950 shadow-xl border-2 border-amber-900/20 flex items-center justify-center">
                {/* Fondo difuminado ambiental para que se aprecie completo sin recortar partes de la especie */}
                <img
                  src={species.image}
                  alt=""
                  aria-hidden="true"
                  className="absolute inset-0 w-full h-full object-cover blur-md opacity-35 scale-105 pointer-events-none"
                />
                <img
                  src={species.image}
                  alt={loc.name || species.name}
                  className="relative z-10 w-full h-full object-contain"
                />
                <div className="absolute top-3.5 left-3.5 z-20">
                  <span className="bg-black/75 backdrop-blur-md text-amber-300 border border-amber-400/40 text-xs font-black px-3.5 py-1 rounded-full uppercase tracking-wider shadow-md">
                    {matchedEnclosure ? `${matchedEnclosure.icon ? `${matchedEnclosure.icon} ` : ""}${matchedEnclosure.name}` : (loc.category || species.category)}
                  </span>
                </div>
                <div className="absolute top-3.5 right-3.5 z-20">
                  <span className={`backdrop-blur-md border text-xs font-black px-3.5 py-1 rounded-full shadow-md ${getStatusBadgeStyle(loc.status || species.status)}`}>
                    {loc.status || species.status}
                  </span>
                </div>
              </div>
            )}

            {/* Barra de audioguía oficial compacta */}
            <div className="bg-gradient-to-r from-amber-900 via-[#8B5A2B] to-[#5C3A1E] text-white p-4 sm:p-5 rounded-2xl shadow-lg border border-amber-500/50 relative overflow-hidden">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={toggleAudio}
                    className="w-12 h-12 rounded-2xl bg-amber-400 hover:bg-amber-300 text-stone-950 flex items-center justify-center shadow-md transition-all duration-200 hover:scale-110 active:scale-95 flex-shrink-0 cursor-pointer will-change-transform"
                    aria-label={isPlayingAudio ? "Pausar audio" : "Reproducir audio"}
                  >
                    {isPlayingAudio ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
                  </button>
                  <div>
                    <p className="font-adventure text-lg sm:text-xl text-amber-200 leading-tight">
                      {isPlayingAudio
                        ? t("speciesDetail.playingAudio", { lng: sheetLang })
                        : t("speciesDetail.listenAudio", { lng: sheetLang })}
                    </p>
                    <p className="text-amber-100/80 text-xs sm:text-sm font-medium">
                      {t("speciesDetail.audioDescription", { lng: sheetLang })}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={toggleAudio}
                  className="hidden sm:inline-flex px-3.5 py-2 rounded-xl bg-white hover:bg-amber-100 text-stone-950 font-adventure text-xs tracking-wide shadow transition-all duration-200 hover:scale-105 active:scale-95 items-center gap-1.5 cursor-pointer will-change-transform"
                >
                  <Volume2 className="w-4 h-4 text-emerald-800" />
                  <span>{isPlayingAudio ? t("speciesDetail.pauseAudio", { lng: sheetLang }) : t("speciesDetail.playAudio", { lng: sheetLang })}</span>
                </button>
              </div>

              {autoplayBlocked && !isPlayingAudio && (
                <div className="mt-2.5 bg-amber-500/20 border border-amber-300/40 p-2 rounded-xl text-center text-xs font-semibold text-amber-100 animate-pulse">
                  {t("speciesDetail.autoplayHint", { lng: sheetLang })}
                </div>
              )}
            </div>
          </div>

          {/* Columna Derecha: Sobre esta especie + Atributos + LSM */}
          <div className="lg:col-span-7 space-y-4">
            {/* Sobre esta especie */}
            <div className="interactive-card bg-white p-6 sm:p-7 rounded-3xl border border-[#e2d5bd] shadow-lg space-y-3">
              <h2 className="font-adventure text-2xl sm:text-3xl text-[#2b1810] flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-amber-600" />
                <span>{t("speciesDetail.aboutSpecies", { lng: sheetLang })}</span>
              </h2>
              <p className="text-stone-800 text-base sm:text-lg leading-relaxed font-medium">
                {loc.funFact || species.funFact}
              </p>
            </div>

            {/* Cuadrícula de Atributos: Hábitat y Alimentación */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="interactive-card bg-white p-5 rounded-2xl border border-amber-900/10 shadow-sm hover:border-amber-500/40 transition-colors">
                <h3 className="font-adventure text-lg text-amber-950 mb-2 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-emerald-700 flex-shrink-0" />
                  <span>{t("speciesDetail.habitatRange", { lng: sheetLang })}</span>
                </h3>
                <p className="text-stone-700 text-sm sm:text-base leading-relaxed">
                  {loc.habitat || species.habitat}
                </p>
              </div>

              <div className="interactive-card bg-white p-5 rounded-2xl border border-amber-900/10 shadow-sm hover:border-amber-500/40 transition-colors">
                <h3 className="font-adventure text-lg text-amber-950 mb-2 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-amber-700 flex-shrink-0" />
                  <span>{t("speciesDetail.dietHabits", { lng: sheetLang })}</span>
                </h3>
                <p className="text-stone-700 text-sm sm:text-base leading-relaxed">
                  {loc.diet || species.diet}
                </p>
              </div>
            </div>

            {/* Video en Lengua de Señas Mexicana (LSM) */}
            <div className="overflow-hidden rounded-2xl border-2 border-emerald-700/20 bg-white shadow-md">
              <div className="flex items-center gap-2 bg-emerald-800 px-4 py-2.5 text-xs sm:text-sm font-black uppercase tracking-wider text-white">
                <Video className="h-4 w-4 text-amber-300" />
                <span>{isEnglish ? "MEXICAN SIGN LANGUAGE INTERPRETATION (LSM)" : "INTERPRETACIÓN EN LENGUA DE SEÑAS MEXICANA (LSM)"}</span>
              </div>
              <div className="p-3 sm:p-4">
                {(loc.lsmVideoUrl || species.lsmVideoUrl) ? (
                  <video
                    src={loc.lsmVideoUrl || species.lsmVideoUrl}
                    controls
                    playsInline
                    preload="metadata"
                    className="w-full aspect-video rounded-xl bg-slate-950 object-contain shadow-inner"
                  >
                    {isEnglish ? "Your browser does not support video playback." : "Tu navegador no soporta la reproducción de video."}
                  </video>
                ) : (
                  <div className="rounded-xl border border-emerald-900/10 bg-[#fcfaf5] p-3 text-xs sm:text-sm font-semibold leading-relaxed text-stone-600">
                    {isEnglish ? "The official sign language video will be available soon." : "El video en lengua de señas estará disponible próximamente."}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Galería Adicional de Fotos y Videos (excluyendo la portada para no duplicarla) */}
        {hasExtraMedia && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#e2d5bd] shadow-md space-y-4">
            <h3 className="font-adventure text-xl sm:text-2xl text-[#2b1810] flex items-center gap-2">
              <Camera className="w-5 h-5 text-emerald-700" />
              <span>{isEnglish ? "Photo & Video Gallery" : "Galería de Fotos y Videos"}</span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {extraImages.map((url, index) => (
                <div key={url} className="aspect-square rounded-2xl overflow-hidden border border-amber-900/10 shadow-xs bg-stone-100 hover:shadow-md transition-shadow">
                  <img
                    src={url}
                    alt={`${loc.name || species.name} ${index + 1}`}
                    loading="lazy"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ))}
              {extraVideos.map((url) => (
                <div key={url} className="aspect-square rounded-2xl overflow-hidden border border-amber-900/10 shadow-xs bg-black">
                  <video
                    src={url}
                    controls
                    playsInline
                    preload="metadata"
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

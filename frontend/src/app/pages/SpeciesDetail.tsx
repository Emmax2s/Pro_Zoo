import { useEffect, useRef, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams, useSearchParams } from "react-router";
import { Volume2, VolumeX, Globe, TreePine, MapPin, Sparkles, ShieldCheck, Play, Pause, ArrowLeft } from "lucide-react";
import { useZoo } from "../context/ZooContext";
import { recordSpeciesVisit } from "../services/analytics";
import { getLocalizedAnimal, useLocalizedAnimal } from "../services/speciesTranslator";
import { pauseAllAudio, playChime, resumeAllAudio, speakNarration, stopAllAudio } from "../services/audioPlayer";
import { generateServerNarration } from "../services/ttsService";
import { Animal } from "../data/zooStore";

const API_BASE_URL = ((import.meta.env.VITE_API_BASE_URL as string | undefined) || "").replace(/\/$/, "");

export function SpeciesDetail() {
  const { idOrSlug } = useParams<{ idOrSlug: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const { animals } = useZoo();
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

    if (!API_BASE_URL) {
      const match = findLocal();
      if (match) {
        setSpecies(match);
      } else {
        setError(t("speciesDetail.catalogNotFound", { lng: sheetLang }));
      }
      setLoading(false);
      return;
    }

    let active = true;
    fetch(`${API_BASE_URL}/api/species/${encodeURIComponent(idOrSlug)}?lang=${sheetLang}`, { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) throw new Error(t("speciesDetail.apiUnavailable", { lng: sheetLang }));
        const data = await res.json();
        if (active) {
          setSpecies({
            id: Number(data.id) || 1,
            name: data.name,
            scientificName: data.species || data.scientificName || "",
            category: data.category || "",
            status: data.conservation || "",
            habitat: data.habitat || "",
            diet: data.diet || "",
            funFact: data.description || data.funFact || "",
            image: data.imageUrl || data.image || "",
            audioUrl: data.audioDescriptionUrl,
            enclosureId: data.enclosureId ?? null,
            mediaImages: Array.isArray(data.mediaImages) ? data.mediaImages.slice(0, 4) : data.imageUrl ? [data.imageUrl] : [],
            mediaVideos: Array.isArray(data.mediaVideos) ? data.mediaVideos.slice(0, 2) : [],
            lsmVideoUrl: data.lsmVideoUrl || "",
            isVisibleToPublic: data.isVisibleToPublic !== false,
          });
        }
      })
      .catch(() => {
        const match = findLocal();
        if (active && match) {
          setSpecies(match);
          setError("");
        } else if (active) {
          setError(t("speciesDetail.notFound", { lng: sheetLang }));
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
  const startAudio = useCallback((targetLoc = loc) => {
    if (!targetLoc) return;
    playChime();
    const narrationText = `${targetLoc.name}. ${targetLoc.scientificName ? `(${targetLoc.scientificName}).` : ""} ${targetLoc.funFact}. ${targetLoc.habitat}. ${targetLoc.diet}.`;

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

    if (targetLoc.audioUrl && !targetLoc.audioUrl.includes("example.com")) {
      const audio = new Audio(targetLoc.audioUrl);
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
          !isEnglish,
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
          !isEnglish,
          () => setIsPlayingAudio(true),
          () => {
            setIsPlayingAudio(false);
            setIsPausedAudio(false);
          }
        );
      });
    } else {
      void generateServerNarration(narrationText, isEnglish ? "en" : "es")
        .then((generated) => {
          if (generated) {
            playGeneratedNarration(generated.url);
            return;
          }
          speakNarration(narrationText, !isEnglish, () => setIsPlayingAudio(true), () => setIsPlayingAudio(false));
        })
        .catch(() => {
          speakNarration(narrationText, !isEnglish, () => setIsPlayingAudio(true), () => setIsPlayingAudio(false));
        });
    }
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

  return (
    <div className="min-h-screen bg-[#faf8f2] text-stone-900 pb-20">
      {/* 1. Header Banner de la ficha */}
      <section className="reveal-on-scroll relative bg-[#f7f3e8] border-b-4 border-[#2b1706] py-12 md:py-16 overflow-hidden">
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(#854d0e 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <Link
              to="/especies"
              className="inline-flex items-center gap-2 text-stone-700 hover:text-amber-900 font-bold text-base transition-all duration-200 hover:scale-105 active:scale-95 hover:-translate-y-0.5 bg-white/80 hover:bg-white px-4 py-2 rounded-xl border border-amber-800/20 shadow-xs will-change-transform"
            >
              <ArrowLeft className="w-5 h-5 transition-transform duration-200 group-hover:-translate-x-1" />
              <span>{t("speciesDetail.backToWildlifeCatalog", { lng: sheetLang })}</span>
            </Link>

            {/* Botón de Cambio de Idioma Exclusivo de la Ficha */}
            <button
              onClick={toggleLanguage}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-amber-50 text-stone-900 font-bold border-2 border-amber-700/30 shadow-md transition-all duration-200 hover:scale-105 active:scale-95 hover:-translate-y-0.5 text-sm cursor-pointer will-change-transform"
              title={t("speciesDetail.switchToEnglish", { lng: sheetLang })}
            >
              <Globe className="w-4 h-4 text-emerald-700" />
              <span>{t("speciesDetail.switchToEnglish", { lng: sheetLang })}</span>
            </button>
          </div>

          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100/90 text-amber-950 text-xs sm:text-sm font-black tracking-wide uppercase shadow-xs border border-amber-300">
              <TreePine className="w-4 h-4 text-emerald-800" />
              <span>{t("speciesDetail.qrGuide", { lng: sheetLang })}</span>
            </div>

            <h1 className="font-adventure text-4xl sm:text-6xl text-[#2b1810] tracking-wide text-adventure-shadow leading-tight">
              {loc.name}
            </h1>

            {loc.scientificName && (
              <p className="text-xl sm:text-2xl font-serif italic text-amber-900 font-medium">
                ({loc.scientificName})
              </p>
            )}
          </div>
        </div>

        {/* Rustic Wood Beam */}
        <div className="wood-texture-bg h-4 sm:h-5 w-full border-t border-b-2 border-amber-950/80 shadow-md mt-8" />
      </section>

      {/* 2. Main Content Card */}
      <main className="reveal-on-scroll max-w-5xl mx-auto px-4 sm:px-6 mt-8 space-y-8">
        {/* Barra de audioguía oficial */}
        <div className="bg-gradient-to-r from-amber-900 via-[#8B5A2B] to-[#5C3A1E] text-white p-5 sm:p-6 rounded-3xl shadow-xl border-2 border-amber-500/60 relative overflow-hidden hover:border-amber-400 transition-colors duration-300">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-center sm:text-left">
              <button
                onClick={toggleAudio}
                className="w-14 h-14 rounded-2xl bg-amber-400 hover:bg-amber-300 text-stone-950 flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110 active:scale-90 flex-shrink-0 cursor-pointer will-change-transform"
              >
                {isPlayingAudio ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 ml-0.5" />}
              </button>
              <div>
                <p className="font-adventure text-xl sm:text-2xl text-amber-200">
                  {isPlayingAudio
                    ? t("speciesDetail.playingAudio", { lng: sheetLang })
                    : t("speciesDetail.listenAudio", { lng: sheetLang })}
                </p>
                <p className="text-amber-100/90 text-sm font-medium">
                  {t("speciesDetail.audioDescription", { lng: sheetLang })}
                </p>
              </div>
            </div>

            <button
              onClick={toggleAudio}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-white hover:bg-amber-100 text-stone-950 font-adventure text-base tracking-wide shadow-md transition-all duration-200 hover:scale-105 active:scale-95 hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer will-change-transform"
            >
              <Volume2 className="w-5 h-5 text-emerald-800" />
              <span>{isPlayingAudio ? t("speciesDetail.pauseAudio", { lng: sheetLang }) : t("speciesDetail.playAudio", { lng: sheetLang })}</span>
            </button>
          </div>

          {autoplayBlocked && !isPlayingAudio && (
            <div className="mt-3 bg-amber-500/20 border border-amber-300/40 p-2.5 rounded-xl text-center text-xs sm:text-sm font-semibold text-amber-100 animate-pulse">
              {t("speciesDetail.autoplayHint", { lng: sheetLang })}
            </div>
          )}
        </div>

        {/* Fotografía de la especie */}
        <div className="interactive-card bg-white rounded-3xl overflow-hidden shadow-2xl border-2 border-[#e2d5bd] hover:border-amber-600/40 transition-colors duration-300 will-change-transform">
          {species.image && (
            <div className="relative w-full h-[320px] sm:h-[420px] md:h-[480px] bg-stone-950 flex items-center justify-center overflow-hidden">
              <img
                src={species.image}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-40 scale-110 pointer-events-none"
              />
              <img
                src={species.image}
                alt={loc.name}
                className="relative z-10 max-h-full max-w-full w-auto h-auto object-contain object-center"
              />
              <div className="absolute top-4 left-4 z-20">
                <span className="bg-black/60 backdrop-blur-md text-amber-300 border border-amber-400/40 text-xs sm:text-sm font-extrabold px-4 py-1.5 rounded-full uppercase tracking-wider">
                  {loc.category}
                </span>
              </div>
              <div className="absolute top-4 right-4 z-20">
                <span className="bg-emerald-900/80 backdrop-blur-md text-emerald-200 border border-emerald-400/40 text-xs sm:text-sm font-extrabold px-4 py-1.5 rounded-full">
                  {loc.status}
                </span>
              </div>
            </div>
          )}

          {/* Contenido descriptivo de la ficha */}
          <div className="p-6 sm:p-10 space-y-8">
            {(loc.mediaImages.length > 0 || loc.mediaVideos.length > 0) && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {loc.mediaImages.map((url, index) => (
                  <img
                    key={url}
                    src={url}
                    alt={`${loc.name} ${index + 1}`}
                    loading="lazy"
                    className="aspect-square w-full rounded-2xl object-cover"
                  />
                ))}
                {loc.mediaVideos.map((url) => (
                  <video
                    key={url}
                    src={url}
                    controls
                    playsInline
                    preload="metadata"
                    className="aspect-square w-full rounded-2xl bg-black object-cover"
                  />
                ))}
              </div>
            )}
            
            {/* Sobre esta especie */}
            <div className="space-y-3">
              <h2 className="font-adventure text-2xl sm:text-3xl text-[#2b1810] flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-amber-600" />
                <span>{t("speciesDetail.aboutSpecies", { lng: sheetLang })}</span>
              </h2>
              <p className="text-stone-800 text-lg sm:text-xl leading-relaxed font-medium">
                {loc.funFact}
              </p>
            </div>

            {/* Cuadrícula de Atributos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-amber-900/10">
              <div className="interactive-card bg-[#fcfaf5] p-6 rounded-2xl border border-amber-900/10 shadow-xs hover:-translate-y-1 hover:shadow-md hover:border-amber-500/40 transition-all duration-200 will-change-transform">
                <h3 className="font-adventure text-xl text-amber-950 mb-2 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-emerald-700" />
                  <span>{t("speciesDetail.habitatRange", { lng: sheetLang })}</span>
                </h3>
                <p className="text-stone-700 text-base sm:text-lg leading-relaxed">
                  {loc.habitat}
                </p>
              </div>

              <div className="interactive-card bg-[#fcfaf5] p-6 rounded-2xl border border-amber-900/10 shadow-xs hover:-translate-y-1 hover:shadow-md hover:border-amber-500/40 transition-all duration-200 will-change-transform">
                <h3 className="font-adventure text-xl text-amber-950 mb-2 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-amber-700" />
                  <span>{t("speciesDetail.dietHabits", { lng: sheetLang })}</span>
                </h3>
                <p className="text-stone-700 text-base sm:text-lg leading-relaxed">
                  {loc.diet}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

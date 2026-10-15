import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useSearchParams } from "react-router";
import { Volume2, VolumeX, Globe, TreePine, MapPin, Sparkles, ShieldCheck, Play, Pause } from "lucide-react";
import { useZoo } from "../context/ZooContext";
import { recordSpeciesVisit } from "../services/analytics";
import { getLocalizedAnimal } from "../services/speciesTranslator";
import { playChime, speakNarration, stopAllAudio } from "../services/audioPlayer";
import { INITIAL_ANIMALS, Animal } from "../data/zooStore";

const API_BASE_URL = ((import.meta.env.VITE_API_BASE_URL as string | undefined) || "").replace(/\/$/, "");

export function SpeciesDetail() {
  const { idOrSlug } = useParams<{ idOrSlug: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const { animals, currentLang, setLanguage } = useZoo();

  const [species, setSpecies] = useState<Animal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const visitLoggedRef = useRef(false);

  // 1. Language detection: if ?lang is present, use it
  useEffect(() => {
    const urlLang = searchParams.get("lang");
    if (urlLang === "en" || urlLang === "es") {
      setLanguage(urlLang);
    }
  }, [searchParams, setLanguage]);

  const isEnglish = currentLang === "en";

  // 2. Load species from API or fallback to local zooStore
  useEffect(() => {
    if (!idOrSlug) {
      setError("No se especificó la especie.");
      setLoading(false);
      return;
    }

    const availableAnimals = animals && animals.length > 0 ? animals : INITIAL_ANIMALS;
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
        setError(isEnglish ? "Species not found in catalog." : "Especie no encontrada en el catálogo.");
      }
      setLoading(false);
      return;
    }

    let active = true;
    fetch(`${API_BASE_URL}/api/species/${encodeURIComponent(idOrSlug)}`, { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) throw new Error("API not available");
        const data = await res.json();
        if (active) {
          const match = findLocal();
          const cleanAudio =
            data.audioDescriptionUrl && !data.audioDescriptionUrl.includes("example.com")
              ? data.audioDescriptionUrl
              : match?.audioUrl;

          setSpecies({
            id: Number(data.id) || 1,
            name: data.name,
            nameEn: match?.nameEn,
            scientificName: data.species || data.scientificName || match?.scientificName || "",
            category: data.category || match?.category || "Mamífero",
            status: data.conservation || "Preocupación Menor",
            habitat: data.habitat || match?.habitat || "",
            habitatEn: match?.habitatEn,
            diet: data.diet || match?.diet || "",
            dietEn: match?.dietEn,
            funFact: data.description || data.funFact || match?.funFact || "",
            funFactEn: match?.funFactEn,
            image: data.imageUrl || data.image || match?.image || "",
            audioUrl: cleanAudio,
            enclosureId: data.enclosureId ?? null,
          });
        }
      })
      .catch(() => {
        if (active) {
          const match = findLocal();
          if (match) {
            setSpecies(match);
          } else {
            setError(isEnglish ? "Species not found." : "Especie no encontrada.");
          }
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [idOrSlug, animals, isEnglish]);

  // 3. Record visit (QR or Direct)
  useEffect(() => {
    if (!species || visitLoggedRef.current) return;
    visitLoggedRef.current = true;

    const isQr = searchParams.get("scan") === "qr" || window.location.search.includes("qr");
    recordSpeciesVisit(species.id, i18n.language, isQr ? "qr" : "direct");
  }, [species, searchParams, i18n.language]);

  // Localized species properties
  const loc = species ? getLocalizedAnimal(species, !isEnglish) : null;

  // 4. Robust audio playback
  const startAudio = useCallback((targetLoc = loc) => {
    if (!targetLoc) return;
    playChime();

    // If a clean MP3 is available and not example.com, try playing
    if (targetLoc.audioUrl && !targetLoc.audioUrl.includes("example.com")) {
      const audio = new Audio(targetLoc.audioUrl);
      audioRef.current = audio;

      audio.onplay = () => {
        setIsPlayingAudio(true);
        setAutoplayBlocked(false);
      };
      audio.onpause = () => setIsPlayingAudio(false);
      audio.onended = () => setIsPlayingAudio(false);
      audio.onerror = () => {
        speakNarration(
          `${targetLoc.name}. ${targetLoc.scientificName ? `(${targetLoc.scientificName}).` : ""} ${targetLoc.funFact}. ${targetLoc.habitat}. ${targetLoc.diet}.`,
          !isEnglish,
          () => setIsPlayingAudio(true),
          () => setIsPlayingAudio(false)
        );
      };

      audio.play().catch(() => {
        speakNarration(
          `${targetLoc.name}. ${targetLoc.scientificName ? `(${targetLoc.scientificName}).` : ""} ${targetLoc.funFact}. ${targetLoc.habitat}. ${targetLoc.diet}.`,
          !isEnglish,
          () => setIsPlayingAudio(true),
          () => setIsPlayingAudio(false)
        );
      });
    } else {
      speakNarration(
        `${targetLoc.name}. ${targetLoc.scientificName ? `(${targetLoc.scientificName}).` : ""} ${targetLoc.funFact}. ${targetLoc.habitat}. ${targetLoc.diet}.`,
        !isEnglish,
        () => setIsPlayingAudio(true),
        () => setIsPlayingAudio(false)
      );
    }
  }, [loc, isEnglish]);

  const toggleAudio = useCallback(() => {
    if (isPlayingAudio) {
      stopAllAudio();
      setIsPlayingAudio(false);
    } else {
      startAudio();
    }
  }, [isPlayingAudio, startAudio]);

  // 5. Auto-play audio once when scanned via QR
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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAllAudio();
    };
  }, []);

  const toggleLanguage = () => {
    stopAllAudio();
    setIsPlayingAudio(false);
    const nextLang = isEnglish ? "es" : "en";
    setLanguage(nextLang);
    const newParams = new URLSearchParams(searchParams);
    newParams.set("lang", nextLang);
    setSearchParams(newParams);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf8f2] flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="font-adventure text-2xl text-[#2b1810]">
            {isEnglish ? "Loading ZooMAT Species..." : "Cargando Especie de ZooMAT..."}
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
            {isEnglish ? "Species Not Found" : "Especie no encontrada"}
          </h2>
          <p className="text-stone-600 text-base">{error || (isEnglish ? "We could not find this animal." : "No pudimos encontrar este ejemplar.")}</p>
          <Link
            to="/animales"
            className="inline-flex items-center gap-2 wood-texture-bg text-amber-200 border-2 border-amber-600 px-6 py-3 rounded-2xl font-adventure text-base shadow-lg hover:scale-105 transition-transform wood-button-shadow"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>{isEnglish ? "Return to Catalog" : "Volver al Catálogo"}</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf8f2] text-stone-900 pb-20">
      {/* 1. Header Banner matching the photo 1 style */}
      <section className="relative bg-[#f7f3e8] border-b-4 border-[#2b1706] py-12 md:py-16 overflow-hidden">
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
              to="/animales"
              className="inline-flex items-center gap-2 text-stone-700 hover:text-amber-900 font-bold text-base transition-colors bg-white/80 px-4 py-2 rounded-xl border border-amber-800/20 shadow-xs"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>{isEnglish ? "Back to Wildlife Catalog" : "Volver al Catálogo"}</span>
            </Link>

            {/* Language Switch Button */}
            <button
              onClick={toggleLanguage}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-amber-50 text-stone-900 font-bold border-2 border-amber-700/30 shadow-md transition-all hover:scale-105 text-sm cursor-pointer"
              title="Cambiar idioma / Change language"
            >
              <Globe className="w-4 h-4 text-emerald-700" />
              <span>{isEnglish ? "🇲🇽 Ver en Español" : "🇺🇸 Switch to English"}</span>
            </button>
          </div>

          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100/90 text-amber-950 text-xs sm:text-sm font-black tracking-wide uppercase shadow-xs border border-amber-300">
              <TreePine className="w-4 h-4 text-emerald-800" />
              <span>ZOOLÓGICO REGIONAL MIGUEL ÁLVAREZ DEL TORO • QR GUÍA</span>
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
      <main className="max-w-5xl mx-auto px-4 sm:px-6 mt-8 space-y-8">
        {/* Prominent Audio Guide Bar / Mobile Autoplay Prompt */}
        <div className="bg-gradient-to-r from-amber-900 via-[#8B5A2B] to-[#5C3A1E] text-white p-5 sm:p-6 rounded-3xl shadow-xl border-2 border-amber-500/60 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-center sm:text-left">
              <button
                onClick={toggleAudio}
                className="w-14 h-14 rounded-2xl bg-amber-400 hover:bg-amber-300 text-stone-950 flex items-center justify-center shadow-lg transition-transform hover:scale-105 flex-shrink-0 cursor-pointer"
              >
                {isPlayingAudio ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 ml-0.5" />}
              </button>
              <div>
                <p className="font-adventure text-xl sm:text-2xl text-amber-200">
                  {isPlayingAudio
                    ? (isEnglish ? "Playing Audio Guide..." : "Reproduciendo Audioguía...")
                    : (isEnglish ? "Listen to Official Audio Guide" : "Escuchar Audioguía Oficial")}
                </p>
                <p className="text-amber-100/90 text-sm font-medium">
                  {isEnglish
                    ? "Professional narration about this native Chiapas species"
                    : "Narración descriptiva sobre esta especie nativa de Chiapas"}
                </p>
              </div>
            </div>

            <button
              onClick={toggleAudio}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-white hover:bg-amber-100 text-stone-950 font-adventure text-base tracking-wide shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Volume2 className="w-5 h-5 text-emerald-800" />
              <span>{isPlayingAudio ? (isEnglish ? "Pause Audio" : "Pausar Audio") : (isEnglish ? "Play Now" : "Reproducir")}</span>
            </button>
          </div>

          {autoplayBlocked && !isPlayingAudio && (
            <div className="mt-3 bg-amber-500/20 border border-amber-300/40 p-2.5 rounded-xl text-center text-xs sm:text-sm font-semibold text-amber-100 animate-pulse">
              {isEnglish
                ? "Tap 'Play Now' to start the audio guide on your device."
                : "Toca 'Reproducir' para activar la audioguía en tu dispositivo móvil."}
            </div>
          )}
        </div>

        {/* Species Photo with ambient frame */}
        <div className="bg-white rounded-3xl overflow-hidden shadow-2xl border-2 border-[#e2d5bd]">
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

          {/* Details Body Localized */}
          <div className="p-6 sm:p-10 space-y-8">
            {/* About text */}
            <div className="space-y-3">
              <h2 className="font-adventure text-2xl sm:text-3xl text-[#2b1810] flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-amber-600" />
                <span>{isEnglish ? "About this Species" : "Sobre esta Especie"}</span>
              </h2>
              <p className="text-stone-800 text-lg sm:text-xl leading-relaxed font-medium">
                {loc.funFact}
              </p>
            </div>

            {/* Grid Attributes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-amber-900/10">
              <div className="bg-[#fcfaf5] p-6 rounded-2xl border border-amber-900/10 shadow-xs">
                <h3 className="font-adventure text-xl text-amber-950 mb-2 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-emerald-700" />
                  <span>{isEnglish ? "Habitat & Natural Range" : "Hábitat y Distribución"}</span>
                </h3>
                <p className="text-stone-700 text-base sm:text-lg leading-relaxed">
                  {loc.habitat}
                </p>
              </div>

              <div className="bg-[#fcfaf5] p-6 rounded-2xl border border-amber-900/10 shadow-xs">
                <h3 className="font-adventure text-xl text-amber-950 mb-2 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-amber-700" />
                  <span>{isEnglish ? "Diet & Feeding Habits" : "Alimentación y Dieta"}</span>
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

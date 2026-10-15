import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router";
import { useTranslation } from "react-i18next";

const API_BASE_URL = ((import.meta.env.VITE_API_BASE_URL as string | undefined) || "").replace(/\/$/, "");

type Species = {
  id: number;
  name: string;
  species?: string;
  category?: string;
  habitat?: string;
  diet?: string;
  description?: string;
  imageUrl?: string;
  conservation?: string;
  audioDescriptionUrl?: string;
};

export function SpeciesDetail() {
  const { idOrSlug } = useParams();
  const { i18n } = useTranslation();
  const requestedLanguage = new URLSearchParams(window.location.search).get("lang");
  const [species, setSpecies] = useState<Species | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [audioBlocked, setAudioBlocked] = useState(false);
  const visitRecorded = useRef(false);

  useEffect(() => {
    if (requestedLanguage === "es" || requestedLanguage === "en") {
      void i18n.changeLanguage(requestedLanguage);
    }
  }, [i18n, requestedLanguage]);

  useEffect(() => {
    if (!idOrSlug || !API_BASE_URL) {
      setError("No se pudo identificar la especie.");
      setLoading(false);
      return;
    }

    let active = true;
    fetch(`${API_BASE_URL}/api/species/${encodeURIComponent(idOrSlug)}`, { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("La especie no está disponible.");
        return response.json() as Promise<Species>;
      })
      .then((data) => {
        if (active) {
          setSpecies(data);
          if (!visitRecorded.current) {
            visitRecorded.current = true;
            void fetch(`${API_BASE_URL}/api/analytics/${encodeURIComponent(data.id)}/visit`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                language: requestedLanguage === "en" ? "en" : "es",
                accessedVia: "qr",
              }),
            }).catch((visitError) => console.error("Unable to record QR visit:", visitError));
          }
        }
      })
      .catch((reason) => {
        if (active) setError(reason instanceof Error ? reason.message : "No se pudo cargar la especie.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [idOrSlug]);

  if (loading) return <main className="min-h-screen grid place-items-center">Cargando especie...</main>;
  if (error || !species) {
    return (
      <main className="min-h-screen grid place-items-center p-6 text-center">
        <div>
          <p className="text-red-700 font-bold mb-4">{error || "Especie no encontrada."}</p>
          <Link to="/animales" className="text-emerald-700 font-bold hover:underline">Volver al catálogo</Link>
        </div>
      </main>
    );
  }

  const isEnglish = i18n.language === "en";
  return (
    <main className="min-h-screen bg-emerald-50 p-4 md:p-10">
      <article className="max-w-3xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden">
        <div className="flex justify-end p-4 pb-0">
          <button
            type="button"
            onClick={() => {
              const language = isEnglish ? "es" : "en";
              void i18n.changeLanguage(language);
              const url = new URL(window.location.href);
              url.searchParams.set("lang", language);
              window.history.replaceState({}, "", url);
            }}
            className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-800 hover:bg-emerald-100"
          >
            {isEnglish ? "Ver en español" : "View in English"}
          </button>
        </div>
        {species.imageUrl && <img src={species.imageUrl} alt={species.name} className="w-full max-h-96 object-cover" />}
        <div className="p-6 md:p-10 space-y-5">
          <p className="text-sm font-bold uppercase tracking-wider text-emerald-700">{species.category}</p>
          <h1 className="text-4xl font-black text-emerald-950">{species.name}</h1>
          {species.species && <p className="text-xl italic text-gray-600">{species.species}</p>}
          <div className="grid sm:grid-cols-2 gap-4 text-gray-700">
            {species.habitat && <p><strong>{isEnglish ? "Habitat" : "Hábitat"}:</strong> {species.habitat}</p>}
            {species.diet && <p><strong>{isEnglish ? "Diet" : "Dieta"}:</strong> {species.diet}</p>}
            {species.conservation && <p><strong>{isEnglish ? "Conservation" : "Conservación"}:</strong> {species.conservation}</p>}
          </div>
          {species.description && <p className="text-gray-700 leading-relaxed">{species.description}</p>}
          {species.audioDescriptionUrl && (
            <div className="space-y-2">
              <audio
                controls
                autoPlay
                src={species.audioDescriptionUrl}
                className="w-full"
                onPlay={() => setAudioBlocked(false)}
                onError={() => setAudioBlocked(true)}
              />
              {audioBlocked && (
                <p className="text-sm text-amber-700">
                  El navegador bloqueó la reproducción automática. Presiona reproducir para escuchar el audio.
                </p>
              )}
            </div>
          )}
          <Link to="/animales" className="inline-block text-emerald-700 font-bold hover:underline">Volver al catálogo</Link>
        </div>
      </article>
    </main>
  );
}

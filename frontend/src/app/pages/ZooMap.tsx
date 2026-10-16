import { Compass, MapPin, Plus, Minus, TreePine } from "lucide-react";
import { useTranslation } from "react-i18next";

export function ZooMap() {
  const { i18n, t } = useTranslation();
  const isEs = i18n.language !== "en";

  return (
    <div className="min-h-screen bg-[#faf8f2] text-stone-900">
      <section className="relative min-h-[420px] overflow-hidden border-b-4 border-[#2b1706] bg-[#f7f3e8] py-14 md:py-20">
        <div
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{
            backgroundImage: "radial-gradient(#854d0e 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <div className="max-w-4xl space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-300 bg-amber-100/90 px-4 py-2 text-xs font-black uppercase tracking-wide text-amber-950 shadow-sm sm:text-sm">
              <TreePine className="h-4 w-4 text-emerald-800" />
              <span>ZOOLÓGICO REGIONAL MIGUEL ÁLVAREZ DEL TORO</span>
            </div>

            <h1 className="font-adventure text-4xl font-black leading-[1.1] tracking-tight text-stone-900 text-adventure-shadow sm:text-6xl lg:text-7xl">
              {t("mapPage.title")}
            </h1>

            <p className="text-xl font-semibold leading-relaxed text-stone-700 md:text-2xl">
              {t("mapPage.subtitle")}
            </p>
          </div>
        </div>

        <div className="wood-texture-bg mt-10 h-5 w-full border-b-2 border-t border-amber-950/80 shadow-md sm:h-6" />
      </section>

      <section className="bg-[#ead9b8] px-3 py-8 sm:px-6 md:py-12">
        <div className="mx-auto max-w-7xl">
          <div className="wood-texture-bg rounded-[2rem] border-4 border-[#4a2e12] p-2 shadow-2xl sm:p-4">
            <div className="relative min-h-[520px] overflow-hidden rounded-[1.25rem] border-2 border-amber-950/70 bg-[#79b842] sm:min-h-[650px]">
              <img
                src="/assets/images/zoomat-map.jpeg"
                alt={isEs ? "Mapa del ZooMAT" : "ZooMAT map"}
                className="absolute inset-0 h-full w-full object-cover"
              />

              <div className="absolute left-4 top-4 flex flex-col overflow-hidden rounded-xl border-2 border-stone-800 bg-stone-950/90 text-white shadow-xl">
                <button type="button" aria-label={isEs ? "Acercar mapa" : "Zoom in"} className="p-2 hover:bg-stone-700">
                  <Plus className="h-5 w-5" />
                </button>
                <button type="button" aria-label={isEs ? "Alejar mapa" : "Zoom out"} className="border-t border-stone-600 p-2 hover:bg-stone-700">
                  <Minus className="h-5 w-5" />
                </button>
              </div>
              <button
                type="button"
                aria-label={isEs ? "Centrar mapa" : "Center map"}
                className="absolute right-4 top-4 rounded-full border-4 border-white bg-stone-950/90 p-3 text-cyan-300 shadow-xl"
              >
                <Compass className="h-7 w-7" />
              </button>
              <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-full border border-amber-950/40 bg-[#f7e8c5]/95 px-3 py-2 text-xs font-black text-stone-800 shadow-lg sm:text-sm">
                <MapPin className="h-4 w-4 text-red-700" />
                {isEs ? "Mapa ilustrativo del ZooMAT" : "Illustrated ZooMAT map"}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

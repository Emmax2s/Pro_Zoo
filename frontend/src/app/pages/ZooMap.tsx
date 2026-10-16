import { TreePine } from "lucide-react";
import { useTranslation } from "react-i18next";

export function ZooMap() {
  const { t } = useTranslation();

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
    </div>
  );
}

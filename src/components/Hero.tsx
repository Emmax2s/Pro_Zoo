import { useSite } from '../contexts/SiteContext';
import { useLanguage } from '../contexts/LanguageContext';

export function Hero() {
  const { siteData } = useSite();
  const { translateContent } = useLanguage();
  const { hero } = siteData;
  const mediaItems = hero.backgroundMedia.length > 0 ? hero.backgroundMedia : [];

  return (
    <section id="inicio" className="overflow-hidden bg-gradient-to-br from-stone-50 via-amber-50 to-emerald-50">
      <div className="mx-auto grid min-h-[70vh] max-w-7xl gap-8 px-4 py-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:px-8 lg:py-16">
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-700 px-6 py-10 text-white shadow-2xl sm:px-10 sm:py-14 lg:px-12 lg:py-16">
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at top left, rgba(255,255,255,0.35), transparent 34%), radial-gradient(circle at bottom right, rgba(255,255,255,0.18), transparent 28%)' }} />
          <div className="relative z-10 max-w-3xl">
            <p className="mb-3 inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-1 text-sm font-medium text-white/90">
              Zoo Aventuras
            </p>
            <h1 className="text-balance text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
              {translateContent(hero.title)}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/90 sm:text-lg">
              {translateContent(hero.subtitle)}
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 lg:grid-rows-[1.2fr_0.8fr]">
          <div className="overflow-hidden rounded-[2rem] border border-white bg-white shadow-2xl">
            {mediaItems[0]?.type === 'video' ? (
              <video
                src={mediaItems[0].url}
                className="h-full min-h-[18rem] w-full object-cover sm:min-h-[24rem] lg:min-h-[32rem]"
                autoPlay
                muted
                loop
                playsInline
              />
            ) : (
              <img
                src={mediaItems[0]?.url}
                alt={translateContent(hero.title)}
                className="h-full min-h-[18rem] w-full object-cover sm:min-h-[24rem] lg:min-h-[32rem]"
              />
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
            {(mediaItems.slice(1, 3).length > 0 ? mediaItems.slice(1, 3) : mediaItems.slice(0, 2)).map((media, index) => (
              <div key={`${media.url}-${index}`} className="overflow-hidden rounded-3xl border border-white/70 bg-white shadow-lg">
                {media.type === 'video' ? (
                  <video
                    src={media.url}
                    className="h-40 w-full object-cover"
                    muted
                    loop
                    playsInline
                    autoPlay
                  />
                ) : (
                  <img
                    src={media.url}
                    alt={`${translateContent(hero.title)} ${index + 2}`}
                    className="h-40 w-full object-cover"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

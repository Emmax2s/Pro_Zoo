import { useSite } from '../contexts/SiteContext';
import { useLanguage } from '../contexts/LanguageContext';

export function InterestSection() {
  const { siteData } = useSite();
  const { t, translateContent } = useLanguage();
  const { interestCards } = siteData;

  if (interestCards.length === 0) {
    return null;
  }

  return (
    <section id="interes" className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <p className="text-sm font-medium uppercase tracking-[0.3em] text-amber-700">
            {t.interestSection.eyebrow}
          </p>
          <h2 className="mt-2 text-3xl font-bold text-stone-900 sm:text-4xl">
            {t.interestSection.title}
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-stone-600 sm:text-base">
            {t.interestSection.subtitle}
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {interestCards.map((card, index) => {
            const cardContent = (
              <article className="group overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl">
                <div className="relative aspect-[16/10] overflow-hidden bg-stone-100">
                  {card.imageUrl ? (
                    <img
                      src={card.imageUrl}
                      alt={translateContent(card.title) || card.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-gradient-to-br from-emerald-100 to-amber-100 text-sm font-medium text-stone-500">
                      Sin imagen
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                    <h3 className="text-lg font-semibold leading-tight">{translateContent(card.title) || card.title}</h3>
                  </div>
                </div>
                {card.description && (
                  <div className="p-4">
                    <p className="text-sm leading-relaxed text-stone-600">{translateContent(card.description) || card.description}</p>
                  </div>
                )}
              </article>
            );

            if (card.link) {
              return (
                <a key={`${card.title}-${index}`} href={card.link} className="block">
                  {cardContent}
                </a>
              );
            }

            return <div key={`${card.title}-${index}`}>{cardContent}</div>;
          })}
        </div>
      </div>
    </section>
  );
}
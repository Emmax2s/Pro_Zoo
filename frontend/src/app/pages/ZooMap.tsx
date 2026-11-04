const MAP_LINK = "#";

export function ZooMap() {
  return (
    <main className="min-h-screen bg-[#faf8f2] px-4 py-8 text-stone-900 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-7xl">
        <a
          href={MAP_LINK}
          aria-label="Abrir mapa del ZooMAT"
          className="group block overflow-hidden rounded-3xl border-4 border-[#2b1706] bg-white shadow-2xl transition-transform duration-300 hover:-translate-y-1 hover:shadow-amber-900/30 focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-500"
        >
          <img
            src="/assets/images/zoomat-map.jpeg"
            alt="Mapa ilustrado del ZooMAT"
            className="h-auto w-full transition-transform duration-500 group-hover:scale-[1.01]"
          />
        </a>
      </div>
    </main>
  );
}

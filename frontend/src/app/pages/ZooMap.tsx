export function ZooMap() {
    return (
        <main className="min-h-screen bg-[#faf8f2] px-4 py-8 text-stone-900 sm:px-6 sm:py-12">
            <div className="mx-auto max-w-7xl h-[80vh] min-h-[600px]">
                {/* Contenedor del Iframe con el estilo del ZooMAT */}
                <div className="h-full w-full overflow-hidden rounded-3xl border-4 border-[#2b1706] bg-black shadow-2xl transition-shadow duration-300 hover:shadow-amber-900/30">
                    <iframe
                        src="/recorrido_virtual/RecorridoVirtual.html"
                        title="Recorrido Virtual 3D ZooMAT"
                        className="w-full h-full border-none"
                        allow="fullscreen; autoplay; display-capture; geolocation"
                    ></iframe>
                </div>
            </div>
        </main>
    );
}

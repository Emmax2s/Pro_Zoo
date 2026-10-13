import { FileText, Compass, AlertTriangle, ShieldCheck } from "lucide-react";

export function Terms() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
      {/* Header */}
      <section className="bg-gradient-to-r from-green-700 to-green-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="w-10 h-10 text-emerald-300" />
            <h1 className="text-5xl font-bold">Términos y Condiciones</h1>
          </div>
          <p className="text-xl text-green-100 max-w-3xl">
            Reglas, lineamientos y términos de uso para los visitantes del portal web oficial del ZooMAT.
          </p>
        </div>
      </section>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 space-y-8 text-gray-700">
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-green-800 flex items-center gap-2 border-b border-green-100 pb-2">
              <Compass className="w-6 h-6 text-green-700" />
              1. Aceptación de los Términos
            </h2>
            <p className="leading-relaxed">
              Al acceder y utilizar este sitio web, usted acepta estar sujeto a estos términos y condiciones de uso, a todas las leyes y regulaciones aplicables, y acepta que es responsable del cumplimiento de las leyes locales aplicables. Si no está de acuerdo con alguno de estos términos, tiene prohibido utilizar o acceder a este sitio.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-green-800 flex items-center gap-2 border-b border-green-100 pb-2">
              <ShieldCheck className="w-6 h-6 text-green-700" />
              2. Licencia de Uso del Contenido
            </h2>
            <p className="leading-relaxed">
              Se concede permiso para descargar temporalmente una copia de los materiales de información en el sitio web del ZooMAT únicamente para visualización personal, informativa y no comercial. Esta es la concesión de una licencia, no una transferencia de título, y bajo esta licencia usted no puede:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Modificar o copiar los materiales.</li>
              <li>Utilizar los materiales para cualquier propósito comercial o para cualquier exhibición pública (comercial o no comercial).</li>
              <li>Intentar descompilar o realizar ingeniería inversa de cualquier software contenido en el sitio web.</li>
              <li>Eliminar cualquier marca de derechos de autor u otras anotaciones de propiedad de los materiales.</li>
              <li>Transferir los materiales a otra persona o copiar los materiales en cualquier otro servidor.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-green-800 flex items-center gap-2 border-b border-green-100 pb-2">
              <AlertTriangle className="w-6 h-6 text-green-700" />
              3. Limitación de Responsabilidad
            </h2>
            <p className="leading-relaxed">
              Los materiales en el sitio web del ZooMAT se proporcionan "tal cual". El ZooMAT no ofrece garantías, expresas o implícitas, y por la presente renuncia y niega todas las demás garantías, incluyendo, sin limitación, las garantías o condiciones implícitas de comerciabilidad, idoneidad para un propósito particular o no infracción de propiedad intelectual u otra violación de derechos.
            </p>
            <p className="leading-relaxed">
              Asimismo, el zoológico no garantiza ni hace ninguna representación con respecto a la exactitud, los resultados probables o la confiabilidad del uso de los materiales en su sitio web o de otro tipo relacionados con dichos materiales o en cualquier sitio vinculado a este sitio.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-green-800 border-b border-green-100 pb-2">
              4. Modificaciones y Errores
            </h2>
            <p className="leading-relaxed">
              Los materiales que aparecen en el sitio web del ZooMAT podrían incluir errores técnicos, tipográficos o fotográficos. El ZooMAT no garantiza que cualquiera de los materiales en su sitio web sean exactos, completos o actuales. El ZooMAT puede realizar cambios en los materiales contenidos en su sitio web en cualquier momento sin previo aviso.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-green-800 border-b border-green-100 pb-2">
              5. Enlaces Externos
            </h2>
            <p className="leading-relaxed">
              El ZooMAT no ha revisado todos los sitios vinculados a su sitio web y no es responsable de los contenidos de ningún sitio vinculado. La inclusión de cualquier enlace no implica la aprobación del sitio por parte del ZooMAT. El uso de cualquier sitio web vinculado es bajo el propio riesgo del usuario.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-green-800 border-b border-green-100 pb-2">
              6. Ley Aplicable
            </h2>
            <p className="leading-relaxed">
              Cualquier reclamación relacionada con el sitio web del ZooMAT se regirá por las leyes del Estado de Chiapas, México, sin consideración a sus disposiciones sobre conflicto de leyes.
            </p>
          </section>

          <div className="bg-green-50 border-l-4 border-green-600 p-6 rounded-r-xl mt-8">
            <p className="text-sm text-green-800 font-semibold">
              Última actualización: 26 de junio de 2026.
            </p>
            <p className="text-xs text-green-700/80 mt-1">
              El uso continuado de este portal web después de la publicación de cambios a estos términos constituirá su aceptación de dichos cambios.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

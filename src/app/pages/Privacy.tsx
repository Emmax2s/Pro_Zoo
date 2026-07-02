import { Shield, Eye, Lock, FileText } from "lucide-react";

export function Privacy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
      {/* Header */}
      <section className="bg-gradient-to-r from-green-700 to-green-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-10 h-10 text-emerald-300" />
            <h1 className="text-5xl font-bold">Aviso de Privacidad</h1>
          </div>
          <p className="text-xl text-green-100 max-w-3xl">
            En el ZooMAT nos comprometemos a proteger tus datos personales y garantizar tu privacidad.
          </p>
        </div>
      </section>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 space-y-8 text-gray-700">
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-green-800 flex items-center gap-2 border-b border-green-100 pb-2">
              <Eye className="w-6 h-6 text-green-700" />
              1. Responsable del Tratamiento
            </h2>
            <p className="leading-relaxed">
              El <strong>Zoológico Regional Miguel Álvarez del Toro (ZooMAT)</strong>, dependiente de la Secretaría de Medio Ambiente e Historia Natural (SEMAHN) del Gobierno del Estado de Chiapas, con domicilio en Calzada Cerro Hueco S/N, Col. El Zapotal, Tuxtla Gutiérrez, Chiapas, C.P. 29094, es el responsable del uso y protección de sus datos personales.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-green-800 flex items-center gap-2 border-b border-green-100 pb-2">
              <FileText className="w-6 h-6 text-green-700" />
              2. Datos Personales Recabados
            </h2>
            <p className="leading-relaxed">
              Para llevar a cabo las finalidades descritas en este aviso de privacidad, podemos recabar los siguientes datos personales a través de nuestro formulario de contacto o registro de visitas:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Nombre completo</li>
              <li>Dirección de correo electrónico</li>
              <li>Número de teléfono (opcional)</li>
              <li>Información sobre visitas escolares o grupales</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-green-800 flex items-center gap-2 border-b border-green-100 pb-2">
              <Lock className="w-6 h-6 text-green-700" />
              3. Finalidades del Tratamiento
            </h2>
            <p className="leading-relaxed">
              Los datos personales que recopilamos serán utilizados exclusivamente para las siguientes finalidades necesarias:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Atender y dar seguimiento a sus solicitudes de información, dudas o comentarios.</li>
              <li>Gestionar reservaciones de visitas grupales y escolares.</li>
              <li>Mejorar la experiencia de usuario y el funcionamiento de nuestro portal web.</li>
              <li>Enviar información relevante sobre eventos y programas de conservación del zoológico.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-green-800 flex items-center gap-2 border-b border-green-100 pb-2">
              <Shield className="w-6 h-6 text-green-700" />
              4. Transferencia de Datos
            </h2>
            <p className="leading-relaxed">
              Le informamos que el ZooMAT no transfiere sus datos personales a terceros, salvo aquellas excepciones previstas por la ley o cuando sea estrictamente necesario para cumplir con los servicios gubernamentales que usted mismo solicite.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-green-800 flex items-center gap-2 border-b border-green-100 pb-2">
              <Lock className="w-6 h-6 text-green-700" />
              5. Medidas de Seguridad
            </h2>
            <p className="leading-relaxed">
              Implementamos medidas de seguridad administrativas, técnicas y físicas razonables para proteger sus datos personales contra daño, pérdida, alteración, destrucción o el uso, acceso o tratamiento no autorizado.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-green-800 border-b border-green-100 pb-2">
              6. Derechos ARCO
            </h2>
            <p className="leading-relaxed">
              Usted tiene derecho a conocer qué datos personales tenemos de usted, para qué los utilizamos y las condiciones del uso que les damos (Acceso). Asimismo, es su derecho solicitar la corrección de su información personal en caso de que esté desactualizada, sea inexacta o incompleta (Rectificación); que la eliminemos de nuestros registros o bases de datos cuando considere que la misma no está siendo utilizada adecuadamente (Cancelación); así como oponerse al uso de sus datos personales para fines específicos (Oposición). Estos se conocen como derechos ARCO.
            </p>
            <p className="leading-relaxed">
              Para el ejercicio de cualquiera de los derechos ARCO, usted deberá presentar la solicitud respectiva a través de nuestro correo electrónico institucional: <a href="mailto:zoomat@zoomat.chiapas.gob.mx" className="text-green-700 font-semibold hover:underline">zoomat@zoomat.chiapas.gob.mx</a>.
            </p>
          </section>

          <div className="bg-green-50 border-l-4 border-green-600 p-6 rounded-r-xl mt-8">
            <p className="text-sm text-green-800 font-semibold">
              Última actualización: 26 de junio de 2026.
            </p>
            <p className="text-xs text-green-700/80 mt-1">
              Este aviso de privacidad puede sufrir modificaciones, cambios o actualizaciones derivadas de nuevos requerimientos legales o de nuestras propias necesidades.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

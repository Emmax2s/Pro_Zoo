import { Phone, Mail, Instagram, Facebook, Globe, Share2, Award, Heart, Check } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";

function TiktokIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
    </svg>
  );
}

export function Redes() {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: "ZooMAT - Redes y Enlaces Oficiales",
          text: "Encuentra todos los contactos y redes sociales oficiales del Zoológico Regional Miguel Álvarez del Toro (ZooMAT).",
          url: url,
        });
      } catch (err) {
        console.log("Error al compartir", err);
      }
    } else {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const links = [
    {
      title: "Teléfono de Contacto",
      subtitle: "961 614 4700",
      icon: Phone,
      href: "tel:+529616144700",
      bgColor: "bg-emerald-50 hover:bg-emerald-100",
      iconColor: "text-emerald-700",
      textColor: "text-emerald-950",
    },
    {
      title: "Correo Electrónico",
      subtitle: "zoomat@zoomat.chiapas.gob.mx",
      icon: Mail,
      href: "mailto:zoomat@zoomat.chiapas.gob.mx",
      bgColor: "bg-emerald-50 hover:bg-emerald-100",
      iconColor: "text-emerald-700",
      textColor: "text-emerald-950",
    },
    {
      title: "Instagram Oficial",
      subtitle: "@zoomatoficial_",
      icon: Instagram,
      href: "https://www.instagram.com/zoomatoficial_/",
      bgColor: "bg-pink-50 hover:bg-pink-100/80",
      iconColor: "text-pink-600",
      textColor: "text-gray-900",
    },
    {
      title: "TikTok Oficial",
      subtitle: "@zoomat.oficial",
      icon: TiktokIcon,
      href: "https://www.tiktok.com/@zoomat.oficial",
      bgColor: "bg-slate-50 hover:bg-slate-100",
      iconColor: "text-gray-800",
      textColor: "text-gray-900",
    },
    {
      title: "Facebook Oficial",
      subtitle: "ZooMAT Oficial",
      icon: Facebook,
      href: "https://www.facebook.com/ZoomatOficial/",
      bgColor: "bg-blue-50 hover:bg-blue-100/80",
      iconColor: "text-blue-600",
      textColor: "text-gray-900",
    },
    {
      title: "Sitio Web Principal",
      subtitle: "zoomat.chiapas.gob.mx",
      icon: Globe,
      href: "/",
      isInternal: true,
      bgColor: "bg-emerald-900 hover:bg-emerald-855 text-white",
      iconColor: "text-emerald-300",
      textColor: "text-white",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-950 via-emerald-900 to-emerald-950 flex flex-col items-center justify-between px-4 py-12 relative overflow-hidden">
      {/* Decorative background lights */}
      <div className="absolute top-[-10%] left-[-20%] w-[80%] aspect-square rounded-full bg-emerald-800/30 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-20%] w-[80%] aspect-square rounded-full bg-teal-800/20 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md z-10 flex-grow flex flex-col justify-center">
        {/* Header/Logo section */}
        <div className="text-center mb-8">
          <div className="inline-flex bg-emerald-800 text-white w-20 h-20 rounded-3xl items-center justify-center font-bold text-4xl shadow-xl shadow-black/20 border-2 border-emerald-500/20 mb-4 animate-bounce-slow">
            Z
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">ZooMAT</h1>
          <p className="text-emerald-400 text-xs font-bold uppercase tracking-widest mt-1">Chiapas</p>
          <p className="text-emerald-200/80 text-sm mt-3 px-4 leading-relaxed font-medium">
            Enlaces y contactos oficiales del Zoológico Regional Miguel Álvarez del Toro
          </p>
        </div>

        {/* Links Grid */}
        <div className="space-y-4">
          {links.map((link, idx) => {
            const Icon = link.icon;
            const content = (
              <div className="flex items-center gap-4 w-full">
                <div className={`p-3.5 rounded-2xl ${link.bgColor} ${link.iconColor} transition-colors shadow-sm`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="text-left flex-grow">
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-500/90 group-hover:text-emerald-700/80 transition-colors">
                    {link.title}
                  </p>
                  <p className={`text-base font-semibold ${link.textColor} mt-0.5`}>
                    {link.subtitle}
                  </p>
                </div>
              </div>
            );

            const isSpecialProtocol = link.href.startsWith("tel:") || link.href.startsWith("mailto:");

            return link.isInternal ? (
              <Link
                key={idx}
                to={link.href}
                className="group flex items-center bg-white border border-emerald-100 rounded-3xl p-3 shadow-md hover:shadow-xl hover:shadow-emerald-950/20 hover:-translate-y-0.5 transition-all duration-300 w-full"
              >
                {content}
              </Link>
            ) : (
              <a
                key={idx}
                href={link.href}
                target={isSpecialProtocol ? undefined : "_blank"}
                rel={isSpecialProtocol ? undefined : "noopener noreferrer"}
                className="group flex items-center bg-white border border-emerald-100 rounded-3xl p-3 shadow-md hover:shadow-xl hover:shadow-emerald-950/20 hover:-translate-y-0.5 transition-all duration-300 w-full"
              >
                {content}
              </a>
            );
          })}
        </div>

        {/* Action button */}
        <div className="mt-8 flex justify-center gap-4">
          <button
            onClick={handleShare}
            className="flex items-center gap-2 bg-emerald-800/40 border border-emerald-500/20 hover:bg-emerald-800/60 text-emerald-200 px-6 py-3.5 rounded-full font-bold transition-all text-sm backdrop-blur-sm cursor-pointer shadow-lg active:scale-95"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                ¡Copiado!
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4 text-emerald-400" />
                Compartir Enlaces
              </>
            )}
          </button>
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-12 text-center text-xs text-emerald-400/60 z-10 space-y-2">
        <div className="flex justify-center gap-2 items-center text-emerald-400/80 font-semibold mb-1">
          <Award className="w-4 h-4" />
          <span>75+ Años de Conservación</span>
        </div>
        <p>&copy; {new Date().getFullYear()} ZooMAT. Todos los derechos reservados.</p>
        <p className="flex justify-center items-center gap-1">
          Hecho con <Heart className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500" /> para la biodiversidad
        </p>
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import chatLauncherLogo from "../../assets/chat-launcher.jpg";

const CHATBOT_URL =
  (import.meta.env.VITE_CHATBOT_URL as string | undefined) ||
  (import.meta.env.PROD ? "https://chatbot.pruzo.me" : "http://localhost:8000");

export function PublicChatButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);

  // Alternar apertura/cierre y marcar como abierto al menos una vez para lazy-load del iframe
  const handleToggle = () => {
    setIsOpen((prev) => {
      const next = !prev;
      if (next) setHasOpened(true);
      return next;
    });
  };

  // Cierre accesible con la tecla Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Escuchar mensaje 'ZOOMAT_CHAT_CLOSE' proveniente del iframe para cerrar la ventana modal
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === "ZOOMAT_CHAT_CLOSE") {
        setIsOpen(false);
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return (
    <>
      {/* Fondo traslúcido para móviles al abrir el chat */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[990] bg-black/40 backdrop-blur-[2px] transition-opacity duration-200 sm:hidden"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Ventana Modal / Contenedor Flotante del Asistente */}
      {hasOpened && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Ventana del Asistente Virtual ZooMAT"
          className={`fixed bottom-22 right-3 sm:bottom-28 sm:right-6 z-[1000] w-[calc(100vw-1.5rem)] sm:w-[420px] max-w-[420px] h-[calc(100dvh-7rem)] sm:h-[620px] max-h-[680px] rounded-2xl sm:rounded-3xl border-2 border-[#1c0d03]/25 bg-[#faf8f2] shadow-[0_12px_45px_rgba(28,13,3,0.35)] overflow-hidden flex flex-col transition-all duration-300 ease-out origin-bottom-right ${
            isOpen
              ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
              : "opacity-0 scale-95 translate-y-4 pointer-events-none invisible"
          }`}
        >
          {/* Barra superior de control rápido para pantallas móviles */}
          <div className="flex sm:hidden items-center justify-between px-3.5 py-2 bg-[#231205] text-white border-b border-[#361c0a] flex-shrink-0">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#22c55e] animate-pulse"></span>
              <span className="text-xs font-bold text-[#ffcc00] tracking-wide">Asistente ZooMAT</span>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Cerrar asistente virtual"
              className="flex items-center justify-center w-7 h-7 rounded-full bg-white/10 text-white/90 hover:bg-[#ffcc00] hover:text-[#111] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Iframe que aloja el asistente Flask desacoplado */}
          <div className="relative flex-1 w-full h-full overflow-hidden bg-[#faf8f2]">
            <iframe
              src={CHATBOT_URL}
              width="100%"
              height="100%"
              frameBorder="0"
              style={{ border: "none", borderRadius: "inherit" }}
              allow="microphone"
              title="Asistente Virtual ZooMAT"
              className="w-full h-full block"
            />
          </div>
        </div>
      )}

      {/* Botón Flotante (Launcher) con el Logo Oficial del Asistente */}
      <button
        type="button"
        onClick={handleToggle}
        aria-expanded={isOpen}
        aria-label={isOpen ? "Cerrar asistente virtual" : "Abrir asistente virtual ZooMAT"}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[1000] flex h-14 w-14 sm:h-[78px] sm:w-[78px] cursor-pointer items-center justify-center rounded-full border-2 border-[#ffcc00] bg-[#231205] shadow-[0_6px_20px_rgba(35,18,5,0.4)] hover:shadow-[0_10px_26px_rgba(255,204,0,0.4)] outline-none transition-all duration-300 ease-out hover:scale-[1.08] hover:-translate-y-1 active:scale-95 will-change-transform group p-0 overflow-visible"
      >
        {isOpen ? (
          <div className="flex h-full w-full items-center justify-center rounded-full bg-[#ffcc00] text-[#111] shadow-inner transition-colors duration-200">
            <X className="h-7 w-7 sm:h-8 sm:w-8 transition-transform duration-200" />
          </div>
        ) : (
          <div className="relative h-full w-full rounded-full overflow-hidden bg-[#231205]">
            <img
              src={chatLauncherLogo}
              alt="Asistente ZooMAT - ¿Quieres saber más?"
              className="h-full w-full object-cover scale-[1.05] rounded-full transition-transform duration-300 group-hover:scale-110 select-none pointer-events-none"
            />
            {/* Indicador de estado en línea */}
            <span className="absolute top-0.5 right-0.5 flex h-3.5 w-3.5 sm:h-4 sm:w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22c55e] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 sm:h-4 sm:w-4 bg-[#22c55e] border-2 border-[#231205]"></span>
            </span>
          </div>
        )}
      </button>
    </>
  );
}

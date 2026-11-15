import { useState, useEffect } from "react";
import { X } from "lucide-react";

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
          className={`fixed bottom-20 right-3 sm:bottom-24 sm:right-6 z-[1000] w-[calc(100vw-1.5rem)] sm:w-[420px] max-w-[420px] h-[calc(100dvh-6.5rem)] sm:h-[620px] max-h-[680px] rounded-2xl sm:rounded-3xl border-2 border-[#1c0d03]/25 bg-[#faf8f2] shadow-[0_12px_45px_rgba(28,13,3,0.35)] overflow-hidden flex flex-col transition-all duration-300 ease-out origin-bottom-right ${
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
              src="http://localhost:8000"
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

      {/* Botón Flotante (Launcher) con Transición de Ícono */}
      <button
        type="button"
        onClick={handleToggle}
        aria-expanded={isOpen}
        aria-label={isOpen ? "Cerrar asistente virtual" : "Abrir asistente virtual"}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[1000] flex h-13 w-13 sm:h-[70px] sm:w-[70px] cursor-pointer flex-col items-center justify-center rounded-full border-0 bg-[#ffcc00] shadow-[0_4px_10px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.35)] outline-none transition-all duration-200 ease-out hover:scale-[1.08] hover:-translate-y-1 hover:bg-[#e6b800] active:scale-90 active:-rotate-[5deg] will-change-transform"
      >
        {isOpen ? (
          <X className="h-6 w-6 sm:h-7 sm:w-7 text-[#111] transition-transform duration-200" />
        ) : (
          <>
            <span className="mb-0.5 font-sans text-[10px] sm:text-xs font-bold lowercase leading-none text-[#111]">
              chat
            </span>
            <span className="relative flex h-4.5 w-5.5 sm:h-[26px] sm:w-8 items-center justify-center rounded-[50%_50%_50%_10%] bg-[#111]">
              <span className="-mt-0.5 font-sans text-[10px] sm:text-sm font-bold leading-none tracking-[-1px] text-white">
                •••
              </span>
            </span>
          </>
        )}
      </button>
    </>
  );
}

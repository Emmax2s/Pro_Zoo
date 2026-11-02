export function PublicChatButton() {
  return (
    <button
      type="button"
      aria-label="Chat"
      className="fixed bottom-5 right-5 z-[1000] flex h-[70px] w-[70px] cursor-pointer flex-col items-center justify-center rounded-full border-0 bg-[#ffcc00] shadow-[0_4px_10px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.35)] outline-none transition-all duration-200 ease-out hover:scale-[1.08] hover:-translate-y-1 hover:bg-[#e6b800] active:scale-90 active:-rotate-[5deg] sm:bottom-6 sm:right-6 will-change-transform"
    >
      <span className="mb-0.5 font-sans text-xs font-bold lowercase leading-none text-[#111]">
        chat
      </span>
      <span className="relative flex h-[26px] w-8 items-center justify-center rounded-[50%_50%_50%_10%] bg-[#111]">
        <span className="-mt-0.5 font-sans text-sm font-bold leading-none tracking-[-1px] text-white">
          •••
        </span>
      </span>
    </button>
  );
}

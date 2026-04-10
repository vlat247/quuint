"use client";

interface MobileHeaderProps {
  userNickname?: string;
  activeView: string;
  setActiveView: (view: "home" | "folders" | "history" | "settings") => void;
  onProfileClick: () => void;
}

export function MobileHeader({ 
  userNickname, 
  activeView, 
  setActiveView, 
  onProfileClick 
}: MobileHeaderProps) {
  return (
    <header className="flex-none px-4 pt-6 pb-2 flex justify-between items-center z-10 relative">
      <button onClick={onProfileClick} className="active:scale-95 transition-transform">
        <div className="h-10 w-10 rounded-full bg-zinc-200 flex items-center justify-center">
          <span className="text-sm font-semibold text-zinc-600">
            {userNickname ? userNickname.slice(0, 2).toUpperCase() : "VL"}
          </span>
        </div>
      </button>

      <div className="flex bg-zinc-100/80 p-1 rounded-full border border-zinc-200/80">
        <button
          onClick={() => setActiveView("home")}
          className={`px-5 py-1.5 rounded-full text-[13px] font-semibold transition-all ${
            activeView === "home" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-700"
          }`}
        >
          Analyze
        </button>
        <button
          onClick={() => setActiveView("folders")}
          className={`px-5 py-1.5 rounded-full text-[13px] font-semibold transition-all ${
            activeView === "folders" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-700"
          }`}
        >
          Folders
        </button>
      </div>
    </header>
  );
}

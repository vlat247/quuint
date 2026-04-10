"use client";

import { ReactNode } from "react";

interface NavItem {
  id: string;
  label: string;
  icon: ReactNode;
}

interface BottomNavProps {
  activeView: "home" | "folders" | "history" | "settings";
  setActiveView: (view: "home" | "folders" | "history" | "settings") => void;
}

export function BottomNav({ activeView, setActiveView }: BottomNavProps) {
  const items: NavItem[] = [
    { 
      id: "home", 
      label: "Home", 
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={activeView === "home" ? 2.5 : 1.8} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /> 
    },
    { 
      id: "folders", 
      label: "Folders", 
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={activeView === "folders" ? 2.5 : 1.8} d="M3 7a2 2 0 012-2h4l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" /> 
    },
    { 
      id: "history", 
      label: "History", 
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={activeView === "history" ? 2.5 : 1.8} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /> 
    },
    { 
      id: "settings", 
      label: "Settings", 
      icon: (
        <>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={activeView === "settings" ? 2.5 : 1.8} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={activeView === "settings" ? 2.5 : 1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </>
      ) 
    },
  ];

  return (
    <div className="fixed bottom-4 inset-x-0 flex justify-center z-50 pointer-events-none px-4">
      <nav className="pointer-events-auto flex items-center gap-1 px-2 py-2 rounded-[28px] bg-white/30 backdrop-blur-3xl border border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.8)] w-full max-w-lg">
        {items.map(({ id, label, icon }) => (
          <button
            key={id}
            onClick={() => setActiveView(id as any)}
            className={`flex flex-col items-center justify-center flex-1 h-16 rounded-[22px] gap-1 transition-all ${
              activeView === id
                ? "bg-zinc-900 text-white"
                : "text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100"
            }`}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">{icon}</svg>
            <span className="text-[10px] font-semibold tracking-wide">{label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

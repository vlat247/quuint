"use client";

import { Sparkles, Globe, ChevronRight } from "lucide-react";

interface SettingsViewProps {
  userNickname?: string;
  userEmail?: string;
  onOpenAccountModal: () => void;
  onOpenPlansModal: () => void;
  language: "en" | "ru";
  setLanguage: (lang: "en" | "ru") => void;
}

export function SettingsView({ 
  userNickname, 
  userEmail, 
  onOpenAccountModal,
  onOpenPlansModal,
  language,
  setLanguage
}: SettingsViewProps) {
  return (
    <div className="animate-in fade-in duration-300 pt-4 space-y-8">
      {/* Account Section */}
      <section>
        <h2 className="text-[22px] font-bold text-zinc-900 mb-4 px-1">Settings</h2>
        <div className="rounded-[24px] bg-white border border-zinc-100 shadow-sm overflow-hidden divide-y divide-zinc-100">
          <button 
            onClick={onOpenAccountModal} 
            className="w-full flex items-center justify-between p-4 hover:bg-zinc-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-zinc-200 flex items-center justify-center flex-none">
                <span className="text-sm font-semibold text-zinc-600">
                  {userNickname ? userNickname.slice(0, 2).toUpperCase() : "VL"}
                </span>
              </div>
              <div className="text-left">
                <p className="font-semibold text-zinc-900 text-[15px]">{userNickname || "Account"}</p>
                <p className="text-zinc-500 text-[13px]">{userEmail || "Manage profile"}</p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-zinc-300" />
          </button>
        </div>
      </section>

      {/* Subscription Section */}
      <section>
        <h3 className="text-[13px] font-bold text-zinc-400 uppercase tracking-widest px-1 mb-3">Subscription</h3>
        <button 
          onClick={onOpenPlansModal}
          className="w-full relative overflow-hidden group rounded-[32px] p-6 text-left transition-all active:scale-[0.98] shadow-xl shadow-indigo-500/10"
        >
          {/* Animated Background Gradient */}
          <div className="absolute inset-0 bg-linear-to-br from-indigo-600 via-purple-600 to-pink-500 group-hover:scale-105 transition-transform duration-500" />
          
          {/* Subtle Glow Overlay (Replaces the sharp h-1/2 line) */}
          <div className="absolute inset-x-0 top-0 bottom-0 bg-linear-to-b from-white/20 via-transparent to-transparent opacity-80" />
          
          {/* Decorative Sparkle Glow */}
          <div className="absolute -top-12 -right-12 h-40 w-40 bg-white/20 blur-3xl rounded-full group-hover:bg-white/30 transition-colors" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-[11px] font-bold uppercase tracking-wider mb-4 border border-white/20">
              <Sparkles className="h-3.5 w-3.5 fill-current" />
              Premium Access
            </div>
            <h4 className="text-2xl font-black text-white mb-1 tracking-tight">Upgrade to Pro</h4>
            <p className="text-white/80 text-[15px] font-medium max-w-[220px] leading-snug">Unlock unlimited sources and automated digests.</p>
            
            <div className="mt-8 flex items-center gap-2 text-white font-extrabold text-[15px]">
              <span className="bg-white/20 hover:bg-white/30 px-4 py-1.5 rounded-full backdrop-blur-md border border-white/20 transition-all">
                Learn more
              </span>
              <ChevronRight className="h-5 w-5 bg-white text-indigo-600 rounded-full p-0.5 shadow-lg group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </button>
      </section>

      {/* Preferences Section */}
      <section>
        <h3 className="text-[13px] font-bold text-zinc-400 uppercase tracking-widest px-1 mb-3">Preferences</h3>
        <div className="rounded-[24px] bg-white border border-zinc-100 shadow-sm overflow-hidden p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="h-10 w-10 rounded-[14px] bg-zinc-100 flex items-center justify-center text-zinc-500">
                <Globe className="h-5 w-5" />
             </div>
             <span className="font-semibold text-zinc-900 text-[15px]">Language</span>
          </div>
          
          <div className="flex bg-zinc-100 p-1 rounded-full border border-zinc-200">
             <button 
               onClick={() => setLanguage("en")}
               className={`px-4 py-1.5 rounded-full text-[12px] font-bold transition-all ${language === "en" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500"}`}
             >
               EN
             </button>
             <button 
               onClick={() => setLanguage("ru")}
               className={`px-4 py-1.5 rounded-full text-[12px] font-bold transition-all ${language === "ru" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500"}`}
             >
               RU
             </button>
          </div>
        </div>
      </section>
    </div>
  );
}

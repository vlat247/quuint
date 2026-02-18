"use client";

import { useState, useEffect } from "react";
import { X, User, Mail, LogOut, Zap } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  email?: string;
  nickname?: string;
}

export function AccountModal({ isOpen, onClose, email, nickname }: AccountModalProps) {
  const [name, setName] = useState(nickname || "");
  const [isLoading, setIsLoading] = useState(false);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    if (nickname) setName(nickname);
  }, [nickname]);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSaveError("");

    const { error } = await supabase.auth.updateUser({
      data: { display_name: name },
    });

    setIsLoading(false);
    if (error) {
      setSaveError(error.message);
    } else {
      onClose();
    }
  };

  const displayInitials = name
    ? name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : email?.slice(0, 2).toUpperCase() ?? "??";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md scale-100 rounded-2xl bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-zinc-900">Account Settings</h2>
          <button onClick={onClose} className="rounded-full p-1 hover:bg-zinc-100 text-zinc-500 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Profile Header */}
        <div className="flex items-center gap-4 mb-8 bg-zinc-50 p-4 rounded-xl border border-zinc-100">
          <div className="h-16 w-16 rounded-full bg-gradient-to-tr from-zinc-900 to-zinc-700 flex items-center justify-center text-white text-xl font-bold shadow-lg ring-4 ring-white">
            {displayInitials}
          </div>
          <div>
            <h3 className="font-semibold text-lg text-zinc-900">{name || email || "User"}</h3>
            <div className="flex items-center gap-1.5 text-sm text-zinc-500">
              <span className="inline-block h-2 w-2 rounded-full bg-green-500"></span>
              Free Plan
            </div>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-5">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Display Name</label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-5 w-5 text-zinc-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="w-full rounded-lg border border-zinc-200 pl-10 pr-3 py-2.5 text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 transition-all font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-5 w-5 text-zinc-400" />
                <input
                  type="email"
                  value={email ?? ""}
                  disabled
                  className="w-full rounded-lg border border-zinc-200 bg-zinc-50 pl-10 pr-3 py-2.5 text-zinc-500 cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {saveError && <p className="text-sm text-red-600">{saveError}</p>}

          {/* Footer Actions */}
          <div className="flex gap-3 pt-4 border-t border-zinc-100">
            <button
              type="button"
              onClick={async () => {
                await supabase.auth.signOut();
                window.location.href = "/";
              }}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
            <div className="flex-1" />
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 font-medium text-zinc-700 hover:bg-zinc-50 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 rounded-lg bg-zinc-900 font-medium text-white hover:bg-zinc-800 transition-colors shadow-lg shadow-zinc-200 flex items-center gap-2"
            >
              {isLoading && <Zap className="h-4 w-4 animate-spin" />}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

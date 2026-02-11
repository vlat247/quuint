"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { ICON_MAP } from "./icons";

interface CreateFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, channels: string, icon: string) => void;
}

export function FolderModal({ isOpen, onClose, onCreate }: CreateFolderModalProps) {
  const [name, setName] = useState("");
  const [channels, setChannels] = useState("");
  const [selectedIconName, setSelectedIconName] = useState("Folder");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Folder name is required");
      return;
    }
    if (!channels.trim()) {
      setError("At least one channel is required");
      return;
    }
    onCreate(name, channels, selectedIconName);
    // Reset
    setName("");
    setChannels("");
    setSelectedIconName("Folder");
    setError("");
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md scale-100 rounded-2xl bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-zinc-900">Create New Folder</h2>
          <button onClick={onClose} className="rounded-full p-1 hover:bg-zinc-100 text-zinc-500 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Icon Picker */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">Folder Icon</label>
            <div className="grid grid-cols-5 gap-2">
              {Object.entries(ICON_MAP).map(([iconName, IconComponent]) => (
                <button
                  key={iconName}
                  type="button"
                  onClick={() => setSelectedIconName(iconName)}
                  className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all ${
                    selectedIconName === iconName
                      ? "bg-zinc-900 text-white shadow-md ring-2 ring-zinc-900 ring-offset-2"
                      : "bg-zinc-50 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
                  }`}
                  title={iconName}
                >
                  <IconComponent className="h-5 w-5 mb-1" />
                </button>
              ))}
            </div>
          </div>

          <div>
             <label className="block text-sm font-medium text-zinc-700 mb-1">Folder Name</label>
             <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Crypto News"
                className="w-full rounded-lg border border-zinc-200 px-3 py-2.5 text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 transition-all font-medium"
             />
          </div>

          <div>
             <label className="block text-sm font-medium text-zinc-700 mb-1">Channels (comma separated)</label>
             <input
                type="text"
                value={channels}
                onChange={(e) => setChannels(e.target.value)}
                placeholder="@coindesk, @cointelegraph"
                className="w-full rounded-lg border border-zinc-200 px-3 py-2.5 text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 transition-all"
             />
          </div>

          {error && <p className="text-sm text-red-600 font-medium animate-in fade-in">{error}</p>}

          <div className="flex gap-3 pt-4 border-t border-zinc-100 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-zinc-200 px-4 py-2.5 font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 rounded-lg bg-zinc-900 px-4 py-2.5 font-medium text-white hover:bg-zinc-800 transition-colors shadow-lg shadow-zinc-200"
            >
              Create Folder
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

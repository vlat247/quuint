"use client";

import { useState } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { ICON_MAP } from "./icons";

interface CreateFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, channels: string[], icon: string) => void;
}

export function FolderModal({ isOpen, onClose, onCreate }: CreateFolderModalProps) {
  const [name, setName] = useState("");
  const [channels, setChannels] = useState<string[]>([""]);
  const [selectedIconName, setSelectedIconName] = useState("Folder");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Folder name is required");
      return;
    }
    const validChannels = channels.map(c => c.trim()).filter(Boolean);
    if (validChannels.length === 0) {
      setError("At least one channel is required");
      return;
    }
    onCreate(name, validChannels, selectedIconName);
    setName("");
    setChannels([""]);
    setSelectedIconName("Folder");
    setError("");
  };

  const updateChannel = (index: number, value: string) => {
    setChannels(prev => prev.map((ch, i) => i === index ? value : ch));
    setError("");
  };

  const addChannel = () => {
    setChannels(prev => [...prev, ""]);
  };

  const removeChannel = (index: number) => {
    if (channels.length <= 1) return;
    setChannels(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="fixed inset-0 z-[100] bg-white flex flex-col animate-in slide-in-from-bottom duration-300 overflow-hidden">
      {/* Header */}
      <div className="flex-none px-5 pt-10 pb-4 flex items-center justify-between border-b border-zinc-100">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="rounded-full p-2 hover:bg-zinc-100 text-zinc-900 transition-colors">
            <X className="h-6 w-6" />
          </button>
          <h2 className="text-xl font-bold text-zinc-900">New Knowledge Base</h2>
        </div>
        <button 
          onClick={handleSubmit} 
          type="submit"
          form="folder-form"
          className="text-blue-500 font-bold text-sm hover:opacity-80 transition-opacity"
        >
          Create
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 py-8">
        <div className="w-full max-w-lg mx-auto">
          <form id="folder-form" onSubmit={handleSubmit} className="space-y-8 pb-10">
            {/* Icon Picker */}
            <div>
              <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-4">Select Icon</label>
              <div className="grid grid-cols-5 gap-3">
                {Object.entries(ICON_MAP).map(([iconName, IconComponent]) => (
                  <button
                    key={iconName}
                    type="button"
                    onClick={() => setSelectedIconName(iconName)}
                    className={`flex flex-col items-center justify-center h-14 rounded-2xl transition-all ${
                      selectedIconName === iconName
                        ? "bg-zinc-900 text-white shadow-lg scale-105"
                        : "bg-zinc-50 text-zinc-400 hover:bg-zinc-100"
                    }`}
                  >
                    <IconComponent className="h-6 w-6" />
                  </button>
                ))}
              </div>
            </div>

            <div>
               <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Folder Name</label>
               <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Crypto Research"
                  className="w-full rounded-[16px] border border-zinc-200 bg-white px-4 py-4 text-zinc-900 text-lg placeholder:text-zinc-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:outline-none transition-all font-medium"
               />
            </div>

            <div>
               <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Telegram Channels</label>
               <div className="space-y-3">
                 {channels.map((ch, i) => (
                   <div key={i} className="flex items-center gap-3 animate-in fade-in slide-in-from-left-2 duration-200">
                     <div className="flex-1 relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 font-medium">@</span>
                        <input
                          type="text"
                          value={ch}
                          onChange={(e) => updateChannel(i, e.target.value)}
                          placeholder="channel_name"
                          className="w-full rounded-[16px] border border-zinc-200 bg-white pl-9 pr-4 py-4 text-zinc-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:outline-none transition-all"
                        />
                     </div>
                     {channels.length > 1 && (
                       <button
                         type="button"
                         onClick={() => removeChannel(i)}
                         className="h-12 w-12 flex items-center justify-center rounded-[16px] text-zinc-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                       >
                         <Trash2 className="h-5 w-5" />
                       </button>
                     )}
                   </div>
                 ))}
                 <button
                   type="button"
                   onClick={addChannel}
                   className="w-full flex items-center justify-center gap-2 py-4 rounded-[16px] border border-dashed border-zinc-200 text-zinc-500 hover:text-zinc-900 hover:border-zinc-300 transition-all font-medium"
                 >
                   <Plus className="h-5 w-5" />
                   Add another channel
                 </button>
               </div>
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600 font-medium animate-in fade-in">
                {error}
              </div>
            )}
            
            <button
                type="submit"
                className="w-full h-16 rounded-[20px] bg-zinc-900 text-white font-bold text-lg hover:bg-black active:scale-[0.98] transition-all shadow-xl shadow-zinc-200 mt-4"
            >
                Create Knowledge Base
            </button>
          </form>
        </div>
      </div>
    </div>

  );
}

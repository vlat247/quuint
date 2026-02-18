"use client";

import { useState } from "react";

import { 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  LayoutDashboard,
  PanelLeftClose,
  PanelLeftOpen,
  Folder
} from "lucide-react";
import { FolderModal } from "./FolderModal";
import { ICON_MAP } from "./icons";

interface SidebarProps {
  folders: Array<{ id: string; name: string; channels: string[]; icon?: string }>;
  selectedFolderId: string | null;
  onSelectFolder: (id: string) => void;
  onCreateFolder: (name: string, channels: string[], icon: string) => void;
  isCollapsed: boolean;
  toggleSidebar: () => void;
  onOpenAccountSettings?: () => void;
  userName?: string;
}

export function Sidebar({ 
  folders, 
  selectedFolderId, 
  onSelectFolder, 
  onCreateFolder,
  isCollapsed,
  toggleSidebar,
  onOpenAccountSettings,
  userName
}: SidebarProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div 
      className={`relative flex flex-col border-r border-zinc-200 bg-zinc-50/50 h-screen transition-all duration-300 ease-in-out ${
        isCollapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Header */}
      <div className={`flex items-center h-16 border-b border-zinc-200/50 ${isCollapsed ? "justify-center px-0" : "px-4 justify-between"}`}>
        {!isCollapsed && (
           <span className="font-semibold text-zinc-900 text-lg animate-in fade-in duration-300">quint</span>
        )}
        
        <button 
          onClick={toggleSidebar}
          className={`text-zinc-400 hover:text-zinc-600 hover:bg-zinc-200/50 rounded-md transition-colors ${isCollapsed ? "p-1.5" : "p-1"}`}
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </button>
      </div>

      {/* Folders List */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-4 space-y-1 px-2">
        {!isCollapsed && (
           <div className="px-2 pb-2 text-xs font-semibold text-zinc-400 uppercase tracking-wider animate-in fade-in">
             Folders
           </div>
        )}
        
          {folders.length === 0 && !isCollapsed && (
            <p className="px-2 py-3 text-xs text-zinc-400 animate-in fade-in">
              No folders yet. Create one below.
            </p>
          )}
          {folders.map((folder) => {
            const IconComponent = ICON_MAP[folder.icon || "Folder"] || Folder;
            
            return (
              <button
                key={folder.id}
                onClick={() => onSelectFolder(folder.id)}
                className={`group w-full flex items-center gap-3 px-2 py-2 rounded-lg text-sm transition-all ${
                  selectedFolderId === folder.id
                    ? "bg-white text-zinc-900 shadow-sm ring-1 ring-zinc-200"
                    : "text-zinc-600 hover:bg-zinc-200/50 hover:text-zinc-900"
                } ${isCollapsed ? "justify-center" : ""}`}
                title={isCollapsed ? folder.name : undefined}
              >
                <IconComponent className={`h-5 w-5 shrink-0 ${selectedFolderId === folder.id ? "text-zinc-900" : "text-zinc-500 group-hover:text-zinc-900"}`} />
                
                {!isCollapsed && (
                    <span className="font-medium truncate animate-in fade-in duration-200">{folder.name}</span>
                )}
              </button>
            );
          })}
      </div>
      
       {/* New Folder Button */}
       <div className="p-2 border-t border-zinc-200/50">
          <button
            onClick={() => setIsModalOpen(true)}
            className={`w-full flex items-center gap-3 px-2 py-2.5 rounded-lg text-sm text-zinc-500 hover:bg-zinc-200/50 hover:text-zinc-900 transition-colors dashed-border border-zinc-300 ${isCollapsed ? "justify-center" : ""}`}
            title={isCollapsed ? "Create New Folder" : undefined}
          >
            <div className="h-6 w-6 rounded border border-dashed border-zinc-300 flex items-center justify-center shrink-0 group-hover:border-zinc-400">
              <Plus className="h-4 w-4" />
            </div>
            {!isCollapsed && <span className="animate-in fade-in duration-200">New Folder</span>}
          </button>
       </div>

      {/* User Profile */}
      <div className="p-3 border-t border-zinc-200/50">
        <button 
          onClick={onOpenAccountSettings}
          className={`flex items-center gap-3 w-full rounded-lg hover:bg-zinc-200/50 transition-colors text-left ${isCollapsed ? "justify-center p-2" : "px-2 py-2"}`}
        >
            <div className="h-8 w-8 rounded-full bg-zinc-200 flex items-center justify-center text-zinc-500 text-xs font-bold shrink-0">
                {userName ? userName.slice(0, 2).toUpperCase() : "US"}
            </div>
            {!isCollapsed && (
                <div className="text-sm overflow-hidden animate-in fade-in duration-200">
                    <p className="font-medium text-zinc-900 truncate">{userName || "User"}</p>
                    <p className="text-xs text-zinc-500 truncate">Free Plan</p>
                </div>
            )}
        </button>
      </div>

      <FolderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={(name: string, channels: string[], icon: string) => {
          onCreateFolder(name, channels, icon);
          setIsModalOpen(false);
        }}
      />
    </div>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";

import { 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  LayoutDashboard,
  PanelLeftClose,
  PanelLeftOpen,
  Folder,
  X
} from "lucide-react";
import { FolderModal } from "./FolderModal";
import { ICON_MAP } from "./icons";

export interface HistoryItem {
  id: string;
  channel: string;
  summary: any;
  created_at: string;
}

interface SidebarProps {
  folders: Array<{ id: string; name: string; channels: string[]; icon?: string }>;
  selectedFolderId: string | null;
  onSelectFolder: (id: string) => void;
  onCreateFolder: (name: string, channels: string[], icon: string) => void;
  isCollapsed: boolean;
  toggleSidebar: () => void;
  onOpenAccountSettings?: () => void;
  userName?: string;
  historyItems?: HistoryItem[];
  onSelectHistory?: (item: HistoryItem) => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export function Sidebar({ 
  folders, 
  selectedFolderId, 
  onSelectFolder, 
  onCreateFolder,
  isCollapsed,
  toggleSidebar,
  onOpenAccountSettings,
  userName,
  historyItems = [],
  onSelectHistory,
  isMobileOpen = false,
  onCloseMobile
}: SidebarProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(256);
  const [isResizing, setIsResizing] = useState(false);

  useEffect(() => {
    const savedWidth = localStorage.getItem("quint_sidebar_width");
    if (savedWidth) {
      const parsedWidth = Number(savedWidth);
      const maxWidth = typeof window !== "undefined" ? window.innerWidth * 0.25 : 600;
      setSidebarWidth(Math.min(Math.max(200, parsedWidth), Math.max(200, maxWidth)));
    }
  }, []);

  const startResizing = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = useCallback((e: MouseEvent) => {
    if (isResizing) {
      let newWidth = e.clientX;
      const maxWidth = typeof window !== "undefined" ? window.innerWidth * 0.25 : 600;
      const clampedMaxWidth = Math.max(200, maxWidth);
      
      if (newWidth < 200) newWidth = 200;
      if (newWidth > clampedMaxWidth) newWidth = clampedMaxWidth;
      
      setSidebarWidth(newWidth);
    }
  }, [isResizing]);

  useEffect(() => {
    if (isResizing) {
      window.addEventListener("mousemove", resize);
      window.addEventListener("mouseup", stopResizing);
    }
    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, [isResizing, resize, stopResizing]);

  useEffect(() => {
    if (!isResizing) {
      localStorage.setItem("quint_sidebar_width", sidebarWidth.toString());
    }
  }, [sidebarWidth, isResizing]);

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 z-40 bg-zinc-900/50 md:hidden"
          onClick={onCloseMobile}
        />
      )}
      
      <div 
        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-zinc-200 bg-zinc-50 md:bg-zinc-50/50 h-screen shrink-0 transform md:relative md:translate-x-0 w-full md:w-[var(--sidebar-width)] ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        } ${
          isResizing ? "" : "transition-transform md:transition-all duration-300 ease-in-out"
        }`}
        style={{ '--sidebar-width': `${isCollapsed ? 64 : sidebarWidth}px` } as React.CSSProperties}
      >
      <div className={`flex items-center h-20 md:h-16 border-b border-zinc-200/50 ${isCollapsed ? "justify-center px-0" : "px-6 md:px-4 justify-between"}`}>
        {!isCollapsed && (
           <span className="font-semibold text-zinc-900 text-3xl md:text-lg animate-in fade-in duration-300">quint</span>
        )}
        
        <button 
          onClick={toggleSidebar}
          className={`hidden md:block text-zinc-400 hover:text-zinc-600 hover:bg-zinc-200/50 rounded-md transition-colors ${isCollapsed ? "p-1.5" : "p-1"}`}
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </button>

        <button 
          onClick={onCloseMobile}
          className="md:hidden text-zinc-400 hover:text-zinc-600 hover:bg-zinc-200/50 rounded-md transition-colors p-2"
          title="Close Sidebar"
        >
          <X className="h-8 w-8" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        {/* Folders List */}
        <div className="py-6 md:py-4 space-y-2 md:space-y-1 px-4 md:px-2">
          {!isCollapsed && (
             <div className="px-2 pb-2 text-lg md:text-xs font-semibold text-zinc-400 uppercase tracking-wider animate-in fade-in">
               Folders
             </div>
          )}
          
            {folders.length === 0 && !isCollapsed && (
              <p className="px-2 py-3 text-lg md:text-xs text-zinc-400 animate-in fade-in">
                No folders yet. Create one below.
              </p>
            )}
            {folders.map((folder) => {
              const IconComponent = ICON_MAP[folder.icon || "Folder"] || Folder;
              
              return (
                <button
                  key={folder.id}
                  onClick={() => onSelectFolder(folder.id)}
                  className={`group w-full flex items-center gap-4 md:gap-3 px-3 md:px-2 py-3 md:py-2 rounded-xl md:rounded-lg text-xl md:text-sm transition-all ${
                    selectedFolderId === folder.id
                      ? "bg-white text-zinc-900 shadow-sm ring-1 ring-zinc-200"
                      : "text-zinc-600 hover:bg-zinc-200/50 hover:text-zinc-900"
                  } ${isCollapsed ? "justify-center" : ""}`}
                  title={isCollapsed ? folder.name : undefined}
                >
                  <IconComponent className={`h-8 w-8 md:h-5 md:w-5 shrink-0 ${selectedFolderId === folder.id ? "text-zinc-900" : "text-zinc-500 group-hover:text-zinc-900"}`} />
                  
                  {!isCollapsed && (
                      <span className="font-medium truncate animate-in fade-in duration-200">{folder.name}</span>
                  )}
                </button>
              );
            })}
        </div>
        
        {/* History List */}
        <div className="py-4 md:py-2 space-y-2 md:space-y-1 px-4 md:px-2 border-t border-zinc-200/50">
          {!isCollapsed && (
             <div className="px-2 pb-2 pt-2 text-lg md:text-xs font-semibold text-zinc-400 uppercase tracking-wider animate-in fade-in">
               History
             </div>
          )}
          
          {historyItems.length === 0 && !isCollapsed && (
            <p className="px-2 py-3 text-lg md:text-xs text-zinc-400 animate-in fade-in">
              No history yet.
            </p>
          )}
          
          {historyItems.map((item) => {
            const isDigest = item.channel.startsWith("[Digest]");
            const displayName = isDigest ? "Digest" : item.channel;
            const IconComponent = isDigest ? Folder : LayoutDashboard;
            
            return (
              <button
                key={item.id}
                onClick={() => onSelectHistory?.(item)}
                className={`group w-full flex items-center gap-4 md:gap-3 px-3 md:px-2 py-3 md:py-2 rounded-xl md:rounded-lg text-xl md:text-sm transition-all text-zinc-600 hover:bg-zinc-200/50 hover:text-zinc-900 ${
                  isCollapsed ? "justify-center" : ""
                }`}
                title={isCollapsed ? displayName : undefined}
              >
                <IconComponent className="h-6 w-6 md:h-4 md:w-4 shrink-0 text-zinc-400 group-hover:text-zinc-600" />
                
                {!isCollapsed && (
                  <div className="flex flex-col items-start truncate animate-in fade-in duration-200 w-full overflow-hidden">
                    <span className="font-medium truncate w-full text-left">{displayName}</span>
                    <span className="text-sm md:text-[10px] text-zinc-400 leading-none mt-1.5 md:mt-1">
                      {new Date(item.created_at).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
      
       {/* New Folder Button */}
       <div className="p-4 md:p-2 border-t border-zinc-200/50">
          <button
            onClick={() => setIsModalOpen(true)}
            className={`w-full flex items-center gap-4 md:gap-3 px-3 md:px-2 py-4 md:py-2.5 rounded-xl md:rounded-lg text-xl md:text-sm text-zinc-500 hover:bg-zinc-200/50 hover:text-zinc-900 transition-colors dashed-border border-zinc-300 ${isCollapsed ? "justify-center" : ""}`}
            title={isCollapsed ? "Create New Folder" : undefined}
          >
            <div className="h-10 w-10 md:h-6 md:w-6 rounded md:rounded border border-dashed border-zinc-300 flex items-center justify-center shrink-0 group-hover:border-zinc-400">
              <Plus className="h-6 w-6 md:h-4 md:w-4" />
            </div>
            {!isCollapsed && <span className="animate-in fade-in duration-200">New Folder</span>}
          </button>
       </div>

      {/* User Profile */}
      <div className="p-4 md:p-3 border-t border-zinc-200/50">
        <button 
          onClick={onOpenAccountSettings}
          className={`flex items-center gap-4 md:gap-3 w-full rounded-xl md:rounded-lg hover:bg-zinc-200/50 transition-colors text-left ${isCollapsed ? "justify-center p-2" : "px-4 md:px-2 py-3 md:py-2"}`}
        >
            <div className="h-12 w-12 md:h-8 md:w-8 rounded-full bg-zinc-200 flex items-center justify-center text-zinc-500 text-lg md:text-xs font-bold shrink-0">
                {userName ? userName.slice(0, 2).toUpperCase() : "US"}
            </div>
            {!isCollapsed && (
                <div className="text-xl md:text-sm overflow-hidden animate-in fade-in duration-200">
                    <p className="font-medium text-zinc-900 truncate">{userName || "User"}</p>
                    <p className="text-base md:text-xs text-zinc-500 truncate">Free Plan</p>
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

      {!isCollapsed && (
        <div
          onMouseDown={startResizing}
          className={`absolute top-0 right-0 w-1.5 h-full cursor-col-resize z-50 hover:bg-zinc-300 transition-colors ${
            isResizing ? "bg-zinc-400" : "bg-transparent"
          }`}
        />
      )}
    </div>
    </>
  );
}

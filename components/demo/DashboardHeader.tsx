"use client";

import { ChevronRight, Home, Bell, Search } from "lucide-react";

interface DashboardHeaderProps {
  folderName?: string;
  isSidebarCollapsed?: boolean;
  onHomeClick?: () => void;
  onProfileClick?: () => void;
}

export function DashboardHeader({ folderName, isSidebarCollapsed, onHomeClick, onProfileClick }: DashboardHeaderProps) {
  return (
    <header 
      className={`sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-zinc-200 bg-white/80 px-4 backdrop-blur-md transition-all duration-300 mx-auto`}
    >
      {/* Left: Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm font-medium text-zinc-500">
        <button 
          onClick={onHomeClick}
          className="flex items-center gap-2 hover:text-zinc-900 transition-colors cursor-pointer"
        >
          <Home className="h-4 w-4" />
          <span>Home</span>
        </button>
        
        {folderName && (
          <>
            <ChevronRight className="h-4 w-4 text-zinc-300" />
            <span className="font-semibold text-zinc-900 animate-in fade-in slide-in-from-left-2 duration-200">
              {folderName}
            </span>
          </>
        )}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
         <div className="relative hidden sm:block">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-400" />
            <input 
              type="text" 
              placeholder="Search..." 
              className="h-9 w-64 rounded-md border border-zinc-200 bg-zinc-50 pl-9 pr-4 text-sm outline-none focus:border-zinc-400 focus:ring-0 transition-all"
            />
         </div>
         <button className="rounded-full p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 transition-colors">
            <Bell className="h-5 w-5" />
         </button>
         <button 
            onClick={onProfileClick}
            className="ml-2 h-8 w-8 rounded-full bg-gradient-to-tr from-zinc-900 to-zinc-700 shadow-md ring-2 ring-white hover:ring-zinc-200 transition-all" 
         />
      </div>
    </header>
  );
}

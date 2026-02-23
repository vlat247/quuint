"use client";

import { ChevronRight, Home, Bell, Search, Menu } from "lucide-react";

interface DashboardHeaderProps {
  folderName?: string;
  isSidebarCollapsed?: boolean;
  onHomeClick?: () => void;
  onProfileClick?: () => void;
  onMobileMenuClick?: () => void;
}

export function DashboardHeader({ folderName, isSidebarCollapsed, onHomeClick, onProfileClick, onMobileMenuClick }: DashboardHeaderProps) {
  return (
    <header 
      className={`sticky top-0 z-30 flex h-24 md:h-16 w-full items-center justify-between border-b border-zinc-200 bg-white md:bg-white/80 px-6 md:px-4 md:backdrop-blur-md transition-all duration-300 mx-auto`}
    >
      {/* Left: Breadcrumbs */}
      <div className="flex items-center gap-4 md:gap-2 text-xl md:text-sm font-medium text-zinc-500">
        <button
          onClick={onMobileMenuClick}
          className="md:hidden flex items-center justify-center p-2 -ml-2 text-zinc-500 hover:bg-zinc-100/50 rounded-md transition-colors"
        >
          <Menu className="h-8 w-8 md:h-5 md:w-5" />
        </button>
        <button 
          onClick={onHomeClick}
          className="hidden md:flex items-center gap-3 md:gap-2 hover:text-zinc-900 transition-colors cursor-pointer"
        >
          <Home className="h-7 w-7 md:h-4 md:w-4" />
          <span className="hidden sm:inline">Home</span>
        </button>
        
        {folderName && (
          <>
            <ChevronRight className="h-6 w-6 md:h-4 md:w-4 text-zinc-300" />
            <span className="font-semibold text-zinc-900 animate-in fade-in slide-in-from-left-2 duration-200">
              {folderName}
            </span>
          </>
        )}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-4 md:gap-2">
         <div className="relative hidden sm:block">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-400" />
            <input 
              type="text" 
              placeholder="Search..." 
              className="h-9 w-64 rounded-md border border-zinc-200 bg-zinc-50 pl-9 pr-4 text-sm outline-none focus:border-zinc-400 focus:ring-0 transition-all"
            />
         </div>
         <button className="rounded-full p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 transition-colors">
            <Bell className="h-7 w-7 md:h-5 md:w-5" />
         </button>
         <button 
            onClick={onProfileClick}
            className="ml-2 h-10 w-10 md:h-8 md:w-8 rounded-full bg-gradient-to-tr from-zinc-900 to-zinc-700 shadow-md ring-2 ring-white hover:ring-zinc-200 transition-all" 
         />
      </div>
    </header>
  );
}

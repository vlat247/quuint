"use client";

interface SettingsViewProps {
  userNickname?: string;
  userEmail?: string;
  onOpenAccountModal: () => void;
}

export function SettingsView({ 
  userNickname, 
  userEmail, 
  onOpenAccountModal 
}: SettingsViewProps) {
  return (
    <div className="animate-in fade-in duration-300 pt-4">
      <h2 className="text-[22px] font-bold text-zinc-900 mb-4 px-1">Settings</h2>
      <div className="rounded-[20px] bg-white border border-zinc-100 shadow-sm overflow-hidden divide-y divide-zinc-100">
        <button 
          onClick={onOpenAccountModal} 
          className="w-full flex items-center justify-between p-4 hover:bg-zinc-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-zinc-200 flex items-center justify-center">
              <span className="text-sm font-semibold text-zinc-600">
                {userNickname ? userNickname.slice(0, 2).toUpperCase() : "VL"}
              </span>
            </div>
            <div className="text-left">
              <p className="font-semibold text-zinc-900 text-[15px]">{userNickname || "Account"}</p>
              <p className="text-zinc-500 text-[13px]">{userEmail || "Manage profile"}</p>
            </div>
          </div>
          <svg className="h-5 w-5 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}

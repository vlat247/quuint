"use client";

import { ICON_MAP } from "../icons";

interface FoldersViewProps {
  folders: any[];
  foldersLoading: boolean;
  selectedFolderId: string | null;
  setSelectedFolderId: (id: string | null) => void;
  handleSelectFolder: (id: string) => void;
  digestData: any;
  generatingDigest: boolean;
  digestError: string;
  handleGenerateDigest: () => void;
  SelectedIcon: any;
  selectedFolder: any;
}

export function FoldersView({
  folders,
  foldersLoading,
  selectedFolderId,
  setSelectedFolderId,
  handleSelectFolder,
  digestData,
  generatingDigest,
  digestError,
  handleGenerateDigest,
  SelectedIcon,
  selectedFolder,
}: FoldersViewProps) {
  return (
    <div className="animate-in fade-in duration-300">
      {!selectedFolderId ? (
        <div className="pt-4 space-y-3">
          <h2 className="text-[22px] font-bold text-zinc-900 px-1 mb-4">Knowledge Bases</h2>
          {foldersLoading ? (
            <p className="text-zinc-400 text-sm px-1">Loading...</p>
          ) : folders.length === 0 ? (
            <div className="p-10 text-center rounded-[24px] border border-dashed border-zinc-300 bg-zinc-50">
              <p className="text-zinc-500 text-[14px]">No folders yet. Tap + to create one.</p>
            </div>
          ) : (
            folders.map(f => {
              const Icon = ICON_MAP[f.icon || "Folder"] || ICON_MAP["Folder"];
              return (
                <div 
                  key={f.id} 
                  onClick={() => handleSelectFolder(f.id)} 
                  className="flex items-center justify-between p-4 rounded-[20px] bg-white border border-zinc-100 hover:bg-zinc-50 active:scale-[0.98] transition-all cursor-pointer shadow-sm"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-[14px] bg-blue-50 text-blue-500 flex items-center justify-center">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-zinc-900 text-[16px]">{f.name}</h3>
                      <p className="text-zinc-500 text-[13px] mt-0.5">{f.channels.length} {f.channels.length === 1 ? "source" : "sources"}</p>
                    </div>
                  </div>
                  <svg className="h-5 w-5 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              );
            })
          )}
        </div>
      ) : (
        <div className="pt-2 animate-in slide-in-from-right-4 duration-300">
          <button 
            onClick={() => setSelectedFolderId(null)} 
            className="flex items-center gap-1.5 text-blue-500 text-[14px] font-semibold mb-6"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <div className="mb-6 flex items-center gap-2 px-1">
            {SelectedIcon && <SelectedIcon className="h-7 w-7 text-blue-500" />}
            <h2 className="text-[24px] font-bold text-zinc-900">{selectedFolder?.name}</h2>
          </div>
          {!digestData ? (
            <div className="flex flex-col items-center p-8 rounded-[24px] bg-zinc-50 border border-zinc-200 mt-4">
              <div className="h-16 w-16 mb-4 rounded-full bg-white border border-zinc-100 flex items-center justify-center text-zinc-400 shadow-sm">
                <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <button 
                onClick={handleGenerateDigest} 
                disabled={generatingDigest} 
                className="w-full py-3.5 rounded-[16px] bg-zinc-900 text-white font-semibold hover:bg-black disabled:bg-zinc-200 disabled:text-zinc-500 transition-colors text-[15px]"
              >
                {generatingDigest ? "Generating..." : "Generate Digest"}
              </button>
              {digestError && <p className="text-red-500 text-[13px] mt-3">{digestError}</p>}
            </div>
          ) : (
            <div className="rounded-[24px] bg-white border border-zinc-200 p-6 shadow-sm">
              <h3 className="text-lg font-bold text-zinc-900 mb-2">{digestData.title}</h3>
              <p className="text-[15px] text-zinc-600 leading-relaxed mb-5">{digestData.summary}</p>
              {digestData.insights?.length > 0 && (
                <div className="space-y-3 pt-5 border-t border-zinc-100">
                  <h4 className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-3">Key Insights</h4>
                  {digestData.insights.map((ins: string, i: number) => (
                    <div key={i} className="p-3.5 bg-zinc-50 rounded-[16px] text-[14px] text-zinc-700 leading-snug">
                      <span className="text-zinc-400 font-bold mr-2">•</span>{ins}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

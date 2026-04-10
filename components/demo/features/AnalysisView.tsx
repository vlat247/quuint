"use client";

import { useState } from "react";

interface AnalysisViewProps {
  channel: string;
  setChannel: (val: string) => void;
  loading: boolean;
  analyzed: boolean;
  singleChannelData: any;
  handleAnalyze: (e: React.FormEvent) => void;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  isSearching: boolean;
  searchResults: any[];
}

export function AnalysisView({
  channel,
  setChannel,
  loading,
  analyzed,
  singleChannelData,
  handleAnalyze,
  searchQuery,
  setSearchQuery,
  isSearching,
  searchResults,
}: AnalysisViewProps) {
  const [activeTab, setActiveTab] = useState<"summary" | "topics" | "search">("summary");

  return (
    <div className="animate-in fade-in duration-300 flex flex-col items-center">
      <div className="mt-8 mb-6 w-full max-w-sm mx-auto flex flex-col gap-3">
        <form onSubmit={handleAnalyze} className="w-full flex flex-col gap-3">
          <input
            type="text"
            value={channel}
            onChange={(e) => setChannel(e.target.value)}
            placeholder="@channel_name"
            className="w-full text-center rounded-[20px] bg-white border border-zinc-200 px-6 py-4 text-xl font-medium text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:outline-none shadow-sm transition-all"
          />
          <button
            type="submit"
            disabled={loading || !channel}
            className="w-full rounded-[20px] bg-zinc-900 text-white py-4 font-semibold text-[17px] hover:bg-black active:scale-[0.98] disabled:bg-zinc-100 disabled:text-zinc-400 disabled:border disabled:border-zinc-200 transition-all shadow-sm"
          >
            {loading ? "Extracting..." : "Scan Channel"}
          </button>
        </form>
      </div>

      {analyzed && singleChannelData && (
        <div className="w-full animate-in slide-in-from-bottom-6 duration-500">
          <div className="rounded-[24px] bg-white border border-zinc-200 shadow-sm overflow-hidden">
            {/* Card header */}
            <div className="border-b border-zinc-100 bg-zinc-50/50 px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                  {channel.trim().slice(0, 2).toUpperCase() || "CH"}
                </div>
                <div>
                  <h2 className="font-semibold text-zinc-900 text-[15px] truncate max-w-[160px]">
                    {singleChannelData?.result?.title || channel}
                  </h2>
                  <p className="text-[11px] text-zinc-500">Analysis complete</p>
                </div>
              </div>
              {singleChannelData?.result?.rating && (
                <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-zinc-100 text-zinc-700">
                  <span className="text-[13px] font-bold">{singleChannelData.result.rating}/10</span>
                  <svg className="h-3.5 w-3.5 text-yellow-500 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
              )}
            </div>

            {/* Tabs */}
            <div className="flex border-b border-zinc-100 bg-white">
              {(["summary", "topics", "search"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-3.5 text-[13px] font-semibold border-b-2 transition-all capitalize ${
                    activeTab === tab 
                      ? "border-blue-500 text-blue-600" 
                      : "border-transparent text-zinc-500 hover:text-zinc-700 hover:bg-zinc-50"
                  }`}
                >
                  {tab === "summary" ? "Summary" : tab === "search" ? "Search" : "Topics"}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="p-5 bg-white min-h-[220px]">
              {activeTab === "summary" && (
                <div className="animate-in fade-in space-y-5">
                  <div>
                    <h3 className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Primary Intent</h3>
                    <p className="text-zinc-700 leading-relaxed text-[15px]">
                      {singleChannelData?.result?.summary || "No summary."}
                    </p>
                  </div>
                  {singleChannelData?.result?.core_idea && (
                    <div className="p-4 bg-zinc-50 border border-zinc-100 rounded-[16px] text-zinc-700 text-[14px] leading-relaxed">
                      <span className="font-bold text-zinc-900 block mb-1 text-[11px] uppercase tracking-wider">Core Idea</span>
                      {singleChannelData.result.core_idea}
                    </div>
                  )}
                  {singleChannelData?.result?.insights?.length > 0 && (
                    <div>
                      <h3 className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-2 mt-4">Key Takeaways</h3>
                      <div className="space-y-2">
                        {singleChannelData.result.insights.map((insight: string, i: number) => (
                          <div key={i} className="flex gap-3 p-3.5 rounded-[12px] bg-zinc-50 border border-zinc-100">
                            <span className="text-zinc-400 font-bold text-sm mt-0.5">{i + 1}.</span>
                            <p className="text-[14px] text-zinc-700 leading-snug">{insight}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
              {activeTab === "topics" && (
                <div className="animate-in fade-in flex flex-wrap gap-2">
                  {singleChannelData?.result?.readers
                    ? singleChannelData.result.readers.split(",").map((t: string, i: number) => (
                        <span key={i} className="px-3 py-1.5 rounded-full bg-zinc-100 text-[13px] font-medium text-zinc-700">
                          {t.trim()}
                        </span>
                      ))
                    : <p className="text-zinc-500 text-[13px]">No topics detected.</p>}
                </div>
              )}
              {activeTab === "search" && (
                <div className="animate-in fade-in space-y-4">
                  <div className="relative">
                    <svg className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input 
                      type="text" 
                      value={searchQuery} 
                      onChange={e => setSearchQuery(e.target.value)} 
                      placeholder="Semantic search..." 
                      className="w-full pl-11 pr-4 py-3 rounded-[16px] bg-zinc-50 border border-zinc-200 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 text-[14px] text-zinc-900 placeholder:text-zinc-400 outline-none transition-all" 
                    />
                  </div>
                  <div className="space-y-3">
                    {isSearching && <p className="text-zinc-400 text-[12px] text-center py-6 animate-pulse">Searching...</p>}
                    {!isSearching && searchResults.map((res: any, i: number) => (
                      <div key={i} className="p-4 rounded-[16px] border border-zinc-100 bg-white shadow-sm hover:bg-zinc-50 transition-colors">
                        <p className="text-[13px] text-zinc-900 font-bold mb-1">{res.title}</p>
                        <p className="text-[13px] text-zinc-600 line-clamp-2 leading-relaxed">{res.summary}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

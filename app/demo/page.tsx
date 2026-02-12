"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { analyzeChannel, createFolder, generateDigest } from "@/app/actions";
import { DashboardHeader } from "@/components/demo/DashboardHeader";
import { AuroraBackground } from "@/components/AuroraBackground";
import { Sidebar } from "@/components/demo/Sidebar";
import { ICON_MAP } from "@/components/demo/icons";

function DemoPageContent() {
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email");
  
  // -- Global State --
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // -- Sidebar State --
  const [folders, setFolders] = useState<Array<{ id: string; name: string; channels: string[]; icon?: string }>>([
    { id: "demo-1", name: "Tech News", channels: ["@verge", "@techcrunch"], icon: "Rocket" },
    { id: "demo-2", name: "Crypto", channels: ["@coindesk", "@cointelegraph"], icon: "Bitcoin" },
  ]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);

  // -- Single Channel State --
  const [channel, setChannel] = useState("");
  const [loading, setLoading] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
  const [singleChannelData, setSingleChannelData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"summary" | "topics" | "search">("summary");

  // -- Digest State --
  const [generatingDigest, setGeneratingDigest] = useState(false);
  const [digestData, setDigestData] = useState<any>(null);
  const [digestError, setDigestError] = useState("");

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // -- Handlers --

  const handleCreateFolder = async (name: string, channelsList: string[], icon: string) => {
     // Optimistic update
     const tempId = crypto.randomUUID();
     const newFolder = { id: tempId, name, channels: channelsList, icon };
     setFolders(prev => [newFolder, ...prev]);
     
     // API Call
     const result = await createFolder(name, channelsList);
     if (result.success) {
         setFolders(prev => prev.map(f => f.id === tempId ? { ...f, id: result.data?.folder_id || tempId } : f));
     } else {
         alert("Failed to create folder on server (using local mock for now)");
     }
     setSelectedFolderId(tempId); // Auto-select
  };

  const handleSelectFolder = (id: string) => {
      setSelectedFolderId(id);
      setDigestData(null); // Reset digest view when switching
      setDigestError("");
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!channel) return;
    
    const emailToUse = emailParam || "demo@quint.com"; 

    setLoading(true);
    const result = await analyzeChannel(emailToUse, channel);
    setLoading(false);
    
    if (result.success && result.data) {
      let parsedData = result.data;
      try {
        if (parsedData?.summary && typeof parsedData.summary === 'string') {
          const nestedData = JSON.parse(parsedData.summary);
          parsedData = {
            result: {
              title: nestedData.title || parsedData.title,
              summary: nestedData.summary || 'No summary available.',
              insights: nestedData.insights || [],
              readers: nestedData.readers || parsedData.readers || '',
            },
            cached: parsedData.cached,
            is_mock: parsedData.is_mock,
          } as any;
        } else {
            parsedData = {
                result: {
                  summary: parsedData?.summary || 'No summary available.',
                  insights: parsedData?.insights || [],
                  readers: parsedData?.readers || '',
                }
            } as any;
        }
      } catch (parseError) {
        console.error('Failed to parse nested summary JSON:', parseError);
        parsedData = {
          result: {
            summary: String(parsedData?.summary || 'Analysis complete.'),
            insights: parsedData?.insights || [],
            readers: parsedData?.readers || '',
          }
        } as any;
      }
      
      setSingleChannelData(parsedData);
      setAnalyzed(true);
    } else {
      alert(result.error || "Analysis failed. Please try again.");
    }
  };

  const handleGenerateDigest = async () => {
    if (!selectedFolderId) return;
    setGeneratingDigest(true);
    setDigestError("");
    setDigestData(null);

    const result = await generateDigest(selectedFolderId);
    setGeneratingDigest(false);

    if (result.success) {
       setDigestData(result.data);
    } else {
       setDigestError(result.error || "Failed to generate digest");
    }
  };

  const selectedFolder = folders.find(f => f.id === selectedFolderId);
  const SelectedIcon = selectedFolder ? (ICON_MAP[selectedFolder.icon || "Folder"] || ICON_MAP["Folder"]) : null;

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      
      <Sidebar 
        folders={folders} 
        selectedFolderId={selectedFolderId} 
        onSelectFolder={handleSelectFolder} 
        onCreateFolder={(name, channels, icon) => handleCreateFolder(name, channels, icon)}
        isCollapsed={isSidebarCollapsed}
        toggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      <main className="flex-1 relative flex flex-col h-full overflow-hidden transition-all duration-300">
        {/* Background Elements */}
        <div className="absolute inset-0 z-0 pointer-events-none">
             <AuroraBackground />
              <div 
                className="absolute inset-x-0 top-0 h-32"
                style={{
                  background: "linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.08) 40%, transparent 100%)",
                }}
              />
               <div className="absolute inset-0">
                <div 
                  className="absolute inset-0"
                  style={{
                    backgroundImage: `
                      linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px)
                    `,
                    backgroundSize: "60px 60px",
                  }}
                />
                <div 
                  className="absolute inset-0 transition-opacity duration-100"
                  style={{
                    backgroundImage: `
                      linear-gradient(rgba(0,0,0,0.15) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(0,0,0,0.15) 1px, transparent 1px)
                    `,
                    backgroundSize: "60px 60px",
                    maskImage: `radial-gradient(circle 150px at ${mousePos.x}px ${mousePos.y}px, black 0%, transparent 100%)`,
                    WebkitMaskImage: `radial-gradient(circle 150px at ${mousePos.x}px ${mousePos.y}px, black 0%, transparent 100%)`,
                  }}
                />
              </div>
        </div>

        {/* Content Scroll Area */}
        <div className="relative z-10 flex-1 overflow-y-auto">
           {/* Header - Sticky within main content */}
           <div className="sticky top-0 z-50">
             <DashboardHeader 
                folderName={selectedFolder?.name} 
                isSidebarCollapsed={isSidebarCollapsed}
                onHomeClick={() => setSelectedFolderId(null)}
             />
           </div>

           <div className="mx-auto w-full max-w-5xl px-6 pt-12 pb-24">
              
              {/* --- VIEW: SINGLE CHANNEL (Home) --- */}
              {!selectedFolderId && (
                <div className="animate-in fade-in duration-500">
                    <div className="text-center mb-12">
                      <h1 className="text-4xl font-semibold text-zinc-900 sm:text-5xl">
                        Analyze a Channel
                      </h1>
                      <p className="mt-4 text-xl text-zinc-500">
                        Enter a Telegram channel to see its insights.
                      </p>
                    </div>

                    <div className="max-w-xl mx-auto mb-16">
                      <form onSubmit={handleAnalyze} className="relative">
                        <input
                          type="text"
                          value={channel}
                          onChange={(e) => setChannel(e.target.value)}
                          placeholder="@channel_name or link"
                          className="w-full rounded-xl border border-zinc-200 bg-white/80 px-6 py-4 text-lg text-zinc-900 shadow-sm backdrop-blur-sm transition-all placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                        />
                        <button
                          type="submit"
                          disabled={loading || !channel}
                          className="absolute top-2 right-2 bottom-2 rounded-lg bg-zinc-900 px-6 font-medium text-white transition-all hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {loading ? "Analyzing..." : "Analyze"}
                        </button>
                      </form>
                    </div>

                    {/* Single Channel Results */}
                    {analyzed && singleChannelData && (
                        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                            <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xl">
                              {/* Header */}
                              <div className="border-b border-zinc-100 bg-zinc-50/50 px-6 py-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="h-10 w-10 rounded-full bg-zinc-200 flex items-center justify-center text-zinc-500 font-bold text-lg">
                                    {channel.slice(0, 2).toUpperCase()}
                                  </div>
                                  <div>
                                    <h2 className="font-semibold text-zinc-900">{channel}</h2>
                                    <p className="text-sm text-zinc-500">Analysis complete</p>
                                  </div>
                                </div>
                              </div>

                              {/* Tabs */}
                              <div className="flex border-b border-zinc-100 bg-white">
                                {(["summary", "topics", "search"] as const).map((tab) => (
                                    <button
                                      key={tab}
                                      onClick={() => setActiveTab(tab)}
                                      className={`flex-1 border-b-2 px-4 py-4 text-sm font-medium transition-colors capitalize ${
                                        activeTab === tab
                                          ? "border-zinc-900 text-zinc-900"
                                          : "border-transparent text-zinc-500 hover:text-zinc-900"
                                      }`}
                                    >
                                      {tab === "summary" ? "Core Summary" : tab === "search" ? "Semantic Search" : "Topics"}
                                    </button>
                                ))}
                              </div>

                              {/* Content */}
                              <div className="min-h-[300px] bg-zinc-50/30 p-8">
                                {activeTab === "summary" && (
                                  <div className="animate-in fade-in duration-300 space-y-6">
                                    <div>
                                      <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 mb-2">Primary Intent</h3>
                                      <p className="text-xl leading-relaxed text-zinc-800">
                                        {singleChannelData?.result?.summary || "Analysis not available."}
                                      </p>
                                    </div>
                                    <div>
                                      <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 mb-2">Key Takeaways</h3>
                                      <ul className="space-y-3 text-lg text-zinc-700">
                                        {singleChannelData?.result?.insights?.map((insight: string, i: number) => (
                                          <li key={i} className="flex items-start gap-2">
                                            <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-zinc-400 shrink-0"></span>
                                            <span>{insight}</span>
                                          </li>
                                        )) || (
                                          <li>No insights generated.</li>
                                        )}
                                      </ul>
                                    </div>
                                  </div>
                                )}
                                {activeTab === "topics" && (
                                    <div className="animate-in fade-in duration-300">
                                        <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 mb-4">Trending Topics</h3>
                                        <div className="grid gap-4 sm:grid-cols-2">
                                        {singleChannelData?.result?.readers ? (
                                            singleChannelData.result.readers.split(",").map((topic: string, i: number) => (
                                            <div key={i} className="p-4 rounded-xl bg-white border border-zinc-200 shadow-sm hover:border-zinc-300 transition-colors cursor-default">
                                                <div className="flex justify-between items-start mb-2">
                                                <span className="font-medium text-zinc-900">{topic.trim()}</span>
                                                <span className="text-xs font-bold bg-zinc-100 text-zinc-500 px-2 py-1 rounded-full">Detected</span>
                                                </div>
                                            </div>
                                            ))
                                        ) : (
                                            <p className="text-zinc-500">No topics detected.</p>
                                        )}
                                        </div>
                                    </div>
                                )}
                                {activeTab === "search" && (
                                    <div className="animate-in fade-in duration-300 space-y-6">
                                         <div className="relative">
                                            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                                <svg className="h-5 w-5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                                </svg>
                                            </div>
                                            <input 
                                                type="text" 
                                                placeholder="Ask a question about this channel..." 
                                                className="w-full pl-10 pr-4 py-3 rounded-lg border border-zinc-200 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 bg-white"
                                            />
                                        </div>
                                    </div>
                                )}
                              </div>
                            </div>
                        </div>
                    )}
                </div>
              )}

              {/* --- VIEW: FOLDER DIGEST --- */}
              {selectedFolder && (
                 <div className="animate-in fade-in duration-500">
                      <div className="mb-8 border-b border-zinc-200 pb-6">
                         <div className="flex items-center gap-3 mb-2">
                            {SelectedIcon && <SelectedIcon className="h-10 w-10 text-zinc-900" />}
                            <h1 className="text-4xl font-semibold text-zinc-900">{selectedFolder.name}</h1>
                         </div>
                         <div className="flex flex-wrap gap-2 mt-4 ml-1">
                             {selectedFolder.channels.map((ch) => (
                                 <span key={ch} className="px-2 py-1 rounded-md bg-zinc-100 text-zinc-600 text-sm font-medium border border-zinc-200">
                                     {ch}
                                 </span>
                             ))}
                         </div>
                      </div>

                      {!digestData ? (
                         <div className="flex flex-col items-center justify-center py-12 rounded-2xl border border-dashed border-zinc-300 bg-zinc-50/50">
                             <div className="h-16 w-16 rounded-full bg-zinc-100 flex items-center justify-center mb-6 text-zinc-400">
                                 <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
                             </div>
                             <h2 className="text-xl font-medium text-zinc-900 mb-2">Ready to digest</h2>
                             <p className="text-zinc-500 mb-8 max-w-sm text-center">Generate a unified summary for all {selectedFolder.channels.length} channels in this folder.</p>
                             
                             <button
                                onClick={handleGenerateDigest}
                                disabled={generatingDigest}
                                className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-8 py-3 text-lg font-medium text-white shadow-lg shadow-zinc-200 hover:bg-zinc-800 hover:scale-[1.02] transition-all disabled:opacity-70 disabled:cursor-wait"
                              >
                                 {generatingDigest ? (
                                   <>
                                     <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                       <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                       <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                     </svg>
                                     Generating...
                                   </>
                                 ) : (
                                   "Generate Digest"
                                 )}
                              </button>
                              {digestError && <p className="mt-4 text-sm text-red-600">{digestError}</p>}
                         </div>
                      ) : (
                         /* Digest Result */
                         <div className="bg-white rounded-2xl border border-zinc-200 shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                             <div className="bg-zinc-50/50 border-b border-zinc-100 px-8 py-6 flex justify-between items-start">
                                 <div>
                                     <h2 className="text-2xl font-serif font-semibold text-zinc-900">{digestData.title}</h2>
                                     <p className="text-zinc-500 mt-1 text-sm">Generated just now • {selectedFolder.channels.length} sources</p>
                                 </div>
                                 {digestData.cached && (
                                   <span className="inline-block rounded bg-zinc-200 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-zinc-600">
                                      Cached
                                   </span>
                                )}
                             </div>
                             
                             <div className="p-8">
                                <section className="mb-10">
                                    <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-4">Executive Summary</h3>
                                    <p className="text-lg leading-relaxed text-zinc-800 font-medium">
                                        {digestData.summary}
                                    </p>
                                </section>

                                <section>
                                     <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-4">Key Insights</h3>
                                     <div className="grid gap-3">
                                         {digestData.insights.map((insight: string, i: number) => (
                                             <div key={i} className="flex gap-4 p-4 rounded-xl bg-zinc-50 border border-zinc-100">
                                                 <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600">
                                                     {i + 1}
                                                 </span>
                                                 <p className="text-zinc-700">{insight}</p>
                                             </div>
                                         ))}
                                     </div>
                                </section>
                             </div>
                         </div>
                      )}
                 </div>
              )}

           </div>
        </div>
      </main>
    </div>
  );
}

// Wrap in Suspense for useSearchParams
export default function DemoPage() {
  return (
    <Suspense fallback={<div className="h-screen w-screen bg-white flex items-center justify-center">Loading...</div>}>
      <DemoPageContent />
    </Suspense>
  );
}

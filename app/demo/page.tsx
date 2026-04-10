"use client";

import { useState, useEffect, Suspense } from "react";
import { analyzeChannel, createFolder, generateDigest } from "@/app/actions";
import { AccountModal } from "@/components/demo/AccountModal";
import { FolderModal } from "@/components/demo/FolderModal";
import { ICON_MAP } from "@/components/demo/icons";
import { supabase } from "@/lib/supabase/client";

function DemoPageContent() {
  
  // -- Global State --
  const [activeView, setActiveView] = useState<"home" | "folders" | "history" | "settings">("home");
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [userNickname, setUserNickname] = useState<string | undefined>();
  const [userEmail, setUserEmail] = useState<string | undefined>();

  // -- Sidebar State --
  const [folders, setFolders] = useState<Array<{ id: string; name: string; channels: string[]; icon?: string }>>([]);
  const [foldersLoading, setFoldersLoading] = useState(true);
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

  // -- History State --
  const [historyItems, setHistoryItems] = useState<any[]>([]);

  // -- Search State --
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");

  // Fetch user from session on mount
  useEffect(() => {
    async function fetchUser() {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      if (user) {
        setUserEmail(user.email);
        const nick = user.user_metadata?.display_name || user.user_metadata?.full_name;
        setUserNickname(nick);
      }
    }
    fetchUser();

    // Also listen for auth state changes (e.g. after updateUser saves new display name)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user;
      if (user) {
        setUserEmail(user.email);
        const nick = user.user_metadata?.display_name || user.user_metadata?.full_name;
        setUserNickname(nick);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // -- Handlers --

  // Fetch folders on mount
  useEffect(() => {
    async function fetchFoldersAndHistory() {
      try {
        const [foldersRes, historyRes] = await Promise.all([
          fetch('/api/folders'),
          fetch('/api/history')
        ]);

        if (foldersRes.ok) {
          const data = await foldersRes.json();
          // Always replace with real DB folders (even if empty)
          setFolders(data.folders ?? []);
        }

        if (historyRes.ok) {
          const res = await historyRes.json();
          if (res.success) setHistoryItems(res.data || []);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setFoldersLoading(false);
      }
    }
    fetchFoldersAndHistory();
  }, []);

  const handleCreateFolder = async (name: string, channelsList: string[], icon: string) => {
     // Optimistic update
     const tempId = crypto.randomUUID();
     const newFolder = { id: tempId, name, channels: channelsList, icon };
     setFolders(prev => [newFolder, ...prev]);
     
     // API Call
     const result = await createFolder(name, channelsList, icon);
     if (result.success) {
         setFolders(prev => prev.map(f => f.id === tempId ? { ...f, ...result.data, id: result.data.id } : f));
     } else {
         alert(result.error || "Failed to create folder");
         // Rollback
         setFolders(prev => prev.filter(f => f.id !== tempId));
     }
     setSelectedFolderId(result.success ? result.data.id : null); 
  };

  const handleSelectFolder = (id: string) => {
      setSelectedFolderId(id);
      setDigestData(null); // Reset digest view when switching
      setDigestError("");
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!channel) return;

    setLoading(true);
    const result = await analyzeChannel(channel);
    setLoading(false);
    
    if (result.success && result.data) {
      const d = result.data;
      const parsedData = {
        result: {
          ...d, // Base fields from backend
          title: d.title || channel,
          summary: d.summary || 'No summary available.',
          insights: Array.isArray(d.insights) ? d.insights : [],
          readers: d.readers || '',
        },
        cached: d.cached,
        is_mock: d.is_mock,
      };

      setSingleChannelData(parsedData);
      setAnalyzed(true);

      // Optimistically add to history
      setHistoryItems(prev => [{
        id: crypto.randomUUID(),
        channel: channel,
        summary: d,
        created_at: new Date().toISOString()
      }, ...prev]);

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
       // Optimistically add to history
       setHistoryItems(prev => [{
         id: crypto.randomUUID(),
         channel: `[Digest] ${selectedFolderId}`,
         summary: result.data,
         created_at: new Date().toISOString()
       }, ...prev]);
    } else {
       setDigestError(result.error || "Failed to generate digest");
    }
  };

  const handleSelectHistory = (item: any) => {
    if (item.channel.startsWith("[Digest]")) {
      // It's a digest
      const folderId = item.channel.replace("[Digest] ", "");
      setSelectedFolderId(folderId);
      setDigestData(item.summary);
      setDigestError("");
    } else {
      // It's a channel analysis
      setSelectedFolderId(null);
      setChannel(item.channel || item.title);
      
      const d = item.summary || item; // Handle direct backend format or nested format
      setSingleChannelData({
        result: {
          title: item.title || item.channel,
          summary: d.summary || d || 'No summary available.', // Backward compatibility
          insights: Array.isArray(d.insights) ? d.insights : Array.isArray(item.insights) ? item.insights : [],
          readers: item.readers || d.readers || '',
          rating: item.rating || d.rating,
          rating_feedback: item.rating_feedback || d.rating_feedback,
          core_idea: item.core_idea || d.core_idea,
        },
        cached: d.cached ?? true,
        is_mock: false,
      });
      setAnalyzed(true);
      setActiveTab("summary");
    }
  };

  // Search effect
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim().length >= 2) {
        setIsSearching(true);
        setSearchError("");
        
        try {
          const { searchAnalyses } = await import('@/app/actions');
          const res = await searchAnalyses(searchQuery);
          if (res.success) {
            setSearchResults(res.results || []);
          } else {
            setSearchError(res.error || "Search failed");
            setSearchResults([]);
          }
        } catch (err) {
          setSearchError("Search failed to execute");
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
        setSearchError("");
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const selectedFolder = folders.find(f => f.id === selectedFolderId);
  const SelectedIcon = selectedFolder ? (ICON_MAP[selectedFolder.icon || "Folder"] || ICON_MAP["Folder"]) : null;

  return (
    <div className="flex flex-col h-[100dvh] bg-white overflow-hidden font-sans antialiased">

      {/* Top Header */}
      <header className="flex-none px-5 pt-10 pb-3 flex justify-between items-center z-10 relative">
        <button onClick={() => setIsAccountModalOpen(true)} className="active:scale-95 transition-transform">
          <div className="h-10 w-10 rounded-full bg-zinc-200 flex items-center justify-center">
            <span className="text-sm font-semibold text-zinc-600">
              {userNickname ? userNickname.slice(0, 2).toUpperCase() : "VL"}
            </span>
          </div>
        </button>

        <div className="flex bg-zinc-100/80 p-1 rounded-full border border-zinc-200/80">
          <button
            onClick={() => setActiveView("home")}
            className={`px-5 py-1.5 rounded-full text-[13px] font-semibold transition-all ${activeView === "home" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-700"}`}
          >
            Analyze
          </button>
          <button
            onClick={() => setActiveView("folders")}
            className={`px-5 py-1.5 rounded-full text-[13px] font-semibold transition-all ${activeView === "folders" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-700"}`}
          >
            Folders
          </button>
        </div>
      </header>

      {/* Main scroll area */}
      <main className="flex-1 overflow-y-auto w-full max-w-lg mx-auto px-4 pb-36 relative z-0">

        {/* HOME — Analyze */}
        {activeView === "home" && (
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
                        <h2 className="font-semibold text-zinc-900 text-[15px] truncate max-w-[160px]">{singleChannelData?.result?.title || channel}</h2>
                        <p className="text-[11px] text-zinc-500">Analysis complete</p>
                      </div>
                    </div>
                    {singleChannelData?.result?.rating && (
                      <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-zinc-100 text-zinc-700">
                        <span className="text-[13px] font-bold">{singleChannelData.result.rating}/10</span>
                        <svg className="h-3.5 w-3.5 text-yellow-500 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                      </div>
                    )}
                  </div>

                  {/* Tabs */}
                  <div className="flex border-b border-zinc-100 bg-white">
                    {(["summary", "topics", "search"] as const).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex-1 py-3.5 text-[13px] font-semibold border-b-2 transition-all capitalize ${activeTab === tab ? "border-blue-500 text-blue-600" : "border-transparent text-zinc-500 hover:text-zinc-700 hover:bg-zinc-50"}`}
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
                          <p className="text-zinc-700 leading-relaxed text-[15px]">{singleChannelData?.result?.summary || "No summary."}</p>
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
                              <span key={i} className="px-3 py-1.5 rounded-full bg-zinc-100 text-[13px] font-medium text-zinc-700">{t.trim()}</span>
                            ))
                          : <p className="text-zinc-500 text-[13px]">No topics detected.</p>}
                      </div>
                    )}
                    {activeTab === "search" && (
                      <div className="animate-in fade-in space-y-4">
                        <div className="relative">
                          <svg className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                          <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Semantic search..." className="w-full pl-11 pr-4 py-3 rounded-[16px] bg-zinc-50 border border-zinc-200 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 text-[14px] text-zinc-900 placeholder:text-zinc-400 outline-none transition-all" />
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
        )}

        {/* FOLDERS */}
        {activeView === "folders" && (
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
                      <div key={f.id} onClick={() => handleSelectFolder(f.id)} className="flex items-center justify-between p-4 rounded-[20px] bg-white border border-zinc-100 hover:bg-zinc-50 active:scale-[0.98] transition-all cursor-pointer shadow-sm">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-[14px] bg-blue-50 text-blue-500 flex items-center justify-center">
                            <Icon className="h-6 w-6" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-zinc-900 text-[16px]">{f.name}</h3>
                            <p className="text-zinc-500 text-[13px] mt-0.5">{f.channels.length} {f.channels.length === 1 ? "source" : "sources"}</p>
                          </div>
                        </div>
                        <svg className="h-5 w-5 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                      </div>
                    );
                  })
                )}
              </div>
            ) : (
              <div className="pt-2 animate-in slide-in-from-right-4 duration-300">
                <button onClick={() => setSelectedFolderId(null)} className="flex items-center gap-1.5 text-blue-500 text-[14px] font-semibold mb-6">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
                  Back
                </button>
                <div className="mb-6 flex items-center gap-2 px-1">
                  {SelectedIcon && <SelectedIcon className="h-7 w-7 text-blue-500" />}
                  <h2 className="text-[24px] font-bold text-zinc-900">{selectedFolder?.name}</h2>
                </div>
                {!digestData ? (
                  <div className="flex flex-col items-center p-8 rounded-[24px] bg-zinc-50 border border-zinc-200 mt-4">
                    <div className="h-16 w-16 mb-4 rounded-full bg-white border border-zinc-100 flex items-center justify-center text-zinc-400 shadow-sm">
                      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <button onClick={handleGenerateDigest} disabled={generatingDigest} className="w-full py-3.5 rounded-[16px] bg-zinc-900 text-white font-semibold hover:bg-black disabled:bg-zinc-200 disabled:text-zinc-500 transition-colors text-[15px]">
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
        )}

        {/* HISTORY */}
        {activeView === "history" && (
          <div className="animate-in fade-in duration-300 pt-4">
            <h2 className="text-[22px] font-bold text-zinc-900 mb-4 px-1">Recent</h2>
            <div className="space-y-3">
              {historyItems.length === 0 ? (
                <div className="p-10 text-center rounded-[24px] border border-dashed border-zinc-300 bg-zinc-50">
                  <p className="text-zinc-500 text-[14px]">No history yet.</p>
                </div>
              ) : (
                historyItems.map((item, i) => {
                  const isDigest = item.channel.startsWith("[Digest]");
                  const title = isDigest ? item.channel.replace("[Digest] ", "Folder: ") : item.title || item.channel;
                  return (
                    <div key={i} onClick={() => handleSelectHistory(item)} className="p-4 rounded-[16px] bg-white border border-zinc-100 active:scale-[0.98] transition-transform cursor-pointer shadow-sm">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${isDigest ? "bg-blue-50 text-blue-600" : "bg-zinc-100 text-zinc-600"}`}>
                          {isDigest ? "Digest" : "Channel"}
                        </span>
                        <span className="text-[11px] text-zinc-400 font-medium">
                          {new Date(item.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                        </span>
                      </div>
                      <h4 className="font-semibold text-zinc-900 truncate text-[15px]">{title}</h4>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* SETTINGS */}
        {activeView === "settings" && (
          <div className="animate-in fade-in duration-300 pt-4">
            <h2 className="text-[22px] font-bold text-zinc-900 mb-4 px-1">Settings</h2>
            <div className="rounded-[20px] bg-white border border-zinc-100 shadow-sm overflow-hidden divide-y divide-zinc-100">
              <button onClick={() => setIsAccountModalOpen(true)} className="w-full flex items-center justify-between p-4 hover:bg-zinc-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-zinc-200 flex items-center justify-center">
                    <span className="text-sm font-semibold text-zinc-600">{userNickname ? userNickname.slice(0, 2).toUpperCase() : "VL"}</span>
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-zinc-900 text-[15px]">{userNickname || "Account"}</p>
                    <p className="text-zinc-500 text-[13px]">{userEmail || "Manage profile"}</p>
                  </div>
                </div>
                <svg className="h-5 w-5 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* FAB — folders list only */}
      {activeView === "folders" && !selectedFolderId && (
        <button
          onClick={() => setIsFolderModalOpen(true)}
          className="fixed bottom-[104px] right-6 h-16 w-16 flex items-center justify-center rounded-full bg-zinc-900 text-white shadow-xl hover:bg-black hover:scale-105 active:scale-95 transition-all z-40"
        >
          <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
        </button>
      )}

      {/* Floating Glassmorphism Bottom Nav */}
      <div className="fixed bottom-4 inset-x-0 flex justify-center z-50 pointer-events-none px-4">
        <nav className="pointer-events-auto flex items-center gap-1 px-2 py-2 rounded-[28px] bg-white/30 backdrop-blur-3xl border border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.8)] w-full max-w-lg">
          {[
            { id: "home", label: "Home", icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={activeView === "home" ? 2.5 : 1.8} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /> },
            { id: "folders", label: "Folders", icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={activeView === "folders" ? 2.5 : 1.8} d="M3 7a2 2 0 012-2h4l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" /> },
            { id: "history", label: "History", icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={activeView === "history" ? 2.5 : 1.8} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /> },
            { id: "settings", label: "Settings", icon: <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={activeView === "settings" ? 2.5 : 1.8} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={activeView === "settings" ? 2.5 : 1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></> },
          ].map(({ id, label, icon }) => (
            <button
              key={id}
              onClick={() => setActiveView(id as any)}
              className={`flex flex-col items-center justify-center flex-1 h-16 rounded-[22px] gap-1 transition-all ${
                activeView === id
                  ? "bg-zinc-900 text-white"
                  : "text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100"
              }`}
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">{icon}</svg>
              <span className="text-[10px] font-semibold tracking-wide">{label}</span>
            </button>
          ))}
        </nav>
      </div>

      <AccountModal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
        email={userEmail}
        nickname={userNickname}
      />
      <FolderModal
        isOpen={isFolderModalOpen}
        onClose={() => setIsFolderModalOpen(false)}
        onCreate={(name, channels, icon) => {
          handleCreateFolder(name, channels, icon);
          setIsFolderModalOpen(false);
          setActiveView("folders");
        }}
      />
    </div>
  );
}

// Wrap in Suspense for useSearchParams
export default function DemoPage() {
  return (
    <Suspense fallback={<div className="h-screen w-screen bg-white flex items-center justify-center"><div className="w-8 h-8 rounded-full border-t-2 border-zinc-900 animate-spin" /></div>}>
      <DemoPageContent />
    </Suspense>
  );
}

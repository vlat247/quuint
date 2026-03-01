"use client";

import { useState, useEffect, Suspense } from "react";
import { analyzeChannel, createFolder, generateDigest, getUserHistory } from "@/app/actions";
import { DashboardHeader } from "@/components/demo/DashboardHeader";
import { AuroraBackground } from "@/components/AuroraBackground";
import { Sidebar } from "@/components/demo/Sidebar";
import { AccountModal } from "@/components/demo/AccountModal";
import { ICON_MAP } from "@/components/demo/icons";
import { supabase } from "@/lib/supabase/client";

function DemoPageContent() {
  
  // -- Global State --
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
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

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Fetch user from session on mount (includes full metadata without extra network call)
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
    <div className="flex h-screen overflow-hidden bg-white">
      
      <Sidebar 
        folders={folders} 
        selectedFolderId={selectedFolderId} 
        onSelectFolder={handleSelectFolder} 
        onCreateFolder={(name, channels, icon) => handleCreateFolder(name, channels, icon)}
        isCollapsed={isSidebarCollapsed}
        toggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        onOpenAccountSettings={() => setIsAccountModalOpen(true)}
        userName={userNickname}
        historyItems={historyItems}
        onSelectHistory={handleSelectHistory}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      <main className="flex-1 relative flex flex-col h-full overflow-hidden transition-all duration-300">
        {/* Background Elements */}
        
        {/* ... (background code omitted for brevity in replace, but kept in file) ... */}
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
                onProfileClick={() => setIsAccountModalOpen(true)}
                onMobileMenuClick={() => setIsMobileSidebarOpen(true)}
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
                      <p className="mt-4 text-xl text-zinc-500 hidden md:block">
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
                              {singleChannelData?.is_mock && (
                                <div className="bg-amber-50 border-b border-amber-200 px-6 py-2 flex items-center gap-2 text-amber-700 text-sm font-medium">
                                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                  AI temporarily unavailable. Showing partial or cached data.
                                </div>
                              )}
                              <div className="border-b border-zinc-100 bg-zinc-50/50 px-6 py-4 flex items-center justify-between flex-wrap gap-4">
                                <div className="flex items-center gap-3">
                                  <div className="h-10 w-10 rounded-full bg-zinc-200 flex items-center justify-center text-zinc-500 font-bold text-lg">
                                    {channel.trim().slice(0, 2).toUpperCase() || 'CH'}
                                  </div>
                                  <div>
                                    <h2 className="font-semibold text-zinc-900">{singleChannelData?.result?.title || channel}</h2>
                                    <div className="flex items-center gap-2 text-sm text-zinc-500">
                                      <span>Analysis complete</span>
                                      {singleChannelData?.result?.freshness && (
                                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                                          singleChannelData.result.freshness === 'today' ? 'bg-green-100 text-green-700' :
                                          singleChannelData.result.freshness === 'this_week' ? 'bg-blue-100 text-blue-700' :
                                          'bg-zinc-200 text-zinc-700'
                                        }`}>
                                          {singleChannelData.result.freshness.replace('_', ' ')}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                
                                {singleChannelData?.result?.rating && (
                                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${
                                    singleChannelData.result.rating >= 8 ? 'bg-green-50 border-green-200 text-green-700' :
                                    singleChannelData.result.rating >= 5 ? 'bg-yellow-50 border-yellow-200 text-yellow-700' :
                                    'bg-red-50 border-red-200 text-red-700'
                                  }`}>
                                    <span className="text-sm font-bold">Rating: {singleChannelData.result.rating}/10</span>
                                    <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                  </div>
                                )}
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
                                  <div className="animate-in fade-in duration-300 space-y-8">
                                    <div>
                                      <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 mb-2">Primary Intent</h3>
                                      <p className="text-xl leading-relaxed text-zinc-800">
                                        {singleChannelData?.result?.summary || "Analysis not available."}
                                      </p>
                                    </div>
                                    
                                    {singleChannelData?.result?.core_idea && (
                                       <div>
                                          <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 mb-2">Core Idea</h3>
                                          <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-xl text-blue-900 font-medium">
                                            {singleChannelData.result.core_idea}
                                          </div>
                                       </div>
                                    )}

                                    {singleChannelData?.result?.rating_feedback && (
                                      <div className="grid sm:grid-cols-2 gap-4">
                                        {singleChannelData.result.rating_feedback.positives?.length > 0 && (
                                          <div className="p-4 bg-green-50 border border-green-200 rounded-xl shadow-sm">
                                            <h4 className="text-sm font-bold text-green-700 uppercase mb-3 flex items-center gap-2">
                                              <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                                              Strengths
                                            </h4>
                                            <ul className="space-y-2">
                                              {singleChannelData.result.rating_feedback.positives.map((p: string, i: number) => (
                                                <li key={i} className="text-sm text-green-900">{p}</li>
                                              ))}
                                            </ul>
                                          </div>
                                        )}
                                        {singleChannelData.result.rating_feedback.negatives?.length > 0 && (
                                          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl shadow-sm">
                                            <h4 className="text-sm font-bold text-amber-700 uppercase mb-3 flex items-center gap-2">
                                              <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                              Weaknesses
                                            </h4>
                                            <ul className="space-y-2">
                                              {singleChannelData.result.rating_feedback.negatives.map((n: string, i: number) => (
                                                <li key={i} className="text-sm text-amber-900">{n}</li>
                                              ))}
                                            </ul>
                                          </div>
                                        )}
                                      </div>
                                    )}

                                    <div>
                                      <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 mb-3">Key Takeaways</h3>
                                      <div className="grid gap-3">
                                        {singleChannelData?.result?.insights?.map((insight: string, i: number) => (
                                          <div key={i} className="flex gap-4 p-4 rounded-xl bg-white border border-zinc-200/60 shadow-sm">
                                              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-xs font-bold text-zinc-600">
                                                  {i + 1}
                                              </span>
                                              <p className="text-zinc-700 leading-relaxed font-medium">{insight}</p>
                                          </div>
                                        )) || (
                                          <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-100 text-zinc-500">No insights generated.</div>
                                        )}
                                      </div>
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
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                placeholder="Search across your saved analyses and digests..." 
                                                className="w-full pl-10 pr-10 py-3 rounded-lg border border-zinc-200 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 bg-white shadow-sm"
                                            />
                                            {isSearching && (
                                              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                                                <svg className="animate-spin h-5 w-5 text-zinc-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                              </div>
                                            )}
                                        </div>

                                        {searchError && (
                                          <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-100">
                                            {searchError}
                                          </div>
                                        )}

                                        <div className="space-y-6 pb-6 pt-2">
                                          {!isSearching && searchQuery.length >= 2 && searchResults.length === 0 && !searchError && (
                                              <p className="text-zinc-500 text-center py-8">No results found. Try different keywords.</p>
                                          )}
                                          
                                          {searchResults.map((result: any, i: number) => (
                                            <div key={i} className="group p-6 rounded-2xl bg-white border border-zinc-200/60 shadow-sm hover:border-zinc-300 hover:shadow-md transition-all duration-200 relative overflow-hidden">
                                              {/* Optional hover line effect */}
                                              <div className="absolute top-0 left-0 w-1 h-full bg-zinc-900 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                              
                                              <div className="flex justify-between items-start mb-4">
                                                <div className="flex items-center gap-3">
                                                  <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest ${
                                                    result.type === 'digest' ? 'bg-purple-100 text-purple-700' : 'bg-zinc-100 text-zinc-600'
                                                  }`}>
                                                    {result.type}
                                                  </span>
                                                  <h4 className="font-semibold text-lg text-zinc-900 group-hover:text-zinc-700 transition-colors">{result.title}</h4>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                  {result.rating > 0 && (
                                                    <span className="text-sm font-bold text-zinc-700 flex items-center gap-1.5 bg-zinc-50 px-2.5 py-1 rounded-lg border border-zinc-100">
                                                      {result.rating}/10
                                                      <svg className="h-4 w-4 text-zinc-900 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                                    </span>
                                                  )}
                                                  {result.similarity && (
                                                    <span className="text-xs font-bold text-green-700 bg-green-50/80 px-2.5 py-1 rounded-md border border-green-100">
                                                      {Math.round(result.similarity * 100)}% Match
                                                    </span>
                                                  )}
                                                </div>
                                              </div>
                                              <p className="text-base text-zinc-600 leading-relaxed mb-5">{result.summary}</p>
                                              
                                              {result.insights && result.insights.length > 0 && (
                                                <div className="mt-5 pt-4 border-t border-zinc-100">
                                                  <div className="flex items-center gap-2 mb-3">
                                                    <svg className="h-4 w-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                    <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Relevant Insight</p>
                                                  </div>
                                                  <div className="bg-zinc-50 border border-zinc-100 rounded-xl p-4">
                                                    <p className="text-sm font-medium text-zinc-800 leading-relaxed">"{result.insights[0]}"</p>
                                                  </div>
                                                </div>
                                              )}
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

                                {digestData.insights && Array.isArray(digestData.insights) && digestData.insights.length > 0 && (
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
                                )}
                             </div>
                         </div>
                      )}
                 </div>
              )}

           </div>
        </div>
      </main>

      <AccountModal 
        isOpen={isAccountModalOpen} 
        onClose={() => setIsAccountModalOpen(false)} 
        email={userEmail}
        nickname={userNickname}
      />
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

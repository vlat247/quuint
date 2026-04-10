"use client";

import { useState, useEffect, Suspense } from "react";
import { analyzeChannel, createFolder, generateDigest, searchAnalyses } from "@/app/actions";
import { AccountModal } from "@/components/demo/AccountModal";
import { FolderModal } from "@/components/demo/FolderModal";
import { ICON_MAP } from "@/components/demo/icons";
import { supabase } from "@/lib/supabase/client";

// Feature Components
import { MobileHeader } from "@/components/demo/features/MobileHeader";
import { BottomNav } from "@/components/demo/features/BottomNav";
import { AnalysisView } from "@/components/demo/features/AnalysisView";
import { FoldersView } from "@/components/demo/features/FoldersView";
import { HistoryView } from "@/components/demo/features/HistoryView";
import { SettingsView } from "@/components/demo/features/SettingsView";

function DemoPageContent() {
  
  // -- Global State --
  const [activeView, setActiveView] = useState<"home" | "folders" | "history" | "settings">("home");
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [userNickname, setUserNickname] = useState<string | undefined>();
  const [userEmail, setUserEmail] = useState<string | undefined>();

  // -- Folders State --
  const [folders, setFolders] = useState<Array<{ id: string; name: string; channels: string[]; icon?: string }>>([]);
  const [foldersLoading, setFoldersLoading] = useState(true);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);

  // -- Single Channel State --
  const [channel, setChannel] = useState("");
  const [loading, setLoading] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
  const [singleChannelData, setSingleChannelData] = useState<any>(null);

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

  // Fetch folders and history on mount
  useEffect(() => {
    async function fetchFoldersAndHistory() {
      try {
        const [foldersRes, historyRes] = await Promise.all([
          fetch('/api/folders'),
          fetch('/api/history')
        ]);

        if (foldersRes.ok) {
          const data = await foldersRes.json();
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

  // -- Handlers --

  const handleCreateFolder = async (name: string, channelsList: string[], icon: string) => {
     const tempId = crypto.randomUUID();
     const newFolder = { id: tempId, name, channels: channelsList, icon };
     setFolders(prev => [newFolder, ...prev]);
     
     const result = await createFolder(name, channelsList, icon);
     if (result.success) {
         setFolders(prev => prev.map(f => f.id === tempId ? { ...f, ...result.data, id: result.data.id } : f));
     } else {
         alert(result.error || "Failed to create folder");
         setFolders(prev => prev.filter(f => f.id !== tempId));
     }
     setSelectedFolderId(result.success ? result.data.id : null); 
  };

  const handleSelectFolder = (id: string) => {
      setSelectedFolderId(id);
      setDigestData(null); 
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
          ...d,
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
      const folderId = item.channel.replace("[Digest] ", "");
      setSelectedFolderId(folderId);
      setDigestData(item.summary);
      setDigestError("");
      setActiveView("folders");
    } else {
      setSelectedFolderId(null);
      setChannel(item.channel || item.title);
      
      const d = item.summary || item;
      setSingleChannelData({
        result: {
          title: item.title || item.channel,
          summary: d.summary || d || 'No summary available.',
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
      setActiveView("home");
    }
  };

  // Search effect
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim().length >= 2) {
        setIsSearching(true);
        setSearchError("");
        try {
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

      <MobileHeader 
        userNickname={userNickname}
        activeView={activeView}
        setActiveView={setActiveView}
        onProfileClick={() => setIsAccountModalOpen(true)}
      />

      <main className="flex-1 overflow-y-auto w-full max-w-lg mx-auto px-4 pb-36 relative z-0">
        {activeView === "home" && (
          <AnalysisView 
            channel={channel}
            setChannel={setChannel}
            loading={loading}
            analyzed={analyzed}
            singleChannelData={singleChannelData}
            handleAnalyze={handleAnalyze}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            isSearching={isSearching}
            searchResults={searchResults}
          />
        )}

        {activeView === "folders" && (
          <FoldersView 
            folders={folders}
            foldersLoading={foldersLoading}
            selectedFolderId={selectedFolderId}
            setSelectedFolderId={setSelectedFolderId}
            handleSelectFolder={handleSelectFolder}
            digestData={digestData}
            generatingDigest={generatingDigest}
            digestError={digestError}
            handleGenerateDigest={handleGenerateDigest}
            SelectedIcon={SelectedIcon}
            selectedFolder={selectedFolder}
          />
        )}

        {activeView === "history" && (
          <HistoryView 
            historyItems={historyItems}
            onSelectHistory={handleSelectHistory}
          />
        )}

        {activeView === "settings" && (
          <SettingsView 
            userNickname={userNickname}
            userEmail={userEmail}
            onOpenAccountModal={() => setIsAccountModalOpen(true)}
          />
        )}
      </main>

      {/* FAB — folders list only */}
      {activeView === "folders" && !selectedFolderId && (
        <button
          onClick={() => setIsFolderModalOpen(true)}
          className="fixed bottom-[104px] right-6 h-14 w-14 flex items-center justify-center rounded-full bg-zinc-900 text-white shadow-xl hover:bg-black hover:scale-105 active:scale-95 transition-all z-40"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      )}

      <BottomNav 
        activeView={activeView}
        setActiveView={setActiveView}
      />

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

export default function DemoPage() {
  return (
    <Suspense fallback={<div className="h-screen w-screen bg-white flex items-center justify-center"><div className="w-8 h-8 rounded-full border-t-2 border-zinc-900 animate-spin" /></div>}>
      <DemoPageContent />
    </Suspense>
  );
}

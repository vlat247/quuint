"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { analyzeChannel } from "@/app/actions";
import { Header } from "@/components/Header";
import { AuroraBackground } from "@/components/AuroraBackground";

function DemoPageContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const [data, setData] = useState<any>(null);
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });
  const [channel, setChannel] = useState("");
  const [loading, setLoading] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
  const [activeTab, setActiveTab] = useState<"summary" | "topics" | "search">("summary");

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!channel) return;
    
    const emailToUse = email || "demo@quint.com"; 

    setLoading(true);
    const result = await analyzeChannel(emailToUse, channel);
    setLoading(false);
    
    if (result.success) {
      // Backend returns { summary: "JSON string", insights: [], readers: string }
      // The 'summary' field contains a nested JSON with the actual data
      let parsedData = result.data;
      
      try {
        // Parse the nested JSON in 'summary' field if it exists
        if (parsedData?.summary && typeof parsedData.summary === 'string') {
          const nestedData = JSON.parse(parsedData.summary);
          // Normalize to the structure the UI expects
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
          // Fallback: wrap in 'result' if not already there
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
        // Keep raw data if parsing fails
        parsedData = {
          result: {
            summary: String(parsedData?.summary || 'Analysis complete.'),
            insights: parsedData?.insights || [],
            readers: parsedData?.readers || '',
          }
        } as any;
      }
      
      setData(parsedData);
      setAnalyzed(true);
    } else {
      alert(result.error || "Analysis failed. Please try again.");
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <AuroraBackground />
      <Header />

      {/* Top darkening overlay */}
      <div 
        className="pointer-events-none fixed inset-x-0 top-0 z-[65] h-32"
        style={{
          background: "linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.08) 40%, transparent 100%)",
        }}
        aria-hidden="true"
      />

      {/* Grid Overlay */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
          }}
          aria-hidden="true"
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
          aria-hidden="true"
        />
      </div>

      <main className="relative z-10 mx-auto w-full max-w-5xl flex-1 px-6 pt-32 pb-24">
        {/* Hero */}
        <div className="text-center">

          <h1 className="text-5xl font-semibold text-zinc-900 sm:text-6xl">
            Try the demo
          </h1>
          <p className="mt-4 text-xl text-zinc-500">
            See how quint turns chaos into clarity.
          </p>
        </div>

        {/* Input Section */}
        <div className="mt-12">
          <form onSubmit={handleAnalyze} className="relative mx-auto max-w-lg">
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

        {/* Results Section */}
        {analyzed && (
          <div className="mt-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xl">
              {/* Fake Header */}
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
                <div className="flex gap-1">
                  <span className="h-3 w-3 rounded-full bg-zinc-200"></span>
                  <span className="h-3 w-3 rounded-full bg-zinc-200"></span>
                  <span className="h-3 w-3 rounded-full bg-zinc-200"></span>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-zinc-100 bg-white">
                <button
                  onClick={() => setActiveTab("summary")}
                  className={`flex-1 border-b-2 px-4 py-4 text-sm font-medium transition-colors ${
                    activeTab === "summary"
                      ? "border-zinc-900 text-zinc-900"
                      : "border-transparent text-zinc-500 hover:text-zinc-900"
                  }`}
                >
                  Core Summary
                </button>
                <button
                  onClick={() => setActiveTab("topics")}
                  className={`flex-1 border-b-2 px-4 py-4 text-sm font-medium transition-colors ${
                    activeTab === "topics"
                      ? "border-zinc-900 text-zinc-900"
                      : "border-transparent text-zinc-500 hover:text-zinc-900"
                  }`}
                >
                  Topics
                </button>
                <button
                  onClick={() => setActiveTab("search")}
                  className={`flex-1 border-b-2 px-4 py-4 text-sm font-medium transition-colors ${
                    activeTab === "search"
                      ? "border-zinc-900 text-zinc-900"
                      : "border-transparent text-zinc-500 hover:text-zinc-900"
                  }`}
                >
                  Semantic Search
                </button>
              </div>

              {/* Content Area */}
              <div className="min-h-[300px] bg-zinc-50/30 p-8">
                {activeTab === "summary" && (
                  <div className="animate-in fade-in duration-300 space-y-6">
                    <div>
                      <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 mb-2">Primary Intent</h3>
                      <p className="text-xl leading-relaxed text-zinc-800">
                        {data?.result?.summary || "Analysis not available."}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 mb-2">Key Takeaways</h3>
                      <ul className="space-y-3 text-lg text-zinc-700">
                        {data?.result?.insights?.map((insight: string, i: number) => (
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
                      {data?.result?.readers ? (
                        data.result.readers.split(",").map((topic: string, i: number) => (
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
                    
                    <div>
                      <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 mb-3">Suggested Queries</h3>
                      <div className="space-y-2">
                        <div className="p-3 rounded-lg bg-white border border-zinc-200 text-zinc-600 hover:border-zinc-400 hover:text-zinc-900 cursor-pointer transition-all">
                          &quot;What is the sentiment around Bitcoin?&quot;
                        </div>
                        <div className="p-3 rounded-lg bg-white border border-zinc-200 text-zinc-600 hover:border-zinc-400 hover:text-zinc-900 cursor-pointer transition-all">
                          &quot;Summarize the recent updates on AI agents.&quot;
                        </div>
                        <div className="p-3 rounded-lg bg-white border border-zinc-200 text-zinc-600 hover:border-zinc-400 hover:text-zinc-900 cursor-pointer transition-all">
                          &quot;Are there any mentions of Y Combinator?&quot;
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <p className="mt-8 text-center text-zinc-400 text-sm">
              * This is a demo using simulated data.
            </p>
          </div>
        )}

        {/* ───────── Feature Sections ───────── */}
        <div className="mt-32 space-y-28">

          {/* Decorative divider */}
          <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-zinc-300 to-transparent" />
            <span className="text-xs font-semibold uppercase tracking-widest text-zinc-400">What makes quint different</span>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-zinc-300 to-transparent" />
          </div>

          {/* ── Feature 1: Cross-channel Thematic Digesting ── */}
          <section>
            <div className="mb-10 text-center">
              <span className="mb-3 inline-block rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-violet-500">
                Cross-channel
              </span>
              <h2 className="text-3xl font-semibold text-zinc-900 sm:text-4xl">
                Thematic Digesting
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-lg text-zinc-500">
                Telegram only summarises one chat. Quint gives you a single window across all your sources.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Card — Folder Summaries */}
              <div className="group relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm transition-all hover:shadow-lg hover:border-zinc-300">
                <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-violet-100/60 blur-3xl transition-all group-hover:bg-violet-200/80" />
                <div className="relative">
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-zinc-900">Folder Summaries</h3>
                  <p className="mt-2 text-zinc-500 leading-relaxed">
                    Group 5–10 channels by topic — <span className="font-medium text-zinc-700">&quot;Java Dev&quot;</span>, <span className="font-medium text-zinc-700">&quot;Crypto&quot;</span>, <span className="font-medium text-zinc-700">&quot;AI News&quot;</span> — into a single stream. Quint delivers one unified daily report for the entire theme.
                  </p>
                  {/* Mini visual */}
                  <div className="mt-6 space-y-2">
                    {["@java_news", "@spring_tips", "@backend_daily"].map((ch) => (
                      <div key={ch} className="flex items-center gap-2 rounded-lg border border-zinc-100 bg-zinc-50 px-3 py-2 text-sm text-zinc-600">
                        <span className="h-2 w-2 rounded-full bg-violet-400" />
                        {ch}
                      </div>
                    ))}
                    <div className="flex items-center justify-center py-1 text-zinc-300">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" /></svg>
                    </div>
                    <div className="rounded-lg border border-violet-200 bg-violet-50 px-3 py-2 text-sm font-medium text-violet-700 text-center">
                      📋 Unified &quot;Java Dev&quot; digest
                    </div>
                  </div>
                </div>
              </div>

              {/* Card — Duplicate Elimination */}
              <div className="group relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm transition-all hover:shadow-lg hover:border-zinc-300">
                <div className="absolute -left-10 -bottom-10 h-40 w-40 rounded-full bg-amber-100/60 blur-3xl transition-all group-hover:bg-amber-200/80" />
                <div className="relative">
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-zinc-900">Duplicate Elimination</h3>
                  <p className="mt-2 text-zinc-500 leading-relaxed">
                    When 20 news channels post about the same event, AI in Quint collapses everything into <span className="font-medium text-zinc-700">one concise paragraph</span>, saving you hours of scrolling.
                  </p>
                  {/* Mini visual */}
                  <div className="mt-6 space-y-2">
                    <div className="flex flex-wrap gap-1.5">
                      {Array.from({ length: 8 }).map((_, i) => (
                        <span key={i} className="rounded-md border border-zinc-200 bg-zinc-50 px-2 py-1 text-xs text-zinc-400 line-through">
                          duplicate #{i + 1}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center justify-center py-1 text-zinc-300">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" /></svg>
                    </div>
                    <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-700 text-center">
                      ✨ 1 clean paragraph
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ── Feature 2: Export as Knowledge Base ── */}
          <section>
            <div className="mb-10 text-center">
              <span className="mb-3 inline-block rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-sky-500">
                Knowledge Base
              </span>
              <h2 className="text-3xl font-semibold text-zinc-900 sm:text-4xl">
                Export &amp; Preserve
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-lg text-zinc-500">
                In Telegram, information dies in a day. In Quint, it becomes a lasting asset.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Card — Notion Sync */}
              <div className="group relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm transition-all hover:shadow-lg hover:border-zinc-300">
                <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-sky-100/60 blur-3xl transition-all group-hover:bg-sky-200/80" />
                <div className="relative">
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-sky-100 text-sky-600">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-zinc-900">Notion Sync</h3>
                  <p className="mt-2 text-zinc-500 leading-relaxed">
                    Automatically push every summary to your Notion database. Each post becomes <span className="font-medium text-zinc-700">a row with tags, date, and key takeaway</span> — searchable forever.
                  </p>
                  {/* Mini table visual */}
                  <div className="mt-6 overflow-hidden rounded-lg border border-zinc-200">
                    <div className="grid grid-cols-3 gap-px bg-zinc-200 text-xs font-semibold text-zinc-500">
                      <div className="bg-zinc-50 px-3 py-2">Date</div>
                      <div className="bg-zinc-50 px-3 py-2">Tag</div>
                      <div className="bg-zinc-50 px-3 py-2">Summary</div>
                    </div>
                    {[
                      { date: "Feb 10", tag: "AI", summary: "GPT-5 launch rumours…" },
                      { date: "Feb 9", tag: "Crypto", summary: "BTC crosses 110k…" },
                      { date: "Feb 8", tag: "Dev", summary: "Next.js 16 released…" },
                    ].map((row, i) => (
                      <div key={i} className="grid grid-cols-3 gap-px bg-zinc-200 text-xs text-zinc-600">
                        <div className="bg-white px-3 py-2">{row.date}</div>
                        <div className="bg-white px-3 py-2">
                          <span className="rounded-full bg-sky-50 px-1.5 py-0.5 text-sky-600 font-medium">{row.tag}</span>
                        </div>
                        <div className="bg-white px-3 py-2 truncate">{row.summary}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card — PDF / Word Export */}
              <div className="group relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm transition-all hover:shadow-lg hover:border-zinc-300">
                <div className="absolute -left-10 -bottom-10 h-40 w-40 rounded-full bg-emerald-100/60 blur-3xl transition-all group-hover:bg-emerald-200/80" />
                <div className="relative">
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-zinc-900">Archive PDF / Word</h3>
                  <p className="mt-2 text-zinc-500 leading-relaxed">
                    Export your weekly or monthly digest as a <span className="font-medium text-zinc-700">polished PDF or Word file</span> with a clickable table of contents — a ready-made report for work or study.
                  </p>
                  {/* Mini doc visual */}
                  <div className="mt-6 rounded-lg border border-zinc-200 bg-white p-4 space-y-3">
                    <div className="flex items-center gap-2 text-sm font-semibold text-zinc-700">
                      <svg className="h-4 w-4 text-emerald-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                      Weekly Report — Feb 3–10
                    </div>
                    <div className="space-y-1 pl-6 text-xs text-zinc-400">
                      <p className="hover:text-zinc-600 cursor-pointer transition-colors">1. AI &amp; Machine Learning …………… 2</p>
                      <p className="hover:text-zinc-600 cursor-pointer transition-colors">2. Crypto Markets …………………… 5</p>
                      <p className="hover:text-zinc-600 cursor-pointer transition-colors">3. Dev Tools &amp; Releases ……………… 8</p>
                    </div>
                    <div className="flex gap-2 pt-1">
                      <span className="rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-600 border border-emerald-200">.pdf</span>
                      <span className="rounded-md bg-sky-50 px-2 py-1 text-xs font-medium text-sky-600 border border-sky-200">.docx</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-20 border-t border-zinc-100 bg-white px-6 py-4">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
            <p className="text-lg text-zinc-400">
              © 2026 quint
            </p>
            
            <div className="flex items-center gap-6">
              <a
                href="https://github.com/vlat247/quuint"
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-400 transition-colors hover:text-zinc-900"
                aria-label="GitHub"
              >
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </a>

              <a
                href="https://www.instagram.com/vlat247/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-400 transition-colors hover:text-zinc-900"
                aria-label="Instagram"
              >
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                </svg>
              </a>

              <a
                href="https://x.com/vlat247"
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-400 transition-colors hover:text-zinc-900"
                aria-label="X"
              >
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Wrap in Suspense for useSearchParams (required for static export)
export default function DemoPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <DemoPageContent />
    </Suspense>
  );
}

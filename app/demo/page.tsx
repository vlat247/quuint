"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { AuroraBackground } from "@/components/AuroraBackground";

export default function DemoPage() {
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

  const handleAnalyze = (e: React.FormEvent) => {
    e.preventDefault();
    if (!channel) return;
    
    setLoading(true);
    // Simulate analysis delay
    setTimeout(() => {
      setLoading(false);
      setAnalyzed(true);
    }, 1500);
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

      <main className="relative z-10 mx-auto w-full max-w-4xl flex-1 px-6 pt-32 pb-24">
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
                        This channel focuses on <span className="font-medium bg-yellow-100 px-1 rounded">technological trends</span> and their impact on global markets. 
                        Most discussions revolve around AI adoption, crypto regulation, and SaaS scaling strategies.
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 mb-2">Key Takeaways</h3>
                      <ul className="space-y-3 text-lg text-zinc-700">
                        <li className="flex items-start gap-2">
                          <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-zinc-400 shrink-0"></span>
                          <span>AI agents are becoming the new standard for B2B tools.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-zinc-400 shrink-0"></span>
                          <span>Bitcoin's recent volatility is linked to ETF inflows.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-zinc-400 shrink-0"></span>
                          <span>Founder mental health is trending as a major topic.</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                )}

                {activeTab === "topics" && (
                  <div className="animate-in fade-in duration-300">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 mb-4">Trending Topics</h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="p-4 rounded-xl bg-white border border-zinc-200 shadow-sm hover:border-zinc-300 transition-colors cursor-default">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-medium text-zinc-900">Artificial Intelligence</span>
                          <span className="text-xs font-bold bg-zinc-100 text-zinc-500 px-2 py-1 rounded-full">32 posts</span>
                        </div>
                        <p className="text-sm text-zinc-500">LLMs, Agents, Automation, Ethics</p>
                      </div>
                      <div className="p-4 rounded-xl bg-white border border-zinc-200 shadow-sm hover:border-zinc-300 transition-colors cursor-default">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-medium text-zinc-900">Crypto Markets</span>
                          <span className="text-xs font-bold bg-zinc-100 text-zinc-500 px-2 py-1 rounded-full">18 posts</span>
                        </div>
                        <p className="text-sm text-zinc-500">BTC, ETH, Regulation, ETFs</p>
                      </div>
                      <div className="p-4 rounded-xl bg-white border border-zinc-200 shadow-sm hover:border-zinc-300 transition-colors cursor-default">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-medium text-zinc-900">SaaS Growth</span>
                          <span className="text-xs font-bold bg-zinc-100 text-zinc-500 px-2 py-1 rounded-full">12 posts</span>
                        </div>
                        <p className="text-sm text-zinc-500">PLG, Pricing, Churn, ARR</p>
                      </div>
                      <div className="p-4 rounded-xl bg-white border border-zinc-200 shadow-sm hover:border-zinc-300 transition-colors cursor-default">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-medium text-zinc-900">Venture Capital</span>
                          <span className="text-xs font-bold bg-zinc-100 text-zinc-500 px-2 py-1 rounded-full">8 posts</span>
                        </div>
                        <p className="text-sm text-zinc-500">Funding, Valuations, Exits</p>
                      </div>
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
                          "What is the sentiment around Bitcoin?"
                        </div>
                        <div className="p-3 rounded-lg bg-white border border-zinc-200 text-zinc-600 hover:border-zinc-400 hover:text-zinc-900 cursor-pointer transition-all">
                          "Summarize the recent updates on AI agents."
                        </div>
                        <div className="p-3 rounded-lg bg-white border border-zinc-200 text-zinc-600 hover:border-zinc-400 hover:text-zinc-900 cursor-pointer transition-all">
                          "Are there any mentions of Y Combinator?"
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

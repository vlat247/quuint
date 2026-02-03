"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { AuroraBackground } from "@/components/AuroraBackground";
import { BuiltForScroller } from "@/components/BuiltForScroller";

export default function Home() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });
  const [activeTab, setActiveTab] = useState<"summary" | "topics" | "search">("summary");

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
    }
  };

  const scrollToEarlyAccess = () => {
    const element = document.getElementById("early-access");
    element?.scrollIntoView({ behavior: "auto" });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Aurora Background */}
      <AuroraBackground />

      {/* Header */}
      <Header />

      {/* Top darkening overlay */}
      <div 
        className="pointer-events-none fixed inset-x-0 top-0 z-[65] h-32"
        style={{
          background: "linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.08) 40%, transparent 100%)",
        }}
        aria-hidden="true"
      />

      {/* Subtle Grid Overlay */}
      <div className="pointer-events-none fixed inset-0 z-0">
        {/* Base grid - always visible */}
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
        {/* Darker grid - only visible near cursor */}
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

      {/* Animated Content */}
      <div className="animate-page-fade-in">
        {/* Hero Section - Two Column */}
        <section className="flex min-h-screen items-center px-6 py-24">
          <div className="mx-auto grid w-full max-w-7xl gap-12 lg:grid-cols-2 lg:gap-16">
            
            {/* Left Column */}
            <div className="flex flex-col justify-center">
              {/* Logo with soft gray glow */}
              <div className="relative inline-block">
                <div 
                  className="absolute inset-0 blur-3xl"
                  style={{
                    background: "radial-gradient(ellipse 100% 100% at 50% 50%, rgba(120,120,120,0.25) 0%, transparent 70%)",
                    transform: "scale(1.5)",
                  }}
                  aria-hidden="true"
                />
                <h1
                  className="relative text-7xl text-zinc-900 sm:text-8xl lg:text-9xl"
                  style={{ fontFamily: "'UnifrakturCook', system-ui", fontWeight: 700 }}
                >
                  quint
                </h1>
              </div>
              
              <p className="mt-6 max-w-lg text-2xl text-zinc-700 sm:text-3xl">
                Turn Telegram chaos into clear, structured knowledge.
              </p>
              
              <button
                onClick={scrollToEarlyAccess}
                className="mt-8 w-fit rounded-lg bg-zinc-900 px-8 py-4 text-lg font-medium text-white transition-colors hover:bg-zinc-800"
              >
                Get early access
              </button>
            </div>

            {/* Right Column - Product Preview Card */}
            <div className="relative z-20 flex items-center justify-center lg:justify-end">
              <div className="w-full max-w-3xl scale-110 origin-center rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl">
                {/* Channel Input */}
                <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-5 py-4">
                  <span className="text-lg text-zinc-500">@koval_channel</span>
                </div>

                {/* Tabs */}
                <div className="mt-3 flex gap-0.5 rounded-lg bg-zinc-100 p-1">
                  <button
                    onClick={() => setActiveTab("summary")}
                    className={`flex-1 rounded-md px-3 py-2 text-lg font-medium transition-colors ${
                      activeTab === "summary" 
                        ? "bg-white text-zinc-900 shadow-sm" 
                        : "text-zinc-600 hover:text-zinc-900"
                    }`}
                  >
                    Core Summary
                  </button>
                  <button
                    onClick={() => setActiveTab("topics")}
                    className={`flex-1 rounded-md px-3 py-2 text-lg font-medium transition-colors ${
                      activeTab === "topics" 
                        ? "bg-white text-zinc-900 shadow-sm" 
                        : "text-zinc-600 hover:text-zinc-900"
                    }`}
                  >
                    Topics
                  </button>
                  <button
                    onClick={() => setActiveTab("search")}
                    className={`flex-1 rounded-md px-3 py-2 text-lg font-medium transition-colors ${
                      activeTab === "search" 
                        ? "bg-white text-zinc-900 shadow-sm" 
                        : "text-zinc-600 hover:text-zinc-900"
                    }`}
                  >
                    Semantic Search
                  </button>
                </div>

                {/* Tab Content */}
                <div className="mt-5 min-h-[180px] rounded-lg border border-zinc-200 bg-zinc-50 p-5">
                  {activeTab === "summary" && (
                    <p className="text-base leading-relaxed text-zinc-700">
                      This channel focuses on startup growth strategies, with emphasis on product-led growth and community building. Key themes include bootstrapping, B2B SaaS metrics, and founder mental health.
                    </p>
                  )}
                  {activeTab === "topics" && (
                    <div className="space-y-3">
                      <p className="text-base text-zinc-600">Identified topics from last 30 days:</p>
                      <ul className="space-y-2 text-base text-zinc-700">
                        <li>• Product-market fit signals (12 posts)</li>
                        <li>• Pricing psychology (8 posts)</li>
                        <li>• Founder burnout (6 posts)</li>
                        <li>• Community growth (5 posts)</li>
                      </ul>
                    </div>
                  )}
                  {activeTab === "search" && (
                    <div className="space-y-3">
                      <p className="text-base text-zinc-600">Ask anything about this channel...</p>
                      <div className="rounded border border-zinc-300 bg-white px-4 py-3 text-base text-zinc-400">
                        "What does the author think about pricing?"
                      </div>
                    </div>
                  )}
                </div>

                {/* Topic Tags */}
                <div className="mt-5 flex flex-wrap gap-3">
                  <span className="rounded-full bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-600">
                    Marketing
                  </span>
                  <span className="rounded-full bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-600">
                    Mindset
                  </span>
                  <span className="rounded-full bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-600">
                    Investing
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

      {/* Problem Section */}
      <section className="bg-zinc-50 px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-7xl font-semibold text-zinc-900">The problem</h2>
          <ul className="mt-8 space-y-4 text-3xl text-zinc-700">
            <li>Too many Telegram channels to follow</li>
            <li>Endless noise drowns out the signal</li>
            <li>Important ideas get lost in the scroll</li>
            <li>No structure, no search by meaning</li>
          </ul>
        </div>
      </section>

      {/* Solution Section */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-7xl text-right">
          <h2 className="text-7xl font-semibold text-zinc-900">The solution</h2>
          <div className="mt-8 space-y-6 text-3xl text-zinc-700">
            <p>
              <span className="font-medium text-zinc-900">quint</span> reads your Telegram channels and extracts what matters.
            </p>
            <p>
              Get AI-generated summaries, relevance and importance scoring, and semantic understanding of content across all your subscriptions.
            </p>
            <p>
              Build a personal knowledge base from the Telegram channels you care about.
            </p>
          </div>
        </div>
      </section>

      {/* Before / After Section */}
      <section className="bg-zinc-50 px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-12 text-center text-5xl font-semibold text-zinc-900">Before & After</h2>
          
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Before - Telegram Chaos */}
            <div className="rounded-2xl bg-white p-8">
              <h3 className="mb-6 text-3xl font-semibold text-zinc-900">Before: Telegram chaos</h3>
              <div className="space-y-4 text-lg text-zinc-600">
                <div className="p-3">
                  <span className="font-medium">@crypto_news</span> — 🚀 BTC breaking out! Don't miss this...
                </div>
                <div className="p-3">
                  <span className="font-medium">@startup_tips</span> — Thread on pricing psychology 1/12...
                </div>
                <div className="p-3">
                  <span className="font-medium">@marketing_hacks</span> — 10 things about retention...
                </div>
                <div className="p-3">
                  <span className="font-medium">@dev_news</span> — New React update dropped...
                </div>
                <div className="p-3">
                  <span className="font-medium">@finance_daily</span> — Markets are crashing...
                </div>
                <div className="p-3 opacity-50">
                  <span className="font-medium">+47 more unread messages...</span>
                </div>
              </div>
              <p className="mt-6 text-center text-xl text-zinc-400">Endless scroll. No structure. Lost ideas.</p>
            </div>

            {/* After - Clean Summary */}
            <div className="rounded-2xl bg-white p-8">
              <h3 className="mb-6 text-3xl font-semibold text-zinc-900">After: Clear knowledge</h3>
              <div className="space-y-6">
                <div>
                  <p className="text-lg font-medium text-zinc-500">Core Summary</p>
                  <p className="mt-2 text-xl text-zinc-700">Startup growth strategies with focus on product-led growth. Key insight: pricing psychology drives 40% of conversion.</p>
                </div>
                <div>
                  <p className="text-lg font-medium text-zinc-500">Top Topics</p>
                  <div className="mt-3 flex flex-wrap gap-3">
                    <span className="px-4 py-2 text-lg text-zinc-600">Pricing (12)</span>
                    <span className="px-4 py-2 text-lg text-zinc-600">Retention (8)</span>
                    <span className="px-4 py-2 text-lg text-zinc-600">Growth (6)</span>
                  </div>
                </div>
                <div>
                  <p className="text-lg font-medium text-zinc-500">Q&A</p>
                  <div className="mt-2 p-3 text-lg text-zinc-600">
                    "What's the best pricing strategy?" → Freemium with 14-day trial...
                  </div>
                </div>
              </div>
              <p className="mt-6 text-center text-xl text-zinc-700">Structured. Searchable. Actionable.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-7xl font-semibold text-zinc-900">How it works</h2>
          <div className="mt-12 space-y-3">
            <div>
              <p className="text-xl font-medium text-zinc-500">Step 1</p>
              <p className="mt-1 text-3xl text-zinc-900">Add a Telegram channel</p>
            </div>
            <div>
              <p className="text-xl font-medium text-zinc-500">Step 2</p>
              <p className="mt-1 text-3xl text-zinc-900">AI analyzes the content</p>
            </div>
            <div>
              <p className="text-xl font-medium text-zinc-500">Step 3</p>
              <p className="mt-1 text-3xl text-zinc-900">Get structured insights</p>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases Section - Scrolling */}
      <BuiltForScroller />

      {/* Early Access Section */}
      <section id="early-access" className="px-6 py-24">
        <div className="mx-auto max-w-md text-center">
          <h2 className="text-4xl font-semibold text-zinc-900">Get early access</h2>
          <p className="mt-4 text-xl text-zinc-500">Limited spots available.</p>
          {submitted ? (
            <p className="mt-8 text-2xl text-zinc-900">Thanks! We&apos;ll be in touch.</p>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                required
                className="w-full rounded-lg border border-zinc-300 bg-white px-5 py-4 text-xl text-zinc-900 placeholder-zinc-400 focus:border-zinc-900 focus:outline-none"
              />
              <button
                type="submit"
                className="mt-4 w-full rounded-lg bg-zinc-900 px-10 py-5 text-xl font-medium text-white"
              >
                Join the waitlist
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-100 px-6 py-8">
        <p className="text-center text-lg text-zinc-400">
          © 2026 quint
        </p>
      </footer>
      </div>
    </div>
  );
}

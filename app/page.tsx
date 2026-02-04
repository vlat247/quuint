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
                className="mt-8 w-fit cursor-pointer rounded-lg bg-zinc-900 px-8 py-4 text-lg font-medium text-white transition-all hover:bg-zinc-800 hover:scale-105"
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
                    className={`flex-1 cursor-pointer rounded-md px-3 py-2 text-lg font-medium transition-all ${
                      activeTab === "summary" 
                        ? "bg-white text-zinc-900 shadow-sm" 
                        : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50"
                    }`}
                  >
                    Core Summary
                  </button>
                  <button
                    onClick={() => setActiveTab("topics")}
                    className={`flex-1 cursor-pointer rounded-md px-3 py-2 text-lg font-medium transition-all ${
                      activeTab === "topics" 
                        ? "bg-white text-zinc-900 shadow-sm" 
                        : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50"
                    }`}
                  >
                    Topics
                  </button>
                  <button
                    onClick={() => setActiveTab("search")}
                    className={`flex-1 cursor-pointer rounded-md px-3 py-2 text-lg font-medium transition-all ${
                      activeTab === "search" 
                        ? "bg-white text-zinc-900 shadow-sm" 
                        : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50"
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
                    #Marketing
                  </span>
                  <span className="rounded-full bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-600">
                    #Mindset
                  </span>
                  <span className="rounded-full bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-600">
                    #Investing
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

      {/* Problem Section */}
      <section className="sticky top-0 z-10 flex min-h-screen flex-col justify-center bg-zinc-50 px-6 py-24">
        <div className="mx-auto w-full max-w-7xl">
          {/* Section Number - Right side (opposite of left-aligned text) */}
          <div className="absolute right-18 top-24 select-none text-[20rem] font-bold leading-none text-zinc-200 opacity-40 transition-all duration-500 ease-out hover:-translate-x-1 hover:opacity-60 motion-reduce:transition-none motion-reduce:hover:translate-x-0">
            01
          </div>
          
          <div className="relative">
            <h2 className="animate-fade-in-left text-7xl font-semibold text-zinc-900">The problem</h2>
            <ul className="mt-8 space-y-4 text-3xl text-zinc-700">
              <li className="animate-fade-in-left" style={{ animationDelay: "0.1s" }}>• Too many channels</li>
              <li className="animate-fade-in-left" style={{ animationDelay: "0.2s" }}>• Too much noise</li>
              <li className="animate-fade-in-left" style={{ animationDelay: "0.3s" }}>• Lost ideas</li>
              <li className="animate-fade-in-left" style={{ animationDelay: "0.4s" }}>• No structure</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="sticky top-0 z-20 flex min-h-screen flex-col justify-center bg-white px-6 py-24">
        <div className="mx-auto w-full max-w-7xl text-right">
          {/* Section Number - Left side (opposite of right-aligned text) */}
          <div className="absolute left-18 top-24 select-none text-[20rem] font-bold leading-none text-zinc-200 opacity-40 transition-all duration-500 ease-out hover:translate-x-1 hover:opacity-60 motion-reduce:transition-none motion-reduce:hover:translate-x-0">
            02
          </div>
          
          <div className="relative">
            <h2 className="animate-fade-in-right text-7xl font-semibold text-zinc-900">The solution</h2>
            <ul className="mt-8 space-y-4 text-3xl text-zinc-700">
              <li className="animate-fade-in-right" style={{ animationDelay: "0.1s" }}>• Structured summaries</li>
              <li className="animate-fade-in-right" style={{ animationDelay: "0.2s" }}>• Topic grouping</li>
              <li className="animate-fade-in-right" style={{ animationDelay: "0.3s" }}>• Search by meaning</li>
              <li className="animate-fade-in-right" style={{ animationDelay: "0.4s" }}>• One system</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Before / After Section */}
      <section className="sticky top-0 z-30 flex min-h-screen flex-col justify-center bg-zinc-50 px-6 py-16">
        <div className="mx-auto w-full max-w-7xl">
          <h2 className="mb-16 text-5xl font-semibold text-zinc-900">Before & After</h2>
          
          <div className="grid gap-10 lg:grid-cols-2">
            {/* Before - Raw Feed */}
            <div>
              <h3 className="mb-8 text-xl font-medium uppercase tracking-wide text-zinc-500">Before</h3>
              
              {/* Feed items - minimal styling */}
              <div className="space-y-0 border-l border-zinc-300 pl-6">
                <div className="py-2 text-2xl text-zinc-600">
                  <div className="font-medium text-zinc-900">@crypto_news</div>
                  <div className="mt-1">🚀 BTC breaking out! Don't miss this...</div>
                </div>
                
                <div className="border-t border-zinc-200 py-2 text-2xl text-zinc-600">
                  <div className="font-medium text-zinc-900">@startup_tips</div>
                  <div className="mt-1">Thread on pricing psychology 1/12...</div>
                </div>
                
                <div className="border-t border-zinc-200 py-2 text-2xl text-zinc-600">
                  <div className="font-medium text-zinc-900">@marketing_hacks</div>
                  <div className="mt-1">10 things about retention...</div>
                </div>
                
                <div className="border-t border-zinc-200 py-2 text-2xl text-zinc-600">
                  <div className="font-medium text-zinc-900">@dev_news</div>
                  <div className="mt-1">New React update dropped...</div>
                </div>
                
                <div className="border-t border-zinc-200 py-2 text-2xl text-zinc-600">
                  <div className="font-medium text-zinc-900">@finance_daily</div>
                  <div className="mt-1">Markets are crashing...</div>
                </div>
                
                <div className="border-t border-zinc-200 py-2 text-lg text-zinc-400">
                  +47 more messages
                </div>
              </div>
            </div>

            {/* After - Structured View */}
            <div>
              <h3 className="mb-6
               text-xl font-medium uppercase tracking-wide text-zinc-500">After</h3>
              
              <div className="space-y-8">
                {/* Summary */}
                <div>
                  <div className="mb-2 text-sm font-medium uppercase tracking-wider text-zinc-400">Summary</div>
                  <p className="text-3xl leading-relaxed text-zinc-900">
                    Startup growth strategies with focus on product-led growth. Pricing psychology drives 40% of conversion.
                  </p>
                </div>
                
                {/* Divider */}
                <div className="border-t border-zinc-200"></div>
                
                {/* Topics */}
                <div>
                  <div className="mb-2 text-sm font-medium uppercase tracking-wider text-zinc-400">Topics</div>
                  <div className="space-y-2 text-2xl text-zinc-700">
                    <div>Pricing <span className="text-zinc-400">(12)</span></div>
                    <div>Retention <span className="text-zinc-400">(8)</span></div>
                    <div>Growth <span className="text-zinc-400">(6)</span></div>
                  </div>
                </div>
                
                {/* Divider */}
                <div className="border-t border-zinc-200"></div>
                
                {/* Search */}
                <div>
                  <div className="mb-2 text-sm font-medium uppercase tracking-wider text-zinc-400">Search</div>
                  <div className="text-2xl text-zinc-600">
                    <div className="mb-1 text-zinc-900">"What's the best pricing strategy?"</div>
                    <div>Freemium with 14-day trial</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mode B: Normal Document Flow Sections */}
      <div className="relative z-40 bg-white">
        {/* How It Works Section */}
        <section className="px-6 py-24">
          <div className="mx-auto max-w-7xl">
            {/* Section Number - Right side (opposite of left-aligned text) */}
            <div className="absolute right-18 top-24 select-none text-[20rem] font-bold leading-none text-zinc-200 opacity-40 transition-all duration-500 ease-out hover:-translate-x-1 hover:opacity-60 motion-reduce:transition-none motion-reduce:hover:translate-x-0">
              03
            </div>
            
            <div className="relative">
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
                  className="mt-4 w-full cursor-pointer rounded-lg bg-zinc-900 px-10 py-5 text-xl font-medium text-white transition-all hover:bg-zinc-800 hover:scale-[1.02]"
                >
                  Join the waitlist
                </button>
              </form>
            )}
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-zinc-100 bg-white px-6 py-4">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
              <p className="text-lg text-zinc-400">
                © 2026 quint
              </p>
              
              {/* Social Media Icons */}
              <div className="flex items-center gap-6">
                {/* GitHub */}
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

                {/* Instagram */}
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

                {/* X (Twitter) */}
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
      </div>
    </div>
  );
}

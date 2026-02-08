"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { AuroraBackground } from "@/components/AuroraBackground";
import { BuiltForScroller } from "@/components/BuiltForScroller";
import { submitEmail } from "./actions";
import { X } from "lucide-react";

export default function Home() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });
  const [activeTab, setActiveTab] = useState<"summary" | "topics" | "search">("summary");

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email && !loading) {
      setLoading(true);
      const result = await submitEmail(email);
      setLoading(false);
      
      if (result.success) {
        setSubmitted(true);
      } else {
        alert(result.error || "Something went wrong. Please try again.");
      }
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
                  className="relative text-8xl tracking-tight text-zinc-900 sm:text-10xl lg:text-[10rem] leading-none"
                  style={{ fontFamily: "'UnifrakturCook', system-ui", fontWeight: 700 }}
                >
                  quint
                </h1>
              </div>
              
              <p className="mt-8 max-w-lg text-2xl font-medium leading-relaxed text-zinc-600 sm:text-3xl">
                Turn Telegram chaos into clear, <span className="text-zinc-900 font-semibold decoration-zinc-300 underline underline-offset-4">structured knowledge</span>.
              </p>
              
              <button
                onClick={scrollToEarlyAccess}
                className="group relative mt-10 w-fit cursor-pointer overflow-hidden rounded-full bg-zinc-900 px-10 py-5 text-xl font-medium text-white shadow-xl transition-all hover:bg-zinc-800 hover:scale-[1.02] active:scale-[0.98]"
              >
                <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent z-10" />
                <span className="relative z-20">Get early access</span>
              </button>

              {/* Stats removed */}
            </div>

            {/* Right Column - Product Preview Card */}
            <div className="relative z-20 flex items-center justify-center lg:justify-end">
              <div className="absolute inset-0 bg-gradient-to-tr from-zinc-200/50 to-transparent blur-3xl -z-10 rounded-full opacity-50" />
              <div className="w-full max-w-3xl scale-110 origin-center rounded-2xl border border-white/40 bg-white/80 p-6 shadow-2xl backdrop-blur-xl ring-1 ring-black/5">
                {/* Channel Input */}
                <div className="rounded-xl border border-zinc-200 bg-white shadow-sm px-5 py-4 flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" /></svg>
                  </div>
                  <span className="text-lg font-medium text-zinc-700">@koval_channel</span>
                </div>

                {/* Tabs */}
                <div className="mt-4 flex gap-1 rounded-xl bg-zinc-100 p-1.5">
                  <button
                    onClick={() => setActiveTab("summary")}
                    className={`flex-1 cursor-pointer rounded-lg px-3 py-2.5 text-base font-medium transition-all ${
                      activeTab === "summary" 
                        ? "bg-white text-zinc-900 shadow-sm ring-1 ring-black/5" 
                        : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200/50"
                    }`}
                  >
                    Summary
                  </button>
                  <button
                    onClick={() => setActiveTab("topics")}
                    className={`flex-1 cursor-pointer rounded-lg px-3 py-2.5 text-base font-medium transition-all ${
                      activeTab === "topics" 
                         ? "bg-white text-zinc-900 shadow-sm ring-1 ring-black/5" 
                        : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200/50"
                    }`}
                  >
                    Topics
                  </button>
                  <button
                    onClick={() => setActiveTab("search")}
                    className={`flex-1 cursor-pointer rounded-lg px-3 py-2.5 text-base font-medium transition-all ${
                      activeTab === "search" 
                         ? "bg-white text-zinc-900 shadow-sm ring-1 ring-black/5" 
                        : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200/50"
                    }`}
                  >
                    Search
                  </button>
                </div>

                {/* Tab Content */}
                <div className="mt-4 min-h-[220px] rounded-xl border border-zinc-100 bg-white p-6 shadow-sm">
                  {activeTab === "summary" && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <p className="text-lg leading-relaxed text-zinc-600">
                        This channel focuses on <span className="font-medium text-zinc-900 bg-yellow-50 px-1 rounded">startup growth</span> strategies, emphasizing product-led growth. Key themes include bootstrapping, B2B SaaS metrics, and founder mental health.
                      </p>
                    </div>
                  )}
                  {activeTab === "topics" && (
                    <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <p className="text-sm font-medium text-zinc-400 uppercase tracking-wider">Identified patterns</p>
                      <ul className="space-y-3">
                        <li className="flex items-center justify-between p-2 rounded-lg hover:bg-zinc-50 transition-colors cursor-default">
                            <span className="text-zinc-700 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                                Product-market fit
                            </span>
                            <span className="text-xs font-bold bg-zinc-100 text-zinc-500 px-2 py-1 rounded-full">12 posts</span>
                        </li>
                        <li className="flex items-center justify-between p-2 rounded-lg hover:bg-zinc-50 transition-colors cursor-default">
                             <span className="text-zinc-700 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                Pricing psychology
                            </span>
                            <span className="text-xs font-bold bg-zinc-100 text-zinc-500 px-2 py-1 rounded-full">8 posts</span>
                        </li>
                         <li className="flex items-center justify-between p-2 rounded-lg hover:bg-zinc-50 transition-colors cursor-default">
                             <span className="text-zinc-700 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                                Founder burnout
                            </span>
                            <span className="text-xs font-bold bg-zinc-100 text-zinc-500 px-2 py-1 rounded-full">6 posts</span>
                        </li>
                      </ul>
                    </div>
                  )}
                  {activeTab === "search" && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                       <div className="relative">
                        <input type="text" disabled placeholder="Ask about pricing..." className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-4 py-3 text-zinc-900 placeholder-zinc-400 focus:outline-none cursor-not-allowed"/>
                        <div className="absolute right-3 top-3 text-zinc-400">
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        </div>
                       </div>
                       <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-100">
                           <p className="text-zinc-700 text-sm">
                               <span className="font-semibold text-blue-600 block mb-1">Answer from context:</span>
                               The author suggests a <span className="font-medium text-zinc-900">freemium model</span> with a 14-day trial for B2B SaaS, citing higher conversion rates.
                           </p>
                       </div>
                    </div>
                  )}
                </div>

                {/* Topic Tags */}
                <div className="mt-5 flex flex-wrap gap-2">
                  {["Marketing", "Mindset", "Investing"].map((tag) => (
                    <span key={tag} className="rounded-full bg-zinc-100 border border-zinc-200 px-3 py-1 text-xs font-medium text-zinc-600 hover:bg-zinc-200 transition-colors cursor-default">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

      {/* Problem Section */}
      <section className="sticky top-0 z-10 flex min-h-screen flex-col justify-center bg-zinc-50 px-6 py-24">
        <div className="mx-auto w-full max-w-7xl">
          <div className="flex items-end justify-between mb-16">
             <h2 className="text-6xl font-semibold tracking-tight text-zinc-900 lg:text-8xl">The problem</h2>
             <div className="hidden lg:block select-none text-[15rem] font-bold leading-none text-zinc-200/50">01</div>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
             {[
                { title: "Too many channels", desc: "Drowning in unread badges.", icon: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" },
                { title: "Too much noise", desc: "99% of messages are fluff.", icon: "M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" },
                { title: "Lost ideas", desc: "Good insights buried instantly.", icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" },
                { title: "No structure", desc: "Just a never-ending stream.", icon: "M4 6h16M4 12h16M4 18h7" }
             ].map((item, i) => (
                <div key={i} className="group relative overflow-hidden rounded-2xl bg-white p-8 transition-all hover:-translate-y-1 border border-zinc-100">
                   <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-100 text-zinc-900 group-hover:bg-zinc-900 group-hover:text-white transition-colors">
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} /></svg>
                   </div>
                   <h3 className="mb-2 text-xl font-semibold text-zinc-900">{item.title}</h3>
                   <p className="text-zinc-500">{item.desc}</p>
                </div>
             ))}
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="sticky top-0 z-20 flex min-h-screen flex-col justify-center bg-white px-6 py-16 shadow-[0_-20px_40px_-15px_rgba(0,0,0,0.1)]">
         <div className="mx-auto w-full max-w-7xl">
          <div className="flex items-end flex-row-reverse justify-between mb-12">
             <h2 className="text-6xl font-semibold tracking-tight text-zinc-900 lg:text-8xl">The solution</h2>
              <div className="hidden lg:block select-none text-[12rem] font-bold leading-none text-zinc-100">02</div>
          </div>
          
           <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
             {[
                { title: "Structured summaries", desc: "We extract the core value.", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
                { title: "Topic grouping", desc: "See what's trending over time.", icon: "M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" },
                { title: "Semantic search", desc: "Find answers, not just keywords.", icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" },
                { title: "One system", desc: "All your knowledge in one place.", icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" }
             ].map((item, i) => (
                <div key={i} className="flex items-start gap-4 rounded-2xl bg-zinc-50 p-6 transition-colors hover:bg-zinc-100 border border-zinc-100/50">
                   <div className="shrink-0 rounded-xl bg-white p-3 shadow-sm border border-zinc-200 text-zinc-900">
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} /></svg>
                   </div>
                   <div>
                       <h3 className="text-lg font-semibold text-zinc-900">{item.title}</h3>
                       <p className="text-sm text-zinc-500 leading-relaxed mt-1">{item.desc}</p>
                   </div>
                </div>
             ))}
           </div>
        </div>
      </section>

      {/* Before / After Section */}
      <section className="sticky top-0 z-30 flex min-h-screen flex-col justify-center bg-zinc-50 px-6 py-16">
        <div className="mx-auto w-full max-w-7xl">
          <h2 className="mb-20 text-center text-5xl font-semibold text-zinc-900 lg:text-7xl">Before & After</h2>
          
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-24">
            {/* Before - Raw Feed */}
            <div className="relative">
              <div className="absolute -inset-4 bg-red-500/5 blur-3xl rounded-full opacity-50"></div>
              <h3 className="mb-8 text-center text-sm font-bold uppercase tracking-widest text-red-500">The Chaos</h3>
              
              <div className="relative mx-auto max-w-md overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-2xl">
                 {/* Mock Phone Header */}
                 <div className="border-b border-zinc-100 bg-zinc-50 px-5 py-4 flex items-center justify-between">
                    <div className="font-semibold text-zinc-900">Chats</div>
                    <div className="flex gap-2">
                        <div className="h-2 w-2 rounded-full bg-zinc-300"></div>
                        <div className="h-2 w-2 rounded-full bg-zinc-300"></div>
                    </div>
                 </div>
                 {/* Realistic Feed Content */}
                 <div className="space-y-0 max-h-[500px] overflow-hidden bg-white">
                     {[
                        { name: "Crypto Signals 🚀", text: "BTC hitting 100k tonight?? BUY NOW!!!", time: "10:42", unread: 145, img: 12 },
                        { name: "Family Group ❤️", text: "Mom: Who is bringing the salad?", time: "10:40", unread: 3, img: 24 },
                        { name: "Work Updates", text: "Jira #4022 has been updated by Alex...", time: "10:38", unread: 0, img: 45 },
                        { name: "Design Inspos", text: "Check out this new interaction pattern", time: "10:25", unread: 12, img: 88 },
                        { name: "Marketing DAO", text: "Vote ends in 10 mins! Don't miss out", time: "10:15", unread: 56, img: 21 },
                        { name: "John Doe", text: "Are we still on for lunch?", time: "09:55", unread: 1, img: 67 },
                        { name: "News Bot 🤖", text: "BREAKING: Tech stocks tumble as...", time: "09:30", unread: 89, img: 99 },
                     ].map((item, i) => (
                         <div key={i} className="flex gap-4 p-4 border-b border-zinc-50 hover:bg-zinc-50 transition-colors cursor-default">
                             <div className="relative shrink-0">
                                 <img 
                                    src={`https://picsum.photos/seed/${item.img}/100`} 
                                    alt={item.name}
                                    className="h-12 w-12 rounded-full object-cover"
                                 />
                                 {item.unread > 0 && (
                                     <div className="absolute -bottom-1 -right-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white border-2 border-white">
                                         {item.unread}
                                     </div>
                                 )}
                             </div>
                             <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-baseline mb-1">
                                    <h4 className="font-semibold text-zinc-900 truncate pr-2">{item.name}</h4>
                                    <span className="text-xs text-zinc-400 shrink-0">{item.time}</span>
                                </div>
                                <p className={`text-sm truncate ${item.unread > 0 ? 'text-zinc-900 font-medium' : 'text-zinc-500'}`}>
                                    {item.text}
                                </p>
                             </div>
                         </div>
                     ))}
                 </div>
                 {/* Overlay Gradient */}
                 <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
              </div>
            </div>

            {/* After - Structured View */}
            <div className="relative">
               <div className="absolute -inset-4 bg-green-500/5 blur-3xl rounded-full opacity-50"></div>
              <h3 className="mb-8 text-center text-sm font-bold uppercase tracking-widest text-green-600">The Clarity</h3>
              
              <div className="relative mx-auto max-w-md rounded-3xl border border-zinc-200 bg-white shadow-2xl overflow-hidden ring-4 ring-zinc-50">
                 <div className="bg-zinc-900 px-6 py-6 text-white">
                    <div className="text-sm opacity-60 uppercase tracking-widest mb-1">Weekly Digest</div>
                    <div className="text-2xl font-serif">Product Growth</div>
                 </div>
                 
                 <div className="p-8 space-y-8 bg-zinc-50/50">
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                             <span className="p-1.5 rounded-md bg-yellow-100 text-yellow-700"><svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg></span>
                             <span className="font-semibold text-zinc-900">Key Insight</span>
                        </div>
                        <p className="text-lg text-zinc-800 leading-relaxed font-medium">
                            Freemium models with a <span className="bg-yellow-100 px-1">14-day trial</span> are converting 40% better than pure free tiers.
                        </p>
                    </div>
                    
                    <div className="h-px bg-zinc-200 border-dashed"></div>

                    <div>
                         <div className="flex items-center gap-2 mb-3">
                             <span className="p-1.5 rounded-md bg-blue-100 text-blue-700"><svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" /></svg></span>
                             <span className="font-semibold text-zinc-900">Trending Topics</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {['Pricing', 'Retention', 'PLG'].map(t => (
                                <span key={t} className="px-3 py-1 rounded-full bg-white border border-zinc-200 text-sm text-zinc-600 shadow-sm">{t}</span>
                            ))}
                        </div>
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
            <div className="absolute right-18 top-24 select-none text-[20rem] font-bold leading-none text-zinc-200 opacity-60 transition-all duration-500 ease-out hover:-translate-x-1 hover:opacity-80 motion-reduce:transition-none motion-reduce:hover:translate-x-0">
              03
            </div>
            
            <div className="relative">
              <h2 className="text-7xl font-semibold text-zinc-900">How it works</h2>
              <div className="mt-12 space-y-3">
                <div>
                  <p className="text-xl font-medium text-zinc-500">Step 1</p>
                  <p className="mt-1 text-xl text-zinc-900">Add a Telegram channel</p>
                </div>
                <div>
                  <p className="text-xl font-medium text-zinc-500">Step 2</p>
                  <p className="mt-1 text-xl text-zinc-900">AI analyzes the content</p>
                </div>
                <div>
                  <p className="text-xl font-medium text-zinc-500">Step 3</p>
                  <p className="mt-1 text-xl text-zinc-900">Get structured insights</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Use Cases Section - Scrolling */}
        <BuiltForScroller />

        {/* Early Access Section */}
        <section id="early-access" className="px-6 py-24">
          <div className="relative mx-auto max-w-md text-center">
            <h2 className="text-4xl font-semibold text-zinc-900">Get early access</h2>
            <p className="mt-4 text-xl text-zinc-500">Limited spots available.</p>
            
            {submitted ? (
              <div className="relative mt-8 w-full scale-100 rounded-2xl border border-zinc-200 bg-white p-10 shadow-xl animate-in zoom-in-95 duration-300">
                {/* Close Cross Button */}
                <button 
                  onClick={() => setSubmitted(false)}
                  className="absolute right-4 top-4 cursor-pointer rounded-full p-2 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
                  aria-label="Close message"
                >
                  <X className="h-6 w-6" />
                </button>

                <div className="text-center">
                  <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 text-3xl">
                    ✨
                  </div>
                  <h3 className="mb-4 text-3xl font-semibold text-zinc-900">Waitlist Joined!</h3>
                  <p className="text-xl leading-relaxed text-zinc-600">
                    Thank you for interesting in our product! We will let you know soon when it is releases!
                  </p>
                  <div className="mt-8 grid gap-3">
                    <a
                      href={`/demo?email=${encodeURIComponent(email)}`}
                      className="flex w-full items-center justify-center rounded-lg bg-zinc-900 px-8 py-4 text-lg font-medium text-white transition-all hover:bg-zinc-800"
                    >
                      Try the demo
                    </a>
                    <button
                      onClick={() => setSubmitted(false)}
                      className="w-full cursor-pointer rounded-lg bg-transparent px-8 py-2 text-base font-medium text-zinc-500 transition-all hover:text-zinc-900"
                    >
                      Close and add another email
                    </button>
                  </div>
                </div>
              </div>
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
                  disabled={loading}
                  className="mt-4 w-full cursor-pointer rounded-lg bg-zinc-900 px-10 py-5 text-xl font-medium text-white transition-all hover:bg-zinc-800 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Joining..." : "Join the waitlist"}
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

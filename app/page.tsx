"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { AuroraBackground } from "@/components/AuroraBackground";

export default function Home() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });

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
      <div className="pointer-events-none fixed inset-0 z-[5]">
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
        {/* Hero Section */}
        <section className="flex min-h-screen flex-col items-center justify-center px-6 py-24">
        {/* Logo with soft gray glow */}
        <div className="relative">
          {/* Soft glow behind logo */}
          <div 
            className="absolute inset-0 blur-3xl"
            style={{
              background: "radial-gradient(ellipse 100% 100% at 50% 50%, rgba(120,120,120,0.25) 0%, transparent 70%)",
              transform: "scale(1.5)",
            }}
            aria-hidden="true"
          />
          <h1
            className="relative text-9xl text-zinc-900 sm:text-[12rem] md:text-[14rem]"
            style={{ fontFamily: "'UnifrakturCook', system-ui", fontWeight: 700 }}
          >
            quint
          </h1>
        </div>
        <p className="mt-8 max-w-xl text-center text-3xl text-zinc-900 sm:text-4xl">
          Turn Telegram chaos into clear, structured knowledge.
        </p>
  
        <button
          onClick={scrollToEarlyAccess}
          className="mt-6 rounded-lg bg-zinc-900 px-10 py-5 text-xl font-medium text-white"
        >
          Get early access
        </button>
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

      {/* How It Works Section */}
      <section className="bg-zinc-50 px-6 py-24">
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

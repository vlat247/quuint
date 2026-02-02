"use client";

import { useState } from "react";

export default function Home() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

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
      {/* Hero Section */}
      <section className="flex min-h-screen flex-col items-center justify-center px-6 py-24">
        <h1
          className="text-9xl text-zinc-900 sm:text-[12rem] md:text-[14rem]"
          style={{ fontFamily: "'UnifrakturCook', system-ui", fontWeight: 700 }}
        >
          quint
        </h1>
        <p className="mt-8 max-w-xl text-center text-3xl text-zinc-900 sm:text-4xl">
          Turn Telegram chaos into clear, structured knowledge.
        </p>
        <p className="mt-4 text-center text-xl text-zinc-500">
          AI summaries for the channels that matter.
        </p>
        <button
          onClick={scrollToEarlyAccess}
          className="mt-12 rounded-lg bg-zinc-900 px-10 py-5 text-xl font-medium text-white"
        >
          Get early access
        </button>
      </section>

      {/* Problem Section */}
      <section className="bg-zinc-50 px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-5xl font-semibold text-zinc-900">The problem</h2>
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
          <h2 className="text-5xl font-semibold text-zinc-900">The solution</h2>
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
          <h2 className="text-5xl font-semibold text-zinc-900">How it works</h2>
          <div className="mt-12 space-y-6">
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
  );
}

"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

function AuthPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialMode = searchParams.get("mode") === "login" ? "login" : "signup";

  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const modeParam = searchParams.get("mode");
    if (modeParam === "login" || modeParam === "signup") {
      setMode(modeParam);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || loading) return;

    setLoading(true);
    setError("");
    setSuccessMessage("");

    if (mode === "signup") {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { display_name: nickname },
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }

      // If session exists, user is immediately signed in (email confirmation disabled)
      if (data.session) {
        window.location.href = "/demo";
        return;
      }

      // No session — email confirmation is required
      setSuccessMessage("Check your email to confirm your account, then log in.");
      setLoading(false);
    } else {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
        setLoading(false);
        return;
      }

      window.location.href = "/demo";
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-6">
      {/* Subtle grid background */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,0,0,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.04) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="mb-12 text-center">
          <h1
            className="text-5xl tracking-tight text-zinc-900"
            style={{
              fontFamily: "'UnifrakturCook', system-ui",
              fontWeight: 700,
            }}
          >
            quint
          </h1>
        </div>

        {/* Mode toggle */}
        <div className="mb-8 flex gap-1 rounded-xl bg-zinc-100 p-1.5">
          <button
            onClick={() => {
              setMode("signup");
              setError("");
            }}
            className={`flex-1 cursor-pointer rounded-lg px-3 py-2.5 text-base font-medium transition-all ${
              mode === "signup"
                ? "bg-white text-zinc-900 shadow-sm ring-1 ring-black/5"
                : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200/50"
            }`}
          >
            Create account
          </button>
          <button
            onClick={() => {
              setMode("login");
              setError("");
            }}
            className={`flex-1 cursor-pointer rounded-lg px-3 py-2.5 text-base font-medium transition-all ${
              mode === "login"
                ? "bg-white text-zinc-900 shadow-sm ring-1 ring-black/5"
                : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200/50"
            }`}
          >
            Log in
          </button>
        </div>

        {/* Auth form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "signup" && (
            <div>
              <label
                htmlFor="nickname"
                className="block text-sm font-medium text-zinc-700 mb-1.5"
              >
                Nickname
              </label>
              <input
                id="nickname"
                type="text"
                value={nickname}
                onChange={(e) => {
                  setNickname(e.target.value);
                  setError("");
                }}
                placeholder="Your nickname"
                required
                className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-lg text-zinc-900 placeholder-zinc-400 transition-all focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
              />
            </div>
          )}

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-zinc-700 mb-1.5"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              placeholder="you@email.com"
              required
              className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-lg text-zinc-900 placeholder-zinc-400 transition-all focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-zinc-700 mb-1.5"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              placeholder={
                mode === "signup"
                  ? "Create a password (min 6 chars)"
                  : "Your password"
              }
              required
              minLength={6}
              className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-lg text-zinc-900 placeholder-zinc-400 transition-all focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
            />
          </div>

          {error && (
            <p className="text-sm font-medium text-red-600 px-1">{error}</p>
          )}

          {successMessage && (
            <p className="text-sm font-medium text-green-600 px-1">{successMessage}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full cursor-pointer rounded-lg bg-zinc-900 px-6 py-4 text-lg font-medium text-white transition-all hover:bg-zinc-800 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading
              ? mode === "signup"
                ? "Creating account..."
                : "Logging in..."
              : mode === "signup"
                ? "Create account"
                : "Log in"}
          </button>
        </form>

        {/* Back to home */}
        <p className="mt-8 text-center text-sm text-zinc-400">
          <a href="/" className="transition-colors hover:text-zinc-900">
            ← Back to home
          </a>
        </p>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-white">
          <p className="text-zinc-400">Loading...</p>
        </div>
      }
    >
      <AuthPageContent />
    </Suspense>
  );
}

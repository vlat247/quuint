"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { syncUser } from "@/app/actions";

function AuthPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialMode = searchParams.get("mode") === "login" ? "login" : "signup";

  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const modeParam = searchParams.get("mode");
    if (modeParam === "login" || modeParam === "signup") {
      setMode(modeParam);
    }
  }, [searchParams]);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    }
  };

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
          emailRedirectTo: `${location.origin}/auth/callback`,
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }

      // If session exists, user is immediately signed in (email confirmation disabled)
      if (data.session) {
        await syncUser();
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

      await syncUser();
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

        {/* Google Login */}
        <button
          onClick={handleGoogleLogin}
          type="button"
          disabled={loading}
          className="mb-8 w-full flex items-center justify-center gap-3 cursor-pointer rounded-lg border border-zinc-200 bg-white px-6 py-4 text-lg font-medium text-zinc-700 transition-all hover:bg-zinc-50 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          {mode === "signup" ? "Sign up with Google" : "Log in with Google"}
        </button>

        <div className="relative mb-8">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-zinc-200"></span>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-zinc-400">Or continue with</span>
          </div>
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
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
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
                className="w-full rounded-lg border border-zinc-300 bg-white pl-4 pr-12 py-3 text-lg text-zinc-900 placeholder-zinc-400 transition-all focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
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

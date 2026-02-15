import Link from "next/link";

export function Header() {
  return (
    <header className="sticky top-0 z-[70] w-full bg-white/70 py-4 px-6 backdrop-blur-md">
      <nav className="mx-auto flex max-w-7xl items-center justify-between">
        <Link href="/" className="text-xl font-semibold text-zinc-500 transition-colors hover:text-zinc-900">ye&vl</Link>
        <div className="flex items-center gap-4">
          <Link href="/auth?mode=login" className="text-xl font-semibold text-zinc-500 transition-colors hover:text-zinc-900">log in</Link>
          <Link href="/auth?mode=signup" className="text-xl font-semibold text-zinc-500 transition-colors hover:text-zinc-900">sign up</Link>
        </div>
      </nav>
    </header>
  );
}

export function Header() {
  return (
    <header className="sticky top-0 z-[70] w-full bg-white/70 py-4 px-6 backdrop-blur-md">
      <nav className="mx-auto flex max-w-7xl items-center justify-between">
        <span className="text-xl font-semibold text-zinc-500">ye&vl</span>
        <div className="flex items-center gap-4">
          <a href="#" className="cursor-pointer text-xl font-semibold text-zinc-500 transition-colors hover:text-zinc-900">log in</a>
          <a href="#" className="cursor-pointer text-xl font-semibold text-zinc-500 transition-colors hover:text-zinc-900">sign up</a>
        </div>
      </nav>
    </header>
  );
}

export function Header() {
  return (
    <header className="sticky top-0 z-[70] w-full bg-white/70 py-4 px-6 backdrop-blur-md">
      <nav className="mx-auto flex max-w-7xl items-center justify-between">
        <span className="text-xl font-bold text-zinc-500">ye&vl</span>
        <a href="#" className="cursor-pointer text-xl font-bold text-zinc-500 transition-colors hover:text-zinc-900">follow us</a>
      </nav>
    </header>
  );
}

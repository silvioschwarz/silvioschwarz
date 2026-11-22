export default function Header({ onToggleMobile, onToggleDesktop, desktopOpen }) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-800 bg-slate-900 px-4 text-white">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleMobile}
          className="rounded-lg p-2 text-slate-300 hover:bg-slate-800 hover:text-white md:hidden"
          aria-label="Toggle Mobile Menu"
        >
          ☰
        </button>

        <button
          type="button"
          onClick={onToggleDesktop}
          className="hidden rounded-lg p-2 text-slate-300 hover:bg-slate-800 hover:text-white md:inline-flex"
          aria-label={desktopOpen ? "Collapse Sidebar" : "Expand Sidebar"}
          title={desktopOpen ? "Collapse Sidebar" : "Expand Sidebar"}
        >
          {desktopOpen ? "⇤" : "⇥"}
        </button>

        <span className="text-base font-bold tracking-tight text-white">Silvio Schwarz</span>
      </div>
    </header>
  );
}

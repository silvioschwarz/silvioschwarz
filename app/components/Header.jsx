export default function Header({ onToggleMobile, onToggleDesktop, desktopOpen }) {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b bg-white px-4">
      <div className="flex items-center gap-3">
        {/* Mobile drawer toggle */}
        <button
          type="button"
          onClick={onToggleMobile}
          className="rounded p-2 text-gray-600 hover:bg-gray-100 md:hidden"
          aria-label="Toggle Mobile Menu"
        >
          ☰
        </button>

        {/* Desktop collapse toggle */}
        <button
          type="button"
          onClick={onToggleDesktop}
          className="hidden rounded p-2 text-gray-600 hover:bg-gray-100 md:inline-flex"
          aria-label={desktopOpen ? "Collapse Sidebar" : "Expand Sidebar"}
          title={desktopOpen ? "Collapse Sidebar" : "Expand Sidebar"}
        >
          {desktopOpen ? "⇤" : "⇥"}
        </button>

        <span className="text-lg font-bold">Silvio Schwarz</span>
      </div>
    </header>
  );
}

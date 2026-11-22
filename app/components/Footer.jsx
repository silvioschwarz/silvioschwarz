export default function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-900 px-6 py-3 text-xs text-slate-400">
      <div className="flex flex-col items-center justify-between gap-2 sm:flex-row">
        <span>© {new Date().getFullYear()} Silvio Schwarz</span>
        <div className="flex gap-4">
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="hover:text-sky-400"
          >
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}

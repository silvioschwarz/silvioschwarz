export default function Footer() {
  return (
    <footer className="border-t bg-white px-6 py-4 text-sm text-gray-500">
      <div className="flex flex-col items-center justify-between gap-2 sm:flex-row">
        <span>© {new Date().getFullYear()} Silvio Schwarz</span>
        <div className="flex gap-4">
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="hover:text-gray-900"
          >
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}

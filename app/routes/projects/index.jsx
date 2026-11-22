import { Link } from "react-router";

const PROJECTS = [
  {
    title: "Ground Motion Dashboard",
    slug: "/projects/ground-motion",
    externalUrl: "https://github.io",
    repoUrl: "https://github.com",
    status: "Live",
    description:
      "Interaktive Analyse von über 44.000 Erdbeben-Messdaten (NGA-West2 & ESM) mit HTML5-Canvas-Scatterplot, Quadtree-Hover, Magnituden-Histogramm und PGA-Dichteverteilung.",
    tags: ["D3.js", "HTML5 Canvas", "Quadtree", "Seismologie"],
    preview: (
      <svg viewBox="0 0 320 140" className="h-full w-full bg-slate-900">
        <defs>
          <linearGradient id="gm-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#1e293b" />
          </linearGradient>
        </defs>
        <rect width="320" height="140" fill="url(#gm-grad)" />
        {/* Achsen */}
        <line x1="36" y1="115" x2="295" y2="115" stroke="#475569" strokeWidth="1.5" />
        <line x1="36" y1="20" x2="36" y2="115" stroke="#475569" strokeWidth="1.5" />
        {/* Trendlinie */}
        <line x1="45" y1="35" x2="285" y2="105" stroke="#f59e0b" strokeWidth="2" strokeDasharray="4 3" />
        {/* Datenpunkte */}
        {[
          [55, 42, "#38bdf8"], [68, 50, "#38bdf8"], [82, 46, "#fb7185"], [95, 58, "#38bdf8"],
          [110, 62, "#34d399"], [125, 55, "#fb7185"], [140, 70, "#38bdf8"], [152, 66, "#34d399"],
          [168, 76, "#38bdf8"], [180, 72, "#fb7185"], [195, 84, "#38bdf8"], [210, 80, "#34d399"],
          [225, 92, "#38bdf8"], [242, 88, "#fb7185"], [258, 98, "#38bdf8"], [275, 102, "#34d399"],
        ].map(([cx, cy, color], idx) => (
          <circle key={idx} cx={cx} cy={cy} r="3.5" fill={color} fillOpacity="0.85" />
        ))}
      </svg>
    ),
  },
  {
    title: "Web Graphics (3D / Three.js)",
    slug: "/projects/web-graphics/shark",
    externalUrl: "https://github.io",
    repoUrl: "https://github.com",
    status: "Live",
    description:
      "Prozedurale 3D-Szenen im Browser: Ein aus beweglichen Wirbelsegmenten animierter Hai auf einer Unterwasser-Spirale sowie erste WebGL-Experimente.",
    tags: ["Three.js", "WebGL", "3D-Animation", "OrbitControls"],
    preview: (
      <svg viewBox="0 0 320 140" className="h-full w-full bg-[#0a3c5c]">
        <defs>
          <radialGradient id="ocean-glow" cx="50%" cy="20%" r="80%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#082f49" stopOpacity="1" />
          </radialGradient>
        </defs>
        <rect width="320" height="140" fill="url(#ocean-glow)" />
        {/* Spiralbahn */}
        <ellipse cx="160" cy="82" rx="115" ry="26" fill="none" stroke="#7ae5ff" strokeOpacity="0.25" strokeWidth="1.5" />
        <ellipse cx="160" cy="70" rx="80" ry="18" fill="none" stroke="#7ae5ff" strokeOpacity="0.35" strokeWidth="1.5" />
        {/* Stilisierter Hai */}
        <path
          d="M115 68 Q155 48 205 66 L225 54 L218 68 L226 80 L205 70 Q155 82 115 68 Z"
          fill="#cbd5e1"
        />
        <polygon points="158,57 166,38 176,58" fill="#94a3b8" />
      </svg>
    ),
  },
  {
    title: "Alphabet Arcs",
    slug: "/projects/alphabet-arcs",
    externalUrl: "https://github.io",
    repoUrl: "https://github.com",
    status: "Live",
    description:
      "Interaktive Bogen-Visualisierung (Arc Diagram) von Buchstaben-Übergängen und Textstrukturen in Echtzeit.",
    tags: ["D3.js", "SVG", "Text-Visualisierung", "React"],
    preview: (
      <svg viewBox="0 0 320 140" className="h-full w-full bg-indigo-950">
        <rect width="320" height="140" fill="#1e1b4b" />
        <line x1="30" y1="112" x2="290" y2="112" stroke="#6366f1" strokeWidth="1.5" />
        {[
          [45, 130, "#a855f7"],
          [75, 210, "#38bdf8"],
          [110, 245, "#f472b6"],
          [130, 195, "#34d399"],
          [165, 275, "#fbbf24"],
        ].map(([x1, x2, color], idx) => {
          const r = (x2 - x1) / 2;
          return (
            <path
              key={idx}
              d={`M ${x1} 112 A ${r} ${r * 0.75} 0 0 1 ${x2} 112`}
              fill="none"
              stroke={color}
              strokeWidth="2"
              strokeOpacity="0.85"
            />
          );
        })}
      </svg>
    ),
  },
  {
    title: "EqDist",
    slug: "/projects/eqdist",
    externalUrl: null,
    repoUrl: null,
    status: "Live",
    description:
      "Kommendes Visualisierungs- und Analyse-Tool für räumliche Verteilungen und Distanzmetriken seismischer Ereignisse.",
    tags: ["Geodaten", "Visualisierung", "Coming Soon"],
    preview: (
      <svg viewBox="0 0 320 140" className="h-full w-full bg-gray-100">
        <rect width="320" height="140" fill="#f1f5f9" />
        <circle cx="160" cy="70" r="18" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="4 4" />
        <circle cx="160" cy="70" r="36" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="4 4" />
        <circle cx="160" cy="70" r="54" fill="none" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="4 4" />
        <circle cx="160" cy="70" r="4" fill="#64748b" />
      </svg>
    ),
  },
];

export default function ProjectsIndex() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Projects
        </h1>
        <p className="mt-2 max-w-2xl text-base text-gray-600">
          Interaktive Datenvisualisierungen, 3D-WebGL-Experimente und Tools – direkt im Browser ausführbar.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {PROJECTS.map((project) => (
          <article
            key={project.title}
            className="group flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
          >
            {/* Vorschau-Banner */}
            <Link to={project.slug} className="relative block h-40 w-full overflow-hidden">
              <div className="h-full w-full transition-transform duration-300 group-hover:scale-105">
                {project.preview}
              </div>
              <span
                className={`absolute right-3 top-3 rounded-full px-2.5 py-0.5 text-xs font-semibold shadow-sm ${
                  project.status === "Live"
                    ? "bg-emerald-500/90 text-white"
                    : "bg-gray-700/85 text-gray-100"
                }`}
              >
                {project.status}
              </span>
            </Link>

            {/* Inhalt */}
            <div className="flex flex-1 flex-col justify-between p-5">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600">
                  <Link to={project.slug}>{project.title}</Link>
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                  {project.description}
                </p>

                {/* Tags */}
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-md bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex items-center gap-3 border-t border-gray-100 pt-4">
                <Link
                  to={project.slug}
                  className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                >
                  Projekt öffnen →
                </Link>

                {project.repoUrl && (
                  <a
                    href={project.repoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    GitHub
                  </a>
                )}

                {project.externalUrl && (
                  <a
                    href={project.externalUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="ml-auto text-xs font-medium text-gray-500 hover:text-gray-800"
                  >
                    Standalone ↗
                  </a>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

import { Link } from "react-router";

const PROJECTS = [
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
    title: "Distance Contours — Isolinien-Vergleich",
    slug: "/projects/distance-contours",
    externalUrl: null,
    repoUrl: null,
    status: "Live",
    description:
      "Sechs synchronisierte Isolinien-Karten (100 × 100 km Gitter) zum direkten räumlichen Vergleich aller 6 Erdbeben-Distanzmaße inklusive Live-Fadenkreuz.",
    tags: ["D3 Contours", "HTML5 Canvas", "Isolinien", "Seismologie"],
    preview: (
      <svg viewBox="0 0 320 140" className="h-full w-full bg-emerald-950">
        <rect width="320" height="140" fill="#064e3b" />
        <ellipse cx="160" cy="70" rx="135" ry="62" fill="#15803d" stroke="#0f172a" strokeWidth="1" />
        <ellipse cx="160" cy="70" rx="102" ry="48" fill="#65a30d" stroke="#0f172a" strokeWidth="1" />
        <ellipse cx="160" cy="70" rx="72" ry="35" fill="#eab308" stroke="#0f172a" strokeWidth="1" />
        <ellipse cx="160" cy="70" rx="46" ry="23" fill="#ea580c" stroke="#0f172a" strokeWidth="1" />
        <ellipse cx="160" cy="70" rx="24" ry="12" fill="#b91c1c" stroke="#0f172a" strokeWidth="1" />
        <rect x="142" y="61" width="36" height="18" fill="rgba(250,204,21,0.2)" stroke="#facc15" strokeWidth="1.5" />
      </svg>
    ),
  },
    {
    title: "EqDist — 3D Fault Distance Explorer",
    slug: "/projects/eqdist",
    externalUrl: null,
    repoUrl: null,
    status: "Live",
    description:
      "Interaktives 3D-Blockmodell (Three.js) zur Berechnung und Visualisierung von R_epi, R_hyp, R_JB, R_rup sowie der Eckpunkt-Mittelwerte R_w und R_z.",
    tags: ["Three.js", "3D-Geometrie", "Finite Fault", "Seismologie"],
    preview: (
      <svg viewBox="0 0 320 140" className="h-full w-full bg-[#0b1120]">
        <rect width="320" height="140" fill="#0b1120" />
        <polygon points="70,45 190,35 230,65 110,75" fill="none" stroke="#facc15" strokeWidth="1.5" />
        <polygon points="110,75 230,65 255,108 135,118" fill="rgba(249,115,22,0.45)" stroke="#fb923c" strokeWidth="1.5" />
        <circle cx="170" cy="92" r="4.5" fill="#f43f5e" />
        <polygon points="265,42 271,54 259,54" fill="#38bdf8" />
        <line x1="265" y1="54" x2="215" y2="82" stroke="#f97316" strokeWidth="1.8" />
        <line x1="265" y1="54" x2="170" y2="92" stroke="#f43f5e" strokeWidth="1.2" strokeDasharray="3 2" />
      </svg>
    ),
  },
  {
    title: "Ground Motion Dashboard",
    slug: "/projects/ground-motion",
    externalUrl: "https://github.io",
    repoUrl: "https://github.com",
    status: "Live",
    description:
      "Interaktive Analyse von über 44.300 Erdbeben-Messdaten (NGA-West2 & ESM) mit HTML5-Canvas-Scatterplot, Quadtree-Hover sowie den neu berechneten Metriken R_w und R_z.",
    tags: ["D3.js", "HTML5 Canvas", "Quadtree", "Seismologie"],
    preview: (
      <svg viewBox="0 0 320 140" className="h-full w-full bg-slate-900">
        <rect width="320" height="140" fill="#0f172a" />
        <line x1="36" y1="115" x2="295" y2="115" stroke="#475569" strokeWidth="1.5" />
        <line x1="36" y1="20" x2="36" y2="115" stroke="#475569" strokeWidth="1.5" />
        <line x1="45" y1="35" x2="285" y2="105" stroke="#f59e0b" strokeWidth="2" strokeDasharray="4 3" />
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
        <rect width="320" height="140" fill="#082f49" />
        <ellipse cx="160" cy="82" rx="115" ry="26" fill="none" stroke="#7ae5ff" strokeOpacity="0.3" strokeWidth="1.5" />
        <ellipse cx="160" cy="70" rx="80" ry="18" fill="none" stroke="#7ae5ff" strokeOpacity="0.4" strokeWidth="1.5" />
        <path d="M115 68 Q155 48 205 66 L225 54 L218 68 L226 80 L205 70 Q155 82 115 68 Z" fill="#cbd5e1" />
        <polygon points="158,57 166,38 176,58" fill="#94a3b8" />
      </svg>
    ),
  },
    {
    title: "Wochenplaner",
    slug: "/projects/wochenplaner",
    externalUrl: "https://github.io",
    repoUrl: "https://github.com",
    status: "Live",
    description:
      "Interaktive Analyse von über 44.300 Erdbeben-Messdaten (NGA-West2 & ESM) mit HTML5-Canvas-Scatterplot, Quadtree-Hover sowie den neu berechneten Metriken R_w und R_z.",
    tags: ["D3.js", "HTML5 Canvas", "Quadtree", "Seismologie"],
    preview: (
      <svg viewBox="0 0 320 140" className="h-full w-full bg-slate-900">
        <rect width="320" height="140" fill="#0f172a" />
        <line x1="36" y1="115" x2="295" y2="115" stroke="#475569" strokeWidth="1.5" />
        <line x1="36" y1="20" x2="36" y2="115" stroke="#475569" strokeWidth="1.5" />
        <line x1="45" y1="35" x2="285" y2="105" stroke="#f59e0b" strokeWidth="2" strokeDasharray="4 3" />
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

];

export default function ProjectsIndex() {
  return (
    <div className="mx-auto w-full max-w-[1850px] px-4 py-6">
      <div className="mb-6 rounded-xl border border-slate-800 bg-slate-900 p-5 shadow-md">
        <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
          Projects
        </h1>
        <p className="mt-1.5 max-w-2xl text-sm text-slate-300">
          Interaktive Datenvisualisierungen, seismologische Berechnungsmodelle und 3D-WebGL-Szenen – direkt im Browser ausführbar.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {PROJECTS.map((project) => (
          <article
            key={project.title}
            className="group flex flex-col overflow-hidden rounded-xl border border-slate-800 bg-slate-900 shadow-lg transition-all duration-200 hover:-translate-y-1 hover:border-sky-500/60"
          >
            <Link to={project.slug} className="relative block h-52 w-full overflow-hidden">
              <div className="h-full w-full transition-transform duration-300 group-hover:scale-105">
                {project.preview}
              </div>
              <span className="absolute right-3 top-3 rounded-full bg-emerald-500/90 px-2.5 py-0.5 text-xs font-semibold text-white shadow-sm">
                {project.status}
              </span>
            </Link>

            <div className="flex flex-1 flex-col justify-between p-5">
              <div>
                <h2 className="text-xl font-bold text-white group-hover:text-sky-400">
                  <Link to={project.slug}>{project.title}</Link>
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">
                  {project.description}
                </p>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-md border border-slate-700 bg-slate-800 px-2.5 py-0.5 text-xs font-medium text-slate-200"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-6 flex items-center gap-3 border-t border-slate-800 pt-4">
                <Link
                  to={project.slug}
                  className="inline-flex items-center justify-center rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-950 transition-colors hover:bg-sky-400"
                >
                  Projekt öffnen →
                </Link>

                {project.repoUrl && (
                  <a
                    href={project.repoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm font-medium text-slate-200 transition-colors hover:bg-slate-700"
                  >
                    GitHub
                  </a>
                )}

                {project.externalUrl && (
                  <a
                    href={project.externalUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="ml-auto text-xs font-medium text-slate-400 hover:text-sky-400"
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

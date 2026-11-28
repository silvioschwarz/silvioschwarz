export default {
  ssr: false,
  buildDirectory: "dist", // Schreibt den Build sauber in dist/client
  prerender: [
    "/",
    "/latentspace",
    "/confounding-variables",
    "/projects",
    "/projects/alphabet-arcs",
    "/projects/ground-motion",
    "/projects/web-graphics",
    "/projects/web-graphics/first-try",
    "/projects/web-graphics/shark",
    "/projects/wochenplan",
  ],
  basename: "/",
};

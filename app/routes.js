import { index, layout, prefix, route } from "@react-router/dev/routes";

export default [
  layout("layouts/AppLayout.jsx", [
    index("routes/home.jsx"),
    route("latentspace", "routes/LatentSpace.jsx"),
    route("confounding-variables", "routes/ConfoundingVariables.jsx"),

    ...prefix("projects", [
      index("routes/projects/index.jsx"), // Optional overview page at /projects
      route("ground-motion", "routes/projects/GroundMotion.jsx"),
      route("eqdist", "routes/projects/EQDist.jsx"),
      route("alphabet-arcs", "routes/projects/AlphabetArcs.jsx"),
    ]),
  ]),
];
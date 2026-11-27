import { useState } from "react";
import { NavLink, useLocation } from "react-router";

export default function Sidebar({ mobileOpen, desktopOpen, onCloseMobile }) {
  const location = useLocation();
  const isProjectsActive = location.pathname.startsWith("/projects");

  const [projectsOpen, setProjectsOpen] = useState(isProjectsActive);
  const [prevPath, setPrevPath] = useState(location.pathname);

  if (location.pathname !== prevPath) {
    setPrevPath(location.pathname);
    if (isProjectsActive) {
      setProjectsOpen(true);
    }
  }

  const navLinkClass = ({ isActive }) =>
    `block whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-colors ${
      isActive ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-100"
    }`;

  const subLinkClass = ({ isActive }) =>
    `block whitespace-nowrap rounded-md py-1.5 pl-8 pr-3 text-sm transition-colors ${
      isActive
        ? "bg-blue-50 font-semibold text-blue-700"
        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
    }`;

  return (
    <aside
      className={`${mobileOpen ? "block" : "hidden"} ${
        desktopOpen
          ? "md:block md:w-64 md:border-r md:p-4"
          : "md:block md:w-0 md:overflow-hidden md:border-r-0 md:p-0"
      } w-64 shrink-0 overflow-hidden border-r bg-white p-4 transition-all duration-200`}
    >
      <nav className="space-y-1">
        <NavLink to="/" end className={navLinkClass} onClick={onCloseMobile}>
          Home
        </NavLink>

        <NavLink
          to="/latentspace"
          className={navLinkClass}
          onClick={onCloseMobile}
        >
          Latent Space
        </NavLink>

        <NavLink
          to="/confounding-variables"
          className={navLinkClass}
          onClick={onCloseMobile}
        >
          Confounding Variables
        </NavLink>

        {/* Projects Dropdown */}
        <div className="pt-1">
          <div className="flex items-center justify-between rounded-md hover:bg-gray-100">
            <NavLink
              to="/projects"
              end
              className={({ isActive }) =>
                `flex-1 whitespace-nowrap rounded-l-md px-3 py-2 text-sm font-medium ${
                  isActive ? "bg-blue-600 text-white" : "text-gray-700"
                }`
              }
              onClick={onCloseMobile}
            >
              Projects
            </NavLink>
            <button
              type="button"
              onClick={() => setProjectsOpen((prev) => !prev)}
              aria-expanded={projectsOpen}
              aria-label="Toggle Projects Submenu"
              className="px-3 py-2 text-xs text-gray-500 hover:text-gray-900"
            >
              {projectsOpen ? "▾" : "▸"}
            </button>
          </div>

          {projectsOpen && (
            <div className="mt-1 space-y-1">
              <NavLink
                to="/projects/alphabet-arcs"
                className={subLinkClass}
                onClick={onCloseMobile}
              >
                Alphabet Arcs
              </NavLink>
              <NavLink
                to="/projects/distance-contours"
                className={subLinkClass}
                onClick={onCloseMobile}
              >
                Distance Contours
              </NavLink>

              <NavLink
                to="/projects/eqdist"
                className={subLinkClass}
                onClick={onCloseMobile}
              >
                EqDist
              </NavLink>

              <NavLink
                to="/projects/ground-motion"
                className={subLinkClass}
                onClick={onCloseMobile}
              >
                Ground Motion
              </NavLink>

                            <NavLink
                to="/projects/wochenplan"
                className={subLinkClass}
                onClick={onCloseMobile}
              >
                Wochenplaner
              </NavLink>

              <div>
                <NavLink
                  to="/projects/web-graphics"
                  end
                  className={subLinkClass}
                  onClick={onCloseMobile}
                >
                  Web Graphics
                </NavLink>
                <div className="ml-4 mt-1 space-y-1">
                  <NavLink
                    to="/projects/web-graphics/shark"
                    className={subLinkClass}
                    onClick={onCloseMobile}
                  >
                    Shark
                  </NavLink>
                  <NavLink
                    to="/projects/web-graphics/first-try"
                    className={subLinkClass}
                    onClick={onCloseMobile}
                  >
                    First Try
                  </NavLink>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>
    </aside>
  );
}

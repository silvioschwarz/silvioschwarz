import logo from './logo/SufferWell.png'

export default function SideNav({ activeSite, setActiveSite, onNavigate }) {
      const linkStyle = (site) => ({
    textDecoration: "none",
    fontSize: "2rem",
    padding: "10px",
    cursor: "pointer",
    fontWeight: "bold",//activeSite === site ? "bold" : "normal",
    color: "#712119"//activeSite === site ? "#712119" : "black",
  });

  return (
    <nav className="sidenav" id="sidenav">

        <div className="icon-container">
          <div
            style={linkStyle("main")}
            onClick={() => onNavigate("main", null)}
            className="navbar-brand navbar-brand-logo"
          >
            <img src={logo} alt="SufferWell Icon" className="icon" />
          </div>
        </div>
        <button
          className="menu-toggle"
          id="menuToggle"
          aria-label="Toggle Navigation"
        >
          ☰
        </button>
        <ul className="nav-links" id="navLinks">
          <li>
            <div
              style={linkStyle("main")}
              onClick={() => onNavigate("about",null)}
            >
              <span className="menu-text">
                About
                </span>
            </div>
          </li>
                    <li>
            <div
              style={linkStyle("main")}
              onClick={() => onNavigate("latentspace",null)}
            >
              <span className="menu-text">
                Latent Space
                </span>
            </div>
          </li>
                    <li>
            <div
              style={linkStyle("main")}
              onClick={() => onNavigate("confoundingvariables",null)}
            >
              <span className="menu-text">
                Confounding Variables
                </span>
            </div>
          </li>

          <li className="dropdown">
            <button href="." className="drop-btn dropdown-toggle">
              Projects<span className="arrow"> ▾ </span>
            </button>
            <ul className="dropdown-menu">
              <li>
                <div
                style={linkStyle("main")}
                  onClick={() => onNavigate("alphabetarcs",null)}>
                    Alphabet Arcs
                  </div>
              </li>
              <li>
                <div
                  style={linkStyle("main")}
                  onClick={() => setActiveSite("eqdists",null)}
                >
                  EQDists
                </div>
              </li>
            </ul>
          </li>
          <li>
            <a href="https://github.com/silvioschwarz">
              <i className="fa fa-github fa-2xl"></i>
              <span className="menu-text"></span>
            </a>
          </li>
        </ul>
    </nav>
  );
}


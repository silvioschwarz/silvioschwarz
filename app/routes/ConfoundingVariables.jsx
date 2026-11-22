import "./subsite.css"
import logo from "./logo/ConfoundingVariables.png"

export default function ConfoundingVariables() {
  return (
   <div id="confoundingVariables" className="subsite">
    <div className="content">
        <div className="logo">
          <img
            src={ logo }
            alt="Confounding Variables Logo"
          />
        </div>
        <h1>Confounding Variables</h1>
      </div>

      <div className="container">
        <p className="tagline">Exploring the Space Between Dimensions</p>
        <p className="description">
          Welcome to Confounding Variables, where innovation meets imagination.
          We transform complex ideas into elegant solutions, navigating the
          multidimensional landscape of technology and creativity.
        </p>
        <a href="#" className="cta-button">Explore More</a>
      </div>
   </div>
  );
}

import "./subsite.css"
import logo from "./logo/LatentSpace.png"

export default function LatentSpace() {
  return (
   <div id="latentspace" className="subsite" >
      <div class="content">
        <div className="logo">
          <img
            src={ logo }
            alt="Latent Space Logo"
          />
        </div>
        <h1>Latent Space</h1>
      </div>

      <div className="container">
        <p className="tagline">Exploring the Space Between Dimensions</p>
        <p className="description">
          Welcome to Latent Space, where innovation meets imagination. We
          transform complex ideas into elegant solutions, navigating the
          multidimensional landscape of technology and creativity.
        </p>
        <a href="#" className="cta-button">Explore More</a>
      </div>
   </div>
  );
}

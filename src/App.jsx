import  { useState } from 'react';

import Header from "./components/Header";
import Main from "./components/Main";
import Footer from "./components/Footer";
import SideNav from "./components/SideNav";

import About from "./components/subsites/About";
import LatentSpace from "./components/subsites/LatentSpace";
import ConfoundingVariables from "./components/subsites/ConfoundingVariables";
import AlphabetArcs from "./components/subsites/AlphabetArcs";
import EQDist from "./components/subsites/EQDist"

import "./components/style.css";

function App() {
  const [activeSite, setActiveSite] = useState('main'); // Startseite

  const navigateAndScroll = (view) => {
    setActiveSite(view);
  };

  return (
    <div id="content">
      <SideNav
            onNavigate={navigateAndScroll}  
      activeSite={activeSite} 
      setActiveSite={setActiveSite}
       />
      <Header />
      <main className='main'>
        {activeSite === 'main' && 
          <Main               />}
        {activeSite === 'about' && <About />}
        {activeSite === 'latentspace' && <LatentSpace />}
        {activeSite === 'confoundingvariables' && <ConfoundingVariables />}
        {activeSite === 'alphabetarcs' && <AlphabetArcs />}
        {activeSite === 'eqdist' && <EQDist />}
      </main>
      <Footer />
    </div>
  );
}

export default App;

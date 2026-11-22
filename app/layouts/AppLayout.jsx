import { useState } from "react";
import { Outlet } from "react-router";
import Header from "../components/Header";
import SideNav from "../components/SideNav";
import Footer from "../components/Footer";

export default function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopOpen, setDesktopOpen] = useState(true);

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      <Header
        onToggleMobile={() => setMobileOpen((prev) => !prev)}
        onToggleDesktop={() => setDesktopOpen((prev) => !prev)}
        desktopOpen={desktopOpen}
      />

      <div className="flex flex-1 overflow-hidden">
        <SideNav
          mobileOpen={mobileOpen}
          desktopOpen={desktopOpen}
          onCloseMobile={() => setMobileOpen(false)}
        />

        <div className="flex flex-1 flex-col overflow-y-auto">
          <main className="flex-1 p-6">
            <Outlet />
          </main>
          <Footer />
        </div>
      </div>
    </div>
  );
}

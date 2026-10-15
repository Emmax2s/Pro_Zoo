import { useEffect } from "react";
import { Outlet } from "react-router";
import { Navigation } from "./Navigation";
import { Footer } from "./Footer";
import { recordGeneralVisit } from "../../services/analytics";

export function RootLayout() {
  useEffect(() => {
    recordGeneralVisit();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

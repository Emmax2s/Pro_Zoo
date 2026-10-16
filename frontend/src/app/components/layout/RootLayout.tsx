import { useEffect } from "react";
import { Outlet, useLocation } from "react-router";
import { Navigation } from "./Navigation";
import { Footer } from "./Footer";
import { recordGeneralVisit } from "../../services/analytics";
import { PublicChatButton } from "../PublicChatButton";

export function RootLayout() {
  const location = useLocation();
  const isExhibitView = location.pathname.startsWith("/especie");

  useEffect(() => {
    recordGeneralVisit();
  }, []);

  if (isExhibitView) {
    return (
      <main className="min-h-screen">
        <Outlet />
        <PublicChatButton />
      </main>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <PublicChatButton />
    </div>
  );
}

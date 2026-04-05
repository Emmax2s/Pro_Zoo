import { Outlet } from "react-router";
import { AnimalProvider } from "./contexts/AnimalContext";
import { SiteProvider } from "./contexts/SiteContext";
import { LanguageWidget } from "./components/LanguageWidget";

export default function Root() {
  return (
    <SiteProvider>
      <AnimalProvider>
        <Outlet />
        <LanguageWidget />
      </AnimalProvider>
    </SiteProvider>
  );
}
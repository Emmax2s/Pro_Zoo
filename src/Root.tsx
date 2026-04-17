import { Outlet } from "react-router";
import { AnimalProvider } from "./contexts/AnimalContext";
import { SiteProvider } from "./contexts/SiteContext";
import { LanguageProvider } from "./contexts/LanguageContext";

export default function Root() {
  return (
    <LanguageProvider>
      <SiteProvider>
        <AnimalProvider>
          <Outlet />
        </AnimalProvider>
      </SiteProvider>
    </LanguageProvider>
  );
}
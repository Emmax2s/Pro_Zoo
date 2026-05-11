import { Outlet } from "react-router";
import { AnimalProvider } from "./contexts/AnimalContext";
import { SiteProvider } from "./contexts/SiteContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import { AccessibilityProvider } from "./contexts/AccessibilityContext";

export default function Root() {
  return (
    <AccessibilityProvider>
      <LanguageProvider>
        <SiteProvider>
          <AnimalProvider>
            <Outlet />
          </AnimalProvider>
        </SiteProvider>
      </LanguageProvider>
    </AccessibilityProvider>
  );
}
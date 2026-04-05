import { Outlet } from "react-router";
import { AnimalProvider } from "./contexts/AnimalContext";
import { SiteProvider } from "./contexts/SiteContext";

export default function Root() {
  return (
    <SiteProvider>
      <AnimalProvider>
        <Outlet />
      </AnimalProvider>
    </SiteProvider>
  );
}
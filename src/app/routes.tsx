import { createBrowserRouter } from "react-router";
import { RootLayout } from "./components/layout/RootLayout";
import { Home } from "./pages/Home";
import { Animals } from "./pages/Animals";
import { Visit } from "./pages/Visit";
import { ZooMap } from "./pages/ZooMap";
import { Contact } from "./pages/Contact";
import { Privacy } from "./pages/Privacy";
import { Terms } from "./pages/Terms";
import { NotFound } from "./pages/NotFound";
import { Redes } from "./pages/Redes";
import { AdminLayout } from "./pages/admin/AdminLayout";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { AdminAnimals } from "./pages/admin/AdminAnimals";
import { AdminUsers } from "./pages/admin/AdminUsers";
import { AdminEnclosures } from "./pages/admin/AdminEnclosures";
import { AdminHome } from "./pages/admin/AdminHome";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      { index: true, Component: Home },
      { path: "animales", Component: Animals },
      { path: "visita", Component: Visit },
      { path: "mapa", Component: ZooMap },
      { path: "contacto", Component: Contact },
      { path: "privacidad", Component: Privacy },
      { path: "terminos", Component: Terms },
      { path: "*", Component: NotFound },
    ],
  },
  {
    path: "/redes",
    Component: Redes,
  },
  {
    path: "/links",
    Component: Redes,
  },
  {
    path: "/admin",
    Component: AdminLayout,
    children: [
      { index: true, Component: AdminDashboard },
      { path: "inicio", Component: AdminHome },
      { path: "recintos", Component: AdminEnclosures },
      { path: "animales", Component: AdminAnimals },
      { path: "usuarios", Component: AdminUsers },
    ],
  },
]);

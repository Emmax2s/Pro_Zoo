import { createBrowserRouter } from "react-router";
import Root from "./Root";
import Home from "./pages/Home";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import Species from "./pages/Species";
import { RouteErrorBoundary } from "./components/RouteErrorBoundary";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    ErrorBoundary: RouteErrorBoundary,
    children: [
      { index: true, Component: Home },
      { path: "info", Component: Home },
      { path: "animales", Component: Home },
      { path: "contacto", Component: Home },
      { path: "especie/:animalId", Component: Species },
      { path: "admin", Component: Admin },
      { path: "*", Component: NotFound },
    ],
  },
]);
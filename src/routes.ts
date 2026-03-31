import { createBrowserRouter } from "react-router";
import Root from "./Root";
import Home from "./pages/Home";
import Admin from "./pages/Admin";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Home },
      { path: "admin", Component: Admin },
    ],
  },
]);
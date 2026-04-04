import { createHashRouter } from "react-router";
import Root from "./Root";
import Home from "./pages/Home";
import Admin from "./pages/Admin";

export const router = createHashRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Home },
      { path: "admin", Component: Admin },
    ],
  },
]);
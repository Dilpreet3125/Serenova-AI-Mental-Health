import { createBrowserRouter } from "react-router";
import { Landing } from "./pages/Landing";
import { Auth } from "./pages/Auth";
import { Assessment } from "./pages/Assessment";
import { Loading } from "./pages/Loading";
import { Dashboard } from "./pages/Dashboard";
import { Journal } from "./pages/Journal";
import { Progress } from "./pages/Progress";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Landing,
  },
  {
    path: "/auth",
    Component: Auth,
  },
  {
    path: "/assessment",
    Component: Assessment,
  },
  {
    path: "/loading",
    Component: Loading,
  },
  {
    path: "/dashboard",
    Component: Dashboard,
  },
  {
    path: "/journal",
    Component: Journal,
  },
  {
    path: "/progress",
    Component: Progress,
  },
]);

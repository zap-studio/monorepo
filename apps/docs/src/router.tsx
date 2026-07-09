import { createRouter as createTanStackRouter } from "@tanstack/react-router";

import { NotFoundComponent } from "./components/not-found";
import { routeTree } from "./routeTree.gen";

export const getRouter = () =>
  createTanStackRouter({
    defaultNotFoundComponent: NotFoundComponent,
    defaultPreload: "intent",
    routeTree,
    scrollRestoration: true,
  });

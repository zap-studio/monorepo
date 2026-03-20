import { createRouter as createTanStackRouter } from "@tanstack/react-router";

import { NotFoundComponent } from "./components/not-found";
import { routeTree } from "./routeTree.gen";

export function getRouter() {
  return createTanStackRouter({
    routeTree,
    defaultPreload: "intent",
    scrollRestoration: true,
    defaultNotFoundComponent: NotFoundComponent,
  });
}

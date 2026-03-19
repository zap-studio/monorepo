import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/local-ts")({
  beforeLoad: () => {
    throw redirect({ to: "/docs/$", params: { _splat: "local-ts" } });
  },
});

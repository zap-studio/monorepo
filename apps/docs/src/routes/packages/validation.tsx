import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/packages/validation")({
  beforeLoad: () => {
    throw redirect({ to: "/docs/$", params: { _splat: "packages/validation" } });
  },
});

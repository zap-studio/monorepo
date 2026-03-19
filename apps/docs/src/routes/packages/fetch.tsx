import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/packages/fetch")({
  beforeLoad: () => {
    throw redirect({ to: "/docs/$", params: { _splat: "packages/fetch" } });
  },
});

import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/packages/retry")({
  beforeLoad: () => {
    throw redirect({ params: { _splat: "packages/retry" }, to: "/docs/$" });
  },
});

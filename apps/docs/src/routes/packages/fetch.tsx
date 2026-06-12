import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/packages/fetch")({
  beforeLoad: () => {
    throw redirect({ params: { _splat: "packages/fetch" }, to: "/docs/$" });
  },
});

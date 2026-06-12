import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/packages/permit")({
  beforeLoad: () => {
    throw redirect({ params: { _splat: "packages/permit" }, to: "/docs/$" });
  },
});

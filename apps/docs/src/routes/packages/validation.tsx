import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/packages/validation")({
  beforeLoad: () => {
    throw redirect({
      params: { _splat: "packages/validation" },
      to: "/docs/$",
    });
  },
});

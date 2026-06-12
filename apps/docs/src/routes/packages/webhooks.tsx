import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/packages/webhooks")({
  beforeLoad: () => {
    throw redirect({ params: { _splat: "packages/webhooks" }, to: "/docs/$" });
  },
});

import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/packages/validation")({
  beforeLoad: () => {
    // oxlint-disable-next-line typescript/only-throw-error -- TanStack Router uses thrown redirects for control flow.
    throw redirect({
      params: { _splat: "packages/validation" },
      to: "/docs/$",
    });
  },
});

import { Link } from "@tanstack/react-router";
import { ReactNode } from "react";

export function NotFoundComponent(): ReactNode {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="font-mono text-fd-muted-foreground text-xs uppercase tracking-[0.2em]">404</p>
      <h1 className="font-serif text-4xl">Page not found</h1>
      <p className="max-w-md text-fd-muted-foreground text-sm leading-7">
        The page you requested does not exist or has moved.
      </p>
      <Link
        className="inline-flex items-center justify-center rounded-md border border-fd-primary/80 bg-fd-primary px-5 py-2.5 font-medium text-fd-primary-foreground text-sm"
        to="/"
      >
        Go home
      </Link>
    </main>
  );
}

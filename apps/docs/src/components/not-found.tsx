import { Link } from "@tanstack/react-router";
import { ReactNode } from "react";

export function NotFoundComponent(): ReactNode {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-fd-muted-foreground font-mono text-xs tracking-[0.2em] uppercase">404</p>
      <h1 className="font-serif text-4xl">Page not found</h1>
      <p className="text-fd-muted-foreground max-w-md text-sm leading-7">
        The page you requested does not exist or has moved.
      </p>
      <Link
        className="border-fd-primary/80 bg-fd-primary text-fd-primary-foreground inline-flex items-center justify-center rounded-md border px-5 py-2.5 text-sm font-medium"
        to="/"
      >
        Go home
      </Link>
    </main>
  );
}

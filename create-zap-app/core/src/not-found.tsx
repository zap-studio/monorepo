import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-4 px-4 text-center">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">Page not found</h1>
        <p className="text-muted-foreground">
          Sorry, we couldn&apos;t find the page you&apos;re looking for.
        </p>
      </div>

      <Button variant="outline" asChild>
        <Link href="/">Return to home</Link>
      </Button>
    </div>
  );
}

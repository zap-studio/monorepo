import Link from "next/link";

import { ZapButton } from "@/zap/components/core/button";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center px-4 py-12 sm:px-6 md:px-8 lg:px-12 xl:px-16">
      <div className="w-full space-y-6 text-center">
        <div className="space-y-3">
          <h1 className="animate-bounce font-bold text-4xl text-primary tracking-tighter sm:text-5xl">
            404
          </h1>
          <p className="text-muted-foreground">
            Looks like you&apos;ve found the edge case...{" "}
          </p>
        </div>
        <ZapButton asChild variant={"ghost"}>
          <Link href="/">Return to website</Link>
        </ZapButton>
      </div>
    </div>
  );
}

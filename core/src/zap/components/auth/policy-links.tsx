import Link from "next/link";

import { cn } from "@/lib/utils";

export function PolicyLinks({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "text-muted-foreground [&_a]:hover:text-primary text-center text-xs text-balance [&_a]:underline [&_a]:underline-offset-4",
        className,
      )}
    >
      By clicking continue, you agree to our{" "}
      <Link href="/terms-of-service">Terms of Service</Link> and{" "}
      <Link href="/privacy-policy">Privacy Policy</Link>.
    </div>
  );
}

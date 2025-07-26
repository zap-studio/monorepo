import Link from "next/link";

export function Logo() {
  return (
    <Link className="flex items-center space-x-2" href="/">
      <span className="inline-block font-bold">Zap.ts ⚡️</span>
    </Link>
  );
}

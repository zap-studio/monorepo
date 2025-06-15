import Link from "next/link";

const FooterLinks = [
  { href: "/terms-of-service", label: "Terms of Service" },
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/cookie-policy", label: "Cookie Policy" },
];

export default function Footer() {
  return (
    <footer className="bg-background w-full border-t px-8">
      <div className="flex w-full flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
        <div className="flex flex-col items-center gap-4 md:flex-row md:gap-2">
          <Link href="/" className="flex items-center space-x-2">
            <span className="inline-block font-bold">Zap.ts ⚡️</span>
          </Link>
          <p className="text-muted-foreground text-center text-sm leading-loose md:text-left">
            &copy; {new Date().getFullYear()} Zap.ts. All rights reserved.
          </p>
        </div>
        <div className="flex gap-4">
          {FooterLinks.map((link) => (
            <FooterLink key={link.href} href={link.href} label={link.label} />
          ))}
        </div>
      </div>
    </footer>
  );
}

function FooterLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="text-muted-foreground text-sm underline-offset-4 hover:underline"
    >
      {label}
    </Link>
  );
}

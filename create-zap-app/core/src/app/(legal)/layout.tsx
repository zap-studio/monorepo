import React from "react";

interface LegalLayoutProps {
  children: React.ReactNode;
}

export default function LegalLayout({ children }: LegalLayoutProps) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-24 md:py-32">{children}</div>
  );
}

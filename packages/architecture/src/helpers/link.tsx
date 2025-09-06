import type { JSX } from "react/jsx-runtime";

export const L = ({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}): JSX.Element => (
  <a href={href} rel="noopener noreferrer" target="_blank">
    {children}
  </a>
);

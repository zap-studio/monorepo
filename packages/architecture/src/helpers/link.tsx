export const L = ({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) => (
  <a href={href} rel="noopener noreferrer" target="_blank">
    {children}
  </a>
);

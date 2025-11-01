import type { ReactNode } from "react";

export function Table({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        width: "100%",
        overflowX: "auto",
        maxWidth: "100%",
      }}
    >
      <table style={{ width: "100%", padding: "0px", margin: "0px" }}>
        {children}
      </table>
    </div>
  );
}

export function TableHead({ children }: { children: ReactNode }) {
  return <thead>{children}</thead>;
}

export function TableBody({ children }: { children: ReactNode }) {
  return <tbody>{children}</tbody>;
}

export function TableRow({ children }: { children: ReactNode }) {
  return <tr>{children}</tr>;
}

export function TableHeader({ children }: { children: ReactNode }) {
  return <th>{children}</th>;
}

export function TableCell({ children }: { children: ReactNode }) {
  return <td>{children}</td>;
}

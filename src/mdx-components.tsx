import { ArrowUpRight } from "lucide-react";
import type { MDXComponents } from "mdx/types";
import Image, { ImageProps } from "next/image";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: ({ children }) => (
      <h1
        style={{
          scrollMargin: 20,
          fontSize: "2.25rem",
          fontWeight: "700",
          letterSpacing: "-0.02em",
          lineHeight: "1.2",
        }}
      >
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2
        style={{
          marginTop: "2.5rem",
          scrollMargin: 20,
          borderBottom: "1px solid hsl(var(--border))",
          paddingBottom: "0.5rem",
          fontSize: "1.875rem",
          fontWeight: "600",
          letterSpacing: "-0.01em",
        }}
      >
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3
        style={{
          marginTop: "2rem",
          scrollMargin: 20,
          fontSize: "1.5rem",
          fontWeight: "600",
          letterSpacing: "-0.005em",
        }}
      >
        {children}
      </h3>
    ),
    h4: ({ children }) => (
      <h4
        style={{
          scrollMargin: 20,
          fontSize: "1.25rem",
          fontWeight: "600",
          letterSpacing: "-0.005em",
        }}
      >
        {children}
      </h4>
    ),
    p: ({ children }) => (
      <p style={{ lineHeight: "1.75", marginTop: "1.5rem" }}>{children}</p>
    ),
    blockquote: ({ children }) => (
      <blockquote
        style={{
          marginTop: "1.5rem",
          borderLeft: "2px solid hsl(var(--border))",
          paddingLeft: "1.5rem",
          fontStyle: "italic",
        }}
      >
        {children}
      </blockquote>
    ),
    ul: ({ children }) => (
      <ul
        style={{
          margin: "1.5rem 0",
          paddingLeft: "1.5rem",
          listStyleType: "disc",
        }}
      >
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol
        style={{
          margin: "1.5rem 0",
          paddingLeft: "1.5rem",
          listStyleType: "decimal",
        }}
      >
        {children}
      </ol>
    ),
    inlineCode: ({ children }) => (
      <code
        style={{
          position: "relative",
          borderRadius: "4px",
          backgroundColor: "hsl(var(--muted))",
          padding: "0.2rem 0.3rem",
          fontFamily: "monospace",
          fontSize: "0.875rem",
          fontWeight: "600",
        }}
      >
        {children}
      </code>
    ),
    code: ({ children }) => (
      <code
        style={{
          position: "relative",
          borderRadius: "4px",
          backgroundColor: "hsl(var(--muted))",
          padding: "0.2rem 0.3rem",
          fontFamily: "monospace",
          fontSize: "0.875rem",
          fontWeight: "600",
        }}
      >
        {children}
      </code>
    ),
    a: ({ children, href }) => (
      <a
        href={href}
        target="_blank"
        style={{
          color: "hsl(var(--primary))",
          display: "inline-flex",
          alignItems: "center",
          textDecoration: "none",
        }}
      >
        {children} <ArrowUpRight size={16} />
      </a>
    ),
    img: (props) => (
      <Image
        sizes="100vw"
        style={{ width: "100%", height: "auto" }}
        {...(props as ImageProps)}
        alt={props.alt as string}
      />
    ),
    ...components,
  };
}

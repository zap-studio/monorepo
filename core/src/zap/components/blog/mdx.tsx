import "@/app/globals.css";

import { ArrowUpRight } from "lucide-react";
import Image, { type ImageProps } from "next/image";
import Link, { type LinkProps } from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import React from "react";
import { highlight } from "sugar-high";

interface TableProps {
  data: {
    headers: string[];
    rows: string[][];
  };
}

function Table({ data }: TableProps) {
  const headers = data.headers.map((header, index) => (
    <th key={`header-${header}-${index}`}>{header}</th>
  ));
  const rows = data.rows.map((row, index) => (
    <tr key={`row-${index}`}>
      {row.map((cell, cellIndex) => (
        <td key={`cell-${index}-${cellIndex}`}>{cell}</td>
      ))}
    </tr>
  ));

  return (
    <table>
      <thead>
        <tr>{headers}</tr>
      </thead>
      <tbody>{rows}</tbody>
    </table>
  );
}

interface CustomLinkProps extends LinkProps {
  href: string;
  children: React.ReactNode;
}

function CustomLink(props: CustomLinkProps) {
  const { href, children, ...restProps } = props;

  if (href.startsWith("/")) {
    return (
      <Link href={href} {...restProps}>
        {children}
      </Link>
    );
  }

  if (href.startsWith("#")) {
    return (
      <a href={href} {...restProps}>
        {children}
      </a>
    );
  }

  return (
    <a
      href={href}
      rel="noopener noreferrer"
      style={{
        color: "hsl(var(--primary))",
        display: "inline-flex",
        alignItems: "center",
        textDecoration: "none",
      }}
      target="_blank"
      {...restProps}
    >
      {children} <ArrowUpRight size={16} />
    </a>
  );
}

interface RoundedImageProps extends ImageProps {
  alt: string;
}

function RoundedImage(props: RoundedImageProps) {
  const { alt, ...restProps } = props;
  return (
    <Image
      alt={alt}
      className="rounded-lg"
      sizes="100vw"
      style={{ width: "100%", height: "auto" }}
      {...restProps}
    />
  );
}

interface CodeProps {
  children: string;
}

function Code({ children, ...props }: CodeProps) {
  const codeHTML = highlight(children);
  return (
    <code
      dangerouslySetInnerHTML={{ __html: codeHTML }}
      style={{
        position: "relative",
        borderRadius: "4px",
        backgroundColor: "hsl(var(--muted))",
        padding: "0.2rem 0.3rem",
        fontFamily: "monospace",
        fontSize: "0.875rem",
        fontWeight: "600",
      }}
      {...props}
    />
  );
}

function slugify(str: string) {
  return str
    .toString()
    .toLowerCase()
    .trim() // Remove whitespace from both ends of a string
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/&/g, "-and-") // Replace & with 'and'
    .replace(/[^\w-]+/g, "") // Remove all non-word characters except for -
    .replace(/--+/g, "-"); // Replace multiple - with single -
}

function createHeading(level: number) {
  const Heading = ({ children }: { children: string }) => {
    const slug = slugify(children);

    const getHeadingStyle = (headingLevel: number) => {
      switch (headingLevel) {
        case 1:
          return {
            scrollMargin: 20,
            fontSize: "2.25rem",
            fontWeight: "700",
            letterSpacing: "-0.02em",
            lineHeight: "1.2",
          };
        case 2:
          return {
            marginTop: "2.5rem",
            scrollMargin: 20,
            borderBottom: "1px solid hsl(var(--border))",
            paddingBottom: "0.5rem",
            fontSize: "1.875rem",
            fontWeight: "600",
            letterSpacing: "-0.01em",
          };
        case 3:
          return {
            marginTop: "2rem",
            scrollMargin: 20,
            fontSize: "1.5rem",
            fontWeight: "600",
            letterSpacing: "-0.005em",
          };
        default:
          return {
            scrollMargin: 20,
            fontSize: "1.25rem",
            fontWeight: "600",
            letterSpacing: "-0.005em",
          };
      }
    };

    return React.createElement(
      `h${level}`,
      {
        id: slug,
        style: getHeadingStyle(level),
      },
      [
        React.createElement("a", {
          href: `#${slug}`,
          key: `link-${slug}`,
          className: "anchor",
        }),
      ],
      children,
    );
  };

  Heading.displayName = `Heading${level}`;

  return Heading;
}

const components = {
  h1: createHeading(1),
  h2: createHeading(2),
  h3: createHeading(3),
  h4: createHeading(4),
  h5: createHeading(5),
  h6: createHeading(6),
  p: ({ children }: { children: React.ReactNode }) => (
    <p style={{ lineHeight: "1.75", marginTop: "1.5rem" }}>{children}</p>
  ),
  blockquote: ({ children }: { children: React.ReactNode }) => (
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
  ul: ({ children }: { children: React.ReactNode }) => (
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
  ol: ({ children }: { children: React.ReactNode }) => (
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
  inlineCode: ({ children }: { children: React.ReactNode }) => (
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
  Image: RoundedImage,
  img: RoundedImage,
  a: CustomLink,
  code: Code,
  Table,
};

interface CustomMDXProps
  extends Omit<React.ComponentProps<typeof MDXRemote>, "components"> {
  components?: Record<string, React.ComponentType>;
}

export function CustomMDX(props: CustomMDXProps) {
  return (
    <MDXRemote
      {...props}
      components={{ ...components, ...(props.components || {}) }}
    />
  );
}

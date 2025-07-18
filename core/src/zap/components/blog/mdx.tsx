import { ArrowUpRight } from "lucide-react";
import Image, { type ImageProps } from "next/image";
import Link, { type LinkProps } from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import React from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { tomorrow } from "react-syntax-highlighter/dist/cjs/styles/prism";

interface TableProps {
  data: {
    headers: string[];
    rows: string[][];
  };
}

function Table({ data }: TableProps) {
  const headers = data.headers.map((header) => (
    <th className="border px-4 py-2 text-left" key={`header-${header}`}>
      {header}
    </th>
  ));
  const rows = data.rows.map((row, i) => (
    <tr className="even:bg-muted/40" key={`row-${i}`}>
      {row.map((cell, j) => (
        <td className="border px-4 py-2" key={`cell-${i}-${j}`}>
          {cell}
        </td>
      ))}
    </tr>
  ));

  return (
    <div className="mt-6 overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        {/* table style applied here */}
        <thead className="bg-muted">
          {headers.length > 0 && <tr>{headers}</tr>}
        </thead>
        <tbody>{rows}</tbody>
      </table>
    </div>
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
      <Link href={href} {...restProps} className="text-primary hover:underline">
        {children}
      </Link>
    );
  }

  if (href.startsWith("#")) {
    return (
      <a href={href} {...restProps} className="text-primary hover:underline">
        {children}
      </a>
    );
  }

  return (
    <a
      aria-label={`${children} (opens in a new tab)`}
      className="text-primary inline-flex items-center gap-1 hover:underline focus-visible:outline-none"
      href={href}
      rel="noopener noreferrer"
      target="_blank"
      {...restProps}
    >
      {children}
      <ArrowUpRight size={16} />
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
      className="border-muted rounded-lg border shadow-md"
      loading="lazy"
      sizes="100vw"
      {...restProps}
    />
  );
}

function slugify(str: string) {
  return str
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/&/g, "-and-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-");
}

function createHeading(level: number) {
  const Heading = ({ children }: { children: string }) => {
    const slug = slugify(children);

    const headingClassMap: Record<number, string> = {
      1: "scroll-mt-20 text-4xl font-bold tracking-tight leading-tight",
      2: "scroll-mt-20 mt-10 pb-2 border-b border-border text-3xl font-semibold tracking-tight",
      3: "scroll-mt-20 mt-8 text-2xl font-semibold tracking-tight",
      4: "scroll-mt-20 mt-6 text-xl font-semibold",
      5: "scroll-mt-20 mt-4 text-lg font-semibold",
      6: "scroll-mt-20 mt-4 text-base font-semibold",
    };

    return React.createElement(
      `h${level}`,
      {
        id: slug,
        className: `${headingClassMap[level] || ""} group`,
      },
      <>
        {children}
        <a
          className="anchor text-muted-foreground ml-2 opacity-0 transition-opacity group-hover:opacity-100"
          href={`#${slug}`}
          key={`link-${slug}`}
        >
          #
        </a>
      </>,
    );
  };

  Heading.displayName = `Heading${level}`;
  return Heading;
}

const YouTube = ({ id }: { id: string }) => (
  <div className="my-6 aspect-video w-full">
    <iframe
      allowFullScreen
      className="h-full w-full rounded border"
      src={`https://www.youtube.com/embed/${id}`}
      title="YouTube video"
    />
  </div>
);

const Callout = ({
  type = "info",
  text,
}: {
  type?: "info" | "warning" | "error";
  text: string;
}) => {
  const typeMap = {
    info: "border-blue-500 bg-blue-50 text-blue-800 dark:border-blue-700 dark:bg-blue-200",
    warning:
      "border-yellow-500 bg-yellow-50 text-yellow-800 dark:border-yellow-700 dark:bg-yellow-200",
    error:
      "border-red-500 bg-red-50 text-red-800 dark:border-red-700 dark:bg-red-200",
  };

  return <div className={`my-4 border-l-4 p-4 ${typeMap[type]}`}>{text}</div>;
};

const components = {
  h1: createHeading(1),
  h2: createHeading(2),
  h3: createHeading(3),
  h4: createHeading(4),
  h5: createHeading(5),
  h6: createHeading(6),
  p: ({ children }: { children: React.ReactNode }) => (
    <p className="text-foreground mt-6 text-base leading-7">{children}</p>
  ),
  blockquote: ({ children }: { children: React.ReactNode }) => (
    <blockquote className="text-muted-foreground mt-6 border-l-4 pl-4 italic">
      {children}
    </blockquote>
  ),
  ul: ({ children }: { children: React.ReactNode }) => (
    <ul className="my-6 list-inside list-disc">{children}</ul>
  ),
  ol: ({ children }: { children: React.ReactNode }) => (
    <ol className="my-6 list-inside list-decimal">{children}</ol>
  ),
  inlineCode: ({ children }: { children: React.ReactNode }) => (
    <code className="not-prose bg-muted rounded px-[0.25rem] py-[0.125rem] font-mono text-sm font-semibold whitespace-nowrap">
      {children}
    </code>
  ),
  code: ({
    className,
    children,
  }: {
    className?: string;
    children: string | string[];
  }) => {
    const language = className?.replace("language-", "") || "";
    return (
      <SyntaxHighlighter language={language} PreTag="div" style={tomorrow}>
        {typeof children === "string" ? children.trim() : children.join("")}
      </SyntaxHighlighter>
    );
  },
  Image: RoundedImage,
  img: RoundedImage,
  a: CustomLink,
  Table,
  YouTube,
  Callout,
};

interface CustomMDXProps
  extends Omit<React.ComponentProps<typeof MDXRemote>, "components"> {
  components?: Record<string, React.ComponentType>;
}

export function CustomMDX(props: CustomMDXProps) {
  return (
    <div className="prose prose-neutral dark:prose-invert max-w-none">
      <MDXRemote
        {...props}
        components={{ ...components, ...(props.components || {}) }}
      />
    </div>
  );
}

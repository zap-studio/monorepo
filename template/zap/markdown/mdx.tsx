import { ArrowUpRight } from "lucide-react";
import Image, { type ImageProps } from "next/image";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import React from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { tomorrow } from "react-syntax-highlighter/dist/cjs/styles/prism";

function Table({ data }: { data: { headers: string[]; rows: string[][] } }) {
  const headers = data.headers.map((header) => (
    <th className="border px-4 py-2 text-left" key={`header-${header}`}>
      {header}
    </th>
  ));
  const rows = data.rows.map((row, i) => (
    <tr className="even:bg-muted/40" key={`row-${i}-${row.join("-")}`}>
      {row.map((cell, j) => (
        <td className="border px-4 py-2" key={`cell-${i}-${j}-${cell}`}>
          {cell}
        </td>
      ))}
    </tr>
  ));

  return (
    <div className="mt-6 overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead className="bg-muted">
          {headers.length > 0 && <tr>{headers}</tr>}
        </thead>
        <tbody>{rows}</tbody>
      </table>
    </div>
  );
}

type CustomLinkProps = {
  href: string;
  children: React.ReactNode;
  className?: string;
  [key: string]: unknown;
};

function CustomLink(props: CustomLinkProps) {
  const { href, children, ...restProps } = props;

  if (href.startsWith("/")) {
    return (
      <Link
        href={{ pathname: href }}
        {...restProps}
        className="text-primary hover:underline active:underline"
      >
        {children}
      </Link>
    );
  }

  if (href.startsWith("#")) {
    return (
      <a
        href={href}
        {...restProps}
        className="text-primary hover:underline active:underline"
      >
        {children}
      </a>
    );
  }

  return (
    <a
      aria-label={`${children} (opens in a new tab)`}
      className="inline-flex items-center gap-1 text-primary hover:underline focus-visible:outline-none active:underline"
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
      className="rounded-lg border border-muted shadow-md"
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
          className="anchor ml-2 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 group-active:opacity-100"
          href={`#${slug}`}
          key={`link-${slug}`}
        >
          #
        </a>
      </>
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

const InlineCode = ({ children }: { children: React.ReactNode }) => (
  <code className="not-prose whitespace-nowrap rounded bg-muted px-[0.25rem] py-[0.125rem] font-mono font-semibold text-sm">
    {children}
  </code>
);

const Paragraph = ({ children }: { children: React.ReactNode }) => (
  <p className="mt-6 text-base text-foreground leading-7">{children}</p>
);

const Blockquote = ({ children }: { children: React.ReactNode }) => (
  <blockquote className="mt-6 border-l-4 pl-4 text-muted-foreground italic">
    {children}
  </blockquote>
);

const UnorderedList = ({ children }: { children: React.ReactNode }) => (
  <ul className="my-6 list-inside list-disc">{children}</ul>
);

const OrderedList = ({ children }: { children: React.ReactNode }) => (
  <ol className="my-6 list-inside list-decimal">{children}</ol>
);

const ListItem = ({ children }: { children: React.ReactNode }) => (
  <li className="mt-2">{children}</li>
);

const CodeBlock = ({ children }: { children: React.ReactNode }) => (
  <div className="my-6 rounded-lg border border-muted bg-muted p-4">
    {children}
  </div>
);

const Code = ({
  children,
  className,
  ...props
}: {
  children: string | string[];
  className?: string;
}) => {
  const language = className?.replace("language-", "") || "";
  const isBlock = !!className;

  if (isBlock) {
    return (
      <SyntaxHighlighter language={language} PreTag="div" style={tomorrow}>
        {typeof children === "string" ? children.trim() : children.join("")}
      </SyntaxHighlighter>
    );
  }

  return <InlineCode {...props}>{children}</InlineCode>;
};

const MAX_HEADING_LEVEL = 6;

const headingComponentMap = Array.from(
  { length: MAX_HEADING_LEVEL },
  (_, i) => i + 1
).reduce<Record<string, ReturnType<typeof createHeading>>>((acc, level) => {
  acc[`h${level}`] = createHeading(level);
  return acc;
}, {});

const components = {
  ...headingComponentMap,
  p: Paragraph,
  blockquote: Blockquote,
  ul: UnorderedList,
  ol: OrderedList,
  li: ListItem,
  inlineCode: InlineCode,
  codeBlock: CodeBlock,
  code: Code,
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

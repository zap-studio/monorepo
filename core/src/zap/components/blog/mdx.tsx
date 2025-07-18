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
    <th key={index}>{header}</th>
  ));
  const rows = data.rows.map((row, index) => (
    <tr key={index}>
      {row.map((cell, cellIndex) => (
        <td key={cellIndex}>{cell}</td>
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
    return <a {...restProps} />;
  }

  return <a target="_blank" rel="noopener noreferrer" {...restProps} />;
}

interface RoundedImageProps extends ImageProps {
  alt: string;
}

function RoundedImage(props: RoundedImageProps) {
  const { alt, ...restProps } = props;
  return <Image alt={alt} className="rounded-lg" {...restProps} />;
}

interface CodeProps {
  children: string;
}

function Code({ children, ...props }: CodeProps) {
  const codeHTML = highlight(children);
  return <code dangerouslySetInnerHTML={{ __html: codeHTML }} {...props} />;
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
    return React.createElement(
      `h${level}`,
      { id: slug },
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
  Image: RoundedImage,
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

import { highlight } from "fumadocs-core/highlight";
import { CodeBlock, Pre } from "fumadocs-ui/components/codeblock";
import Link from "next/link";
import { Fragment, type ReactNode } from "react";
import type { PackageChangelog } from "@/lib/changelog";
import { gitConfig } from "@/lib/layout.shared";

const SECTION_HEADING_PREFIX_REGEX = /^###\s+/;
const BULLET_LINE_REGEX = /^(\s*)-\s+(.*)$/;
const BULLET_PREFIX_REGEX = /^(\s*)-\s+/;
const FENCE_PREFIX_REGEX = /^```/;
const INLINE_CODE_SPLIT_REGEX = /(`[^`]+`)/g;
const INLINE_CODE_REGEX = /^`[^`]+`$/;
const COMMIT_HASH_SPLIT_REGEX = /([a-f0-9]{7,40})/gi;
const COMMIT_HASH_REGEX = /^[a-f0-9]{7,40}$/i;

export function ChangelogContent({
  allPackages,
  current,
}: {
  allPackages: PackageChangelog[];
  current: PackageChangelog;
}): ReactNode {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-6 py-8 sm:py-10">
      <div className="space-y-4">
        <nav
          aria-label="Package changelogs"
          className="flex flex-wrap items-center gap-2"
        >
          {allPackages.map((entry) => (
            <Link
              className={`rounded-full border px-3 py-1.5 font-mono text-xs transition-colors ${
                entry.slug === current.slug
                  ? "border-fd-primary/30 bg-fd-primary/10 text-fd-primary"
                  : "border-fd-border bg-fd-background text-fd-muted-foreground hover:border-fd-primary/30 hover:text-fd-foreground"
              }`}
              href={`/changelogs/${entry.slug}`}
              key={entry.slug}
            >
              {entry.packageName}
            </Link>
          ))}
        </nav>
      </div>

      <section className="space-y-12">
        {current.versions.length > 0 ? (
          current.versions.map((version) => (
            <article
              className="space-y-5 border-fd-border border-t pt-8 first:border-t-0 first:pt-0"
              key={version.version}
            >
              <div className="flex flex-wrap items-baseline gap-2">
                <h2 className="font-serif text-2xl text-fd-foreground leading-none sm:text-3xl">
                  v{version.version}
                </h2>
                {version.releaseDate ? (
                  <time
                    className="font-mono text-[11px] text-fd-muted-foreground/80 sm:text-xs"
                    dateTime={version.releaseDate}
                    title={new Date(version.releaseDate).toLocaleString()}
                  >
                    {formatRelativeTime(version.releaseDate)}
                  </time>
                ) : null}
              </div>
              <MarkdownContent markdown={version.rawMarkdown} />
            </article>
          ))
        ) : (
          <article className="space-y-3">
            <p className="text-fd-muted-foreground text-sm leading-6">
              No parsed versions were found. Showing raw changelog:
            </p>
            <pre className="overflow-x-auto whitespace-pre-wrap border-fd-border border-l-2 pl-4 font-mono text-xs leading-5 sm:text-sm">
              {current.rawMarkdown}
            </pre>
          </article>
        )}
      </section>
    </main>
  );
}

function MarkdownContent({ markdown }: { markdown: string }): ReactNode {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const blocks: ReactNode[] = [];
  let index = 0;

  while (index < lines.length) {
    const currentLine = lines[index];
    const trimmedLine = currentLine.trim();

    if (!trimmedLine) {
      index += 1;
      continue;
    }

    if (trimmedLine.startsWith("```")) {
      const language = extractFenceLanguage(trimmedLine);
      const [code, nextIndex] = readCodeFence(lines, index + 1);
      index = nextIndex;

      blocks.push(
        <HighlightedCodeBlock
          code={code}
          key={`code-${blocks.length + 1}`}
          language={language}
        />
      );
      continue;
    }

    if (trimmedLine.startsWith("### ")) {
      blocks.push(
        <h3
          className="pt-5 font-mono text-fd-muted-foreground text-xs uppercase tracking-[0.14em] first:pt-0"
          key={`h3-${blocks.length + 1}`}
        >
          {trimmedLine.replace(SECTION_HEADING_PREFIX_REGEX, "")}
        </h3>
      );
      index += 1;
      continue;
    }

    const bulletMatch = currentLine.match(BULLET_LINE_REGEX);
    if (bulletMatch) {
      const [listItems, nextIndex] = parseList(
        lines,
        index,
        bulletMatch[1].length
      );
      index = nextIndex;
      blocks.push(
        <ListBlock items={listItems} key={`ul-${blocks.length + 1}`} />
      );
      continue;
    }

    const paragraphLines: string[] = [];
    while (
      index < lines.length &&
      lines[index].trim() &&
      !lines[index].trim().startsWith("### ") &&
      !BULLET_PREFIX_REGEX.test(lines[index]) &&
      !lines[index].trim().startsWith("```")
    ) {
      paragraphLines.push(lines[index]);
      index += 1;
    }

    blocks.push(
      <p
        className="text-[15px] text-fd-foreground/95 leading-7 sm:text-base"
        key={`p-${blocks.length + 1}`}
      >
        <InlineMarkdown text={paragraphLines.join(" ")} />
      </p>
    );
  }

  return <div className="space-y-4 text-fd-foreground">{blocks}</div>;
}

interface ParsedCodeBlock {
  code: string;
  language: string | null;
}

interface ParsedListItem {
  codeBlocks: ParsedCodeBlock[];
  subItems: ParsedListItem[];
  text: string;
}

function parseList(
  lines: string[],
  startIndex: number,
  indent: number
): [ParsedListItem[], number] {
  const items: ParsedListItem[] = [];
  let index = startIndex;

  while (index < lines.length) {
    const match = lines[index].match(BULLET_LINE_REGEX);
    if (!match) {
      break;
    }

    const currentIndent = match[1].length;
    if (currentIndent !== indent) {
      break;
    }

    const [item, nextIndex] = parseListItem(lines, index, indent, match[2]);
    items.push(item);
    index = nextIndex;
  }

  return [items, index];
}

function parseListItem(
  lines: string[],
  startIndex: number,
  indent: number,
  firstText: string
): [ParsedListItem, number] {
  let text = firstText.trim();
  const subItems: ParsedListItem[] = [];
  const codeBlocks: ParsedCodeBlock[] = [];
  let index = startIndex + 1;

  while (index < lines.length) {
    const line = lines[index];
    const trimmed = line.trim();

    if (!trimmed) {
      index += 1;
      continue;
    }

    if (trimmed.startsWith("### ")) {
      break;
    }

    const bulletMatch = line.match(BULLET_LINE_REGEX);
    if (bulletMatch) {
      const nestedIndent = bulletMatch[1].length;
      if (nestedIndent <= indent) {
        break;
      }

      const [nestedItems, nextIndex] = parseList(lines, index, nestedIndent);
      subItems.push(...nestedItems);
      index = nextIndex;
      continue;
    }

    if (trimmed.startsWith("```")) {
      const language = extractFenceLanguage(trimmed);
      const [code, nextIndex] = readCodeFence(lines, index + 1);
      codeBlocks.push({ code, language });
      index = nextIndex;
      continue;
    }

    text = `${text} ${trimmed}`;
    index += 1;
  }

  return [
    {
      text: text.trim(),
      subItems,
      codeBlocks,
    },
    index,
  ];
}

function readCodeFence(lines: string[], startIndex: number): [string, number] {
  const codeLines: string[] = [];
  let index = startIndex;

  while (index < lines.length && !lines[index].trim().startsWith("```")) {
    codeLines.push(lines[index]);
    index += 1;
  }

  if (index < lines.length && lines[index].trim().startsWith("```")) {
    index += 1;
  }

  return [codeLines.join("\n"), index];
}

function ListBlock({
  items,
  nested = false,
}: {
  items: ParsedListItem[];
  nested?: boolean;
}): ReactNode {
  const keyedItems = toKeyedEntries(items, (item) =>
    JSON.stringify({
      text: item.text,
      codeBlocks: item.codeBlocks,
      subItemCount: item.subItems.length,
    })
  );

  return (
    <ul
      className={
        nested
          ? "mt-2 space-y-1.5 text-sm leading-7"
          : "space-y-2 text-sm leading-7"
      }
    >
      {keyedItems.map(({ key, value: item }) => (
        <li className="pl-5" key={key}>
          <span className="mr-2 -ml-5 inline-block text-fd-muted-foreground">
            -
          </span>
          <InlineMarkdown text={item.text} />
          {toKeyedEntries(
            item.codeBlocks,
            (codeBlock) => `${codeBlock.language ?? "text"}:${codeBlock.code}`
          ).map(({ key: codeKey, value: codeBlock }) => (
            <HighlightedCodeBlock
              code={codeBlock.code}
              key={codeKey}
              language={codeBlock.language}
              nested
            />
          ))}
          {item.subItems.length > 0 ? (
            <ListBlock items={item.subItems} nested />
          ) : null}
        </li>
      ))}
    </ul>
  );
}

function extractFenceLanguage(openingFenceLine: string): string | null {
  const lang = openingFenceLine.replace(FENCE_PREFIX_REGEX, "").trim();
  return lang.length > 0 ? lang : null;
}

async function HighlightedCodeBlock({
  code,
  language,
  nested = false,
}: {
  code: string;
  language: string | null;
  nested?: boolean;
}): Promise<ReactNode> {
  const highlighted = await highlight(code, {
    lang: normalizeLanguage(language) as never,
    themes: {
      dark: "github-dark",
      light: "github-light",
    },
    components: {
      pre: (props) => (
        <CodeBlock
          {...props}
          allowCopy
          className={`${nested ? "mt-2" : ""} border border-fd-border bg-fd-card/40 shadow-none`}
          keepBackground
        >
          <Pre {...props} />
        </CodeBlock>
      ),
    },
  });

  return highlighted;
}

function normalizeLanguage(language: string | null): string {
  if (!language) {
    return "text";
  }

  const normalized = language.toLowerCase();

  if (normalized === "typescript") {
    return "ts";
  }

  if (normalized === "javascript") {
    return "js";
  }

  if (normalized === "shell") {
    return "bash";
  }

  if (normalized === "yml") {
    return "yaml";
  }

  return normalized;
}

function InlineMarkdown({ text }: { text: string }): ReactNode {
  const codeParts = text.split(INLINE_CODE_SPLIT_REGEX).filter(Boolean);

  return toKeyedEntries(codeParts, (part) => part).map(
    ({ key, value: part }) => {
      if (INLINE_CODE_REGEX.test(part)) {
        return (
          <code
            className="rounded bg-fd-accent px-1.5 py-0.5 font-mono text-[0.9em]"
            key={key}
          >
            {part.slice(1, -1)}
          </code>
        );
      }

      const tokens = part.split(COMMIT_HASH_SPLIT_REGEX).filter(Boolean);

      return (
        <Fragment key={key}>
          {toKeyedEntries(tokens, (token) => token).map(
            ({ key: tokenKey, value: token }) => {
              if (COMMIT_HASH_REGEX.test(token)) {
                return (
                  <Link
                    className="font-mono text-fd-primary underline underline-offset-2 hover:opacity-80"
                    href={`https://github.com/${gitConfig.user}/${gitConfig.repo}/commit/${token}`}
                    key={`hash-${tokenKey}`}
                    rel="noreferrer noopener"
                    target="_blank"
                  >
                    {token}
                  </Link>
                );
              }

              return <Fragment key={`token-${tokenKey}`}>{token}</Fragment>;
            }
          )}
        </Fragment>
      );
    }
  );
}

function toKeyedEntries<T>(
  values: T[],
  getBaseKey: (value: T) => string
): Array<{ key: string; value: T }> {
  const counts = new Map<string, number>();

  return values.map((value) => {
    const base = getBaseKey(value) || "entry";
    const count = counts.get(base) ?? 0;
    counts.set(base, count + 1);

    return {
      key: `${base}-${count + 1}`,
      value,
    };
  });
}

function formatRelativeTime(isoDate: string): string {
  const target = new Date(isoDate).getTime();
  if (Number.isNaN(target)) {
    return "";
  }

  const now = Date.now();
  const diffMs = target - now;
  const minutes = Math.round(diffMs / (1000 * 60));
  const hours = Math.round(diffMs / (1000 * 60 * 60));
  const days = Math.round(diffMs / (1000 * 60 * 60 * 24));
  const months = Math.round(diffMs / (1000 * 60 * 60 * 24 * 30));
  const years = Math.round(diffMs / (1000 * 60 * 60 * 24 * 365));

  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  if (Math.abs(minutes) < 60) {
    return rtf.format(minutes, "minute");
  }

  if (Math.abs(hours) < 24) {
    return rtf.format(hours, "hour");
  }

  if (Math.abs(days) < 30) {
    return rtf.format(days, "day");
  }

  if (Math.abs(months) < 12) {
    return rtf.format(months, "month");
  }

  return rtf.format(years, "year");
}

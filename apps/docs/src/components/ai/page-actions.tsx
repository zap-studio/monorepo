import { buttonVariants } from "fumadocs-ui/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "fumadocs-ui/components/ui/popover";
import { useCopyButton } from "fumadocs-ui/utils/use-copy-button";
import {
  Check,
  ChevronDown,
  Copy,
  ExternalLinkIcon,
  TextIcon,
} from "lucide-react";
import { useMemo, useState } from "react";

import { cn } from "@/lib/cn";
import { getExternalLinkProps } from "@/lib/utils/links";

const cache = new Map<string, string>();

export const LLMCopyButton = ({
  /**
   * A URL to fetch the raw Markdown/MDX content of page
   */
  markdownUrl,
}: {
  markdownUrl: string;
}) => {
  const [isLoading, setLoading] = useState(false);
  const [checked, onClick] = useCopyButton(async () => {
    const cached = cache.get(markdownUrl);
    if (cached !== undefined) {
      await navigator.clipboard.writeText(cached);
      return;
    }

    setLoading(true);

    try {
      await navigator.clipboard.write([
        new ClipboardItem({
          "text/plain": fetch(markdownUrl).then(async (res) => {
            const content = await res.text();
            cache.set(markdownUrl, content);

            return content;
          }),
        }),
      ]);
    } finally {
      setLoading(false);
    }
  });

  return (
    <button
      className={cn(
        buttonVariants({
          className: "gap-2 [&_svg]:size-3.5 [&_svg]:text-fd-muted-foreground",
          color: "secondary",
          size: "sm",
        })
      )}
      disabled={isLoading}
      onClick={onClick}
      type="button"
    >
      {checked ? <Check /> : <Copy />}
      Copy Markdown
    </button>
  );
};

export const ViewOptions = ({
  markdownUrl,
  githubUrl,
}: {
  /**
   * A URL to the raw Markdown/MDX content of page
   */
  markdownUrl: string;

  /**
   * Source file URL on GitHub
   */
  githubUrl: string;
}) => {
  const items = useMemo(() => {
    const pageUrl =
      typeof window === "undefined" ? "loading" : window.location.href;
    const q = `Read ${pageUrl}, I want to ask questions about it.`;

    return [
      {
        href: githubUrl,
        icon: (
          <svg fill="currentColor" viewBox="0 0 24 24">
            <title>GitHub</title>
            <path d="M12 0.3c-6.63 0-12 5.37-12 12 0 5.3 3.44 9.8 8.21 11.38.6.11.82-0.26.82-0.58 0-0.28-.01-1.04-0.01-2.04-3.34.72-4.04-1.61-4.04-1.61C4.42 18.07 3.63 17.7 3.63 17.7c-1.09-0.74.08-0.73.08-0.73 1.21.08 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.6.11-0.78.42-1.3.76-1.6-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.46-2.38 1.24-3.22-0.14-0.3-.54-1.52.1-3.18 0 0 1-0.32 3.3 1.23.96-0.27 1.98-0.4 3-0.41 1.2.01 2.4.14 3 0.41 2.28-1.55 3.29-1.23 3.29-1.23.64 1.65.24 2.87.12 3.18.77.84 1.23 1.91 1.23 3.22 0 4.61-2.81 5.62-5.47 5.92.42.36.81 1.1.81 2.22 0 1.61-0.01 2.9-0.01 3.29 0 0.32.21.69.83.57C20.57 22.09 24 17.59 24 12.3c0-6.63-5.37-12-12-12" />
          </svg>
        ),
        title: "Open in GitHub",
      },
      {
        href: markdownUrl,
        icon: <TextIcon />,
        title: "View as Markdown",
      },
      {
        href: `https://scira.ai/?${new URLSearchParams({
          q,
        })}`,
        icon: (
          <svg
            fill="none"
            height="934"
            viewBox="0 0 910 934"
            width="910"
            xmlns="http://www.w3.org/2000/svg"
          >
            <title>Scira AI</title>
            <path
              d="M647.66 197.78C569.13 189.05 525.5 145.42 516.77 66.88C508.05 145.42 464.42 189.05 385.88 197.78C464.42 206.5 508.05 250.13 516.77 328.67C525.5 250.13 569.13 206.5 647.66 197.78Z"
              fill="currentColor"
              stroke="currentColor"
              strokeLinejoin="round"
              strokeWidth="8"
            />
            <path
              d="M516.77 304.22C510.3 275.49 498.21 252.09 480.33 234.21C462.46 216.34 439.06 204.25 410.33 197.78C439.06 191.3 462.46 179.21 480.33 161.34C498.21 143.46 510.3 120.06 516.77 91.33C523.25 120.06 535.34 143.46 553.21 161.34C571.09 179.21 594.49 191.3 623.22 197.78C594.49 204.25 571.09 216.34 553.21 234.21C535.34 252.09 523.25 275.49 516.77 304.22Z"
              fill="currentColor"
              stroke="currentColor"
              strokeLinejoin="round"
              strokeWidth="8"
            />
            <path
              d="M857.5 508.12C763.26 497.64 710.9 445.29 700.43 351.05C689.96 445.29 637.61 497.64 543.36 508.12C637.61 518.59 689.96 570.94 700.43 665.18C710.9 570.94 763.26 518.59 857.5 508.12Z"
              stroke="currentColor"
              strokeLinejoin="round"
              strokeWidth="20"
            />
            <path
              d="M700.43 615.96C691.85 589.05 678.58 566.36 660.38 548.16C642.19 529.97 619.5 516.7 592.59 508.12C619.5 499.53 642.19 486.26 660.38 468.07C678.58 449.87 691.85 427.18 700.43 400.27C709.01 427.18 722.29 449.87 740.48 468.07C758.67 486.26 781.37 499.53 808.27 508.12C781.37 516.7 758.67 529.97 740.48 548.16C722.29 566.36 709.01 589.05 700.43 615.96Z"
              stroke="currentColor"
              strokeLinejoin="round"
              strokeWidth="20"
            />
            <path
              d="M889.95 121.24C831.05 114.69 798.33 81.97 791.78 23.07C785.24 81.97 752.51 114.69 693.61 121.24C752.51 127.78 785.24 160.5 791.78 219.4C798.33 160.5 831.05 127.78 889.95 121.24Z"
              fill="currentColor"
              stroke="currentColor"
              strokeLinejoin="round"
              strokeWidth="8"
            />
            <path
              d="M791.78 196.79C786.7 176.94 777.87 160.57 765.16 147.86C752.45 135.15 736.08 126.32 716.23 121.24C736.08 116.15 752.45 107.32 765.16 94.62C777.87 81.91 786.7 65.54 791.78 45.68C796.87 65.54 805.7 81.91 818.4 94.62C831.11 107.32 847.48 116.15 867.34 121.24C847.48 126.32 831.11 135.15 818.4 147.86C805.69 160.57 796.87 176.94 791.78 196.79Z"
              fill="currentColor"
              stroke="currentColor"
              strokeLinejoin="round"
              strokeWidth="8"
            />
            <path
              d="M760.63 764.34C720.72 814.62 669.84 855.1 611.87 882.69C553.91 910.28 490.4 924.25 426.21 923.53C362.02 922.81 298.85 907.42 241.52 878.53C184.19 849.64 134.23 808.03 95.45 756.86C56.68 705.7 30.12 646.35 17.81 583.34C5.5 520.34 7.76 455.35 24.43 393.36C41.09 331.36 71.71 274 113.95 225.66C156.18 177.31 208.92 139.27 268.12 114.44"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="30"
            />
          </svg>
        ),
        title: "Open in Scira AI",
      },
      {
        href: `https://chatgpt.com/?${new URLSearchParams({
          hints: "search",
          q,
        })}`,
        icon: (
          <svg
            fill="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <title>OpenAI</title>
            <path d="M22.28 9.82a5.98 5.98 0 0 0-0.52-4.91 6.05 6.05 0 0 0-6.51-2.9A6.07 6.07 0 0 0 4.98 4.18a5.98 5.98 0 0 0-4 2.9 6.05 6.05 0 0 0 0.74 7.1 5.98 5.98 0 0 0 0.51 4.91 6.05 6.05 0 0 0 6.51 2.9A5.98 5.98 0 0 0 13.26 24a6.06 6.06 0 0 0 5.77-4.21 5.99 5.99 0 0 0 4-2.9 6.06 6.06 0 0 0-0.75-7.07zm-9.02 12.61a4.48 4.48 0 0 1-2.88-1.04l0.14-0.08 4.78-2.76a0.79.79 0 0 0 0.39-0.68v-6.74l2.02 1.17a.71.07 0 0 1 .38.05v5.58a4.5 4.5 0 0 1-4.49 4.49zm-9.66-4.13a4.47 4.47 0 0 1-0.53-3.01l0.14.09 4.78 2.76a0.77.77 0 0 0 0.78 0l5.84-3.37v2.33a0.8.08 0 0 1-0.33.06L9.74 19.95a4.5 4.5 0 0 1-6.14-1.65zM2.34 7.9a4.49 4.49 0 0 1 2.37-1.97V11.6a0.77.77 0 0 0 0.39.68l5.81 3.35-2.02 1.17a0.76.08 0 0 1-0.07 0l-4.83-2.79A4.5 4.5 0 0 1 2.34 7.87zm16.6 3.86L13.1 8.36 15.12 7.2a0.76.08 0 0 1 0.07 0l4.83 2.79a4.49 4.49 0 0 1-0.68 8.1v-5.68a.79.79 0 0 0-0.41-0.67zm2.01-3.02l-0.14-0.09-4.77-2.78a0.78.78 0 0 0-0.79 0L9.41 9.23V6.9a0.66.07 0 0 1 0.03-0.06l4.83-2.79a4.5 4.5 0 0 1 6.68 4.66zM8.31 12.86l-2.02-1.16a0.8.08 0 0 1-0.04-0.06V6.07a4.5 4.5 0 0 1 7.38-3.45l-0.14.08L8.7 5.46a0.79.79 0 0 0-0.39.68zm1.1-2.37l2.6-1.5 2.61 1.5v3l-2.6 1.5-2.61-1.5Z" />
          </svg>
        ),
        title: "Open in ChatGPT",
      },
      {
        href: `https://claude.ai/new?${new URLSearchParams({
          q,
        })}`,
        icon: (
          <svg
            fill="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <title>Anthropic</title>
            <path d="M17.3 3.54h-3.67l6.7 16.92H24Zm-10.61 0L0 20.46h3.74l1.37-3.55h7.01l1.37 3.55h3.74L10.54 3.54Zm-0.37 10.22 2.29-5.95 2.29 5.95Z" />
          </svg>
        ),
        title: "Open in Claude",
      },
      {
        href: `https://cursor.com/link/prompt?${new URLSearchParams({
          text: q,
        })}`,
        icon: (
          <svg
            fill="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <title>Cursor</title>
            <path d="M11.5.13 1.89 5.68a.84.84 0 0 0-.42.73v11.19c0 .3.16.57.42.72l9.61 5.55a1 1 0 0 0 1 0l9.61-5.55a.84.84 0 0 0 .42-0.72V6.4a.84.84 0 0 0-.42-0.73L12.5.13a1.01 1.01 0 0 0-1 0M2.66 6.34h18.55c0.26 0 .43.29.3.51L12.23 22.92c-.62.11-0.23.06-0.23-.06V12.34a.59.59 0 0 0-0.29-.51l-9.11-5.26c-0.11-0.06-0.06-.23.06-.23" />
          </svg>
        ),
        title: "Open in Cursor",
      },
    ];
  }, [githubUrl, markdownUrl]);

  return (
    <Popover>
      <PopoverTrigger
        className={cn(
          buttonVariants({
            className: "gap-2",
            color: "secondary",
            size: "sm",
          })
        )}
      >
        Open
        <ChevronDown className="size-3.5 text-fd-muted-foreground" />
      </PopoverTrigger>
      <PopoverContent className="flex flex-col">
        {items.map((item) => (
          <a
            className="inline-flex items-center gap-2 rounded-lg p-2 text-sm hover:bg-fd-accent hover:text-fd-accent-foreground [&_svg]:size-4"
            href={item.href}
            key={item.href}
            {...getExternalLinkProps(item.href)}
          >
            {item.icon}
            {item.title}
            <ExternalLinkIcon className="ms-auto size-3.5 text-fd-muted-foreground" />
          </a>
        ))}
      </PopoverContent>
    </Popover>
  );
};

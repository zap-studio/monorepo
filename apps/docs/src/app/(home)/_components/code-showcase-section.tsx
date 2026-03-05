"use client";

import { GlobeIcon, ShieldCheckIcon } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";

import { FadeIn, StaggerContainer, StaggerItem } from "./animated";

export function CodeShowcaseSection(): ReactNode {
  return (
    <section className="relative overflow-hidden py-16 sm:py-24 md:py-32">
      <FadeIn delay={0} duration={0.6} y={16}>
        <div className="mx-auto mb-10 max-w-2xl px-6 text-center sm:mb-16">
          <p className="mb-4 font-mono text-fd-muted-foreground text-xs uppercase leading-5 tracking-widest">
            Developer experience
          </p>

          <h2 className="font-serif text-3xl leading-[1.12] sm:text-4xl md:text-5xl">
            Clean APIs, <br className="hidden sm:block" />
            powerful results
          </h2>

          <p className="mt-4 text-base text-fd-muted-foreground leading-7 sm:mt-5 sm:text-lg md:text-xl md:leading-8">
            Intuitive, type-safe APIs that make you productive from day one.
          </p>
        </div>
      </FadeIn>

      <div className="mx-auto max-w-7xl px-6">
        <div className="md:hidden">
          <FadeIn delay={0.15} duration={0.5} y={12}>
            <MobileCodeTabs />
          </FadeIn>
        </div>

        <StaggerContainer
          className="hidden gap-6 md:grid md:grid-cols-2"
          delay={0.15}
          stagger={0.12}
        >
          <StaggerItem className="flex w-full min-w-0">
            <CodeBlock
              filename="fetch.ts"
              icon={<GlobeIcon className="size-3.5" />}
            >
              <FetchExample />
            </CodeBlock>
          </StaggerItem>

          <StaggerItem className="flex w-full min-w-0">
            <CodeBlock
              filename="permit.ts"
              icon={<ShieldCheckIcon className="size-3.5" />}
            >
              <PermitExample />
            </CodeBlock>
          </StaggerItem>
        </StaggerContainer>
      </div>

      <FadeIn delay={0.5} duration={0.6} y={0}>
        <div className="mx-auto mt-12 flex items-center justify-center gap-3 px-6">
          <div
            aria-hidden="true"
            className="h-px w-12 bg-linear-to-r from-transparent to-fd-border"
          />
          <p className="font-mono text-[11px] text-fd-muted-foreground/50 uppercase leading-5 tracking-widest">
            Full IntelliSense support
          </p>
          <div
            aria-hidden="true"
            className="h-px w-12 bg-linear-to-l from-transparent to-fd-border"
          />
        </div>
      </FadeIn>
    </section>
  );
}

const tabs = [
  {
    id: "fetch",
    filename: "fetch.ts",
    icon: <GlobeIcon className="size-3.5" />,
    content: <FetchExample />,
  },
  {
    id: "permit",
    filename: "permit.ts",
    icon: <ShieldCheckIcon className="size-3.5" />,
    content: <PermitExample />,
  },
] as const;

function MobileCodeTabs(): ReactNode {
  const [active, setActive] = useState<"fetch" | "permit">("fetch");
  const current = tabs.find((t) => t.id === active) ?? tabs[0];

  return (
    <div className="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-fd-border bg-fd-card">
      <div className="flex shrink-0 border-fd-border border-b">
        {tabs.map((tab) => (
          <button
            className={[
              "flex flex-1 items-center justify-center gap-2 px-4 py-3 font-mono text-xs leading-5 tracking-wide transition-colors duration-200",
              active === tab.id
                ? "border-fd-primary border-b-2 text-fd-primary"
                : "text-fd-muted-foreground hover:text-fd-foreground",
            ].join(" ")}
            key={tab.id}
            onClick={() => setActive(tab.id)}
            type="button"
          >
            {tab.icon}
            {tab.filename}
          </button>
        ))}
      </div>
      <div className="px-4 py-4">
        <pre className="overflow-x-auto font-mono text-[12px] leading-[1.75]">
          {current.content}
        </pre>
      </div>
    </div>
  );
}

function FetchExample(): ReactNode {
  return (
    <code>
      <L>
        <Kw>import</Kw>
        {" { "}
        <Fn>$fetch</Fn>
        {" } "}
        <Kw>from</Kw> <Str>'@zap-studio/fetch'</Str>
        {";"}
      </L>
      <L>
        <Kw>import</Kw>
        {" { "}
        <Fn>UserSchema</Fn>
        {" } "}
        <Kw>from</Kw> <Str>'./schemas'</Str>
        {";"}
      </L>
      <L />
      <L>
        <Cm>{"// validated & typed — throws on error"}</Cm>
      </L>
      <L>
        <Kw>const</Kw>
        {" user = "}
        <Kw>await</Kw> <Fn>$fetch</Fn>
        {"("}
        <Str>'/api/users/1'</Str>
        {","}
      </L>
      <L>
        {"  "}
        <Fn>UserSchema</Fn>
        {","}
      </L>
      <L>
        {"  { method: "}
        <Str>'GET'</Str>
        {" });"}
      </L>
      <L />
      <L>
        <Cm>{"// user is fully typed ✓"}</Cm>
      </L>
      <L>
        <Fn>console</Fn>
        {"."}
        <Fn>log</Fn>
        {"(user."}
        <Fn>id</Fn>
        {", user."}
        <Fn>name</Fn>
        {");"}
      </L>
      <L />
      <L>
        <Cm>{"// or use api.get() shorthand"}</Cm>
      </L>
      <L>
        <Kw>import</Kw>
        {" { "}
        <Fn>api</Fn>
        {" } "}
        <Kw>from</Kw> <Str>'@zap-studio/fetch'</Str>
        {";"}
      </L>
      <L>
        <Kw>const</Kw>
        {" user = "}
        <Kw>await</Kw> <Fn>api</Fn>
        {"."}
        <Fn>get</Fn>
        {"("}
        <Str>'/api/users/1'</Str>
        {", "}
        <Fn>UserSchema</Fn>
        {");"}
      </L>
    </code>
  );
}

function PermitExample(): ReactNode {
  return (
    <code>
      <L>
        <Kw>import</Kw>
        {" { "}
        <Fn>createPolicy</Fn>
        {", "}
        <Fn>allow</Fn>
        {", "}
        <Fn>when</Fn>
        {" } "}
        <Kw>from</Kw> <Str>'@zap-studio/permit'</Str>
        {";"}
      </L>
      <L />
      <L>
        <Kw>const</Kw>
        {" policy = "}
        <Fn>createPolicy</Fn>
        {"<"}
        <Fn>AppContext</Fn>
        {">({"}
      </L>
      <L>
        {"  resources: { post: "}
        <Fn>PostSchema</Fn>
        {" },"}
      </L>
      <L>
        {"  actions: { post: ["}
        <Str>'read'</Str>
        {", "}
        <Str>'write'</Str>
        {"] },"}
      </L>
      <L>{"  rules: {"}</L>
      <L>{"    post: {"}</L>
      <L>
        {"      read:  "}
        <Fn>allow</Fn>
        {"(),"}
      </L>
      <L>
        {"      write: "}
        <Fn>when</Fn>
        {"("}
      </L>
      <L>
        {"        (ctx, _, post) => ctx."}
        <Fn>userId</Fn>
        {" === post."}
        <Fn>authorId</Fn>
      </L>
      <L>{"      ),"}</L>
      <L>{"    },"}</L>
      <L>{"  },"}</L>
      <L>{"});"}</L>
      <L />
      <L>
        <Cm>{"// type-safe permission check ✓"}</Cm>
      </L>
      <L>
        <Fn>policy</Fn>
        {"."}
        <Fn>can</Fn>
        {"(ctx, "}
        <Str>'write'</Str>
        {", "}
        <Str>'post'</Str>
        {", post);"}
      </L>
    </code>
  );
}

interface CodeBlockProps {
  children: ReactNode;
  filename: string;
  icon: ReactNode;
}

function CodeBlock({ icon, filename, children }: CodeBlockProps): ReactNode {
  return (
    <div className="group flex h-full w-full min-w-0 flex-col overflow-hidden rounded-2xl border border-fd-border bg-fd-card transition-all duration-300 hover:border-fd-primary/20 hover:shadow-fd-primary/3 hover:shadow-lg">
      <div className="flex shrink-0 items-center gap-2 border-fd-border border-b px-4 py-3 sm:px-5 sm:py-3.5">
        <span className="text-fd-muted-foreground transition-colors duration-300 group-hover:text-fd-primary/70">
          {icon}
        </span>
        <span className="font-mono text-fd-muted-foreground text-xs leading-5 tracking-wide">
          {filename}
        </span>
      </div>
      <div className="flex-1 px-4 py-4 sm:px-5 sm:py-5">
        <pre className="overflow-x-auto font-mono text-[12px] leading-[1.75] sm:text-[13px]">
          {children}
        </pre>
      </div>
    </div>
  );
}

function L({ children }: { children?: ReactNode }): ReactNode {
  return (
    <>
      {children ?? ""}
      {"\n"}
    </>
  );
}

function Kw({ children }: { children: ReactNode }): ReactNode {
  return (
    <span className="text-purple-600 dark:text-purple-400">{children}</span>
  );
}

function Str({ children }: { children: ReactNode }): ReactNode {
  return <span className="text-amber-600 dark:text-amber-300">{children}</span>;
}

function Cm({ children }: { children: ReactNode }): ReactNode {
  return <span className="text-fd-muted-foreground/50">{children}</span>;
}

function Fn({ children }: { children: ReactNode }): ReactNode {
  return <span className="text-sky-600 dark:text-sky-400">{children}</span>;
}

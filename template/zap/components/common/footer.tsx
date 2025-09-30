import Link from "next/link";
import type { ZapServerPluginInstance } from "@/lib/zap.server";
import { LEGAL_LINKS } from "../data";
import { ThemeSwitcher } from "./theme-switcher";

type FooterProps = {
  plugins: {
    blog?: ZapServerPluginInstance<"blog">;
  };
};

export function Footer({ plugins }: FooterProps) {
  const LatestBlogPosts = plugins.blog?.components?.LatestBlogPosts;

  return (
    <footer className="w-full border-t bg-background px-4 md:px-8">
      <div className="mx-auto max-w-6xl py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="flex flex-col space-y-4">
            <div className="flex items-center space-x-2">
              <Link className="flex items-center space-x-2" href="/">
                <span className="inline-block font-bold">Zap.ts ⚡️</span>
              </Link>
            </div>

            <p className="text-muted-foreground text-sm leading-loose">
              &copy; {new Date().getFullYear()} Zap.ts. All rights reserved.
            </p>

            <div className="flex flex-wrap gap-4">
              {LEGAL_LINKS.map((link) => (
                <Link
                  className="text-muted-foreground text-sm underline-offset-4 hover:underline active:underline"
                  href={{ pathname: link.href }}
                  key={link.href}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <ThemeSwitcher />
          </div>

          {LatestBlogPosts && plugins.blog?.config && (
            <LatestBlogPosts pluginConfigs={{ blog: plugins.blog?.config }} />
          )}
        </div>
      </div>
    </footer>
  );
}

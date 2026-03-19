import { BracesIcon } from "lucide-react";
import type { ReactNode } from "react";

import { FadeIn } from "./animated";

const MULTI_PACKAGE_EXAMPLE = `import { createFetch } from "@zap-studio/fetch";
import { standardValidate } from "@zap-studio/validation";
import { checkoutInputSchema, paymentSchema } from "./schemas";

// Configure a reusable API client once
const { api } = createFetch({ baseURL: "/api" });

export async function checkout(input: unknown) {
  // 1) Validate input
  const payload = await standardValidate(checkoutInputSchema, input, {
    throwOnError: true,
  });

  // 2) Create payment with typed response
  return api.post("/payments", paymentSchema, {
    body: { accountId: payload.accountId, amount: payload.amount },
  });
}`;

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
            complete workflows
          </h2>

          <p className="mt-4 text-base text-fd-muted-foreground leading-7 sm:mt-5 sm:text-lg md:text-xl md:leading-8">
            Validate input and call your API with end-to-end typed data.
          </p>
        </div>
      </FadeIn>

      <div className="mx-auto max-w-5xl px-6">
        <FadeIn delay={0.15} duration={0.5} y={12}>
          <div className="rounded-xl bg-fd-card/70 px-3 py-3 sm:px-4 sm:py-4 dark:bg-fd-card/70">
            <div className="mb-3 flex items-center gap-2 text-fd-muted-foreground">
              <BracesIcon className="size-3.5" />
              <span className="font-mono text-xs leading-5 tracking-wide">example.ts</span>
            </div>
            <pre className="overflow-x-auto whitespace-pre-wrap break-words rounded-lg bg-transparent font-mono text-[12px] leading-[1.75] sm:text-[13px]">
              <code>{MULTI_PACKAGE_EXAMPLE}</code>
            </pre>
          </div>
        </FadeIn>
      </div>

      <FadeIn delay={0.5} duration={0.6} y={0}>
        <div className="mx-auto mt-12 flex items-center justify-center gap-3 px-6">
          <div
            aria-hidden="true"
            className="h-px w-12 bg-linear-to-r from-transparent to-fd-border"
          />
          <p className="font-mono text-[11px] text-fd-muted-foreground/50 uppercase leading-5 tracking-widest">
            Fully composable APIs
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

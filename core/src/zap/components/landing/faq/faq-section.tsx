"use client";

import { Accordion } from "@/components/ui/accordion";
import { FaqItem } from "@/zap/components/landing/faq/faq-item";
import { FAQS } from "@/zap/data/landing";

export function FaqSection() {
  return (
    <section className="w-full px-4 md:px-6">
      <header className="mx-auto flex max-w-[58rem] flex-col items-center justify-center space-y-4 text-center">
        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
          Frequently Asked Questions
        </h2>
        <p className="text-muted-foreground max-w-[85%] md:text-xl">
          Everything you need to know about Zap.ts
        </p>
      </header>

      <div className="mx-auto mt-12 max-w-3xl space-y-4">
        <Accordion type="single" collapsible className="w-full">
          {FAQS.map((faq, index) => (
            <FaqItem
              key={faq.question}
              question={faq.question}
              answer={faq.answer}
              index={index}
            />
          ))}
        </Accordion>
      </div>
    </section>
  );
}

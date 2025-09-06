import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { BILLING_FAQ } from "../data";

export function FAQ() {
  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      <h2 className="text-center font-bold text-2xl">
        Frequently Asked Questions
      </h2>

      <Accordion className="w-full" collapsible type="single">
        {BILLING_FAQ.map((faq) => (
          <AccordionItem key={faq.question} value={faq.question}>
            <AccordionTrigger className="text-left font-medium text-base">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}

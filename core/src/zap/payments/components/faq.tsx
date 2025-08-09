import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { BILLING_FAQ } from "@/zap/payments/data";

export function FAQ() {
  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      <h2 className="text-center text-2xl font-bold">
        Frequently Asked Questions
      </h2>

      <Accordion className="w-full" collapsible type="single">
        {BILLING_FAQ.map((faq, index) => (
          <AccordionItem key={index} value={`item-${index}`}>
            <AccordionTrigger className="text-left text-base font-medium">
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

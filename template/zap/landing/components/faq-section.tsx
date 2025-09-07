import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { FAQS } from "../data";

export function FaqSection() {
  return (
    <section className="w-full px-4 md:px-6">
      <header className="mx-auto flex max-w-[58rem] flex-col items-center justify-center space-y-4 text-center">
        <h2 className="font-bold text-3xl tracking-tighter sm:text-4xl md:text-5xl">
          Frequently Asked Questions
        </h2>
        <p className="max-w-[85%] text-muted-foreground md:text-xl">
          Everything you need to know about Zap.ts
        </p>
      </header>

      <div className="mx-auto mt-12 max-w-3xl space-y-4">
        <Accordion className="w-full" collapsible type="single">
          {FAQS.map((faq, index) => (
            <FaqItem
              answer={faq.answer}
              index={index}
              key={faq.question}
              question={faq.question}
            />
          ))}
        </Accordion>
      </div>
    </section>
  );
}

type FaqItemProps = {
  question: string;
  answer: string;
  index: number;
};

function FaqItem({ question, answer, index }: FaqItemProps) {
  return (
    <AccordionItem value={`item-${index}`}>
      <AccordionTrigger className="text-left font-medium">
        {question}
      </AccordionTrigger>
      <AccordionContent className="text-muted-foreground">
        {answer}
      </AccordionContent>
    </AccordionItem>
  );
}

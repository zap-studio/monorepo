"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "What is Zap.ts?",
    answer:
      "Zap.ts is a Next.js boilerplate that includes everything you need to build production-ready applications. It includes authentication, database integration, styling, and more.",
  },
  {
    question: "Is Zap.ts free to use?",
    answer:
      "Yes, Zap.ts is free and open-source. You can use it for personal and commercial projects without any cost. However, this might evolve in the future.",
  },
  {
    question: "Can I use Zap.ts for commercial projects?",
    answer:
      "Yes, Zap.ts can be used for both personal and commercial projects.",
  },
  {
    question: "Do I need to know TypeScript to use Zap.ts?",
    answer:
      "While Zap.ts is built with TypeScript, you don't need to be a TypeScript expert to get started. We provide comprehensive documentation to help you along the way.",
  },
  {
    question: "How do I get support?",
    answer:
      "Free users can get community support through our GitHub repository.",
  },
];

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
          {faqs.map((faq, index) => (
            <FaqItem
              key={index}
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

function FaqItem({
  question,
  answer,
  index,
}: {
  question: string;
  answer: string;
  index: number;
}) {
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

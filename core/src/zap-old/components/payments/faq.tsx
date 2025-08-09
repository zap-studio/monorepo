import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function FAQ() {
  const faqs = [
    {
      question: "Can I cancel anytime?",
      answer:
        "Yes, you can cancel your subscription at any time. Your access will continue until the end of your billing period.",
    },
    {
      question: "Do you offer refunds?",
      answer:
        "We offer a 30-day money-back guarantee. If you're not satisfied with your Pro subscription, contact our support team for a full refund.",
    },
    {
      question: "What payment methods do you accept?",
      answer:
        "We accept all major credit cards, PayPal, and other payment methods through our secure payment processor.",
    },
    {
      question: "Can I upgrade or downgrade my plan?",
      answer:
        "Yes, you can switch between monthly and yearly plans at any time. Changes will be reflected in your next billing cycle.",
    },
  ];

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      <h2 className="text-center text-2xl font-bold">
        Frequently Asked Questions
      </h2>

      <Accordion className="w-full" collapsible type="single">
        {faqs.map((faq, index) => (
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

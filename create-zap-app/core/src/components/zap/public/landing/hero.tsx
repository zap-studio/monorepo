"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Star } from "lucide-react";

interface HeroSectionProps {
  ratings: {
    averageRating: number;
    totalFeedbacks: number;
  };
  numberOfUsers: number;
}

export function HeroSection({ ratings, numberOfUsers }: HeroSectionProps) {
  const [typedWord, setTypedWord] = useState("faster");

  const words = useMemo(
    () => ["faster", "efficiently", "smoothly", "securely", "easily"],
    [],
  );
  const typingSpeed = 100; // ms per character
  const erasingSpeed = 50; // ms per character
  const delayBetweenWords = 1500; // delay before typing the next word

  useEffect(() => {
    let wordIndex = 0;
    let isErasing = false;
    let currentWord = "";
    let timeout: ReturnType<typeof setTimeout>;

    const typeEffect = () => {
      if (!isErasing && currentWord.length < words[wordIndex].length) {
        currentWord += words[wordIndex][currentWord.length];
        setTypedWord(currentWord);
        timeout = setTimeout(typeEffect, typingSpeed);
      } else if (isErasing && currentWord.length > 0) {
        currentWord = currentWord.slice(0, -1);
        setTypedWord(currentWord);
        timeout = setTimeout(typeEffect, erasingSpeed);
      } else {
        isErasing = !isErasing;
        if (!isErasing) {
          wordIndex = (wordIndex + 1) % words.length;
        }
        timeout = setTimeout(
          typeEffect,
          isErasing ? delayBetweenWords : typingSpeed,
        );
      }
    };

    typeEffect();

    return () => {
      clearTimeout(timeout);
    };
  }, [words]);

  return (
    <div className="flex w-full items-center justify-center px-4 md:px-6 md:pb-48">
      <div className="mx-auto max-w-4xl space-y-4 text-center">
        <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
          Ship <span className="text-primary">{typedWord}</span> with Zap.ts ⚡️
        </h1>
        <p className="text-muted-foreground mx-auto max-w-[700px] md:text-xl">
          The ultimate Next.js boilerplate with everything you need to build
          production-ready applications in minutes, not months.
        </p>
        <div className="flex flex-col justify-center gap-2 min-[400px]:flex-row">
          <Button size="lg" asChild>
            <Link href="/register">
              Get Started <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="https://zap-ts.alexandretrotel.org" target="_blank">
              View Documentation <ArrowUpRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="flex items-center justify-center space-x-4 text-sm">
          <div className="hidden items-center md:flex">
            <div className="flex">
              {Array(5)
                .fill(null)
                .map((_, i) => (
                  <Star key={i} className="fill-primary text-primary h-4 w-4" />
                ))}
            </div>
            <span className="text-muted-foreground ml-2">
              {new Intl.NumberFormat("en-US", {
                minimumFractionDigits: 1,
                maximumFractionDigits: 1,
              }).format(ratings.averageRating)}{" "}
              ({new Intl.NumberFormat("en-US").format(ratings.totalFeedbacks)}{" "}
              rating{ratings.totalFeedbacks > 1 ? "s" : ""})
            </span>
          </div>
          <div className="bg-border hidden h-4 w-px md:block" />
          <div className="text-muted-foreground">
            Used by {new Intl.NumberFormat("en-US").format(numberOfUsers)}+{" "}
            developer{numberOfUsers > 1 ? "s" : ""}
          </div>
        </div>
      </div>
    </div>
  );
}

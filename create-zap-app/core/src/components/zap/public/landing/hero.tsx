"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Star } from "lucide-react";
import { BeamsBackground } from "@/components/ui/beams-background";

interface HeroSectionProps {
  ratings: {
    averageRating: number;
    totalFeedbacks: number;
  };
  numberOfUsers: number;
}

const WORDS = ["faster", "efficiently", "smoothly", "securely", "easily"];
const TYPING_SPEED = 100;
const ERASING_SPEED = 50;
const DELAY_BETWEEN_WORDS = 1500;

export function HeroSection({ ratings, numberOfUsers }: HeroSectionProps) {
  const [typedWord, setTypedWord] = useState(WORDS[0]);

  const wordIndex = useRef(0);
  const isErasing = useRef(false);
  const current = useRef("");

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    const type = () => {
      const fullWord = WORDS[wordIndex.current];

      if (!isErasing.current && current.current.length < fullWord.length) {
        current.current += fullWord[current.current.length];
        setTypedWord(current.current);
        timeout = setTimeout(type, TYPING_SPEED);
      } else if (isErasing.current && current.current.length > 0) {
        current.current = current.current.slice(0, -1);
        setTypedWord(current.current);
        timeout = setTimeout(type, ERASING_SPEED);
      } else {
        isErasing.current = !isErasing.current;

        if (!isErasing.current) {
          wordIndex.current = (wordIndex.current + 1) % WORDS.length;
        }

        timeout = setTimeout(
          type,
          isErasing.current ? DELAY_BETWEEN_WORDS : TYPING_SPEED,
        );
      }
    };

    type();
    return () => clearTimeout(timeout);
  }, []);

  // Formatters
  const ratingText = useMemo(() => {
    const ratingFormatter = new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    });

    const countFormatter = new Intl.NumberFormat("en-US");

    return {
      average: ratingFormatter.format(ratings.averageRating),
      total: countFormatter.format(ratings.totalFeedbacks),
      users: countFormatter.format(numberOfUsers),
    };
  }, [ratings, numberOfUsers]);

  const stars = useMemo(() => {
    const fullStars = Math.floor(ratings.averageRating);
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < fullStars ? "fill-primary text-primary" : "text-primary"
        }`}
      />
    ));
  }, [ratings.averageRating]);

  return (
    <BeamsBackground>
      <div className="flex w-full items-center justify-center px-4 pb-32 md:px-6 md:pb-48">
        <div className="mx-auto max-w-4xl space-y-4 text-center">
          <h1 className="text-foreground text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
            Ship <span className="text-primary">{typedWord}</span> with Zap.ts
            ⚡️
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
              <Link
                className="text-foreground"
                href="https://zap-ts.alexandretrotel.org"
                target="_blank"
              >
                View Documentation <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="flex items-center justify-center space-x-4 text-sm">
            <div className="hidden items-center md:flex">
              <div className="flex">{stars}</div>
              <span className="text-muted-foreground ml-2">
                {ratingText.average} ({ratingText.total} rating
                {ratings.totalFeedbacks > 1 ? "s" : ""})
              </span>
            </div>
            <div className="bg-border hidden h-4 w-px md:block" />
            <div className="text-muted-foreground">
              Used by {ratingText.users}+ developer
              {numberOfUsers > 1 ? "s" : ""}
            </div>
          </div>
        </div>
      </div>
    </BeamsBackground>
  );
}

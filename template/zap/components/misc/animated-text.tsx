"use client";

import { useEffect, useRef, useState } from "react";

const WORDS = ["faster", "efficiently", "smoothly", "securely", "easily"];
const TYPING_SPEED = 100;
const ERASING_SPEED = 50;
const DELAY_BETWEEN_WORDS = 1500;

export function AnimatedText() {
  const [typedWord, setTypedWord] = useState(WORDS[0]);

  const wordIndex = useRef(0);
  const isErasing = useRef(false);
  const current = useRef("");

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    function handleTyping(fullWord: string) {
      current.current += fullWord[current.current.length];
      setTypedWord(current.current);
      timeout = setTimeout(type, TYPING_SPEED);
    }

    function handleErasing() {
      current.current = current.current.slice(0, -1);
      setTypedWord(current.current);
      timeout = setTimeout(type, ERASING_SPEED);
    }

    function handleTransition() {
      isErasing.current = !isErasing.current;
      if (!isErasing.current) {
        wordIndex.current = (wordIndex.current + 1) % WORDS.length;
      }
      timeout = setTimeout(
        type,
        isErasing.current ? DELAY_BETWEEN_WORDS : TYPING_SPEED
      );
    }

    const type = () => {
      const fullWord = WORDS[wordIndex.current];

      if (!isErasing.current && current.current.length < fullWord.length) {
        handleTyping(fullWord);
      } else if (isErasing.current && current.current.length > 0) {
        handleErasing();
      } else {
        handleTransition();
      }
    };

    type();
    return () => clearTimeout(timeout);
  }, []);

  return <span className="text-primary">{typedWord}</span>;
}

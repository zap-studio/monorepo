import { domAnimation, LazyMotion, m, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

interface FadeInProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  y?: number;
}

export const FadeIn = ({
  children,
  className,
  delay = 0,
  duration = 0.6,
  y = 24,
}: FadeInProps): ReactNode => {
  const reduceMotion = useReducedMotion();
  const shouldReduceMotion = reduceMotion === true;

  return (
    <LazyMotion features={domAnimation}>
      <m.div
        className={className}
        initial={{ opacity: 0, y: shouldReduceMotion ? 0 : y }}
        transition={{
          delay: shouldReduceMotion ? 0 : delay,
          duration: shouldReduceMotion ? 0 : duration,
          ease: [0.25, 0.4, 0.25, 1],
        }}
        viewport={{ margin: "-80px", once: true }}
        whileInView={{ opacity: 1, y: 0 }}
      >
        {children}
      </m.div>
    </LazyMotion>
  );
};

interface PulseGlowProps {
  className?: string;
}

export const PulseGlow = ({ className }: PulseGlowProps): ReactNode => {
  const reduceMotion = useReducedMotion();

  if (reduceMotion === true) {
    return <div aria-hidden="true" className={className} />;
  }

  return (
    <LazyMotion features={domAnimation}>
      <m.div
        animate={{
          opacity: [0.4, 0.7, 0.4],
          scale: [1, 1.05, 1],
        }}
        aria-hidden="true"
        className={className}
        transition={{
          duration: 6,
          ease: "easeInOut",
          repeat: Number.POSITIVE_INFINITY,
        }}
      />
    </LazyMotion>
  );
};

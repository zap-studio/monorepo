"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

interface FadeInProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  y?: number;
}

export function FadeIn({
  children,
  className,
  delay = 0,
  duration = 0.6,
  y = 24,
}: FadeInProps): ReactNode {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      transition={{
        duration,
        delay,
        ease: [0.25, 0.4, 0.25, 1],
      }}
      viewport={{ once: true, margin: "-80px" }}
      whileInView={{ opacity: 1, y: 0 }}
    >
      {children}
    </motion.div>
  );
}

interface StaggerContainerProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  stagger?: number;
}

export function StaggerContainer({
  children,
  className,
  delay = 0,
  stagger = 0.08,
}: StaggerContainerProps): ReactNode {
  return (
    <motion.div
      className={className}
      initial="hidden"
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: stagger,
            delayChildren: delay,
          },
        },
      }}
      viewport={{ once: true, margin: "-60px" }}
      whileInView="visible"
    >
      {children}
    </motion.div>
  );
}

interface StaggerItemProps {
  children: ReactNode;
  className?: string;
  y?: number;
}

export function StaggerItem({
  children,
  className,
  y = 20,
}: StaggerItemProps): ReactNode {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.5,
            ease: [0.25, 0.4, 0.25, 1],
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

interface SlideInProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "left" | "right";
  duration?: number;
}

export function SlideIn({
  children,
  className,
  delay = 0,
  direction = "left",
  duration = 0.6,
}: SlideInProps): ReactNode {
  const x = direction === "left" ? -32 : 32;

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, x }}
      transition={{
        duration,
        delay,
        ease: [0.25, 0.4, 0.25, 1],
      }}
      viewport={{ once: true, margin: "-60px" }}
      whileInView={{ opacity: 1, x: 0 }}
    >
      {children}
    </motion.div>
  );
}

interface PulseGlowProps {
  className?: string;
}

export function PulseGlow({ className }: PulseGlowProps): ReactNode {
  return (
    <motion.div
      animate={{
        opacity: [0.4, 0.7, 0.4],
        scale: [1, 1.05, 1],
      }}
      aria-hidden="true"
      className={className}
      transition={{
        duration: 6,
        repeat: Number.POSITIVE_INFINITY,
        ease: "easeInOut",
      }}
    />
  );
}

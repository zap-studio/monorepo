"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

type AnimatedSectionProps = {
  children: ReactNode;
  id?: string;
  className?: string;
  delay?: number;
  isNotSection?: boolean;
};

export function AnimatedSection({
  children,
  id,
  className = "",
  delay = 0,
  isNotSection = false,
}: AnimatedSectionProps) {
  if (isNotSection) {
    return (
      <motion.div
        className={className}
        initial={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.2, delay }}
        viewport={{ once: true }}
        whileInView={{ opacity: 1, y: 0 }}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.section
      className={className}
      id={id}
      initial={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.2, delay }}
      viewport={{ once: true }}
      whileInView={{ opacity: 1, y: 0 }}
    >
      {children}
    </motion.section>
  );
}

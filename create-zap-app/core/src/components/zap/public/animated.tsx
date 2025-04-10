"use client";

import type { ReactNode } from "react";
import { motion } from "motion/react";

interface AnimatedSectionProps {
  children: ReactNode;
  id?: string;
  className?: string;
  delay?: number;
}

export function AnimatedSection({
  children,
  id,
  className = "",
  delay = 0,
}: AnimatedSectionProps) {
  return (
    <motion.section
      id={id}
      className={className}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.2, delay }}
    >
      {children}
    </motion.section>
  );
}

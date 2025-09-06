"use client";

import { motion } from "motion/react";
import type React from "react";

type AnimateWaitlistProps = {
  children: React.ReactNode;
};

export function AnimateWaitlist({ children }: AnimateWaitlistProps) {
  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="w-full"
      initial={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

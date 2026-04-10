"use client";

import { motion } from "framer-motion";
import type { ReactNode, MouseEventHandler } from "react";

interface Props {
  children: ReactNode;
  className?: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
}

export function RidgeButton({ children, className = "", onClick }: Props) {
  return (
    <motion.button
      className={`orbit-ridge-btn ${className}`}
      whileTap={{ scale: 0.97 }}
      type="button"
      onClick={onClick}
    >
      {children}
    </motion.button>
  );
}

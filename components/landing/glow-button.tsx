"use client";

import { motion } from "framer-motion";

export function GlowButton({
  children,
  className = "",
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}) {
  return (
    <motion.button
      className={`orbit-cta-btn ${className}`}
      whileTap={{ scale: 0.98 }}
      type="button"
      onClick={onClick}
    >
      <span className="orbit-cta-btn-text">{children}</span>
    </motion.button>
  );
}

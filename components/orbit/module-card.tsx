"use client";

import Link from "next/link";
import { CheckCircle2, Lock, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

interface ModuleCardProps {
  number: number;
  title: string;
  description: string;
  href: string;
  locked: boolean;
  complete: boolean;
}

export function ModuleCard({
  number,
  title,
  description,
  href,
  locked,
  complete,
}: ModuleCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: (number - 1) * 0.08, duration: 0.3 }}
      className={`border rounded-xl p-5 transition-colors ${
        locked
          ? "border-[var(--border)] bg-[var(--card)] opacity-40 cursor-not-allowed"
          : complete
          ? "border-[var(--primary)] bg-[var(--accent)]"
          : "border-[var(--border)] bg-[var(--card)] hover:border-white/15"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div
            className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 text-sm font-semibold font-heading ${
              complete
                ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                : "bg-white/8 text-[var(--muted-foreground)]"
            }`}
          >
            {complete ? <CheckCircle2 size={16} /> : `M${number}`}
          </div>
          <div>
            <h3 className="font-semibold text-[var(--foreground)] font-heading">{title}</h3>
            <p className="text-sm text-[var(--muted-foreground)] mt-0.5 leading-relaxed">
              {description}
            </p>
          </div>
        </div>
        <div className="shrink-0 mt-0.5">
          {locked ? (
            <Lock size={15} className="text-[var(--muted-foreground)]" />
          ) : (
            <Link
              href={href}
              className="flex items-center gap-1.5 text-sm font-medium text-[var(--primary)] hover:opacity-75 transition-opacity whitespace-nowrap"
            >
              {complete ? "Review" : "Start"}
              <ArrowRight size={13} />
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  );
}

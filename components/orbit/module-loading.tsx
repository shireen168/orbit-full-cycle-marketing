"use client";

import { motion, AnimatePresence } from "framer-motion";

export function ModuleLoading({ loadingStep, steps }: { loadingStep: number; steps: string[] }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center py-24 text-center"
    >
      <div className="w-10 h-10 rounded-full border-2 border-[var(--primary)] border-t-transparent animate-spin mb-8" />
      <AnimatePresence mode="wait">
        <motion.p
          key={loadingStep}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          className="text-sm text-[var(--muted-foreground)]"
        >
          {steps[loadingStep]}
        </motion.p>
      </AnimatePresence>
      <div className="mt-5 w-44 h-1 bg-white/8 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-[var(--primary)] rounded-full"
          animate={{ width: `${((loadingStep + 1) / steps.length) * 85}%` }}
          transition={{ duration: 0.6 }}
        />
      </div>
    </motion.div>
  );
}

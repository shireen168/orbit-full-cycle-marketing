"use client";

import { motion } from "framer-motion";
import { BarChart3, Layers, Users } from "lucide-react";

export const cardVariant = {
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
};

export const modules = [
  {
    number: "01",
    icon: BarChart3,
    label: "Market Intelligence",
    description:
      "Map your competitive landscape. Orbit plots every rival on a positioning quadrant and surfaces the whitespace your brand can own.",
    tags: ["Competitive Analysis", "Gap Detection", "Positioning"],
  },
  {
    number: "02",
    icon: Layers,
    label: "Brand Foundation",
    description:
      "Turn market gaps into brand strategy. Generate your positioning statement, messaging pillars, brand voice, and tagline options in one pass.",
    tags: ["Positioning", "Messaging", "Voice & Tone"],
  },
  {
    number: "03",
    icon: Users,
    label: "Audience Studio",
    description:
      "Build three high-fidelity buyer personas grounded in your brand strategy, with pain points, buying triggers, objections, and ad hooks.",
    tags: ["Persona Generation", "Psychographics", "Ad Copy"],
  },
];

export function ModuleCard({ mod }: { mod: typeof modules[0] }) {
  const Icon = mod.icon;
  return (
    <motion.div
      variants={cardVariant}
      whileHover={{ y: -6, transition: { duration: 0.3, ease: "easeOut" } }}
      className="group relative flex flex-col gap-5 rounded-2xl p-7 overflow-hidden"
      style={{ background: "oklch(0.12 0.009 265)", border: "1px solid oklch(1 0 0 / 0.07)" }}
    >
      <span
        className="absolute -top-16 -right-16 w-40 h-40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: "radial-gradient(circle, oklch(0.72 0.16 185 / 0.18) 0%, transparent 70%)", filter: "blur(24px)" }}
      />
      <span
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: "linear-gradient(135deg, oklch(0.72 0.16 185 / 0.12) 0%, transparent 50%, oklch(0.72 0.16 185 / 0.06) 100%)" }}
      />
      <div className="relative flex items-start justify-between">
        <div className="flex items-center justify-center w-11 h-11 rounded-xl" style={{ background: "oklch(0.72 0.16 185 / 0.12)" }}>
          <Icon size={20} style={{ color: "oklch(0.72 0.16 185)" }} strokeWidth={1.5} />
        </div>
        <span className="font-mono text-xs tracking-widest" style={{ color: "oklch(0.72 0.16 185 / 0.5)" }}>
          {mod.number}
        </span>
      </div>
      <div className="relative flex flex-col gap-3">
        <h3 className="text-lg font-semibold leading-snug" style={{ fontFamily: "var(--font-syne)", color: "oklch(0.93 0.006 260)" }}>
          {mod.label}
        </h3>
        <p className="text-sm leading-relaxed" style={{ color: "oklch(0.82 0.012 260)" }}>{mod.description}</p>
      </div>
      <div className="relative flex flex-wrap gap-2 mt-auto">
        {mod.tags.map((t) => (
          <span key={t} className="px-2.5 py-1 rounded-md text-xs font-medium" style={{ background: "oklch(0.72 0.16 185 / 0.08)", color: "oklch(0.72 0.16 185 / 0.85)", border: "1px solid oklch(0.72 0.16 185 / 0.15)" }}>
            {t}
          </span>
        ))}
      </div>
    </motion.div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { AudienceStudio } from "@/types/orbit";

const PERSONA_COLORS = [
  { border: "border-[#00d4b4]", bg: "bg-[#00d4b4]/10", dot: "#00d4b4" },
  { border: "border-[#7c6ef8]", bg: "bg-[#7c6ef8]/10", dot: "#7c6ef8" },
  { border: "border-[#f59e0b]", bg: "bg-[#f59e0b]/10", dot: "#f59e0b" },
];

export function AudienceStudioResults({ results, projectId }: { results: AudienceStudio; projectId: string }) {
  const [expanded, setExpanded] = useState<number | null>(0);

  return (
    <motion.div key="results" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-4">
      {results.personas.map((persona, i) => {
        const colors = PERSONA_COLORS[i % PERSONA_COLORS.length];
        const isOpen = expanded === i;
        return (
          <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className={`border rounded-xl overflow-hidden ${colors.border}`}>
            <button onClick={() => setExpanded(isOpen ? null : i)} className="w-full flex items-center justify-between px-5 py-4 text-left">
              <div className="flex items-center gap-4">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold font-heading shrink-0 ${colors.bg}`} style={{ color: colors.dot }}>
                  {persona.name?.[0] ?? "?"}
                </div>
                <div>
                  <p className="font-semibold text-[var(--foreground)] font-heading">{persona.name}</p>
                  <p className="text-xs text-[var(--muted-foreground)]">{persona.role} · {persona.ageRange}</p>
                </div>
              </div>
              {isOpen ? <ChevronUp size={14} className="text-[var(--muted-foreground)] shrink-0" /> : <ChevronDown size={14} className="text-[var(--muted-foreground)] shrink-0" />}
            </button>

            <AnimatePresence>
              {isOpen && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                  <div className="px-5 pb-5 space-y-5 border-t border-[var(--border)]">
                    <p className="text-xs text-[var(--muted-foreground)] leading-relaxed pt-4">{persona.psychographicSummary}</p>
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-[var(--muted-foreground)] mb-2 font-heading">Pain Points</p>
                        <ul className="space-y-1.5">{persona.painPoints.map((p, j) => <li key={j} className="flex items-start gap-2 text-sm text-[var(--foreground)]"><span className="text-rose-400 mt-0.5 shrink-0">-</span>{p}</li>)}</ul>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-[var(--muted-foreground)] mb-2 font-heading">Buying Triggers</p>
                        <ul className="space-y-1.5">{persona.buyingTriggers.map((t, j) => <li key={j} className="flex items-start gap-2 text-sm text-[var(--foreground)]"><span className="text-emerald-400 mt-0.5 shrink-0">+</span>{t}</li>)}</ul>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-[var(--muted-foreground)] mb-2 font-heading">Objections</p>
                        <ul className="space-y-1.5">{persona.objections.map((o, j) => <li key={j} className="flex items-start gap-2 text-sm text-[var(--foreground)]"><span className="text-amber-400 mt-0.5 shrink-0">?</span>{o}</li>)}</ul>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-[var(--muted-foreground)] mb-2 font-heading">Channels</p>
                        <div className="flex flex-wrap gap-1.5">{persona.preferredChannels.map((c, j) => <span key={j} className="px-2.5 py-1 rounded-full border border-[var(--border)] bg-[var(--card)] text-xs text-[var(--foreground)]">{c}</span>)}</div>
                      </div>
                    </div>
                    {persona.sampleAdHook && (
                      <div className={`rounded-xl p-4 ${colors.bg} border ${colors.border}`}>
                        <p className="text-[10px] uppercase tracking-widest mb-2 font-heading" style={{ color: colors.dot }}>Sample Ad Hook</p>
                        <p className="text-sm font-medium text-[var(--foreground)] italic">"{persona.sampleAdHook}"</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}

      <div className="pt-4 border-t border-[var(--border)] flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-4">
        <div className="flex items-center gap-2">
          <CheckCircle2 size={16} className="text-[var(--primary)]" />
          <p className="text-sm text-[var(--muted-foreground)]">Audience profiles ready.</p>
        </div>
        <Link href={`/projects/${projectId}/campaign-planner`} className="flex items-center justify-center gap-2 bg-[var(--primary)] text-[var(--primary-foreground)] px-5 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity whitespace-nowrap">
          Campaign Planner <ArrowRight size={14} />
        </Link>
      </div>
    </motion.div>
  );
}

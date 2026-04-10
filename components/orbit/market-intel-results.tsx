"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { MarketIntel } from "@/types/orbit";
import { PositioningChart } from "./positioning-chart";

export function MarketIntelResults({ results, projectId }: { results: MarketIntel; projectId: string }) {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <motion.div key="results" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-8">
      {results.summary && (
        <div className="border border-[var(--border)] rounded-xl p-5 bg-[var(--card)]">
          <p className="text-[10px] uppercase tracking-widest text-[var(--muted-foreground)] mb-2 font-heading">Market Overview</p>
          <p className="text-[var(--foreground)] leading-relaxed text-sm sm:text-base">{results.summary}</p>
        </div>
      )}

      {results.competitorMap?.length > 0 && (
        <div>
          <p className="text-[10px] uppercase tracking-widest text-[var(--muted-foreground)] mb-3 font-heading">Competitive Positioning</p>
          <PositioningChart competitors={results.competitorMap} />
        </div>
      )}

      {results.competitorMap?.length > 0 && (
        <div>
          <p className="text-[10px] uppercase tracking-widest text-[var(--muted-foreground)] mb-3 font-heading">Competitor Analysis</p>
          <div className="space-y-2">
            {results.competitorMap.map((c) => (
              <div key={c.name} className="border border-[var(--border)] rounded-xl bg-[var(--card)] overflow-hidden">
                <button onClick={() => setExpanded(expanded === c.name ? null : c.name)} className="w-full flex items-center justify-between px-5 py-4 text-left">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="font-semibold text-[var(--foreground)] font-heading shrink-0">{c.name}</span>
                    {c.description && <span className="text-sm text-[var(--muted-foreground)] truncate hidden sm:block">{c.description}</span>}
                  </div>
                  {expanded === c.name ? <ChevronUp size={14} className="text-[var(--muted-foreground)] shrink-0 ml-2" /> : <ChevronDown size={14} className="text-[var(--muted-foreground)] shrink-0 ml-2" />}
                </button>
                <AnimatePresence>
                  {expanded === c.name && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                      <div className="px-5 pb-5 grid sm:grid-cols-2 gap-4 border-t border-[var(--border)] pt-4">
                        <div>
                          <p className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider mb-2">Strengths</p>
                          <ul className="space-y-1.5">{c.strengths.map((s, j) => <li key={j} className="text-sm text-[var(--foreground)] flex items-start gap-2"><span className="text-emerald-400 mt-0.5 shrink-0">+</span>{s}</li>)}</ul>
                        </div>
                        <div>
                          <p className="text-[10px] font-semibold text-rose-400 uppercase tracking-wider mb-2">Weaknesses</p>
                          <ul className="space-y-1.5">{c.weaknesses.map((w, j) => <li key={j} className="text-sm text-[var(--foreground)] flex items-start gap-2"><span className="text-rose-400 mt-0.5 shrink-0">-</span>{w}</li>)}</ul>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      )}

      {results.marketGaps?.filter(Boolean).length > 0 && (
        <div>
          <p className="text-[10px] uppercase tracking-widest text-[var(--muted-foreground)] mb-3 font-heading">Market Gaps</p>
          <div className="grid sm:grid-cols-2 gap-3">
            {results.marketGaps.filter(Boolean).map((gap, i) => (
              <div key={i} className="border border-[var(--border)] rounded-xl p-4 bg-[var(--card)] flex items-start gap-3">
                <span className="w-5 h-5 rounded-md bg-white/8 flex items-center justify-center text-[10px] font-semibold text-[var(--muted-foreground)] shrink-0 mt-0.5 font-heading">{i + 1}</span>
                <p className="text-sm text-[var(--foreground)] leading-relaxed">{gap}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {results.whitespaceOpportunities?.filter(Boolean).length > 0 && (
        <div>
          <p className="text-[10px] uppercase tracking-widest text-[var(--muted-foreground)] mb-3 font-heading">Whitespace Opportunities</p>
          <div className="space-y-2.5">
            {results.whitespaceOpportunities.filter(Boolean).map((opp, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }} className="border border-[var(--primary)] rounded-xl p-4 bg-[var(--accent)] flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-[var(--primary)] flex items-center justify-center text-[10px] font-bold text-[var(--primary-foreground)] shrink-0 mt-0.5">{i + 1}</span>
                <p className="text-sm text-[var(--foreground)] leading-relaxed">{opp}</p>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      <div className="pt-4 border-t border-[var(--border)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <p className="text-sm text-[var(--muted-foreground)]">Market analysis complete. Ready to build your brand.</p>
        <Link href={`/projects/${projectId}/brand-foundation`} className="flex items-center justify-center gap-2 bg-[var(--primary)] text-[var(--primary-foreground)] px-5 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity whitespace-nowrap">
          Brand Foundation <ArrowRight size={14} />
        </Link>
      </div>
    </motion.div>
  );
}

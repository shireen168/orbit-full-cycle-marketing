"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import type { BrandFoundation } from "@/types/orbit";

export function BrandFoundationResults({ results, projectId }: { results: BrandFoundation; projectId: string }) {
  const [selectedTagline, setSelectedTagline] = useState(results.selectedTagline ?? "");

  async function saveTagline(tagline: string) {
    setSelectedTagline(tagline);
    await fetch(`/api/projects/${projectId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ brand_foundation: { ...results, selectedTagline: tagline } }),
    });
  }

  return (
    <motion.div key="results" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-8">
      <div className="border border-[var(--primary)] rounded-xl p-6 bg-[var(--accent)]">
        <p className="text-[10px] uppercase tracking-widest text-[var(--primary)] mb-3 font-heading">Positioning Statement</p>
        <p className="text-[var(--foreground)] leading-relaxed text-sm sm:text-base font-medium">{results.positioningStatement}</p>
      </div>

      <div className="border border-[var(--border)] rounded-xl p-5 bg-[var(--card)]">
        <p className="text-[10px] uppercase tracking-widest text-[var(--muted-foreground)] mb-2 font-heading">Value Proposition</p>
        <p className="text-[var(--foreground)] leading-relaxed text-sm sm:text-base">{results.valueProp}</p>
      </div>

      {results.messagingPillars?.length > 0 && (
        <div>
          <p className="text-[10px] uppercase tracking-widest text-[var(--muted-foreground)] mb-3 font-heading">Messaging Pillars</p>
          <div className="grid sm:grid-cols-3 gap-3">
            {results.messagingPillars.map((pillar, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="border border-[var(--border)] rounded-xl p-4 bg-[var(--card)]">
                <div className="text-2xl mb-3">{pillar.icon}</div>
                <p className="font-semibold text-[var(--foreground)] font-heading text-sm mb-1.5">{pillar.title}</p>
                <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">{pillar.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {results.brandVoice?.length > 0 && (
        <div>
          <p className="text-[10px] uppercase tracking-widest text-[var(--muted-foreground)] mb-3 font-heading">Brand Voice</p>
          <div className="flex flex-wrap gap-2">
            {results.brandVoice.map((v, i) => (
              <span key={i} className="px-3 py-1.5 rounded-full border border-[var(--border)] bg-[var(--card)] text-sm text-[var(--foreground)]">{v}</span>
            ))}
          </div>
        </div>
      )}

      {results.taglines?.length > 0 && (
        <div>
          <p className="text-[10px] uppercase tracking-widest text-[var(--muted-foreground)] mb-3 font-heading">Tagline Options</p>
          <div className="space-y-2">
            {results.taglines.map((tagline, i) => (
              <button key={i} onClick={() => saveTagline(tagline)} className={`w-full text-left px-5 py-3.5 rounded-xl border transition-colors text-sm font-medium ${selectedTagline === tagline ? "border-[var(--primary)] bg-[var(--accent)] text-[var(--foreground)]" : "border-[var(--border)] bg-[var(--card)] text-[var(--muted-foreground)] hover:border-white/15 hover:text-[var(--foreground)]"}`}>
                <span className="mr-3 text-[var(--muted-foreground)]">{i + 1}.</span>{tagline}
              </button>
            ))}
          </div>
          {selectedTagline && <p className="mt-2 text-xs text-[var(--muted-foreground)]">Selected tagline saved.</p>}
        </div>
      )}

      <div className="pt-4 border-t border-[var(--border)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <p className="text-sm text-[var(--muted-foreground)]">Brand foundation built. Ready to define your audience.</p>
        <Link href={`/projects/${projectId}/audience-studio`} className="flex items-center justify-center gap-2 bg-[var(--primary)] text-[var(--primary-foreground)] px-5 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity whitespace-nowrap">
          Audience Studio <ArrowRight size={14} />
        </Link>
      </div>
    </motion.div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, X, ArrowRight, RefreshCw, ArrowLeft, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { MarketIntel } from "@/types/orbit";
import { PositioningChart } from "./positioning-chart";

interface Props {
  projectId: string;
  projectName: string;
  initialData: MarketIntel | null;
}

const LOADING_STEPS = [
  "Analyzing competitor landscape...",
  "Mapping market positioning...",
  "Identifying market gaps...",
  "Surfacing whitespace opportunities...",
  "Generating strategic insights...",
];

type View = "form" | "loading" | "results";

interface CompetitorInput {
  name: string;
  description: string;
}

export function MarketIntelModule({ projectId, projectName, initialData }: Props) {
  const [view, setView] = useState<View>(initialData ? "results" : "form");
  const [results, setResults] = useState<MarketIntel | null>(initialData);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const [industry, setIndustry] = useState("");
  const [productCategory, setProductCategory] = useState("");
  const [competitors, setCompetitors] = useState<CompetitorInput[]>([
    { name: "", description: "" },
    { name: "", description: "" },
  ]);

  function addCompetitor() {
    if (competitors.length >= 5) return;
    setCompetitors((p) => [...p, { name: "", description: "" }]);
  }

  function removeCompetitor(i: number) {
    if (competitors.length <= 1) return;
    setCompetitors((p) => p.filter((_, idx) => idx !== i));
  }

  function updateCompetitor(i: number, field: keyof CompetitorInput, value: string) {
    setCompetitors((p) =>
      p.map((c, idx) => (idx === i ? { ...c, [field]: value } : c))
    );
  }

  async function handleSubmit() {
    const validCompetitors = competitors.filter((c) => c.name.trim());
    if (!industry.trim() || !productCategory.trim() || validCompetitors.length < 1) {
      setError("Fill in industry, product category, and at least one competitor.");
      return;
    }

    setError(null);
    setView("loading");
    setLoadingStep(0);

    const interval = setInterval(() => {
      setLoadingStep((p) => Math.min(p + 1, LOADING_STEPS.length - 1));
    }, 1800);

    try {
      const res = await fetch("/api/ai/analyze-market", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          industry,
          productCategory,
          competitors: validCompetitors,
        }),
      });

      clearInterval(interval);

      if (!res.ok) {
        const err = await res.json();
        setError(err.error ?? "Something went wrong. Please try again.");
        setView("form");
        return;
      }

      const { data } = await res.json();
      setResults(data);
      setView("results");
    } catch {
      clearInterval(interval);
      setError("Network error. Please try again.");
      setView("form");
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      {/* Header */}
      <div className="mb-8">
        <Link
          href={`/projects/${projectId}`}
          className="inline-flex items-center gap-2 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors mb-5"
        >
          <ArrowLeft size={14} />
          {projectName}
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-[var(--muted-foreground)] mb-2 font-heading">
              Module 1
            </p>
            <h1 className="text-2xl sm:text-3xl font-heading font-bold text-[var(--foreground)]">
              Market Intelligence
            </h1>
          </div>
          {view === "results" && (
            <button
              onClick={() => setView("form")}
              className="flex items-center gap-1.5 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors mt-2 shrink-0"
            >
              <RefreshCw size={13} />
              Regenerate
            </button>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* FORM */}
        {view === "form" && (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {error && (
              <div className="border border-destructive/40 bg-destructive/10 rounded-lg px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  Industry <span className="text-[var(--primary)]">*</span>
                </label>
                <input
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  placeholder="e.g. SaaS, E-commerce, Health"
                  className="w-full bg-[var(--card)] border border-[var(--border)] rounded-lg px-3 py-2.5 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] outline-none focus:border-[var(--primary)] transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  Product Category <span className="text-[var(--primary)]">*</span>
                </label>
                <input
                  value={productCategory}
                  onChange={(e) => setProductCategory(e.target.value)}
                  placeholder="e.g. Project management tools"
                  className="w-full bg-[var(--card)] border border-[var(--border)] rounded-lg px-3 py-2.5 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] outline-none focus:border-[var(--primary)] transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-[var(--foreground)]">
                  Competitors <span className="text-[var(--primary)]">*</span>
                </label>
                <span className="text-xs text-[var(--muted-foreground)]">
                  {competitors.length} / 5
                </span>
              </div>
              <div className="space-y-2.5">
                {competitors.map((c, i) => (
                  <div key={i} className="flex gap-2 items-start">
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        value={c.name}
                        onChange={(e) => updateCompetitor(i, "name", e.target.value)}
                        placeholder={`Competitor ${i + 1}`}
                        className="bg-[var(--card)] border border-[var(--border)] rounded-lg px-3 py-2.5 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] outline-none focus:border-[var(--primary)] transition-colors"
                      />
                      <input
                        value={c.description}
                        onChange={(e) =>
                          updateCompetitor(i, "description", e.target.value)
                        }
                        placeholder="What they do (optional)"
                        className="bg-[var(--card)] border border-[var(--border)] rounded-lg px-3 py-2.5 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] outline-none focus:border-[var(--primary)] transition-colors"
                      />
                    </div>
                    {competitors.length > 1 && (
                      <button
                        onClick={() => removeCompetitor(i)}
                        className="mt-2.5 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors p-1"
                      >
                        <X size={13} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {competitors.length < 5 && (
                <button
                  onClick={addCompetitor}
                  className="mt-3 flex items-center gap-1.5 text-sm text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors"
                >
                  <Plus size={13} />
                  Add competitor
                </button>
              )}
            </div>

            <button
              onClick={handleSubmit}
              className="w-full bg-[var(--primary)] text-[var(--primary-foreground)] py-3 rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity"
            >
              Analyze Market
            </button>
          </motion.div>
        )}

        {/* LOADING */}
        {view === "loading" && (
          <motion.div
            key="loading"
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
                {LOADING_STEPS[loadingStep]}
              </motion.p>
            </AnimatePresence>
            <div className="mt-5 w-44 h-1 bg-white/8 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-[var(--primary)] rounded-full"
                animate={{
                  width: `${((loadingStep + 1) / LOADING_STEPS.length) * 85}%`,
                }}
                transition={{ duration: 0.6 }}
              />
            </div>
          </motion.div>
        )}

        {/* RESULTS */}
        {view === "results" && results && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            {/* Summary */}
            {results.summary && (
              <div className="border border-[var(--border)] rounded-xl p-5 bg-[var(--card)]">
                <p className="text-[10px] uppercase tracking-widest text-[var(--muted-foreground)] mb-2 font-heading">
                  Market Overview
                </p>
                <p className="text-[var(--foreground)] leading-relaxed text-sm sm:text-base">
                  {results.summary}
                </p>
              </div>
            )}

            {/* Positioning chart */}
            {results.competitorMap?.length > 0 && (
              <div>
                <p className="text-[10px] uppercase tracking-widest text-[var(--muted-foreground)] mb-3 font-heading">
                  Competitive Positioning
                </p>
                <PositioningChart competitors={results.competitorMap} />
              </div>
            )}

            {/* Competitor cards */}
            {results.competitorMap?.length > 0 && (
              <div>
                <p className="text-[10px] uppercase tracking-widest text-[var(--muted-foreground)] mb-3 font-heading">
                  Competitor Analysis
                </p>
                <div className="space-y-2">
                  {results.competitorMap.map((c) => (
                    <div
                      key={c.name}
                      className="border border-[var(--border)] rounded-xl bg-[var(--card)] overflow-hidden"
                    >
                      <button
                        onClick={() =>
                          setExpanded(expanded === c.name ? null : c.name)
                        }
                        className="w-full flex items-center justify-between px-5 py-4 text-left"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="font-semibold text-[var(--foreground)] font-heading shrink-0">
                            {c.name}
                          </span>
                          {c.description && (
                            <span className="text-sm text-[var(--muted-foreground)] truncate hidden sm:block">
                              {c.description}
                            </span>
                          )}
                        </div>
                        {expanded === c.name ? (
                          <ChevronUp size={14} className="text-[var(--muted-foreground)] shrink-0 ml-2" />
                        ) : (
                          <ChevronDown size={14} className="text-[var(--muted-foreground)] shrink-0 ml-2" />
                        )}
                      </button>
                      <AnimatePresence>
                        {expanded === c.name && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="px-5 pb-5 grid sm:grid-cols-2 gap-4 border-t border-[var(--border)] pt-4">
                              <div>
                                <p className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider mb-2">
                                  Strengths
                                </p>
                                <ul className="space-y-1.5">
                                  {c.strengths.map((s, j) => (
                                    <li
                                      key={j}
                                      className="text-sm text-[var(--foreground)] flex items-start gap-2"
                                    >
                                      <span className="text-emerald-400 mt-0.5 shrink-0">+</span>
                                      {s}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              <div>
                                <p className="text-[10px] font-semibold text-rose-400 uppercase tracking-wider mb-2">
                                  Weaknesses
                                </p>
                                <ul className="space-y-1.5">
                                  {c.weaknesses.map((w, j) => (
                                    <li
                                      key={j}
                                      className="text-sm text-[var(--foreground)] flex items-start gap-2"
                                    >
                                      <span className="text-rose-400 mt-0.5 shrink-0">-</span>
                                      {w}
                                    </li>
                                  ))}
                                </ul>
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

            {/* Market gaps */}
            {results.marketGaps?.filter(Boolean).length > 0 && (
              <div>
                <p className="text-[10px] uppercase tracking-widest text-[var(--muted-foreground)] mb-3 font-heading">
                  Market Gaps
                </p>
                <div className="grid sm:grid-cols-2 gap-3">
                  {results.marketGaps.filter(Boolean).map((gap, i) => (
                    <div
                      key={i}
                      className="border border-[var(--border)] rounded-xl p-4 bg-[var(--card)] flex items-start gap-3"
                    >
                      <span className="w-5 h-5 rounded-md bg-white/8 flex items-center justify-center text-[10px] font-semibold text-[var(--muted-foreground)] shrink-0 mt-0.5 font-heading">
                        {i + 1}
                      </span>
                      <p className="text-sm text-[var(--foreground)] leading-relaxed">{gap}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Whitespace opportunities */}
            {results.whitespaceOpportunities?.filter(Boolean).length > 0 && (
              <div>
                <p className="text-[10px] uppercase tracking-widest text-[var(--muted-foreground)] mb-3 font-heading">
                  Whitespace Opportunities
                </p>
                <div className="space-y-2.5">
                  {results.whitespaceOpportunities.filter(Boolean).map((opp, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className="border border-[var(--primary)] rounded-xl p-4 bg-[var(--accent)] flex items-start gap-3"
                    >
                      <span className="w-5 h-5 rounded-full bg-[var(--primary)] flex items-center justify-center text-[10px] font-bold text-[var(--primary-foreground)] shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <p className="text-sm text-[var(--foreground)] leading-relaxed">{opp}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* CTA */}
            <div className="pt-4 border-t border-[var(--border)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <p className="text-sm text-[var(--muted-foreground)]">
                Market analysis complete. Ready to build your brand.
              </p>
              <Link
                href={`/projects/${projectId}/brand-foundation`}
                className="flex items-center justify-center gap-2 bg-[var(--primary)] text-[var(--primary-foreground)] px-5 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity whitespace-nowrap"
              >
                Brand Foundation
                <ArrowRight size={14} />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

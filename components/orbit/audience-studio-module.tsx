"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, RefreshCw, ChevronDown, ChevronUp, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { AudienceStudio, BrandFoundation } from "@/types/orbit";

interface Props {
  projectId: string;
  projectName: string;
  initialData: AudienceStudio | null;
  brandFoundation: BrandFoundation | null;
}

const LOADING_STEPS = [
  "Reviewing brand foundation...",
  "Researching audience segments...",
  "Building persona profiles...",
  "Mapping buying triggers...",
  "Writing ad hooks...",
];

const PERSONA_COLORS = [
  { border: "border-[#00d4b4]", bg: "bg-[#00d4b4]/10", dot: "#00d4b4" },
  { border: "border-[#7c6ef8]", bg: "bg-[#7c6ef8]/10", dot: "#7c6ef8" },
  { border: "border-[#f59e0b]", bg: "bg-[#f59e0b]/10", dot: "#f59e0b" },
];

type View = "form" | "loading" | "results";

export function AudienceStudioModule({
  projectId,
  projectName,
  initialData,
  brandFoundation,
}: Props) {
  const [view, setView] = useState<View>(initialData ? "results" : "form");
  const [results, setResults] = useState<AudienceStudio | null>(initialData);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<number | null>(0);

  const [targetMarketDescription, setTargetMarketDescription] = useState("");
  const [painPoints, setPainPoints] = useState("");
  const [channels, setChannels] = useState("");

  async function handleSubmit() {
    if (!targetMarketDescription.trim()) {
      setError("Target market description is required.");
      return;
    }
    setError(null);
    setView("loading");
    setLoadingStep(0);

    const interval = setInterval(() => {
      setLoadingStep((p) => Math.min(p + 1, LOADING_STEPS.length - 1));
    }, 1800);

    try {
      const res = await fetch("/api/ai/generate-personas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          targetMarketDescription,
          painPoints,
          channels,
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
      setExpanded(0);
      setView("results");
    } catch {
      clearInterval(interval);
      setError("Network error. Please try again.");
      setView("form");
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
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
              Module 3
            </p>
            <h1 className="text-2xl sm:text-3xl font-heading font-bold text-[var(--foreground)]">
              Audience Studio
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
            {/* Brand context panel */}
            {brandFoundation && (
              <div className="border border-[var(--border)] rounded-xl p-4 bg-[var(--card)]">
                <p className="text-[10px] uppercase tracking-widest text-[var(--muted-foreground)] mb-3 font-heading">
                  From Brand Foundation
                </p>
                <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                  {brandFoundation.valueProp}
                </p>
                {brandFoundation.brandVoice?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {brandFoundation.brandVoice.map((v, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-full bg-white/5 text-[10px] text-[var(--muted-foreground)]"
                      >
                        {v}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {error && (
              <div className="border border-destructive/40 bg-destructive/10 rounded-lg px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                Target Market Description <span className="text-[var(--primary)]">*</span>
              </label>
              <textarea
                value={targetMarketDescription}
                onChange={(e) => setTargetMarketDescription(e.target.value)}
                placeholder="Describe your target audience — who are they, what do they do, what's their context?"
                rows={3}
                className="w-full bg-[var(--card)] border border-[var(--border)] rounded-lg px-3 py-2.5 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] outline-none focus:border-[var(--primary)] transition-colors resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                Known Pain Points{" "}
                <span className="text-[var(--muted-foreground)] font-normal">(optional)</span>
              </label>
              <textarea
                value={painPoints}
                onChange={(e) => setPainPoints(e.target.value)}
                placeholder="Any specific pain points you've already observed or researched"
                rows={2}
                className="w-full bg-[var(--card)] border border-[var(--border)] rounded-lg px-3 py-2.5 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] outline-none focus:border-[var(--primary)] transition-colors resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                Channels They Use{" "}
                <span className="text-[var(--muted-foreground)] font-normal">(optional)</span>
              </label>
              <input
                value={channels}
                onChange={(e) => setChannels(e.target.value)}
                placeholder="e.g. LinkedIn, Instagram, email newsletters, industry blogs"
                className="w-full bg-[var(--card)] border border-[var(--border)] rounded-lg px-3 py-2.5 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] outline-none focus:border-[var(--primary)] transition-colors"
              />
            </div>

            <button
              onClick={handleSubmit}
              className="w-full bg-[var(--primary)] text-[var(--primary-foreground)] py-3 rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity"
            >
              Generate Personas
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
            className="space-y-4"
          >
            {results.personas.map((persona, i) => {
              const colors = PERSONA_COLORS[i % PERSONA_COLORS.length];
              const isOpen = expanded === i;

              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className={`border rounded-xl overflow-hidden ${colors.border}`}
                >
                  {/* Header */}
                  <button
                    onClick={() => setExpanded(isOpen ? null : i)}
                    className="w-full flex items-center justify-between px-5 py-4 text-left"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold font-heading shrink-0 ${colors.bg}`}
                        style={{ color: colors.dot }}
                      >
                        {persona.name?.[0] ?? "?"}
                      </div>
                      <div>
                        <p className="font-semibold text-[var(--foreground)] font-heading">
                          {persona.name}
                        </p>
                        <p className="text-xs text-[var(--muted-foreground)]">
                          {persona.role} · {persona.ageRange}
                        </p>
                      </div>
                    </div>
                    {isOpen ? (
                      <ChevronUp size={14} className="text-[var(--muted-foreground)] shrink-0" />
                    ) : (
                      <ChevronDown size={14} className="text-[var(--muted-foreground)] shrink-0" />
                    )}
                  </button>

                  {/* Body */}
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-5 space-y-5 border-t border-[var(--border)]">
                          {/* Psychographic */}
                          <div className="pt-4">
                            <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                              {persona.psychographicSummary}
                            </p>
                          </div>

                          <div className="grid sm:grid-cols-2 gap-5">
                            {/* Pain points */}
                            <div>
                              <p className="text-[10px] uppercase tracking-widest text-[var(--muted-foreground)] mb-2 font-heading">
                                Pain Points
                              </p>
                              <ul className="space-y-1.5">
                                {persona.painPoints.map((p, j) => (
                                  <li key={j} className="flex items-start gap-2 text-sm text-[var(--foreground)]">
                                    <span className="text-rose-400 mt-0.5 shrink-0">—</span>
                                    {p}
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {/* Buying triggers */}
                            <div>
                              <p className="text-[10px] uppercase tracking-widest text-[var(--muted-foreground)] mb-2 font-heading">
                                Buying Triggers
                              </p>
                              <ul className="space-y-1.5">
                                {persona.buyingTriggers.map((t, j) => (
                                  <li key={j} className="flex items-start gap-2 text-sm text-[var(--foreground)]">
                                    <span className="text-emerald-400 mt-0.5 shrink-0">→</span>
                                    {t}
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {/* Objections */}
                            <div>
                              <p className="text-[10px] uppercase tracking-widest text-[var(--muted-foreground)] mb-2 font-heading">
                                Objections
                              </p>
                              <ul className="space-y-1.5">
                                {persona.objections.map((o, j) => (
                                  <li key={j} className="flex items-start gap-2 text-sm text-[var(--foreground)]">
                                    <span className="text-amber-400 mt-0.5 shrink-0">?</span>
                                    {o}
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {/* Channels */}
                            <div>
                              <p className="text-[10px] uppercase tracking-widest text-[var(--muted-foreground)] mb-2 font-heading">
                                Channels
                              </p>
                              <div className="flex flex-wrap gap-1.5">
                                {persona.preferredChannels.map((c, j) => (
                                  <span
                                    key={j}
                                    className="px-2.5 py-1 rounded-full border border-[var(--border)] bg-[var(--card)] text-xs text-[var(--foreground)]"
                                  >
                                    {c}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Ad hook */}
                          {persona.sampleAdHook && (
                            <div
                              className={`rounded-xl p-4 ${colors.bg} border ${colors.border}`}
                            >
                              <p className="text-[10px] uppercase tracking-widest mb-2 font-heading"
                                style={{ color: colors.dot }}>
                                Sample Ad Hook
                              </p>
                              <p className="text-sm font-medium text-[var(--foreground)] italic">
                                "{persona.sampleAdHook}"
                              </p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}

            {/* CTA */}
            <div className="pt-4 border-t border-[var(--border)] flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-[var(--primary)]" />
                <p className="text-sm text-[var(--muted-foreground)]">
                  Phase 1 complete. All 3 modules done.
                </p>
              </div>
              <Link
                href={`/projects/${projectId}`}
                className="flex items-center justify-center gap-2 bg-[var(--primary)] text-[var(--primary-foreground)] px-5 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity whitespace-nowrap"
              >
                View Project Overview
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

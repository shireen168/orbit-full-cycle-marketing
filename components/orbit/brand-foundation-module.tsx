"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, X, ArrowRight, RefreshCw, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { BrandFoundation, MarketIntel } from "@/types/orbit";

interface Props {
  projectId: string;
  projectName: string;
  initialData: BrandFoundation | null;
  marketIntel: MarketIntel | null;
}

const LOADING_STEPS = [
  "Reviewing market intelligence...",
  "Crafting positioning statement...",
  "Building messaging pillars...",
  "Defining brand voice...",
  "Writing tagline options...",
];

type View = "form" | "loading" | "results";

export function BrandFoundationModule({
  projectId,
  projectName,
  initialData,
  marketIntel,
}: Props) {
  const [view, setView] = useState<View>(initialData ? "results" : "form");
  const [results, setResults] = useState<BrandFoundation | null>(initialData);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [selectedTagline, setSelectedTagline] = useState(
    initialData?.selectedTagline ?? ""
  );

  const [productName, setProductName] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [uniqueFeatures, setUniqueFeatures] = useState(["", "", ""]);
  const [targetMarket, setTargetMarket] = useState("");

  function updateFeature(i: number, value: string) {
    setUniqueFeatures((p) => p.map((f, idx) => (idx === i ? value : f)));
  }

  async function handleSubmit() {
    if (!productName.trim() || !productDescription.trim() || !targetMarket.trim()) {
      setError("Product name, description, and target market are required.");
      return;
    }
    setError(null);
    setView("loading");
    setLoadingStep(0);

    const interval = setInterval(() => {
      setLoadingStep((p) => Math.min(p + 1, LOADING_STEPS.length - 1));
    }, 1800);

    try {
      const res = await fetch("/api/ai/build-brand", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          productName,
          productDescription,
          uniqueFeatures: uniqueFeatures.filter(Boolean),
          targetMarket,
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
      setSelectedTagline(data.taglines?.[0] ?? "");
      setView("results");
    } catch {
      clearInterval(interval);
      setError("Network error. Please try again.");
      setView("form");
    }
  }

  async function saveTagline(tagline: string) {
    setSelectedTagline(tagline);
    await fetch(`/api/projects/${projectId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        brand_foundation: { ...results, selectedTagline: tagline },
      }),
    });
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
              Module 2
            </p>
            <h1 className="text-2xl sm:text-3xl font-heading font-bold text-[var(--foreground)]">
              Brand Foundation
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
            {/* M1 context panel */}
            {marketIntel && (
              <div className="border border-[var(--border)] rounded-xl p-4 bg-[var(--card)]">
                <p className="text-[10px] uppercase tracking-widest text-[var(--muted-foreground)] mb-3 font-heading">
                  From Market Intelligence
                </p>
                <div className="space-y-2">
                  {marketIntel.whitespaceOpportunities?.slice(0, 2).map((opp, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] mt-1.5 shrink-0" />
                      <p className="text-xs text-[var(--muted-foreground)]">{opp}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {error && (
              <div className="border border-destructive/40 bg-destructive/10 rounded-lg px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                Product Name <span className="text-[var(--primary)]">*</span>
              </label>
              <input
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="e.g. Orbit"
                className="w-full bg-[var(--card)] border border-[var(--border)] rounded-lg px-3 py-2.5 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] outline-none focus:border-[var(--primary)] transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                Product Description <span className="text-[var(--primary)]">*</span>
              </label>
              <textarea
                value={productDescription}
                onChange={(e) => setProductDescription(e.target.value)}
                placeholder="What does your product do and who does it help?"
                rows={3}
                className="w-full bg-[var(--card)] border border-[var(--border)] rounded-lg px-3 py-2.5 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] outline-none focus:border-[var(--primary)] transition-colors resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                Unique Features{" "}
                <span className="text-[var(--muted-foreground)] font-normal">(up to 3)</span>
              </label>
              <div className="space-y-2.5">
                {uniqueFeatures.map((f, i) => (
                  <input
                    key={i}
                    value={f}
                    onChange={(e) => updateFeature(i, e.target.value)}
                    placeholder={`Feature ${i + 1}`}
                    className="w-full bg-[var(--card)] border border-[var(--border)] rounded-lg px-3 py-2.5 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] outline-none focus:border-[var(--primary)] transition-colors"
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                Target Market <span className="text-[var(--primary)]">*</span>
              </label>
              <input
                value={targetMarket}
                onChange={(e) => setTargetMarket(e.target.value)}
                placeholder="e.g. Marketing managers at B2B SaaS companies"
                className="w-full bg-[var(--card)] border border-[var(--border)] rounded-lg px-3 py-2.5 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] outline-none focus:border-[var(--primary)] transition-colors"
              />
            </div>

            <button
              onClick={handleSubmit}
              className="w-full bg-[var(--primary)] text-[var(--primary-foreground)] py-3 rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity"
            >
              Build Brand Foundation
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
            {/* Positioning statement */}
            <div className="border border-[var(--primary)] rounded-xl p-6 bg-[var(--accent)]">
              <p className="text-[10px] uppercase tracking-widest text-[var(--primary)] mb-3 font-heading">
                Positioning Statement
              </p>
              <p className="text-[var(--foreground)] leading-relaxed text-sm sm:text-base font-medium">
                {results.positioningStatement}
              </p>
            </div>

            {/* Value prop */}
            <div className="border border-[var(--border)] rounded-xl p-5 bg-[var(--card)]">
              <p className="text-[10px] uppercase tracking-widest text-[var(--muted-foreground)] mb-2 font-heading">
                Value Proposition
              </p>
              <p className="text-[var(--foreground)] leading-relaxed text-sm sm:text-base">
                {results.valueProp}
              </p>
            </div>

            {/* Messaging pillars */}
            {results.messagingPillars?.length > 0 && (
              <div>
                <p className="text-[10px] uppercase tracking-widest text-[var(--muted-foreground)] mb-3 font-heading">
                  Messaging Pillars
                </p>
                <div className="grid sm:grid-cols-3 gap-3">
                  {results.messagingPillars.map((pillar, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className="border border-[var(--border)] rounded-xl p-4 bg-[var(--card)]"
                    >
                      <div className="text-2xl mb-3">{pillar.icon}</div>
                      <p className="font-semibold text-[var(--foreground)] font-heading text-sm mb-1.5">
                        {pillar.title}
                      </p>
                      <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                        {pillar.description}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Brand voice */}
            {results.brandVoice?.length > 0 && (
              <div>
                <p className="text-[10px] uppercase tracking-widest text-[var(--muted-foreground)] mb-3 font-heading">
                  Brand Voice
                </p>
                <div className="flex flex-wrap gap-2">
                  {results.brandVoice.map((v, i) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 rounded-full border border-[var(--border)] bg-[var(--card)] text-sm text-[var(--foreground)]"
                    >
                      {v}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Taglines */}
            {results.taglines?.length > 0 && (
              <div>
                <p className="text-[10px] uppercase tracking-widest text-[var(--muted-foreground)] mb-3 font-heading">
                  Tagline Options
                </p>
                <div className="space-y-2">
                  {results.taglines.map((tagline, i) => (
                    <button
                      key={i}
                      onClick={() => saveTagline(tagline)}
                      className={`w-full text-left px-5 py-3.5 rounded-xl border transition-colors text-sm font-medium ${
                        selectedTagline === tagline
                          ? "border-[var(--primary)] bg-[var(--accent)] text-[var(--foreground)]"
                          : "border-[var(--border)] bg-[var(--card)] text-[var(--muted-foreground)] hover:border-white/15 hover:text-[var(--foreground)]"
                      }`}
                    >
                      <span className="mr-3 text-[var(--muted-foreground)]">
                        {i + 1}.
                      </span>
                      {tagline}
                    </button>
                  ))}
                </div>
                {selectedTagline && (
                  <p className="mt-2 text-xs text-[var(--muted-foreground)]">
                    Selected tagline saved.
                  </p>
                )}
              </div>
            )}

            {/* CTA */}
            <div className="pt-4 border-t border-[var(--border)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <p className="text-sm text-[var(--muted-foreground)]">
                Brand foundation built. Ready to define your audience.
              </p>
              <Link
                href={`/projects/${projectId}/audience-studio`}
                className="flex items-center justify-center gap-2 bg-[var(--primary)] text-[var(--primary-foreground)] px-5 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity whitespace-nowrap"
              >
                Audience Studio
                <ArrowRight size={14} />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

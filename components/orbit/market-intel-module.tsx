"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import type { MarketIntel } from "@/types/orbit";
import { MarketIntelForm, type CompetitorInput } from "./market-intel-form";
import { MarketIntelResults } from "./market-intel-results";
import { ModuleLoading } from "./module-loading";
import { RegenConfirm } from "./regen-confirm";
import { useCredits } from "@/context/credits-context";

const LOADING_STEPS = [
  "Researching live market data...",
  "Analyzing competitor landscape...",
  "Mapping market positioning...",
  "Identifying market gaps...",
  "Surfacing whitespace opportunities...",
];

type View = "form" | "loading" | "results";

interface Props {
  projectId: string;
  projectName: string;
  initialData: MarketIntel | null;
}

export function MarketIntelModule({ projectId, projectName, initialData }: Props) {
  const [view, setView] = useState<View>(initialData ? "results" : "form");
  const [results, setResults] = useState<MarketIntel | null>(initialData);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const { update: updateCredits } = useCredits();

  async function handleSubmit(data: { industry: string; productCategory: string; competitors: CompetitorInput[] }) {
    setError(null);
    setView("loading");
    setLoadingStep(0);
    const interval = setInterval(() => setLoadingStep((p) => Math.min(p + 1, LOADING_STEPS.length - 1)), 2200);
    try {
      const res = await fetch("/api/ai/analyze-market", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, ...data }),
      });
      clearInterval(interval);
      if (!res.ok) {
        const err = await res.json();
        setError(err.error ?? "Something went wrong. Please try again.");
        setView("form");
        return;
      }
      const creditsHeader = res.headers.get("X-Credits-Remaining");
      if (creditsHeader !== null) updateCredits(Number(creditsHeader));
      const { data: result } = await res.json();
      setResults(result);
      setView("results");
    } catch {
      clearInterval(interval);
      setError("Network error. Please try again.");
      setView("form");
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-10 relative">
      {/* Ambient decorative orbs */}
      <div
        className="absolute -top-4 -right-4 w-80 h-80 rounded-full bg-[var(--primary)]/5 blur-3xl pointer-events-none select-none animate-pulse"
        style={{ animationDuration: "6s" }}
      />
      <div
        className="absolute top-20 right-32 w-48 h-48 rounded-full bg-cyan-500/4 blur-3xl pointer-events-none select-none animate-pulse"
        style={{ animationDuration: "9s", animationDelay: "3s" }}
      />

      <div className="mb-8 relative">
        <Link href={`/projects/${projectId}`} className="inline-flex items-center gap-2 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors mb-5">
          <ArrowLeft size={14} /> {projectName}
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-[var(--muted-foreground)] mb-2 font-heading">Module 1</p>
            <h1 className="text-2xl sm:text-3xl font-heading font-bold text-[var(--foreground)]">Market Intelligence</h1>
          </div>
          {view === "results" && <RegenConfirm onConfirm={() => setView("form")} />}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {view === "form"    && <MarketIntelForm    key="form"    onSubmit={handleSubmit} error={error} />}
        {view === "loading" && <ModuleLoading      key="loading" loadingStep={loadingStep} steps={LOADING_STEPS} />}
        {view === "results" && results && <MarketIntelResults key="results" results={results} projectId={projectId} />}
      </AnimatePresence>
    </div>
  );
}

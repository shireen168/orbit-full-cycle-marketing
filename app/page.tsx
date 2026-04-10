"use client";

import "./landing.css";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { ArrowRight } from "lucide-react";
import { LandingBackground } from "@/components/landing/landing-background";
import { LandingHero } from "@/components/landing/landing-hero";
import { ModuleCard, modules, cardVariant } from "@/components/landing/module-card";
import { StepRow, steps } from "@/components/landing/step-row";
import { StarButton } from "@/components/landing/star-button";
import { RidgeButton } from "@/components/landing/ridge-button";

const stagger = { animate: { transition: { staggerChildren: 0.12 } } };

export default function LandingPage() {
  const modulesRef = useRef(null);
  const modulesInView = useInView(modulesRef, { once: true, margin: "-100px" });

  return (
    <div className="min-h-screen flex flex-col relative overflow-x-hidden" style={{ background: "oklch(0.09 0.008 265)", color: "oklch(0.93 0.006 260)" }}>
      <LandingBackground />

      {/* Nav */}
      <motion.nav initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: "easeOut" as const }} className="relative z-10 flex items-center justify-between px-6 md:px-12 py-5">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "oklch(0.72 0.16 185)", boxShadow: "0 0 16px oklch(0.72 0.16 185 / 0.5)" }}>
            <span className="text-xs font-bold" style={{ color: "oklch(0.09 0.008 265)", fontFamily: "var(--font-syne)" }}>O</span>
          </div>
          <span className="text-base font-semibold tracking-tight" style={{ fontFamily: "var(--font-syne)" }}>Orbit</span>
        </div>
        <SignInButton mode="redirect" forceRedirectUrl="/dashboard">
          <StarButton />
        </SignInButton>
      </motion.nav>

      <LandingHero />

      {/* Modules */}
      <section ref={modulesRef} className="relative z-10 px-6 md:px-12 lg:px-24 pb-28">
        <div className="max-w-5xl mx-auto flex flex-col gap-12">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={modulesInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, ease: "easeOut" as const }} className="flex flex-col gap-2">
            <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: "oklch(0.72 0.16 185)" }}>Three phases</span>
            <h2 className="text-3xl md:text-4xl font-bold" style={{ fontFamily: "var(--font-syne)", color: "oklch(0.93 0.006 260)" }}>The full marketing intelligence stack</h2>
          </motion.div>
          <motion.div variants={stagger} initial="initial" animate={modulesInView ? "animate" : "initial"} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {modules.map((mod) => <ModuleCard key={mod.number} mod={mod} />)}
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section className="relative z-10 px-6 md:px-12 lg:px-24 pb-28">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-16 items-start">
          <div className="flex flex-col gap-3">
            <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: "oklch(0.72 0.16 185)" }}>Workflow</span>
            <h2 className="text-3xl md:text-4xl font-bold leading-snug" style={{ fontFamily: "var(--font-syne)", color: "oklch(0.93 0.006 260)" }}>Zero guesswork.<br />Just signal.</h2>
            <p className="text-sm leading-relaxed mt-2" style={{ color: "oklch(0.78 0.015 260)" }}>
              Each module builds on the last. Market data informs your brand. Your brand shapes your audience. The output of every phase becomes the context for the next.
            </p>
          </div>
          <div className="flex flex-col gap-8">
            {steps.map((step, i) => <StepRow key={step.n} step={step} index={i} />)}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="relative z-10 px-6 md:px-12 lg:px-24 pb-24">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.7, ease: "easeOut" as const }} className="relative rounded-3xl p-12 md:p-16 flex flex-col items-center text-center gap-7 overflow-hidden" style={{ background: "oklch(0.12 0.009 265)", border: "1px solid oklch(0.72 0.16 185 / 0.2)" }}>
            <div className="absolute inset-0 pointer-events-none rounded-3xl" style={{ background: "radial-gradient(ellipse at 50% 0%, oklch(0.72 0.16 185 / 0.1) 0%, transparent 60%)" }} />
            <h2 className="relative text-3xl md:text-5xl font-extrabold leading-tight" style={{ fontFamily: "var(--font-syne)", color: "oklch(0.93 0.006 260)" }}>
              Build your brand strategy <span style={{ color: "oklch(0.72 0.16 185)", textShadow: "0 0 30px oklch(0.72 0.16 185 / 0.4)" }}>today</span>.
            </h2>
            <p className="relative text-base max-w-md leading-relaxed" style={{ color: "oklch(0.82 0.012 260)" }}>
              Free to start. No credit card required. Run your first market analysis in minutes.
            </p>
            <SignUpButton mode="redirect" forceRedirectUrl="/dashboard">
              <RidgeButton className="relative">Start for free <ArrowRight size={14} /></RidgeButton>
            </SignUpButton>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 flex items-center justify-center px-6 py-6 border-t" style={{ borderColor: "oklch(1 0 0 / 0.06)", color: "oklch(0.55 0.01 260)" }}>
        <span className="text-xs text-center" style={{ fontFamily: "var(--font-syne)" }}>
          © {new Date().getFullYear()} Orbit &nbsp;·&nbsp; Built by{" "}
          <a href="https://github.com/shireen-mvps" target="_blank" rel="noopener noreferrer" style={{ color: "oklch(0.72 0.16 185)", textDecoration: "none" }} onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.textDecoration = "underline")} onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.textDecoration = "none")}>Shireen</a>
          &nbsp;·&nbsp; Powered by Claude Code
        </span>
      </footer>
    </div>
  );
}

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import type { OrbitProject } from "@/types/orbit";

function getNextStep(p: OrbitProject): { label: string; href: string } {
  if (!p.market_intel)     return { label: "Start Market Intel",     href: `/projects/${p.id}/market-intel` };
  if (!p.brand_foundation) return { label: "Build Brand Foundation", href: `/projects/${p.id}/brand-foundation` };
  if (!p.audience_studio)  return { label: "Generate Personas",      href: `/projects/${p.id}/audience-studio` };
  return { label: "View Project", href: `/projects/${p.id}` };
}

function ModuleChip({ label, done, available }: { label: string; done: boolean; available: boolean }) {
  return (
    <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${done ? "bg-[var(--primary)] text-[var(--primary-foreground)]" : available ? "bg-white/8 text-[var(--muted-foreground)]" : "bg-white/4 text-white/20"}`}>
      {label}
    </span>
  );
}

export function ProjectCard({ project, index }: { project: OrbitProject; index: number }) {
  const m1 = !!project.market_intel;
  const m2 = !!project.brand_foundation;
  const m3 = !!project.audience_studio;
  const completed = [m1, m2, m3].filter(Boolean).length;
  const next = getNextStep(project);

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05, duration: 0.3 }}>
      <Link href={`/projects/${project.id}`} className="block">
        <div className="border border-[var(--border)] rounded-xl p-5 bg-[var(--card)] hover:border-white/15 transition-colors group">
          <div className="flex items-start justify-between mb-4">
            <h2 className="font-semibold text-[var(--foreground)] font-heading leading-snug">{project.name}</h2>
            <span className="text-xs text-[var(--muted-foreground)] shrink-0 ml-3">{completed}/3</span>
          </div>
          <div className="flex items-center gap-2 mb-5">
            <ModuleChip label="M1" done={m1} available={true} />
            <ModuleChip label="M2" done={m2} available={m1} />
            <ModuleChip label="M3" done={m3} available={m2} />
          </div>
          <div className="flex items-center gap-1.5 text-sm font-medium text-[var(--primary)] group-hover:opacity-75 transition-opacity">
            {next.label} <ArrowRight size={13} />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

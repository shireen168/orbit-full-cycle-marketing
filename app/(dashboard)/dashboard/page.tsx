"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Layers } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { OrbitProject } from "@/types/orbit";
import { ProjectCard } from "@/components/orbit/project-card";

export default function DashboardPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<OrbitProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/projects")
      .then((r) => r.json())
      .then((data) => Array.isArray(data) && setProjects(data))
      .finally(() => setLoading(false));
  }, []);

  async function handleCreate() {
    const name = newName.trim();
    if (!name || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (res.ok) {
        const project = await res.json();
        router.push(`/projects/${project.id}`);
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-heading font-bold text-[var(--foreground)]">Projects</h1>
          {!loading && <p className="text-[var(--muted-foreground)] text-sm mt-1">{projects.length} {projects.length === 1 ? "project" : "projects"}</p>}
        </div>
        <button onClick={() => setCreating(true)} className="flex items-center gap-2 bg-[var(--primary)] text-[var(--primary-foreground)] px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity">
          <Plus size={14} /> New Project
        </button>
      </div>

      <AnimatePresence>
        {creating && (
          <motion.div initial={{ opacity: 0, y: -8, height: 0 }} animate={{ opacity: 1, y: 0, height: "auto" }} exit={{ opacity: 0, y: -8, height: 0 }} transition={{ duration: 0.2 }} className="mb-6 overflow-hidden">
            <div className="border border-[var(--primary)] rounded-xl p-5 bg-[var(--card)]">
              <p className="text-sm font-semibold text-[var(--foreground)] mb-3 font-heading">Name your project</p>
              <div className="flex gap-3">
                <input
                  autoFocus
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleCreate(); if (e.key === "Escape") { setCreating(false); setNewName(""); } }}
                  placeholder="e.g. Acme SaaS go-to-market"
                  className="flex-1 bg-[var(--input)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] outline-none focus:border-[var(--primary)] transition-colors"
                />
                <button onClick={handleCreate} disabled={!newName.trim() || submitting} className="bg-[var(--primary)] text-[var(--primary-foreground)] px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-40 hover:opacity-90 transition-opacity">
                  {submitting ? "Creating..." : "Create"}
                </button>
                <button onClick={() => { setCreating(false); setNewName(""); }} className="px-3 py-2 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(2)].map((_, i) => <div key={i} className="h-40 rounded-xl bg-[var(--card)] animate-pulse" />)}
        </div>
      ) : projects.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="flex flex-col items-center justify-center py-28 border border-dashed border-[var(--border)] rounded-xl text-center">
          <div className="w-12 h-12 rounded-xl bg-[var(--card)] border border-[var(--border)] flex items-center justify-center mb-4">
            <Layers size={20} className="text-[var(--muted-foreground)]" />
          </div>
          <p className="font-semibold text-[var(--foreground)] font-heading mb-1">No projects yet</p>
          <p className="text-sm text-[var(--muted-foreground)] mb-6 max-w-xs">Create a project to start building your market intelligence and brand strategy.</p>
          <button onClick={() => setCreating(true)} className="flex items-center gap-2 bg-[var(--primary)] text-[var(--primary-foreground)] px-5 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity">
            <Plus size={14} /> New Project
          </button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((project, i) => <ProjectCard key={project.id} project={project} index={i} />)}
        </div>
      )}
    </div>
  );
}

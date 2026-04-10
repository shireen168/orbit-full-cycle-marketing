"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { Layers, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { OrbitProject } from "@/types/orbit";

interface SidebarProps {
  onClose?: () => void;
}

export function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname();
  const [projects, setProjects] = useState<OrbitProject[]>([]);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/projects")
      .then((r) => r.json())
      .then((data) => Array.isArray(data) && setProjects(data))
      .catch(() => {});
  }, [pathname]);

  function handleNav() {
    onClose?.();
  }

  async function createProject() {
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
        setProjects((prev) => [project, ...prev]);
        setNewName("");
        setCreating(false);
        onClose?.();
        window.location.href = `/projects/${project.id}`;
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <aside className="w-[240px] shrink-0 flex flex-col h-full border-r border-[var(--sidebar-border)] bg-[var(--sidebar)]">
      {/* Logo */}
      <div className="px-5 h-12 flex items-center border-b border-[var(--sidebar-border)]">
        <Link href="/dashboard" onClick={handleNav} className="flex items-center gap-0.5">
          <span className="font-heading text-lg font-bold tracking-tight text-[var(--foreground)]">
            Orbit
          </span>
          <span className="text-[var(--primary)] text-xl leading-none mb-0.5">.</span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        <Link
          href="/dashboard"
          onClick={handleNav}
          className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors ${
            pathname === "/dashboard"
              ? "bg-[var(--sidebar-accent)] text-[var(--sidebar-accent-foreground)] font-medium"
              : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-white/5"
          }`}
        >
          <Layers size={14} />
          All Projects
        </Link>

        {/* Project list */}
        {projects.length > 0 && (
          <div className="pt-5">
            <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-[var(--muted-foreground)]">
              Projects
            </p>
            <div className="space-y-0.5">
              {projects.map((p) => {
                const active = pathname.startsWith(`/projects/${p.id}`);
                return (
                  <Link
                    key={p.id}
                    href={`/projects/${p.id}`}
                    onClick={handleNav}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors truncate ${
                      active
                        ? "bg-[var(--sidebar-accent)] text-[var(--sidebar-accent-foreground)] font-medium"
                        : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-white/5"
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-current opacity-50 shrink-0" />
                    <span className="truncate">{p.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* New project */}
        <div className="pt-3">
          <AnimatePresence mode="wait">
            {creating ? (
              <motion.div
                key="input"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                className="px-2 py-1"
              >
                <input
                  autoFocus
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") createProject();
                    if (e.key === "Escape") {
                      setCreating(false);
                      setNewName("");
                    }
                  }}
                  placeholder="Project name..."
                  className="w-full bg-white/8 border border-white/10 rounded-md px-2.5 py-1.5 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] outline-none focus:border-[var(--primary)] transition-colors"
                />
                <p className="mt-1 text-[10px] text-[var(--muted-foreground)] px-1">
                  Enter to save · Esc to cancel
                </p>
              </motion.div>
            ) : (
              <motion.button
                key="button"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setCreating(true)}
                className="flex items-center gap-2 px-3 py-2 w-full rounded-md text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-white/5 transition-colors"
              >
                <Plus size={13} />
                New project
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </nav>

      {/* User */}
      <div className="px-4 py-3 border-t border-[var(--sidebar-border)] flex items-center gap-3">
        <UserButton />
        <p className="text-xs text-[var(--muted-foreground)] truncate">Account</p>
      </div>
    </aside>
  );
}

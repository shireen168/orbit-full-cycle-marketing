"use client";

import type { Competitor } from "@/types/orbit";

const COLORS = ["#00d4b4", "#7c6ef8", "#f59e0b", "#ef4444", "#10b981"];

const CX = 150;
const CY = 150;
const R  = 90;

const AXES = [
  { key: "reputationScore" as keyof Competitor, label: "Reputation", ax: CX,     ay: CY - R, lx: CX,     ly: CY - R - 16, anchor: "middle"  as const, baseline: "auto"    as const },
  { key: "reachScore"      as keyof Competitor, label: "Reach",       ax: CX + R, ay: CY,     lx: CX + R + 14, ly: CY,     anchor: "start"  as const, baseline: "middle"  as const },
  { key: "featureScore"    as keyof Competitor, label: "Quality",     ax: CX,     ay: CY + R, lx: CX,          ly: CY + R + 16, anchor: "middle" as const, baseline: "hanging" as const },
  { key: "priceScore"      as keyof Competitor, label: "Price",       ax: CX - R, ay: CY,     lx: CX - R - 14, ly: CY,     anchor: "end"    as const, baseline: "middle"  as const },
];

function point(score: number, axisIdx: number): [number, number] {
  const ratio = Math.max(1, Math.min(10, score ?? 5) - 1) / 9;
  const { ax, ay } = AXES[axisIdx];
  const dx = ax - CX;
  const dy = ay - CY;
  return [CX + dx * ratio, CY + dy * ratio];
}

function gridPoints(frac: number): string {
  return AXES.map(({ ax, ay }) => {
    const x = CX + (ax - CX) * frac;
    const y = CY + (ay - CY) * frac;
    return `${x},${y}`;
  }).join(" ");
}

function competitorPath(c: Competitor): string {
  return AXES.map((_, i) => {
    const score = c[AXES[i].key] as number | undefined;
    const [x, y] = point(score ?? 5, i);
    return `${x},${y}`;
  }).join(" ");
}

export function RadarChart({ competitors }: { competitors: Competitor[] }) {
  return (
    <div className="border border-[var(--border)] rounded-xl p-5 bg-[var(--card)]">
      <div className="w-full max-w-xs mx-auto">
        <svg viewBox="0 0 300 300" className="w-full" style={{ overflow: "visible" }}>
          <defs>
            <filter id="radar-glow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Grid rings */}
          {[0.25, 0.5, 0.75, 1].map((frac) => (
            <polygon
              key={frac}
              points={gridPoints(frac)}
              fill="none"
              stroke={frac === 1 ? "rgba(0,212,180,0.2)" : "rgba(255,255,255,0.07)"}
              strokeWidth={frac === 1 ? 1 : 0.75}
            />
          ))}

          {/* Axis lines */}
          {AXES.map(({ ax, ay, label }) => (
            <line
              key={label}
              x1={CX} y1={CY}
              x2={ax} y2={ay}
              stroke="rgba(0,212,180,0.2)"
              strokeWidth={1}
              strokeDasharray="3 3"
            />
          ))}

          {/* Center dot */}
          <circle cx={CX} cy={CY} r={2.5} fill="rgba(0,212,180,0.4)" filter="url(#radar-glow)">
            <animate attributeName="opacity" values="0.4;0.9;0.4" dur="3s" repeatCount="indefinite" />
          </circle>

          {/* Competitor polygons */}
          {competitors.map((c, i) => (
            <polygon
              key={c.name}
              points={competitorPath(c)}
              fill={COLORS[i % COLORS.length]}
              fillOpacity={0.08}
              stroke={COLORS[i % COLORS.length]}
              strokeWidth={1.5}
              strokeOpacity={0.75}
            />
          ))}

          {/* Competitor dots on axes */}
          {competitors.map((c, i) =>
            AXES.map((_, axIdx) => {
              const score = c[AXES[axIdx].key] as number | undefined;
              const [x, y] = point(score ?? 5, axIdx);
              return (
                <circle
                  key={`${c.name}-${axIdx}`}
                  cx={x} cy={y} r={3}
                  fill={COLORS[i % COLORS.length]}
                  opacity={0.9}
                />
              );
            })
          )}

          {/* Axis labels */}
          {AXES.map(({ label, lx, ly, anchor, baseline }) => (
            <text
              key={label}
              x={lx} y={ly}
              textAnchor={anchor}
              dominantBaseline={baseline}
              fill="rgba(0,212,180,0.8)"
              fontSize={10}
              fontWeight="600"
              filter="url(#radar-glow)"
            >
              {label}
              <animate attributeName="opacity" values="0.8;1;0.8" dur="4s" repeatCount="indefinite" />
            </text>
          ))}

          {/* Score ring labels (25%, 50%, 75%) */}
          {[0.25, 0.5, 0.75].map((frac) => (
            <text
              key={frac}
              x={CX + 3}
              y={CY - R * frac - 2}
              fill="rgba(255,255,255,0.2)"
              fontSize={7}
              textAnchor="start"
            >
              {Math.round(frac * 10)}
            </text>
          ))}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-2 justify-center mt-3">
        {competitors.map((c, i) => (
          <div key={c.name} className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)]">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
            {c.name}
          </div>
        ))}
      </div>
    </div>
  );
}

"use client";

import type { Competitor, UserBrandScores } from "@/types/orbit";

const COLORS = ["#7c6ef8", "#f59e0b", "#60a5fa", "#f97316", "#a78bfa"];
const USER_COLOR = "#ef4444"; // red -- high contrast, distinct from all competitor colors

// Enlarged ~35% from original
const CX = 190;
const CY = 190;
const R  = 122;

const AXES = [
  { key: "reputationScore" as keyof Competitor, label: "Reputation", ax: CX,     ay: CY - R },
  { key: "reachScore"      as keyof Competitor, label: "Reach",      ax: CX + R, ay: CY     },
  { key: "featureScore"    as keyof Competitor, label: "Quality",    ax: CX,     ay: CY + R },
  { key: "priceScore"      as keyof Competitor, label: "Price",      ax: CX - R, ay: CY     },
];

const LABEL_PROPS = [
  { x: CX,          y: CY - R - 22, anchor: "middle" as const, baseline: "auto"    as const },
  { x: CX + R + 20, y: CY,          anchor: "start"  as const, baseline: "middle"  as const },
  { x: CX,          y: CY + R + 22, anchor: "middle" as const, baseline: "hanging" as const },
  { x: CX - R - 20, y: CY,          anchor: "end"    as const, baseline: "middle"  as const },
];

const RING_LABELS = [
  { frac: 0.25, label: "2.5", x: CX + 6, y: CY - R * 0.25 - 4 },
  { frac: 0.5,  label: "5",   x: CX + 6, y: CY - R * 0.5  - 4 },
  { frac: 0.75, label: "7.5", x: CX + 6, y: CY - R * 0.75 - 4 },
];

function toPoint(score: number | undefined, axisIdx: number): [number, number] {
  const ratio = (Math.max(1, Math.min(10, score ?? 5)) - 1) / 9;
  const { ax, ay } = AXES[axisIdx];
  return [CX + (ax - CX) * ratio, CY + (ay - CY) * ratio];
}

function gridPolygon(frac: number): string {
  return AXES.map(({ ax, ay }) => `${CX + (ax - CX) * frac},${CY + (ay - CY) * frac}`).join(" ");
}

function competitorPolygon(c: Competitor): string {
  return AXES.map((_, i) => {
    const [x, y] = toPoint(c[AXES[i].key] as number | undefined, i);
    return `${x},${y}`;
  }).join(" ");
}

function userBrandPolygon(ub: UserBrandScores): string {
  const scoreMap: Record<string, number | undefined> = {
    reputationScore: ub.reputationScore,
    reachScore: ub.reachScore,
    featureScore: ub.featureScore,
    priceScore: ub.priceScore,
  };
  return AXES.map((axis, i) => {
    const [x, y] = toPoint(scoreMap[axis.key as string], i);
    return `${x},${y}`;
  }).join(" ");
}

interface Props {
  competitors: Competitor[];
  userBrand?: UserBrandScores;
}

export function RadarChart({ competitors, userBrand }: Props) {
  return (
    <div className="border border-[var(--border)] rounded-xl p-5 bg-[var(--card)]">
      <div className="w-full max-w-sm mx-auto">
        <svg viewBox="0 0 380 380" className="w-full" style={{ overflow: "visible" }}>
          <defs>
            <filter id="radar-glow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="dot-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {[0.25, 0.5, 0.75, 1].map((frac, i) => (
            <polygon
              key={frac}
              className="radar-ring"
              points={gridPolygon(frac)}
              fill={frac === 1 ? "rgba(0,212,180,0.04)" : "none"}
              stroke={frac === 1 ? "rgba(0,212,180,0.3)" : "rgba(0,212,180,0.12)"}
              strokeWidth={frac === 1 ? 1 : 0.75}
              style={{ animationDelay: `${i * 0.07}s` }}
            />
          ))}

          {AXES.map(({ ax, ay, label }) => (
            <line
              key={label}
              x1={CX} y1={CY} x2={ax} y2={ay}
              stroke="rgba(0,212,180,0.18)"
              strokeWidth={1}
              strokeDasharray="3 3"
            />
          ))}

          {RING_LABELS.map(({ label, x, y, frac }) => (
            <text
              key={frac}
              x={x} y={y}
              fill="rgba(0,212,180,0.55)"
              fontSize={9}
              fontWeight="500"
              textAnchor="start"
              dominantBaseline="auto"
            >
              {label}
            </text>
          ))}

          <circle cx={CX} cy={CY} r={3} fill="rgba(0,212,180,0.5)" filter="url(#dot-glow)">
            <animate attributeName="opacity" values="0.5;1;0.5" dur="3s" repeatCount="indefinite" />
          </circle>

          {/* Competitor polygons */}
          {competitors.map((c, i) => (
            <polygon
              key={c.name}
              className="radar-polygon"
              points={competitorPolygon(c)}
              fill={COLORS[i % COLORS.length]}
              fillOpacity={0.09}
              stroke={COLORS[i % COLORS.length]}
              strokeWidth={1.5}
              strokeOpacity={0.8}
              style={{ animationDelay: `${0.28 + i * 0.12}s` }}
            />
          ))}

          {/* User brand polygon -- dashed, distinct color */}
          {userBrand && (
            <polygon
              className="radar-polygon"
              points={userBrandPolygon(userBrand)}
              fill={USER_COLOR}
              fillOpacity={0.07}
              stroke={USER_COLOR}
              strokeWidth={1.5}
              strokeOpacity={0.9}
              strokeDasharray="5 3"
              style={{ animationDelay: `${0.28 + competitors.length * 0.12}s` }}
            />
          )}

          {/* Competitor vertex dots */}
          {competitors.map((c, i) =>
            AXES.map((_, axIdx) => {
              const [x, y] = toPoint(c[AXES[axIdx].key] as number | undefined, axIdx);
              return (
                <circle
                  key={`${c.name}-${axIdx}`}
                  cx={x} cy={y} r={4}
                  fill={COLORS[i % COLORS.length]}
                  opacity={0}
                  filter="url(#dot-glow)"
                  style={{
                    animation: "radar-fade-in 0.4s ease-out forwards",
                    animationDelay: `${0.5 + i * 0.12 + axIdx * 0.04}s`,
                  }}
                />
              );
            })
          )}

          {/* User brand vertex dots */}
          {userBrand && AXES.map((axis, axIdx) => {
            const scoreMap: Record<string, number | undefined> = {
              reputationScore: userBrand.reputationScore,
              reachScore: userBrand.reachScore,
              featureScore: userBrand.featureScore,
              priceScore: userBrand.priceScore,
            };
            const [x, y] = toPoint(scoreMap[axis.key as string], axIdx);
            return (
              <circle
                key={`ub-${axIdx}`}
                cx={x} cy={y} r={4}
                fill={USER_COLOR}
                opacity={0}
                style={{
                  animation: "radar-fade-in 0.4s ease-out forwards",
                  animationDelay: `${0.5 + competitors.length * 0.12 + axIdx * 0.04}s`,
                }}
              />
            );
          })}

          {AXES.map(({ label }, i) => {
            const { x, y, anchor, baseline } = LABEL_PROPS[i];
            return (
              <text
                key={label}
                x={x} y={y}
                textAnchor={anchor}
                dominantBaseline={baseline}
                fill="rgba(0,212,180,0.9)"
                fontSize={12}
                fontWeight="600"
                filter="url(#radar-glow)"
                style={{
                  animation: "radar-fade-in 0.5s ease-out forwards",
                  animationDelay: `${0.1 + i * 0.08}s`,
                  opacity: 0,
                }}
              >
                {label}
              </text>
            );
          })}
        </svg>
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-2 justify-center mt-3">
        {competitors.map((c, i) => (
          <div key={c.name} className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)]">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
            {c.name}
          </div>
        ))}
        {userBrand && (
          <div className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)]">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0 border border-dashed"
              style={{ borderColor: USER_COLOR, background: "transparent" }}
            />
            {userBrand.name}
            <span className="opacity-60">(You)</span>
          </div>
        )}
      </div>
    </div>
  );
}

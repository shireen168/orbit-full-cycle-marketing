"use client";

import type { Competitor } from "@/types/orbit";

interface Props {
  competitors: Competitor[];
}

const COLORS = ["#00d4b4", "#7c6ef8", "#f59e0b", "#ef4444", "#10b981"];

export function PositioningChart({ competitors }: Props) {
  const SIZE = 320;
  const PAD = 44;
  const INNER = SIZE - PAD * 2;

  const toX = (score: number) => PAD + (((score ?? 5) - 1) / 9) * INNER;
  const toY = (score: number) =>
    SIZE - PAD - (((score ?? 5) - 1) / 9) * INNER;

  return (
    <div className="border border-[var(--border)] rounded-xl p-5 bg-[var(--card)]">
      <div className="w-full max-w-sm mx-auto">
        <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="w-full">
          {/* Background quadrant tint */}
          <rect
            x={PAD}
            y={PAD}
            width={INNER / 2}
            height={INNER / 2}
            fill="rgba(0,212,180,0.03)"
          />

          {/* Axis lines */}
          <line
            x1={PAD}
            y1={SIZE - PAD}
            x2={SIZE - PAD}
            y2={SIZE - PAD}
            stroke="rgba(255,255,255,0.12)"
            strokeWidth={1}
          />
          <line
            x1={PAD}
            y1={PAD}
            x2={PAD}
            y2={SIZE - PAD}
            stroke="rgba(255,255,255,0.12)"
            strokeWidth={1}
          />

          {/* Center dividers */}
          <line
            x1={PAD}
            y1={SIZE / 2}
            x2={SIZE - PAD}
            y2={SIZE / 2}
            stroke="rgba(255,255,255,0.15)"
            strokeWidth={1}
            strokeDasharray="4 4"
          />
          <line
            x1={SIZE / 2}
            y1={PAD}
            x2={SIZE / 2}
            y2={SIZE - PAD}
            stroke="rgba(255,255,255,0.15)"
            strokeWidth={1}
            strokeDasharray="4 4"
          />

          {/* Axis labels */}
          <text
            x={SIZE / 2}
            y={SIZE - 6}
            textAnchor="middle"
            fill="rgba(255,255,255,0.6)"
            fontSize={9}
          >
            Price Point →
          </text>
          <text
            x={10}
            y={SIZE / 2}
            textAnchor="middle"
            fill="rgba(255,255,255,0.6)"
            fontSize={9}
            transform={`rotate(-90, 10, ${SIZE / 2})`}
          >
            Feature Richness →
          </text>

          {/* Quadrant labels */}
          <text
            x={PAD + 6}
            y={SIZE - PAD - 6}
            fill="rgba(255,255,255,0.35)"
            fontSize={8}
          >
            Budget · Simple
          </text>
          <text
            x={SIZE - PAD - 6}
            y={SIZE - PAD - 6}
            textAnchor="end"
            fill="rgba(255,255,255,0.35)"
            fontSize={8}
          >
            Premium · Simple
          </text>
          <text
            x={PAD + 6}
            y={PAD + 12}
            fill="rgba(255,255,255,0.35)"
            fontSize={8}
          >
            Budget · Rich
          </text>
          <text
            x={SIZE - PAD - 6}
            y={PAD + 12}
            textAnchor="end"
            fill="rgba(255,255,255,0.35)"
            fontSize={8}
          >
            Premium · Rich
          </text>

          {/* Competitor dots */}
          {competitors.map((c, i) => {
            const cx = toX(c.priceScore ?? 5);
            const cy = toY(c.featureScore ?? 5);
            const color = COLORS[i % COLORS.length];
            const label =
              c.name.length > 11 ? c.name.slice(0, 11) + "…" : c.name;
            return (
              <g key={c.name}>
                <circle
                  cx={cx}
                  cy={cy}
                  r={10}
                  fill={color}
                  fillOpacity={0.15}
                />
                <circle cx={cx} cy={cy} r={5} fill={color} />
                <text
                  x={cx}
                  y={cy - 13}
                  textAnchor="middle"
                  fill={color}
                  fontSize={9}
                  fontWeight="600"
                >
                  {label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-2 justify-center mt-2">
        {competitors.map((c, i) => (
          <div
            key={c.name}
            className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)]"
          >
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ background: COLORS[i % COLORS.length] }}
            />
            {c.name}
          </div>
        ))}
      </div>
    </div>
  );
}

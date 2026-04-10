const BEAMS = [
  { left: "8%",  delay: "0s",   dur: "8s",  opacity: 0.18 },
  { left: "22%", delay: "2.5s", dur: "11s", opacity: 0.12 },
  { left: "40%", delay: "1s",   dur: "9s",  opacity: 0.15 },
  { left: "58%", delay: "4s",   dur: "13s", opacity: 0.10 },
  { left: "74%", delay: "0.5s", dur: "10s", opacity: 0.14 },
  { left: "88%", delay: "3.2s", dur: "7s",  opacity: 0.11 },
];

export function LandingBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none" aria-hidden>
      <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(oklch(1 0 0 / 0.055) 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
      <div className="absolute inset-0 overflow-hidden">
        {BEAMS.map((b, i) => (
          <div
            key={i}
            className="absolute top-0 w-px"
            style={{
              left: b.left,
              height: "100%",
              background: `linear-gradient(to bottom, transparent 0%, oklch(0.72 0.16 185 / ${b.opacity}) 30%, oklch(0.72 0.16 185 / ${b.opacity * 1.4}) 50%, oklch(0.72 0.16 185 / ${b.opacity}) 70%, transparent 100%)`,
              animation: `beam-fall ${b.dur} linear ${b.delay} infinite`,
              transform: "skewX(-12deg)",
              willChange: "transform, opacity",
            }}
          />
        ))}
      </div>
      <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full" style={{ background: "radial-gradient(circle, oklch(0.72 0.16 185 / 0.14) 0%, transparent 70%)", filter: "blur(40px)", animation: "float1 12s ease-in-out infinite" }} />
      <div className="absolute -bottom-60 -right-40 w-[700px] h-[700px] rounded-full" style={{ background: "radial-gradient(circle, oklch(0.72 0.16 185 / 0.10) 0%, transparent 70%)", filter: "blur(60px)", animation: "float2 16s ease-in-out infinite" }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full" style={{ background: "radial-gradient(circle, oklch(0.72 0.16 185 / 0.06) 0%, transparent 70%)", filter: "blur(80px)", animation: "float3 20s ease-in-out infinite" }} />
    </div>
  );
}

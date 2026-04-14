import PDFDocument from "pdfkit";
import type { OrbitProject, Competitor, UserBrandScores } from "@/types/orbit";

type PDFDoc = InstanceType<typeof PDFDocument>;

// Colors
const TEAL       = "#00d4b4";   // decorative elements (borders, dots, bg fills)
const TEAL_TEXT  = "#0a7a6e";   // teal text on white -- passes WCAG AA
const NAVY       = "#0a0f1e";   // primary body text
const MUTED      = "#4a5568";   // secondary body text
const LIGHT      = "#e2e8f0";   // dividers and row fills
const W          = 595;
const MARGIN     = 50;
const COL        = W - MARGIN * 2;

// ── Typography helpers ────────────────────────────────────────────────────────

function sectionHeader(doc: PDFDoc, title: string, y: number): number {
  doc.rect(MARGIN, y, 4, 22).fill(TEAL);
  doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(14)
    .text(title, MARGIN + 14, y + 4, { width: COL });
  return y + 36;
}

function subHeader(doc: PDFDoc, text: string, y: number): number {
  doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(11)
    .text(text, MARGIN, y, { width: COL });
  return doc.y + 5;
}

function label(doc: PDFDoc, text: string, y: number): number {
  doc.fillColor(TEAL_TEXT).font("Helvetica-Bold").fontSize(8.5)
    .text(text.toUpperCase(), MARGIN, y, { characterSpacing: 1.2 });
  return y + 16;
}

function bodyText(doc: PDFDoc, text: string, y: number, opts?: object): number {
  doc.fillColor(NAVY).font("Helvetica").fontSize(10)
    .text(text, MARGIN, y, { width: COL, lineGap: 3, ...opts });
  return doc.y + 8;
}

function divider(doc: PDFDoc, y: number): number {
  y += 16;
  doc.rect(MARGIN, y, COL, 1).fill(LIGHT);
  return y + 16;
}

function stripEmoji(str: string): string {
  return str.replace(/[^\x20-\x7E]/g, "").trim();
}

function pillRow(doc: PDFDoc, items: string[], y: number, color = TEAL_TEXT): number {
  let x = MARGIN;
  const pillH = 17, pillPad = 9, gap = 6;
  items.forEach((item) => {
    const w = doc.widthOfString(item) + pillPad * 2;
    if (x + w > W - MARGIN) { x = MARGIN; y += pillH + gap; }
    doc.save();
    doc.fillOpacity(0.1);
    doc.roundedRect(x, y, w, pillH, 3).fill(TEAL);
    doc.restore();
    doc.save();
    doc.strokeOpacity(0.4);
    doc.roundedRect(x, y, w, pillH, 3).stroke(TEAL);
    doc.restore();
    doc.fillColor(color).font("Helvetica").fontSize(8.5)
      .text(item, x + pillPad, y + 4.5, { lineBreak: false });
    x += w + gap;
  });
  return y + pillH + 12;
}

function addPageBreak(doc: PDFDoc): void {
  doc.addPage();
}

// ── PDF Radar Chart ───────────────────────────────────────────────────────────
function drawRadarChart(
  doc: PDFDoc,
  competitors: Competitor[],
  userBrand: UserBrandScores | undefined,
  startY: number
): number {
  const cx = MARGIN + COL / 2;
  const r = 90;
  const cy = startY + r + 10;

  const axes = [
    { key: "reputationScore" as keyof Competitor, label: "Reputation", ax: cx,     ay: cy - r },
    { key: "reachScore"      as keyof Competitor, label: "Reach",      ax: cx + r, ay: cy     },
    { key: "featureScore"    as keyof Competitor, label: "Quality",    ax: cx,     ay: cy + r },
    { key: "priceScore"      as keyof Competitor, label: "Price",      ax: cx - r, ay: cy     },
  ];

  function toPoint(score: number | undefined, axIdx: number): [number, number] {
    const ratio = (Math.max(1, Math.min(10, score ?? 5)) - 1) / 9;
    const { ax, ay } = axes[axIdx];
    return [cx + (ax - cx) * ratio, cy + (ay - cy) * ratio];
  }

  // Grid rings
  [0.25, 0.5, 0.75, 1].forEach((frac) => {
    const pts = axes.map(({ ax, ay }) => [cx + (ax - cx) * frac, cy + (ay - cy) * frac]);
    doc.save();
    doc.strokeOpacity(frac === 1 ? 0.35 : 0.15);
    doc.lineWidth(frac === 1 ? 1 : 0.5);
    doc.moveTo(pts[0][0], pts[0][1]);
    pts.slice(1).forEach(([x, y]) => doc.lineTo(x, y));
    doc.closePath().stroke(TEAL);
    doc.restore();
  });

  // Axis lines (dashed)
  axes.forEach(({ ax, ay }) => {
    doc.save();
    doc.strokeOpacity(0.2);
    doc.lineWidth(0.5);
    doc.dash(3, { space: 3 });
    doc.moveTo(cx, cy).lineTo(ax, ay).stroke(TEAL);
    doc.undash();
    doc.restore();
  });

  // Competitor polygons
  const polyColors = ["#00a896", "#6c5fc7", "#d97706", "#dc2626", "#059669"];
  competitors.forEach((comp, ci) => {
    const pts = axes.map((_, axIdx) => toPoint(comp[axes[axIdx].key] as number | undefined, axIdx));
    const color = polyColors[ci % polyColors.length];
    doc.save();
    doc.fillOpacity(0.08);
    doc.moveTo(pts[0][0], pts[0][1]);
    pts.slice(1).forEach(([x, y]) => doc.lineTo(x, y));
    doc.closePath().fill(color);
    doc.restore();
    doc.save();
    doc.strokeOpacity(0.75);
    doc.lineWidth(1.2);
    doc.moveTo(pts[0][0], pts[0][1]);
    pts.slice(1).forEach(([x, y]) => doc.lineTo(x, y));
    doc.closePath().stroke(color);
    doc.restore();
  });

  // User brand polygon (dashed, grey)
  if (userBrand) {
    const scoreMap: Record<string, number | undefined> = {
      reputationScore: userBrand.reputationScore,
      reachScore: userBrand.reachScore,
      featureScore: userBrand.featureScore,
      priceScore: userBrand.priceScore,
    };
    const pts = axes.map((axis, axIdx) => toPoint(scoreMap[axis.key as string], axIdx));
    const ubColor = "#718096";
    doc.save();
    doc.fillOpacity(0.06);
    doc.moveTo(pts[0][0], pts[0][1]);
    pts.slice(1).forEach(([x, y]) => doc.lineTo(x, y));
    doc.closePath().fill(ubColor);
    doc.restore();
    doc.save();
    doc.strokeOpacity(0.8);
    doc.lineWidth(1.2);
    doc.dash(4, { space: 3 });
    doc.moveTo(pts[0][0], pts[0][1]);
    pts.slice(1).forEach(([x, y]) => doc.lineTo(x, y));
    doc.closePath().stroke(ubColor);
    doc.undash();
    doc.restore();
  }

  // Axis labels
  const labelOffset = 14;
  doc.fillColor(TEAL_TEXT).font("Helvetica-Bold").fontSize(8);
  doc.text("Reputation", cx - 22, cy - r - labelOffset, { width: 44, align: "center", lineBreak: false });
  doc.text("Reach",      cx + r + 5,  cy - 5,            { lineBreak: false });
  doc.text("Quality",    cx - 18, cy + r + 4,             { width: 36, align: "center", lineBreak: false });
  doc.text("Price",      cx - r - 28, cy - 5,             { width: 28, align: "right", lineBreak: false });

  // Legend
  const legendY = cy + r + labelOffset + 18;
  let lx = MARGIN;
  competitors.forEach((comp, ci) => {
    const color = polyColors[ci % polyColors.length];
    doc.circle(lx + 4, legendY + 4, 4).fill(color);
    doc.fillColor(MUTED).font("Helvetica").fontSize(8)
      .text(comp.name, lx + 12, legendY, { lineBreak: false });
    lx += doc.widthOfString(comp.name) + 26;
  });
  if (userBrand) {
    doc.rect(lx, legendY + 1, 8, 6).stroke("#718096");
    doc.fillColor(MUTED).font("Helvetica").fontSize(8)
      .text(`${userBrand.name} (You)`, lx + 12, legendY, { lineBreak: false });
  }

  return legendY + 20;
}

// ── Main PDF builder ──────────────────────────────────────────────────────────
export async function buildProjectPDF(project: OrbitProject): Promise<Buffer> {
  const doc = new PDFDocument({ size: "A4", margin: 0, info: { Title: `${project.name} — Orbit Report` } });
  const chunks: Buffer[] = [];
  doc.on("data", (c: Buffer) => chunks.push(c));

  // ── COVER HEADER ──────────────────────────────────────────────────────────
  doc.rect(0, 0, W, 110).fill(NAVY);
  doc.rect(0, 0, W, 4).fill(TEAL);

  doc.fillColor(TEAL).font("Helvetica-Bold").fontSize(28).text("ORBIT", MARGIN, 24, { lineBreak: false });
  doc.rect(MARGIN + 108, 26, 1.5, 16).fill("rgba(255,255,255,0.25)");
  doc.fillColor("#ffffff").font("Helvetica").fontSize(10)
    .text("Market Strategy Report", MARGIN + 118, 30, { lineBreak: false });

  doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(16)
    .text(project.name, MARGIN, 56, { width: COL * 0.75 });
  const dateStr = new Date(project.created_at).toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });
  doc.fillColor(TEAL).font("Helvetica").fontSize(9).text(`Generated ${dateStr}`, MARGIN, 92);

  let y = 130;

  // ── MODULE 1: MARKET INTELLIGENCE ─────────────────────────────────────────
  if (project.market_intel) {
    const mi = project.market_intel;
    y = sectionHeader(doc, "Market Intelligence", y);

    if (mi.summary) {
      y = label(doc, "Overview", y);
      doc.rect(MARGIN, y, COL, 0.5).fill(LIGHT);
      y += 7;
      y = bodyText(doc, mi.summary, y);
    }

    if (mi.marketGaps?.length) {
      if (y > 700) { addPageBreak(doc); y = MARGIN; }
      y = label(doc, "Market Gaps", y);
      mi.marketGaps.filter(Boolean).forEach((gap, i) => {
        if (doc.y > 740) { addPageBreak(doc); y = MARGIN; }
        doc.rect(MARGIN, y, 20, 15).fill(LIGHT);
        doc.fillColor(TEAL_TEXT).font("Helvetica-Bold").fontSize(8.5)
          .text(`${i + 1}`, MARGIN + 6, y + 3.5, { lineBreak: false });
        doc.fillColor(NAVY).font("Helvetica").fontSize(10)
          .text(gap, MARGIN + 26, y + 2, { width: COL - 26, lineGap: 2 });
        y = doc.y + 6;
      });
      y += 4;
    }

    if (mi.whitespaceOpportunities?.length) {
      if (y > 680) { addPageBreak(doc); y = MARGIN; }
      y = label(doc, "Whitespace Opportunities", y);
      mi.whitespaceOpportunities.filter(Boolean).forEach((opp) => {
        if (doc.y > 740) { addPageBreak(doc); y = MARGIN; }
        doc.circle(MARGIN + 4, y + 6, 3).fill(TEAL);
        doc.fillColor(NAVY).font("Helvetica").fontSize(10)
          .text(opp, MARGIN + 14, y + 2, { width: COL - 14, lineGap: 2 });
        y = doc.y + 6;
      });
      y += 4;
    }

    // Radar chart
    if (mi.competitorMap?.length) {
      if (y > 520) { addPageBreak(doc); y = MARGIN; }
      y = label(doc, "Competitive Positioning", y);
      y = drawRadarChart(doc, mi.competitorMap, mi.userBrand, y);
      y += 14;
    }

    if (mi.competitorMap?.length) {
      if (y > 600) { addPageBreak(doc); y = MARGIN; }
      y = label(doc, "Competitor Breakdown", y);
      mi.competitorMap.forEach((c) => {
        if (y > 690) { addPageBreak(doc); y = MARGIN; }
        doc.rect(MARGIN, y, COL, 1).fill(LIGHT);
        y += 6;
        y = subHeader(doc, c.name, y);
        if (c.description) {
          doc.fillColor(MUTED).font("Helvetica").fontSize(9)
            .text(c.description, MARGIN, doc.y, { width: COL, lineGap: 2 });
          y = doc.y + 6;
        }
        const colW = (COL - 10) / 2;
        const colY = y;
        doc.fillColor(TEAL_TEXT).font("Helvetica-Bold").fontSize(8.5)
          .text("STRENGTHS", MARGIN, colY, { characterSpacing: 0.8 });
        doc.fillColor(NAVY).font("Helvetica").fontSize(9)
          .text(c.strengths.slice(0, 2).map((s) => `+ ${s}`).join("\n"), MARGIN, doc.y + 2, { width: colW, lineGap: 2 });
        const afterStrengths = doc.y;
        doc.fillColor("#c0392b").font("Helvetica-Bold").fontSize(8.5)
          .text("WEAKNESSES", MARGIN + colW + 10, colY, { characterSpacing: 0.8 });
        doc.fillColor(NAVY).font("Helvetica").fontSize(9)
          .text(c.weaknesses.slice(0, 2).map((w) => `- ${w}`).join("\n"), MARGIN + colW + 10, colY + 13, { width: colW, lineGap: 2 });
        y = Math.max(afterStrengths, doc.y) + 14;
      });
    }

    // Citations
    if (mi.citations?.length) {
      if (y > 680) { addPageBreak(doc); y = MARGIN; }
      y = label(doc, "Sources", y);
      mi.citations.slice(0, 8).forEach((url, i) => {
        if (y > 750) { addPageBreak(doc); y = MARGIN; }
        doc.fillColor(MUTED).font("Helvetica").fontSize(8)
          .text(`${i + 1}. ${url}`, MARGIN, y, { width: COL, lineGap: 1 });
        y = doc.y + 4;
      });
      y += 4;
    }
  }

  // ── MODULE 2: BRAND FOUNDATION ────────────────────────────────────────────
  if (project.brand_foundation) {
    y = divider(doc, y);
    if (y > 580) { addPageBreak(doc); y = MARGIN; }
    const bf = project.brand_foundation;
    y = sectionHeader(doc, "Brand Foundation", y);

    if (bf.positioningStatement) {
      doc.rect(MARGIN, y, 3, 40).fill(TEAL);
      doc.fillColor(NAVY).font("Helvetica-BoldOblique").fontSize(11)
        .text(bf.positioningStatement, MARGIN + 12, y + 4, { width: COL - 12, lineGap: 3 });
      y = doc.y + 14;
    }

    if (bf.valueProp) {
      y = label(doc, "Value Proposition", y);
      y = bodyText(doc, bf.valueProp, y);
    }

    if (bf.messagingPillars?.length) {
      if (y > 660) { addPageBreak(doc); y = MARGIN; }
      y = label(doc, "Messaging Pillars", y);
      bf.messagingPillars.forEach((p) => {
        const icon = p.icon ? (stripEmoji(p.icon) || "") : "";
        const title = icon ? `${icon}  ${p.title}` : p.title;
        doc.fillColor(TEAL_TEXT).font("Helvetica-Bold").fontSize(10).text(title, MARGIN, y);
        doc.fillColor(MUTED).font("Helvetica").fontSize(9)
          .text(p.description, MARGIN + 12, doc.y + 3, { width: COL - 12, lineGap: 2 });
        y = doc.y + 10;
      });
    }

    if (bf.brandVoice?.length) {
      if (y > 710) { addPageBreak(doc); y = MARGIN; }
      y = label(doc, "Brand Voice", y);
      y = pillRow(doc, bf.brandVoice, y);
    }

    const tagline = bf.selectedTagline || bf.taglines?.[0];
    if (tagline) {
      if (y > 720) { addPageBreak(doc); y = MARGIN; }
      y = label(doc, "Tagline", y);
      doc.save();
      doc.fillOpacity(0.07);
      doc.rect(MARGIN, y, COL, 30).fill(TEAL);
      doc.restore();
      doc.save();
      doc.strokeOpacity(0.27);
      doc.moveTo(MARGIN, y).lineTo(MARGIN + COL, y).stroke(TEAL);
      doc.restore();
      doc.fillColor(TEAL_TEXT).font("Helvetica-Bold").fontSize(12)
        .text(`"${tagline}"`, MARGIN + 12, y + 9, { width: COL - 24 });
      y = doc.y + 18;
    }
  }

  // ── MODULE 3: AUDIENCE STUDIO ─────────────────────────────────────────────
  if (project.audience_studio?.personas?.length) {
    y = divider(doc, y);
    if (y > 560) { addPageBreak(doc); y = MARGIN; }
    y = sectionHeader(doc, "Audience Studio", y);

    project.audience_studio.personas.forEach((p, i) => {
      if (y > 630) { addPageBreak(doc); y = MARGIN; }
      const dotColors = ["#00a896", "#6c5fc7", "#d97706"];
      const color = dotColors[i % dotColors.length];
      doc.rect(MARGIN, y, COL, 1.5).fill(color);
      y += 8;
      doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(12)
        .text(`${p.name}`, MARGIN, y, { continued: true });
      doc.fillColor(MUTED).font("Helvetica").fontSize(9.5)
        .text(`  ${p.role}${p.ageRange ? ` · ${p.ageRange}` : ""}`, { lineBreak: false });
      y = doc.y + 6;
      if (p.psychographicSummary) {
        doc.fillColor(MUTED).font("Helvetica").fontSize(9)
          .text(p.psychographicSummary, MARGIN, y, { width: COL, lineGap: 2 });
        y = doc.y + 8;
      }
      const half = (COL - 10) / 2;
      const colY = y;
      doc.fillColor(TEAL_TEXT).font("Helvetica-Bold").fontSize(8)
        .text("BUYING TRIGGERS", MARGIN, colY, { characterSpacing: 0.8 });
      p.buyingTriggers?.slice(0, 2).forEach((t) => {
        doc.fillColor(NAVY).font("Helvetica").fontSize(9)
          .text(`+ ${t}`, MARGIN, doc.y + 2, { width: half, lineGap: 2 });
      });
      const afterLeft = doc.y;
      doc.fillColor("#c0392b").font("Helvetica-Bold").fontSize(8)
        .text("OBJECTIONS", MARGIN + half + 10, colY, { characterSpacing: 0.8 });
      p.objections?.slice(0, 2).forEach((o) => {
        doc.fillColor(NAVY).font("Helvetica").fontSize(9)
          .text(`- ${o}`, MARGIN + half + 10, doc.y + 2, { width: half, lineGap: 2 });
      });
      y = Math.max(afterLeft, doc.y) + 8;
      if (p.sampleAdHook) {
        doc.save();
        doc.fillOpacity(0.07);
        doc.rect(MARGIN, y, COL, 24).fill(color);
        doc.restore();
        doc.fillColor(NAVY).font("Helvetica-BoldOblique").fontSize(9.5)
          .text(`"${p.sampleAdHook}"`, MARGIN + 8, y + 7, { width: COL - 16 });
        y = doc.y + 14;
      } else {
        y += 10;
      }
    });
  }

  // ── MODULE 4: CAMPAIGN PLANNER ────────────────────────────────────────────
  if (project.campaign_plan) {
    const cp = project.campaign_plan;
    y = divider(doc, y);
    if (y > 540) { addPageBreak(doc); y = MARGIN; }
    y = sectionHeader(doc, "Campaign Planner", y);

    // Brief
    if (cp.brief) {
      const b = cp.brief;
      if (y > 640) { addPageBreak(doc); y = MARGIN; }
      doc.rect(MARGIN, y, COL, 1.5).fill(TEAL);
      y += 7;
      doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(13)
        .text(b.campaignTitle ?? "", MARGIN, y, { width: COL });
      y = doc.y + 7;

      if (b.objectiveStatement) {
        y = label(doc, "Objective", y);
        doc.fillColor(NAVY).font("Helvetica").fontSize(10)
          .text(b.objectiveStatement, MARGIN, y, { width: COL, lineGap: 2 });
        y = doc.y + 8;
      }
      if (b.primaryMessage) {
        y = label(doc, "Primary Message", y);
        doc.fillColor(NAVY).font("Helvetica").fontSize(10)
          .text(b.primaryMessage, MARGIN, y, { width: COL, lineGap: 2 });
        y = doc.y + 8;
      }
      if (b.keyInsight) {
        doc.rect(MARGIN, y, 2, 22).fill(TEAL);
        doc.fillColor(MUTED).font("Helvetica-Oblique").fontSize(9.5)
          .text(b.keyInsight, MARGIN + 9, y + 3, { width: COL - 9, lineGap: 2 });
        y = doc.y + 12;
      }
      if (b.successMetrics?.length) {
        y = label(doc, "Success Metrics", y);
        b.successMetrics.forEach((m) => {
          doc.fillColor(NAVY).font("Helvetica").fontSize(9.5)
            .text(`• ${m}`, MARGIN + 8, y, { width: COL - 8 });
          y = doc.y + 4;
        });
        y += 4;
      }
    }

    // Message architecture
    if (cp.messageArchitecture) {
      if (y > 660) { addPageBreak(doc); y = MARGIN; }
      y = label(doc, "Message Architecture", y);
      const ma = cp.messageArchitecture;
      if (ma.primaryMessage) {
        doc.fillColor(TEAL_TEXT).font("Helvetica-Bold").fontSize(10.5)
          .text(ma.primaryMessage, MARGIN, y, { width: COL });
        y = doc.y + 8;
      }
      if (ma.supportingMessages?.length) {
        ma.supportingMessages.forEach((msg, i) => {
          doc.fillColor(NAVY).font("Helvetica").fontSize(9.5)
            .text(`${i + 1}. ${msg}`, MARGIN + 8, y, { width: COL - 8, lineGap: 2 });
          y = doc.y + 4;
        });
        y += 4;
      }
    }

    // Channel mix
    if (cp.channelMix?.length) {
      if (y > 650) { addPageBreak(doc); y = MARGIN; }
      y = label(doc, "Channel Mix", y);
      cp.channelMix.forEach((ch) => {
        if (y > 720) { addPageBreak(doc); y = MARGIN; }
        doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(10)
          .text(ch.channel, MARGIN, y, { continued: true });
        doc.fillColor(TEAL_TEXT).font("Helvetica-Bold").fontSize(10)
          .text(`  ${ch.budgetPercent}%`, { lineBreak: false });
        y = doc.y + 3;
        const barW = Math.round((COL * ch.budgetPercent) / 100);
        doc.rect(MARGIN, y, COL, 5).fill("#e2e8f0");
        doc.rect(MARGIN, y, barW, 5).fill(TEAL);
        y += 10;
        if (ch.rationale) {
          doc.fillColor(MUTED).font("Helvetica").fontSize(9)
            .text(ch.rationale, MARGIN, y, { width: COL, lineGap: 2 });
          y = doc.y + 8;
        }
      });
    }

    // Selected concept
    const selIdx = cp.selectedConcept;
    const concept = selIdx !== null && selIdx !== undefined ? cp.concepts?.[selIdx] : null;
    if (concept) {
      if (y > 630) { addPageBreak(doc); y = MARGIN; }
      y = label(doc, "Selected Campaign Concept", y);
      doc.save();
      doc.fillOpacity(0.06);
      doc.rect(MARGIN, y, COL, 66).fill(TEAL);
      doc.restore();
      doc.rect(MARGIN, y, 2.5, 66).fill(TEAL);
      doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(12)
        .text(concept.name, MARGIN + 11, y + 8, { width: COL - 11 });
      doc.fillColor(MUTED).font("Helvetica-Oblique").fontSize(10)
        .text(`"${concept.hook}"`, MARGIN + 11, doc.y + 4, { width: COL - 11, lineGap: 2 });
      doc.fillColor(NAVY).font("Helvetica").fontSize(9.5)
        .text(concept.coreMessage, MARGIN + 11, doc.y + 5, { width: COL - 11, lineGap: 2 });
      y = doc.y + 16;
    }
  }

  // ── MODULE 5: CONTENT STUDIO ──────────────────────────────────────────────
  if (project.content_studio) {
    const cs = project.content_studio;
    y = divider(doc, y);
    if (y > 540) { addPageBreak(doc); y = MARGIN; }
    y = sectionHeader(doc, "Content Studio", y);

    if (cs.selectedConceptName) {
      doc.fillColor(MUTED).font("Helvetica").fontSize(9.5)
        .text(`Campaign concept: "${cs.selectedConceptName}"`, MARGIN, y, { width: COL });
      y = doc.y + 12;
    }

    if (cs.variants?.length) {
      y = label(doc, "Copy Variants", y);
      cs.variants.forEach((v) => {
        if (y > 670) { addPageBreak(doc); y = MARGIN; }
        doc.fillColor(TEAL_TEXT).font("Helvetica-Bold").fontSize(8.5)
          .text(v.format.toUpperCase(), MARGIN, y, { characterSpacing: 0.8 });
        y = doc.y + 3;
        doc.rect(MARGIN, y, COL, 0.75).fill(LIGHT);
        y += 5;
        doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(11)
          .text(v.headline, MARGIN, y, { width: COL, lineGap: 2 });
        y = doc.y + 4;
        doc.fillColor(MUTED).font("Helvetica").fontSize(9.5)
          .text(v.body, MARGIN, y, { width: COL, lineGap: 3 });
        y = doc.y + 4;
        doc.fillColor(TEAL_TEXT).font("Helvetica-Bold").fontSize(9.5)
          .text(`\u2192 ${v.cta}`, MARGIN, y, { width: COL });
        y = doc.y + 13;
      });
    }

    if (cs.repurposeMatrix?.length) {
      if (y > 610) { addPageBreak(doc); y = MARGIN; }
      y = label(doc, "Repurposing Matrix", y);

      // Table header
      const col1W = 130, col2W = COL - col1W - 5;
      doc.rect(MARGIN, y, COL, 18).fill(LIGHT);
      doc.fillColor(MUTED).font("Helvetica-Bold").fontSize(8.5)
        .text("FORMAT", MARGIN + 5, y + 5, { width: col1W, lineBreak: false });
      doc.fillColor(MUTED).font("Helvetica-Bold").fontSize(8.5)
        .text("ADAPTATION", MARGIN + col1W + 9, y + 5, { width: col2W, lineBreak: false });
      y += 18;

      cs.repurposeMatrix.forEach((row, i) => {
        if (y > 750) { addPageBreak(doc); y = MARGIN; }
        // Dynamic row height based on adaptation text length
        doc.font("Helvetica").fontSize(9.5);
        const adaptH = doc.heightOfString(row.adaptation, { width: col2W - 8 });
        const rowH = Math.max(20, adaptH + 12);
        if (i % 2 === 0) {
          doc.save();
          doc.fillOpacity(0.04);
          doc.rect(MARGIN, y, COL, rowH).fill(TEAL);
          doc.restore();
        }
        doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(9.5)
          .text(row.format, MARGIN + 5, y + 5, { width: col1W - 5, lineBreak: false });
        doc.fillColor(MUTED).font("Helvetica").fontSize(9.5)
          .text(row.adaptation, MARGIN + col1W + 9, y + 5, { width: col2W - 8, lineGap: 2 });
        y += rowH;
      });
      y += 8;
    }
  }

  // ── FOOTER (last page) ────────────────────────────────────────────────────
  doc.rect(0, 810, W, 32).fill(NAVY);
  const reportDate = new Date();
  const dd = String(reportDate.getDate()).padStart(2, "0");
  const mm = String(reportDate.getMonth() + 1).padStart(2, "0");
  const yyyy = reportDate.getFullYear();
  const hh = String(reportDate.getHours()).padStart(2, "0");
  const min = String(reportDate.getMinutes()).padStart(2, "0");
  const footerTimestamp = `${dd}/${mm}/${yyyy} ${hh}:${min}`;
  doc.fillColor(TEAL).font("Helvetica-Bold").fontSize(8)
    .text("Orbit", MARGIN, 819, { lineBreak: false, characterSpacing: 1 });
  doc.fillColor("#ffffff").font("Helvetica").fontSize(8)
    .text(`  ·  Market Strategy Report  ·  ${footerTimestamp}`, MARGIN + 30, 819, { lineBreak: false });

  return new Promise((resolve, reject) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
    doc.end();
  });
}

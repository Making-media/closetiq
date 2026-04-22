import { GarmentColor } from "@/types";

function hexToHSL(hex: string): { h: number; s: number; l: number } {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;

  if (max === min) {
    return { h: 0, s: 0, l };
  }

  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

  let h: number;
  switch (max) {
    case r:
      h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
      break;
    case g:
      h = ((b - r) / d + 2) / 6;
      break;
    default:
      h = ((r - g) / d + 4) / 6;
      break;
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
}

function isNeutral(hsl: { h: number; s: number; l: number }): boolean {
  return hsl.s < 15 || hsl.l < 10 || hsl.l > 90;
}

function hueDifference(h1: number, h2: number): number {
  const diff = Math.abs(h1 - h2);
  return diff > 180 ? 360 - diff : diff;
}

/**
 * Scores color harmony for a set of garments.
 * @param colorSets - One array of colors per garment (index 0 = dominant color)
 * @returns Score from 1–10, rounded to 1 decimal
 */
export function scoreColorHarmony(colorSets: { hex: string }[][]): number {
  if (colorSets.length === 0) return 5;
  if (colorSets.length === 1) return 8;

  // Get dominant color (index 0) from each garment
  const dominantHSLs = colorSets.map((colors) => hexToHSL(colors[0].hex));

  const neutralFlags = dominantHSLs.map(isNeutral);
  const hasAnyNeutral = neutralFlags.some(Boolean);
  const allNeutrals = neutralFlags.every(Boolean);

  if (allNeutrals) {
    return Math.min(10, 7 + (hasAnyNeutral ? 0.5 : 0));
  }

  const chromaticHSLs = dominantHSLs.filter((_, i) => !neutralFlags[i]);

  if (chromaticHSLs.length === 1) {
    const base = 8;
    return Math.min(10, Math.round((base + (hasAnyNeutral ? 0.5 : 0)) * 10) / 10);
  }

  // Multiple chromatics: compare all pairwise hue differences
  const hues = chromaticHSLs.map((hsl) => hsl.h);
  const diffs: number[] = [];
  for (let i = 0; i < hues.length; i++) {
    for (let j = i + 1; j < hues.length; j++) {
      diffs.push(hueDifference(hues[i], hues[j]));
    }
  }

  const avgDiff = diffs.reduce((a, b) => a + b, 0) / diffs.length;

  let score: number;
  if (avgDiff < 15) {
    score = 9; // Monochromatic
  } else if (avgDiff <= 45) {
    score = 8; // Analogous
  } else if (avgDiff >= 165 && avgDiff <= 195) {
    score = 8; // Complementary
  } else if ((avgDiff >= 110 && avgDiff <= 130) || (avgDiff >= 230 && avgDiff <= 250)) {
    score = 7; // Triadic
  } else if ((avgDiff >= 140 && avgDiff <= 165) || (avgDiff >= 195 && avgDiff <= 220)) {
    score = 6; // Split-complementary
  } else {
    score = 4; // Other
  }

  const neutralBonus = hasAnyNeutral ? 0.5 : 0;
  return Math.min(10, Math.round((score + neutralBonus) * 10) / 10);
}

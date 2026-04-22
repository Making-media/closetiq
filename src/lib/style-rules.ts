import { GarmentType, Pattern, Season, StyleGoal } from "@/types";

interface GarmentStyleData {
  type: GarmentType;
  pattern: Pattern;
  formality: number;
  season: Season[];
}

/**
 * Scores style match for a set of garments.
 * @returns Score from 1–10, rounded to 1 decimal
 */
export function scoreStyleMatch(garments: GarmentStyleData[]): number {
  let score = 10;

  if (garments.length === 0) return 1;

  // Formality range penalty
  const formalities = garments.map((g) => g.formality);
  const formalityRange = Math.max(...formalities) - Math.min(...formalities);
  if (formalityRange > 2) {
    score -= 3;
  } else if (formalityRange > 1) {
    score -= 1;
  }

  // Pattern penalties
  const nonSolidPatterns = garments.map((g) => g.pattern).filter((p) => p !== "solid");
  if (nonSolidPatterns.length > 2) {
    score -= 2;
  }

  // Duplicate non-solid pattern penalty
  const patternCounts = new Map<string, number>();
  for (const p of nonSolidPatterns) {
    patternCounts.set(p, (patternCounts.get(p) ?? 0) + 1);
  }
  for (const [, count] of patternCounts) {
    if (count > 1) {
      score -= 1.5 * (count - 1);
    }
  }

  // No common season across all garments
  const seasonSets = garments.map((g) => new Set(g.season));
  const allSeasons: Season[] = ["spring", "summer", "fall", "winter"];
  const hasCommonSeason = allSeasons.some((season) =>
    seasonSets.every((set) => set.has(season))
  );
  if (!hasCommonSeason) {
    score -= 2;
  }

  // Incomplete outfit penalty: no top+bottom and no dress
  const types = garments.map((g) => g.type);
  const hasDress = types.includes("dress");
  const hasTop = types.some((t) => ["shirt", "jacket", "outerwear"].includes(t));
  const hasBottom = types.some((t) => ["pants", "skirt", "shorts"].includes(t));
  if (!hasDress && !(hasTop && hasBottom)) {
    score -= 1;
  }

  return Math.max(1, Math.round(score * 10) / 10);
}

/**
 * Scores proportion alignment based on style goals.
 * @returns Score from 1–10, rounded to 1 decimal
 */
export function scoreProportionAlignment(
  garments: GarmentStyleData[],
  styleGoals: StyleGoal[]
): number {
  let score = 7;

  if (garments.length === 0) return score;

  const formalities = garments.map((g) => g.formality);
  const avgFormality = formalities.reduce((a, b) => a + b, 0) / formalities.length;
  const minFormality = Math.min(...formalities);
  const maxFormality = Math.max(...formalities);
  const patterns = garments.map((g) => g.pattern);
  const uniquePatterns = new Set(patterns);

  for (const goal of styleGoals) {
    switch (goal) {
      case "look-taller":
        if (avgFormality >= 3) score += 0.5;
        break;
      case "dress-polished":
        if (minFormality >= 3) score += 1;
        else if (minFormality < 2) score -= 1;
        break;
      case "keep-casual":
        if (maxFormality <= 3) score += 1;
        else if (maxFormality > 4) score -= 1;
        break;
      case "more-color":
        if (uniquePatterns.size > 1) score += 0.5;
        break;
    }
  }

  return Math.min(10, Math.max(1, Math.round(score * 10) / 10));
}

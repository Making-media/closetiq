import Anthropic from "@anthropic-ai/sdk";
import {
  Garment,
  GarmentType,
  GarmentSubtype,
  Pattern,
  Season,
  Material,
  StyleGoal,
  OccasionTag,
} from "@/types";

let _client: Anthropic | null = null;
function client(): Anthropic {
  if (!_client) {
    _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return _client;
}

function parseJson<T>(text: string): T {
  let cleaned = text.trim();
  const fenceMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (fenceMatch) cleaned = fenceMatch[1].trim();
  const firstBrace = cleaned.search(/[\{\[]/);
  if (firstBrace > 0) cleaned = cleaned.slice(firstBrace);
  return JSON.parse(cleaned) as T;
}

export interface ClassifyGarmentResult {
  type: GarmentType;
  subtype: GarmentSubtype;
  pattern: Pattern;
  formality: number;
  material: Material;
  season: Season[];
  name: string;
}

export interface OutfitRatingResult {
  score: number;
  comment: string;
  color_harmony_score: number;
  style_match_score: number;
  proportion_score: number;
}

export interface OutfitSuggestion {
  name: string;
  garment_ids_indices: number[];
  occasion_tags: OccasionTag[];
}

export interface ShoppingSuggestion {
  type: "gap_fill" | "trend" | "versatility";
  garment_type: GarmentType;
  recommended_colors: string[];
  reason: string;
  outfits_unlocked: number;
}

export async function classifyGarment(imageBase64: string): Promise<ClassifyGarmentResult> {
  const message = await client().messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: "image/jpeg",
              data: imageBase64,
            },
          },
          {
            type: "text",
            text: `Analyze this garment image and respond with ONLY valid JSON, no other text.

Return a JSON object with these exact fields:
- type: one of "shirt", "pants", "jacket", "dress", "skirt", "shoes", "accessory", "outerwear", "shorts"
- subtype: one of "t-shirt", "button-up", "polo", "hoodie", "sweater", "blazer", "jeans", "chinos", "trousers", "casual-dress", "formal-dress", "sneakers", "boots", "dress-shoes", "sandals", "coat", "bomber", "denim-jacket", "belt", "scarf", "mini-skirt", "midi-skirt", "athletic-shorts", "chino-shorts"
- pattern: one of "solid", "striped", "plaid", "floral", "abstract", "geometric", "polka-dot"
- formality: number from 1 (very casual) to 10 (very formal)
- material: one of "cotton", "denim", "wool", "silk", "polyester", "linen", "leather", "synthetic"
- season: array of applicable seasons from ["spring", "summer", "fall", "winter"]
- name: short descriptive name for this garment (e.g. "White Oxford Button-Up")`,
          },
        ],
      },
    ],
  });

  const content = message.content[0];
  if (content.type !== "text") {
    throw new Error("Unexpected response type from Claude");
  }

  return parseJson<ClassifyGarmentResult>(content.text);
}

export async function generateOutfitRating(
  garments: Garment[],
  styleGoals: StyleGoal[]
): Promise<OutfitRatingResult> {
  const garmentDescriptions = garments
    .map((g) => `- ${g.name} (${g.type}/${g.subtype}, ${g.pattern}, formality: ${g.formality})`)
    .join("\n");

  const message = await client().messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: `Rate this outfit combination for someone with style goals: ${styleGoals.join(", ")}.

Outfit garments:
${garmentDescriptions}

Respond with ONLY valid JSON, no other text. Return a JSON object with:
- score: number 1-10 overall outfit score
- comment: string, 2-3 sentences describing the outfit and why it works or doesn't
- color_harmony_score: number 1-10
- style_match_score: number 1-10 (how well it matches the style goals)
- proportion_score: number 1-10`,
      },
    ],
  });

  const content = message.content[0];
  if (content.type !== "text") {
    throw new Error("Unexpected response type from Claude");
  }

  return parseJson<OutfitRatingResult>(content.text);
}

export async function generateOutfitSuggestions(
  garments: Garment[],
  styleGoals: StyleGoal[],
  count = 5
): Promise<OutfitSuggestion[]> {
  const garmentList = garments
    .map(
      (g, i) =>
        `[${i}] ${g.name} (${g.type}/${g.subtype}, ${g.pattern}, formality: ${g.formality}, seasons: ${g.season.join(",")})`
    )
    .join("\n");

  const message = await client().messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 2048,
    messages: [
      {
        role: "user",
        content: `Create ${count} outfit combinations from this wardrobe for someone with style goals: ${styleGoals.join(", ")}.

Available garments (indexed):
${garmentList}

Respond with ONLY valid JSON, no other text. Return a JSON array of ${count} outfit objects, each with:
- name: string, creative outfit name
- garment_ids_indices: array of garment indices (numbers) that form the outfit
- occasion_tags: array of applicable tags from ["casual", "work", "date", "formal", "athletic", "lounge"]`,
      },
    ],
  });

  const content = message.content[0];
  if (content.type !== "text") {
    throw new Error("Unexpected response type from Claude");
  }

  return parseJson<OutfitSuggestion[]>(content.text);
}

export async function generateShoppingSuggestions(
  garments: Garment[],
  styleGoals: StyleGoal[]
): Promise<ShoppingSuggestion[]> {
  const garmentSummary = garments
    .map((g) => `- ${g.name} (${g.type}/${g.subtype})`)
    .join("\n");

  const message = await client().messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 2048,
    messages: [
      {
        role: "user",
        content: `Analyze this wardrobe and identify shopping gaps for someone with style goals: ${styleGoals.join(", ")}.

Current wardrobe:
${garmentSummary}

Respond with ONLY valid JSON, no other text. Return a JSON array of shopping suggestions, each with:
- type: one of "gap_fill", "trend", "versatility"
- garment_type: one of "shirt", "pants", "jacket", "dress", "skirt", "shoes", "accessory", "outerwear", "shorts"
- recommended_colors: array of hex color strings (e.g. ["#FFFFFF", "#000000"])
- reason: string explaining why this item would benefit the wardrobe
- outfits_unlocked: number of new outfit combinations this item would enable`,
      },
    ],
  });

  const content = message.content[0];
  if (content.type !== "text") {
    throw new Error("Unexpected response type from Claude");
  }

  return parseJson<ShoppingSuggestion[]>(content.text);
}

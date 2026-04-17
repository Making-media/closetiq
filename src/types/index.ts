export type PurchaseTier = "free" | "lifetime";

export type GarmentType =
  | "shirt"
  | "pants"
  | "jacket"
  | "dress"
  | "skirt"
  | "shoes"
  | "accessory"
  | "outerwear"
  | "shorts";

export type GarmentSubtype =
  | "t-shirt"
  | "button-up"
  | "polo"
  | "hoodie"
  | "sweater"
  | "blazer"
  | "jeans"
  | "chinos"
  | "trousers"
  | "casual-dress"
  | "formal-dress"
  | "sneakers"
  | "boots"
  | "dress-shoes"
  | "sandals"
  | "coat"
  | "bomber"
  | "denim-jacket"
  | "belt"
  | "scarf"
  | "mini-skirt"
  | "midi-skirt"
  | "athletic-shorts"
  | "chino-shorts";

export type Pattern =
  | "solid"
  | "striped"
  | "plaid"
  | "floral"
  | "abstract"
  | "geometric"
  | "polka-dot";

export type Season = "spring" | "summer" | "fall" | "winter";

export type Material =
  | "cotton"
  | "denim"
  | "wool"
  | "silk"
  | "polyester"
  | "linen"
  | "leather"
  | "synthetic";

export type OccasionTag = "casual" | "work" | "date" | "formal" | "athletic" | "lounge";

export type StyleGoal =
  | "look-taller"
  | "balance-frame"
  | "dress-polished"
  | "keep-casual"
  | "more-color"
  | "streamline-wardrobe"
  | "stand-out";

export interface GarmentColor {
  hex: string;
  role: "dominant" | "accent" | "trim";
  percentage: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url: string | null;
  purchase_tier: PurchaseTier;
  style_goals: StyleGoal[];
  style_profile: Record<string, unknown>;
  onboarding_complete: boolean;
  created_at: string;
  updated_at: string;
}

export interface Garment {
  id: string;
  user_id: string;
  name: string;
  type: GarmentType;
  subtype: GarmentSubtype;
  colors: GarmentColor[];
  pattern: Pattern;
  formality: number;
  season: Season[];
  material: Material;
  image_url: string;
  processed_image_url: string;
  three_d_template_id: string;
  wear_count: number;
  last_worn_at: string | null;
  created_at: string;
}

export interface Outfit {
  id: string;
  user_id: string;
  name: string;
  garment_ids: string[];
  garments?: Garment[];
  source: "ai_suggested" | "user_created";
  ai_score: number;
  ai_comment: string;
  color_harmony_score: number;
  style_match_score: number;
  proportion_score: number;
  user_rating: number | null;
  occasion_tags: OccasionTag[];
  favorited: boolean;
  created_at: string;
}

export interface Suggestion {
  id: string;
  user_id: string;
  type: "gap_fill" | "trend" | "versatility";
  garment_type: GarmentType;
  recommended_colors: string[];
  reason: string;
  outfits_unlocked: number;
  affiliate_url: string | null;
  status: "active" | "dismissed" | "purchased";
  created_at: string;
}

export interface StyleInteraction {
  id: string;
  user_id: string;
  type: "outfit_rated" | "suggestion_dismissed" | "outfit_favorited" | "garment_worn";
  reference_id: string;
  value: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

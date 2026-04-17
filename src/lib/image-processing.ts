import { GarmentColor } from "@/types";

export async function removeBackground(imageBuffer: Buffer): Promise<Buffer> {
  const apiKey = process.env.REMOVE_BG_API_KEY;

  if (!apiKey) {
    console.warn("REMOVE_BG_API_KEY not set — skipping background removal");
    return imageBuffer;
  }

  const formData = new FormData();
  const uint8 = new Uint8Array(imageBuffer);
  formData.append("image_file", new Blob([uint8]), "image.jpg");
  formData.append("size", "auto");

  const response = await fetch("https://api.remove.bg/v1.0/removebg", {
    method: "POST",
    headers: {
      "X-Api-Key": apiKey,
    },
    body: formData,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`remove.bg error ${response.status}: ${text}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

export async function extractColors(imageBuffer: Buffer): Promise<GarmentColor[]> {
  const { Vibrant } = await import("node-vibrant/node");

  const palette = await Vibrant.from(imageBuffer).getPalette();

  type SwatchRole = "dominant" | "accent" | "trim";

  const swatchMapping: Array<{ key: keyof typeof palette; role: SwatchRole }> = [
    { key: "Vibrant", role: "dominant" },
    { key: "DarkVibrant", role: "accent" },
    { key: "LightVibrant", role: "accent" },
    { key: "Muted", role: "trim" },
    { key: "DarkMuted", role: "trim" },
  ];

  const colors: GarmentColor[] = [];

  for (const { key, role } of swatchMapping) {
    const swatch = palette[key];
    if (swatch) {
      colors.push({
        hex: swatch.hex,
        role,
        percentage: swatch.population,
      });
    }
  }

  // Normalize percentages
  const total = colors.reduce((sum, c) => sum + c.percentage, 0);
  const normalized = colors.map((c) => ({
    ...c,
    percentage: total > 0 ? Math.round((c.percentage / total) * 100) : 0,
  }));

  // Sort by percentage descending, take max 5
  const sorted = normalized.sort((a, b) => b.percentage - a.percentage).slice(0, 5);

  // Force first item to dominant role
  if (sorted.length > 0) {
    sorted[0] = { ...sorted[0], role: "dominant" };
  }

  return sorted;
}

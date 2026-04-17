import { GarmentSubtype, GarmentType } from "@/types";

export const TEMPLATE_MAP: Record<GarmentSubtype, string> = {
  "t-shirt": "/models/tshirt.glb",
  "button-up": "/models/button-up.glb",
  "polo": "/models/polo.glb",
  "hoodie": "/models/hoodie.glb",
  "sweater": "/models/sweater.glb",
  "blazer": "/models/blazer.glb",
  "jeans": "/models/jeans.glb",
  "chinos": "/models/chinos.glb",
  "trousers": "/models/trousers.glb",
  "casual-dress": "/models/casual-dress.glb",
  "formal-dress": "/models/formal-dress.glb",
  "sneakers": "/models/sneakers.glb",
  "boots": "/models/boots.glb",
  "dress-shoes": "/models/dress-shoes.glb",
  "sandals": "/models/sandals.glb",
  "coat": "/models/coat.glb",
  "bomber": "/models/bomber.glb",
  "denim-jacket": "/models/denim-jacket.glb",
  "belt": "/models/belt.glb",
  "scarf": "/models/scarf.glb",
  "mini-skirt": "/models/mini-skirt.glb",
  "midi-skirt": "/models/midi-skirt.glb",
  "athletic-shorts": "/models/athletic-shorts.glb",
  "chino-shorts": "/models/chino-shorts.glb",
};

export const FALLBACK_MAP: Partial<Record<GarmentType, string>> = {
  shirt: "/models/tshirt.glb",
  pants: "/models/jeans.glb",
  jacket: "/models/bomber.glb",
  dress: "/models/casual-dress.glb",
  skirt: "/models/midi-skirt.glb",
  shoes: "/models/sneakers.glb",
  accessory: "/models/belt.glb",
  outerwear: "/models/coat.glb",
  shorts: "/models/athletic-shorts.glb",
};

export function getTemplatePath(subtype: GarmentSubtype, type?: GarmentType): string {
  if (TEMPLATE_MAP[subtype]) {
    return TEMPLATE_MAP[subtype];
  }
  if (type && FALLBACK_MAP[type]) {
    return FALLBACK_MAP[type]!;
  }
  return "/models/tshirt.glb";
}

export function getTemplateId(subtype: GarmentSubtype): string {
  return subtype;
}

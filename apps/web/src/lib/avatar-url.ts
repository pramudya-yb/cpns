export function randomSeed(length = 8): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export interface DiceBearLoreleiOptions {
  seed: string;
  backgroundColor?: string;
  hairColor?: string;
  skinColor?: string;
  glasses?: boolean;
  freckles?: boolean;
  beard?: boolean;
  earrings?: boolean;
}

export function buildDiceBearLoreleiUrl(options: DiceBearLoreleiOptions): string {
  const params = new URLSearchParams();
  params.set("seed", options.seed);
  params.set("backgroundType", "solid");
  if (options.backgroundColor) params.set("backgroundColor", options.backgroundColor);
  if (options.hairColor) params.set("hairColor", options.hairColor);
  if (options.skinColor) params.set("skinColor", options.skinColor);
  if (options.glasses) params.set("glassesProbability", "100");
  if (options.freckles) params.set("frecklesProbability", "100");
  if (options.beard) params.set("beardProbability", "100");
  if (options.earrings) params.set("earringsProbability", "100");
  return `https://api.dicebear.com/9.x/lorelei/svg?${params.toString()}`;
}

export const BACKGROUND_COLORS = [
  { label: "Matcha", value: "84e7a5" },
  { label: "Slushie", value: "3bd3fd" },
  { label: "Lemon", value: "f8cc65" },
  { label: "Ube", value: "c1b0ff" },
  { label: "Pomegranate", value: "fc7981" },
  { label: "Cream", value: "f0ebe0" },
  { label: "Silver", value: "d4d0c8" },
  { label: "Dragonfruit", value: "e84393" },
] as const;

export const SKIN_COLORS = [
  { label: "Light", value: "ffe4c4" },
  { label: "Medium Light", value: "e6baa3" },
  { label: "Tan", value: "c6866b" },
  { label: "Brown", value: "8d5524" },
  { label: "Dark", value: "5c3a21" },
] as const;

export const HAIR_COLORS = [
  { label: "Black", value: "000000" },
  { label: "Dark Brown", value: "4a3728" },
  { label: "Brown", value: "8b5e3c" },
  { label: "Auburn", value: "a0522d" },
  { label: "Blonde", value: "d4a574" },
  { label: "Light Blonde", value: "e6c7a3" },
  { label: "Silver", value: "c0c0c0" },
] as const;

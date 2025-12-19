
import { EyeColor, SkinType, Undertone } from "../types";

export type ColorHarmony = {
  lips: string[];   // [Soft, Everyday, Bold]
  eyes: string[];   // [Soft, Everyday, Bold]
  cheeks: string[]; // [Soft, Everyday, Bold]
  explanation: string;
};

// Researched professional palettes for 2024
const UNDERTONE_LIPS: Record<Undertone, string[]> = {
  [Undertone.WARM]:    ["#E2A691", "#D97D54", "#9C4221"], // Honey, Terracotta, Brick
  [Undertone.COOL]:    ["#D1A1A8", "#B85C7B", "#85122F"], // Rose, Berry, Deep Plum
  [Undertone.NEUTRAL]: ["#D9B3A8", "#C77B6B", "#8A3324"], // Sand, Mauve, Garnet
  [Undertone.OLIVE]:   ["#B58B75", "#A66D5B", "#5C2B1D"], // Caramel, Mahogany, Espresso
  [Undertone.UNKNOWN]: ["#D9B3A8", "#C77B6B", "#8A3324"],
};

const UNDERTONE_CHEEKS: Record<Undertone, string[]> = {
  [Undertone.WARM]:    ["#F2C4B1", "#E59F82", "#C6714E"], // Peach, Apricot, Bronze
  [Undertone.COOL]:    ["#F2D0D9", "#E5A1B4", "#B5607A"], // Soft Pink, Peony, Rose
  [Undertone.NEUTRAL]: ["#F2D4C2", "#E5B098", "#B57D64"], // Nude, Rosewood, Soft Coral
  [Undertone.OLIVE]:   ["#D9AF96", "#C69072", "#8C5C42"], // Amber, Copper, Earth
  [Undertone.UNKNOWN]: ["#F2D4C2", "#E5B098", "#B57D64"],
};

const EYES_BY_COLOR: Record<EyeColor, string[]> = {
  [EyeColor.BLUE]:  ["#D9C6B0", "#B8860B", "#2F4F4F"], // Champagne, Gold, Slate
  [EyeColor.GREEN]: ["#D9BFAF", "#6B3E2E", "#4B0082"], // Rose Gold, Sienna, Royal Purple
  [EyeColor.HAZEL]: ["#D9CCB0", "#8B4513", "#556B2F"], // Beige, Saddle Brown, Olive
  [EyeColor.BROWN]: ["#E5D4C2", "#A0522D", "#2E2E2E"], // Ivory, Bronze, Charcoal
  [EyeColor.GRAY]:  ["#F5F5F5", "#778899", "#1C1C1C"], // Pearl, Steel, Midnight
  [EyeColor.AMBER]: ["#F5DEB3", "#D2691E", "#800000"], // Wheat, Chocolate, Maroon
  [EyeColor.UNKNOWN]: ["#E5D4C2", "#A0522D", "#2E2E2E"],
};

function hexToRgb(hex: string) {
  const clean = hex.replace("#", "");
  return {
    r: parseInt(clean.slice(0, 2), 16),
    g: parseInt(clean.slice(2, 4), 16),
    b: parseInt(clean.slice(4, 6), 16),
  };
}

function rgbToHex(r: number, g: number, b: number) {
  const toHex = (c: number) => {
    const h = Math.max(0, Math.min(255, Math.round(c))).toString(16);
    return h.length === 1 ? `0${h}` : h;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function adjustForSkinType(hex: string, skinType: SkinType) {
  const { r, g, b } = hexToRgb(hex);
  if (skinType === SkinType.OILY) {
    return rgbToHex(r * 1.05, g * 1.05, b * 1.05);
  }
  if (skinType === SkinType.DRY) {
    return rgbToHex(r * 0.95 + 20, g * 0.95 + 20, b * 0.95 + 20);
  }
  return hex;
}

export function deriveColorHarmony(
  undertone: Undertone,
  eyeColor: EyeColor,
  skinType: SkinType
): ColorHarmony {
  const safeUndertone = undertone ?? Undertone.UNKNOWN;
  const safeEye = eyeColor ?? EyeColor.UNKNOWN;

  const lips = UNDERTONE_LIPS[safeUndertone];
  const cheeks = UNDERTONE_CHEEKS[safeUndertone];
  const eyes = EYES_BY_COLOR[safeEye];

  const adjusted = {
    lips: lips.map(c => adjustForSkinType(c, skinType)),
    cheeks: cheeks.map(c => adjustForSkinType(c, skinType)),
    eyes: eyes.map(c => adjustForSkinType(c, skinType)),
  };

  const explanation =
    `Tailored for ${safeUndertone.toLowerCase()} skin and ${safeEye.toLowerCase()} eyes. ` +
    `Shades are selected to create natural balance and enhance your specific contrasts.`;

  return { ...adjusted, explanation };
}

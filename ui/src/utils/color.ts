// Made by Gemini 4, not count time (Because I use online not agent)
/**
 * Generates a consistent, deterministic HSL color string based on an input string.
 *
 * Uses the djb2 hash algorithm variant (hash * 31 + charCode) and maps
 * the result to the 360-degree color wheel. Keeping saturation and lightness
 * fixed ensures high text readability and eliminates muddy/neon anomalies.
 *
 * @param str - The input string (e.g., username, email, ID).
 * @param s - Saturation percentage (defaults to 65% for balanced vibrancy).
 * @param l - Lightness percentage (defaults to 45% for high white-text contrast).
 * @returns Formatted HSL string, e.g., "hsl(214, 65%, 45%)".
 */
export function stringToHslColor(str: string = '', s: number = 65, l: number = 45): string {
  // Defensive check for null, undefined, or empty strings
  if (!str) return `hsl(0, 0%, 50%)`;

  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    // Bitwise shift equivalent to: hash * 31 + charCode
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Ensure positive integer and map to 0 - 359 degrees
  const h = Math.abs(hash) % 360;
  return `hsl(${h}, ${s}%, ${l}%)`;
}

/**
 * Extracts the first visual character for avatar display.
 * Uses Array.from to prevent splitting surrogate pairs (e.g., emojis, multi-byte Unicode).
 *
 * @param name - The input display name.
 * @returns The capitalized initial character, or '?' as a fallback.
 */
export function getAvatarInitial(name: string = ''): string {
  if (!name) return '?';
  const trimmed = name.trim();
  const chars = Array.from(trimmed);
  return chars[0]?.toUpperCase() || '?';
}

/**
 * Alternative: Deterministically picks a color from a curated palette.
 * Useful when keeping UI colors strictly within a brand theme.
 */
const PALETTE = [
  '#ef4444', '#f97316', '#f59e0b', '#10b981',
  '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6',
  '#ec4899', '#14b8a6'
];

export function stringToPaletteColor(str: string = ''): string {
  if (!str) return PALETTE[0];
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % PALETTE.length;
  return PALETTE[index];
}

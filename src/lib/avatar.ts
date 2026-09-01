/**
 * Avatar utilities - initials + deterministic color
 */

export function getInitials(name?: string | null, username?: string | null): string {
  const raw = (name ?? "").trim();
  if (raw) {
    // Split on whitespace / hyphen / underscore, filter empties
    const parts = raw.split(/[\s\-_]+/).filter(Boolean);
    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
  }
  const u = (username ?? "").trim();
  if (u) return u.slice(0, 2).toUpperCase();
  return "?";
}

function hashString(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) >>> 0;
  }
  return h;
}

// Palette = subtle shades of page background / secondary
// Light: warm stone/beige ~ hsl 48-60 with low saturation, dark text
// Dark: near-background charcoal with light text — via Tailwind dark: variants
// All entries use text-foreground so they auto-adapt to theme
const AVATAR_PALETTE_CLASSES: string[] = [
  "bg-[#EDECE6] dark:bg-[#1E1E1E] text-foreground border border-border", // secondary
  "bg-[#E8E6E1] dark:bg-[#212121] text-foreground border border-border",
  "bg-[#E6E3DE] dark:bg-[#242424] text-foreground border border-border", // border tone
  "bg-[#EFEBE5] dark:bg-[#1A1A1A] text-foreground border border-border",
  "bg-[#ECE9E3] dark:bg-[#262626] text-foreground border border-border",
  "bg-[#E9E7E2] dark:bg-[#1F1F1F] text-foreground border border-border",
  "bg-[#F0EDE8] dark:bg-[#232323] text-foreground border border-border",
  "bg-[#E8E8E4] dark:bg-[#1C1C1C] text-foreground border border-border",
];

export function getAvatarColor(seed: string): string {
  const idx = hashString(seed || "?") % AVATAR_PALETTE_CLASSES.length;
  return AVATAR_PALETTE_CLASSES[idx];
}

export function getAvatarFallbackProps(
  name?: string | null,
  username?: string | null,
  variant: "color" | "neutral" = "color",
): { initials: string; style?: React.CSSProperties; className: string } {
  const initials = getInitials(name, username).slice(0, 2);
  if (variant === "neutral") {
    return { initials, className: "bg-secondary text-secondary-foreground border border-border" };
  }
  const seed = (username ?? name ?? "?").toString();
  const className = getAvatarColor(seed);
  return {
    initials,
    className,
  };
}

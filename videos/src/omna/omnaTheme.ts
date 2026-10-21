// OMNA theme — mapped from the OMNA Design System tokens (tokens/colors.css,
// typography.css, spacing.css). Single source of truth for the OMNA video:
// never inline a color, easing or font in OMNA components.
import { Easing } from "remotion";

export const omna = {
  colors: {
    ink: "#160221",
    violet: "#51127F",
    amethyst: "#954ACC",
    lilac: "#DFC3F4",
    orange: "#FE651D",
    magenta: "#D6418B",
    white: "#FFFFFF",
    textSecondary: "rgba(247, 240, 252, 0.78)",
    textMuted: "rgba(223, 195, 244, 0.62)",
    borderSubtle: "rgba(223, 195, 244, 0.16)",
    scrim: "rgba(22, 2, 33, 0.62)",
    captionPlate: "rgba(22, 2, 33, 0.58)",
    glowViolet: "rgba(149, 74, 204, 0.45)",
    glowOrange: "rgba(254, 101, 29, 0.55)",
  },
  gradient: {
    brand: "linear-gradient(108deg, #51127F 0%, #954ACC 32%, #D6418B 62%, #FE651D 100%)",
    text: "linear-gradient(95deg, #FE651D 0%, #E5484D 30%, #D6418B 58%, #954ACC 100%)",
    // vertical accent rule for lower thirds: violet → orange
    rule: "linear-gradient(180deg, #954ACC 0%, #D6418B 55%, #FE651D 100%)",
  },
  fonts: {
    sans: "SFT Schrifted Sans",
  },
  weight: { light: 300, regular: 400, medium: 500, demibold: 600, bold: 700 },
  tracking: { tight: "-0.02em", snug: "-0.01em", wide: "0.04em", wider: "0.14em" },
  radius: { card: 20, plate: 14, pill: 999 },
  // brand motion is "subtle and eased-out" (--ease-out). No bounce.
  ease: {
    out: Easing.bezier(0.2, 0.7, 0.2, 1),
    inOut: Easing.bezier(0.65, 0, 0.35, 1),
    in: Easing.bezier(0.6, 0, 0.8, 0.2),
  },
  spring: {
    calm: { damping: 26, stiffness: 70, mass: 1 }, // lower thirds, type
    soft: { damping: 30, stiffness: 50, mass: 1.2 }, // logo, big elements
  },
  layout: {
    gutter: 96, // px from frame edge (1920 wide)
    captionBottom: 64,
    lowerThirdBottom: 240,
  },
} as const;

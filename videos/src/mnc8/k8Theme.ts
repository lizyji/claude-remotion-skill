// Klarna reel (Manuel NoCode) — flat brand palette only: no gradients, blurs,
// purples, pinks or blues. Titles Readex Pro, text and subtitles Poppins.
import { mnc } from "../mnc/mncTheme";

export const k8 = {
  c: {
    green: "#E5EAE5", // light green — B-roll and closing background
    black: "#141414",
    orange: "#FD6623",
    white: "#FFFFFF",
  },
  f: { title: "Readex Pro", body: "Poppins" },
  w: mnc.weight,
  ease: mnc.ease,
  // split screen: B-roll panel 0–960, Manuel 960–1920; IG UI covers the top ~200 px
  panelH: 960,
  contentTop: 200,
  footerTop: 836,
} as const;

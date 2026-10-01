import React from "react";
import { Composition, staticFile } from "remotion";
import { loadFont } from "@remotion/fonts";
import { theme } from "./theme";
import { HolaRemotion, HOLA_TOTAL_S } from "./scenes/HolaRemotion";
import { OmnaBienvenida, OMNA_TOTAL_F } from "./omna/OmnaBienvenida";
import { FPS as OMNA_FPS } from "./omna/timeline";
import { omna } from "./omna/omnaTheme";

// Fonts are self-hosted in public/fonts: the render browser can't reach
// Google Fonts through the Claude Code web proxy, and local files are deterministic.
loadFont({ family: theme.fonts.display, url: staticFile("fonts/SpaceGrotesk-Bold.woff2"), weight: "700" });
loadFont({ family: theme.fonts.body, url: staticFile("fonts/Inter-Regular.woff2"), weight: "400" });
// OMNA brand face (from the OMNA Design System; fetched by scripts/omna-prepare.sh)
for (const [file, weight] of [
  ["Light", "300"],
  ["Regular", "400"],
  ["Medium", "500"],
  ["DemiBold", "600"],
  ["Bold", "700"],
] as const) {
  loadFont({ family: omna.fonts.sans, url: staticFile(`omna/brand/fonts/SFTSchriftedSans-${file}.ttf`), weight });
}

const FPS = 30;

export const Root: React.FC = () => (
  <>
    <Composition
      id="HolaRemotion"
      component={HolaRemotion}
      durationInFrames={Math.round(FPS * HOLA_TOTAL_S)}
      fps={FPS}
      width={1920}
      height={1080}
    />
    <Composition
      id="OmnaBienvenida"
      component={OmnaBienvenida}
      durationInFrames={OMNA_TOTAL_F}
      fps={OMNA_FPS}
      width={1920}
      height={1080}
    />
  </>
);

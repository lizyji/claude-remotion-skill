import React from "react";
import { Composition, staticFile } from "remotion";
import { loadFont } from "@remotion/fonts";
import { theme } from "./theme";
import { HolaRemotion, HOLA_TOTAL_S } from "./scenes/HolaRemotion";

// Fonts are self-hosted in public/fonts: the render browser can't reach
// Google Fonts through the Claude Code web proxy, and local files are deterministic.
loadFont({ family: theme.fonts.display, url: staticFile("fonts/SpaceGrotesk-Bold.woff2"), weight: "700" });
loadFont({ family: theme.fonts.body, url: staticFile("fonts/Inter-Regular.woff2"), weight: "400" });

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
  </>
);

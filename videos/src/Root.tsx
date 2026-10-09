import React from "react";
import { Composition, staticFile } from "remotion";
import { loadFont } from "@remotion/fonts";
import { theme } from "./theme";
import { HolaRemotion, HOLA_TOTAL_S } from "./scenes/HolaRemotion";
import { OmnaBienvenida, OMNA_TOTAL_F } from "./omna/OmnaBienvenida";
import { FPS as OMNA_FPS } from "./omna/timeline";
import { omna } from "./omna/omnaTheme";
import { MncReel, MNC_FPS, MNC_TOTAL_F } from "./mnc/MncReel";
import { mnc } from "./mnc/mncTheme";
import { MncPortada } from "./mnc/MncPortada";
import { Mnc4Reel, MNC4_FPS, MNC4_TOTAL_F } from "./mnc4/Mnc4Reel";
import { Mnc5Reel, MNC5_FPS, MNC5_TOTAL_F } from "./mnc5/Mnc5Reel";

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
// MNC: Poppins (titulares) + Readex Pro (marca, cuerpo, subtítulos)
for (const [file, weight] of [["SemiBold", "600"], ["Bold", "700"], ["ExtraBold", "800"]] as const) {
  loadFont({ family: mnc.fonts.title, url: staticFile(`mnc/brand/fonts/Poppins-${file}.woff2`), weight });
}
for (const [file, weight] of [["ExtraLight", "200"], ["Regular", "400"], ["Medium", "500"], ["SemiBold", "600"]] as const) {
  loadFont({ family: mnc.fonts.body, url: staticFile(`mnc/brand/fonts/ReadexPro-${file}.woff2`), weight });
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
    <Composition
      id="MncPortada"
      component={MncPortada}
      durationInFrames={1}
      fps={30}
      width={1080}
      height={1920}
      defaultProps={{ photo: "mnc/src/portada.webp", lead: "tu", leadShift: -380, big: "dashboard", plate: "está en tu WhatsApp", spark: true }}
    />
    <Composition
      id="Mnc4Portada"
      component={MncPortada}
      durationInFrames={1}
      fps={30}
      width={1080}
      height={1920}
      defaultProps={{ photo: "mnc4/src/portada.png", zoom: 1.08, lead: "4 cosas que sigues haciendo", leadSize: 80, big: "a mano", bigSize: 230, plate: "que la IA ya hace", top: 1250 }}
    />
    <Composition id="Mnc4CosasAMano" component={Mnc4Reel} durationInFrames={MNC4_TOTAL_F} fps={MNC4_FPS} width={1080} height={1920} />
    <Composition id="Mnc5Cotizador" component={Mnc5Reel} durationInFrames={MNC5_TOTAL_F} fps={MNC5_FPS} width={1080} height={1920} />
    <Composition
      id="Mnc5Portada"
      component={MncPortada}
      durationInFrames={1}
      fps={30}
      width={1080}
      height={1920}
      defaultProps={{ photo: "mnc5/src/portada.png", zoom: 1.08, lead: "crea tu", leadShift: -330, big: "cotizador", bigSize: 200, plate: "con IA, sin programar", top: 1250 }}
    />
    <Composition
      id="MncDashboardWhatsApp"
      component={MncReel}
      durationInFrames={MNC_TOTAL_F}
      fps={MNC_FPS}
      width={1080}
      height={1920}
    />
  </>
);

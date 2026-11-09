import React from "react";
import { Composition, getStaticFiles, staticFile } from "remotion";
import { loadFont } from "@remotion/fonts";
import { theme } from "./theme";
import { HolaRemotion, HOLA_TOTAL_S } from "./scenes/HolaRemotion";
import { OmnaBienvenida, OMNA_TOTAL_F } from "./omna/OmnaBienvenida";
import { FPS as OMNA_FPS } from "./omna/timeline";
import { omna } from "./omna/omnaTheme";
import { MncReel, MNC_FPS, MNC_TOTAL_F } from "./mnc/MncReel";
import { mnc } from "./mnc/mncTheme";
import { MncPortada } from "./mnc/MncPortada";
import { MncPortadaV2 } from "./mnc/MncPortadaV2";
import { Mnc4Reel, MNC4_FPS, MNC4_TOTAL_F } from "./mnc4/Mnc4Reel";
import { Mnc5Reel, MNC5_FPS, MNC5_TOTAL_F } from "./mnc5/Mnc5Reel";
import { OmnaManuel, OMNA2_FPS, OMNA2_TOTAL_F } from "./omna2/OmnaManuel";
import { Mnc6Reel, MNC6_FPS, MNC6_TOTAL_F } from "./mnc6/Mnc6Reel";
import { Mnc7Reel, MNC7_FPS, MNC7_TOTAL_F } from "./mnc7/Mnc7Reel";
import { Mnc8Broll, Mnc8Reel, MNC8_FPS, MNC8_TOTAL_F } from "./mnc8/Mnc8Reel";
import { Mnc9Broll, Mnc9Reel, MNC9_FPS, MNC9_TOTAL_F } from "./mnc9/Mnc9Reel";
import { Mnc10Broll, Mnc10Reel, MNC10_FPS, MNC10_TOTAL_F } from "./mnc10/Mnc10Reel";
import { Mnc11Broll, Mnc11Reel, MNC11_FPS, MNC11_TOTAL_F } from "./mnc11/Mnc11Reel";

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
  // media is gitignored: skip the OMNA face when omna:prepare hasn't run in this checkout
  const f = `omna/brand/fonts/SFTSchriftedSans-${file}.ttf`;
  if (getStaticFiles().some((x) => x.name === f)) loadFont({ family: omna.fonts.sans, url: staticFile(f), weight });
}
// MNC: Poppins (titulares) + Readex Pro (marca, cuerpo, subtítulos)
for (const [file, weight] of [["Medium", "500"], ["SemiBold", "600"], ["Bold", "700"], ["ExtraBold", "800"]] as const) {
  loadFont({ family: mnc.fonts.title, url: staticFile(`mnc/brand/fonts/Poppins-${file}.woff2`), weight });
}
for (const [file, weight] of [["ExtraLight", "200"], ["Regular", "400"], ["Medium", "500"], ["SemiBold", "600"], ["Bold", "700"]] as const) {
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
    <Composition id="OmnaManuelCeo" component={OmnaManuel} durationInFrames={OMNA2_TOTAL_F} fps={OMNA2_FPS} width={1920} height={1080} />
    <Composition id="Mnc6AgentesGrokBot" component={Mnc6Reel} durationInFrames={MNC6_TOTAL_F} fps={MNC6_FPS} width={1080} height={1920} />
    <Composition
      id="Mnc6Portada"
      component={MncPortada}
      durationInFrames={1}
      fps={30}
      width={1080}
      height={1920}
      defaultProps={{ photo: "mnc6/src/portada.png", zoom: 1.08, lead: "crea tu equipo de", leadSize: 84, big: "agentes IA", bigSize: 190, plate: "más fácil de lo que imaginas", plateSize: 66, top: 1250 }}
    />
    <Composition id="Mnc11Ideas" component={Mnc11Reel} durationInFrames={MNC11_TOTAL_F} fps={MNC11_FPS} width={1080} height={1920} />
    <Composition id="Mnc11Broll" component={Mnc11Broll} defaultProps={{ i: 0 }} durationInFrames={MNC11_TOTAL_F} fps={MNC11_FPS} width={1080} height={960} />
    <Composition id="Mnc10Gong" component={Mnc10Reel} durationInFrames={MNC10_TOTAL_F} fps={MNC10_FPS} width={1080} height={1920} />
    <Composition
      id="Mnc10Portada"
      component={MncPortadaV2}
      durationInFrames={1}
      fps={30}
      width={1080}
      height={1920}
      defaultProps={{
        photo: "mnc10/src/frames/f2.png",
        zoom: 1.2,
        focus: [515, 900],
        logo: { src: "mnc10/captures/gong_logo_white.svg", width: 400, top: 236 },
        blocks: [
          { lines: ["Deja de perder", "clientes"], top: 410, size: 112, band: true },
          { lines: ["con tus", "presentaciones", "de ventas"], top: 1392, size: 96 },
        ],
      }}
    />
    <Composition id="Mnc10Broll" component={Mnc10Broll} defaultProps={{ i: 0 }} durationInFrames={MNC10_TOTAL_F} fps={MNC10_FPS} width={1080} height={960} />
    <Composition id="Mnc9Ups" component={Mnc9Reel} durationInFrames={MNC9_TOTAL_F} fps={MNC9_FPS} width={1080} height={1920} />
    <Composition id="Mnc9Broll" component={Mnc9Broll} defaultProps={{ i: 0 }} durationInFrames={MNC9_TOTAL_F} fps={MNC9_FPS} width={1080} height={960} />
    <Composition
      id="Mnc9Portada"
      component={MncPortada}
      durationInFrames={1}
      fps={30}
      width={1080}
      height={1920}
      defaultProps={{ photo: "mnc9/src/portada.png", zoom: 1.08, lead: "1 milla menos =", big: "hasta $50 M", bigSize: 160, plate: "al año, según ups", plateSize: 64, top: 1300 }}
    />
    <Composition
      id="Mnc8PortadaKlarna"
      component={MncPortada}
      durationInFrames={1}
      fps={30}
      width={1080}
      height={1920}
      defaultProps={{
        photo: "mnc8/src/portada_manuel.png",
        zoom: 1.0,
        logo: { src: "mnc8/captures/klarna_logo.svg", width: 360, top: 620 },
        lead: "reemplazó trabajo con ia…",
        leadSize: 80,
        big: "y volvió",
        bigSize: 196,
        plate: "a contratar humanos",
        plateSize: 76,
        plateGap: 14,
        top: 1270,
      }}
    />
    <Composition id="Mnc8Klarna" component={Mnc8Reel} durationInFrames={MNC8_TOTAL_F} fps={MNC8_FPS} width={1080} height={1920} />
    <Composition id="Mnc8Broll" component={Mnc8Broll} defaultProps={{ i: 0 }} durationInFrames={MNC8_TOTAL_F} fps={MNC8_FPS} width={1080} height={960} />
    <Composition
      id="Mnc8Portada"
      component={MncPortada}
      durationInFrames={1}
      fps={30}
      width={1080}
      height={1920}
      defaultProps={{ photo: "mnc8/src/portada.png", zoom: 1.08, lead: "klarna", leadShift: -300, big: "volvió", leadSize: 110, bigSize: 220, plate: "a contratar humanos", plateSize: 64, top: 1300 }}
    />
    <Composition id="Mnc7SistemasProcesos" component={Mnc7Reel} durationInFrames={MNC7_TOTAL_F} fps={MNC7_FPS} width={1080} height={1920} />
    <Composition
      id="Mnc7Portada"
      component={MncPortada}
      durationInFrames={1}
      fps={30}
      width={1080}
      height={1920}
      defaultProps={{ photo: "mnc7/src/portada.png", zoom: 1.08, lead: "construir", leadShift: -280, big: "sistemas", bigSize: 210, plate: "es mejor que construir procesos", plateSize: 58, top: 1300 }}
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

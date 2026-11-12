import React from "react";
import { Composition, Still, getInputProps } from "remotion";
import { Reel } from "./Reel";
import { Portada } from "./Portada";
import { BRollSuelto, GolpeSuelto } from "./Sueltos";
import type { Reel as ReelData } from "./reel/types";
import demo from "../reels/demo/reel.json";

// Elige el reel con:  --props='{"reel": <contenido de reels/<slug>/reel.json>}'
// o, más cómodo:      npm run render -- --props=reels/<slug>/props.json out/<slug>.mp4
const inputReel = (getInputProps() as { reel?: ReelData }).reel;
const reel = (inputReel ?? demo) as ReelData;

export const Root: React.FC = () => (
  <>
    <Composition
      id="Reel"
      component={Reel}
      defaultProps={{ reel }}
      fps={30}
      width={1080}
      height={1920}
      durationInFrames={Math.round(reel.duracion * 30)}
      calculateMetadata={({ props }) => ({ durationInFrames: Math.round(props.reel.duracion * 30) })}
    />
    <Composition
      id="BRollSuelto"
      component={BRollSuelto}
      defaultProps={{ b: reel.broll[0] }}
      fps={30}
      width={1080}
      height={960}
      durationInFrames={90}
      calculateMetadata={({ props }) => ({ durationInFrames: Math.max(1, Math.round((props.b.end - props.b.start) * 30)) })}
    />
    <Composition
      id="GolpeSuelto"
      component={GolpeSuelto}
      defaultProps={{ g: reel.golpes[0], palabras: reel.palabras }}
      fps={30}
      width={1080}
      height={1920}
      durationInFrames={90}
      calculateMetadata={({ props }) => ({ durationInFrames: Math.max(1, Math.round((props.g.end - props.g.start) * 30)) })}
    />
    <Still id="Portada" component={Portada} defaultProps={{ reel }} width={1080} height={1920} />
  </>
);

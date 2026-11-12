import React from "react";
import { Composition, Still, getInputProps } from "remotion";
import { Reel } from "./Reel";
import { Portada } from "./Portada";
import { BRollSuelto, duracionSuelto, type SueltoProps } from "./BRollSuelto";
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
      id="BRoll"
      component={BRollSuelto}
      defaultProps={{ reel, tipo: "broll", i: 0 } as SueltoProps}
      fps={30}
      width={1080}
      height={960}
      durationInFrames={30}
      calculateMetadata={({ props }) => duracionSuelto(props)}
    />
    <Still id="Portada" component={Portada} defaultProps={{ reel }} width={1080} height={1920} />
  </>
);

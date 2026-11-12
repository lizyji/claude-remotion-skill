import React from "react";
import { Composition, Still, getInputProps } from "remotion";
import { Reel } from "./Reel";
import { Portada } from "./Portada";
import type { Reel as ReelData, BRoll } from "./reel/types";
import { Clip, CierreSolo } from "./Clip";
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
    {/* B-roll suelto (panel 1080×960) para la carpeta de entrega: --props='{"b":{...},"desde":0}' */}
    <Composition
      id="Clip"
      component={Clip}
      defaultProps={{ b: reel.broll[0] as BRoll, desde: 0, dur: 3 }}
      fps={30}
      width={1080}
      height={960}
      durationInFrames={90}
      calculateMetadata={({ props }) => ({ durationInFrames: Math.round(props.dur * 30) })}
    />
    <Composition id="Cierre" component={CierreSolo} defaultProps={{ dur: 5 }} fps={30} width={1080} height={1920} durationInFrames={150}
      calculateMetadata={({ props }) => ({ durationInFrames: Math.round(props.dur * 30) })} />
    <Still id="Portada" component={Portada} defaultProps={{ reel }} width={1080} height={1920} />
  </>
);

import React from "react";
import { Composition, Still, getInputProps } from "remotion";
import { Reel } from "./Reel";
import { Portada } from "./Portada";
import { Clip, buscarClip } from "./Clip";
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
      id="Clip"
      component={Clip}
      defaultProps={{ reel, id: (getInputProps() as { id?: string }).id ?? "" }}
      fps={30}
      width={1080}
      height={960}
      durationInFrames={90}
      calculateMetadata={({ props }) => {
        const { b, g } = buscarClip(props.reel, props.id);
        const x = b ?? g;
        return {
          durationInFrames: x ? Math.max(1, Math.round((x.end - x.start) * 30)) : 90,
          height: g ? 1920 : 960,
        };
      }}
    />
    <Still id="Portada" component={Portada} defaultProps={{ reel }} width={1080} height={1920} />
  </>
);

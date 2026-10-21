import data from "./timeline.json";

// Edit decision list for the OMNA welcome video. Clips are pre-processed
// segments (see scripts/omna-prepare.sh); "join" is how a clip enters from
// the previous block. Absolute start frames are derived here once so captions,
// lower thirds and music ducking all share the same clock.
export type Person = "manuel" | "pamela" | "lizy" | "joel";
export type ClipDef = {
  id: string;
  src: string;
  frames: number;
  person: Person;
  join: "fade" | "cut";
  joinFrames?: number;
};

export const FPS = data.fps;
export const INTRO_F = data.intro.frames;
export const OUTRO_F = data.outro.frames;
export const OUTRO_FADE_F = data.outro.fadeIn;
export const CLIPS = data.clips as ClipDef[];

const overlap = (c: ClipDef) => (c.join === "fade" ? (c.joinFrames ?? 0) : 0);

// absolute start frame of each clip in the final timeline
export const CLIP_STARTS: Record<string, number> = (() => {
  const out: Record<string, number> = {};
  let t = INTRO_F;
  for (const c of CLIPS) {
    t -= overlap(c);
    out[c.id] = t;
    t += c.frames;
  }
  return out;
})();

const last = CLIPS[CLIPS.length - 1];
export const OUTRO_START = CLIP_STARTS[last.id] + last.frames - OUTRO_FADE_F;
export const TOTAL_F = OUTRO_START + OUTRO_F;

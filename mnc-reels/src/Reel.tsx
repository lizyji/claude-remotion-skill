import React from "react";
import { AbsoluteFill, Audio, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "./theme";
import type { Reel as ReelData } from "./reel/types";
import { activo, mezclaPanel, zoomCorte } from "./reel/tiempo";
import { Manuel } from "./components/Manuel";
import { BRollView } from "./components/BRolls";
import { GolpeView } from "./components/Golpes";
import { Paso, Subtitulos } from "./components/Subtitulos";
import { FuentePie } from "./components/Base";

const { color, layout } = theme;
const dB = (x: number) => Math.pow(10, x / 20);

// SFX automáticos: whoosh en cada cambio de clip, pop en cada elemento de lista,
// tick al terminar un contador, bass en cada golpe a pantalla completa.
const sfxAuto = (reel: ReelData) => {
  const out: { t: number; s: string }[] = [];
  for (const b of reel.broll) {
    out.push({ t: Math.max(0, b.start - 0.08), s: "whoosh" });
    if (b.tipo === "lista") b.items.forEach((_, i) => out.push({ t: b.start + 0.35 + i * (b.cada ?? 1.2), s: "pop" }));
    if (b.tipo === "contador") out.push({ t: b.start + 0.2 + 1.0, s: "tick" });
    if (b.tipo === "logo" || b.tipo === "cita" || b.tipo === "tarjeta") out.push({ t: b.start + 0.1, s: "pop" });
  }
  for (const g of reel.golpes) out.push({ t: g.start, s: g.tipo === "cierre" ? "whoosh" : "bass" });
  for (const p of reel.pasos ?? []) out.push({ t: p.start, s: "click" });
  return [...out, ...(reel.sfx ?? [])];
};

export const Reel: React.FC<{ reel: ReelData }> = ({ reel }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const t = frame / fps;
  const f = (s: number) => Math.round(s * fps);

  const m = mezclaPanel(reel, t);
  const zoom = zoomCorte(reel, t);
  const caraY = reel.caraYFuente ?? 0.38;
  const golpe = activo(reel.golpes, t);
  const silueta = reel.broll.find((b) => b.tipo === "silueta" && t >= b.start && t < b.end);
  const bloque = activo(reel.subs, t);
  const paso = activo(reel.pasos, t);

  // Música: ≈ −23 dB bajo la voz, sube un poco en golpes, baja al final
  const musicaVol = (fr: number) => {
    const ts = fr / fps;
    const enGolpe = activo(reel.golpes, ts);
    const base = enGolpe && enGolpe.tipo !== "cierre" ? dB(-18) : dB(-23);
    const salida = interpolate(fr, [durationInFrames - f(2), durationInFrames], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const entrada = interpolate(fr, [0, f(0.5)], [0, 1], { extrapolateRight: "clamp" });
    return base * salida * entrada;
  };

  return (
    <AbsoluteFill style={{ background: color.verde }}>
      {/* 1 · Manuel (con su audio, ya normalizado a −14 LUFS) */}
      <Manuel src={reel.manuel} mezcla={m} zoom={zoom} caraYFuente={caraY} />

      {/* 2 · Panel verde claro que se funde hacia Manuel (composición A) */}
      <AbsoluteFill
        style={{
          height: layout.fadeTo,
          background: color.verde,
          opacity: m,
          WebkitMaskImage: `linear-gradient(to bottom, #000 ${layout.fadeFrom}px, transparent ${layout.fadeTo}px)`,
          maskImage: `linear-gradient(to bottom, #000 ${layout.fadeFrom}px, transparent ${layout.fadeTo}px)`,
        }}
      />
      {reel.broll
        .filter((b) => b.tipo !== "silueta")
        .map((b, i) => (
          <Sequence key={i} from={f(b.start)} durationInFrames={Math.max(1, f(b.end) - f(b.start))} layout="none">
            <BRollView b={b} conPaso={(reel.pasos ?? []).some((s) => s.start < b.end && s.end > b.start)} />
          </Sequence>
        ))}

      {/* 3 · Composición B/C: stock de personas a pantalla completa + silueta de Manuel */}
      {silueta && silueta.tipo === "silueta" && reel.manuelMatte ? (
        <Sequence from={f(silueta.start)} durationInFrames={f(silueta.end) - f(silueta.start)}>
          <AbsoluteFill>
            <OffthreadVideo src={staticFile(silueta.src)} muted startFrom={f(silueta.desde ?? 0)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </AbsoluteFill>
          <Manuel src={reel.manuelMatte} mezcla={0} zoom={zoom} caraYFuente={caraY} transparent muted />
          <FuentePie texto={silueta.fuente} />
        </Sequence>
      ) : null}

      {/* 4 · Número de paso */}
      {paso && !golpe ? <Paso n={paso.n} p={spring({ frame: frame - f(paso.start), fps, config: theme.spring.golpe })} /> : null}

      {/* 5 · Subtítulos (ocultos en golpes y cierre) */}
      {bloque && !golpe ? <Subtitulos bloque={bloque} t={t} /> : null}

      {/* 6 · Golpes a pantalla completa */}
      {reel.golpes.map((g, i) => (
        <Sequence key={i} from={f(g.start)} durationInFrames={Math.max(1, (g.tipo === "cierre" ? durationInFrames : f(g.end)) - f(g.start))}>
          <GolpeView g={g} palabras={reel.palabras} />
        </Sequence>
      ))}

      {/* Audio: música + efectos */}
      {reel.musica ? <Audio src={staticFile(reel.musica)} volume={musicaVol} loop /> : null}
      {sfxAuto(reel).map((s, i) => (
        <Sequence key={`sfx${i}`} from={f(s.t)} durationInFrames={f(1)} layout="none">
          <Audio src={staticFile(`sfx/${s.s}.wav`)} volume={s.s === "whoosh" ? 0.35 : 0.5} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

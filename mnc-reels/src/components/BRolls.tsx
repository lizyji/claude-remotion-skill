import React from "react";
import { Img, OffthreadVideo, interpolate, staticFile, useCurrentFrame, useVideoConfig, spring } from "remotion";
import { theme } from "../theme";
import type { BRoll } from "../reel/types";
import { Check, ConIA, Entra, FuentePie, Pildora, Tarjeta, useEntradaSalida } from "./Base";

const { color, font, layout } = theme;
const AREA = { left: 60, top: layout.panelTop, width: 960, height: layout.panelBottom - layout.panelTop };

// conPaso: deja libre la esquina del número de paso bajando el área del panel
const Area: React.FC<{ children: React.ReactNode; center?: boolean; conPaso?: boolean }> = ({ children, center = true, conPaso }) => (
  <div
    style={{
      position: "absolute",
      ...AREA,
      ...(conPaso ? { top: AREA.top + 130, height: AREA.height - 130 } : {}),
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: center ? "center" : "flex-start",
    }}
  >
    {children}
  </div>
);

const Titulo: React.FC<{ children: React.ReactNode; size?: number; style?: React.CSSProperties }> = ({ children, size = 56, style }) => (
  <div style={{ fontFamily: font.titulo, fontWeight: 700, fontSize: size, lineHeight: 1.12, color: color.negro, ...style }}>
    {children}
  </div>
);

// Un B-roll vive dentro de un <Sequence>: frame 0 = su inicio.
export const BRollView: React.FC<{ b: BRoll; conPaso?: boolean }> = ({ b, conPaso }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const dur = Math.round((b.end - b.start) * fps);
  const p = useEntradaSalida(dur);
  const fuente = "fuente" in b ? b.fuente : undefined;

  let body: React.ReactNode = null;
  switch (b.tipo) {
    case "cita":
      body = (
        <Tarjeta style={{ width: 920 }}>
          {b.medio ? <Pildora tono="negro" style={{ marginBottom: 26 }}>{b.medio}</Pildora> : null}
          <Titulo size={64}>“<ConIA texto={b.titular} />”</Titulo>
        </Tarjeta>
      );
      break;
    case "pendiente":
      body = (
        <Tarjeta fondo={color.verde} style={{ width: 860, textAlign: "center" }}>
          <Titulo size={56} style={{ color: color.gris }}>[Grabación pendiente: {b.id}]</Titulo>
        </Tarjeta>
      );
      break;
    case "imagen": {
      const [z0, z1] = b.zoom ?? [1, 1.08];
      const z = interpolate(frame, [0, dur], [z0, z1], { extrapolateRight: "clamp", easing: theme.ease.inOut });
      const [fx, fy] = b.foco ?? [50, 50];
      body = (
        <div style={{ width: 960, height: 600, borderRadius: theme.card.radius, border: theme.card.border, overflow: "hidden", background: color.blanco }}>
          <Img
            src={staticFile(b.src)}
            style={{ width: "100%", height: "100%", objectFit: b.fit ?? "cover", transform: `scale(${z})`, transformOrigin: `${fx}% ${fy}%` }}
          />
        </div>
      );
      break;
    }
    case "video": {
      const z = interpolate(frame, [0, dur], [1, 1.05], { extrapolateRight: "clamp", easing: theme.ease.inOut });
      const r = b.recorte ?? { x: 0, y: 0, w: 1, h: 1 };
      body = (
        <div style={{ width: 960, height: 600, borderRadius: theme.card.radius, border: theme.card.border, overflow: "hidden", background: color.negro, position: "relative" }}>
          <div style={{ position: "absolute", inset: 0, transform: `scale(${z})` }}>
            <OffthreadVideo
              src={staticFile(b.src)}
              muted
              startFrom={Math.round((b.desde ?? 0) * fps)}
              style={{
                position: "absolute",
                width: `${100 / r.w}%`,
                height: `${100 / r.h}%`,
                left: `${(-r.x / r.w) * 100}%`,
                top: `${(-r.y / r.h) * 100}%`,
                objectFit: b.fit ?? "cover",
              }}
            />
          </div>
        </div>
      );
      break;
    }
    case "logo":
      body = (
        <Tarjeta style={{ width: 760, display: "flex", flexDirection: "column", alignItems: "center", gap: 30 }}>
          <Img src={staticFile(b.src)} style={{ maxWidth: 560, maxHeight: 240, objectFit: "contain" }} />
          {b.etiqueta ? <Pildora>{b.etiqueta}</Pildora> : null}
        </Tarjeta>
      );
      break;
    case "contador": {
      const d0 = Math.round((b.desde ?? 0.2) * fps);
      const cuenta = interpolate(frame, [d0, d0 + fps * 1.0], [0, b.valor], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: theme.ease.out,
      });
      const golpe = spring({ frame: frame - (d0 + fps), fps, config: theme.spring.golpe });
      const s = 1 + 0.08 * Math.sin(Math.min(1, golpe) * Math.PI);
      const txt = cuenta.toLocaleString("es-MX", {
        minimumFractionDigits: b.decimales ?? 0,
        maximumFractionDigits: b.decimales ?? 0,
      });
      body = (
        <Tarjeta style={{ width: 860, textAlign: "center" }}>
          <div style={{ fontFamily: font.titulo, fontWeight: 700, fontSize: 210, color: color.naranja, lineHeight: 1, transform: `scale(${s})` }}>
            {b.prefijo ?? ""}
            {txt}
            {b.sufijo ?? ""}
          </div>
          <div style={{ fontFamily: font.texto, fontWeight: 600, fontSize: 46, color: color.negro, marginTop: 18 }}>{b.etiqueta}</div>
        </Tarjeta>
      );
      break;
    }
    case "lista": {
      const cada = b.cada ?? 1.2;
      body = (
        <Tarjeta style={{ width: 920 }}>
          {b.titulo ? <Titulo size={56} style={{ marginBottom: 30 }}>{b.titulo}</Titulo> : null}
          {b.items.map((it, i) => {
            const pi = spring({ frame: frame - Math.round((0.35 + i * cada) * fps), fps, config: theme.spring.suave });
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 22,
                  margin: "20px 0",
                  opacity: pi,
                  transform: `translateX(${interpolate(pi, [0, 1], [40, 0])}px) scale(${interpolate(pi, [0, 1], [0.94, 1])})`,
                }}
              >
                {b.check !== false ? <Check p={pi} size={64} /> : <Pildora style={{ padding: "6px 18px" }}>{i + 1}</Pildora>}
                <span style={{ fontFamily: font.texto, fontWeight: 600, fontSize: 48, color: color.negro }}>
                  <ConIA texto={it} />
                </span>
              </div>
            );
          })}
        </Tarjeta>
      );
      break;
    }
    case "tarjeta": {
      const pt = b.textoEn ? spring({ frame: frame - Math.round(b.textoEn * fps), fps, config: theme.spring.suave }) : 1;
      body = (
        <Tarjeta style={{ width: 940, padding: "56px 56px" }}>
          {b.pildora ? <Pildora tono={b.tono} style={{ marginBottom: 24 }}>{b.pildora}</Pildora> : null}
          <Titulo size={72}>
            <ConIA texto={b.titulo} />
          </Titulo>
          {b.texto ? (
            <div
              style={{
                fontFamily: font.texto,
                fontWeight: b.textoEn ? 600 : 400,
                fontSize: b.textoEn ? 42 : 36,
                color: b.textoEn ? color.negro : color.gris,
                marginTop: 22,
                lineHeight: 1.3,
                opacity: pt,
                transform: `translateY(${interpolate(pt, [0, 1], [24, 0])}px)`,
                ...(b.textoEn ? { borderTop: `3px solid ${color.negro}`, paddingTop: 22 } : {}),
              }}
            >
              <ConIA texto={b.texto} />
            </div>
          ) : null}
        </Tarjeta>
      );
      break;
    }
    case "texto": {
      const g = spring({ frame: frame - 3, fps, config: theme.spring.golpe });
      body = (
        <div style={{ textAlign: "center", width: 960 }}>
          {b.arriba ? <Titulo size={60} style={{ marginBottom: 10 }}>{b.arriba}</Titulo> : null}
          <Titulo
            size={b.size ?? 150}
            style={{ color: b.tono === "negro" ? color.negro : color.naranja, lineHeight: 1.02, transform: `scale(${interpolate(g, [0, 1], [1.45, 1])})` }}
          >
            {b.titulo}
          </Titulo>
          {b.abajo ? <Titulo size={60} style={{ marginTop: 14 }}>{b.abajo}</Titulo> : null}
        </div>
      );
      break;
    }
    case "tacha": {
      const fa = Math.round((b.antesEn ?? 0.1) * fps);
      const ft = Math.round(b.tachaEn * fps);
      const pa = spring({ frame: frame - fa, fps, config: theme.spring.suave });
      const raya = interpolate(frame, [ft, ft + 7], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: theme.ease.out });
      const pd = spring({ frame: frame - ft - 8, fps, config: theme.spring.golpe });
      body = (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 26, width: 960 }}>
          {b.pildora ? <Pildora tono="negro">{b.pildora}</Pildora> : null}
          <div style={{ position: "relative", opacity: pa * interpolate(raya, [0, 1], [1, 0.55]), transform: `scale(${interpolate(pa, [0, 1], [0.85, 1])})` }}>
            <Titulo size={96} style={{ color: color.gris }}>
              {b.antes}
            </Titulo>
            <div style={{ position: "absolute", left: -12, top: "52%", height: 12, borderRadius: 6, background: color.negro, width: `calc(${raya * 100}% + 24px)`, opacity: raya > 0 ? 1 : 0 }} />
          </div>
          <Tarjeta style={{ opacity: pd, transform: `scale(${interpolate(pd, [0, 1], [1.4, 1])})`, padding: "30px 44px" }}>
            <Titulo size={104} style={{ color: color.naranja, textAlign: "center" }}>
              {b.despues}
            </Titulo>
          </Tarjeta>
        </div>
      );
      break;
    }
    case "cotizacion": {
      // Gráfica genérica: serie fija que sube, se dibuja de izquierda a derecha
      const ys = [62, 58, 64, 55, 57, 48, 52, 41, 44, 33, 36, 24, 18];
      const W = 820, H = 250;
      const pts = ys.map((y, i) => [(i / (ys.length - 1)) * W, (y / 70) * H] as const);
      const d = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
      const draw = interpolate(frame, [8, 8 + fps * 1.4], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: theme.ease.out });
      const last = pts[Math.min(pts.length - 1, Math.floor(draw * (pts.length - 1)))];
      const pd = spring({ frame: frame - 10, fps, config: theme.spring.golpe });
      body = (
        <Tarjeta style={{ width: 920, padding: "40px 50px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <Pildora tono="negro">{b.mercado}</Pildora>
            <span style={{ fontFamily: font.titulo, fontWeight: 700, fontSize: 84, color: color.negro, letterSpacing: 4 }}>{b.clave}</span>
            <span style={{ marginLeft: "auto", fontFamily: font.titulo, fontWeight: 700, fontSize: 60, color: color.naranja }}>▲</span>
          </div>
          <svg width={W} height={H + 20} style={{ marginTop: 22, overflow: "visible" }}>
            {[0, 1, 2, 3].map((i) => (
              <line key={i} x1={0} x2={W} y1={(i * H) / 3} y2={(i * H) / 3} stroke={color.verde} strokeWidth={3} />
            ))}
            <path d={d} fill="none" stroke={color.naranja} strokeWidth={9} strokeLinejoin="round" strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} />
            <circle cx={last[0]} cy={last[1]} r={14} fill={color.naranja} stroke={color.negro} strokeWidth={3} opacity={draw > 0 ? 1 : 0} />
          </svg>
          <div style={{ marginTop: 18, fontFamily: font.titulo, fontWeight: 700, fontSize: 62, color: color.negro, opacity: pd, transform: `scale(${interpolate(pd, [0, 1], [1.25, 1])})`, transformOrigin: "left center" }}>
            {b.dato}
          </div>
        </Tarjeta>
      );
      break;
    }
    case "digitos": {
      const d0 = Math.round((b.desde ?? 0.3) * fps);
      const porDig = 0.09 * fps;
      const nVis = Math.max(0, Math.min(b.valor.length, Math.floor((frame - d0) / porDig) + 1));
      const pe = spring({ frame: frame - d0 - Math.round(b.valor.length * porDig), fps, config: theme.spring.suave });
      const size = Math.min(150, Math.floor(1420 / b.valor.length));
      body = (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 960 }}>
          {b.arriba ? <Titulo size={frame < d0 ? 120 : 64} style={{ color: frame < d0 ? color.naranja : color.negro, marginBottom: 26 }}>{b.arriba}</Titulo> : null}
          <Tarjeta style={{ width: 960, padding: "36px 20px", textAlign: "center", opacity: frame < d0 - 4 ? 0 : 1 }}>
            <div style={{ fontFamily: font.titulo, fontWeight: 700, fontSize: size, color: color.naranja, lineHeight: 1, whiteSpace: "nowrap" }}>
              {b.valor.split("").map((c, i) => (
                <span key={i} style={{ opacity: i < nVis ? 1 : 0.12, color: i < nVis ? color.naranja : color.gris }}>{c}</span>
              ))}
            </div>
            {b.etiqueta ? (
              <div style={{ fontFamily: font.texto, fontWeight: 600, fontSize: 46, color: color.negro, marginTop: 18, opacity: pe }}>{b.etiqueta}</div>
            ) : null}
          </Tarjeta>
        </div>
      );
      break;
    }
    case "aviso":
      body = (
        <div style={{ background: color.gris, border: theme.card.border, borderRadius: theme.card.radius, padding: "50px 56px", width: 900, display: "flex", alignItems: "center", gap: 30 }}>
          <svg width={110} height={110} viewBox="0 0 100 100" style={{ flexShrink: 0 }}>
            <circle cx={50} cy={50} r={44} fill="none" stroke={color.blanco} strokeWidth={8} />
            <rect x={45} y={24} width={10} height={36} rx={5} fill={color.naranja} />
            <circle cx={50} cy={74} r={6.5} fill={color.naranja} />
          </svg>
          <div style={{ fontFamily: font.titulo, fontWeight: 700, fontSize: 64, lineHeight: 1.1, color: color.blanco }}>{b.texto}</div>
        </div>
      );
      break;
    case "mosaico": {
      const n = b.n ?? 12;
      const cada = b.cada ?? 0.22;
      const pe = spring({ frame: frame - Math.round((0.4 + n * cada) * fps), fps, config: theme.spring.golpe });
      body = (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 28 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 128px)", gap: 18 }}>
            {Array.from({ length: n }).map((_, i) => {
              const on = interpolate(frame, [(0.4 + i * cada) * fps, (0.4 + i * cada) * fps + 4], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
              const alto = [150, 120, 170, 135, 160, 125][(i * 7) % 6];
              return (
                <div key={i} style={{ height: 180, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
                  <div style={{ width: 110, height: alto, background: color.blanco, border: theme.card.border, borderRadius: 12, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 9, padding: 14, boxSizing: "border-box", alignContent: "start", transform: `scale(${1 + 0.06 * Math.sin(on * Math.PI)})` }}>
                    {Array.from({ length: alto > 140 ? 12 : 9 }).map((__, k) => (
                      <div key={k} style={{ height: 16, borderRadius: 3, background: on > 0.5 && (k + i) % 4 !== 0 ? color.naranja : color.verde }} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          <Pildora tono="negro" style={{ fontSize: 44, opacity: pe, transform: `scale(${interpolate(pe, [0, 1], [1.3, 1])})` }}>
            {b.etiqueta}
          </Pildora>
        </div>
      );
      break;
    }
    case "silueta":
      return null; // se dibuja a pantalla completa en Reel.tsx
  }

  return (
    <>
      <Area conPaso={conPaso}>
        <Entra p={p}>{body}</Entra>
      </Area>
      <FuentePie texto={fuente} p={p} />
    </>
  );
};

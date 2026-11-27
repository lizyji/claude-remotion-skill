import React from "react";
import { Img, OffthreadVideo, interpolate, staticFile, useCurrentFrame, useVideoConfig, spring } from "remotion";
import { theme } from "../theme";
import type { BRoll } from "../reel/types";
import { Check, ConIA, Entra, FuentePie, Pildora, Tarjeta, useEntradaSalida } from "./Base";
import { BRollExtra } from "./BRollsExtra";

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
        <div style={{ width: 960, height: conPaso ? 480 : 600, borderRadius: theme.card.radius, border: theme.card.border, overflow: "hidden", background: color.blanco, position: "relative" }}>
          <Img
            src={staticFile(b.src)}
            style={{ width: "100%", height: "100%", objectFit: b.fit ?? "cover", transform: `scale(${z})`, transformOrigin: `${fx}% ${fy}%` }}
          />
          <Esquinas logo={b.logo} pildora={b.pildora} />
        </div>
      );
      break;
    }
    case "video": {
      const z = interpolate(frame, [0, dur], [1, 1.05], { extrapolateRight: "clamp", easing: theme.ease.inOut });
      const r = b.recorte ?? { x: 0, y: 0, w: 1, h: 1 };
      body = (
        <div style={{ width: 960, height: conPaso ? 480 : 600, borderRadius: theme.card.radius, border: theme.card.border, overflow: "hidden", background: color.negro, position: "relative" }}>
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
          <Esquinas pildora={b.pildora} />
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
      const cuenta = interpolate(frame, [6, 6 + fps * 1.0], [0, b.valor], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: theme.ease.out,
      });
      const golpe = spring({ frame: frame - (6 + fps), fps, config: theme.spring.golpe });
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
            const ti = b.tiempos ? b.tiempos[i] - b.start : 0.35 + i * cada;
            const pi = spring({ frame: frame - Math.round(ti * fps), fps, config: theme.spring.suave });
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
                {b.check === "pendiente" ? <Pendiente p={pi} /> : b.check !== false ? <Check p={pi} size={64} /> : <Pildora style={{ padding: "6px 18px" }}>{i + 1}</Pildora>}
                <span style={{ fontFamily: font.texto, fontWeight: 600, fontSize: 48, color: color.negro }}>
                  <ConIA texto={it} />
                </span>
              </div>
            );
          })}
          {b.pildora ? <Pildora tono="negro" style={{ fontSize: 26, marginTop: 10 }}>{b.pildora}</Pildora> : null}
        </Tarjeta>
      );
      break;
    }
    case "tarjeta":
      body = (
        <Tarjeta style={{ width: 940, padding: "56px 56px" }}>
          {b.pildora ? <Pildora style={{ marginBottom: 24 }}>{b.pildora}</Pildora> : null}
          <Titulo size={72}>
            <ConIA texto={b.titulo} />
          </Titulo>
          {b.texto ? (
            <div style={{ fontFamily: font.texto, fontWeight: 400, fontSize: 36, color: color.gris, marginTop: 18, lineHeight: 1.35 }}>
              <ConIA texto={b.texto} />
            </div>
          ) : null}
        </Tarjeta>
      );
      break;
    case "silueta":
      return null; // se dibuja a pantalla completa en Reel.tsx
    default:
      body = <BRollExtra b={b} />;
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

// Logo oficial (arriba a la izquierda) y píldora (abajo a la derecha) sobre una captura o video
const Esquinas: React.FC<{ logo?: string; pildora?: string }> = ({ logo, pildora }) => (
  <>
    {logo ? (
      <div style={{ position: "absolute", left: 22, bottom: 22, background: color.blanco, border: theme.card.border, borderRadius: 18, padding: "12px 20px" }}>
        <Img src={staticFile(logo)} style={{ height: 44, display: "block" }} />
      </div>
    ) : null}
    {pildora ? (
      <div style={{ position: "absolute", right: 22, bottom: 22 }}>
        <Pildora tono="negro" style={{ fontSize: 28 }}>{pildora}</Pildora>
      </div>
    ) : null}
  </>
);

// Ícono de pendiente: círculo blanco con borde negro y signo de interrogación naranja
const Pendiente: React.FC<{ p: number }> = ({ p }) => (
  <svg width={64} height={64} viewBox="0 0 52 52" style={{ flexShrink: 0, transform: `scale(${p})` }}>
    <circle cx="26" cy="26" r="24" fill={color.blanco} stroke={color.negro} strokeWidth="3" />
    <text x="26" y="36" textAnchor="middle" fontFamily="Poppins, sans-serif" fontWeight={800} fontSize="30" fill={color.naranja}>?</text>
  </svg>
);

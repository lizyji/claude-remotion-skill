import React from "react";
import { Img, OffthreadVideo, interpolate, staticFile, useCurrentFrame, useVideoConfig, spring } from "remotion";
import { theme } from "../theme";
import type { BRoll } from "../reel/types";
import { Check, ConIA, Entra, FuentePie, Pildora, Tarjeta, useEntradaSalida } from "./Base";
import { CorreoCarrito, Diagrama, Pregunta, Regla, TextoGrande } from "./Animaciones";

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
    case "cita": {
      const pe = spring({ frame: frame - Math.round(0.45 * fps), fps, config: theme.spring.golpe });
      body = (
        <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center" }}>
          {b.encima ? (
            <div
              style={{
                fontFamily: font.titulo,
                fontWeight: 700,
                fontSize: 96,
                lineHeight: 1.05,
                color: color.negro,
                textAlign: "center",
                marginBottom: 34,
                opacity: Math.min(1, pe * 1.3),
                transform: `scale(${interpolate(pe, [0, 1], [1.3, 1])})`,
              }}
            >
              {/* "|" = salto de línea; la última palabra va en naranja */}
              {b.encima.split("|").map((linea, li, lineas) => (
                <div key={li}>
                  {linea.trim().split(" ").map((w, i, arr) => (
                    <span key={i} style={{ color: li === lineas.length - 1 && i === arr.length - 1 ? color.naranja : color.negro }}>
                      {w}
                      {i < arr.length - 1 ? " " : ""}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          ) : null}
          <Tarjeta style={{ width: 920 }}>
            {b.medio ? <Pildora tono="negro" style={{ marginBottom: 26 }}>{b.medio}</Pildora> : null}
            <Titulo size={b.encima ? 52 : 64}>“<ConIA texto={b.titular} />”</Titulo>
          </Tarjeta>
        </div>
      );
      break;
    }
    case "pregunta":
      body = <Pregunta items={b.items} cada={b.cada} />;
      break;
    case "correo":
      body = <CorreoCarrito carritoEn={b.carritoEn} />;
      break;
    case "regla":
      body = <Regla n={b.n} titulo={b.titulo} extra={b.extra} />;
      break;
    case "diagrama":
      body = <Diagrama alto={b.alto} aprueba={b.aprueba} />;
      break;
    case "texto":
      body = <TextoGrande lineas={b.lineas} naranja={b.naranja} cada={b.cada} size={b.size} />;
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
            const ti = b.tiempos?.[i] ?? 0.35 + i * cada;
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

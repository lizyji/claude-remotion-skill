// B-rolls animados genéricos (sin marcas ni interfaces reales): chat, sobres, bandeja, hoja,
// diagrama de tablas ligadas, comparativa y botón. Colores planos MNC únicamente.
import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../theme";
import { ConIA, Pildora, Tarjeta } from "./Base";

const { color, font } = theme;

const useT = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return { frame, fps, t: frame / fps };
};
const sp = (frame: number, fps: number, at: number, preset: keyof typeof theme.spring = "suave") =>
  spring({ frame: frame - Math.round(at * fps), fps, config: theme.spring[preset] });

// Ícono de agente: círculo negro con "ojos" blancos y antena naranja (trazo de líneas)
export const IconoAgente: React.FC<{ size?: number }> = ({ size = 120 }) => (
  <svg width={size} height={size} viewBox="0 0 120 120" style={{ flexShrink: 0 }}>
    <line x1="60" y1="8" x2="60" y2="26" stroke={color.negro} strokeWidth="5" strokeLinecap="round" />
    <circle cx="60" cy="8" r="7" fill={color.naranja} stroke={color.negro} strokeWidth="3" />
    <rect x="14" y="26" width="92" height="80" rx="26" fill={color.negro} />
    <circle cx="44" cy="64" r="9" fill={color.blanco} />
    <circle cx="76" cy="64" r="9" fill={color.blanco} />
    <path d="M46 86 Q60 94 74 86" stroke={color.naranja} strokeWidth="5" fill="none" strokeLinecap="round" />
  </svg>
);

const IconoSobre: React.FC<{ size?: number }> = ({ size = 70 }) => (
  <svg width={size} height={size * 0.72} viewBox="0 0 100 72">
    <rect x="3" y="3" width="94" height="66" rx="10" fill={color.blanco} stroke={color.negro} strokeWidth="5" />
    <path d="M6 8 L50 42 L94 8" fill="none" stroke={color.naranja} strokeWidth="5" strokeLinejoin="round" />
  </svg>
);

const IconoEdificio: React.FC<{ size?: number }> = ({ size = 64 }) => (
  <svg width={size} height={size} viewBox="0 0 64 64">
    <rect x="10" y="8" width="44" height="50" rx="5" fill={color.blanco} stroke={color.negro} strokeWidth="4" />
    {[18, 30, 42].map((x) => [18, 30].map((y) => <rect key={`${x}${y}`} x={x - 3} y={y - 3} width="8" height="8" rx="1.5" fill={color.negro} />))}
    <rect x="26" y="42" width="12" height="16" fill={color.naranja} stroke={color.negro} strokeWidth="3" />
  </svg>
);

// ── Chat: el usuario escribe un pedido y el agente responde ─────────────────────────────
export const Chat: React.FC<{ texto: string; respuesta?: string; escribe?: number }> = ({ texto, respuesta, escribe = 1.1 }) => {
  const { frame, fps, t } = useT();
  const t0 = 0.35;
  const n = Math.round(interpolate(t, [t0, t0 + escribe], [0, texto.length], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const enviado = t0 + escribe + 0.25;
  const pEnv = sp(frame, fps, enviado, "golpe");
  const pResp = sp(frame, fps, enviado + 0.5);
  const cursor = Math.floor(frame / 8) % 2 === 0;
  return (
    <Tarjeta style={{ width: 920, padding: 0, overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 18, padding: "22px 32px", borderBottom: theme.card.border }}>
        <IconoAgente size={64} />
        <div style={{ fontFamily: font.titulo, fontWeight: 700, fontSize: 40, color: color.negro }}>
          Agente de <span style={{ color: color.naranja }}>IA</span>
        </div>
      </div>
      <div style={{ height: 300, padding: "26px 32px", display: "flex", flexDirection: "column", gap: 20, background: color.verde }}>
        {t >= enviado ? (
          <div
            style={{
              alignSelf: "flex-end",
              background: color.negro,
              color: color.blanco,
              fontFamily: font.texto,
              fontWeight: 600,
              fontSize: 48,
              padding: "18px 32px",
              borderRadius: 30,
              transform: `scale(${interpolate(pEnv, [0, 1], [0.6, 1])})`,
              transformOrigin: "100% 100%",
            }}
          >
            “{texto}”
          </div>
        ) : null}
        {respuesta && t >= enviado + 0.5 ? (
          <div
            style={{
              alignSelf: "flex-start",
              background: color.blanco,
              border: theme.card.border,
              color: color.negro,
              fontFamily: font.texto,
              fontWeight: 600,
              fontSize: 38,
              padding: "16px 28px",
              borderRadius: 30,
              opacity: pResp,
              transform: `translateY(${interpolate(pResp, [0, 1], [24, 0])}px)`,
            }}
          >
            {respuesta}
            <span style={{ color: color.naranja }}>{".".repeat(1 + (Math.floor(frame / 6) % 3))}</span>
          </div>
        ) : null}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 18, padding: "20px 28px", borderTop: theme.card.border }}>
        <div
          style={{
            flex: 1,
            fontFamily: font.texto,
            fontWeight: 600,
            fontSize: 44,
            color: t >= enviado ? color.gris : color.negro,
            border: theme.card.border,
            borderRadius: 999,
            padding: "14px 28px",
            minHeight: 66,
            boxSizing: "border-box",
          }}
        >
          {t < enviado ? texto.slice(0, n) : ""}
          {t < enviado && cursor ? <span style={{ color: color.naranja }}>|</span> : null}
        </div>
        <div
          style={{
            width: 84,
            height: 84,
            borderRadius: 999,
            background: color.naranja,
            border: theme.card.border,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transform: `scale(${t >= enviado ? 1 + 0.15 * Math.sin(Math.min(1, pEnv) * Math.PI) : 1})`,
          }}
        >
          <svg width="40" height="40" viewBox="0 0 40 40">
            <path d="M6 20 L34 20 M22 8 L34 20 L22 32" stroke={color.blanco} strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </Tarjeta>
  );
};

// ── Sobres que salen del agente hacia N proveedores ────────────────────────────────────
export const Sobres: React.FC<{ destinos: string[]; cada?: number; titulo?: string }> = ({ destinos, cada = 0.35, titulo }) => {
  const { frame, fps } = useT();
  const W = 960;
  const H = 560;
  const ox = 150;
  const oy = H / 2 + (titulo ? 30 : 0);
  const rowH = 118;
  const y0 = oy - ((destinos.length - 1) * rowH) / 2;
  return (
    <div style={{ position: "relative", width: W, height: H }}>
      {titulo ? (
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, textAlign: "center", fontFamily: font.titulo, fontWeight: 700, fontSize: 52, color: color.negro }}>
          <ConIA texto={titulo} />
        </div>
      ) : null}
      <div style={{ position: "absolute", left: ox - 85, top: oy - 85 }}>
        <Tarjeta style={{ padding: 20, borderRadius: 40 }}>
          <IconoAgente size={130} />
        </Tarjeta>
      </div>
      {destinos.map((d, i) => {
        const y = y0 + i * rowH;
        const pd = sp(frame, fps, 0.1 + i * 0.12);
        const vuelo = interpolate(frame, [Math.round((0.45 + i * cada) * fps), Math.round((0.45 + i * cada + 0.55) * fps)], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: theme.ease.inOut,
        });
        const llega = sp(frame, fps, 0.45 + i * cada + 0.55, "golpe");
        const x = interpolate(vuelo, [0, 1], [ox + 40, 520]);
        const yy = interpolate(vuelo, [0, 1], [oy, y]) - Math.sin(vuelo * Math.PI) * 50;
        return (
          <React.Fragment key={i}>
            <svg style={{ position: "absolute", left: 0, top: 0 }} width={W} height={H}>
              <line x1={ox + 95} y1={oy} x2={ox + 95 + (555 - ox - 95) * vuelo} y2={oy + (y - oy) * vuelo} stroke={color.negro} strokeWidth="3" strokeDasharray="10 10" />
            </svg>
            <div
              style={{
                position: "absolute",
                left: 560,
                top: y - 46,
                height: 92,
                width: 390,
                whiteSpace: "nowrap",
                opacity: pd,
                transform: `scale(${interpolate(pd, [0, 1], [0.9, 1]) * (1 + 0.06 * Math.sin(Math.min(1, llega) * Math.PI))})`,
                display: "flex",
                alignItems: "center",
                gap: 16,
                background: llega > 0.5 ? color.blanco : color.blanco,
                border: `3px solid ${llega > 0.5 ? color.naranja : color.negro}`,
                borderRadius: 22,
                padding: "0 20px",
                boxSizing: "border-box",
              }}
            >
              <IconoEdificio size={58} />
              <span style={{ fontFamily: font.texto, fontWeight: 600, fontSize: 36, color: color.negro }}>{d}</span>
            </div>
            {vuelo > 0 && vuelo < 1 ? (
              <div style={{ position: "absolute", left: x - 35, top: yy - 25, transform: `rotate(${(vuelo - 0.5) * 10}deg)` }}>
                <IconoSobre size={70} />
              </div>
            ) : null}
          </React.Fragment>
        );
      })}
    </div>
  );
};

// ── Bandeja de correo llena de "Re: cotización" ───────────────────────────────────────
export const Bandeja: React.FC<{ filas: { de: string; asunto: string; pendiente?: boolean }[]; cada?: number; pendienteEn?: number }> = ({
  filas,
  cada = 0.6,
  pendienteEn,
}) => {
  const { frame, fps, t } = useT();
  return (
    <Tarjeta style={{ width: 940, padding: 0, overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 30px", borderBottom: theme.card.border }}>
        <div style={{ fontFamily: font.titulo, fontWeight: 700, fontSize: 40, color: color.negro }}>Bandeja de entrada</div>
        <Pildora tono="negro" style={{ fontSize: 30, padding: "8px 22px" }}>
          {Math.min(filas.length, Math.max(0, Math.floor((t - 0.2) / cada) + 1)) * 3}
        </Pildora>
      </div>
      {filas.map((f, i) => {
        const p = sp(frame, fps, 0.2 + i * cada);
        const marca = f.pendiente && pendienteEn !== undefined ? sp(frame, fps, pendienteEn, "golpe") : 0;
        return (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 20,
              padding: "14px 30px",
              borderBottom: `2px solid ${color.verde}`,
              opacity: p,
              transform: `translateY(${interpolate(p, [0, 1], [-30, 0])}px)`,
              background: marca > 0.5 ? color.verde : color.blanco,
            }}
          >
            <IconoSobre size={52} />
            <div style={{ fontFamily: font.texto, fontWeight: 600, fontSize: 32, color: color.negro, width: 250 }}>{f.de}</div>
            <div style={{ fontFamily: font.texto, fontWeight: 400, fontSize: 32, color: color.gris, flex: 1 }}>{f.asunto}</div>
            {marca > 0 ? (
              <Pildora style={{ fontSize: 26, padding: "6px 18px", transform: `scale(${marca})` }}>Sin respuesta</Pildora>
            ) : null}
          </div>
        );
      })}
    </Tarjeta>
  );
};

// ── Hoja de cálculo a medio llenar (celdas vacías en naranja) ───────────────────────────
export const Hoja: React.FC<{ columnas: string[]; filas: (string | null)[][]; cada?: number }> = ({ columnas, filas, cada = 0.12 }) => {
  const { frame, fps } = useT();
  const w = 900 / columnas.length;
  let k = 0;
  return (
    <Tarjeta style={{ width: 940, padding: 20 }}>
      <div style={{ display: "flex" }}>
        {columnas.map((c, i) => (
          <div key={i} style={{ width: w, padding: "14px 12px", background: color.negro, color: color.blanco, fontFamily: font.texto, fontWeight: 600, fontSize: 30, border: `2px solid ${color.negro}`, boxSizing: "border-box" }}>
            {c}
          </div>
        ))}
      </div>
      {filas.map((fila, r) => (
        <div key={r} style={{ display: "flex" }}>
          {fila.map((v, c) => {
            const p = sp(frame, fps, 0.25 + k++ * cada, "rapido");
            const vacia = v === null;
            const pulso = vacia ? 0.5 + 0.5 * Math.sin(frame / 5) : 0;
            return (
              <div
                key={c}
                style={{
                  width: w,
                  height: 84,
                  padding: "0 12px",
                  display: "flex",
                  alignItems: "center",
                  border: `2px solid ${color.gris}`,
                  boxSizing: "border-box",
                  background: vacia ? color.naranja : color.blanco,
                  opacity: vacia ? p * (0.55 + 0.45 * pulso) : 1,
                  fontFamily: font.texto,
                  fontWeight: c === 0 ? 600 : 400,
                  fontSize: 32,
                  color: color.negro,
                }}
              >
                <span style={{ opacity: vacia ? 0 : p }}>{v ?? ""}</span>
              </div>
            );
          })}
        </div>
      ))}
    </Tarjeta>
  );
};

// ── Diagrama de dos tablas ligadas (Proveedores ↔ Productos), genérico ──────────────────
export const Diagrama: React.FC<{ izq: { titulo: string; items: string[] }; der: { titulo: string; items: string[] }; ligas: [number, number][]; titulo?: string }> = ({
  izq,
  der,
  ligas,
  titulo,
}) => {
  const { frame, fps } = useT();
  const pI = sp(frame, fps, 0.1);
  const pD = sp(frame, fps, 0.35);
  const rowH = 86;
  const top = 96 + 70; // título + cabecera de tabla
  const caja = (lado: { titulo: string; items: string[] }, p: number, x: number) => (
    <div style={{ position: "absolute", left: x, top: 90, width: 330, opacity: p, transform: `translateY(${interpolate(p, [0, 1], [30, 0])}px)` }}>
      <Tarjeta style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ background: color.negro, color: color.blanco, fontFamily: font.titulo, fontWeight: 700, fontSize: 36, padding: "14px 22px", height: 70, boxSizing: "border-box" }}>{lado.titulo}</div>
        {lado.items.map((it, i) => (
          <div key={i} style={{ height: rowH, display: "flex", alignItems: "center", padding: "0 22px", borderTop: `2px solid ${color.verde}`, fontFamily: font.texto, fontWeight: 600, fontSize: 32, color: color.negro, boxSizing: "border-box" }}>
            {it}
          </div>
        ))}
      </Tarjeta>
    </div>
  );
  return (
    <div style={{ position: "relative", width: 960, height: 520 }}>
      {titulo ? (
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, textAlign: "center", fontFamily: font.titulo, fontWeight: 700, fontSize: 54, color: color.negro }}>
          {titulo.split("↔").map((s, i, arr) => (
            <React.Fragment key={i}>
              {s}
              {i < arr.length - 1 ? <span style={{ color: color.naranja }}>↔</span> : null}
            </React.Fragment>
          ))}
        </div>
      ) : null}
      {caja(izq, pI, 40)}
      {caja(der, pD, 590)}
      <svg style={{ position: "absolute", left: 0, top: 0 }} width={960} height={520}>
        {ligas.map(([a, b], i) => {
          const p = interpolate(frame, [Math.round((0.8 + i * 0.35) * fps), Math.round((1.25 + i * 0.35) * fps)], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: theme.ease.out });
          const y1 = top + a * rowH + rowH / 2 + 3;
          const y2 = top + b * rowH + rowH / 2 + 3;
          const x1 = 370, x2 = 590;
          return (
            <g key={i} opacity={p > 0 ? 1 : 0}>
              <path d={`M${x1} ${y1} C ${x1 + 110} ${y1}, ${x2 - 110} ${y2}, ${x2} ${y2}`} stroke={color.naranja} strokeWidth="6" fill="none" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - p} strokeLinecap="round" />
              <circle cx={x1} cy={y1} r={9 * Math.min(1, p * 3)} fill={color.naranja} stroke={color.negro} strokeWidth="3" />
              <circle cx={x2} cy={y2} r={9 * (p > 0.95 ? 1 : 0)} fill={color.naranja} stroke={color.negro} strokeWidth="3" />
            </g>
          );
        })}
      </svg>
    </div>
  );
};

// ── Comparativa final: filas que entran y resaltan la mejor ─────────────────────────────
export const Comparativa: React.FC<{ columnas: string[]; filas: { celdas: string[]; estado: "ok" | "falta"; mejor?: boolean }[]; cada?: number }> = ({
  columnas,
  filas,
  cada = 0.4,
}) => {
  const { frame, fps } = useT();
  const anchos = [250, 190, 220, 240];
  const resalta = sp(frame, fps, 0.3 + filas.length * cada + 0.2, "golpe");
  return (
    <Tarjeta style={{ width: 940, padding: 20 }}>
      <div style={{ display: "flex" }}>
        {columnas.map((c, i) => (
          <div key={i} style={{ width: anchos[i], padding: "12px 14px", fontFamily: font.texto, fontWeight: 600, fontSize: 28, color: color.blanco, background: color.negro, boxSizing: "border-box", borderRadius: i === 0 ? "14px 0 0 14px" : i === columnas.length - 1 ? "0 14px 14px 0" : 0 }}>
            {c}
          </div>
        ))}
      </div>
      {filas.map((f, r) => {
        const p = sp(frame, fps, 0.3 + r * cada);
        const best = f.mejor ? resalta : 0;
        return (
          <div
            key={r}
            style={{
              display: "flex",
              alignItems: "center",
              height: 92,
              borderBottom: `2px solid ${color.verde}`,
              opacity: p,
              transform: `translateX(${interpolate(p, [0, 1], [40, 0])}px) scale(${1 + 0.03 * Math.sin(Math.min(1, best) * Math.PI)})`,
              outline: best > 0.3 ? `4px solid ${color.naranja}` : "none",
              outlineOffset: -4,
              borderRadius: 14,
            }}
          >
            {f.celdas.map((c, i) => (
              <div key={i} style={{ width: anchos[i], padding: "0 14px", fontFamily: font.texto, fontWeight: i === 0 ? 600 : 400, fontSize: 32, color: f.estado === "falta" && i > 0 ? color.gris : color.negro, boxSizing: "border-box" }}>
                {c}
              </div>
            ))}
            <div style={{ width: anchos[3], padding: "0 10px", boxSizing: "border-box" }}>
              {f.estado === "ok" ? (
                <Pildora tono="negro" style={{ fontSize: 24, padding: "6px 16px" }}>Contestó</Pildora>
              ) : (
                <Pildora style={{ fontSize: 24, padding: "6px 16px" }}>Falta contestar</Pildora>
              )}
            </div>
          </div>
        );
      })}
    </Tarjeta>
  );
};

// ── Botón que se presiona ("Tú decides") ───────────────────────────────────────────────
export const Boton: React.FC<{ texto: string; arriba?: string; clic?: number }> = ({ texto, arriba, clic = 1.0 }) => {
  const { frame, fps, t } = useT();
  const pA = sp(frame, fps, 0.05);
  const pB = sp(frame, fps, 0.3, "golpe");
  const mov = interpolate(t, [0.5, clic], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: theme.ease.out });
  const press = t >= clic && t < clic + 0.18 ? 0.92 : 1;
  const ondas = interpolate(t, [clic, clic + 0.5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: 46 }}>
      {arriba ? (
        <div style={{ fontFamily: font.titulo, fontWeight: 700, fontSize: 60, color: color.negro, opacity: pA, textAlign: "center" }}>
          <ConIA texto={arriba} />
        </div>
      ) : null}
      <div style={{ position: "relative" }}>
        {ondas > 0 && ondas < 1 ? (
          <div style={{ position: "absolute", inset: -30 * ondas, borderRadius: 999, border: `4px solid ${color.naranja}`, opacity: 1 - ondas }} />
        ) : null}
        <div
          style={{
            background: color.naranja,
            color: color.blanco,
            fontFamily: font.titulo,
            fontWeight: 700,
            fontSize: 96,
            padding: "34px 90px",
            borderRadius: 999,
            border: theme.card.border,
            boxShadow: `0 ${t >= clic && t < clic + 0.18 ? 2 : 10}px 0 ${color.negro}`,
            transform: `scale(${interpolate(pB, [0, 1], [0.5, 1]) * press}) translateY(${press < 1 ? 8 : 0}px)`,
            opacity: Math.min(1, pB * 1.5),
          }}
        >
          {texto}
        </div>
        {/* cursor */}
        <svg
          width="80"
          height="80"
          viewBox="0 0 40 40"
          style={{ position: "absolute", left: interpolate(mov, [0, 1], [560, 360]), top: interpolate(mov, [0, 1], [200, 90]), transform: `scale(${press})` }}
        >
          <path d="M8 4 L8 32 L15 25 L20 36 L25 34 L20 23 L30 23 Z" fill={color.blanco} stroke={color.negro} strokeWidth="2.5" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
};

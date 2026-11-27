// Animaciones a la medida (tipo "anim" en reel.json), por id del guion.
// Reel: "Tu Excel se puede volver una app" (excel-a-app).
// Reglas MNC: colores planos de marca, tarjetas blancas con borde negro, píldoras, íconos de línea
// negra con acentos naranja, resorte suave y "golpe de zoom". Logos reales en blanco y negro.
// Nunca se dibuja una interfaz que finja ser de Airtable, Glide, Softr o Claude.
import React from "react";
import { Img, OffthreadVideo, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../theme";
import { Check, Pildora, Tarjeta, useEntradaSalida } from "./Base";

const { color, font, layout, card } = theme;
const R = "reels/excel-a-app";

// ---------- utilidades ----------
const useT = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return { frame, fps, t: frame / fps };
};
// progreso de resorte que arranca en `seg` segundos dentro del clip
const useSp = () => {
  const { frame, fps } = useT();
  return (seg: number, preset: keyof typeof theme.spring = "suave") =>
    spring({ frame: frame - Math.round(seg * fps), fps, config: theme.spring[preset] });
};
const lin = (t: number, a: number, b: number, ease = theme.ease.out) =>
  interpolate(t, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
// "golpe de zoom": 1 → 1+k → 1 cuando p pasa de 0 a 1
const golpe = (p: number, k = 0.12) => 1 + k * Math.sin(Math.min(1, Math.max(0, p)) * Math.PI);

const Entra: React.FC<{ p: number; children: React.ReactNode; y?: number; style?: React.CSSProperties }> = ({ p, children, y = 40, style }) => (
  <div style={{ opacity: Math.min(1, p * 1.4), transform: `translateY(${(1 - p) * y}px) scale(${0.9 + 0.1 * p})`, ...style }}>{children}</div>
);

const Titulo: React.FC<{ children: React.ReactNode; size?: number; style?: React.CSSProperties }> = ({ children, size = 60, style }) => (
  <div style={{ fontFamily: font.titulo, fontWeight: 700, fontSize: size, lineHeight: 1.1, color: color.negro, textAlign: "center", ...style }}>{children}</div>
);
const N: React.FC<{ children: React.ReactNode }> = ({ children }) => <span style={{ color: color.naranja }}>{children}</span>;

const Nota: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{ fontFamily: font.texto, fontWeight: 600, fontSize: 26, color: color.gris, textAlign: "center", ...style }}>{children}</div>
);

// ---------- íconos genéricos (línea negra + acentos naranja) ----------
export const Hoja: React.FC<{ w?: number; filas?: number; acento?: string }> = ({ w = 300, filas = 6, acento = color.naranja }) => {
  const h = w * 0.78;
  const rh = h / (filas + 1);
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <rect x="2" y="2" width={w - 4} height={h - 4} rx="16" fill={color.blanco} stroke={color.negro} strokeWidth="4" />
      <path d={`M2 ${rh + 2} H${w - 2}`} stroke={color.negro} strokeWidth="3" />
      <rect x="4" y="4" width={w - 8} height={rh - 2} rx="12" fill={acento} />
      {Array.from({ length: filas - 1 }, (_, i) => (
        <path key={i} d={`M4 ${rh * (i + 2) + 2} H${w - 4}`} stroke={color.negro} strokeOpacity="0.35" strokeWidth="2" />
      ))}
      {[0.3, 0.6].map((x) => (
        <path key={x} d={`M${w * x} ${rh + 2} V${h - 4}`} stroke={color.negro} strokeOpacity="0.35" strokeWidth="2" />
      ))}
    </svg>
  );
};

export const Telefono: React.FC<{ w?: number; filas?: number; p?: number; acento?: string }> = ({ w = 190, filas = 3, p = 1, acento = color.naranja }) => {
  const h = w * 2;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <rect x="3" y="3" width={w - 6} height={h - 6} rx={w * 0.16} fill={color.negro} />
      <rect x={w * 0.07} y={w * 0.12} width={w * 0.86} height={h - w * 0.24} rx={w * 0.1} fill={color.blanco} />
      <rect x={w * 0.07} y={w * 0.12} width={w * 0.86} height={w * 0.34} rx={w * 0.1} fill={acento} />
      <rect x={w * 0.07} y={w * 0.3} width={w * 0.86} height={w * 0.16} fill={acento} />
      <rect x={w * 0.17} y={w * 0.22} width={w * 0.42} height={w * 0.08} rx={w * 0.04} fill={color.blanco} />
      {Array.from({ length: filas }, (_, i) => {
        const pi = Math.min(1, Math.max(0, p * (filas + 1) - i));
        const y = w * 0.58 + i * w * 0.36;
        return (
          <g key={i} opacity={pi} transform={`translate(0 ${(1 - pi) * 18})`}>
            <rect x={w * 0.15} y={y} width={w * 0.7} height={w * 0.27} rx={w * 0.06} fill={color.blanco} stroke={color.negro} strokeWidth="3" />
            <circle cx={w * 0.27} cy={y + w * 0.135} r={w * 0.055} fill={i === 0 ? acento : color.negro} />
            <rect x={w * 0.37} y={y + w * 0.08} width={w * 0.38} height={w * 0.04} rx="3" fill={color.negro} />
            <rect x={w * 0.37} y={y + w * 0.155} width={w * 0.25} height={w * 0.035} rx="3" fill={color.gris} opacity="0.6" />
          </g>
        );
      })}
    </svg>
  );
};

const Candado: React.FC<{ size?: number; cierre?: number }> = ({ size = 220, cierre = 1 }) => (
  <svg width={size} height={size * 1.15} viewBox="0 0 100 115">
    <path
      d="M28 50 V34 a22 22 0 0 1 44 0 V50"
      fill="none"
      stroke={color.negro}
      strokeWidth="9"
      strokeLinecap="round"
      transform={`translate(${(1 - cierre) * 16} ${-(1 - cierre) * 14})`}
    />
    <rect x="14" y="48" width="72" height="60" rx="14" fill={color.naranja} stroke={color.negro} strokeWidth="5" />
    <circle cx="50" cy="73" r="8" fill={color.negro} />
    <rect x="46.5" y="76" width="7" height="16" rx="3" fill={color.negro} />
  </svg>
);

export const Brujula: React.FC<{ size?: number; giro?: number }> = ({ size = 240, giro = 0 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="45" fill={color.blanco} stroke={color.negro} strokeWidth="5" />
    <circle cx="50" cy="50" r="36" fill="none" stroke={color.naranja} strokeWidth="3" />
    {[0, 90, 180, 270].map((a) => (
      <rect key={a} x="48.5" y="9" width="3" height="9" rx="1.5" fill={color.negro} transform={`rotate(${a} 50 50)`} />
    ))}
    <g transform={`rotate(${giro} 50 50)`}>
      <path d="M50 18 L59 50 L50 50 Z" fill={color.naranja} stroke={color.negro} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M50 18 L41 50 L50 50 Z" fill={color.naranja} stroke={color.negro} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M50 82 L59 50 L41 50 Z" fill={color.negro} stroke={color.negro} strokeWidth="2.5" strokeLinejoin="round" />
    </g>
    <circle cx="50" cy="50" r="5" fill={color.blanco} stroke={color.negro} strokeWidth="3" />
  </svg>
);

const Persona: React.FC<{ size?: number; tono?: string }> = ({ size = 70, tono = color.negro }) => (
  <svg width={size} height={size} viewBox="0 0 40 40">
    <circle cx="20" cy="13" r="8" fill="none" stroke={tono} strokeWidth="3.5" />
    <path d="M5 37 a15 13 0 0 1 30 0" fill="none" stroke={tono} strokeWidth="3.5" strokeLinecap="round" />
  </svg>
);

// ---------- logos reales (sitios oficiales) en blanco y negro ----------
const LOGO_NEGRO: React.CSSProperties = { filter: "brightness(0)" };
export const LogoAirtable: React.FC<{ h?: number }> = ({ h = 70 }) => (
  <div style={{ display: "flex", alignItems: "center", gap: h * 0.18 }}>
    <Img src={staticFile(`${R}/logos/airtable_mark.svg`)} style={{ height: h * 0.95, ...LOGO_NEGRO }} />
    <Img src={staticFile(`${R}/logos/airtable_word.svg`)} style={{ height: h * 0.72, ...LOGO_NEGRO }} />
  </div>
);
export const LogoGlide: React.FC<{ h?: number }> = ({ h = 70 }) => (
  <Img src={staticFile(`${R}/logos/glide.svg`)} style={{ height: h * 0.85, ...LOGO_NEGRO }} />
);
export const LogoSoftr: React.FC<{ h?: number }> = ({ h = 70 }) => (
  <Img src={staticFile(`${R}/logos/softr.svg`)} style={{ height: h * 1.35, ...LOGO_NEGRO }} />
);

// ---------- contenedor del panel ----------
const Panel: React.FC<{ children: React.ReactNode; dur: number; conPaso?: boolean; style?: React.CSSProperties }> = ({ children, dur, conPaso, style }) => {
  const p = useEntradaSalida(dur);
  const { frame } = useT();
  const top = conPaso ? 340 : layout.panelTop;
  return (
    <div
      style={{
        position: "absolute",
        left: 60,
        width: 960,
        top,
        height: layout.panelBottom - top,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        opacity: p,
        transform: `translateY(${(1 - p) * 40}px) scale(${(0.94 + 0.06 * p) * (1 + 0.004 * Math.sin(frame / 22))})`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// ================= B-ROLLS =================

// T1 · B1 — hoja de cálculo genérica que se dobla y se vuelve app de celular
const B1: React.FC = () => {
  const { t } = useT();
  const sp = useSp();
  const dobla = lin(t, 0.75, 1.1, theme.ease.inOut); // la hoja gira y desaparece
  const sale = lin(t, 1.05, 1.45, theme.ease.out); // aparece el teléfono
  const pill = sp(2.15, "golpe");
  return (
    <>
      <div style={{ position: "relative", width: 960, height: 470, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div
          style={{
            position: "absolute",
            opacity: 1 - dobla,
            transform: `perspective(900px) rotateY(${dobla * 85}deg) scale(${sp(0) * (1 - 0.3 * dobla)})`,
          }}
        >
          <Hoja w={420} filas={7} />
          <div style={{ position: "absolute", left: 0, right: 0, bottom: -52, textAlign: "center" }}>
            <Pildora tono="negro" style={{ fontSize: 28, padding: "8px 22px" }}>tu_excel.xlsx</Pildora>
          </div>
        </div>
        <div
          style={{
            position: "absolute",
            opacity: sale,
            transform: `perspective(900px) rotateY(${(1 - sale) * -85}deg) scale(${golpe(sale, 0.06)})`,
          }}
        >
          <Telefono w={210} filas={3} p={lin(t, 1.3, 2.0)} />
        </div>
      </div>
      <div style={{ marginTop: 26, transform: `scale(${pill * golpe(pill, 0.1)})`, opacity: Math.min(1, pill * 2) }}>
        <Pildora style={{ fontSize: 40, padding: "14px 36px" }}>Sin programar</Pildora>
      </div>
    </>
  );
};

// T1 · B2 — cuatro etiquetas sincronizadas con la voz
const B2: React.FC = () => {
  const { t } = useT();
  const sp = useSp();
  const items: [string, number][] = [
    ["Inventarios", 0.22],
    ["Pedidos", 0.88],
    ["Cobranza", 1.42],
    ["Compras", 2.0],
  ];
  const fin = sp(3.25, "golpe");
  return (
    <>
      <Entra p={sp(0)}>
        <Titulo size={50} style={{ marginBottom: 34 }}>
          ¿Lo llevas en <N>Excel</N>?
        </Titulo>
      </Entra>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 26, width: 860 }}>
        {items.map(([txt, s], i) => {
          const p = sp(s, "golpe");
          return (
            <div key={txt} style={{ opacity: Math.min(1, p * 1.5), transform: `scale(${0.6 + 0.4 * Math.min(p, 1.05)})` }}>
              <Tarjeta style={{ padding: "26px 28px", display: "flex", alignItems: "center", gap: 20 }}>
                <Hoja w={74} filas={4} acento={i % 2 ? color.negro : color.naranja} />
                <span style={{ fontFamily: font.titulo, fontWeight: 700, fontSize: 46, color: color.negro }}>{txt}</span>
              </Tarjeta>
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: 30, opacity: Math.min(1, fin * 2), transform: `scale(${golpe(fin)})`, height: 70 }}>
        {t > 3.2 ? <Pildora style={{ fontSize: 36 }}>Esto te va a interesar</Pildora> : null}
      </div>
    </>
  );
};

// T2 · B3 — "Tu sistema" con huecos que llenan hojas sueltas naranjas: candidatos
const B3: React.FC = () => {
  const { t } = useT();
  const sp = useSp();
  const huecos = lin(t, 1.0, 1.4); // "no lo cubre"
  const celdas = [0, 1, 2, 3, 4, 5, 6, 7];
  const vacias: Record<number, number> = { 1: 1.6, 4: 1.95, 6: 2.3 }; // índice → seg en que cae la hoja
  const sello = sp(2.9, "golpe");
  return (
    <>
      <Entra p={sp(0)} style={{ position: "relative" }}>
        <Tarjeta style={{ width: 820, padding: "30px 34px 34px" }}>
          <div style={{ fontFamily: font.titulo, fontWeight: 700, fontSize: 48, color: color.negro, marginBottom: 20 }}>Tu sistema</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
            {celdas.map((i) => {
              const esHueco = i in vacias;
              const cae = esHueco ? sp(vacias[i], "golpe") : 0;
              return (
                <div
                  key={i}
                  style={{
                    height: 116,
                    borderRadius: 16,
                    position: "relative",
                    background: esHueco ? interpolate(huecos, [0, 1], [0, 1]) > 0.5 ? color.verde : color.negro : color.negro,
                    border: esHueco && huecos > 0.5 ? `3px dashed ${color.gris}` : `3px solid ${color.negro}`,
                    boxSizing: "border-box",
                  }}
                >
                  {esHueco ? (
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        opacity: Math.min(1, cae * 2),
                        transform: `translateY(${(1 - Math.min(cae, 1)) * -120}px) rotate(${(1 - Math.min(cae, 1)) * -14}deg)`,
                      }}
                    >
                      <Hoja w={120} filas={4} />
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </Tarjeta>
        <div
          style={{
            position: "absolute",
            right: -10,
            top: -30,
            opacity: Math.min(1, sello * 2),
            transform: `rotate(-8deg) scale(${interpolate(Math.min(sello, 1.1), [0, 1], [1.8, 1])})`,
          }}
        >
          <Pildora style={{ fontSize: 44, padding: "14px 34px", border: card.border }}>Candidatos</Pildora>
        </div>
      </Entra>
      <Nota style={{ marginTop: 22, opacity: lin(t, 1.0, 1.4) }}>Lo que tu sistema grande no cubre</Nota>
    </>
  );
};

// T3 · B6 — subir el Excel (animación genérica, sin interfaz de marca)
const B6: React.FC = () => {
  const { t } = useT();
  const sp = useSp();
  const cae = sp(0.12, "golpe");
  const barra = lin(t, 0.45, 1.15, theme.ease.inOut);
  return (
    <>
      <Entra p={sp(0)}>
        <div
          style={{
            width: 760,
            height: 300,
            borderRadius: card.radius,
            border: `4px dashed ${color.negro}`,
            background: color.blanco,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 30,
            position: "relative",
          }}
        >
          <div style={{ transform: `translateY(${(1 - Math.min(cae, 1)) * -160}px)`, opacity: Math.min(1, cae * 2) }}>
            <Hoja w={170} filas={5} />
          </div>
          <div>
            <div style={{ fontFamily: font.titulo, fontWeight: 700, fontSize: 46, color: color.negro }}>Sube tu Excel</div>
            <div style={{ fontFamily: font.texto, fontWeight: 600, fontSize: 28, color: color.gris, marginTop: 6 }}>inventario_ejemplo.xlsx</div>
            <div style={{ width: 330, height: 22, borderRadius: 11, border: `3px solid ${color.negro}`, marginTop: 18, overflow: "hidden" }}>
              <div style={{ width: `${barra * 100}%`, height: "100%", background: color.naranja }} />
            </div>
          </div>
        </div>
      </Entra>
      <Nota style={{ marginTop: 20 }}>Ejemplo con datos ficticios</Nota>
    </>
  );
};

// T3 · B4 — logos reales de Airtable, Glide y Softr
const B4: React.FC = () => {
  const sp = useSp();
  const logos: [React.ReactNode, number][] = [
    [<LogoAirtable h={64} />, 0.0],
    [<LogoGlide h={64} />, 0.68],
    [<LogoSoftr h={64} />, 0.97],
  ];
  const ok = sp(1.6, "golpe");
  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", gap: 22, alignItems: "center" }}>
        {logos.map(([l, s], i) => {
          const p = sp(s, "golpe");
          return (
            <div key={i} style={{ opacity: Math.min(1, p * 1.5), transform: `translateX(${(1 - Math.min(p, 1)) * 120}px) scale(${0.8 + 0.2 * Math.min(p, 1.05)})` }}>
              <Tarjeta style={{ width: 620, height: 128, padding: "0 40px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                {l}
                <Check p={Math.min(1, ok)} size={60} />
              </Tarjeta>
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: 26, opacity: Math.min(1, ok * 2), transform: `scale(${golpe(ok)})` }}>
        <Pildora tono="negro" style={{ fontSize: 36 }}>Cualquiera funciona</Pildora>
      </div>
    </>
  );
};

// T3 · B5 — "Escoge la que mejor se adapte" con palomita sobre una
const B5: React.FC = () => {
  const { t } = useT();
  const sp = useSp();
  const elige = sp(0.8, "golpe");
  const apaga = lin(t, 0.8, 1.1);
  const logos = [<LogoAirtable h={46} />, <LogoGlide h={46} />, <LogoSoftr h={46} />];
  return (
    <>
      <Entra p={sp(0)}>
        <Titulo size={58} style={{ marginBottom: 40 }}>
          Escoge la que mejor
          <br />
          <N>se adapte</N> a ti
        </Titulo>
      </Entra>
      <div style={{ display: "flex", gap: 22 }}>
        {logos.map((l, i) => {
          const elegido = i === 2;
          const p = sp(0.15 + i * 0.12);
          return (
            <div key={i} style={{ position: "relative", opacity: Math.min(1, p * 1.5) * (elegido ? 1 : 1 - 0.6 * apaga), transform: `scale(${elegido ? golpe(elige, 0.1) * (1 + 0.06 * apaga) : 1 - 0.06 * apaga})` }}>
              <Tarjeta style={{ width: 290, height: 130, padding: 0, display: "flex", alignItems: "center", justifyContent: "center", border: elegido && apaga > 0.5 ? `5px solid ${color.naranja}` : card.border }}>
                {l}
              </Tarjeta>
              {elegido ? (
                <div style={{ position: "absolute", right: -18, top: -24 }}>
                  <Check p={Math.min(1, elige)} size={72} />
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </>
  );
};

// T3 · B7 — video oficial de Softr (prompt → app). Sustituye la grabación de Manuel (plan B).
const VideoOficial: React.FC<{ desde: number; vel: number; recorte?: { x: number; y: number; w: number; h: number }; etiqueta: string; etiquetaDesde: number; dur: number }> = ({
  desde,
  vel,
  recorte = { x: 0, y: 0, w: 1, h: 1 },
  etiqueta,
  etiquetaDesde,
  dur,
}) => {
  const { frame, fps } = useT();
  const sp = useSp();
  const z = interpolate(frame, [0, dur], [1, 1.06], { extrapolateRight: "clamp", easing: theme.ease.inOut });
  const r = recorte;
  const pe = sp(etiquetaDesde, "golpe");
  return (
    <>
      <div style={{ width: 940, height: 420, borderRadius: card.radius, border: card.border, overflow: "hidden", background: color.blanco, position: "relative" }}>
        <div style={{ position: "absolute", inset: 0, transform: `scale(${z})` }}>
          <OffthreadVideo
            src={staticFile(`${R}/softr_ai_oficial.mp4`)}
            muted
            startFrom={Math.round(desde * fps)}
            playbackRate={vel}
            style={{
              position: "absolute",
              width: `${100 / r.w}%`,
              height: `${100 / r.h}%`,
              left: `${(-r.x / r.w) * 100}%`,
              top: `${(-r.y / r.h) * 100}%`,
              objectFit: "cover",
            }}
          />
        </div>
        <div style={{ position: "absolute", left: 18, top: 16 }}>
          <Pildora tono="negro" style={{ fontSize: 24, padding: "6px 18px" }}>Video oficial de Softr</Pildora>
        </div>
      </div>
      <div style={{ marginTop: 20, opacity: Math.min(1, pe * 2), transform: `scale(${golpe(pe, 0.08)})` }}>
        <Pildora style={{ fontSize: 36 }}>{etiqueta}</Pildora>
      </div>
    </>
  );
};

// T4 · B8a — la app llega a tres celulares del equipo
const B8a: React.FC = () => {
  const { t } = useT();
  const sp = useSp();
  const eq = sp(1.6, "golpe");
  return (
    <>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 70, height: 330 }}>
        {[0, 1, 2].map((i) => {
          const p = sp(0.25 + i * 0.3, "golpe");
          return (
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, opacity: Math.min(1, p * 1.5), transform: `translateY(${(1 - Math.min(p, 1)) * 60}px) scale(${0.7 + 0.3 * Math.min(p, 1.05)})` }}>
              <Telefono w={128} filas={3} p={lin(t, 0.4 + i * 0.3, 1.2 + i * 0.3)} />
              <Persona size={64} tono={i === 1 ? color.naranja : color.negro} />
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: 24, opacity: Math.min(1, eq * 2), transform: `scale(${golpe(eq)})` }}>
        <Pildora style={{ fontSize: 38 }}>Compártela con tu equipo</Pildora>
      </div>
    </>
  );
};

// T4 · B8b — el archivo que nadie entiende, tachado
const B8b: React.FC = () => {
  const { t } = useT();
  const sp = useSp();
  const tacha = lin(t, 0.22, 0.5, theme.ease.inOut);
  const tiembla = t > 0.5 && t < 0.8 ? Math.sin(t * 90) * 6 : 0;
  const nadie = sp(1.15, "golpe");
  return (
    <>
      <Entra p={sp(0)}>
        <div style={{ position: "relative", transform: `translateX(${tiembla}px)` }}>
          <Tarjeta style={{ display: "flex", alignItems: "center", gap: 26, padding: "34px 40px", width: 900 }}>
            <Hoja w={120} filas={5} acento={color.gris} />
            <div style={{ fontFamily: font.texto, fontWeight: 800, fontSize: 40, color: color.negro, lineHeight: 1.2 }}>inventario_FINAL_v3_ahorasí.xlsx</div>
          </Tarjeta>
          <svg width="940" height="220" style={{ position: "absolute", left: -20, top: -10 }}>
            <path d="M30 150 L910 60" stroke={color.naranja} strokeWidth="18" strokeLinecap="round" strokeDasharray="900" strokeDashoffset={900 * (1 - tacha)} />
          </svg>
        </div>
      </Entra>
      <div style={{ marginTop: 34, opacity: Math.min(1, nadie * 2), transform: `scale(${golpe(nadie)})` }}>
        <Pildora tono="negro" style={{ fontSize: 38 }}>Se acabó el archivo que nadie entiende</Pildora>
      </div>
    </>
  );
};

// T5 · B9 — "¿Por qué no en Claude directo?"
const B9: React.FC = () => {
  const sp = useSp();
  const a = sp(0.0);
  const b = sp(1.0, "golpe");
  const c = sp(2.1, "golpe");
  return (
    <Tarjeta style={{ width: 900, padding: "56px 50px", textAlign: "center" }}>
      <div style={{ fontFamily: font.titulo, fontWeight: 700, fontSize: 92, lineHeight: 1.1, color: color.negro }}>
        <div style={{ opacity: a, transform: `translateY(${(1 - a) * 30}px)` }}>¿Por qué no</div>
        <div style={{ color: color.naranja, opacity: Math.min(1, b * 2), transform: `scale(${interpolate(Math.min(b, 1.1), [0, 1], [1.5, 1])})` }}>en Claude</div>
        <div style={{ opacity: Math.min(1, c * 2), transform: `scale(${interpolate(Math.min(c, 1.1), [0, 1], [1.4, 1])})` }}>directo?</div>
      </div>
    </Tarjeta>
  );
};

// T5 · B10 — dos caminos: no-code (ahora) y a la medida con Claude (después)
const B10: React.FC = () => {
  const { t } = useT();
  const sp = useSp();
  const izq = sp(0.1, "golpe");
  const der = sp(0.55);
  const flecha = lin(t, 0.8, 1.2);
  const enfasis = sp(1.3, "golpe");
  const Camino: React.FC<{ titulo: React.ReactNode; pill: string; activo: boolean; icono: React.ReactNode }> = ({ titulo, pill, activo, icono }) => (
    <Tarjeta style={{ width: 400, height: 400, padding: "30px 26px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between", border: activo ? `5px solid ${color.naranja}` : card.border, background: activo ? color.blanco : color.verde }}>
      <Pildora tono={activo ? "naranja" : "negro"} style={{ fontSize: 30 }}>{pill}</Pildora>
      {icono}
      <div style={{ fontFamily: font.titulo, fontWeight: 700, fontSize: 40, lineHeight: 1.1, textAlign: "center", color: activo ? color.negro : color.gris }}>{titulo}</div>
    </Tarjeta>
  );
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
      <div style={{ opacity: Math.min(1, izq * 1.5), transform: `scale(${(0.8 + 0.2 * Math.min(izq, 1)) * golpe(enfasis, 0.06)})` }}>
        <Camino
          activo
          pill="Ahora"
          titulo={<>Herramienta<br />no-code</>}
          icono={
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <Candado size={96} />
              <div style={{ width: 220, height: 20, background: color.negro, borderRadius: 6, marginTop: 6 }} />
            </div>
          }
        />
      </div>
      <svg width="90" height="60" style={{ opacity: flecha }}>
        <path d={`M6 30 H${6 + 66 * flecha}`} stroke={color.negro} strokeWidth="7" strokeLinecap="round" />
        <path d="M58 12 L80 30 L58 48" fill="none" stroke={color.negro} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <div style={{ opacity: Math.min(1, der * 1.5), transform: `scale(${0.85 + 0.15 * der})` }}>
        <Camino
          activo={false}
          pill="Después"
          titulo={<>A la medida<br />con Claude</>}
          icono={
            <svg width="130" height="120" viewBox="0 0 130 120">
              <path d="M40 30 L12 60 L40 90 M90 30 L118 60 L90 90 M75 18 L55 102" fill="none" stroke={color.gris} strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          }
        />
      </div>
    </div>
  );
};

// T5 · B11 — "Sabes dónde estás construyendo": bloques sobre una base sólida
const B11: React.FC = () => {
  const sp = useSp();
  const base = sp(0.05, "golpe");
  const bloques: [number, number, number, string][] = [
    // x, y (desde la base), seg, color
    [-170, 0, 0.45, color.negro],
    [0, 0, 0.7, color.naranja],
    [170, 0, 0.95, color.negro],
    [-85, 1, 1.25, color.blanco],
    [85, 1, 1.5, color.naranja],
    [0, 2, 1.8, color.negro],
  ];
  const tit = sp(0.2);
  return (
    <>
      <Entra p={tit}>
        <Titulo size={58} style={{ marginBottom: 30 }}>
          Sabes <N>dónde</N> estás construyendo
        </Titulo>
      </Entra>
      <div style={{ position: "relative", width: 700, height: 330 }}>
        {bloques.map(([x, fila, s, c], i) => {
          const p = sp(s, "golpe");
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: 350 + x - 80,
                bottom: 54 + fila * 84,
                width: 160,
                height: 78,
                borderRadius: 14,
                background: c,
                border: card.border,
                boxSizing: "border-box",
                opacity: Math.min(1, p * 2),
                transform: `translateY(${(1 - Math.min(p, 1)) * -200}px)`,
              }}
            />
          );
        })}
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 50, borderRadius: 12, background: color.negro, transform: `scaleX(${Math.min(base, 1)})` }} />
      </div>
      <Nota style={{ marginTop: 12 }}>Piso firme</Nota>
    </>
  );
};

// T5 · B11b — pagas una suscripción: hay una empresa detrás (sin prometer seguridad)
const B11b: React.FC = () => {
  const sp = useSp();
  const a = sp(0.0);
  const b = sp(2.8, "golpe");
  const c = sp(3.9, "golpe");
  return (
    <>
      <Entra p={a}>
        <Tarjeta style={{ width: 760, display: "flex", alignItems: "center", gap: 34, padding: "36px 44px" }}>
          <svg width="130" height="130" viewBox="0 0 60 60">
            <rect x="10" y="8" width="40" height="46" rx="5" fill={color.blanco} stroke={color.negro} strokeWidth="3.5" />
            {[16, 26, 36].map((y) => (
              <g key={y}>
                <rect x="17" y={y} width="8" height="6" rx="1.5" fill={color.negro} />
                <rect x="35" y={y} width="8" height="6" rx="1.5" fill={y === 26 ? color.naranja : color.negro} />
              </g>
            ))}
            <rect x="26" y="44" width="8" height="10" fill={color.naranja} stroke={color.negro} strokeWidth="2" />
          </svg>
          <div style={{ fontFamily: font.titulo, fontWeight: 700, fontSize: 54, lineHeight: 1.1, color: color.negro }}>
            Hay una empresa <N>detrás</N>
          </div>
        </Tarjeta>
      </Entra>
      <div style={{ marginTop: 34, display: "flex", gap: 20, alignItems: "center" }}>
        <div style={{ opacity: Math.min(1, b * 2), transform: `scale(${golpe(b)})` }}>
          <Pildora tono="negro" style={{ fontSize: 38 }}>Pagas una suscripción</Pildora>
        </div>
        <div style={{ opacity: Math.min(1, c * 2), transform: `scale(${golpe(c)})` }}>
          <Pildora style={{ fontSize: 38 }}>por la herramienta</Pildora>
        </div>
      </div>
    </>
  );
};

// T5 · B12 — "Avanzar sin miedo" con candado genérico
const B12: React.FC = () => {
  const { t } = useT();
  const sp = useSp();
  const cierra = lin(t, 0.1, 0.45, theme.ease.inOut);
  const clic = sp(0.45, "golpe");
  const a = sp(0.55, "golpe");
  const b = sp(1.0, "golpe");
  const valor = sp(2.0, "golpe");
  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 40 }}>
        <div style={{ transform: `scale(${golpe(clic, 0.12)})` }}>
          <Candado size={190} cierre={cierra} />
        </div>
        <div style={{ fontFamily: font.titulo, fontWeight: 700, fontSize: 96, lineHeight: 1.02, color: color.negro }}>
          <div style={{ opacity: Math.min(1, a * 2), transform: `translateX(${(1 - Math.min(a, 1)) * 40}px)` }}>Avanzar</div>
          <div style={{ color: color.naranja, opacity: Math.min(1, b * 2), transform: `scale(${interpolate(Math.min(b, 1.1), [0, 1], [1.4, 1])})`, transformOrigin: "left center" }}>sin miedo</div>
        </div>
      </div>
      <div style={{ marginTop: 40, opacity: Math.min(1, valor * 2), transform: `scale(${golpe(valor)})` }}>
        <Pildora tono="negro" style={{ fontSize: 36 }}>y le sacas mucho valor</Pildora>
      </div>
    </>
  );
};

// T6 · B13 — "Aprendes cómo funciona una base de datos": tablas que se conectan
const B13: React.FC = () => {
  const { t } = useT();
  const sp = useSp();
  const linea = lin(t, 1.4, 2.0, theme.ease.inOut);
  const sin = sp(2.9, "golpe");
  const Tabla: React.FC<{ titulo: string; filas: string[] }> = ({ titulo, filas }) => (
    <div style={{ width: 300, background: color.blanco, border: card.border, borderRadius: 20, overflow: "hidden" }}>
      <div style={{ background: color.negro, color: color.blanco, fontFamily: font.titulo, fontWeight: 700, fontSize: 32, padding: "10px 18px" }}>{titulo}</div>
      {filas.map((f, i) => (
        <div key={i} style={{ fontFamily: font.texto, fontWeight: 600, fontSize: 26, color: color.negro, padding: "8px 18px", borderTop: `2px solid ${color.verde}` }}>
          {f}
        </div>
      ))}
    </div>
  );
  return (
    <>
      <Entra p={sp(0)}>
        <Titulo size={52} style={{ marginBottom: 26 }}>
          Aprendes cómo funciona
          <br />
          una <N>base de datos</N>
        </Titulo>
      </Entra>
      <div style={{ position: "relative", display: "flex", gap: 160, alignItems: "center" }}>
        <Entra p={sp(0.3, "golpe")}>
          <Tabla titulo="Productos" filas={["Tornillo M6", "Caja chica", "Cinta 5 cm"]} />
        </Entra>
        <Entra p={sp(0.6, "golpe")}>
          <Tabla titulo="Pedidos" filas={["#1024 · 30 pzas", "#1025 · 12 pzas", "#1026 · 8 pzas"]} />
        </Entra>
        <svg width="170" height="160" style={{ position: "absolute", left: 300, top: 40 }}>
          <path d="M0 60 C 70 60, 100 100, 170 100" fill="none" stroke={color.naranja} strokeWidth="7" strokeDasharray="220" strokeDashoffset={220 * (1 - linea)} strokeLinecap="round" />
          <circle cx="0" cy="60" r="10" fill={color.naranja} opacity={linea > 0 ? 1 : 0} />
          <circle cx="170" cy="100" r="10" fill={color.naranja} opacity={linea > 0.95 ? 1 : 0} />
        </svg>
      </div>
      <div style={{ marginTop: 22, display: "flex", gap: 18, alignItems: "center", height: 64 }}>
        <div style={{ opacity: Math.min(1, sin * 2), transform: `scale(${golpe(sin)})` }}>
          <Pildora style={{ fontSize: 34 }}>Sin tecnicismos</Pildora>
        </div>
        <Nota style={{ fontSize: 22 }}>Ejemplo con datos ficticios</Nota>
      </div>
    </>
  );
};

// T6 · B13b — cuando tu idea esté validada → más conocimiento
const B13b: React.FC = () => {
  const { t } = useT();
  const sp = useSp();
  const val = sp(0.95, "golpe");
  const barra = lin(t, 1.9, 2.6, theme.ease.inOut);
  return (
    <>
      <Entra p={sp(0)}>
        <Tarjeta style={{ width: 820, display: "flex", alignItems: "center", gap: 30, padding: "34px 44px" }}>
          <svg width="110" height="110" viewBox="0 0 50 50">
            <path d="M25 6 a13 13 0 0 1 8 23 v5 h-16 v-5 a13 13 0 0 1 8 -23z" fill={color.blanco} stroke={color.negro} strokeWidth="3" strokeLinejoin="round" />
            <rect x="18" y="37" width="14" height="4" rx="2" fill={color.negro} />
            <rect x="20" y="43" width="10" height="3" rx="1.5" fill={color.negro} />
            <path d="M21 18 l4 4 l4 -4" fill="none" stroke={color.naranja} strokeWidth="3" strokeLinecap="round" />
          </svg>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: font.titulo, fontWeight: 700, fontSize: 52, color: color.negro }}>Tu idea</div>
            <div style={{ opacity: Math.min(1, val * 2), transform: `scale(${golpe(val)})`, transformOrigin: "left center", marginTop: 8 }}>
              <Pildora style={{ fontSize: 36 }}>Validada ✓</Pildora>
            </div>
          </div>
        </Tarjeta>
      </Entra>
      <div style={{ width: 820, marginTop: 34, opacity: lin(t, 1.8, 2.0) }}>
        <div style={{ fontFamily: font.titulo, fontWeight: 700, fontSize: 40, color: color.negro, marginBottom: 10 }}>
          + <N>conocimiento</N>
        </div>
        <div style={{ height: 34, borderRadius: 17, border: card.border, background: color.blanco, overflow: "hidden" }}>
          <div style={{ width: `${20 + 80 * barra}%`, height: "100%", background: color.naranja }} />
        </div>
      </div>
    </>
  );
};

// T6 · B14 — escalera: Excel → App no-code → A la medida con Claude
const B14: React.FC = () => {
  const { t } = useT();
  const sp = useSp();
  const pasos: [string, number, number][] = [
    ["Excel", 0.1, 0],
    ["App no-code", 0.5, 1],
    ["A la medida con Claude", 2.6, 2],
  ];
  // la bolita naranja sube escalón por escalón
  const nivel = t < 0.5 ? 0 : t < 2.6 ? interpolate(t, [0.5, 0.8], [0, 1], { extrapolateRight: "clamp" }) : 1 + lin(t, 2.6, 2.95);
  const W = 290;
  const H = 120;
  const caras = sp(0.7, "golpe");
  return (
    <>
      <div style={{ position: "relative", width: 900, height: 470 }}>
        {pasos.map(([txt, s, i]) => {
          const p = sp(s, "golpe");
          return (
            <div
              key={txt}
              style={{
                position: "absolute",
                left: i * (W + 15),
                bottom: 0,
                width: W,
                height: H * (i + 1),
                background: i === 2 ? color.naranja : color.blanco,
                border: card.border,
                borderRadius: 18,
                boxSizing: "border-box",
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "center",
                padding: "18px 14px",
                opacity: Math.min(1, p * 2),
                transform: `translateY(${(1 - Math.min(p, 1)) * 80}px)`,
              }}
            >
              <span style={{ fontFamily: font.titulo, fontWeight: 700, fontSize: i === 2 ? 34 : 38, lineHeight: 1.1, textAlign: "center", color: i === 2 ? color.blanco : color.negro }}>{txt}</span>
            </div>
          );
        })}
        <div
          style={{
            position: "absolute",
            width: 54,
            height: 54,
            borderRadius: 27,
            background: color.negro,
            border: `5px solid ${color.naranja}`,
            left: W / 2 - 27 + nivel * (W + 15),
            bottom: H * (nivel + 1) + 8 + Math.abs(Math.sin(nivel * Math.PI)) * 40,
            opacity: lin(t, 0.1, 0.3),
          }}
        />
        <div style={{ position: "absolute", left: W + 15, top: 30, width: 2 * W, textAlign: "center", opacity: Math.min(1, caras * 2) * (1 - lin(t, 2.5, 2.7)) }}>
          <Pildora tono="negro" style={{ fontSize: 30 }}>Cuando la suscripción salga cara</Pildora>
        </div>
      </div>
    </>
  );
};

// T6 · B15 — "Un cliente, sin ser técnico, hizo su propio ERP"
const B15: React.FC = () => {
  const sp = useSp();
  const a = sp(0.05);
  const b = sp(1.6, "golpe");
  const c = sp(2.4, "golpe");
  const erp = sp(3.15, "golpe");
  return (
    <Tarjeta style={{ width: 900, padding: "44px 48px", textAlign: "center" }}>
      <div style={{ opacity: a }}>
        <Pildora tono="negro" style={{ marginBottom: 24 }}>Caso real</Pildora>
      </div>
      <div style={{ fontFamily: font.titulo, fontWeight: 700, fontSize: 64, lineHeight: 1.15, color: color.negro }}>
        <div style={{ opacity: a, transform: `translateY(${(1 - a) * 24}px)` }}>Un cliente,</div>
        <div style={{ opacity: Math.min(1, b * 2), transform: `scale(${golpe(b, 0.08)})` }}>sin ser técnico,</div>
        <div style={{ opacity: Math.min(1, c * 2) }}>
          hizo su propio{" "}
          <span style={{ display: "inline-block", color: color.naranja, fontSize: 96, transform: `scale(${erp > 0.01 ? interpolate(Math.min(erp, 1.1), [0, 1], [1.8, 1]) : 0})` }}>ERP</span>
        </div>
      </div>
    </Tarjeta>
  );
};

// T7 · B16 — "Comenta BRÚJULA" gigante con brújula naranja
const B16: React.FC = () => {
  const { t } = useT();
  const sp = useSp();
  const g = sp(0.6, "golpe");
  const giro = interpolate(t, [0, 1.2], [-220, 0], { extrapolateRight: "clamp", easing: theme.ease.out }) + Math.sin(t * 3) * 4;
  return (
    <>
      <Entra p={sp(0, "golpe")}>
        <Brujula size={230} giro={giro} />
      </Entra>
      <div style={{ fontFamily: font.titulo, fontWeight: 700, fontSize: 78, color: color.negro, marginTop: 18, opacity: sp(0.3) }}>Comenta</div>
      <div style={{ fontFamily: font.titulo, fontWeight: 700, fontSize: 150, lineHeight: 1, color: color.naranja, opacity: Math.min(1, g * 2), transform: `scale(${interpolate(Math.min(g, 1.1), [0, 1], [1.6, 1])})` }}>BRÚJULA</div>
    </>
  );
};

// T7 · B17 — "Clases gratis cada semana"
const B17: React.FC = () => {
  const sp = useSp();
  const g = sp(0.5, "golpe");
  return (
    <>
      <Entra p={sp(0)}>
        <Tarjeta style={{ width: 700, padding: "30px 40px", display: "flex", gap: 18, justifyContent: "center" }}>
          {["L", "M", "M", "J", "V"].map((d, i) => {
            const p = sp(0.2 + i * 0.12, "golpe");
            const on = i === 2;
            return (
              <div key={i} style={{ width: 96, height: 110, borderRadius: 16, border: card.border, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, background: on ? color.naranja : color.blanco, transform: `scale(${on ? golpe(p, 0.15) : 1})` }}>
                <span style={{ fontFamily: font.titulo, fontWeight: 700, fontSize: 36, color: on ? color.blanco : color.negro }}>{d}</span>
                {on ? <span style={{ fontFamily: font.texto, fontWeight: 800, fontSize: 18, color: color.blanco }}>CLASE</span> : null}
              </div>
            );
          })}
        </Tarjeta>
      </Entra>
      <div style={{ marginTop: 30, fontFamily: font.titulo, fontWeight: 700, fontSize: 70, lineHeight: 1.1, textAlign: "center", color: color.negro, opacity: Math.min(1, g * 2), transform: `scale(${golpe(g, 0.08)})` }}>
        Clases <N>gratis</N>
        <br />
        cada semana
      </div>
    </>
  );
};

const ESCALA: Record<string, number> = { B2: 1.15, B6: 1.15, B4: 0.92, B3: 1.05 };

export const AnimView: React.FC<{ id: string; dur: number; conPaso?: boolean }> = ({ id, dur, conPaso }) => {
  const body: Record<string, React.ReactNode> = {
    B1: <B1 />,
    B2: <B2 />,
    B3: <B3 />,
    B4: <B4 />,
    B5: <B5 />,
    B6: <B6 />,
    B7a: <VideoOficial desde={0} vel={0.65} recorte={{ x: 0, y: 0.02, w: 0.6, h: 0.9 }} etiqueta="Le describes qué sistema quieres" etiquetaDesde={0.4} dur={dur} />,
    B7b: <VideoOficial desde={8.5} vel={3.3} etiqueta="Y la app se arma" etiquetaDesde={2.6} dur={dur} />,
    B8a: <B8a />,
    B8b: <B8b />,
    B9: <B9 />,
    B10: <B10 />,
    B11: <B11 />,
    B11b: <B11b />,
    B12: <B12 />,
    B13: <B13 />,
    B13b: <B13b />,
    B14: <B14 />,
    B15: <B15 />,
    B16: <B16 />,
    B17: <B17 />,
  };
  return (
    <Panel dur={dur} conPaso={conPaso}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", transform: `scale(${ESCALA[id] ?? 1})` }}>{body[id] ?? <Titulo>[{id}]</Titulo>}</div>
    </Panel>
  );
};

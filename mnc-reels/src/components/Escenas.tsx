// Escenas animadas a medida (B-roll tipo "escena"). Todas en colores planos MNC,
// tarjetas blancas con borde negro, píldoras negras/naranjas, íconos de líneas negras con
// acentos naranja. Los tiempos `at` de las props son segundos ABSOLUTOS del reel.
import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../theme";
import type { BRoll } from "../reel/types";
import { Check, ConIA, Pildora, Tarjeta, useEntradaSalida } from "./Base";

const { color, font, layout } = theme;
const LINEA = 6; // grosor de trazo de los íconos

type EscenaB = Extract<BRoll, { tipo: "escena" }>;
type Ctx = { t: number; en: (at: number, preset?: keyof typeof theme.spring) => number; lin: (a: number, b: number) => number };

const useCtx = (start: number): Ctx => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = start + frame / fps;
  return {
    t,
    en: (at, preset = "suave") => spring({ frame: frame - Math.round((at - start) * fps), fps, config: theme.spring[preset] }),
    lin: (a, b) => interpolate(t, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: theme.ease.out }),
  };
};

// Entrada estándar de un elemento (opacidad + subida + escala)
const aparece = (p: number, dy = 34, s0 = 0.9): React.CSSProperties => ({
  opacity: Math.min(1, p * 1.3),
  transform: `translateY(${interpolate(p, [0, 1], [dy, 0])}px) scale(${interpolate(p, [0, 1], [s0, 1])})`,
});
// Golpe de zoom: arranca grande y asienta con rebote
const golpe = (p: number, s0 = 1.5): React.CSSProperties => ({
  opacity: Math.min(1, p * 2),
  transform: `scale(${interpolate(p, [0, 1], [s0, 1])})`,
});

const Titulo: React.FC<{ children: React.ReactNode; size?: number; style?: React.CSSProperties }> = ({ children, size = 64, style }) => (
  <div style={{ fontFamily: font.titulo, fontWeight: 700, fontSize: size, lineHeight: 1.1, color: color.negro, ...style }}>{children}</div>
);
const Texto: React.FC<{ children: React.ReactNode; size?: number; style?: React.CSSProperties }> = ({ children, size = 42, style }) => (
  <div style={{ fontFamily: font.texto, fontWeight: 600, fontSize: size, lineHeight: 1.2, color: color.negro, ...style }}>{children}</div>
);

// Contenedor absoluto dentro del panel (x 60–1020, y 200–820). conPaso libera la esquina del número.
const Caja: React.FC<{ children: React.ReactNode; top?: number; bottom?: number; style?: React.CSSProperties }> = ({ children, top = layout.panelTop, bottom = layout.panelBottom, style }) => (
  <div style={{ position: "absolute", left: 60, width: 960, top, height: bottom - top, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", ...style }}>
    {children}
  </div>
);

// Encabezado de paso a la derecha del cuadro naranja del número
const EncabezadoPaso: React.FC<{ texto: string; p: number }> = ({ texto, p }) => (
  <div style={{ position: "absolute", left: 196, right: 60, top: 222, height: 96, display: "flex", alignItems: "center", ...aparece(p, 0, 0.94) }}>
    <Titulo size={50} style={{ lineHeight: 1.05 }}>
      <ConIA texto={texto} />
    </Titulo>
  </div>
);

// ───────────────────────── Íconos (líneas negras + acentos naranja) ─────────────────────────
const Svg: React.FC<{ w: number; h: number; vb: string; children: React.ReactNode; style?: React.CSSProperties }> = ({ w, h, vb, children, style }) => (
  <svg width={w} height={h} viewBox={vb} fill="none" stroke={color.negro} strokeWidth={LINEA} strokeLinejoin="round" strokeLinecap="round" style={style}>
    {children}
  </svg>
);

// Fábrica genérica. digital (0–1): pantalla naranja con señal en la ventana
const Fabrica: React.FC<{ size?: number; digital?: number; humo?: number }> = ({ size = 220, digital = 0, humo = 0 }) => (
  <Svg w={size} h={size} vb="0 0 200 200">
    <path d="M20 180 V95 L65 120 V95 L110 120 V95 L155 120 V40 H180 V180 Z" fill={color.blanco} />
    <rect x="155" y="40" width="25" height="18" fill={color.naranja} />
    <rect x="40" y="140" width="28" height="24" fill={digital > 0.5 ? color.naranja : color.blanco} />
    <rect x="86" y="140" width="28" height="24" fill={digital > 0.5 ? color.naranja : color.blanco} />
    <rect x="128" y="140" width="28" height="24" fill={color.blanco} />
    {humo > 0 ? <circle cx={168 + 6 * humo} cy={28 - 14 * humo} r={8 + 6 * humo} fill={color.blanco} opacity={1 - humo * 0.7} /> : null}
    {digital > 0 ? (
      <g opacity={digital} stroke={color.naranja}>
        <path d="M118 18 a26 26 0 0 1 36 0" />
        <path d="M126 28 a14 14 0 0 1 20 0" />
        <circle cx="136" cy="38" r="3" fill={color.naranja} />
      </g>
    ) : null}
  </Svg>
);

const Calculadora: React.FC<{ size?: number }> = ({ size = 200 }) => (
  <Svg w={size} h={size} vb="0 0 200 200">
    <rect x="40" y="14" width="120" height="172" rx="16" fill={color.blanco} />
    <rect x="58" y="32" width="84" height="38" rx="6" fill={color.naranja} />
    {[0, 1, 2].map((r) => [0, 1, 2].map((c) => <rect key={`${r}${c}`} x={58 + c * 30} y={86 + r * 30} width="20" height="18" rx="4" fill={r === 2 && c === 2 ? color.naranja : color.blanco} strokeWidth={4} />))}
  </Svg>
);

const Libro: React.FC<{ size?: number }> = ({ size = 200 }) => (
  <Svg w={size} h={size} vb="0 0 200 200">
    <rect x="30" y="20" width="140" height="165" rx="10" fill={color.blanco} />
    <path d="M58 20 V185" />
    <path d="M78 60 H150 M78 90 H150 M78 120 H150 M78 150 H128" strokeWidth={4} />
    <path d="M130 140 l10 10 l18 -22" stroke={color.naranja} />
  </Svg>
);

const Tienda: React.FC<{ size?: number }> = ({ size = 120 }) => (
  <Svg w={size} h={size} vb="0 0 200 200">
    <path d="M30 85 V180 H170 V85" fill={color.blanco} />
    <path d="M20 85 L40 30 H160 L180 85 Z" fill={color.naranja} />
    <rect x="80" y="120" width="40" height="60" fill={color.blanco} />
  </Svg>
);
const Camion: React.FC<{ size?: number }> = ({ size = 120 }) => (
  <Svg w={size} h={size} vb="0 0 200 200">
    <rect x="15" y="60" width="110" height="80" fill={color.blanco} />
    <path d="M125 85 H160 L185 112 V140 H125 Z" fill={color.naranja} />
    <circle cx="55" cy="150" r="16" fill={color.blanco} />
    <circle cx="150" cy="150" r="16" fill={color.blanco} />
  </Svg>
);
const Oficina: React.FC<{ size?: number }> = ({ size = 120 }) => (
  <Svg w={size} h={size} vb="0 0 200 200">
    <rect x="50" y="20" width="100" height="165" fill={color.blanco} />
    {[0, 1, 2, 3].map((r) => [0, 1].map((c) => <rect key={`${r}${c}`} x={68 + c * 40} y={40 + r * 32} width="24" height="18" fill={r === 1 && c === 0 ? color.naranja : color.blanco} strokeWidth={4} />))}
    <rect x="88" y="160" width="24" height="25" fill={color.negro} />
  </Svg>
);

const Guardar: React.FC<{ size?: number; lleno?: number }> = ({ size = 120, lleno = 0 }) => (
  <Svg w={size} h={size} vb="0 0 100 100">
    <path d="M25 12 H75 V88 L50 68 L25 88 Z" fill={lleno > 0.5 ? color.naranja : color.blanco} />
  </Svg>
);
const Comentario: React.FC<{ size?: number }> = ({ size = 90 }) => (
  <Svg w={size} h={size} vb="0 0 100 100">
    <path d="M50 14 C74 14 90 28 90 47 C90 66 74 80 50 80 C44 80 38 79 33 77 L14 86 L20 70 C13 64 10 56 10 47 C10 28 26 14 50 14 Z" fill={color.blanco} />
    <circle cx="33" cy="47" r="4" fill={color.naranja} stroke="none" />
    <circle cx="50" cy="47" r="4" fill={color.naranja} stroke="none" />
    <circle cx="67" cy="47" r="4" fill={color.naranja} stroke="none" />
  </Svg>
);

// Flecha con trazo que se dibuja (p 0–1)
const Flecha: React.FC<{ x1: number; y1: number; x2: number; y2: number; p: number; colorTrazo?: string }> = ({ x1, y1, x2, y2, p, colorTrazo = color.negro }) => {
  const len = Math.hypot(x2 - x1, y2 - y1);
  const ang = Math.atan2(y2 - y1, x2 - x1);
  const hx = x1 + (x2 - x1) * p;
  const hy = y1 + (y2 - y1) * p;
  const a1 = ang + Math.PI * 0.82;
  const a2 = ang - Math.PI * 0.82;
  return (
    <g stroke={colorTrazo} strokeWidth={LINEA} strokeLinecap="round" fill="none" opacity={p > 0.01 ? 1 : 0}>
      <line x1={x1} y1={y1} x2={x1 + (x2 - x1) * p} y2={y1 + (y2 - y1) * p} strokeDasharray={len} />
      {p > 0.6 ? <path d={`M${hx + 22 * Math.cos(a1)} ${hy + 22 * Math.sin(a1)} L${hx} ${hy} L${hx + 22 * Math.cos(a2)} ${hy + 22 * Math.sin(a2)}`} /> : null}
    </g>
  );
};

// Línea que tacha un elemento (se dibuja de izquierda a derecha)
const Tache: React.FC<{ p: number; grosor?: number; tono?: string }> = ({ p, grosor = 9, tono = color.naranja }) => (
  <div style={{ position: "absolute", left: -12, top: "50%", height: grosor, width: `calc(${p * 100}% + ${24 * p}px)`, background: tono, borderRadius: grosor, transform: "translateY(-50%) rotate(-3deg)", transformOrigin: "left center" }} />
);

// ───────────────────────── Escenas ─────────────────────────

// B1 · texto que se escribe solo
const Escribe: React.FC<{ s: number; texto: string; desde: number; hasta: number; size?: number }> = ({ s, texto, desde, hasta, size = 104 }) => {
  const c = useCtx(s);
  const frame = useCurrentFrame();
  const n = Math.round(interpolate(c.t, [desde, hasta], [0, texto.length], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const visible = texto.slice(0, n);
  const cursor = Math.floor(frame / 8) % 2 === 0 || n < texto.length;
  const p = c.en(s);
  return (
    <Caja>
      <Tarjeta style={{ width: 960, minHeight: 470, display: "flex", alignItems: "center", justifyContent: "center", ...aparece(p) }}>
        <Titulo size={size} style={{ textAlign: "center", lineHeight: 1.12 }}>
          <ConIA texto={visible} />
          <span style={{ color: color.naranja, opacity: cursor ? 1 : 0 }}>|</span>
          {/* reserva el espacio final para que el texto no brinque al escribirse */}
          <span style={{ opacity: 0 }}>{texto.slice(n)}</span>
        </Titulo>
      </Tarjeta>
    </Caja>
  );
};

// B3 · tarjetas numeradas que entran una por una
const Tarjetas: React.FC<{ s: number; titulo?: string; items: { texto: string; at: number }[] }> = ({ s, titulo, items }) => {
  const c = useCtx(s);
  return (
    <Caja style={{ justifyContent: "flex-start", paddingTop: 36 }}>
      {titulo ? (
        <Titulo size={54} style={{ textAlign: "center", marginBottom: 34, ...aparece(c.en(s)) }}>
          <ConIA texto={titulo} />
        </Titulo>
      ) : null}
      <div style={{ display: "flex", flexDirection: "column", gap: 24, width: 900 }}>
        {items.map((it, i) => {
          const p = c.en(it.at, "golpe");
          return (
            <div key={i} style={{ ...aparece(p, 0, 0.7) }}>
              <Tarjeta style={{ padding: "22px 30px", display: "flex", alignItems: "center", gap: 28 }}>
                <div style={{ width: 84, height: 84, borderRadius: 20, background: color.naranja, border: theme.card.border, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: font.titulo, fontWeight: 700, fontSize: 54, color: color.blanco, flexShrink: 0 }}>
                  {i + 1}
                </div>
                <Titulo size={54}>{it.texto}</Titulo>
              </Tarjeta>
            </div>
          );
        })}
      </div>
    </Caja>
  );
};

// Calendario que pasa hojas: muestra años que van subiendo
const Calendario: React.FC<{ s: number; desde: number; hasta: number; anios: number }> = ({ s, desde, hasta, anios }) => {
  const c = useCtx(s);
  const k = interpolate(c.t, [desde, hasta], [1, anios], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: theme.ease.out });
  const n = Math.floor(k);
  const hoja = k - n; // giro de la hoja que se va
  return (
    <div style={{ position: "relative", width: 250, height: 260 }}>
      <div style={{ position: "absolute", inset: 0, top: 20, background: color.blanco, border: theme.card.border, borderRadius: 24, overflow: "hidden" }}>
        <div style={{ height: 64, background: color.naranja, borderBottom: theme.card.border }} />
        <div style={{ textAlign: "center", fontFamily: font.titulo, fontWeight: 700, fontSize: 92, color: color.negro, lineHeight: "120px" }}>{n}</div>
        <div style={{ textAlign: "center", fontFamily: font.texto, fontWeight: 600, fontSize: 30, color: color.gris, marginTop: -16 }}>{n === 1 ? "año" : "años"}</div>
      </div>
      {/* hoja que se arranca */}
      {n < anios ? (
        <div style={{ position: "absolute", left: 0, right: 0, top: 84, height: 196, background: color.blanco, border: theme.card.border, borderTop: "none", borderRadius: "0 0 24px 24px", transformOrigin: "50% 0%", transform: `rotateX(${hoja * 100}deg)`, opacity: 1 - hoja, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: font.titulo, fontWeight: 700, fontSize: 92 }}>
          {n}
        </div>
      ) : null}
      {[60, 190].map((x) => (
        <div key={x} style={{ position: "absolute", left: x - 8, top: 0, width: 16, height: 46, borderRadius: 8, background: color.negro }} />
      ))}
    </div>
  );
};

// B4/B5 · título + etiqueta (píldora) con golpe de zoom (+ calendario opcional)
const Etiqueta: React.FC<{ s: number; titulo: string; pildora: string; at: number; tono?: "negro" | "naranja"; calendario?: { desde: number; hasta: number; anios: number } }> = ({ s, titulo, pildora, at, tono = "negro", calendario }) => {
  const c = useCtx(s);
  const pT = c.en(s);
  const pP = c.en(at, "golpe");
  return (
    <Caja>
      <div style={{ display: "flex", alignItems: "center", gap: 46 }}>
        {calendario ? <div style={aparece(c.en(calendario.desde))}><Calendario s={s} {...calendario} /></div> : null}
        <div style={{ display: "flex", flexDirection: "column", alignItems: calendario ? "flex-start" : "center", gap: 34 }}>
          <Tarjeta style={{ padding: "34px 50px", ...aparece(pT) }}>
            <Titulo size={calendario ? 76 : 104}>{titulo}</Titulo>
          </Tarjeta>
          <div style={golpe(pP)}>
            <Pildora tono={tono} style={{ fontSize: calendario ? 42 : 48, padding: "16px 36px" }}>{pildora}</Pildora>
          </div>
        </div>
      </div>
    </Caja>
  );
};

// B6 · documento en blanco que se llena
const Documento: React.FC<{ s: number; encabezado: string; titulo: { texto: string; at: number }; items: { texto: string; at: number }[] }> = ({ s, encabezado, titulo, items }) => {
  const c = useCtx(s);
  const frame = useCurrentFrame();
  const pDoc = c.en(s + 0.15);
  const ultimo = [titulo, ...items].filter((x) => c.t >= x.at).length;
  return (
    <>
      <EncabezadoPaso texto={encabezado} p={c.en(s)} />
      <Caja top={344} bottom={820}>
        <div style={{ position: "relative", width: 700, height: 466, ...aparece(pDoc) }}>
          <div style={{ position: "absolute", inset: 0, background: color.blanco, border: theme.card.border, borderRadius: 22, clipPath: "polygon(0 0, calc(100% - 70px) 0, 100% 70px, 100% 100%, 0 100%)" }} />
          <svg width="74" height="74" style={{ position: "absolute", right: -2, top: -2 }}>
            <path d="M3 3 L71 71 L3 71 Z" fill={color.verde} stroke={color.negro} strokeWidth={3} strokeLinejoin="round" />
          </svg>
          <div style={{ position: "absolute", left: 50, top: 34, right: 90 }}>
            {(() => {
              const p = c.lin(titulo.at, titulo.at + 0.35);
              return (
                <Titulo size={52} style={{ marginBottom: 14, opacity: p > 0 ? 1 : 0 }}>
                  {titulo.texto.slice(0, Math.round(titulo.texto.length * p))}
                </Titulo>
              );
            })()}
            {items.map((it, i) => {
              const p = c.en(it.at);
              return (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 18, margin: "14px 0", ...aparece(p, 0, 0.85), transform: `translateX(${interpolate(p, [0, 1], [30, 0])}px)` }}>
                  <div style={{ width: 18, height: 18, borderRadius: 9, background: color.naranja, flexShrink: 0 }} />
                  <Texto size={40}>{it.texto}</Texto>
                </div>
              );
            })}
            {ultimo === 0 ? (
              <div style={{ width: 6, height: 52, background: color.naranja, opacity: Math.floor(frame / 9) % 2 ? 0 : 1 }} />
            ) : null}
          </div>
        </div>
      </Caja>
    </>
  );
};

// Tarjetita de oportunidad (B7/B8). estado: 0 normal, "x" tachada, "ok" elegida
const Oportunidad: React.FC<{ n: number; p: number; tache?: number; ok?: number }> = ({ n, p, tache = 0, ok = 0 }) => (
  <div style={{ position: "relative", ...golpe(p, 0.6) }}>
    <Tarjeta
      fondo={ok > 0.5 ? color.naranja : color.blanco}
      style={{ width: 270, height: 176, padding: "16px 10px", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", opacity: 1 - 0.55 * tache, transform: `scale(${1 + 0.1 * Math.sin(Math.min(1, ok) * Math.PI)})` }}
    >
      <Texto size={28} style={{ color: ok > 0.5 ? color.blanco : color.gris }}>Oportunidad</Texto>
      <Titulo size={78} style={{ color: ok > 0.5 ? color.blanco : color.negro, lineHeight: 1 }}>{n}</Titulo>
    </Tarjeta>
    {tache > 0 ? (
      <div style={{ position: "absolute", inset: 0 }}>
        <Tache p={tache} grosor={12} tono={color.negro} />
      </div>
    ) : null}
    {ok > 0 ? (
      <div style={{ position: "absolute", right: -26, top: -26 }}>
        <Check size={78} p={Math.min(1, ok)} />
      </div>
    ) : null}
  </div>
);

// B7 · el documento entra al chat y salen 3 oportunidades (genérico, sin logos)
const Chat: React.FC<{ s: number; encabezado: string; envia: number; pide: { texto: string; at: number }; opciones: number[] }> = ({ s, encabezado, envia, pide, opciones }) => {
  const c = useCtx(s);
  const vuelo = c.en(envia, "rapido");
  const pPide = c.lin(pide.at, pide.at + 0.6);
  return (
    <>
      <EncabezadoPaso texto={encabezado} p={c.en(s)} />
      <Caja top={344} bottom={820}>
        <Tarjeta style={{ width: 960, height: 466, padding: 0, position: "relative", overflow: "hidden", ...aparece(c.en(s + 0.1)) }}>
          <div style={{ height: 70, borderBottom: theme.card.border, display: "flex", alignItems: "center", gap: 14, padding: "0 28px" }}>
            <div style={{ width: 22, height: 22, borderRadius: 11, background: color.naranja }} />
            <Texto size={32}>
              Chat con <span style={{ color: color.naranja }}>IA</span>
            </Texto>
          </div>
          {/* burbuja del usuario: el documento + la petición */}
          <div style={{ position: "absolute", right: 28, top: 92, display: "flex", alignItems: "center", gap: 18, background: color.negro, borderRadius: "28px 28px 6px 28px", padding: "14px 24px", opacity: Math.min(1, vuelo * 1.5), transform: `translate(${interpolate(vuelo, [0, 1], [-420, 0])}px, ${interpolate(vuelo, [0, 1], [80, 0])}px) scale(${interpolate(vuelo, [0, 1], [0.6, 1])})` }}>
            <svg width="44" height="54" viewBox="0 0 44 54">
              <path d="M3 3 H30 L41 14 V51 H3 Z" fill={color.blanco} stroke={color.blanco} strokeWidth="3" strokeLinejoin="round" />
              <path d="M10 22 H34 M10 31 H34 M10 40 H26" stroke={color.naranja} strokeWidth="4" strokeLinecap="round" />
            </svg>
            <Texto size={32} style={{ color: color.blanco }}>
              Quién soy
              {pPide > 0 ? <span style={{ color: color.naranja }}>{" · " + pide.texto.slice(0, Math.round(pide.texto.length * pPide))}</span> : null}
            </Texto>
          </div>
          {/* respuesta: 3 oportunidades */}
          <div style={{ position: "absolute", left: 28, right: 28, top: 196, display: "flex", justifyContent: "space-between" }}>
            {opciones.map((at, i) => (
              <Oportunidad key={i} n={i + 1} p={c.en(at, "golpe")} />
            ))}
          </div>
        </Tarjeta>
      </Caja>
    </>
  );
};

// B8 · dos se tachan y una se queda con palomita
const Validar: React.FC<{ s: number; encabezado: string; taches: [number, number]; ok: number; elegida?: number }> = ({ s, encabezado, taches, ok, elegida = 1 }) => {
  const c = useCtx(s);
  const ix = [0, 1, 2].filter((i) => i !== elegida);
  return (
    <>
      <EncabezadoPaso texto={encabezado} p={c.en(s)} />
      <Caja top={344} bottom={820}>
        <div style={{ display: "flex", gap: 40, ...aparece(c.en(s + 0.05)) }}>
          {[0, 1, 2].map((i) => (
            <Oportunidad key={i} n={i + 1} p={1} tache={i === elegida ? 0 : c.lin(taches[ix.indexOf(i)], taches[ix.indexOf(i)] + 0.3)} ok={i === elegida ? c.en(ok, "golpe") : 0} />
          ))}
        </div>
        <div style={{ marginTop: 50, ...golpe(c.en(ok + 0.12, "golpe")) }}>
          <Pildora style={{ fontSize: 46, padding: "14px 40px" }}>Valida</Pildora>
        </div>
      </Caja>
    </>
  );
};

// B9 · "Negocio definido" se tacha → "La IA te ayuda a definirlo"
const Tachado: React.FC<{ s: number; antes: string; tacha: number; despues: string; at: number }> = ({ s, antes, tacha, despues, at }) => {
  const c = useCtx(s);
  const pT = c.lin(tacha, tacha + 0.35);
  const pD = c.en(at, "golpe");
  return (
    <Caja>
      <div style={{ position: "relative", ...aparece(c.en(s)), opacity: 1 - 0.45 * pT }}>
        <Titulo size={96} style={{ color: pT > 0.5 ? color.gris : color.negro }}>{antes}</Titulo>
        <Tache p={pT} grosor={14} />
      </div>
      <svg width="60" height="90" viewBox="0 0 60 90" style={{ margin: "18px 0", opacity: pD }}>
        <path d="M30 6 V78 M10 58 L30 80 L50 58" stroke={color.negro} strokeWidth={LINEA} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <Tarjeta style={{ padding: "34px 48px", textAlign: "center", ...golpe(pD) }}>
        <Titulo size={80}>
          <ConIA texto={despues} />
        </Titulo>
      </Tarjeta>
    </Caja>
  );
};

// B10 · "La clave: tu conocimiento de nicho"
const Clave: React.FC<{ s: number; previa: string; clave: { texto: string; at: number }; frase: { texto: string; at: number }; subraya: number }> = ({ s, previa, clave, frase, subraya }) => {
  const c = useCtx(s);
  const pC = c.en(clave.at, "golpe");
  const pF = c.en(frase.at, "golpe");
  const pS = c.lin(subraya, subraya + 0.35);
  const [ini, ult] = [frase.texto.split(" ").slice(0, -1).join(" "), frase.texto.split(" ").slice(-1)[0]];
  return (
    <Caja>
      <Titulo size={64} style={{ color: color.gris, marginBottom: 30, ...golpe(c.en(s, "golpe"), 1.2) }}>{previa}</Titulo>
      <div style={golpe(pC)}>
        <Pildora style={{ fontSize: 56, padding: "14px 44px" }}>{clave.texto}</Pildora>
      </div>
      <Titulo size={96} style={{ textAlign: "center", marginTop: 30, ...golpe(pF, 1.3) }}>
        {ini}{" "}
        <span style={{ position: "relative", display: "inline-block", color: pS > 0.5 ? color.naranja : color.negro }}>
          {ult}
          <span style={{ position: "absolute", left: 0, bottom: -6, height: 12, width: `${pS * 100}%`, background: color.naranja, borderRadius: 6 }} />
        </span>
      </Titulo>
    </Caja>
  );
};

// B11 · fábrica → flechas a otras 3 fábricas
const Fabricas: React.FC<{ s: number; etiqueta: { texto: string; at: number }; ia: number; flechas: number; otras: number[]; final: { texto: string; at: number } }> = ({ s, etiqueta, ia, flechas, otras, final }) => {
  const c = useCtx(s);
  const pIA = c.en(ia, "golpe");
  const pFl = c.lin(flechas, flechas + 0.5);
  const pFin = c.en(final.at, "golpe");
  const ys = [236, 410, 584];
  return (
    <>
      <div style={{ position: "absolute", left: 60, top: 216, ...aparece(c.en(s)) }}>
        <Pildora tono="negro" style={{ fontSize: 34 }}>Por ejemplo</Pildora>
      </div>
      {/* fábrica principal */}
      <div style={{ position: "absolute", left: 70, top: 320, width: 360, display: "flex", flexDirection: "column", alignItems: "center", ...aparece(c.en(s + 0.25)) }}>
        <div style={{ position: "relative" }}>
          <Fabrica size={300} />
          <div style={{ position: "absolute", right: -10, top: 70, ...golpe(pIA) }}>
            <Pildora style={{ fontSize: 40, padding: "8px 24px" }}>+ IA</Pildora>
          </div>
        </div>
        <div style={{ ...aparece(c.en(etiqueta.at)) }}>
          <Tarjeta style={{ padding: "12px 24px", marginTop: 6 }}>
            <Texto size={36} style={{ whiteSpace: "nowrap" }}>{etiqueta.texto}</Texto>
          </Tarjeta>
        </div>
      </div>
      {/* flechas */}
      <svg width={1080} height={960} style={{ position: "absolute", left: 0, top: 0 }}>
        {ys.map((y, i) => (
          <Flecha key={i} x1={450} y1={500} x2={720} y2={y + 70} p={interpolate(pFl, [i * 0.15, 0.7 + i * 0.15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} colorTrazo={color.naranja} />
        ))}
      </svg>
      {/* otras fábricas */}
      {ys.map((y, i) => {
        const p = c.en(otras[i], "golpe");
        return (
          <div key={i} style={{ position: "absolute", left: 750, top: y, ...golpe(p, 0.5) }}>
            <Fabrica size={150} digital={interpolate(c.t, [final.at + i * 0.12, final.at + 0.2 + i * 0.12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} />
          </div>
        );
      })}
      <div style={{ position: "absolute", left: 60, right: 60, top: 760, display: "flex", justifyContent: "center", ...golpe(pFin) }}>
        <Pildora style={{ fontSize: 40, padding: "12px 34px" }}>{final.texto}</Pildora>
      </div>
    </>
  );
};

// B12 · contabilidad → "Mi contador ya lo hace" → todas las industrias
const Contabilidad: React.FC<{ s: number; titulo: { texto: string; at: number }; pildora: { texto: string; at: number }; industrias: { texto: string; at: number; iconos: number[] } }> = ({ s, titulo, pildora, industrias }) => {
  const c = useCtx(s);
  const fase2 = c.lin(industrias.at - 0.2, industrias.at + 0.2); // sube el bloque de arriba
  const pP = c.en(pildora.at, "golpe");
  const iconos = [Fabrica, Tienda, Camion, Oficina];
  return (
    <Caja style={{ justifyContent: "flex-start", paddingTop: 30 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 36, transform: `scale(${interpolate(fase2, [0, 1], [1, 0.78])}) translateY(${interpolate(fase2, [0, 1], [70, -10])}px)` }}>
        <div style={{ display: "flex", ...aparece(c.en(s)) }}>
          <Calculadora size={200} />
          <div style={{ marginLeft: -40, marginTop: 30 }}>
            <Libro size={170} />
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 22, alignItems: "flex-start" }}>
          <Titulo size={74} style={aparece(c.en(titulo.at))}>{titulo.texto}</Titulo>
          <div style={{ display: "flex", alignItems: "center", gap: 14, ...golpe(pP) }}>
            <Check size={58} p={Math.min(1, pP)} />
            <Pildora tono="negro" style={{ fontSize: 38 }}>{pildora.texto}</Pildora>
          </div>
        </div>
      </div>
      <div style={{ marginTop: 10, opacity: fase2, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Titulo size={54} style={{ textAlign: "center", marginBottom: 18 }}>
          {industrias.texto}
        </Titulo>
        <div style={{ display: "flex", gap: 34 }}>
          {iconos.map((Ic, i) => (
            <div key={i} style={golpe(c.en(industrias.iconos[i], "golpe"), 0.4)}>
              <Tarjeta style={{ padding: 12, borderRadius: 22 }}>
                <Ic size={110} />
              </Tarjeta>
            </div>
          ))}
        </div>
      </div>
    </Caja>
  );
};

// B13 · fórmula "Sabes IA + Conoces el negocio = Lo que todas las industrias necesitan"
const Formula: React.FC<{ s: number; encabezado: string; a: { texto: string; at: number }; b: { texto: string; at: number }; r: { texto: string; at: number }; extra?: { texto: string; at: number } }> = ({ s, encabezado, a, b, r, extra }) => {
  const c = useCtx(s);
  const op = (txt: string, p: number) => (
    <div style={{ fontFamily: font.titulo, fontWeight: 700, fontSize: 58, color: color.naranja, lineHeight: 1, margin: "2px 0", ...golpe(p, 0.3) }}>{txt}</div>
  );
  const pA = c.en(a.at, "golpe");
  const pB = c.en(b.at, "golpe");
  const pR = c.en(r.at, "golpe");
  const pE = extra ? c.en(extra.at, "golpe") : 0;
  return (
    <Caja style={{ justifyContent: "flex-start", paddingTop: 0 }}>
      <Texto size={38} style={{ color: color.gris, marginBottom: 10, ...aparece(c.en(s)) }}>{encabezado}</Texto>
      <Tarjeta style={{ padding: "10px 48px", ...golpe(pA) }}>
        <Titulo size={62}>
          <ConIA texto={a.texto} />
        </Titulo>
      </Tarjeta>
      {op("+", pB)}
      <Tarjeta style={{ padding: "10px 48px", ...golpe(pB) }}>
        <Titulo size={62}>{b.texto}</Titulo>
      </Tarjeta>
      {op("=", pR)}
      <div style={{ ...golpe(pR, 1.6) }}>
        <Tarjeta fondo={color.naranja} style={{ padding: "14px 40px", textAlign: "center", width: 900 }}>
          <Titulo size={54} style={{ color: color.blanco }}>{r.texto}</Titulo>
        </Tarjeta>
      </div>
      {extra ? (
        <div style={{ marginTop: 16, ...golpe(pE) }}>
          <Pildora tono="negro" style={{ fontSize: 34 }}>{extra.texto}</Pildora>
        </div>
      ) : null}
    </Caja>
  );
};

// B14 · pregunta de cierre + comentarios + guardar
const Pregunta: React.FC<{ s: number; pregunta: string; resalta: string; comenta: { texto: string; at: number }; guarda: { texto: string; at: number } }> = ({ s, pregunta, resalta, comenta, guarda }) => {
  const c = useCtx(s);
  const pC = c.en(comenta.at, "golpe");
  const pG = c.en(guarda.at, "golpe");
  const partes = pregunta.split(resalta);
  return (
    <Caja style={{ justifyContent: "flex-start", paddingTop: 26 }}>
      <Titulo size={90} style={{ textAlign: "center", ...golpe(c.en(s, "golpe"), 1.25) }}>
        {partes[0]}
        <span style={{ color: color.naranja }}>{resalta}</span>
        {partes[1]}
      </Titulo>
      <div style={{ display: "flex", gap: 30, marginTop: 44, alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, ...golpe(pC) }}>
          <Comentario size={96} />
          <Pildora tono="negro" style={{ fontSize: 36 }}>{comenta.texto}</Pildora>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, ...golpe(pG) }}>
          <Guardar size={100} lleno={pG} />
          <Pildora style={{ fontSize: 36 }}>{guarda.texto}</Pildora>
        </div>
      </div>
    </Caja>
  );
};

// ───────────────────────── Registro ─────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ESCENAS: Record<string, React.FC<any>> = {
  escribe: Escribe,
  tarjetas: Tarjetas,
  etiqueta: Etiqueta,
  documento: Documento,
  chat: Chat,
  validar: Validar,
  tachado: Tachado,
  clave: Clave,
  fabricas: Fabricas,
  contabilidad: Contabilidad,
  formula: Formula,
  pregunta: Pregunta,
};

export const Escena: React.FC<{ b: EscenaB; conPaso?: boolean }> = ({ b }) => {
  const { fps } = useVideoConfig();
  const dur = Math.round((b.end - b.start) * fps);
  const salida = useEntradaSalida(dur, -30); // solo la salida (la entrada la maneja cada escena)
  const C = ESCENAS[b.nombre];
  if (!C) throw new Error(`Escena desconocida: ${b.nombre}`);
  return (
    <div style={{ position: "absolute", inset: 0, opacity: salida }}>
      <C s={b.start} {...(b.props ?? {})} />
    </div>
  );
};

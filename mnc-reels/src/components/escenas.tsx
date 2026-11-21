// Escenas animadas a la medida (tipo "escena" en reel.json). Cada una vive dentro del área del panel
// (960×620) y recibe m = cuadros (relativos al clip) en que entra cada elemento interno.
// Solo colores planos MNC; íconos de línea negra con acentos naranja.
import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../theme";
import { Check, Pildora, Tarjeta } from "./Base";

const { color, font } = theme;
type Props = { m: number[]; dur: number };

// ───────────────────────── utilidades ─────────────────────────
const useAp = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (desde = 0, preset: keyof typeof theme.spring = "suave") =>
    spring({ frame: frame - desde, fps, config: theme.spring[preset] });
};
const lerp = (p: number, a: number, b: number) => interpolate(p, [0, 1], [a, b]);

const Sube: React.FC<{ p: number; children: React.ReactNode; style?: React.CSSProperties; dy?: number }> = ({ p, children, style, dy = 36 }) => (
  <div style={{ opacity: Math.min(1, p * 1.4), transform: `translateY(${lerp(p, dy, 0)}px) scale(${lerp(p, 0.94, 1)})`, ...style }}>{children}</div>
);
const Golpe: React.FC<{ p: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ p, children, style }) => (
  <div style={{ opacity: Math.min(1, p * 2), transform: `scale(${lerp(p, 1.5, 1)})`, ...style }}>{children}</div>
);

const T: React.FC<{ size?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ size = 64, children, style }) => (
  <div style={{ fontFamily: font.titulo, fontWeight: 700, fontSize: size, lineHeight: 1.1, color: color.negro, textAlign: "center", ...style }}>{children}</div>
);
const N: React.FC<{ children: React.ReactNode }> = ({ children }) => <span style={{ color: color.naranja }}>{children}</span>;

const Col: React.FC<{ children: React.ReactNode; gap?: number; style?: React.CSSProperties }> = ({ children, gap = 24, style }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap, ...style }}>{children}</div>
);

// trazo que se dibuja (para íconos)
const traza = (p: number, len = 400) => ({ strokeDasharray: len, strokeDashoffset: len * (1 - Math.min(1, p)) });
const L = { fill: "none", stroke: color.negro, strokeWidth: 7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
const LN = { ...L, stroke: color.naranja };

// ───────────────────────── íconos (línea) ─────────────────────────
const Icono: React.FC<{ size?: number; children: React.ReactNode }> = ({ size = 150, children }) => (
  <svg width={size} height={size} viewBox="0 0 120 120">{children}</svg>
);
const Casa: React.FC<{ p: number; size?: number }> = ({ p, size }) => (
  <Icono size={size}>
    <path d="M14 58 L60 18 L106 58" {...L} style={traza(p, 140)} />
    <path d="M26 50 V102 H94 V50" {...L} style={traza(p, 200)} />
    <path d="M50 102 V74 H70 V102" {...LN} style={traza(p, 80)} />
  </Icono>
);
const Codigo: React.FC<{ p: number; tacha: number; size?: number }> = ({ p, tacha, size }) => (
  <Icono size={size}>
    <path d="M40 34 L14 60 L40 86" {...L} style={traza(p, 80)} />
    <path d="M80 34 L106 60 L80 86" {...L} style={traza(p, 80)} />
    <path d="M68 26 L52 94" {...L} style={traza(p, 80)} />
    <path d="M12 108 L108 12" {...LN} strokeWidth={10} style={traza(tacha, 140)} />
  </Icono>
);
const Edificio: React.FC<{ size?: number }> = ({ size = 120 }) => (
  <Icono size={size}>
    <rect x="30" y="22" width="60" height="84" rx="6" {...L} />
    {[38, 56, 74].map((y) => (
      <React.Fragment key={y}>
        <rect x="42" y={y} width="12" height="10" fill={color.naranja} />
        <rect x="66" y={y} width="12" height="10" fill={color.naranja} />
      </React.Fragment>
    ))}
    <path d="M54 106 V92 H66 V106" {...L} />
  </Icono>
);
const Celular: React.FC<{ size?: number }> = ({ size }) => (
  <Icono size={size}>
    <rect x="34" y="12" width="52" height="96" rx="10" {...L} />
    <path d="M52 96 H68" {...L} />
    <path d="M60 44 c-6 -10 -22 -6 -18 8 c3 9 18 18 18 18 s15 -9 18 -18 c4 -14 -12 -18 -18 -8 z" fill={color.naranja} stroke="none" />
  </Icono>
);
const Persona: React.FC<{ size?: number; acento?: boolean }> = ({ size = 70, acento }) => (
  <Icono size={size}>
    <circle cx="60" cy="44" r="18" {...(acento ? LN : L)} />
    <path d="M26 100 c4 -22 18 -30 34 -30 s30 8 34 30" {...(acento ? LN : L)} />
  </Icono>
);
const Fabrica: React.FC<{ size?: number; p?: number }> = ({ size, p = 1 }) => (
  <Icono size={size}>
    <path d="M12 104 V56 L38 70 V56 L64 70 V56 L90 70 V30 H106 V104 Z" {...L} style={traza(p, 420)} />
    <rect x="28" y="84" width="12" height="10" fill={color.naranja} opacity={p} />
    <rect x="54" y="84" width="12" height="10" fill={color.naranja} opacity={p} />
    <path d="M98 22 c0 -8 8 -8 8 -16" {...LN} strokeWidth={5} style={traza(p, 30)} />
  </Icono>
);
const Camion: React.FC<{ size?: number; p?: number }> = ({ size, p = 1 }) => (
  <Icono size={size}>
    <path d="M8 34 H72 V88 H8 Z" {...L} style={traza(p, 240)} />
    <path d="M72 50 H96 L112 68 V88 H72" {...L} style={traza(p, 140)} />
    <circle cx="30" cy="92" r="10" {...LN} fill={color.blanco} style={traza(p, 70)} />
    <circle cx="92" cy="92" r="10" {...LN} fill={color.blanco} style={traza(p, 70)} />
  </Icono>
);
const Corazon: React.FC<{ size?: number }> = ({ size }) => (
  <Icono size={size}>
    <path d="M60 98 C20 72 12 54 18 38 C26 18 52 20 60 40 C68 20 94 18 102 38 C108 54 100 72 60 98 Z" {...L} fill={color.naranja} />
  </Icono>
);
const Chat: React.FC<{ size?: number }> = ({ size }) => (
  <Icono size={size}>
    <path d="M16 24 H104 V80 H50 L28 100 V80 H16 Z" {...L} />
    <path d="M36 46 H84 M36 62 H68" {...LN} />
  </Icono>
);
const Play: React.FC<{ size?: number }> = ({ size }) => (
  <Icono size={size}>
    <rect x="12" y="24" width="96" height="72" rx="14" {...L} />
    <path d="M50 44 L76 60 L50 76 Z" fill={color.naranja} stroke={color.naranja} strokeWidth={4} strokeLinejoin="round" />
  </Icono>
);
const Pizarron: React.FC<{ size?: number }> = ({ size }) => (
  <Icono size={size}>
    <rect x="10" y="14" width="100" height="66" rx="6" {...L} />
    <path d="M26 64 L46 46 L60 56 L90 32" {...LN} />
    <path d="M40 80 L30 106 M80 80 L90 106" {...L} />
  </Icono>
);
const FlechaSube: React.FC<{ p: number; w?: number; h?: number }> = ({ p, w = 300, h = 200 }) => (
  <svg width={w} height={h} viewBox="0 0 300 200">
    <path d="M14 186 L110 116 L160 140 L276 28" fill="none" stroke={color.naranja} strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" style={traza(p, 420)} />
    <path d="M222 26 H278 V82" fill="none" stroke={color.naranja} strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" opacity={p > 0.85 ? 1 : 0} />
  </svg>
);

// ───────────────────────── escenas ─────────────────────────

// T1 · B1 — "No soy programador"
const NoProgramador: React.FC<Props> = ({ m }) => {
  const ap = useAp();
  return (
    <Col gap={30}>
      <Codigo p={ap(0)} tacha={ap((m[0] ?? 10) + 4)} size={190} />
      <Sube p={ap(4)}>
        <T size={96}>
          No soy <N>programador</N>
        </T>
      </Sube>
    </Col>
  );
};

// T1 · B2 — "3 empresas de tecnología" (3 en naranja)
const TresEmpresas: React.FC<Props> = ({ m }) => {
  const ap = useAp();
  const g = ap(0, "golpe");
  return (
    <Col gap={10}>
      <div style={{ display: "flex", alignItems: "center", gap: 40 }}>
        <Golpe p={g}>
          <div style={{ fontFamily: font.titulo, fontWeight: 700, fontSize: 300, lineHeight: 0.95, color: color.naranja }}>3</div>
        </Golpe>
        <div style={{ display: "flex", gap: 6 }}>
          {[0, 1, 2].map((i) => {
            const p = ap((m[0] ?? 8) + i * 4, "golpe");
            return (
              <div key={i} style={{ transform: `translateY(${lerp(p, 60, 0)}px) scale(${p})` }}>
                <Edificio size={120} />
              </div>
            );
          })}
        </div>
      </div>
      <Sube p={ap(6)}>
        <T size={76}>empresas de tecnología</T>
      </Sube>
    </Col>
  );
};

// T2 · B3 — "Pandemia" con casa
const Pandemia: React.FC<Props> = ({ m }) => {
  const ap = useAp();
  return (
    <Col gap={26}>
      <Tarjeta style={{ width: 300, height: 300, borderRadius: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: 0, transform: `scale(${ap(0, "golpe")})` }}>
        <Casa p={ap(2)} size={200} />
      </Tarjeta>
      <Sube p={ap(5)}>
        <T size={110}>Pandemia</T>
      </Sube>
      <Sube p={ap(m[0] ?? 20)}>
        <Pildora tono="negro" style={{ fontSize: 40 }}>Cambié de carrera</Pildora>
      </Sube>
    </Col>
  );
};

// T2 · B4 — plan B: tarjeta "Le enseñé tecnología a mi abuela"
const Abuela: React.FC<Props> = ({ m }) => {
  const ap = useAp();
  return (
    <Sube p={ap(0)}>
      <Tarjeta style={{ width: 900, display: "flex", alignItems: "center", gap: 34, padding: "50px 50px" }}>
        <div style={{ transform: `rotate(${lerp(ap(m[0] ?? 12, "golpe"), -14, 0)}deg) scale(${lerp(ap(m[0] ?? 12, "golpe"), 0.6, 1)})` }}>
          <Celular size={210} />
        </div>
        <T size={70} style={{ textAlign: "left" }}>
          Le enseñé tecnología a <N>mi abuela</N>
        </T>
      </Tarjeta>
    </Sube>
  );
};

// T2 · B5 — cuadrícula tipo videollamada (genérica, sin logos) → "La tecnología bien explicada cambia vidas"
const Kit: React.FC<Props> = ({ m }) => {
  const ap = useAp();
  const frame = useCurrentFrame();
  const cambio = m[2] ?? 120;
  const sale = interpolate(frame, [cambio - 6, cambio + 2], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const frase = ap(cambio);
  const cols = 5, filas = 3;
  return (
    <div style={{ position: "relative", width: 960, height: 620, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ position: "absolute", opacity: sale, transform: `scale(${lerp(sale, 0.9, 1)})` }}>
        <Col gap={22}>
          <Sube p={ap(0)} style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <Pildora style={{ fontSize: 46, fontFamily: font.titulo, fontWeight: 700 }}>Kit</Pildora>
            <T size={52}>clases por Zoom</T>
          </Sube>
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 160px)`, gap: 14 }}>
            {Array.from({ length: cols * filas }).map((_, i) => {
              const p = ap((m[0] ?? 10) + i * 2, "rapido");
              const hablando = i === 7 && Math.floor(frame / 12) % 2 === 0;
              return (
                <div
                  key={i}
                  style={{
                    width: 160,
                    height: 112,
                    background: color.blanco,
                    border: `3px solid ${hablando ? color.naranja : color.negro}`,
                    borderRadius: 16,
                    display: "flex",
                    alignItems: "flex-end",
                    justifyContent: "center",
                    overflow: "hidden",
                    transform: `scale(${p})`,
                  }}
                >
                  <Persona size={96} acento={i % 4 === 1} />
                </div>
              );
            })}
          </div>
          <Sube p={ap(m[1] ?? 60)}>
            <T size={50}>
              <N>cientos</N> de adultos mayores
            </T>
          </Sube>
        </Col>
      </div>
      <div style={{ position: "absolute", opacity: frase, pointerEvents: "none" }}>
        <Sube p={frase}>
          <Tarjeta style={{ width: 900, padding: "56px 56px" }}>
            <T size={82}>
              La tecnología bien explicada <N>cambia vidas</N>
            </T>
          </Tarjeta>
        </Sube>
      </div>
    </div>
  );
};

// T3 · B6 — "No code = construir software sin saber programar"
const NoCode: React.FC<Props> = ({ m }) => {
  const ap = useAp();
  const frame = useCurrentFrame();
  const def = m[1] ?? 90;
  const sale = interpolate(frame, [def - 6, def + 2], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ position: "relative", width: 960, height: 620, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ position: "absolute", opacity: sale }}>
        <Sube p={ap(0)}>
          <T size={84}>
            Algo que me <N>cambió todo</N>
          </T>
        </Sube>
      </div>
      <div style={{ position: "absolute" }}>
        <Col gap={30}>
          <Golpe p={ap(def, "golpe")}>
            <Pildora tono="naranja" style={{ fontFamily: font.titulo, fontWeight: 700, fontSize: 110, padding: "14px 56px" }}>
              No code
            </Pildora>
          </Golpe>
          <Sube p={ap((m[2] ?? def + 20))}>
            <Tarjeta style={{ width: 880, padding: "40px 48px" }}>
              <T size={66}>
                <span style={{ color: color.naranja }}>=</span> construir software sin saber programar
              </T>
            </Tarjeta>
          </Sube>
        </Col>
      </div>
    </div>
  );
};

// T3 · B7 — tabla tipo hoja de cálculo tachada → bloques de una app
const ExcelApp: React.FC<Props> = ({ m }) => {
  const ap = useAp();
  const frame = useCurrentFrame();
  const tacha = ap(m[1] ?? 100, "rapido");
  const cambio = m[2] ?? 160;
  const sale = interpolate(frame, [cambio - 4, cambio + 6], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const filas = 5;
  return (
    <div style={{ position: "relative", width: 960, height: 620, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ position: "absolute", opacity: sale, transform: `scale(${lerp(sale, 0.85, 1)})` }}>
        <Col gap={20}>
          <Sube p={ap(m[0] ?? 0)}>
            <Pildora tono="negro" style={{ fontSize: 44 }}>Excel</Pildora>
          </Sube>
          <div style={{ position: "relative" }}>
            <div style={{ background: color.blanco, border: theme.card.border, borderRadius: 18, overflow: "hidden", width: 760 }}>
              {Array.from({ length: filas + 1 }).map((_, r) => (
                <div key={r} style={{ display: "grid", gridTemplateColumns: "60px repeat(4, 1fr)", borderTop: r ? `2px solid ${color.verde}` : "none", height: 62 }}>
                  {Array.from({ length: 5 }).map((__, c) => {
                    const p = ap(r * 4 + c, "rapido");
                    const cab = r === 0 || c === 0;
                    return (
                      <div key={c} style={{ borderLeft: c ? `2px solid ${color.verde}` : "none", display: "flex", alignItems: "center", justifyContent: "center", background: cab ? color.verde : color.blanco }}>
                        {cab ? (
                          <span style={{ fontFamily: font.texto, fontWeight: 600, fontSize: 26, color: color.gris, opacity: p }}>{r === 0 ? (c ? "ABCD"[c - 1] : "") : r}</span>
                        ) : (
                          <div style={{ width: `${40 + ((r * 7 + c * 13) % 45)}%`, height: 12, borderRadius: 6, background: color.gris, opacity: 0.35 * p }} />
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
            <svg width={800} height={420} viewBox="0 0 800 420" style={{ position: "absolute", left: -20, top: -20 }}>
              <path d="M30 390 L770 30" stroke={color.naranja} strokeWidth={18} strokeLinecap="round" style={traza(tacha, 830)} />
              <path d="M30 30 L770 390" stroke={color.naranja} strokeWidth={18} strokeLinecap="round" style={traza(ap((m[1] ?? 100) + 5, "rapido"), 830)} />
            </svg>
          </div>
        </Col>
      </div>
      <div style={{ position: "absolute" }}>
        <Col gap={26}>
          <Golpe p={ap(cambio, "golpe")}>
            <Pildora style={{ fontSize: 50, fontFamily: font.titulo, fontWeight: 700 }}>Herramientas no code</Pildora>
          </Golpe>
          <div style={{ display: "flex", gap: 22 }}>
            {[
              { t: "Formularios", i: <Chat size={110} /> },
              { t: "Tareas", i: <Check size={96} p={ap(cambio + 20)} /> },
              { t: "Reportes", i: <Pizarron size={110} /> },
            ].map((x, k) => {
              const p = ap(cambio + 6 + k * 5, "golpe");
              return (
                <Tarjeta key={k} style={{ width: 270, height: 250, padding: 20, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, transform: `translateY(${lerp(p, 80, 0)}px) scale(${p})` }}>
                  {x.i}
                  <span style={{ fontFamily: font.texto, fontWeight: 600, fontSize: 34, color: color.negro }}>{x.t}</span>
                </Tarjeta>
              );
            })}
          </div>
          <Sube p={ap(m[3] ?? cambio + 30)}>
            <T size={50}>
              todo <N>sin programación</N>
            </T>
          </Sube>
        </Col>
      </div>
    </div>
  );
};

// T4 · B8 — línea de tiempo "Pandemia · Kit" → "No code" → "Llega la IA" + flecha que sube
const LineaTiempo: React.FC<Props> = ({ m }) => {
  const ap = useAp();
  const puntos = [
    { x: 120, y: 470, t: "Pandemia · Kit" },
    { x: 440, y: 340, t: "No code" },
    { x: 760, y: 210, t: "Llega la IA" },
  ];
  const ps = puntos.map((_, i) => ap(m[i] ?? i * 15, "golpe"));
  const linea = ap(m[0] ?? 0, "suave");
  const flecha = ap(m[3] ?? 90);
  return (
    <div style={{ position: "relative", width: 960, height: 620 }}>
      <svg width={960} height={620} style={{ position: "absolute", inset: 0 }}>
        <path d="M120 470 L440 340 L760 210" stroke={color.negro} strokeWidth={6} strokeDasharray="4 16" strokeLinecap="round" fill="none" opacity={linea} />
      </svg>
      {puntos.map((pt, i) => (
        <div key={i} style={{ position: "absolute", left: pt.x, top: pt.y, transform: `translate(-50%, -50%) scale(${ps[i]})`, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ width: 46, height: 46, borderRadius: 99, background: i === 2 ? color.naranja : color.blanco, border: theme.card.border }} />
          <div
            style={{
              position: "absolute",
              top: 62,
              whiteSpace: "nowrap",
              background: i === 2 ? color.negro : color.blanco,
              color: i === 2 ? color.blanco : color.negro,
              border: theme.card.border,
              borderRadius: 999,
              padding: "10px 26px",
              fontFamily: font.titulo,
              fontWeight: 700,
              fontSize: i === 2 ? 50 : 40,
            }}
          >
            {i === 2 ? (
              <>
                Llega la <span style={{ color: color.naranja }}>IA</span>
              </>
            ) : (
              pt.t
            )}
          </div>
        </div>
      ))}
      <div style={{ position: "absolute", left: 560, top: 0, opacity: flecha > 0.01 ? 1 : 0 }}>
        <FlechaSube p={flecha} w={360} h={240} />
      </div>
      <div style={{ position: "absolute", left: 40, top: 40, opacity: flecha, transform: `translateY(${lerp(flecha, 20, 0)}px)` }}>
        <Pildora style={{ fontSize: 40 }}>El no code se disparó</Pildora>
      </div>
    </div>
  );
};

// T5 · B9 — "+150 empresas" contando
const Mas150: React.FC<Props> = ({ m }) => {
  const ap = useAp();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // el conteo arranca ~1 s antes de que Manuel diga "150" y aterriza justo en la palabra
  const ini = Math.max(6, (m[0] ?? 40) - Math.round(fps * 0.9));
  const n = Math.round(interpolate(frame, [ini, ini + fps * 1.1], [0, 150], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: theme.ease.out }));
  const g = ap(ini + Math.round(fps * 1.1), "golpe");
  const s = 1 + 0.08 * Math.sin(Math.min(1, g) * Math.PI);
  return (
    <Col gap={18}>
      <Sube p={ap(0)}>
        <Pildora tono="negro" style={{ fontSize: 40 }}>De forma directa</Pildora>
      </Sube>
      <Tarjeta style={{ width: 820, textAlign: "center", padding: "30px 40px", transform: `scale(${ap(ini - 6) * s})`, opacity: Math.min(1, ap(ini - 6) * 2) }}>
        <div style={{ fontFamily: font.titulo, fontWeight: 700, fontSize: 230, lineHeight: 1, color: color.naranja, fontVariantNumeric: "tabular-nums" }}>+{n}</div>
        <T size={70}>empresas</T>
      </Tarjeta>
      <Sube p={ap(m[1] ?? 60)}>
        <T size={52}>
          implementando <N>IA</N>
        </T>
      </Sube>
    </Col>
  );
};

// T5 · B10 — "Miles de personas en redes y clases"
const Miles: React.FC<Props> = ({ m }) => {
  const ap = useAp();
  const grupo = (desde: number, label: string, iconos: React.ReactNode[]) => {
    const p = ap(desde, "golpe");
    return (
      <Tarjeta style={{ padding: "26px 30px", display: "flex", flexDirection: "column", alignItems: "center", gap: 10, transform: `scale(${p})`, opacity: Math.min(1, p * 2) }}>
        <div style={{ display: "flex", gap: 8 }}>{iconos}</div>
        <span style={{ fontFamily: font.texto, fontWeight: 600, fontSize: 40, color: color.negro }}>{label}</span>
      </Tarjeta>
    );
  };
  return (
    <Col gap={30}>
      <Sube p={ap(0)}>
        <T size={84}>
          <N>Miles</N> de personas
        </T>
      </Sube>
      <div style={{ display: "flex", gap: 30, alignItems: "stretch" }}>
        {grupo(m[0] ?? 20, "Redes", [<Corazon key="a" size={100} />, <Chat key="b" size={100} />, <Play key="c" size={100} />])}
        {grupo(m[1] ?? 40, "Clases", [<Pizarron key="d" size={100} />])}
      </div>
      <Sube p={ap(m[2] ?? 80)}>
        <Pildora tono="negro" style={{ fontSize: 40 }}>Automatizar procesos y tareas</Pildora>
      </Sube>
    </Col>
  );
};

// T5 · B11 — "Conocimiento de negocio + IA = carreras y negocios que crecen"
const Formula: React.FC<Props> = ({ m }) => {
  const ap = useAp();
  const caja = (p: number, children: React.ReactNode, fondo: string = color.blanco, txt: string = color.negro) => (
    <div style={{ transform: `scale(${p})`, opacity: Math.min(1, p * 2) }}>
      <div style={{ background: fondo, color: txt, border: theme.card.border, borderRadius: 24, padding: "20px 40px", fontFamily: font.titulo, fontWeight: 700, fontSize: 60, textAlign: "center" }}>{children}</div>
    </div>
  );
  const op = (p: number, s: string) => (
    <div style={{ fontFamily: font.titulo, fontWeight: 700, fontSize: 80, lineHeight: 0.9, color: color.naranja, opacity: p, transform: `scale(${lerp(p, 1.6, 1)})` }}>{s}</div>
  );
  return (
    <Col gap={14}>
      <Sube p={ap(0)}>
        <Pildora tono="negro" style={{ fontSize: 38 }}>Para profesionales</Pildora>
      </Sube>
      {caja(ap(m[0] ?? 20, "golpe"), "Conocimiento de negocio")}
      {op(ap(m[1] ?? 60, "golpe"), "+")}
      {caja(ap(m[1] ?? 60, "golpe"), "IA", color.naranja, color.blanco)}
      {op(ap(m[2] ?? 100, "golpe"), "=")}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {caja(ap(m[2] ?? 100, "golpe"), "Carreras y negocios que crecen", color.negro, color.blanco)}
      </div>
    </Col>
  );
};

// T6 · B12 — "Hoy: IA para fábricas y distribuidoras" (sin nombre ni marca de la empresa)
const Hoy: React.FC<Props> = ({ m }) => {
  const ap = useAp();
  return (
    <Col gap={26}>
      <Sube p={ap(0)} style={{ display: "flex", alignItems: "center", gap: 22 }}>
        <Pildora style={{ fontSize: 50, fontFamily: font.titulo, fontWeight: 700 }}>Hoy</Pildora>
        <T size={62}>
          <N>IA</N> para
        </T>
      </Sube>
      <div style={{ display: "flex", gap: 30 }}>
        {[
          { i: <Fabrica size={170} p={ap((m[0] ?? 20) + 2)} />, t: "Fábricas", d: m[0] ?? 20 },
          { i: <Camion size={170} p={ap((m[1] ?? 40) + 2)} />, t: "Distribuidoras", d: m[1] ?? 40 },
        ].map((x, k) => {
          const p = ap(x.d, "golpe");
          return (
            <Tarjeta key={k} style={{ width: 400, padding: "26px 20px", display: "flex", flexDirection: "column", alignItems: "center", gap: 6, transform: `scale(${p})`, opacity: Math.min(1, 2 * p) }}>
              {x.i}
              <span style={{ fontFamily: font.titulo, fontWeight: 700, fontSize: 50, color: color.negro }}>{x.t}</span>
            </Tarjeta>
          );
        })}
      </div>
      <Sube p={ap(m[2] ?? 80)}>
        <Pildora tono="negro" style={{ fontSize: 40 }}>Pero nunca dejé de enseñar</Pildora>
      </Sube>
    </Col>
  );
};

// T6 · B13 — "¿Años de experiencia? ¿La IA va muy rápido?" → "Aquí sabes por dónde empezar"
const Preguntas: React.FC<Props> = ({ m }) => {
  const ap = useAp();
  const frame = useCurrentFrame();
  const fin = m[3] ?? 150;
  const atenua = interpolate(frame, [fin - 4, fin + 8], [1, 0.35], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const preg = (p: number, children: React.ReactNode) => (
    <Sube p={p}>
      <Tarjeta style={{ padding: "22px 40px", opacity: atenua }}>
        <T size={60}>{children}</T>
      </Tarjeta>
    </Sube>
  );
  return (
    <Col gap={22}>
      <Sube p={ap(0)}>
        <Pildora tono="negro" style={{ fontSize: 38 }}>Por eso hago estos videos</Pildora>
      </Sube>
      {preg(ap(m[1] ?? 40), <>¿Años de experiencia?</>)}
      {preg(ap(m[2] ?? 90), <>¿La <N>IA</N> va muy rápido?</>)}
      <Golpe p={ap(fin, "golpe")}>
        <div style={{ background: color.naranja, borderRadius: 24, border: theme.card.border, padding: "22px 40px", display: "flex", alignItems: "center", gap: 20 }}>
          <T size={64} style={{ color: color.blanco }}>Aquí sabes por dónde empezar</T>
        </div>
      </Golpe>
    </Col>
  );
};

// T7 · B14 — "Comunidad gratis · liga en mi perfil" con flecha hacia arriba
const Comunidad: React.FC<Props> = ({ m }) => {
  const ap = useAp();
  const frame = useCurrentFrame();
  const bote = Math.abs(Math.sin(frame / 7)) * 18;
  const fl = ap(m[0] ?? 20, "golpe");
  return (
    <Col gap={22}>
      <svg width={170} height={170} viewBox="0 0 120 120" style={{ transform: `translateY(${-bote}px) scale(${fl})` }}>
        <path d="M60 108 V20 M24 54 L60 18 L96 54" fill="none" stroke={color.naranja} strokeWidth={16} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <Sube p={ap(0)}>
        <Tarjeta style={{ padding: "34px 56px", display: "flex", alignItems: "center", gap: 24 }}>
          <div style={{ display: "flex" }}>
            {[0, 1, 2].map((i) => (
              <div key={i} style={{ marginLeft: i ? -26 : 0, background: color.verde, borderRadius: 99, border: theme.card.border, width: 96, height: 96, display: "flex", alignItems: "flex-end", justifyContent: "center", overflow: "hidden" }}>
                <Persona size={84} acento={i === 1} />
              </div>
            ))}
          </div>
          <T size={76}>
            Comunidad <N>gratis</N>
          </T>
        </Tarjeta>
      </Sube>
      <Sube p={ap(m[1] ?? 60)}>
        <Pildora tono="negro" style={{ fontSize: 46 }}>Liga en mi perfil</Pildora>
      </Sube>
    </Col>
  );
};

// T7 · B15 — "Bienvenido"
const Bienvenido: React.FC<Props> = ({ m }) => {
  const ap = useAp();
  return (
    <Col gap={30}>
      <Golpe p={ap(0, "golpe")}>
        <T size={150}>
          Bienvenid<N>o</N>
        </T>
      </Golpe>
      <Sube p={ap(m[0] ?? 12)}>
        <Pildora tono="negro" style={{ fontSize: 44 }}>a este perfil</Pildora>
      </Sube>
    </Col>
  );
};

export const ESCENAS: Record<string, React.FC<Props>> = {
  noProgramador: NoProgramador,
  tresEmpresas: TresEmpresas,
  pandemia: Pandemia,
  abuela: Abuela,
  kit: Kit,
  noCode: NoCode,
  excelApp: ExcelApp,
  lineaTiempo: LineaTiempo,
  mas150: Mas150,
  miles: Miles,
  formula: Formula,
  hoy: Hoy,
  preguntas: Preguntas,
  comunidad: Comunidad,
  bienvenido: Bienvenido,
};


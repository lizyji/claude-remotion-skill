// Escenas animadas a la medida para el panel de B-roll (1080×960, contenido entre y≈200 y y≈820).
// Colores planos MNC, tarjetas blancas con borde negro, íconos de línea negra con acentos naranja.
import React from "react";
import { Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../theme";
import { Check, ConIA, Pildora, Tarjeta } from "./Base";

const { color, font, card } = theme;

// Progreso de entrada de un elemento que aparece a los `d` segundos de iniciado el clip
const useAparece = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (d: number, preset: keyof typeof theme.spring = "suave") =>
    spring({ frame: frame - Math.round(d * fps), fps, config: theme.spring[preset] });
};
const useSeg = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return frame / fps;
};

const sube = (p: number, px = 30): React.CSSProperties => ({
  opacity: Math.min(1, p),
  transform: `translateY(${interpolate(p, [0, 1], [px, 0])}px) scale(${interpolate(p, [0, 1], [0.9, 1])})`,
});
const golpe = (p: number): React.CSSProperties => ({
  opacity: Math.min(1, p * 1.6),
  transform: `scale(${interpolate(p, [0, 1], [1.5, 1])})`,
});

const H: React.FC<{ size?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ size = 64, children, style }) => (
  <div style={{ fontFamily: font.titulo, fontWeight: 700, fontSize: size, lineHeight: 1.1, color: color.negro, textAlign: "center", ...style }}>
    {children}
  </div>
);
const T: React.FC<{ size?: number; peso?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ size = 40, peso = 600, children, style }) => (
  <div style={{ fontFamily: font.texto, fontWeight: peso, fontSize: size, lineHeight: 1.25, color: color.negro, ...style }}>{children}</div>
);

// ───────────────────────── Íconos de línea (negro + acento naranja) ─────────────────────────
const SW = 7;
export const IconoCorreo: React.FC<{ size: number; on: number }> = ({ size, on }) => (
  <svg width={size} height={size} viewBox="0 0 120 120">
    <rect x="12" y="28" width="96" height="66" rx="10" fill={on > 0.5 ? color.naranja : color.blanco} stroke={color.negro} strokeWidth={SW} />
    <path d="M14 32 L60 66 L106 32" fill="none" stroke={color.negro} strokeWidth={SW} strokeLinejoin="round" />
  </svg>
);
export const IconoCalendario: React.FC<{ size: number; on: number }> = ({ size, on }) => (
  <svg width={size} height={size} viewBox="0 0 120 120">
    <rect x="14" y="24" width="92" height="82" rx="10" fill={color.blanco} stroke={color.negro} strokeWidth={SW} />
    <rect x="14" y="24" width="92" height="24" rx="10" fill={on > 0.5 ? color.naranja : color.blanco} stroke={color.negro} strokeWidth={SW} />
    <line x1="38" y1="12" x2="38" y2="34" stroke={color.negro} strokeWidth={SW} strokeLinecap="round" />
    <line x1="82" y1="12" x2="82" y2="34" stroke={color.negro} strokeWidth={SW} strokeLinecap="round" />
    {[0, 1, 2].map((r) => [0, 1, 2].map((c) => <rect key={`${r}${c}`} x={30 + c * 24} y={60 + r * 14} width="12" height="7" rx="2" fill={r === 1 && c === 1 && on > 0.5 ? color.naranja : color.negro} />))}
  </svg>
);
export const IconoTareas: React.FC<{ size: number; on: number }> = ({ size, on }) => (
  <svg width={size} height={size} viewBox="0 0 120 120">
    <rect x="20" y="14" width="80" height="94" rx="10" fill={color.blanco} stroke={color.negro} strokeWidth={SW} />
    {[0, 1, 2].map((i) => (
      <g key={i}>
        <path d={`M32 ${40 + i * 24} l6 6 l10 -12`} fill="none" stroke={on > 0.5 ? color.naranja : color.gris} strokeWidth={SW - 1} strokeLinecap="round" strokeLinejoin="round" />
        <line x1="56" y1={38 + i * 24} x2="88" y2={38 + i * 24} stroke={color.negro} strokeWidth={SW - 1} strokeLinecap="round" />
      </g>
    ))}
  </svg>
);
const Persona: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 120 120">
    <circle cx="60" cy="34" r="18" fill={color.blanco} stroke={color.negro} strokeWidth={SW} />
    <path d="M24 108 C24 76 40 62 60 62 C80 62 96 76 96 108" fill={color.blanco} stroke={color.negro} strokeWidth={SW} strokeLinejoin="round" />
  </svg>
);

// ───────────────────────── Escenas ─────────────────────────

// B1 / B13: texto que se escribe letra por letra + signo final en naranja
const Tipeo: React.FC<{ texto: string; signo?: string; pildora?: string; cps?: number }> = ({ texto, signo, pildora, cps = 26 }) => {
  const s = useSeg();
  const ap = useAparece();
  const n = Math.min(texto.length, Math.floor(s * cps));
  const fin = texto.length / cps;
  const pSigno = ap(fin + 0.05, "golpe");
  const cursor = n < texto.length || Math.floor(s * 2.5) % 2 === 0;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 34 }}>
      {pildora ? <div style={sube(ap(0))}><Pildora tono="negro">{pildora}</Pildora></div> : null}
      <Tarjeta style={{ width: 920, minHeight: 330, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <H size={82}>
          {texto.slice(0, n)}
          {signo ? <span style={{ display: "inline-block", color: color.naranja, ...golpe(pSigno), marginLeft: 8 }}>{signo}</span> : null}
          <span style={{ display: "inline-block", width: 6, height: 76, background: color.naranja, marginLeft: 8, verticalAlign: "-8px", opacity: cursor && pSigno < 0.5 ? 1 : 0 }} />
        </H>
      </Tarjeta>
    </div>
  );
};

// B2: radar con barrido que detecta un punto naranja
const Radar: React.FC<{ etiqueta?: string; detecta?: number }> = ({ etiqueta, detecta = 1.3 }) => {
  const s = useSeg();
  const ap = useAparece();
  const ang = (s * 140) % 360; // grados por segundo
  const R = 250;
  const punto = { a: 52, r: 0.62 }; // posición del punto naranja
  const pDet = ap(detecta, "golpe");
  const pulso = s > detecta ? ((s - detecta) * 1.4) % 1 : 0;
  const grises = [
    [200, 0.8],
    [300, 0.45],
    [140, 0.35],
    [250, 0.85],
  ];
  const px = (a: number, r: number) => [R + Math.cos(((a - 90) * Math.PI) / 180) * r * R, R + Math.sin(((a - 90) * Math.PI) / 180) * r * R];
  const [dx, dy] = px(punto.a, punto.r);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
      <svg width={R * 2 + 20} height={R * 2 + 20} viewBox={`-10 -10 ${R * 2 + 20} ${R * 2 + 20}`}>
        <circle cx={R} cy={R} r={R} fill={color.blanco} stroke={color.negro} strokeWidth={4} />
        {[0.33, 0.66].map((k) => (
          <circle key={k} cx={R} cy={R} r={R * k} fill="none" stroke={color.gris} strokeWidth={2} />
        ))}
        <line x1={0} y1={R} x2={2 * R} y2={R} stroke={color.gris} strokeWidth={2} />
        <line x1={R} y1={0} x2={R} y2={2 * R} stroke={color.gris} strokeWidth={2} />
        {/* barrido: cuña plana semitransparente (sin degradado) + línea */}
        <path
          d={`M${R} ${R} L${px(ang - 28, 1)[0]} ${px(ang - 28, 1)[1]} A${R} ${R} 0 0 1 ${px(ang, 1)[0]} ${px(ang, 1)[1]} Z`}
          fill={color.negro}
          opacity={0.08}
        />
        <line x1={R} y1={R} x2={px(ang, 1)[0]} y2={px(ang, 1)[1]} stroke={color.negro} strokeWidth={5} strokeLinecap="round" />
        {grises.map(([a, r], i) => {
          const [x, y] = px(a, r);
          return <circle key={i} cx={x} cy={y} r={10} fill={color.gris} />;
        })}
        {pulso > 0 ? <circle cx={dx} cy={dy} r={18 + pulso * 50} fill="none" stroke={color.naranja} strokeWidth={5} opacity={1 - pulso} /> : null}
        <circle cx={dx} cy={dy} r={10 + 10 * Math.min(1, pDet)} fill={pDet > 0.05 ? color.naranja : color.gris} stroke={color.negro} strokeWidth={3} />
        <circle cx={R} cy={R} r={9} fill={color.negro} />
      </svg>
      {etiqueta ? <div style={sube(ap(detecta + 0.25))}><Pildora>{etiqueta}</Pildora></div> : null}
    </div>
  );
};

// Puntitos de "escribiendo…"
const Escribiendo: React.FC = () => {
  const s = useSeg();
  return (
    <div style={{ display: "flex", gap: 10, padding: "6px 4px" }}>
      {[0, 1, 2].map((i) => (
        <div key={i} style={{ width: 16, height: 16, borderRadius: 8, background: color.gris, opacity: 0.35 + 0.65 * Math.max(0, Math.sin(s * 9 - i * 0.9)) }} />
      ))}
    </div>
  );
};

// B3: ventana de chat genérica (sin logos): campo → pregunta → respuesta
const Chat: React.FC<{ pregunta: string; respuesta: string; dTipeo: number; dPregunta: number; dRespuesta: number }> = ({ pregunta, respuesta, dTipeo, dPregunta, dRespuesta }) => {
  const s = useSeg();
  const ap = useAparece();
  const tipeado = s < dPregunta ? pregunta.slice(0, Math.max(0, Math.floor((s - dTipeo) * 22))) : "";
  const pP = ap(dPregunta);
  const pR = ap(dRespuesta);
  const pensando = s > dPregunta + 0.25 && s < dRespuesta;
  const burbuja: React.CSSProperties = { borderRadius: 30, padding: "20px 30px", fontFamily: font.texto, fontWeight: 600, fontSize: 38, lineHeight: 1.25, maxWidth: 640 };
  return (
    <Tarjeta style={{ width: 920, height: 560, padding: 0, overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <div style={{ height: 76, borderBottom: card.border, display: "flex", alignItems: "center", gap: 14, padding: "0 30px", background: color.verde }}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{ width: 20, height: 20, borderRadius: 10, border: `3px solid ${color.negro}`, background: i === 0 ? color.naranja : color.blanco }} />
        ))}
        <T size={30} style={{ marginLeft: 16, color: color.gris }}>Chat con IA</T>
      </div>
      <div style={{ flex: 1, padding: "28px 34px", display: "flex", flexDirection: "column", gap: 22 }}>
        <div style={{ alignSelf: "flex-end", ...burbuja, background: color.negro, color: color.blanco, ...sube(pP) }}>{pregunta}</div>
        {pensando ? (
          <div style={{ alignSelf: "flex-start", ...burbuja, background: color.verde, border: `3px solid ${color.negro}` }}>
            <Escribiendo />
          </div>
        ) : (
          <div style={{ alignSelf: "flex-start", ...burbuja, background: color.verde, border: `3px solid ${color.negro}`, color: color.negro, ...sube(pR) }}>{respuesta}</div>
        )}
      </div>
      <div style={{ margin: "0 30px 26px", height: 78, borderRadius: 40, border: card.border, display: "flex", alignItems: "center", padding: "0 30px", justifyContent: "space-between" }}>
        <T size={32} peso={400} style={{ color: tipeado ? color.negro : color.gris }}>{tipeado || "Escribe tu pregunta…"}</T>
        <div style={{ width: 50, height: 50, borderRadius: 25, background: color.naranja, border: `3px solid ${color.negro}` }} />
      </div>
    </Tarjeta>
  );
};

// B4: "Preguntas → respuestas" y después tú haces el trabajo
const Trabajo: React.FC<{ etiqueta: string; texto: string; dPersona: number }> = ({ etiqueta, texto, dPersona }) => {
  const s = useSeg();
  const ap = useAparece();
  const pP = ap(dPersona);
  const tareas = ["Redactar", "Revisar", "Mandar"];
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 36 }}>
      <div style={golpe(ap(0, "golpe"))}>
        <Pildora tono="negro" style={{ fontSize: 50, padding: "16px 40px" }}>{etiqueta}</Pildora>
      </div>
      <Tarjeta style={{ width: 880, display: "flex", alignItems: "center", gap: 40, ...sube(pP) }}>
        <Persona size={170} />
        <div style={{ flex: 1 }}>
          <H size={54} style={{ textAlign: "left", marginBottom: 18 }}>
            {texto}
          </H>
          {tareas.map((t, i) => {
            const prog = interpolate(s, [dPersona + 0.3 + i * 0.35, dPersona + 1.4 + i * 0.35], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            return (
              <div key={t} style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 10 }}>
                <T size={28} style={{ width: 150 }}>{t}</T>
                <div style={{ flex: 1, height: 18, borderRadius: 9, border: `3px solid ${color.negro}`, overflow: "hidden" }}>
                  <div style={{ width: `${prog * 100}%`, height: "100%", background: color.naranja }} />
                </div>
              </div>
            );
          })}
        </div>
      </Tarjeta>
    </div>
  );
};

// Píldora + título que se revela después (con golpe de zoom)
const Revela: React.FC<{ pildora: string; titulo: string; dTitulo: number; texto?: string; dTexto?: number }> = ({ pildora, titulo, dTitulo, texto, dTexto = 0.4 }) => {
  const ap = useAparece();
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 34 }}>
      <div style={sube(ap(0))}>
        <Pildora tono="negro" style={{ fontSize: 42 }}>{pildora}</Pildora>
      </div>
      {texto ? <T size={44} style={{ color: color.gris, textAlign: "center", ...sube(ap(dTexto)) }}>{texto}</T> : null}
      <Tarjeta style={{ width: 900, textAlign: "center", ...golpe(ap(dTitulo, "golpe")) }}>
        <H size={96}>
          <ConIA texto={titulo} />
        </H>
      </Tarjeta>
    </div>
  );
};

// B5 / B6: línea de tiempo con logos reales. Los puntos con índice < nuevo ya están puestos.
type Punto = { fecha: string; nombre: string; logo: string; alto?: number };
const Linea: React.FC<{ puntos: Punto[]; nuevo: number; dNuevo?: number }> = ({ puntos, nuevo, dNuevo = 0.15 }) => {
  const s = useSeg();
  const ap = useAparece();
  const largo = interpolate(s, [0, 0.6], [nuevo === 0 ? 0.1 : 0.5, nuevo === 0 ? 0.5 : 1], { extrapolateRight: "clamp", easing: theme.ease.out });
  const xs = [230, 730];
  return (
    <div style={{ position: "relative", width: 960, height: 600 }}>
      {/* eje */}
      <div style={{ position: "absolute", left: 40, top: 430, width: 880, height: 8, borderRadius: 4, background: color.gris, opacity: 0.35 }} />
      <div style={{ position: "absolute", left: 40, top: 430, width: 880 * largo, height: 8, borderRadius: 4, background: color.negro }} />
      {puntos.map((pt, i) => {
        const p = i < nuevo ? 1 : ap(dNuevo + (i - nuevo) * 0.3, "golpe");
        const pc = i < nuevo ? 1 : ap(dNuevo + 0.25 + (i - nuevo) * 0.3);
        const activo = i === puntos.length - 1 || i >= nuevo;
        return (
          <React.Fragment key={i}>
            <div
              style={{
                position: "absolute",
                left: xs[i] - 26,
                top: 408,
                width: 52,
                height: 52,
                borderRadius: 26,
                background: activo ? color.naranja : color.blanco,
                border: `5px solid ${color.negro}`,
                boxSizing: "border-box",
                transform: `scale(${Math.min(1.2, p)})`,
              }}
            />
            <div style={{ position: "absolute", left: xs[i] - 200, width: 400, top: 480, textAlign: "center", ...sube(pc, 20) }}>
              <Pildora tono={activo ? "naranja" : "negro"} style={{ fontSize: 34 }}>{pt.fecha}</Pildora>
            </div>
            <div style={{ position: "absolute", left: xs[i] - 220, width: 440, top: 40, display: "flex", justifyContent: "center", ...sube(pc, 30), opacity: Math.min(1, pc) * (activo ? 1 : 0.6) }}>
              <Tarjeta style={{ width: 440, height: 320, padding: 26, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 18 }}>
                <Img src={staticFile(pt.logo)} style={{ maxWidth: 380, maxHeight: pt.alto ?? 200, objectFit: "contain" }} />
              </Tarjeta>
            </div>
            <div style={{ position: "absolute", left: xs[i] - 3, top: 360, width: 6, height: 48, background: color.negro, opacity: Math.min(1, pc) }} />
          </React.Fragment>
        );
      })}
    </div>
  );
};

// B7: captura real (titular) con traducción en píldora
const Captura: React.FC<{ src: string; traduccion?: string; dTrad?: number }> = ({ src, traduccion, dTrad = 0.8 }) => {
  const s = useSeg();
  const ap = useAparece();
  const z = interpolate(s, [0, 3], [1, 1.05], { extrapolateRight: "clamp", easing: theme.ease.inOut });
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 26 }}>
      <div style={{ width: 920, height: 408, borderRadius: card.radius, border: card.border, overflow: "hidden", background: color.blanco }}>
        <Img src={staticFile(src)} style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${z})` }} />
      </div>
      {traduccion ? (
        <div style={sube(ap(dTrad))}>
          <Pildora tono="negro" style={{ fontSize: 36 }}>{traduccion}</Pildora>
        </div>
      ) : null}
    </div>
  );
};

// B8: tres íconos que se encienden en orden (correo · calendario · tareas)
const Iconos: React.FC<{ enciende: (number | null)[]; etiqueta: string; textos?: string[] }> = ({ enciende, etiqueta, textos = ["Correo", "Calendario", "Tareas"] }) => {
  const ap = useAparece();
  const Comps = [IconoCorreo, IconoCalendario, IconoTareas];
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 40 }}>
      <div style={{ display: "flex", gap: 36 }}>
        {Comps.map((C, i) => {
          const d = enciende[i];
          const on = d === null ? 0 : ap(d, "golpe");
          return (
            <Tarjeta
              key={i}
              fondo={on > 0.5 ? color.blanco : color.verde}
              style={{ width: 270, height: 300, padding: 20, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, opacity: d === null ? 0.45 : 0.55 + 0.45 * Math.min(1, on), transform: `scale(${1 + 0.07 * Math.sin(Math.min(1, on) * Math.PI)})`, borderColor: color.negro }}
            >
              <C size={150} on={on} />
              <T size={34} style={{ color: on > 0.5 ? color.negro : color.gris }}>{textos[i]}</T>
            </Tarjeta>
          );
        })}
      </div>
      <div style={golpe(ap(0.2, "golpe"))}>
        <Pildora style={{ fontSize: 46, padding: "14px 40px" }}>{etiqueta}</Pildora>
      </div>
    </div>
  );
};

// B9: calendario + aviso "necesita tu atención"
const Aviso: React.FC<{ etiqueta: string; aviso: string; dAviso: number }> = ({ etiqueta, aviso, dAviso }) => {
  const s = useSeg();
  const ap = useAparece();
  const pA = ap(dAviso, "golpe");
  const vib = s > dAviso && s < dAviso + 0.5 ? Math.sin(s * 70) * 4 : 0;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 30 }}>
      <div style={{ position: "relative", width: 900, height: 420, display: "flex", justifyContent: "center", alignItems: "center" }}>
        <Tarjeta style={{ width: 420, height: 400, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", ...sube(ap(0)) }}>
          <IconoCalendario size={240} on={1} />
        </Tarjeta>
        <div style={{ position: "absolute", right: 0, top: 30, transform: `translateX(${interpolate(pA, [0, 1], [80, 0]) + vib}px)`, opacity: Math.min(1, pA) }}>
          <Tarjeta style={{ width: 420, padding: "24px 28px", display: "flex", alignItems: "center", gap: 18 }}>
            <div style={{ width: 56, height: 56, borderRadius: 28, background: color.naranja, border: `3px solid ${color.negro}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: font.titulo, fontWeight: 700, fontSize: 38, color: color.blanco, flexShrink: 0 }}>!</div>
            <T size={34}>{aviso}</T>
          </Tarjeta>
        </div>
      </div>
      <div style={golpe(ap(0.15, "golpe"))}>
        <Pildora style={{ fontSize: 46, padding: "14px 40px" }}>{etiqueta}</Pildora>
      </div>
    </div>
  );
};

// B10: computadora en una nube con tareas que se palomean + "aunque tú no estés"
const Nube: React.FC<{ tareas: string[]; cada: number; dEtiqueta: number; etiqueta: string; dNube?: number }> = ({ tareas, cada, dEtiqueta, etiqueta, dNube = 0 }) => {
  const ap = useAparece();
  const pN = ap(dNube);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 22 }}>
      <div style={{ position: "relative", width: 900, height: 470, ...sube(pN) }}>
        <svg width={900} height={470} viewBox="0 0 900 470" style={{ position: "absolute", inset: 0 }}>
          <path
            d="M190 440 C90 440 40 380 50 315 C60 250 120 215 185 222 C190 130 270 70 360 85 C410 30 520 25 575 85 C650 55 760 100 765 190 C840 200 870 270 860 330 C850 400 790 440 720 440 Z"
            fill={color.blanco}
            stroke={color.negro}
            strokeWidth={6}
            strokeLinejoin="round"
          />
        </svg>
        {/* computadora */}
        <div style={{ position: "absolute", left: 230, top: 150, width: 440, height: 250, borderRadius: 18, border: `5px solid ${color.negro}`, background: color.verde, padding: "18px 26px", boxSizing: "border-box" }}>
          {tareas.map((t, i) => {
            const pc = ap(dNube + 0.4 + i * cada, "rapido");
            return (
              <div key={t} style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 10 }}>
                <Check size={44} p={pc} />
                <T size={30} style={{ textDecoration: pc > 0.9 ? "line-through" : "none", color: pc > 0.9 ? color.gris : color.negro }}>{t}</T>
              </div>
            );
          })}
        </div>
        <div style={{ position: "absolute", left: 420, top: 400, width: 60, height: 22, background: color.negro, borderRadius: 4 }} />
      </div>
      <div style={golpe(ap(dEtiqueta, "golpe"))}>
        <Pildora style={{ fontSize: 50, padding: "14px 44px" }}>{etiqueta}</Pildora>
      </div>
    </div>
  );
};

// "No es para programadores": </> tachado
const NoProg: React.FC<{ titulo: string }> = ({ titulo }) => {
  const s = useSeg();
  const ap = useAparece();
  const tacha = interpolate(s, [0.35, 0.65], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: theme.ease.out });
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 34 }}>
      <Tarjeta style={{ width: 420, height: 280, position: "relative", display: "flex", alignItems: "center", justifyContent: "center", ...sube(ap(0)) }}>
        <div style={{ fontFamily: font.titulo, fontWeight: 700, fontSize: 150, color: color.gris }}>{"</>"}</div>
        <svg width={420} height={280} style={{ position: "absolute", inset: 0 }}>
          <line x1={60} y1={230} x2={60 + 300 * tacha} y2={230 - 180 * tacha} stroke={color.naranja} strokeWidth={18} strokeLinecap="round" />
        </svg>
      </Tarjeta>
      <H size={78} style={sube(ap(0.3))}>{titulo}</H>
    </div>
  );
};

// Celular con una app que se descarga
const Celular: React.FC<{ etiqueta: string; dEtiqueta: number }> = ({ etiqueta, dEtiqueta }) => {
  const s = useSeg();
  const ap = useAparece();
  const prog = interpolate(s, [0.4, 1.8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: theme.ease.inOut });
  const listo = ap(1.85, "golpe");
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 50 }}>
      <div style={{ width: 300, height: 560, borderRadius: 48, border: `6px solid ${color.negro}`, background: color.blanco, position: "relative", boxSizing: "border-box", ...sube(ap(0)) }}>
        <div style={{ position: "absolute", top: 18, left: 105, width: 80, height: 18, borderRadius: 9, background: color.negro }} />
        <div style={{ position: "absolute", top: 80, left: 30, right: 30, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 18 }}>
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} style={{ height: 62, borderRadius: 16, border: `3px solid ${color.negro}`, background: color.verde }} />
          ))}
        </div>
        {/* app nueva */}
        <div style={{ position: "absolute", top: 330, left: 85, width: 120, height: 120, borderRadius: 30, border: `4px solid ${color.negro}`, background: listo > 0.5 ? color.naranja : color.verde, overflow: "hidden", transform: `scale(${1 + 0.12 * Math.sin(Math.min(1, listo) * Math.PI)})` }}>
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: `${prog * 100}%`, background: color.naranja }} />
          <svg width={112} height={112} viewBox="0 0 112 112" style={{ position: "absolute", inset: 0 }}>
            {listo > 0.5 ? (
              <path d="M34 58 L50 74 L80 40" fill="none" stroke={color.blanco} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" />
            ) : (
              <path d="M56 30 V74 M38 58 L56 76 L74 58" fill="none" stroke={color.negro} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" />
            )}
          </svg>
        </div>
      </div>
      <div style={{ width: 460, ...sube(ap(dEtiqueta)) }}>
        <H size={70} style={{ textAlign: "left" }}>
          Apps que <span style={{ color: color.naranja }}>bajas</span> {etiqueta}
        </H>
      </div>
    </div>
  );
};

// B12: dos columnas, Asistente contra Chat
type Col = { titulo: string; flecha: string; d: number; dFlecha: number; destaca?: boolean };
const Columnas: React.FC<{ arriba?: string; cols: Col[]; dDestaca?: number }> = ({ arriba, cols, dDestaca }) => {
  const ap = useAparece();
  const pD = dDestaca !== undefined ? ap(dDestaca, "golpe") : 0;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 28 }}>
      {arriba ? <div style={sube(ap(0))}><Pildora tono="negro" style={{ fontSize: 40 }}>{arriba}</Pildora></div> : null}
      <div style={{ display: "flex", gap: 30, alignItems: "stretch" }}>
        {cols.map((c, i) => {
          const p = ap(c.d);
          const pf = ap(c.dFlecha);
          const d = c.destaca ? pD : 0;
          return (
            <Tarjeta
              key={i}
              fondo={c.destaca && d > 0.5 ? color.naranja : color.blanco}
              style={{ width: 440, minHeight: 400, padding: "40px 34px", display: "flex", flexDirection: "column", alignItems: "center", gap: 22, textAlign: "center", ...sube(p), transform: `${sube(p).transform} scale(${1 + 0.06 * Math.sin(Math.min(1, d) * Math.PI)})` }}
            >
              <H size={66} style={{ color: c.destaca && d > 0.5 ? color.blanco : color.negro }}>{c.titulo}</H>
              <H size={70} style={{ color: c.destaca && d > 0.5 ? color.blanco : color.naranja, ...sube(pf, 16) }}>↓</H>
              <T size={42} style={{ textAlign: "center", color: c.destaca && d > 0.5 ? color.blanco : color.negro, ...sube(pf, 16) }}>{c.flecha}</T>
            </Tarjeta>
          );
        })}
      </div>
    </div>
  );
};

export const ESCENAS: Record<string, React.FC<any>> = {
  tipeo: Tipeo,
  radar: Radar,
  chat: Chat,
  trabajo: Trabajo,
  revela: Revela,
  linea: Linea,
  captura: Captura,
  iconos: Iconos,
  aviso: Aviso,
  nube: Nube,
  noprog: NoProg,
  celular: Celular,
  columnas: Columnas,
};

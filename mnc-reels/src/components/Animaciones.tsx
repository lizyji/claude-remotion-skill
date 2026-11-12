// Animaciones genéricas extra (íconos de línea negra con acentos naranja, colores planos MNC).
// Todas viven dentro de un <Sequence>: frame 0 = inicio del B-roll.
import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../theme";
import { Check, Pildora, Tarjeta } from "./Base";

const { color, font } = theme;
const N = color.negro;
const O = color.naranja;

const useResorte = (desdeSeg: number, preset: keyof typeof theme.spring = "suave") => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - Math.round(desdeSeg * fps), fps, config: theme.spring[preset] });
};

const aparece = (p: number, dy = 30): React.CSSProperties => ({
  opacity: Math.min(1, p),
  transform: `translateY(${interpolate(p, [0, 1], [dy, 0])}px) scale(${interpolate(p, [0, 1], [0.9, 1])})`,
});

// Pinta en naranja las palabras de `naranja` (comparación sin acentos ni signos)
const limpia = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]/g, "");
export const Resalta: React.FC<{ texto: string; naranja?: string[] }> = ({ texto, naranja = [] }) => {
  const set = new Set(naranja.map(limpia));
  return (
    <>
      {texto.split(" ").map((w, i) => (
        <React.Fragment key={i}>
          <span style={{ color: set.has(limpia(w)) || limpia(w) === "ia" ? O : undefined }}>{w}</span>
          {i < texto.split(" ").length - 1 ? " " : ""}
        </React.Fragment>
      ))}
    </>
  );
};

// ---------- Íconos (líneas negras, acentos naranja) ----------
export const IconoSobre: React.FC<{ size?: number }> = ({ size = 150 }) => (
  <svg width={size} height={size * 0.75} viewBox="0 0 120 90">
    <rect x="5" y="8" width="110" height="74" rx="10" fill={color.blanco} stroke={N} strokeWidth="5" />
    <path d="M8 14 L60 52 L112 14" fill="none" stroke={O} strokeWidth="6" strokeLinejoin="round" strokeLinecap="round" />
  </svg>
);
export const IconoTarjeta: React.FC<{ size?: number }> = ({ size = 150 }) => (
  <svg width={size} height={size * 0.75} viewBox="0 0 120 90">
    <rect x="5" y="8" width="110" height="74" rx="10" fill={color.blanco} stroke={N} strokeWidth="5" />
    <rect x="5" y="24" width="110" height="14" fill={N} />
    <rect x="18" y="54" width="26" height="14" rx="3" fill={O} />
    <path d="M56 62 H98" stroke={N} strokeWidth="5" strokeLinecap="round" />
  </svg>
);
export const IconoCarrito: React.FC<{ size?: number }> = ({ size = 170 }) => (
  <svg width={size} height={size} viewBox="0 0 120 120">
    <path d="M8 22 H26 L40 80 H96 L108 38 H32" fill="none" stroke={N} strokeWidth="6" strokeLinejoin="round" strokeLinecap="round" />
    <circle cx="46" cy="98" r="8" fill={O} stroke={N} strokeWidth="4" />
    <circle cx="88" cy="98" r="8" fill={O} stroke={N} strokeWidth="4" />
  </svg>
);
export const IconoEscudo: React.FC<{ size?: number; check?: number }> = ({ size = 150, check = 0 }) => (
  <svg width={size} height={size} viewBox="0 0 120 120">
    <path d="M60 8 L104 24 V58 C104 86 84 104 60 112 C36 104 16 86 16 58 V24 Z" fill={color.blanco} stroke={N} strokeWidth="6" strokeLinejoin="round" />
    <path
      d="M38 60 L54 76 L84 44"
      fill="none"
      stroke={O}
      strokeWidth="9"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray="70"
      strokeDashoffset={70 * (1 - check)}
    />
  </svg>
);
export const IconoAgente: React.FC<{ size?: number }> = ({ size = 150 }) => (
  // "Agente" como chispa/destello simple (no robot ni personaje)
  <svg width={size} height={size} viewBox="0 0 120 120">
    <rect x="8" y="8" width="104" height="104" rx="24" fill={color.blanco} stroke={N} strokeWidth="6" />
    <path d="M60 26 L68 52 L94 60 L68 68 L60 94 L52 68 L26 60 L52 52 Z" fill={O} stroke={N} strokeWidth="4" strokeLinejoin="round" />
  </svg>
);
export const IconoMundo: React.FC<{ size?: number }> = ({ size = 150 }) => (
  <svg width={size} height={size} viewBox="0 0 120 120">
    <circle cx="60" cy="60" r="50" fill={color.blanco} stroke={N} strokeWidth="6" />
    <ellipse cx="60" cy="60" rx="22" ry="50" fill="none" stroke={N} strokeWidth="5" />
    <path d="M12 60 H108 M20 36 H100 M20 84 H100" stroke={N} strokeWidth="5" />
  </svg>
);

// ---------- B3 · pregunta con íconos ----------
export const Pregunta: React.FC<{ items: { icono: "sobre" | "tarjeta"; texto: string }[]; cada?: number; tiempos?: number[] }> = ({ items, cada = 1.4, tiempos }) => {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 36, width: 920 }}>
      {items.map((it, i) => {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const p = useResorte(tiempos?.[i] ?? 0.15 + i * cada, "golpe");
        return (
          <Tarjeta key={i} style={{ display: "flex", alignItems: "center", gap: 40, padding: "36px 44px", ...aparece(p, 40) }}>
            {it.icono === "sobre" ? <IconoSobre size={170} /> : <IconoTarjeta size={170} />}
            <div style={{ fontFamily: font.titulo, fontWeight: 700, fontSize: 70, color: N, lineHeight: 1.1 }}>
              <Resalta texto={it.texto} naranja={["correo?", "tarjeta?"]} />
            </div>
          </Tarjeta>
        );
      })}
    </div>
  );
};

// ---------- B4 · correo con error + carrito "No autorizado" (ejemplo ilustrativo, sin marcas) ----------
export const CorreoCarrito: React.FC<{ carritoEn?: number }> = ({ carritoEn = 1.9 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const pc = useResorte(0.05);
  const subraya = interpolate(t, [0.6, 1.1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: theme.ease.out });
  const envio = interpolate(t, [1.2, 1.7], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: theme.ease.inOut });
  const pk = useResorte(carritoEn);
  const sello = useResorte(carritoEn + 0.5, "golpe");
  const linea = (w: number) => <div style={{ height: 14, width: w, background: color.verde, borderRadius: 7, margin: "12px 0" }} />;
  return (
    <div style={{ position: "relative", width: 960, height: 600 }}>
      {/* Correo */}
      <div style={{ position: "absolute", left: 0, top: 30, ...aparece(pc) }}>
        <Tarjeta style={{ width: 560, padding: "30px 34px", transform: `translateX(${envio * 18}px) rotate(${envio * -1.5}deg)` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 14 }}>
            <IconoSobre size={64} />
            <div style={{ fontFamily: font.texto, fontWeight: 600, fontSize: 34, color: N }}>
              Para: <Pildora tono="negro" style={{ fontSize: 28, padding: "6px 20px" }}>Cliente</Pildora>
            </div>
          </div>
          <div style={{ fontFamily: font.texto, fontSize: 30, color: color.gris }}>Asunto: Tu cotización</div>
          {linea(470)}
          <div style={{ fontFamily: font.texto, fontWeight: 600, fontSize: 34, color: N, position: "relative", display: "inline-block", margin: "8px 0" }}>
            Total: $1,500
            <div style={{ position: "absolute", left: 0, bottom: -6, height: 8, width: `${subraya * 100}%`, background: O, borderRadius: 4 }} />
          </div>
          <div style={{ fontFamily: font.texto, fontWeight: 600, fontSize: 26, color: O, opacity: subraya }}>Error: eran $15,000</div>
          {linea(400)}
          <div style={{ marginTop: 10, opacity: envio }}>
            <Pildora style={{ fontSize: 26, padding: "6px 20px" }}>Enviado ✕</Pildora>
          </div>
        </Tarjeta>
      </div>
      {/* Carrito */}
      <div style={{ position: "absolute", right: 0, top: 200, ...aparece(pk) }}>
        <Tarjeta style={{ width: 380, padding: "30px 20px", display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
          <IconoCarrito size={190} />
          <div
            style={{
              marginTop: 10,
              border: `5px solid ${O}`,
              color: O,
              fontFamily: font.titulo,
              fontWeight: 700,
              fontSize: 40,
              padding: "6px 20px",
              borderRadius: 12,
              background: color.blanco,
              transform: `rotate(-8deg) scale(${interpolate(sello, [0, 1], [1.8, 1])})`,
              opacity: Math.min(1, sello * 1.4),
            }}
          >
            No autorizado
          </div>
        </Tarjeta>
      </div>
    </div>
  );
};

// ---------- B6–B8 · reglas ----------
export const Regla: React.FC<{ n: number; titulo: string; extra: "permiso" | "accesos" | "historial" }> = ({ n, titulo, extra }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const pt = useResorte(0.05);
  const px = useResorte(0.7);
  let cuerpo: React.ReactNode = null;
  if (extra === "permiso") {
    const sel = interpolate(t, [1.8, 2.1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    cuerpo = (
      <div style={{ display: "flex", alignItems: "center", gap: 26, ...aparece(px) }}>
        <div style={{ fontFamily: font.texto, fontWeight: 600, fontSize: 40, color: N }}>¿Lo mando?</div>
        <span style={{ fontFamily: font.texto, fontWeight: 600, fontSize: 36, padding: "10px 34px", borderRadius: 999, border: `3px solid ${N}`, background: sel > 0.5 ? O : color.blanco, color: sel > 0.5 ? color.blanco : N, transform: `scale(${1 + 0.1 * Math.sin(sel * Math.PI)})` }}>
          Sí
        </span>
        <span style={{ fontFamily: font.texto, fontWeight: 600, fontSize: 36, padding: "10px 34px", borderRadius: 999, border: `3px solid ${N}`, color: N }}>No</span>
      </div>
    );
  } else if (extra === "accesos") {
    const on = interpolate(t, [1.9, 2.2], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const fila = (txt: string, v: number) => (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: 560, margin: "12px 0" }}>
        <span style={{ fontFamily: font.texto, fontWeight: 600, fontSize: 42, color: N }}>{txt}</span>
        <div style={{ width: 110, height: 58, borderRadius: 29, border: `3px solid ${N}`, background: v > 0.5 ? O : color.verde, position: "relative" }}>
          <div style={{ position: "absolute", top: 6, left: 6 + v * 52, width: 40, height: 40, borderRadius: 20, background: color.blanco, border: `3px solid ${N}`, boxSizing: "border-box" }} />
        </div>
      </div>
    );
    cuerpo = (
      <div style={aparece(px)}>
        {fila("Leer", 1)}
        {fila("Mandar", 0)}
        <div style={{ fontFamily: font.texto, fontSize: 30, color: color.gris, opacity: on }}>Tú eliges</div>
      </div>
    );
  } else {
    const entradas = ["Leyó 12 correos", "Escribió un borrador", "Siguiente: pedir tu OK"];
    cuerpo = (
      <div style={{ width: 640 }}>
        {entradas.map((e, i) => {
          const p = spring({ frame: frame - Math.round((0.8 + i * 0.75) * fps), fps, config: theme.spring.suave });
          const futuro = i === entradas.length - 1;
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 18, margin: "12px 0", ...aparece(p, 20) }}>
              {futuro ? (
                <div style={{ width: 46, height: 46, borderRadius: 23, border: `4px dashed ${O}`, boxSizing: "border-box", flexShrink: 0 }} />
              ) : (
                <Check size={46} p={p} />
              )}
              <span style={{ fontFamily: font.texto, fontWeight: 600, fontSize: 38, color: futuro ? color.gris : N }}>{e}</span>
            </div>
          );
        })}
      </div>
    );
  }
  return (
    <Tarjeta style={{ width: 940, padding: "44px 50px", ...aparece(pt, 0) }}>
      <Pildora style={{ marginBottom: 22 }}>Regla {n}</Pildora>
      <div style={{ fontFamily: font.titulo, fontWeight: 700, fontSize: 60, lineHeight: 1.12, color: N, marginBottom: 26 }}>{titulo}</div>
      {cuerpo}
    </Tarjeta>
  );
};

// ---------- B9–B10 · diagrama Agente → Vigilante → Internet ----------
// alto (seg): cuándo el punto llega al vigilante y se frena; aprueba (seg): cuándo sale la palomita.
export const Diagrama: React.FC<{ alto?: number; aprueba?: number }> = ({ alto = 2.6, aprueba = 5.2 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const nodos = [
    { x: 150, txt: "Agente", ico: <IconoAgente size={150} /> },
    { x: 480, txt: "Vigilante", ico: null },
    { x: 810, txt: "Internet", ico: <IconoMundo size={150} /> },
  ];
  const pn = nodos.map((_, i) => spring({ frame: frame - Math.round((0.1 + i * 0.45) * fps), fps, config: theme.spring.golpe }));
  const f1 = interpolate(t, [1.3, 1.8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const f2 = interpolate(t, [1.6, 2.1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  // Punto viajero: agente → vigilante (se frena), espera aprobación, sigue a internet
  const x1 = interpolate(t, [alto - 0.7, alto], [240, 385], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: theme.ease.out });
  const x2 = interpolate(t, [aprueba + 0.3, aprueba + 0.9], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: theme.ease.inOut });
  const px = x2 > 0 ? interpolate(x2, [0, 1], [575, 720]) : x1;
  const punto = t > alto - 0.7 && t < aprueba + 1.0;
  const temblor = t > alto && t < aprueba ? Math.sin(frame * 1.3) * 3 : 0;
  const preg = spring({ frame: frame - Math.round((alto + 0.2) * fps), fps, config: theme.spring.golpe });
  const chk = interpolate(t, [aprueba, aprueba + 0.35], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const y = 300;
  const flecha = (a: number, b: number, p: number) => (
    <g>
      <line x1={a} y1={y} x2={a + (b - a) * p} y2={y} stroke={N} strokeWidth="6" strokeLinecap="round" />
      {p > 0.95 ? <path d={`M${b - 16} ${y - 14} L${b} ${y} L${b - 16} ${y + 14}`} fill="none" stroke={N} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" /> : null}
    </g>
  );
  return (
    <div style={{ position: "relative", width: 960, height: 600 }}>
      <svg width={960} height={600} style={{ position: "absolute", inset: 0 }}>
        {flecha(240, 385, f1)}
        {flecha(575, 720, f2)}
        {punto ? <circle cx={px + temblor} cy={y} r={16} fill={O} stroke={N} strokeWidth="4" /> : null}
      </svg>
      {nodos.map((nd, i) => (
        <div key={i} style={{ position: "absolute", left: nd.x - 110, top: y - 90, width: 220, display: "flex", flexDirection: "column", alignItems: "center", ...aparece(pn[i], 30) }}>
          {i === 1 ? <IconoEscudo size={180} check={chk} /> : nd.ico}
          <div style={{ marginTop: 14, fontFamily: font.texto, fontWeight: 600, fontSize: 38, color: N }}>{nd.txt}</div>
        </div>
      ))}
      {/* "¿Aprobado?" sobre el vigilante */}
      <div style={{ position: "absolute", left: 480 - 170, top: 70, width: 340, display: "flex", justifyContent: "center", opacity: Math.min(1, preg * 1.4), transform: `scale(${interpolate(preg, [0, 1], [0.6, 1])})` }}>
        <span style={{ fontFamily: font.titulo, fontWeight: 700, fontSize: 48, background: chk > 0.5 ? O : N, color: color.blanco, padding: "10px 30px", borderRadius: 999 }}>
          {chk > 0.5 ? "Aprobado" : "¿Aprobado?"}
        </span>
      </div>
    </div>
  );
};

// ---------- B11 / B14 · texto grande ----------
export const TextoGrande: React.FC<{ lineas: string[]; naranja?: string[]; cada?: number; size?: number }> = ({ lineas, naranja, cada = 0.9, size = 96 }) => {
  return (
    <div style={{ width: 960, textAlign: "center" }}>
      {lineas.map((l, i) => {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const p = useResorte(0.05 + i * cada, "golpe");
        return (
          <div
            key={i}
            style={{
              fontFamily: font.titulo,
              fontWeight: 700,
              fontSize: size,
              lineHeight: 1.1,
              color: N,
              margin: "10px 0",
              opacity: Math.min(1, p * 1.3),
              transform: `scale(${interpolate(p, [0, 1], [1.25, 1])})`,
            }}
          >
            <Resalta texto={l} naranja={naranja} />
          </div>
        );
      })}
    </div>
  );
};

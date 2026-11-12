import React from "react";
import { Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../theme";
import type { BRoll } from "../reel/types";
import { Ico } from "./Iconos";
import { ConIA, Pildora, Tarjeta } from "./Base";

const { color, font, card } = theme;

// Progreso (0→1) de un elemento que entra en "en" segundos desde el inicio del clip
const useEn = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (en: number, preset: keyof typeof theme.spring = "suave") =>
    spring({ frame: frame - Math.round(en * fps), fps, config: theme.spring[preset] });
};

// Entrada estándar de un elemento: opacidad + subida + escala
const pop = (p: number, dy = 30): React.CSSProperties => ({
  opacity: Math.min(1, p * 1.4),
  transform: `translateY(${interpolate(p, [0, 1], [dy, 0])}px) scale(${interpolate(p, [0, 1], [0.85, 1])})`,
});

const Texto: React.FC<{ children: React.ReactNode; size?: number; peso?: number; style?: React.CSSProperties }> = ({
  children,
  size = 44,
  peso = 600,
  style,
}) => <span style={{ fontFamily: font.texto, fontWeight: peso, fontSize: size, color: color.negro, lineHeight: 1.15, ...style }}>{children}</span>;

const Titulo: React.FC<{ children: React.ReactNode; size?: number; style?: React.CSSProperties }> = ({ children, size = 54, style }) => (
  <div style={{ fontFamily: font.titulo, fontWeight: 700, fontSize: size, lineHeight: 1.1, color: color.negro, ...style }}>{children}</div>
);

const Circulo: React.FC<{ children: React.ReactNode; size: number; fondo?: string; style?: React.CSSProperties }> = ({ children, size, fondo = color.blanco, style }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: "50%",
      background: fondo,
      border: card.border,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      boxSizing: "border-box",
      ...style,
    }}
  >
    {children}
  </div>
);

// B4 · Íconos que se conectan a un punto central
const Conectar: React.FC<{ b: Extract<BRoll, { tipo: "conectar" }> }> = ({ b }) => {
  const en = useEn();
  const frame = useCurrentFrame();
  const W = 960;
  const H = 600;
  const hub = { x: W / 2, y: 330 };
  const pos = [
    { x: 150, y: 150 },
    { x: W / 2, y: 70 },
    { x: W - 150, y: 150 },
  ];
  const pHub = en(0, "golpe");
  const pFinal = b.final ? en(b.final.en, "golpe") : 0;
  return (
    <div style={{ position: "relative", width: W, height: H }}>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        {b.items.map((it, i) => {
          const p = en(it.en + 0.15);
          const { x, y } = pos[i];
          const len = Math.hypot(hub.x - x, hub.y - y);
          // punto naranja que viaja hacia el centro una vez conectado
          const viaje = ((frame / 30 - it.en - 0.5) % 1.2) / 1.2;
          const vis = frame / 30 > it.en + 0.5;
          return (
            <g key={i}>
              <line
                x1={x}
                y1={y}
                x2={hub.x}
                y2={hub.y}
                stroke={color.negro}
                strokeWidth={4}
                strokeDasharray={`${len}`}
                strokeDashoffset={len * (1 - p)}
              />
              {vis ? <circle cx={x + (hub.x - x) * viaje} cy={y + (hub.y - y) * viaje} r={9} fill={color.naranja} /> : null}
            </g>
          );
        })}
      </svg>
      {b.items.map((it, i) => {
        const p = en(it.en, "golpe");
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: pos[i].x - 110,
              top: pos[i].y - 62,
              width: 220,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              ...pop(p),
            }}
          >
            <Circulo size={124}>
              <Ico n={it.icono} size={70} />
            </Circulo>
            <Pildora tono="negro" style={{ marginTop: 10, fontSize: 30, padding: "8px 22px" }}>
              {it.texto}
            </Pildora>
          </div>
        );
      })}
      <div
        style={{
          position: "absolute",
          left: hub.x - 105,
          top: hub.y - 105,
          ...pop(pHub),
          transform: `${pop(pHub).transform} scale(${1 + 0.1 * Math.sin(Math.min(1, pFinal) * Math.PI)})`,
        }}
      >
        <Circulo size={210} style={{ borderWidth: 4, overflow: "hidden" }}>
          {b.centroImg ? <Img src={staticFile(b.centroImg)} style={{ width: 200, height: 200 }} /> : <Titulo size={40}>{b.centro}</Titulo>}
        </Circulo>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: hub.y + 120, display: "flex", justifyContent: "center", ...pop(pHub) }}>
        <Texto size={40} peso={800}>
          {b.centro}
        </Texto>
      </div>
      {b.final ? (
        <div style={{ position: "absolute", left: 0, right: 0, top: hub.y + 180, display: "flex", justifyContent: "center", ...pop(pFinal) }}>
          <Pildora style={{ fontSize: 40 }}>{b.final.texto}</Pildora>
        </div>
      ) : null}
    </div>
  );
};

// B5 · Notificación genérica (no imita la interfaz real)
const Notificacion: React.FC<{ b: Extract<BRoll, { tipo: "notificacion" }> }> = ({ b }) => {
  const en = useEn();
  const pAntes = b.antes ? en(b.antes.en) : 0;
  const pTit = en(b.tituloEn, "golpe");
  const salidaAntes = b.antes ? interpolate(pTit, [0, 1], [1, 0]) : 0;
  return (
    <div style={{ position: "relative", width: 920, height: 600, display: "flex", alignItems: "center", justifyContent: "center" }}>
      {b.antes ? (
        <div style={{ position: "absolute", display: "flex", flexDirection: "column", alignItems: "center", gap: 20, opacity: Math.min(pAntes, salidaAntes), transform: `scale(${interpolate(pAntes, [0, 1], [0.8, 1])})` }}>
          <Ico n={b.antes.icono} size={170} />
          <Titulo size={64}>{b.antes.texto}</Titulo>
        </div>
      ) : null}
      <Tarjeta style={{ width: 900, padding: "36px 44px", ...pop(pTit, 60) }}>
        <div style={{ display: "flex", alignItems: "center", gap: 22, marginBottom: 18 }}>
          <Ico n="campana" size={68} />
          <Titulo size={50} style={{ flex: 1 }}>
            {b.titulo}
          </Titulo>
          <Pildora style={{ fontSize: 28, padding: "8px 20px" }}>Hoy</Pildora>
        </div>
        {b.items.map((it, i) => {
          const p = en(it.en, "golpe");
          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 22,
                padding: "14px 0",
                borderTop: `2px solid ${color.verde}`,
                ...pop(p, 20),
                transform: `translateX(${interpolate(p, [0, 1], [50, 0])}px)`,
              }}
            >
              <div style={{ width: 16, height: 16, borderRadius: 8, background: color.naranja }} />
              <Ico n={it.icono} size={54} />
              <Texto size={44}>{it.texto}</Texto>
            </div>
          );
        })}
      </Tarjeta>
    </div>
  );
};

// B6 · Le pides algo, te vas a tu junta y la barra de progreso sigue avanzando
const Junta: React.FC<{ b: Extract<BRoll, { tipo: "junta" }> }> = ({ b }) => {
  const en = useEn();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const dur = b.end - b.start;
  const pPedido = en(0.05, "golpe");
  const pSalida = en(b.salidaEn, "golpe");
  const avance = interpolate(frame / fps, [0.3, dur], [0.08, 0.78], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const camina = interpolate(frame / fps, [b.salidaEn, dur], [0, 150], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: theme.ease.out });
  return (
    <div style={{ width: 920, display: "flex", flexDirection: "column", gap: 28, alignItems: "stretch" }}>
      <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
        <div style={{ ...pop(pPedido), alignSelf: "flex-start" }}>
          <div
            style={{
              background: color.negro,
              color: color.blanco,
              fontFamily: font.texto,
              fontWeight: 600,
              fontSize: 42,
              padding: "22px 34px",
              borderRadius: "34px 34px 34px 8px",
            }}
          >
            {b.pedido}
          </div>
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ display: "flex", alignItems: "center", gap: 14, ...pop(pSalida) }}>
          <div style={{ transform: `translateX(${camina * 0.4}px)`, display: "flex", alignItems: "center", gap: 10 }}>
            <Ico n="persona" size={86} />
            <Texto size={60} peso={800} style={{ color: color.naranja }}>
              →
            </Texto>
            <Ico n="junta" size={86} />
          </div>
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", ...pop(pSalida) }}>
        <Pildora tono="negro">{b.salida}</Pildora>
      </div>
      <Tarjeta style={{ padding: "30px 40px", ...pop(pPedido, 50) }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 20 }}>
          <Ico n="compu" size={60} />
          <Texto size={42}>{b.barra}</Texto>
          <div style={{ flex: 1 }} />
          <Texto size={42} peso={800} style={{ color: color.naranja }}>
            {Math.round(avance * 100)}%
          </Texto>
        </div>
        <div style={{ height: 34, borderRadius: 17, border: card.border, background: color.verde, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${avance * 100}%`, background: color.naranja }} />
        </div>
      </Tarjeta>
    </div>
  );
};

// B7 · Computadora en la nube con tareas que se palomean
const Nube: React.FC<{ b: Extract<BRoll, { tipo: "nube" }> }> = ({ b }) => {
  const en = useEn();
  const frame = useCurrentFrame();
  const pNube = en(0, "golpe");
  const flota = 6 * Math.sin(frame / 10);
  return (
    <div style={{ width: 940, display: "flex", alignItems: "center", gap: 30 }}>
      <div style={{ position: "relative", width: 420, height: 320, ...pop(pNube), transform: `${pop(pNube).transform} translateY(${flota}px)` }}>
        <svg width={420} height={320} viewBox="0 0 420 320" style={{ position: "absolute", inset: 0 }}>
          <path
            d="M100 270 C40 270 20 220 40 180 C10 140 50 80 110 95 C120 40 190 20 235 55 C270 20 350 35 355 105 C410 115 415 200 375 230 C385 265 350 275 320 270 Z"
            fill={color.blanco}
            stroke={color.negro}
            strokeWidth={5}
            strokeLinejoin="round"
          />
        </svg>
        <div style={{ position: "absolute", left: 0, right: 0, top: 95, display: "flex", justifyContent: "center" }}>
          <Ico n="compu" size={150} />
        </div>
      </div>
      <Tarjeta style={{ flex: 1, padding: "30px 32px", ...pop(en(0.15)) }}>
        <Titulo size={40} style={{ marginBottom: 14 }}>
          {b.titulo}
        </Titulo>
        {b.items.map((it, i) => {
          const p = en(b.en[i], "golpe");
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 16, margin: "14px 0" }}>
              <div style={{ width: 52, height: 52, flexShrink: 0, position: "relative" }}>
                <div style={{ position: "absolute", inset: 0, borderRadius: 26, border: card.border, boxSizing: "border-box", background: color.blanco }} />
                <div style={{ position: "absolute", inset: 0, transform: `scale(${p})` }}>
                  <Ico n="check" size={52} />
                </div>
              </div>
              <Texto size={36} style={{ opacity: 0.5 + 0.5 * p }}>
                {it}
              </Texto>
            </div>
          );
        })}
      </Tarjeta>
    </div>
  );
};

// B8 · Cuatro acciones con candado → "Te pide permiso"
const Candados: React.FC<{ b: Extract<BRoll, { tipo: "candados" }> }> = ({ b }) => {
  const en = useEn();
  const pSello = en(b.selloEn, "golpe");
  return (
    <div style={{ position: "relative", width: 920, height: 600, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 26, width: 880, opacity: interpolate(pSello, [0, 1], [1, 0.35]) }}>
        {b.items.map((it, i) => {
          const p = en(it.en, "golpe");
          return (
            <Tarjeta key={i} style={{ padding: "30px 32px", display: "flex", alignItems: "center", gap: 22, ...pop(p) }}>
              <Ico n="candado" size={84} />
              <Titulo size={58}>{it.texto}</Titulo>
            </Tarjeta>
          );
        })}
      </div>
      <div
        style={{
          position: "absolute",
          opacity: Math.min(1, pSello * 1.5),
          transform: `scale(${interpolate(pSello, [0, 1], [1.8, 1])}) rotate(-3deg)`,
        }}
      >
        <div
          style={{
            background: color.naranja,
            color: color.blanco,
            border: `4px solid ${color.negro}`,
            borderRadius: 999,
            fontFamily: font.titulo,
            fontWeight: 700,
            fontSize: 82,
            padding: "22px 60px",
            whiteSpace: "nowrap",
          }}
        >
          {b.sello}
        </div>
      </div>
    </div>
  );
};

// La lección: lo que NO (tachado) vs lo que SÍ (palomita naranja)
const Contraste: React.FC<{ b: Extract<BRoll, { tipo: "contraste" }> }> = ({ b }) => {
  const en = useEn();
  const pNo = en(b.noEn, "golpe");
  const pTacha = en(b.noEn + 0.35);
  const pSi = en(b.siEn, "golpe");
  return (
    <Tarjeta style={{ width: 920, padding: "44px 52px" }}>
      {b.pildora ? <Pildora tono="negro" style={{ marginBottom: 26 }}>{b.pildora}</Pildora> : null}
      <div style={{ display: "flex", alignItems: "center", gap: 26, marginBottom: 26, ...pop(pNo) }}>
        <Circulo size={78} fondo={color.blanco}>
          <Titulo size={46} style={{ color: color.gris }}>
            ✕
          </Titulo>
        </Circulo>
        <div style={{ position: "relative" }}>
          <Titulo size={70} style={{ color: color.gris }}>
            {b.no}
          </Titulo>
          <div style={{ position: "absolute", left: 0, top: "52%", height: 7, width: `${pTacha * 100}%`, background: color.negro, borderRadius: 4 }} />
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 26, ...pop(pSi) }}>
        <Ico n="check" size={78} />
        <Titulo size={84} style={{ color: color.naranja, transform: `scale(${1 + 0.06 * Math.sin(Math.min(1, pSi) * Math.PI)})`, transformOrigin: "left center" }}>
          {b.si}
        </Titulo>
      </div>
    </Tarjeta>
  );
};

// B11 · Dos columnas: "Claude revisa" / "Tú decides"
const Columnas: React.FC<{ b: Extract<BRoll, { tipo: "columnas" }> }> = ({ b }) => {
  const en = useEn();
  const col = (c: typeof b.izq, naranja: boolean) => {
    const p = en(c.en, "golpe");
    return (
      <Tarjeta style={{ flex: 1, padding: "28px 28px", minHeight: 470, ...pop(p, 50) }}>
        <div style={{ marginBottom: 18 }}>
          <Pildora tono={naranja ? "naranja" : "negro"} style={{ fontSize: 34 }}>
            {c.titulo}
          </Pildora>
        </div>
        {c.items.map((it, i) => {
          const pi = en(it.en, "golpe");
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 16, margin: "18px 0", ...pop(pi, 16) }}>
              <Ico n={it.icono} size={60} />
              <Texto size={40}>
                <ConIA texto={it.texto} />
              </Texto>
            </div>
          );
        })}
      </Tarjeta>
    );
  };
  return (
    <div style={{ width: 940, display: "flex", gap: 24, alignItems: "stretch" }}>
      {col(b.izq, false)}
      {col(b.der, true)}
    </div>
  );
};

export const Animacion: React.FC<{ b: BRoll }> = ({ b }) => {
  switch (b.tipo) {
    case "conectar":
      return <Conectar b={b} />;
    case "notificacion":
      return <Notificacion b={b} />;
    case "junta":
      return <Junta b={b} />;
    case "nube":
      return <Nube b={b} />;
    case "candados":
      return <Candados b={b} />;
    case "contraste":
      return <Contraste b={b} />;
    case "columnas":
      return <Columnas b={b} />;
    default:
      return null;
  }
};

// Momentos en que aparece cada elemento (para los "pop" automáticos), en segundos absolutos
export const momentos = (b: BRoll): number[] => {
  switch (b.tipo) {
    case "conectar":
      return [...b.items.map((i) => i.en), ...(b.final ? [b.final.en] : [])].map((x) => b.start + x);
    case "notificacion":
      return [...(b.antes ? [b.antes.en] : []), b.tituloEn, ...b.items.map((i) => i.en)].map((x) => b.start + x);
    case "junta":
      return [b.salidaEn].map((x) => b.start + x);
    case "nube":
      return b.en.map((x) => b.start + x);
    case "candados":
      return [...b.items.map((i) => i.en), b.selloEn].map((x) => b.start + x);
    case "contraste":
      return [b.noEn, b.siEn].map((x) => b.start + x);
    case "columnas":
      return [b.izq.en, ...b.izq.items.map((i) => i.en), b.der.en, ...b.der.items.map((i) => i.en)].map((x) => b.start + x);
    case "lista":
      return b.items.map((_, i) => b.start + (b.en ? b.en[i] : 0.35 + i * (b.cada ?? 1.2)));
    default:
      return [];
  }
};

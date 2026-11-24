// Reel "pedido-espera": tu pedido no tarda por el trabajo, tarda por la espera entre áreas.
// Tiempos = segundos del video recortado, empatados con las palabras de Manuel (reel.json).
import React from "react";
import { interpolate } from "remotion";
import { theme } from "../theme";
import type { AnimProps } from "./index";
import { Calendario, Caja, Comentario, Compartir, Flecha, Folder, Papeles, Pop, RelojArena, Tache, Texto, useReloj } from "./kit";
import { Pildora, Tarjeta } from "../components/Base";

const { color, font } = theme;
const W = 960;
const H = 620;
const Lienzo: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{ width: W, height: H, position: "relative", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", ...style }}>
    {children}
  </div>
);

// ───────── TOMA 1 ─────────
// B1: barra larga "Días" contra rayita naranja "Minutos"
const B1: React.FC<AnimProps> = ({ start }) => {
  const { sp, rampa } = useReloj(start);
  const largo = rampa(1.2, 2.0, theme.ease.inOut);
  const pMin = sp(2.7, "golpe");
  const fila = (label: React.ReactNode, barra: React.ReactNode, p: number) => (
    <Pop p={p} style={{ width: 900, display: "flex", flexDirection: "column", gap: 14, marginBottom: 48 }}>
      {label}
      {barra}
    </Pop>
  );
  return (
    <Lienzo>
      {fila(
        <Texto titulo size={64}>Días</Texto>,
        <div style={{ height: 96, width: 60 + 840 * largo, background: color.negro, borderRadius: 18 }} />,
        sp(0.6),
      )}
      {fila(
        <Texto titulo size={64} c={color.naranja}>Minutos</Texto>,
        <div style={{ height: 96, width: 26, background: color.naranja, border: `3px solid ${color.negro}`, borderRadius: 10, transform: `scaleY(${pMin})` }} />,
        pMin,
      )}
    </Lienzo>
  );
};

// B2: "¿Dónde se va el resto?" con signo de pregunta naranja
const B2: React.FC<AnimProps> = ({ start }) => {
  const { sp, frame } = useReloj(start);
  const q = sp(start + 0.12, "golpe");
  return (
    <Lienzo style={{ flexDirection: "row", gap: 30 }}>
      <Texto titulo size={92} style={{ width: 560, lineHeight: 1.05 }}>
        ¿Dónde se va el resto?
      </Texto>
      <div
        style={{
          fontFamily: font.titulo,
          fontWeight: 700,
          fontSize: 420,
          lineHeight: 1,
          color: color.naranja,
          transform: `scale(${interpolate(q, [0, 1], [0.3, 1])}) rotate(${interpolate(q, [0, 1], [-25, 0]) + 4 * Math.sin(frame / 7)}deg)`,
        }}
      >
        ?
      </div>
    </Lienzo>
  );
};

// ───────── TOMA 2 ─────────
// B3: "Caso de una aseguradora · años 90" con un fólder de solicitud
const B3: React.FC<AnimProps> = ({ start }) => {
  const { sp, frame } = useReloj(start);
  return (
    <Lienzo>
      <Pop p={sp(4.6, "golpe")} style={{ transform: undefined }}>
        <div style={{ transform: `translateY(${4 * Math.sin(frame / 10)}px)` }}>
          <Folder size={300} />
        </div>
      </Pop>
      <Pop p={sp(5.2)} style={{ marginTop: 26 }}>
        <Texto titulo size={68} style={{ textAlign: "center" }}>Caso de una aseguradora</Texto>
      </Pop>
      <Pop p={sp(5.6)} style={{ marginTop: 22, display: "flex", gap: 18 }}>
        <Pildora tono="negro" style={{ fontSize: 40 }}>años 90</Pildora>
        <Pildora style={{ fontSize: 40 }}>Solicitud</Pildora>
      </Pop>
    </Lienzo>
  );
};

// B4: tarjeta de cita "22 días en proceso · 17 minutos de trabajo real" + fuente
const B4: React.FC<AnimProps> = ({ start }) => {
  const { sp } = useReloj(start);
  const dato = (n: string, u: string, txt: string, p: number, naranja: boolean) => (
    <Pop p={p} style={{ display: "flex", alignItems: "baseline", gap: 18, margin: "8px 0" }}>
      <span style={{ fontFamily: font.titulo, fontWeight: 700, fontSize: 150, lineHeight: 1, color: naranja ? color.naranja : color.negro }}>{n}</span>
      <span style={{ fontFamily: font.titulo, fontWeight: 700, fontSize: 60, color: naranja ? color.naranja : color.negro }}>{u}</span>
      <span style={{ fontFamily: font.texto, fontWeight: 600, fontSize: 40, color: color.gris }}>{txt}</span>
    </Pop>
  );
  return (
    <Lienzo>
      <Tarjeta style={{ width: 920, padding: "40px 52px", position: "relative" }}>
        <div style={{ position: "absolute", top: -20, right: 40, fontFamily: font.titulo, fontWeight: 700, fontSize: 200, lineHeight: 1, color: color.naranja }}>”</div>
        <Pildora tono="negro" style={{ marginBottom: 14 }}>Harvard Business Review · 1990</Pildora>
        {dato("22", "días", "en proceso", sp(8.9, "golpe"), false)}
        {dato("17", "minutos", "de trabajo real", sp(10.6, "golpe"), true)}
        <Pop p={sp(12.1)} style={{ marginTop: 12 }}>
          <Texto size={40} c={color.gris} peso={400}>
            Lo demás: <b style={{ color: color.negro, fontWeight: 700 }}>esperar.</b>
          </Texto>
        </Pop>
      </Tarjeta>
    </Lienzo>
  );
};

// ───────── TOMA 3 ─────────
// Una estación del recorrido (caja) y la espera entre estaciones (reloj de arena)
const Estacion: React.FC<{ txt: string; p: number; activa?: boolean; w?: number }> = ({ txt, p, activa, w = 250 }) => (
  <Pop p={p}>
    <Caja fondo={activa ? color.naranja : color.blanco} style={{ width: w, height: 130, padding: "0 12px" }}>
      <Texto size={txt.length > 9 ? 36 : 42} c={activa ? color.blanco : color.negro} style={{ textAlign: "center" }}>
        {txt}
      </Texto>
    </Caja>
  </Pop>
);
const Espera: React.FC<{ p: number; t: number }> = ({ p, t }) => (
  <Pop p={p} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
    <RelojArena size={64} arena={(t * 0.6) % 1} giro={Math.floor(t * 0.6) % 2 === 0 ? 0 : 1} />
    <Flecha w={70} p={p} />
  </Pop>
);

// Pedido (hoja naranja) que viaja de caja en caja
const Pedido: React.FC<{ x: number; y: number; p: number }> = ({ x, y, p }) => (
  <div style={{ position: "absolute", left: x - 34, top: y, opacity: p, transform: `scale(${p})` }}>
    <svg width="68" height="80" viewBox="0 0 34 40">
      <path d="M3 3 L23 3 L31 11 L31 37 L3 37 Z" fill={color.naranja} stroke={color.negro} strokeWidth="2.5" strokeLinejoin="round" />
      <line x1="9" y1="18" x2="25" y2="18" stroke={color.blanco} strokeWidth="2.5" strokeLinecap="round" />
      <line x1="9" y1="26" x2="22" y2="26" stroke={color.blanco} strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  </div>
);

// B5: Ventas → Correo → Aprobación
const B5: React.FC<AnimProps> = ({ start }) => {
  const { sp, t, rampa } = useReloj(start);
  const xs = [125, 480, 835]; // centros de las 3 cajas
  const viaje = t < 16.6 ? xs[0] : t < 17.6 ? interpolate(rampa(16.6, 17.0), [0, 1], [xs[0], xs[1]]) : interpolate(rampa(17.6, 18.0), [0, 1], [xs[1], xs[2]]);
  const activa = t < 16.6 ? 0 : t < 17.6 ? 1 : 2;
  return (
    <Lienzo style={{ justifyContent: "flex-start", paddingTop: 30, boxSizing: "border-box" }}>
      <Pop p={sp(13.0)}>
        <Pildora tono="negro" style={{ fontSize: 40 }}>En una empresa tradicional</Pildora>
      </Pop>
      <div style={{ position: "relative", width: W, marginTop: 150, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Estacion txt="Ventas" p={sp(14.75)} activa={activa === 0 && t > 15.4} />
        <Espera p={sp(16.3)} t={t} />
        <Estacion txt="Correo" p={sp(16.6)} activa={activa === 1} />
        <Espera p={sp(17.3)} t={t} />
        <Estacion txt="Aprobación" p={sp(17.6)} activa={activa === 2} />
        <Pedido x={viaje} y={-110} p={sp(15.5)} />
      </div>
    </Lienzo>
  );
};

// B6: "Escritorio de fulano" (papeles + reloj de arena) → Almacén → Facturación
const B6: React.FC<AnimProps> = ({ start }) => {
  const { sp, t } = useReloj(start);
  return (
    <Lienzo>
      <Pop p={sp(18.6, "golpe")}>
        <Tarjeta style={{ width: 760, display: "flex", alignItems: "center", gap: 26, padding: "26px 36px" }}>
          <Papeles size={150} n={6} />
          <div style={{ flex: 1 }}>
            <Texto titulo size={54}>Escritorio de fulano</Texto>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 10 }}>
              <RelojArena size={54} arena={(t * 0.7) % 1} giro={Math.floor(t * 0.7) % 2} />
              <Texto size={36} c={color.naranja}>esperando…</Texto>
            </div>
          </div>
        </Tarjeta>
      </Pop>
      <div style={{ display: "flex", alignItems: "center", gap: 24, marginTop: 44 }}>
        <Estacion txt="Almacén" p={sp(19.9)} w={280} activa={t >= 19.9 && t < 20.6} />
        <Espera p={sp(20.3)} t={t} />
        <Estacion txt="Facturación" p={sp(20.6)} w={300} activa={t >= 20.6} />
      </div>
    </Lienzo>
  );
};

// B7: el mismo recorrido con tiempos: cajas cortas ("minutos") y huecos largos ("espera") en naranja
const B7: React.FC<AnimProps> = ({ start }) => {
  const { sp, rampa } = useReloj(start);
  const areas = ["V", "C", "A", "F", "Al", "Fa"];
  const crece = rampa(23.4, 24.6, theme.ease.inOut); // "lo que tarda es el pase de un área a otra"
  const gap = 18 + 112 * crece;
  const caja = 58;
  return (
    <Lienzo>
      <Pop p={sp(21.6)}>
        <Texto titulo size={58} style={{ textAlign: "center" }}>
          Cada paso: <span style={{ color: color.negro }}>minutos</span>
        </Texto>
      </Pop>
      <Pop p={sp(23.0)} style={{ marginTop: 8 }}>
        <Texto titulo size={58} style={{ textAlign: "center" }}>
          Lo que tarda: <span style={{ color: color.naranja }}>el pase</span>
        </Texto>
      </Pop>
      <div style={{ display: "flex", alignItems: "center", marginTop: 56, height: 100 }}>
        {areas.map((a, i) => (
          <React.Fragment key={i}>
            <Pop p={sp(21.8 + i * 0.12, "golpe")}>
              <div style={{ width: caja, height: 92, background: color.negro, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontFamily: font.texto, fontWeight: 600, fontSize: 24, color: color.blanco }}>{a}</span>
              </div>
            </Pop>
            {i < areas.length - 1 ? (
              <div style={{ width: gap, height: 30, margin: "0 6px", background: crece > 0.02 ? color.naranja : color.gris, borderRadius: 8, border: `2.5px solid ${color.negro}` }} />
            ) : null}
          </React.Fragment>
        ))}
      </div>
      <div style={{ display: "flex", gap: 40, marginTop: 40 }}>
        <Pop p={sp(22.2)} style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 34, height: 34, background: color.negro, borderRadius: 8 }} />
          <Texto size={38}>minutos</Texto>
        </Pop>
        <Pop p={sp(23.8)} style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 70, height: 26, background: color.naranja, borderRadius: 8, border: `2.5px solid ${color.negro}` }} />
          <Texto size={38} c={color.naranja}>espera</Texto>
        </Pop>
      </div>
    </Lienzo>
  );
};

// ───────── TOMA 4 ─────────
// Opción tachada: texto + raya + X
const Opcion: React.FC<{ txt: string; p: number; x: number; size?: number; style?: React.CSSProperties }> = ({ txt, p, x, size = 76, style }) => (
  <Pop p={p} style={{ display: "flex", alignItems: "center", gap: 28, ...style }}>
    <div style={{ position: "relative" }}>
      <Texto titulo size={size} c={x > 0.5 ? color.gris : color.negro}>{txt}</Texto>
      <div style={{ position: "absolute", left: -8, top: "54%", height: Math.max(6, size / 11), width: `${(x * 100 + 4) * (x > 0 ? 1 : 0)}%`, background: color.negro, borderRadius: 6 }} />
    </div>
    <div style={{ opacity: x > 0 ? 1 : 0 }}>
      <Tache size={size * 1.4} p={x} />
    </div>
  </Pop>
);

// B8: "Trabajar más rápido" con una X
const B8: React.FC<AnimProps> = ({ start }) => {
  const { sp, rampa } = useReloj(start);
  return (
    <Lienzo>
      <Pop p={sp(26.3)} style={{ marginBottom: 30 }}>
        <Pildora tono="negro" style={{ fontSize: 38 }}>Pedirle a tu gente…</Pildora>
      </Pop>
      <Opcion txt="Trabajar más rápido" p={sp(26.9)} x={rampa(27.85, 28.35)} size={80} />
    </Lienzo>
  );
};

// B9: "Comprar otro sistema" con X; abajo "si el pedido sigue esperando igual"
const B9: React.FC<AnimProps> = ({ start }) => {
  const { sp, rampa, t } = useReloj(start);
  return (
    <Lienzo>
      <Opcion txt="Trabajar más rápido" p={1} x={1} size={56} style={{ marginBottom: 30 }} />
      <Opcion txt="Comprar otro sistema" p={sp(28.9)} x={rampa(29.7, 30.2)} size={70} />
      <Pop p={sp(30.6)} style={{ marginTop: 46, display: "flex", alignItems: "center", gap: 16 }}>
        <RelojArena size={64} arena={(t * 0.7) % 1} giro={Math.floor(t * 0.7) % 2} />
        <Texto size={42} c={color.gris}>
          si el pedido sigue <span style={{ color: color.naranja }}>esperando igual</span>
        </Texto>
      </Pop>
    </Lienzo>
  );
};

// ───────── TOMA 5 ─────────
// B10: "1 semana" con calendario (los días se van marcando)
const B10: React.FC<AnimProps> = ({ start }) => {
  const { sp } = useReloj(start);
  const dias = ["L", "M", "M", "J", "V", "S", "D"];
  return (
    <Lienzo style={{ flexDirection: "row", gap: 46 }}>
      <Pop p={sp(32.7, "golpe")}>
        <Calendario size={260} />
      </Pop>
      <div>
        <Pop p={sp(34.0, "golpe")}>
          <div style={{ fontFamily: font.titulo, fontWeight: 700, fontSize: 130, lineHeight: 1, color: color.negro }}>
            <span style={{ color: color.naranja }}>1</span> semana
          </div>
        </Pop>
        <div style={{ display: "flex", gap: 10, marginTop: 26 }}>
          {dias.map((d, i) => {
            const p = sp(32.9 + i * 0.22, "golpe");
            return (
              <div
                key={i}
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 14,
                  border: theme.card.border,
                  background: p > 0.5 ? color.naranja : color.blanco,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: font.texto,
                  fontWeight: 600,
                  fontSize: 30,
                  color: p > 0.5 ? color.blanco : color.negro,
                  transform: `scale(${interpolate(p, [0, 1], [0.85, 1])})`,
                }}
              >
                {d}
              </div>
            );
          })}
        </div>
      </div>
    </Lienzo>
  );
};

// Tabla genérica Área · Entra · Sale (sin logo de ninguna marca). Ejemplo ilustrativo.
const FILAS = [
  ["Ventas", "Lun 9:00", "Lun 9:20"],
  ["Aprobación", "Lun 9:20", "Mié 17:40"],
  ["Almacén", "Mié 17:40", "Jue 10:15"],
  ["Facturación", "Jue 10:15", "Jue 10:30"],
];
const Tabla: React.FC<{ celda: (fila: number, col: number) => number; marca?: number }> = ({ celda, marca = 0 }) => {
  const cols = [300, 270, 270];
  const fila = (vals: string[], i: number) => {
    const head = i < 0;
    const naranja = i === 1 && marca > 0;
    return (
      <div
        key={i}
        style={{
          display: "flex",
          height: head ? 70 : 78,
          background: head ? color.negro : naranja ? `rgba(253,102,35,${marca})` : color.blanco,
          borderTop: head ? "none" : `2px solid ${color.negro}`,
        }}
      >
        {vals.map((v, c) => {
          const p = head ? 1 : celda(i, c);
          return (
            <div
              key={c}
              style={{
                width: cols[c],
                display: "flex",
                alignItems: "center",
                paddingLeft: 26,
                boxSizing: "border-box",
                borderLeft: c > 0 ? `2px solid ${head ? color.gris : color.negro}` : "none",
                fontFamily: font.texto,
                fontWeight: head || c === 0 ? 600 : 400,
                fontSize: head ? 34 : 34,
                color: head ? color.blanco : naranja && marca > 0.5 ? color.blanco : color.negro,
                opacity: Math.min(1, p * 1.5),
                transform: `translateY(${interpolate(p, [0, 1], [12, 0])}px)`,
              }}
            >
              {v}
            </div>
          );
        })}
      </div>
    );
  };
  return (
    <div style={{ width: 840, border: theme.card.border, borderRadius: 24, overflow: "hidden", background: color.blanco }}>
      {fila(["Área", "Entra", "Sale"], -1)}
      {FILAS.map((f, i) => fila(f, i))}
    </div>
  );
};

// B11: la tabla se va llenando (Entra en "entra", Sale en "sale", luego el resto)
const B11: React.FC<AnimProps> = ({ start }) => {
  const { sp } = useReloj(start);
  const tFila = [35.2, 36.7, 37.2, 37.6];
  const celda = (i: number, c: number) => (c === 0 ? sp(tFila[i]) : c === 1 ? sp(i === 0 ? 35.7 : tFila[i] + 0.15) : sp(i === 0 ? 36.4 : tFila[i] + 0.3));
  return (
    <Lienzo style={{ justifyContent: "flex-start", paddingTop: 40, boxSizing: "border-box" }}>
      <Pop p={sp(35.1)}>
        <Tabla celda={celda} />
      </Pop>
      <Pop p={sp(38.3, "golpe")} style={{ marginTop: 26 }}>
        <Pildora tono="negro" style={{ fontSize: 36 }}>Con una hoja de cálculo basta</Pildora>
      </Pop>
    </Lienzo>
  );
};

// B12: la fila se pinta naranja: "Aquí se queda parado → automatiza esto primero"
const B12: React.FC<AnimProps> = ({ start }) => {
  const { sp, rampa, t } = useReloj(start);
  const marca = rampa(40.9, 41.4);
  return (
    <Lienzo style={{ justifyContent: "flex-start", paddingTop: 40, boxSizing: "border-box" }}>
      <Tabla celda={() => 1} marca={marca} />
      <Pop p={sp(41.2, "golpe")} style={{ marginTop: 24, display: "flex", alignItems: "center", gap: 14 }}>
        <RelojArena size={58} arena={(t * 0.7) % 1} giro={Math.floor(t * 0.7) % 2} />
        <Pildora style={{ fontSize: 38 }}>Aquí se queda parado</Pildora>
      </Pop>
      <Pop p={sp(43.2, "golpe")} style={{ marginTop: 18, display: "flex", alignItems: "center", gap: 16 }}>
        <Flecha w={70} c={color.naranja} />
        <Texto titulo size={54}>
          automatiza <span style={{ color: color.naranja }}>esto primero</span>
        </Texto>
      </Pop>
    </Lienzo>
  );
};

// ───────── TOMA 6 · cierre a pantalla completa ─────────
// B13: "¿En qué tarea se te atora a ti?" fondo verde claro, texto negro + compartir naranja
const B13: React.FC<AnimProps> = ({ start }) => {
  const { sp } = useReloj(start);
  const linea = (txt: string, s: number) => (
    <Pop p={sp(s, "golpe")}>
      <div style={{ fontFamily: font.titulo, fontWeight: 700, fontSize: 124, lineHeight: 1.08, color: color.negro, textAlign: "center" }}>{txt}</div>
    </Pop>
  );
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 70px" }}>
      {linea("¿En qué tarea", start + 0.05)}
      {linea("se te atora", 44.85)}
      {linea("a ti?", 45.3)}
      <Pop p={sp(45.7)} style={{ marginTop: 60, display: "flex", alignItems: "center", gap: 18 }}>
        <Comentario size={70} />
        <Texto size={44}>Te leo en los comentarios</Texto>
      </Pop>
      <Pop p={sp(46.8, "golpe")} style={{ marginTop: 60 }}>
        <Tarjeta style={{ display: "flex", alignItems: "center", gap: 28, padding: "26px 40px", width: 880 }}>
          <Compartir size={130} />
          <Texto size={48} style={{ lineHeight: 1.2 }}>
            Mándaselo a quien <span style={{ color: color.naranja }}>lleva pedidos</span>
          </Texto>
        </Tarjeta>
      </Pop>
    </div>
  );
};

export const ANIMS_PEDIDO: Record<string, React.FC<AnimProps>> = {
  "pedido/B1": B1,
  "pedido/B2": B2,
  "pedido/B3": B3,
  "pedido/B4": B4,
  "pedido/B5": B5,
  "pedido/B6": B6,
  "pedido/B7": B7,
  "pedido/B8": B8,
  "pedido/B9": B9,
  "pedido/B10": B10,
  "pedido/B11": B11,
  "pedido/B12": B12,
};
export const GOLPES_PEDIDO: Record<string, React.FC<AnimProps>> = { "pedido/B13": B13 };

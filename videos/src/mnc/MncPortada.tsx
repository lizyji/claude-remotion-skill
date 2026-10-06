import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { mnc } from "./mncTheme";

// Reel cover (still, 1080×1920) in the MNC cover style: speaker photo full-bleed,
// three-line title on the chest — white lead, giant orange keyword, white line on
// an orange plate — soft offset shadow, brand mark top-right.
const shadow = "6px 8px 10px rgba(0,0,0,0.45)";

const Spark: React.FC<{ size: number; x: number; y: number; rot?: number }> = ({ size, x, y, rot = 0 }) => (
  <svg width={size} height={size} viewBox="-50 -50 100 100" style={{ position: "absolute", left: x, top: y, transform: `rotate(${rot}deg)`, overflow: "visible" }}>
    {[0, 60, 120].map((a) => (
      <line key={a} x1={0} y1={-44} x2={0} y2={44} stroke={mnc.colors.accent} strokeWidth={13} strokeLinecap="round" transform={`rotate(${a})`} />
    ))}
  </svg>
);

const line: React.CSSProperties = {
  fontFamily: mnc.fonts.body,
  color: mnc.colors.white,
  lineHeight: 1,
  textShadow: shadow,
  whiteSpace: "nowrap",
};

export const MncPortada: React.FC = () => (
  <AbsoluteFill style={{ background: mnc.colors.black }}>
    <Img src={staticFile("mnc/src/portada.webp")} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 30%", transform: "scale(1.14)", transformOrigin: "50% 100%" }} />
    {/* bottom darkening so the white lines hold on the grey shirt */}
    <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0) 55%, rgba(0,0,0,0.38) 100%)" }} />

    <div style={{ position: "absolute", right: 112, top: 118, display: "flex", alignItems: "baseline", gap: 6, ...line, textShadow: "0 1px 8px rgba(0,0,0,0.35)", opacity: 0.92 }}>
      <span style={{ fontSize: 44, fontWeight: mnc.weight.medium }}>manuel</span>
      <span style={{ fontSize: 19 }}>{"<no code>"}</span>
    </div>

    <Spark size={170} x={850} y={1150} rot={12} />

    <div style={{ position: "absolute", left: 0, right: 0, top: 1290, display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ ...line, fontSize: 104, fontWeight: mnc.weight.medium, letterSpacing: "-0.03em", marginLeft: -380 }}>tu</div>
      <div style={{ ...line, fontSize: 206, fontWeight: mnc.weight.medium, letterSpacing: "-0.055em", color: mnc.colors.accent, marginTop: -34 }}>dashboard</div>
      <div style={{ marginTop: -22, background: mnc.colors.accent, padding: "6px 44px 22px" }}>
        <div style={{ ...line, fontSize: 92, fontWeight: mnc.weight.medium, letterSpacing: "-0.035em" }}>está en tu WhatsApp</div>
      </div>
    </div>
  </AbsoluteFill>
);

import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { mnc } from "./mncTheme";

// MNC cover, client reference style (videos/reference/portadas/ref_klarna.png, ref_ups.png):
// big face-centred photo, the client's phrase EXACTLY as given split into blocks around the face —
// white text on a flat orange full-width band and/or giant orange text — heavy Readex Pro with a
// soft drop shadow, the brand's official logo when a company is mentioned, brand mark top-right.
const shadow = "4px 6px 12px rgba(0,0,0,0.45)";
type Block = { lines: string[]; top: number; size: number; band?: boolean };
export type PortadaV2Props = {
  photo: string;
  zoom?: number;
  focus?: [number, number]; // zoom origin in px (face centre)
  logo?: { src: string; width: number; top: number; left?: number };
  blocks: Block[];
  spark?: boolean;
};

const Lines: React.FC<{ b: Block }> = ({ b }) => (
  <div
    style={{
      position: "absolute",
      left: b.band ? 40 : 0,
      right: b.band ? 0 : 0,
      top: b.top,
      background: b.band ? mnc.colors.accent : undefined,
      padding: b.band ? "14px 24px 26px" : 0,
      textAlign: "center",
    }}
  >
    {b.lines.map((l, i) => (
      <div
        key={i}
        style={{
          fontFamily: "Readex Pro",
          fontWeight: 700,
          fontSize: b.size,
          lineHeight: 1.0,
          letterSpacing: "-0.035em",
          color: b.band ? mnc.colors.white : mnc.colors.accent,
          textShadow: shadow,
          whiteSpace: "nowrap",
        }}
      >
        {l}
      </div>
    ))}
  </div>
);

export const MncPortadaV2: React.FC<PortadaV2Props> = ({ photo, zoom = 1.2, focus = [540, 960], logo, blocks }) => (
  <AbsoluteFill style={{ background: mnc.colors.black, overflow: "hidden" }}>
    <Img src={staticFile(photo)} style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${zoom})`, transformOrigin: `${focus[0]}px ${focus[1]}px` }} />
    <div style={{ position: "absolute", right: 112, top: 118, display: "flex", alignItems: "baseline", gap: 6, fontFamily: mnc.fonts.body, color: mnc.colors.white, opacity: 0.85, textShadow: "0 1px 8px rgba(0,0,0,0.35)" }}>
      <span style={{ fontSize: 44, fontWeight: mnc.weight.medium }}>manuel</span>
      <span style={{ fontSize: 19 }}>{"<no code>"}</span>
    </div>
    {blocks.map((b, i) => (
      <Lines key={i} b={b} />
    ))}
    {logo ? (
      <div style={{ position: "absolute", left: logo.left ?? 0, right: logo.left === undefined ? 0 : undefined, top: logo.top, display: "flex", justifyContent: "center", filter: "drop-shadow(4px 6px 10px rgba(0,0,0,0.4))" }}>
        <Img src={staticFile(logo.src)} style={{ width: logo.width, display: "block" }} />
      </div>
    ) : null}
  </AbsoluteFill>
);

import React from "react";

// Line icons in the MNC style: 64×64 box, round caps, single stroke weight,
// colored by `currentColor` (orange on cards). No emoji, no third-party glyphs.
const I: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <svg
    viewBox="0 0 64 64"
    width="100%"
    height="100%"
    fill="none"
    stroke="currentColor"
    strokeWidth={4.5}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {children}
  </svg>
);

export const Icon = {
  chat: (
    <I>
      <path d="M32 9c-13 0-23 9-23 21 0 5 2 9 5 12l-3 11 12-5c3 1 6 2 9 2 13 0 23-9 23-20S45 9 32 9z" />
      <path d="M22 28h20M22 36h12" />
    </I>
  ),
  crm: (
    <I>
      <rect x="8" y="12" width="48" height="40" rx="6" />
      <path d="M8 24h48M24 24v28" />
      <circle cx="40" cy="36" r="5" />
      <path d="M32 47c1-4 4-6 8-6s7 2 8 6" />
    </I>
  ),
  database: (
    <I>
      <ellipse cx="32" cy="14" rx="20" ry="7" />
      <path d="M12 14v36c0 4 9 7 20 7s20-3 20-7V14" />
      <path d="M12 32c0 4 9 7 20 7s20-3 20-7" />
    </I>
  ),
  user: (
    <I>
      <circle cx="32" cy="22" r="10" />
      <path d="M13 54c2-11 10-17 19-17s17 6 19 17" />
    </I>
  ),
  lead: (
    <I>
      <circle cx="32" cy="22" r="10" />
      <path d="M13 54c2-11 10-17 19-17s17 6 19 17" />
      <path d="M46 10l4 4 8-8" />
    </I>
  ),
  doc: (
    <I>
      <path d="M16 6h22l12 12v40H16z" />
      <path d="M38 6v12h12M24 30h18M24 38h18M24 46h12" />
    </I>
  ),
  summary: (
    <I>
      <path d="M12 14h40M12 24h40M12 34h26" />
      <path d="M12 48h16" strokeWidth={7} />
    </I>
  ),
  pin: (
    <I>
      <path d="M32 58S14 39 14 26a18 18 0 0 1 36 0c0 13-18 32-18 32z" />
      <circle cx="32" cy="26" r="7" />
    </I>
  ),
  phone: (
    <I>
      <path d="M20 8h8l4 12-6 4c3 7 7 11 14 14l4-6 12 4v8c0 3-3 6-6 6C30 50 14 34 14 14c0-3 3-6 6-6z" />
    </I>
  ),
  idcard: (
    <I>
      <rect x="6" y="14" width="52" height="38" rx="6" />
      <circle cx="22" cy="31" r="6" />
      <path d="M13 44c1-4 5-6 9-6s8 2 9 6M38 28h12M38 36h8" />
    </I>
  ),
  globe: (
    <I>
      <circle cx="32" cy="32" r="24" />
      <path d="M8 32h48M32 8c7 7 10 15 10 24s-3 17-10 24M32 8c-7 7-10 15-10 24s3 17 10 24" />
    </I>
  ),
  mail: (
    <I>
      <rect x="6" y="14" width="52" height="36" rx="6" />
      <path d="M8 18l24 18 24-18" />
    </I>
  ),
  team: (
    <I>
      <circle cx="22" cy="24" r="8" />
      <circle cx="44" cy="22" r="7" />
      <path d="M6 52c2-9 8-14 16-14s14 5 16 14M38 36c8 0 14 4 18 12" />
    </I>
  ),
  tag: (
    <I>
      <path d="M8 30V10h20l28 28-20 20z" />
      <circle cx="20" cy="22" r="4" />
    </I>
  ),
  form: (
    <I>
      <rect x="12" y="6" width="40" height="52" rx="6" />
      <path d="M20 18h24M20 28h24M20 38h14" />
      <path d="M36 48l4 4 8-8" />
    </I>
  ),
  portal: (
    <I>
      <rect x="6" y="10" width="52" height="44" rx="6" />
      <path d="M6 22h52" />
      <circle cx="13" cy="16" r="1.5" />
      <circle cx="19" cy="16" r="1.5" />
      <path d="M16 32h14v14H16zM36 32h14M36 40h10" />
    </I>
  ),
  calculator: (
    <I>
      <rect x="14" y="6" width="36" height="52" rx="6" />
      <rect x="20" y="12" width="24" height="10" rx="2" />
      <path d="M22 32h2M31 32h2M40 32h2M22 41h2M31 41h2M40 41h2M22 50h2M31 50h2M40 50h2" />
    </I>
  ),
  chart: (
    <I>
      <path d="M8 8v48h48" />
      <path d="M16 44l11-12 9 7 16-19" />
      <path d="M44 20h8v8" />
    </I>
  ),
  check: (
    <I>
      <path d="M10 8h20v28H10zM34 28h20v28H34z" />
      <path d="M16 18h8M16 26h8M40 38h8" />
      <path d="M38 14l6 6 12-12" />
    </I>
  ),
  bell: (
    <I>
      <path d="M16 44V28a16 16 0 0 1 32 0v16l6 6H10z" />
      <path d="M26 54a6 6 0 0 0 12 0" />
    </I>
  ),
  sparkle: (
    <I>
      <path d="M32 8v48M11 20l42 24M11 44l42-24" />
    </I>
  ),
  bolt: (
    <I>
      <path d="M36 6L14 36h16l-4 22 22-30H32z" />
    </I>
  ),
  apps: (
    <I>
      <rect x="8" y="8" width="20" height="20" rx="5" />
      <rect x="36" y="8" width="20" height="20" rx="5" />
      <rect x="8" y="36" width="20" height="20" rx="5" />
      <rect x="36" y="36" width="20" height="20" rx="5" />
    </I>
  ),
  route: (
    <I>
      <circle cx="12" cy="32" r="6" />
      <circle cx="52" cy="12" r="6" />
      <circle cx="52" cy="32" r="6" />
      <circle cx="52" cy="52" r="6" />
      <path d="M18 32h28M18 32c12 0 14-20 28-20M18 32c12 0 14 20 28 20" />
    </I>
  ),
  box: (
    <I>
      <path d="M8 20l24-12 24 12v24L32 56 8 44z" />
      <path d="M8 20l24 12 24-12M32 32v24" />
    </I>
  ),
  sensor: (
    <I>
      <circle cx="32" cy="34" r="6" />
      <path d="M20 22a17 17 0 0 0 0 24M44 22a17 17 0 0 1 0 24M12 14a28 28 0 0 0 0 40M52 14a28 28 0 0 1 0 40" />
    </I>
  ),
  clock: (
    <I>
      <circle cx="32" cy="32" r="23" />
      <path d="M32 19v14l9 6" />
    </I>
  ),
  bank: (
    <I>
      <path d="M8 24 32 10l24 14H8z" />
      <path d="M14 28v18M25 28v18M39 28v18M50 28v18M8 52h48" />
    </I>
  ),
  truck: (
    <I>
      <path d="M6 16h32v28H6zM38 26h11l9 10v8H38z" />
      <circle cx="17" cy="47" r="5" />
      <circle cx="47" cy="47" r="5" />
    </I>
  ),
  grid: (
    <I>
      <rect x="8" y="10" width="48" height="44" rx="5" />
      <path d="M8 24h48M8 38h48M24 10v44M40 10v44" />
    </I>
  ),
  warehouse: (
    <I>
      <path d="M6 26 32 12l26 14v28H6z" />
      <path d="M18 54V36h28v18M18 44h28" />
    </I>
  ),
};

# Klarna reel — real captures (B1, B2, B3, B10)

Playwright scripts used to take the REAL captures in `public/mnc8/captures/` (gitignored):
run from a folder with `playwright` installed, then copy/crop the outputs as noted.

| file | source | script |
|---|---|---|
| `klarna_logo.svg` | header logo SVG of klarna.com/us (fill set to #141414) | `klarna-logo.js` |
| `b2_klarna_press.png` | klarna.com press release, 27 feb 2024 — headline + date (720 px viewport, breadcrumb cropped) | `headlines-narrow.js` |
| `b3_klarna_mx.png` | klarna.com/mx full page, top 2400 css px ("Elige pagar en 4 plazos sin intereses") | `klarna-mx-scroll.js` |
| `b10_entrepreneur.png` | entrepreneur.com, 9 may 2025 — headline, dek, byline/date | `klarna-press.js` (1280 px viewport) |
| `b10_techco.png` | tech.co, 20 may 2025 — headline + date | `headlines-narrow.js` |

Cookie banners are dismissed ("Deny All") or hidden before the shot; nothing on the page is edited.
finextra.com answered 403 (Cloudflare check), so B10's third headline is an MNC quote card, not a capture.

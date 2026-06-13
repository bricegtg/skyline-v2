# Skyline v3 — Adapted 21st.dev components

Eight components were studied on [21st.dev](https://21st.dev) and **re-skinned to Skyline's identity** — Arial Black (display) + Calibri (body), brand gold `#E8B84B` / ember `#D9362B` / ink-900 `#050507` / paper `#F8F5EE`. No 21st.dev fonts, colors, or class names survive: only the structural pattern was borrowed.

Reusable markup lives in `components/snippets.html`; styles in `components/components.css` (load after `v3.css`).

| # | 21st.dev source pattern | Skyline component | Class | Where used |
|---|---|---|---|---|
| 1 | Shape Landing Hero / Animated Hero (magnetic CTA) | Editorial hero — rotor eyebrow + massive word-stagger headline + single magnetic CTA | `.cmp-hero` | All variant home heroes (A/C use it directly; B layers a cinematic media bed behind) |
| 2 | Bento Grid / Display Cards | Spec / feature grid — hairline-divided cells, big Arial Black value, Calibri note | `.cmp-spec-grid` / `.cmp-spec-cell` | firefighting.html spec sheet (all variants) |
| 3 | Pricing Section | Pricing tier card — rotor eyebrow, editorial headline, rotor-blade bullet list, featured gold border | `.cmp-pricing` / `.cmp-tier[data-featured]` | cleaning.html retainer tiers (all variants) |
| 4 | Expandable Tabs | FAQ accordion — native `<details>` with animated plus/minus, accent inherits page division | `.cmp-faq` / `.cmp-faq-item` | contact.html (all variants) |
| 5 | Cases with Infinite Scroll | Trust / credential band — rotor glyphs as separators between credentials | `.cmp-trust` | home + cleaning (replaces the killed marquee in A/C; B turns it into a pinned chapter) |
| 6 | Footer pattern | Rotor-marked footer — signature glyph beside wordmark | `.cmp-footer-mark` (added into existing `.footer`) | All pages |
| 7 | Unique Testimonial | Editorial quote — centered Arial Black blockquote under a rotor mark | `.cmp-quote` | home (A/C), pinned proof chapter (B) |
| 8 | CPU Architecture / stats | Scroll-triggered stat counter band — reuses core.js `data-count` | `.cmp-stats` / `.cmp-stat` | home + firefighting stat bands (all variants) |

## Adaptation rules applied
- **One accent per section.** Spec/stat components inherit `.is-firefighting` → ember; everything else defaults to gold. Never both in one section.
- **Rotor everywhere a 21st.dev kit would use a generic icon/dot.** Separators, bullets, eyebrows, footer mark, quote mark all use the Skyline rotor-glyph via inline SVG (`data-rotor`) or the `--rotor-blade` mask.
- **Type swapped to identity.** Every heading uses `var(--font-display)` (Arial Black), every body uses `var(--font-body)` (Calibri). No Inter/Geist/system stacks from the source kits.
- **Motion = Luke easing.** Reveal transitions use `--ease-luke` and `--dur-reveal`, not the springy defaults common in 21st.dev React kits.

## Rotor-glyph injection
Elements marked `data-rotor` get the inline `rotor.svg` injected by a small loader in each page (so `currentColor` works). The single-blade list marker uses the `--rotor-blade` CSS mask defined in `v3.css`.

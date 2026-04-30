# FreightUtils Design System

> v1 base ships in [`app/globals.css`](../app/globals.css). v2 redesign in progress, scoped to `/` and `/api-docs` first. v1 documentation deferred to the first v2 migration sprint.

## Contents

- [v1 — Baseline (placeholder)](#v1--baseline-placeholder)
- [v2 — Redesign system (May 2026 onward)](#v2--redesign-system-may-2026-onward)
  - [When to apply v2 vs v1](#when-to-apply-v2-vs-v1)
  - [v2 motion tokens](#v2-motion-tokens)
  - [Theme-per-vertical pattern](#theme-per-vertical-pattern)
  - [Animation grammar (what motion is for)](#animation-grammar-what-motion-is-for)
  - [Globe component spec (api-docs only)](#globe-component-spec-api-docs-only)
  - [Component conventions (additive to v1)](#component-conventions-additive-to-v1)
  - [Anti-patterns (do not ship)](#anti-patterns-do-not-ship)

---

## v1 — Baseline (placeholder)

Current production tokens live in [`app/globals.css`](../app/globals.css) — light-first theme with navy `#1a2332` + orange `#e87722` brand pairing, category colours (ops green / DG red / customs blue / reference purple), Outfit font stack, and card border conventions (solid for clickable, dashed for informational).

**TODO:** v1 should be documented properly during the first v2 migration sprint — colour roles, card variants, typography scale, spacing rhythm, focus states, dark-mode token map. Until then, treat `app/globals.css` as the source of truth and read the existing pages (`/pricing`, `/api-docs`, the calculator pages) as canonical examples of v1 in use.

---

## v2 — Redesign system (May 2026 onward)

v1 base tokens (category colours, CTA orange, light-first, card border conventions) carry forward unchanged. v2 adds motion, theme accents, and globe component spec for use on redesigned pages only.

### When to apply v2 vs v1
- Pages on the redesign manifest (currently: `/`, `/api-docs`) → v2
- All other pages → v1 until explicitly migrated
- Shared components (footer, nav) → must work in both modes; restyle additively, don't break v1 pages

### v2 motion tokens
```css
/* Durations */
--motion-fast: 120ms;
--motion-base: 200ms;
--motion-slow: 320ms;

/* Easings */
--ease-out: cubic-bezier(0.16, 1, 0.3, 1);    /* default for entry */
--ease-in: cubic-bezier(0.7, 0, 0.84, 0);     /* default for exit */
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1); /* for emphasis only */

/* Reduced motion override — always present */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Theme-per-vertical pattern
Each vertical page (air, road, sea, rail) gets a subtle SVG line-art accent keyed to its category colour. Implementation:

- SVG saved to `public/themes/{vertical}.svg`
- Embedded inline (not as background-image) for tree-shaking and reduced-motion control
- Opacity ≤8% in light mode, ≤5% in dark mode
- Positioned absolute, top-right or bottom-left of hero only — never tiled, never full-bleed
- Single colour fill matching vertical category colour
- Stroke width ≤1px, lines kept simple (40-80 lines max per SVG)
- File size ≤4KB gzipped per theme SVG

Vertical → category colour → motif:
- Air → freight ops green `#15803D` → cargo plane silhouette + arc lines
- Road → customs blue `#2563EB` → truck silhouette + lane markers
- Sea → reference purple `#7C3AED` → container ship + waveform
- Rail → DG red `#DC2626` (only if rail content gets DG-heavy; else neutral) → freight wagon + sleeper lines

If a page covers multiple verticals (homepage, /api-docs), use a composite or no theme — never a confusing mix.

### Animation grammar (what motion is for)
- **Entry**: fade + 8px translate-up, `--motion-base` `--ease-out`. One-shot on intersection observer.
- **Hover (desktop only)**: scale 1.02 OR border-colour shift OR shadow lift — pick one per element type, never combine. `--motion-fast`.
- **Focus (keyboard)**: same target as hover plus visible outline — never just outline.
- **Loading**: skeleton shimmer at 1.5s loop, NOT spinner. Disable shimmer under reduced-motion (static skeleton instead).
- **Errors**: red flash 200ms then settle. No shake (motion-sickness trigger).

What motion is NOT for: scroll-jacking, parallax, decorative ambient loops, mascot animations, hero video backgrounds, particle effects.

### Globe component spec (api-docs only)
- Library: [`react-globe.gl`](https://github.com/vasturiano/react-globe.gl) (lazy-loaded)
- Data source: subset of `lib/data/airlines.json` — top 50 airlines by route count, all 350+ destinations rendered as pins
- Routes: rendered as great-circle arcs, opacity 0.4
- Pulse animation: one arc at a time, `--motion-slow`, paused on reduced-motion
- Click target: pins (airports), arcs (route → airline-prefix page)
- Tooltip on hover: airline name + route IATA codes
- Render below the fold, intersection-observer triggered, fallback to flat 2D map if WebGL unavailable
- Bundle budget: ≤200KB gzipped including globe library

### Component conventions (additive to v1)
- Cards keep v1 border conventions (solid for clickable, dashed for informational)
- v2 adds: subtle gradient on card hover (no colour shift, only luminosity ±4%)
- Headers: tracking-tight on h1/h2, default tracking on h3+
- Body: line-height 1.6 for paragraphs, 1.4 for UI text
- Code blocks: existing `prism` styling; v2 adds copy button on hover (debounced)

### Anti-patterns (do not ship)
- Photographic backgrounds (heavy, ages badly, accessibility hostile)
- Gradient meshes / glassmorphism (dated by 2024, unprofessional in 2026)
- Custom fonts beyond current stack (every webfont is a perf tax)
- Lottie files (use SVG + CSS or Framer Motion instead)
- Cookie banner reintroduction unless a new third-party tracker actually triggers PECR
- Marketing copy that sounds AI-generated ("Unlock the power of...", "Seamlessly integrate...", "Revolutionary platform")
- Emojis as bullet markers
- "Trusted by" logo strips with logos we don't have permission to use
- Fake testimonials

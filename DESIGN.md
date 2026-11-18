# DESIGN.md - Jona Setiawan Portfolio Design System

## 1. Visual Direction & Domain Fit
- **Brand / Owner**: Jona Setiawan (`LanderLynch`), Multimedia & Graphic Designer based in Tangerang, Indonesia.
- **Audience**: Prospective clients, creative directors, and hiring managers reviewing GFX design, brand identity, event posters, UI concepts, and photography archives.
- **Style Family**: Editorial dark/light studio showcase with crisp surface elevation, restrained glass chrome on floating navigation only, and authentic creative work previews.
- **Liveliness Dials**: `ENERGY 2 / RHYTHM 2 / MOTION 2` (editorial pacing, mixed section silhouettes, purposeful transitions that respect `prefers-reduced-motion: reduce`).

## 2. Theme Token Matrix (3 Palettes)
All color tokens are defined on `:root` (`blue` default), `:root[data-theme="light"]`, and `:root[data-theme="galaxy"]` in `theme-palettes.css`, meeting WCAG 2.1 AA contrast (4.5:1 normal text, 3:1 large text and focus indicators).

| Token | Blue (Default Dark) | Light | Galaxy (Deep Violet) | Role |
| :--- | :--- | :--- | :--- | :--- |
| `--bg` | `#0b1220` | `#ececf0` | `#05050a` | Primary page canvas |
| `--bg-soft` | `#10192b` | `#e4e5eb` | `#0a0a12` | Secondary section canvas |
| `--surface` | `rgba(17, 27, 46, 0.94)` | `#f7f8fc` | `rgba(14, 15, 24, 0.94)` | Primary card surface |
| `--surface-strong` | `rgba(22, 34, 58, 0.98)` | `#ffffff` | `rgba(20, 22, 34, 0.98)` | Elevated surface / modals |
| `--text` | `#f3f7ff` | `#171923` | `#f5f7ff` | Primary heading & body ink |
| `--muted` | `#a8b8d4` | `#4e526e` | `#a5acc7` | Secondary body & caption ink (≥ 4.5:1) |
| `--accent` | `#60a5fa` | `#2563eb` | `#a78bfa` | Primary interactive accent |
| `--accent-strong` | `#93c5fd` | `#1d4ed8` | `#c4b5fd` | Hover / active highlight |
| `--border` | `rgba(148, 163, 184, 0.22)` | `rgba(23, 25, 35, 0.14)` | `rgba(167, 139, 250, 0.22)` | Hairline structural border |

## 3. Typography & Hierarchy
- **Primary Font**: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`
- **Scale**:
  - Hero Display (`h1.hero-title`): `clamp(2.35rem, 4.4vw, 3.85rem)`, weight `800`, line-height `1.08`, letter-spacing `-0.03em`
  - Section Title (`h2.section-title`): `clamp(1.85rem, 3.2vw, 2.5rem)`, weight `800`, line-height `1.15`, letter-spacing `-0.025em`
  - Card / Group Heading (`h3`): `1.25rem`–`1.4rem`, weight `700`, line-height `1.28`
  - Body Copy (`p`): `1rem` (16px), line-height `1.65`, measure `60ch–70ch`
  - Kicker / Metadata Badge: `0.76rem`–`0.82rem`, weight `700`, letter-spacing `0.08em`, uppercase

## 4. Shape Lock & Spacing Scale
- **Shape Family**: Soft studio geometry (`--radius-xl: 24px` for hero/feature frames, `--radius-lg: 16px` for project/content cards, `--radius-md: 12px` for inputs and inner blocks, `999px` pill for buttons and filter chips).
- **Spacing Base**: 8pt grid (`4px`, `8px`, `12px`, `16px`, `24px`, `32px`, `48px`, `64px`, `96px`).
- **Surface Discipline**:
  - No cards nested inside outer card shells (`RX-UI-01`). Section wrappers (`.skills-shell`, `.experience-container`) act as layout grids without redundant outer card borders/shadows.
  - `backdrop-filter: blur()` is restricted strictly to floating chrome (`.navbar` pills, `.desktop-theme-palette`, and modal overlays) (`R-10`).
  - No full-page decorative CSS grid overlay (`R-07`).

## 5. Accessibility & Interaction Rules
- **Landmarks**: `<header>`, `<main id="main-content">` with skip link, and `<footer class="footer">`.
- **Keyboard Focus**: `:focus-visible` uses a `2px solid var(--accent-strong)` outline with `outline-offset: 3px` (≥ 3:1 contrast against adjacent surfaces).
- **Touch Targets**: All interactive buttons, filter pills, theme triggers, and mobile menu controls are ≥ `44px × 44px`.
- **Bilingual Parity**: All UI copy and attributes support Indonesian (`id`) and English (`en`) via `language-controls.js`.

# Design System — Voting Board

**Design Language: Dark Minimal Pro**

## Theme
- Default: Dark mode
- System override: möglich via next-themes

## Typography
- Font: Geist Sans (Next.js default) — clean, geometric, tech-forward
- Weights: 400 (body), 500 (labels), 600 (headings), 700 (display)

## Color Palette

### Base
| Token | Hex | Tailwind |
|-------|-----|----------|
| Background | `#09090B` | zinc-950 |
| Surface | `#18181B` | zinc-900 |
| Card | `#1C1C1F` | zinc-900 tinted |
| Border | `#27272A` | zinc-800 |
| Text | `#FAFAFA` | zinc-50 |
| Muted text | `#A1A1AA` | zinc-400 |

### Accent / Primary
| Token | Hex | Usage |
|-------|-----|-------|
| Primary | `#7C3AED` | violet-600 — Buttons, Links, Active states |
| Primary hover | `#6D28D9` | violet-700 |
| Gradient | `violet-600 → indigo-500` | CTAs, Vote buttons, Highlights |

## Effects

### Glassmorphism (Cards)
```css
background: rgba(255,255,255,0.03);
backdrop-filter: blur(12px);
border: 1px solid rgba(255,255,255,0.08);
```
Tailwind: `bg-white/[0.03] backdrop-blur-md border border-white/[0.08]`

### Glow (Primary elements)
```css
box-shadow: 0 0 24px rgba(124, 58, 237, 0.25);
```

### Hover lift
```css
transform: translateY(-2px);
```

### Transitions
- Color / shadow: `150ms ease`
- Transform: `200ms ease`

## Border Radius
| Element | Value | Tailwind |
|---------|-------|----------|
| Cards | 16px | `rounded-2xl` |
| Buttons | 10px | `rounded-xl` |
| Inputs | 8px | `rounded-lg` |
| Badges | 9999px | `rounded-full` |

## Component Patterns

### Nav
```
sticky top-0, backdrop-blur-lg, bg-zinc-950/80, border-b border-zinc-800
```

### Cards
```
bg-zinc-900/60 backdrop-blur-md border border-zinc-800 rounded-2xl p-6
hover: border-zinc-700 + shadow lift
```

### Vote Button (active)
```
pill shape, gradient bg (violet-600 → indigo-500), white text, glow effect
```

### Vote Button (inactive)
```
ghost: border border-zinc-700, zinc-400 text
hover: border-violet-500/50, violet text
```

### Input / Textarea
```
bg-zinc-900 border border-zinc-700 rounded-lg
focus: border-violet-500 ring-2 ring-violet-500/20
```

### Badge / Status
```
rounded-full, colored dot + text
Under Review: zinc | Planned: blue | In Progress: amber | Done: green | Declined: red
```

### Primary Button
```
bg-gradient-to-r from-violet-600 to-indigo-500 rounded-xl px-6 py-2.5 font-semibold
hover: opacity-90 + glow
```

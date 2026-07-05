# OlanAI — Design System & Identity Spec

> Extracted from the live codebase (React 19 + Tailwind v4, dark-only). This is
> the *current* state of the design language, meant as a baseline to refine —
> observations and open questions are called out in **▸ Refine** notes.

---

## 1. Brand identity

| Attribute | Value |
|---|---|
| **Name** | OlanAI — *Olan* is Turkish for "Being" |
| **Wordmark** | `olanai`, all-lowercase, custom vector (`OlanLogo.tsx`) |
| **Symbol** | Two concentric hand-drawn rings / orbit (`OlanCircles.tsx`) — the "o" of Olan, doubling as an orbit/foresight motif |
| **Tagline** | "AI Engineering, with foresight." |
| **Chat persona** | **Goss** — the AI sales engineer (named after a real sales engineer; not a generic bot name) |
| **Contact** | hello@olanai.tech · instagram.com/olanai.tech · github.com/olanai |

**Positioning voice:** engineering discipline vs. "vibe-coded chaos." Recurring
promises: *"Real engineers building real solutions," "You own everything"
(no lock-in), predictable milestone pricing, "proven on ourselves first."*
Confident, plain-spoken, anti-hype.

**Visual motifs:** the circle / orbit / constellation (nodes + links), and
**light as foresight** — the hero background is a field of dim particles that
*ignite* around the cursor, a literal "we see what's coming" metaphor.

---

## 2. Color

### Core palette

| Token | Hex | Role |
|---|---|---|
| **Background** | `#000000` | Page base (pure black), `body` + `bg-black` |
| **Brand violet** | `#7c3aed` | The signature brand color — logo accents (`i`-dot, trailing `a`), `theme-color`, mark in footer. *Tailwind `violet-600`.* |
| **Purple 500** | `#a855f7` | Primary UI accent — eyebrows, links, glows, focus ring, active dots |
| **Purple 600** | `#9333ea` | Solid accent — avatars, send button, primary chat CTA |
| **Indigo 500 / 600** | `#6366f1` / `#4f46e5` | Gradient partner (timeline nodes, progress line, hero particles) |
| White | `#ffffff` | Primary text, primary button fill |
| Blue 600 | `#2563eb` | Ambient background blob only (very low opacity) |

### Text ramp (on black)

`white` → `gray-100` → `gray-300` (subheads) → `gray-400` (body default) →
`gray-500` (muted / labels) → `gray-600` (disabled).

### Surface & border system (glassmorphism)

Built almost entirely from translucent white over black:

- **Surfaces:** `white/[0.02]`, `white/[0.03]` (cards), `white/[0.06]` (card hover), `white/5` (bubbles, inputs, chips)
- **Borders:** `white/10` (default), `white/20` (hover), `white/5` (subtle dividers)
- **Accent surfaces:** `purple-500/10` bg + `purple-500/30` border (chips, highlighted cards)
- **Selection:** `purple-500/30`

### Semantic

| State | Color |
|---|---|
| Success | `green-500` (+ `green-400` text, `green-500/10` bg, `green-500/30` border) |
| Error | `red-500` (+ `red-400` text, `red-500/10` bg) |
| Window-chrome dots | `red-500/50` · `yellow-500/50` · `green-500/50` |

### Signature gradients

- **Hero headline:** `linear-gradient(to bottom, #fff → gray-400)`, `bg-clip-text`
- **"Let's Talk" headline:** `to-r, white → purple-100 → purple-300`, clipped
- **Timeline node (reached):** `to-br, indigo-500 → purple-600`, glow `rgba(168,85,247,0.45)`
- **Timeline progress line:** `to-r, indigo-500 → purple-500`
- **Ambient blobs:** large `purple-600/10` + `blue-600/5` radial blurs, `blur-[100–120px]`
- **CSS `.gradient-blur`:** `radial-gradient(circle, rgba(124,58,237,0.15), transparent 50%)`

**▸ Refine — palette coherence:** The *brand* accent is `#7c3aed` (violet-600),
but the *UI* accent scale is true `purple` (`#a855f7` / `#9333ea`). They're close
but not the same hue family, so the mark reads slightly bluer than the buttons.
Decide on one canonical accent (either shift the UI to violet, or the mark to
purple) and derive a single tint/shade ramp from it. Indigo is used only inside
gradients — worth formalizing as a named "gradient-from" token rather than ad hoc.

---

## 3. Typography

**Two-family system** (design verdict, applied):

- **Inter** (weights 300–800) — *display + action type.* Every `h1–h6` (set globally via `index.css`: `h1,h2,h3,h4,h5,h6 { font-family: 'Inter' }`), **plus** the punchy brand-forward bits that aren't headings: the **hero value-prop line** ("We design and build SaaS platforms…") and **all CTAs / action buttons**. Those opt back into Inter with the `.font-display` utility. Feature-card labels are `<h4>`, so already Inter.
- **Source Sans 3** (weights 400–700) — *the reading layer.* Every flowing paragraph, description, lead, and inline label. Warmer than Inter and the most legible of the family in long form; pairs with it seamlessly. Set as the `body` default; whatever isn't a heading or tagged `.font-display` inherits it.
- **No serif, no mono** anywhere in the product UI.
- **Body base:** **17px / 1.65** line-height (on `body`).

| Role | Family | Spec |
|---|---|---|
| Hero H1 | Inter | `text-5xl→7xl`, `font-medium`, `tracking-tight`, gradient-clipped; emphasis word `font-bold` |
| Section eyebrow | Inter | `text-sm`, `font-semibold`, `tracking-wider`, `uppercase`, `purple-500` |
| Section H3 | Inter | `text-4xl→5xl`, `font-bold` |
| Chat display H2 | Inter | `font-black`, gradient-clipped |
| Lead paragraph | Source Sans 3 | `text-lg→2xl`, `font-medium`, `gray-300` |
| Body | Source Sans 3 | 17px / 1.65, `gray-300`, `leading-relaxed` |
| Labels / secondary | Source Sans 3 | `gray-300` |
| Buttons | Source Sans 3 | `font-bold` (primary) / `font-medium` |

**Color floor:** body/secondary reading text sits at **`gray-300`**; **never dimmer
than `gray-400`.** `gray-500`/`gray-600` are reserved for non-content use only
(functional active/inactive state, disabled fills, decoration) — not reading text.

**Pattern:** weight + gradient-clip carry hierarchy far more than size does.
Headlines lean *medium/bold*; only the chat title goes `font-black`.

**▸ Refine — scale + weight consistency:** Heading weight still wanders
(`medium` hero → `bold` sections → `black` chat). Pick a deliberate weight ladder.
No fluid `clamp()` type scale yet — sizes jump at the `md` breakpoint only.

---

## 4. Shape, spacing, elevation

**Radii (the rounding language is a real signature):**

| Radius | Usage |
|---|---|
| `rounded-full` | All buttons, nav pill, chips-as-pills, avatars, dots |
| `rounded-3xl` | Cards, chat container, engagement card |
| `rounded-2xl` | Inputs, message bubbles, mobile cards, send button |
| `rounded-xl` | Quick-reply chips, mobile CTA |
| Asymmetric tails | Bubbles use `rounded-br-md` (user) / `rounded-bl-md` (assistant) for a chat "tail" |

**Spacing:** section rhythm `py-24 px-4`; content `max-w-7xl mx-auto`
(chat `max-w-4xl`, hero mockup `max-w-5xl`); header blocks `mb-16`; card padding `p-8`.

**Elevation:** no hard shadows — depth comes from **blur + glow**:
`shadow-2xl`, `shadow-[0_20px_50px_rgba(0,0,0,0.3)]` (nav), and colored glows like
`shadow-[0_0_40px_-10px_rgba(168,85,247,0.2)]`.

---

## 5. Components & patterns

**Glass card (the workhorse):**
`p-8 rounded-3xl bg-white/[0.03] border border-white/10` → hover:
`bg-white/[0.06] border-white/20` + a `purple-500/20 blur-3xl` glow blob fades in
from a corner. `overflow-hidden`, `transition-all duration-300`.

**Buttons:**
- *Primary:* `bg-white text-black rounded-full font-bold` → `hover:bg-gray-200 hover:scale-105`
- *Secondary:* `bg-white/5 border border-white/10` → `hover:bg-white/10`
- *Accent:* `bg-purple-600` → `hover:bg-purple-700` (chat send, engagement CTA)
- Almost all carry a lucide `ArrowRight`/`Send` that nudges on hover.

**Navbar:** floating centered pill, `fixed`, `backdrop-blur-xl bg-black/40 border-white/10`.
Shrinks/narrows on scroll (`w-95%→85%`, logo `scale-100→90`, `duration-500`). Links get a
purple underline that grows on hover.

**Chips:** pill or `rounded-xl`; solid = `purple-500/10` bg + `purple-500/30` border + `purple-100` text; ghost = `border-white/10 text-gray-400`.

**Chat bubbles:** assistant = `bg-white/5 text-gray-100` + OlanCircles avatar on `purple-600` disc; user = `bg-purple-600 text-white` + user-icon on `gray-600` disc. "Goss is thinking…" uses a spinning loader.

**Iconography:** [lucide-react](https://lucide.dev) line icons throughout. Feature/principle tiles use two 2×2 **sprite sheets** (`/services.jpeg`, `/how-we-build.jpeg`) rendered with `mix-blend-screen` (drops the black matte) + a `radial-gradient` mask to fade tile edges — a distinctive, slightly experimental technique.

**▸ Refine — component tokenization:** The glass-card recipe, button variants, and
chip variants are copy-pasted inline across files rather than centralized. Extracting
`Card`, `Button`, `Chip`, `SectionHeader`, and `Eyebrow` primitives (with the tokens
below) would make the system consistent and refinable in one place.

---

## 6. Imagery & art direction

The section icons (`/services.jpeg`, `/how-we-build.jpeg`, each a 2×2 tile
sheet) are AI-generated and share one deliberate look. This is the **spirit** to
preserve when generating any new imagery — it's the brand motifs (orbit + light
in the dark = foresight) rendered as iconography.

**Style DNA:**

- **Neon glow line-art** — thin, luminous outline strokes with a soft outer bloom/halo, glowing *out of* the dark rather than sitting on it.
- **Single subject, centered**, generous negative space (so a radial mask can fade the tile edges cleanly).
- **Gradient strokes:** violet → indigo → magenta (`#a855f7` → `#6366f1` → `#4f46e5`, with occasional magenta `#d946ef` tips) — the exact hero-constellation palette.
- **Pure matte black background** (`#000`) — required, because the site composites the icon with `mix-blend-screen` to drop the black out.
- **The signature move — orbital arcs:** most icons are ringed by hand-drawn concentric arcs / swirling orbit lines with a faint motion-blur, echoing the `OlanCircles` mark. This is what makes the set feel *OlanAI* and not generic neon icons.
- **Mood:** cosmic, ethereal, techy, quietly premium. Isometric or flat outline subjects (stacked blocks, node constellation, ringed planet, interlocking rings, shield-check, circuit chip, key, lab flask).

**Reusable prompt recipe** (drop the subject into `{…}`):

```
A single {subject} icon, minimalist neon glow line-art, thin luminous
outline strokes in a violet-to-indigo gradient (#a855f7 → #4f46e5) with
soft magenta highlights, surrounded by faint hand-drawn concentric orbital
arcs with subtle motion blur, gentle outer bloom/halo, centered with wide
margins, on a pure matte black (#000000) background, dark ethereal cosmic
mood, high contrast, no text, 1:1.
```

Subjects used so far — *services:* stacked isometric blocks (full product),
node-and-link constellation (internal tools), ringed planet/orbiting core (AI),
interlocking rings (team augmentation). *how-we-build:* shield + check
(discipline), circuit chip (AI infra), key (ownership), lab flask on an orbit
(proven on ourselves).

**▸ Refine:** raster JPEG sprites are fragile (blend-mode dependent, no dark-mode
flexibility, soft at 2×). If this art direction is locked, consider commissioning
it as a true SVG icon set with the same glow/orbit language — sharper, themeable,
and animatable (the orbit arcs could rotate on hover). See also §8 Q4.

---

## 7. Motion

- **Keyframes defined:** `fade-in` (0.5s), `slide-up` (translateY 20px + fade, 0.5s).
- **Transitions:** near-universal `transition-all duration-300` (elements) / `duration-500` (nav, big states).
- **Hero background:** canvas constellation — dim particles + links that ignite within a `230px` cursor "glow" radius; idle orbit before first pointer move; DPR-aware; **honors `prefers-reduced-motion`** and pauses on tab hide. Palette `#a855f7`/`#4f46e5`.
- **Timeline:** `IntersectionObserver` reveal + auto-advance (3s), active node `animate-ping` pulse, progress line eases over 1s.
- **Loaders:** `animate-spin` (Goss thinking), staggered `transition-delay` on step reveals.

**▸ Refine:** Motion is well-considered (reduced-motion respected) but durations/easings
are ad hoc. A small motion-token set (`fast 200 / base 300 / slow 500`, one easing) would tighten it.

---

## 8. Suggested design tokens (starting point for refinement)

```
color.bg              #000000
color.accent          #7c3aed   /* ← resolve violet vs purple first */
color.accent.hover    #9333ea
color.gradient.from   #4f46e5   /* indigo */
color.gradient.to     #a855f7   /* purple */
text.primary          #ffffff
text.body             gray-300              /* reading text */
text.floor            gray-400              /* dimmest allowed for content text */
text.nonContent       gray-500 / gray-600   /* state, disabled, decoration only */
surface.1             rgba(255,255,255,0.03)
surface.2             rgba(255,255,255,0.06)
border.default        rgba(255,255,255,0.10)
border.hover          rgba(255,255,255,0.20)
radius.pill           9999px
radius.card           1.5rem   /* 3xl */
radius.control        1rem     /* 2xl */
font.display          "Inter"           /* headings only */
font.body             "Source Sans 3"   /* paragraphs, leads, labels */
text.body.size        17px
text.body.leading     1.65
space.section         6rem     /* py-24 */
container.max         80rem    /* 7xl */
motion.base           300ms
```

---

## 9. Top refinement questions to take into design

1. **One accent hue** — commit to violet *or* purple and regenerate a full 50–900 ramp.
2. **Weight ladder** — fix the heading weight hierarchy (medium/bold/black is currently inconsistent).
3. **Light vs. dark** — the system is dark-only. Is a light mode ever needed (docs, emails, invoices)?
4. **Sprite icons vs. vector set** — the JPEG sprite technique is clever but fragile (raster, blend-mode dependent). Consider recreating the §6 glow/orbit art direction as a cohesive custom SVG line-icon set matching the OlanCircles stroke feel.
5. **Elevation language** — glow-only depth is beautiful but low-contrast; confirm it passes as hierarchy on smaller/brighter screens.
6. **Accessibility** — verify `gray-400`/`gray-500` on black meets WCAG AA for body text.
```

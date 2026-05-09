# AixLaw UI Design Specification
> Inspired by: [superhuman.com](https://superhuman.com)
> Style: Premium, minimal, light-mode SaaS — clean whitespace, bold typography, subtle motion

---

## 1. Color Palette

### Brand / Primary
| Token | Hex | Usage |
|---|---|---|
| `--color-brand` | `#FF4B00` | Primary CTA buttons, active states, key highlights |
| `--color-brand-light` | `#FF6B35` | Button hover states, gradient endpoints |
| `--color-brand-dark` | `#D93D00` | Button pressed/active |
| `--color-brand-muted` | `#FFF0EB` | Tinted section backgrounds, badge fills |

### Neutrals
| Token | Hex | Usage |
|---|---|---|
| `--color-white` | `#FFFFFF` | Page background, card backgrounds |
| `--color-gray-50` | `#F9F9F9` | Alternate section background |
| `--color-gray-100` | `#F2F2F2` | Input backgrounds, dividers |
| `--color-gray-200` | `#E5E5E5` | Borders, separators |
| `--color-gray-400` | `#A0A0A0` | Placeholder text, secondary meta |
| `--color-gray-600` | `#666666` | Body text, captions |
| `--color-gray-900` | `#111111` | Headings, primary text |

### Semantic
| Token | Hex | Usage |
|---|---|---|
| `--color-success` | `#00C48C` | Confirmations, checkmarks |
| `--color-warning` | `#FFB800` | Alerts |
| `--color-error` | `#FF3B30` | Errors, destructive actions |

### Gradients
```css
/* Hero background wash */
background: linear-gradient(160deg, #FFFFFF 0%, #FFF5F0 60%, #FFEAE0 100%);

/* Brand CTA button */
background: linear-gradient(135deg, #FF4B00 0%, #FF7A40 100%);

/* Dark section overlay */
background: linear-gradient(180deg, #0A0A0A 0%, #1A1A1A 100%);

/* Subtle card shimmer (hover) */
background: linear-gradient(135deg, rgba(255,75,0,0.04) 0%, rgba(255,75,0,0) 100%);
```

---

## 2. Typography

### Font Stack
```css
/* Primary – headings and UI */
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

/* Display – large hero text (semi-editorial feel) */
font-family: 'Inter Display', 'Inter', sans-serif;

/* Mono – code, keyboard shortcuts, metadata */
font-family: 'JetBrains Mono', 'Fira Code', 'Courier New', monospace;
```

### Type Scale
| Name | Size | Line Height | Weight | Usage |
|---|---|---|---|---|
| `display-xl` | `72px / 4.5rem` | `1.05` | `700` | Hero headline |
| `display-lg` | `56px / 3.5rem` | `1.1` | `700` | Section hero headlines |
| `heading-xl` | `40px / 2.5rem` | `1.15` | `600` | Section headings |
| `heading-lg` | `32px / 2rem` | `1.2` | `600` | Card titles, sub-headings |
| `heading-md` | `24px / 1.5rem` | `1.3` | `600` | Feature titles |
| `heading-sm` | `20px / 1.25rem` | `1.35` | `600` | Small section heads |
| `body-lg` | `18px / 1.125rem` | `1.6` | `400` | Hero sub-copy, feature descriptions |
| `body-md` | `16px / 1rem` | `1.65` | `400` | General body text |
| `body-sm` | `14px / 0.875rem` | `1.6` | `400` | Captions, meta, secondary info |
| `label` | `12px / 0.75rem` | `1.5` | `500` | Badges, nav labels, tags |
| `mono-sm` | `13px / 0.8125rem` | `1.5` | `400` | Keyboard shortcuts, code |

### Letter Spacing
```css
display-xl:    letter-spacing: -0.04em;
display-lg:    letter-spacing: -0.03em;
heading-xl:    letter-spacing: -0.025em;
heading-lg:    letter-spacing: -0.02em;
body-*:        letter-spacing: -0.01em;
label:         letter-spacing: 0.04em; text-transform: uppercase;
```

---

## 3. Spacing System (8px base)

```
4px   — xs    (tight icon gaps, badge padding)
8px   — sm    (small component padding)
12px  — md-sm (form elements, compact spacing)
16px  — md    (standard component padding, card gap)
24px  — lg    (section inner padding)
32px  — xl    (component vertical rhythm)
48px  — 2xl   (section spacing mobile)
64px  — 3xl   (section spacing tablet)
80px  — 4xl   (section spacing desktop)
120px — 5xl   (hero vertical padding)
160px — 6xl   (large hero padding)
```

---

## 4. Layout & Grid

```css
/* Container */
max-width: 1280px;
margin: 0 auto;
padding: 0 24px; /* mobile */
padding: 0 48px; /* tablet (768px+) */
padding: 0 80px; /* desktop (1200px+) */

/* Grid */
display: grid;
grid-template-columns: repeat(12, 1fr);
gap: 24px;

/* Common column spans */
full-width:       col-span-12
two-thirds:       col-span-8
half:             col-span-6
one-third:        col-span-4
one-quarter:      col-span-3
```

### Breakpoints
```css
sm:  640px
md:  768px
lg:  1024px
xl:  1280px
2xl: 1536px
```

---

## 5. Components

### 5.1 Navigation Bar
```
Height:          64px (desktop), 56px (mobile)
Background:      rgba(255,255,255,0.85)
backdrop-filter: blur(12px)
border-bottom:   1px solid rgba(0,0,0,0.06)
position:        sticky, top: 0, z-index: 100

Logo:            left-aligned, 28px height
Nav links:       Inter 15px / weight 450, color #333, gap: 32px
                 Hover: color #111, transition 150ms
CTA button:      "Get Superhuman" — brand gradient pill button
```

### 5.2 Buttons

#### Primary (Brand CTA)
```css
background: linear-gradient(135deg, #FF4B00, #FF7A40);
color: #FFFFFF;
padding: 14px 28px;
border-radius: 100px;     /* full pill */
font-size: 16px;
font-weight: 600;
letter-spacing: -0.01em;
border: none;
box-shadow: 0 4px 16px rgba(255,75,0,0.3);
transition: transform 150ms ease, box-shadow 150ms ease;

&:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 24px rgba(255,75,0,0.4);
}
&:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(255,75,0,0.25);
}
```

#### Secondary (Ghost / Outline)
```css
background: transparent;
color: #111111;
padding: 13px 27px;
border-radius: 100px;
border: 1.5px solid rgba(0,0,0,0.15);
font-size: 16px;
font-weight: 500;
transition: border-color 150ms, background 150ms;

&:hover {
  border-color: rgba(0,0,0,0.35);
  background: rgba(0,0,0,0.03);
}
```

#### Text Link Button
```css
color: #FF4B00;
font-weight: 500;
font-size: 15px;
text-decoration: none;
display: inline-flex;
align-items: center;
gap: 6px;

&::after { content: "→"; transition: transform 200ms; }
&:hover::after { transform: translateX(4px); }
```

### 5.3 Cards

#### Feature Card
```css
background: #FFFFFF;
border: 1px solid rgba(0,0,0,0.08);
border-radius: 20px;
padding: 32px;
box-shadow: 0 2px 12px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.06);
transition: box-shadow 200ms ease, transform 200ms ease;

&:hover {
  box-shadow: 0 12px 40px rgba(0,0,0,0.1);
  transform: translateY(-2px);
}
```

#### Product Card (large)
```css
background: #F9F9F9;
border: 1px solid rgba(0,0,0,0.06);
border-radius: 24px;
padding: 40px;
overflow: hidden;
position: relative;

/* Brand accent top bar */
&::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 3px;
  background: linear-gradient(90deg, #FF4B00, #FF7A40);
}
```

#### Testimonial Card
```css
background: #FFFFFF;
border: 1px solid rgba(0,0,0,0.08);
border-radius: 16px;
padding: 28px 32px;
box-shadow: 0 2px 8px rgba(0,0,0,0.04);

/* Quote mark */
&::before {
  content: '"';
  font-size: 64px;
  color: #FF4B00;
  opacity: 0.15;
  line-height: 1;
}
```

### 5.4 Badge / Pill Tag
```css
display: inline-flex;
align-items: center;
gap: 6px;
padding: 5px 12px;
border-radius: 100px;
font-size: 12px;
font-weight: 500;
letter-spacing: 0.04em;
text-transform: uppercase;

/* Brand variant */
background: #FFF0EB;
color: #FF4B00;
border: 1px solid rgba(255,75,0,0.15);

/* Neutral variant */
background: #F2F2F2;
color: #666666;
border: 1px solid rgba(0,0,0,0.08);
```

### 5.5 Input Fields
```css
background: #FFFFFF;
border: 1.5px solid rgba(0,0,0,0.12);
border-radius: 12px;
padding: 14px 18px;
font-size: 16px;
color: #111111;
transition: border-color 150ms, box-shadow 150ms;

&::placeholder { color: #A0A0A0; }

&:focus {
  outline: none;
  border-color: #FF4B00;
  box-shadow: 0 0 0 4px rgba(255,75,0,0.1);
}
```

### 5.6 Divider
```css
border: none;
border-top: 1px solid rgba(0,0,0,0.06);
margin: 0;
```

### 5.7 Logo Strip (Social Proof)
```css
display: flex;
align-items: center;
gap: 48px;
overflow: hidden;
mask-image: linear-gradient(90deg, transparent, black 10%, black 90%, transparent);

img {
  height: 24px;
  opacity: 0.35;
  filter: grayscale(100%);
  transition: opacity 200ms;
}
img:hover { opacity: 0.7; }
```

---

## 6. Iconography

- Style: **Line icons**, 1.5px stroke, rounded caps/joins
- Library: Lucide React (or Heroicons v2 outline)
- Default size: 20px × 20px (UI), 24px × 24px (feature sections)
- Color: inherits from parent or `currentColor`
- Icon + label gap: 8px

---

## 7. Shadows / Elevation System

```css
--shadow-xs:  0 1px 2px rgba(0,0,0,0.05);
--shadow-sm:  0 2px 8px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04);
--shadow-md:  0 4px 16px rgba(0,0,0,0.08), 0 2px 6px rgba(0,0,0,0.04);
--shadow-lg:  0 12px 40px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.06);
--shadow-xl:  0 24px 64px rgba(0,0,0,0.15), 0 8px 24px rgba(0,0,0,0.08);

/* Brand glow (CTA buttons, key elements) */
--shadow-brand: 0 4px 16px rgba(255,75,0,0.28);
--shadow-brand-lg: 0 12px 40px rgba(255,75,0,0.35);
```

---

## 8. Border Radius Scale

```css
--radius-sm:   6px    (tags, small inputs)
--radius-md:   12px   (inputs, small cards)
--radius-lg:   16px   (cards)
--radius-xl:   20px   (feature cards)
--radius-2xl:  24px   (product cards, modals)
--radius-full: 9999px (pills, badges, avatar)
```

---

## 9. Animation & Motion

### Principles
- Fast and responsive — never feels slow
- Ease-out for entrances (things arrive quickly)
- Ease-in for exits (things leave snappily)
- Spring physics for interactive elements

### Duration Tokens
```css
--duration-instant: 100ms   (tooltips, immediate feedback)
--duration-fast:    150ms   (button states, color transitions)
--duration-normal:  200ms   (card hovers, icon transitions)
--duration-slow:    300ms   (panel slides, dropdowns)
--duration-slower:  500ms   (page transitions, hero reveals)
```

### Easing
```css
--ease-out:    cubic-bezier(0.16, 1, 0.3, 1)        /* snappy deceleration */
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1)          /* smooth transitions */
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1)     /* spring overshoot */
--ease-linear: linear
```

### Scroll Animations (Intersection Observer)
```css
/* Elements fade up on scroll entry */
.animate-in {
  opacity: 0;
  transform: translateY(24px);
  transition: opacity 500ms var(--ease-out), transform 500ms var(--ease-out);
}
.animate-in.visible {
  opacity: 1;
  transform: translateY(0);
}

/* Stagger children */
.stagger > *:nth-child(1) { transition-delay: 0ms; }
.stagger > *:nth-child(2) { transition-delay: 80ms; }
.stagger > *:nth-child(3) { transition-delay: 160ms; }
.stagger > *:nth-child(4) { transition-delay: 240ms; }
```

### Hover Micro-interactions
- Cards: `translateY(-2px)` + shadow increase
- Buttons: `translateY(-1px)` + glow increase
- Links: color shift + arrow nudge
- Icons: `scale(1.1)` or rotation for directional icons

---

## 10. Page Sections — Layout Breakdown

### Section 1: Navigation
```
[Logo]        [Products ▾] [Solutions] [Pricing]        [Contact Sales] [Log in] [Get Superhuman →]
```
- Sticky, blurred glass background
- Logo left, nav links center (desktop), CTA right

### Section 2: Hero
```
┌────────────────────────────────────────────────────────────┐
│                    [BADGE: New]                            │
│   Your words go further than ever before.                  │
│   Mail, Docs, and AI from the makers of Grammarly          │
│                                                            │
│         [Get Superhuman →]   [See how it works]            │
│                                                            │
│     [product screenshot / person image - 70% width]        │
└────────────────────────────────────────────────────────────┘
```
- Background: warm gradient wash `#FFF5F0 → #FFFFFF`
- Headline: `display-xl`, centered, tight tracking
- Sub-headline: `body-lg`, `#666666`, max-width 520px centered
- CTA pair: primary brand button + ghost button
- Padding: 120px top, 80px bottom

### Section 3: Social Proof / Logo Strip
```
┌────────────────────────────────────────────────────────────┐
│   Trusted by teams at                                      │
│   [Logo] [Logo] [Logo] [Logo] [Logo] [Logo] (scroll)       │
└────────────────────────────────────────────────────────────┘
```
- Background: `#F9F9F9`
- Logos: grayscale, 35% opacity, auto-scrolling marquee

### Section 4: Product Suite Cards (2×2 grid)
```
┌──────────────────┐  ┌──────────────────┐
│  [Icon] Mail     │  │  [Icon] Grammarly │
│  Description...  │  │  Description...  │
│  [Learn more →]  │  │  [Learn more →]  │
└──────────────────┘  └──────────────────┘
┌──────────────────┐  ┌──────────────────┐
│  [Icon] Coda     │  │  [Icon] Go AI    │
│  Description...  │  │  Description...  │
│  [Learn more →]  │  │  [Learn more →]  │
└──────────────────┘  └──────────────────┘
```
- 2-col desktop, 1-col mobile
- Each card: feature card style (see §5.3)
- Section heading centered above: `heading-xl`

### Section 5: Feature Spotlight (alternating)
```
[Image / Screenshot]    [Heading]
                        [Sub-text]
                        [• Bullet feature]
                        [• Bullet feature]
                        [CTA]
```
- Alternates image-left / image-right
- Image: rounded-2xl, shadow-lg, 55% column width
- Text: 45% column, vertically centered
- Section bg: alternates `#FFFFFF` and `#F9F9F9`

### Section 6: Testimonials (3-col)
```
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ "Quote..."   │  │ "Quote..."   │  │ "Quote..."   │
│ — Name, Co.  │  │ — Name, Co.  │  │ — Name, Co.  │
└──────────────┘  └──────────────┘  └──────────────┘
```
- 3-col desktop, 1-col mobile (swipeable carousel)
- Testimonial card style (see §5.3)
- Star rating: 5 stars, brand orange `#FF4B00`

### Section 7: CTA Banner
```
┌────────────────────────────────────────────────────────────┐
│                                                            │
│       Start for free today.                                │
│       The world's fastest email experience.                │
│                                                            │
│              [Get Superhuman — It's Free]                  │
│                                                            │
└────────────────────────────────────────────────────────────┘
```
- Background: brand gradient or deep dark `#0A0A0A`
- Text: white on dark, or dark on brand-tinted light
- Single centered CTA

### Section 8: Footer
```
[Logo]    [Products]    [Company]    [Resources]    [Legal]
          Mail          About        Blog           Privacy
          Grammarly     Careers      Help           Terms
          Coda          Press        Status         Cookies
          Go            Contact

          © 2026 Superhuman. All rights reserved.
          [Twitter] [LinkedIn] [GitHub]
```
- Background: `#F9F9F9` or `#0A0A0A` (dark variant)
- 5-column grid desktop, 2-col tablet, 1-col mobile
- Link color: `#666666`, hover `#111111`
- Padding: 80px top, 48px bottom

---

## 11. Dark Mode (App Interior — Optional)

Superhuman's actual email client uses a near-black UI:

```css
--app-bg:           #0C0C0C
--app-surface:      #161616
--app-surface-2:    #1E1E1E
--app-border:       rgba(255,255,255,0.08)
--app-text-primary: #EFEFEF
--app-text-muted:   rgba(255,255,255,0.45)
--app-brand:        #FF4B00
```

---

## 12. Cursor / Interactive States

```css
/* Focus ring — accessible */
:focus-visible {
  outline: 2px solid #FF4B00;
  outline-offset: 3px;
  border-radius: inherit;
}

/* Selection */
::selection {
  background: rgba(255,75,0,0.15);
  color: #111111;
}

/* Scrollbar (WebKit) */
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb {
  background: rgba(0,0,0,0.15);
  border-radius: 3px;
}
::-webkit-scrollbar-thumb:hover { background: rgba(0,0,0,0.25); }
```

---

## 13. Responsive Behavior

| Viewport | Layout Changes |
|---|---|
| < 640px | Single column, 16px padding, hamburger nav, hero text `display-lg` |
| 640–1024px | 2-col cards, 48px padding, simplified nav |
| 1024–1280px | Full layout, contained max-width |
| > 1280px | Max-width 1280px centered, extra whitespace |

---

## 14. Implementation Notes

### Recommended Stack
- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS v4 with CSS variables
- **Animation**: `motion` (from `motion/react`)
- **Icons**: `lucide-react`
- **Fonts**: `next/font` with Inter

### Tailwind Config Key Tokens
```js
// tailwind.config.js
theme: {
  extend: {
    colors: {
      brand: {
        DEFAULT: '#FF4B00',
        light: '#FF6B35',
        dark: '#D93D00',
        muted: '#FFF0EB',
      }
    },
    fontFamily: {
      sans: ['Inter', ...defaultTheme.fontFamily.sans],
      mono: ['JetBrains Mono', ...defaultTheme.fontFamily.mono],
    },
    borderRadius: {
      '4xl': '2rem',
    }
  }
}
```

---

*Design spec derived from superhuman.com visual analysis. Exact brand values should be verified against live CSS before production use.*

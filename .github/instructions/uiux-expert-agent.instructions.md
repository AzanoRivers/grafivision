---
applyTo: "src/components/**,src/layouts/**,src/pages/**,src/styles/**"
---

# UI/UX Expert — Grafivision Web

You are acting as a senior UI/UX designer and frontend architect for Grafivision, a Colombian
creative agency. Every component, page, and style decision must reflect professional design
quality. The client is a design expert — mediocre output is unacceptable.

---

## Breakpoints (width-only — never detect OS or device brand)

| Prefix | min-width | Context |
|--------|-----------|---------|
| `sm`   | 270px     | Tiny phones |
| `md`   | 360px     | Standard Android |
| `lg`   | 440px     | Large phones |
| `xl`   | 750px     | Desktop (primary desktop breakpoint) |
| `2xl`  | 1200px    | Wide desktop |

Defined in `src/styles/tokens.css` via `@theme`. Never use Tailwind's default breakpoints.
Mobile-first: default styles cover `sm`. Use `xl:` prefix for desktop layout shifts.

For structurally different components (different DOM, not just classes):
```html
<!-- Render both, hide/show via Tailwind -->
<MobileNav class="block xl:hidden" />
<DesktopNav class="hidden xl:flex" />
```

---

## Tailwind CSS 4 — Absolute Rules

- **ZERO inline styles.** No `style=""`, no `style={{}}`. Ever.
- All design values (colors, fonts, spacing, radii, z-index, easing) must be defined in
  `src/styles/tokens.css` under `@theme { }`.
- Reference tokens via Tailwind utility classes — never raw CSS values in markup.
- `@apply` only for multi-utility patterns repeated 3+ times. Not for single utilities.
- Custom utilities use `@utility` (Tailwind 4 syntax):

```css
/* src/styles/tokens.css */
@theme {
  --breakpoint-sm:  270px;
  --breakpoint-md:  360px;
  --breakpoint-lg:  440px;
  --breakpoint-xl:  750px;
  --breakpoint-2xl: 1200px;

  /* All brand colors, fonts, spacing, radii here */
  --color-brand-primary:   #REPLACE_WITH_BRAND_HEX;
  --color-text-primary:    #ffffff;
  --color-text-secondary:  #a1a1aa;
  --color-surface-base:    #000000;

  --font-sans:    'Inter', system-ui, sans-serif;
  --font-display: 'Plus Jakarta Sans', sans-serif;

  --ease-smooth: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-bounce: cubic-bezier(0.34, 1.56, 0.64, 1);
}

@utility section-padding {
  @apply px-4 md:px-6 xl:px-12 2xl:px-20;
}
```

---

## Atomic Design Component Architecture

```
src/components/
  atoms/          # Button, Text, Icon, Badge, Avatar, Chip, Divider
  molecules/      # Card, NavItem, FormField, MediaObject, CounterItem
  organisms/      # Header, Footer, Hero, ServicesGrid, PortfolioGrid
  layouts/        # BaseLayout, PageLayout, SectionLayout
  transitions/    # PageTransition, FadeIn, SlideIn, Reveal
  animations/     # keyframes CSS, animation utility components
  islands/        # React components (only when state/interactivity required)
```

### Every Astro component: TypeScript Props interface required
```astro
---
interface Props {
  title: string
  variant?: 'light' | 'dark'
  class?: string
}
const { title, variant = 'dark', class: className } = Astro.props
---
```

### React islands: named exports, no default exports
```tsx
export function PortfolioFilter({ items }: PortfolioFilterProps) { }
```

Use `client:visible` by default. `client:load` only when immediately critical.

---

## Astro SSR Mode

Project uses `output: 'server'`. All pages are server-rendered on every request.

- Data fetching in frontmatter `---` via `fetch()` calls to CMS API
- No `getStaticPaths` — content is dynamic per request
- Type all CMS responses with interfaces in `src/lib/types/cms.ts`
- Use `import.meta.env.CMS_API_URL` — never hardcode API URLs
- `<Image />` component for all images (WebP + responsive, works in SSR)

```astro
---
const data = await fetch(`${import.meta.env.CMS_API_URL}/pages/home`).then(r => r.json())
---
```

---

## Animations & Motion

- CSS `@keyframes` in `src/styles/animations.css`
- Scroll-triggered reveals via Intersection Observer
- Animate only `transform` and `opacity` (never layout-triggering properties)
- Timing: `cubic-bezier` curves from tokens — never `linear`
- `will-change` only when actually animating, removed after animation ends

---

## Tailwind Class Order (mandatory)

`layout → display → position → size → spacing → typography → color → border → effects → motion`

---

## Quality Gates

Before completing any component:
1. No inline styles
2. All values reference `@theme` tokens
3. Responsive at all 5 breakpoints
4. TypeScript Props interface present
5. No `any` types
6. Contrast ≥ 4.5:1 body text (WCAG AA)
7. Focus states visible
8. Images: explicit `width`, `height`, `alt`

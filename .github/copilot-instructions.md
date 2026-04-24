# GitHub Copilot Instructions — Grafivision Web

## Project
Astro 5 migration of a creative design agency website. Client is a professional design firm — visual quality is paramount.

## Stack
- **Astro 5** (latest) — framework
- **Tailwind CSS 4** (latest) — styling
- **TypeScript** (strict) — all files
- **React** (latest) — interactive islands only
- **Lucide** — icons (`lucide-react` in islands, `lucide-astro` in Astro components)
- **pnpm** — package manager

## File Conventions
- Astro components: `PascalCase.astro`
- React islands: `PascalCase.tsx` in `src/components/islands/`
- All components require TypeScript `Props` interface
- Tailwind classes: layout → spacing → typography → color → effects order

## Code Rules

### Astro Components
```astro
---
interface Props {
  title: string
  variant?: 'light' | 'dark'
}
const { title, variant = 'light' } = Astro.props
---
```

### React Islands
```tsx
// Named exports only
export function ComponentName({ prop }: ComponentNameProps) {}
// client:load | client:visible | client:idle — choose laziest possible
```

### Styling
- Use CSS custom properties from `src/styles/tokens.css` via Tailwind config
- Never hardcode color hex values in component files — **exception**: dark overlay blacks (`bg-black/70`) in image sections
- Use `@apply` sparingly — prefer utility classes in markup
- Animations: prefer CSS transitions with cubic-bezier over JS animation libraries
- View Transitions: Astro 6 uses `ClientRouter` from `astro:transitions` (`ViewTransitions` was removed)
- No inline `style=""` attributes — use Tailwind or `<style>` blocks

### Images
- Always use Astro's `<Image />` component for optimized images
- Define explicit `width`, `height`, and `alt` on all images
- Lazy load everything below the fold

## Performance Budget
- Initial JS bundle: < 50KB
- LCP: < 2.5s
- No layout shift (CLS < 0.1)

## Design Principles

### Theme: Light only
- **All backgrounds are light**: `bg-surface-base` = #F8F8F8, `bg-surface-raised` = #FFFFFF, `bg-surface-overlay` = #F3F3F3
- **Text on light bg**: `text-text-primary` = #111111, `text-text-secondary` = #525252, `text-text-muted` = #737373
- **NO dark backgrounds** except: sections with full-bleed image backgrounds (use explicit `bg-black/XX` overlay, NOT surface tokens)
- **Image overlay sections** (HeroSlider, StatsSection, PageHero): hardcode dark overlays (`bg-black/70`+), use `text-white` explicitly for all text in those sections
- **Brand red sections** (SubscribeBar): `bg-brand-red` hardcoded, all child text must be `text-white`
- Never add `dark:` CSS variants. No dark mode support.

### Typography & Motion
- Bold minimalism: large type, generous whitespace, red accent pops
- Scroll-triggered animations via Intersection Observer
- Grid-based layouts: 12-col desktop, 4-col mobile
- Every motion has purpose — no decorative-only animations

### No em dashes
- Never use `—` (em dash) in any visible text content, page titles, or labels
- Use `:`, `,`, `·`, or `|` as separators instead

## Language
- Code: English identifiers
- Content/copy: Spanish (client is Colombian)
- Comments: English

## Do Not
- Add jQuery or legacy JS libraries
- Use `any` TypeScript type
- Hardcode breakpoints (use Tailwind responsive prefixes)
- Ship React for static content
- Use `!important` in CSS
- Add inline styles (use Tailwind or CSS modules)

## UI Review Workflow (ui-ux-pro-max)
- **Never** use Python, Playwright, Puppeteer, or headless browsers to verify visual changes
- **Never** install testing packages (playwright, chromium, etc.) for UI review
- After UI changes: run `pnpm build` to catch TypeScript / Astro / Tailwind errors, then stop
- User handles all visual reviews manually in the browser

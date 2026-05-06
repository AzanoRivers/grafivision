# CLAUDE.md — Grafivision Web Migration

## Response Mode
**CAVEMAN MODE ACTIVE** — All chat responses use Caveman plugin (full level). Technical substance stays. Fluff removed. Invoke skills with Skill tool, not plain text references.

---

## Project Context

Migrating **Grafivision** website from a legacy jQuery/HTML Envato template ("Splashes - Creative Agency") to a modern Astro stack.

**Grafivision** = Colombian creative agency specializing in:
- Brand identity & visual design
- Packaging design
- Advertising materials (flyers, banners, brochures)
- Editorial design

**Critical:** Client IS the design expert. Pixel-perfect execution, color fidelity, and typographic precision are non-negotiable. No amateur visual decisions.

---

## Agent Role: UI/UX Expert + Frontend Architect

Act as a senior UI/UX engineer with:
- Deep expertise in modern web aesthetics for creative/design agencies
- Mastery of motion design and CSS/JS transitions (Framer Motion, View Transitions API, GSAP-style patterns via CSS)
- Performance-obsessed: Core Web Vitals ≥ 95, Lighthouse ≥ 95
- Brand-system thinking: every color, spacing, font choice justified
- Accessibility-aware (WCAG AA minimum)

---

## Tech Stack

| Tool | Version | Notes |
|------|---------|-------|
| pnpm | latest | Package manager only |
| Astro | latest (5.x) | Static + hybrid rendering |
| Tailwind CSS | latest (4.x) | Utility-first, no arbitrary values unless necessary |
| TypeScript | strict | All `.ts`/`.tsx` files |
| React | latest | Only for interactive island components |
| Lucide Icons | latest | `lucide-react` for React islands, `lucide-astro` for static |
| View Transitions | Astro native | Page transitions |

---

## Reference Template

**Source:** `../Plantilla/splashes-creative-agency-template-2023-11-27-05-21-57-utc/Splashes - Creative Agency Template/`

Template pages to migrate:
- `index.html` → Hero, services, portfolio preview, counters, blog preview, CTA
- `aboutus.html` → Company story, values, skill bars → modernize
- `team.html` → Team grid
- `portfolio-*.html` → Work gallery (filterable)
- `blog-*.html` → Blog (optional phase)
- `contact.html` → Contact form
- `shortcodes.html` → Component library reference

**Template colors (reference only — adapt to Grafivision brand):**
```
Primary accent:   #00e7b4  (teal/mint)
Secondary accent: #ff4a81  (pink/coral)
Dark base:        #000000 / #2f2f2f
Light base:       #ffffff / #ebebeb
Body text:        #6d6d6d
```

**Fonts in template:** Roboto (900/700/500/400/300), Dancing Script, Pacifico
→ Evaluate replacements: Inter, Plus Jakarta Sans, or brand-specific choices.

---

## Project Structure (target)

```
Web/
├── CLAUDE.md                   ← this file
├── .vscode/
│   ├── settings.json
│   └── extensions.json
├── .github/
│   └── copilot-instructions.md
├── src/
│   ├── components/
│   │   ├── ui/                 ← Reusable primitives (Button, Badge, Card…)
│   │   ├── sections/           ← Page sections (Hero, About, Portfolio…)
│   │   ├── layout/             ← Header, Footer, Nav
│   │   └── islands/            ← React interactive components
│   ├── layouts/
│   │   └── BaseLayout.astro
│   ├── pages/
│   │   ├── index.astro
│   │   ├── nosotros.astro
│   │   ├── portafolio/
│   │   ├── blog/
│   │   └── contacto.astro
│   ├── content/                ← Astro content collections
│   │   ├── portfolio/
│   │   └── blog/
│   ├── styles/
│   │   ├── global.css          ← @layer base, fonts
│   │   └── tokens.css          ← CSS custom properties (design tokens)
│   ├── lib/                    ← Utilities
│   └── assets/                 ← Images processed by Astro
├── public/
│   └── fonts/
├── astro.config.mjs
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## UI/UX Principles for this project

### Visual Language
- **Light theme**: Site-wide white/light backgrounds (`bg-surface-raised` = #FFFFFF, `bg-surface-base` = #F8F8F8). Portfolio images have white backgrounds — they must blend naturally. NO dark section backgrounds unless explicitly justified (image overlays only).
- **Bold minimalism**: Large typography, generous whitespace, red accent pops (`brand-red` = #E8222B)
- **Rainbow accents**: Interactive elements (buttons, hovers) use warm gradients (red→orange) or full rainbow. Chameleon palette: `#E8222B → #FF6B35 → #FFD700 → #22C55E → #3B82F6 → #8B5CF6 → #EC4899`
- **Image sections only**: `StatsSection`, `PageHero`, `HeroSlider` use hardcoded dark overlays (`bg-black/XX`) NOT `bg-surface-*` tokens — these are intentionally dark for image legibility
- **Motion**: Subtle scroll-triggered animations (Intersection Observer), no jarring effects
- **Grid discipline**: 12-col or 4-col grid. No random spacing values.

### Color System Rules
- Surface tokens (`bg-surface-base/raised/overlay/border/muted`) → LIGHT VALUES. Use them freely for section/card backgrounds
- Dark overlays on images → use explicit `bg-black/XX` (e.g. `bg-black/72`), never surface tokens
- Text on dark image sections → use explicit `text-white`, never `text-text-primary`
- Brand accent always `text-brand-red` / `bg-brand-red` — unchanged
- Interactive gradients: buttons use `bg-gradient-to-r from-brand-red to-brand-orange`; hover state shifts to `from-brand-orange to-brand-pink`
- Rainbow line decorators: use `--gradient-rainbow` CSS var or the `bg-gradient-rainbow` utility
- Red sections (`SubscribeBar`) → hardcoded `bg-brand-red`, child text always `text-white`
- Never add dark mode CSS. Single light theme only.

### Transitions & Animations
- Use Astro's View Transitions API for page-to-page transitions
- `@keyframes` for micro-interactions (hover states, loading states)
- CSS `transition` with cubic-bezier curves, not linear
- Performance: `will-change` sparingly, prefer `transform` over positional changes

### Component Rules
- Astro components for static/SSG content → zero JS shipped to client
- React islands ONLY when state/interactivity required (portfolio filter, contact form, mobile menu)
- Every component typed with TypeScript props interface
- Tailwind classes ordered: layout → spacing → typography → color → effects

### Image Strategy
- All images through Astro's `<Image />` component (auto WebP + responsive)
- Lazy load below-fold images
- Portfolio items: define aspect ratios in tokens

---

## Active Skills

Use these skills proactively:

| Skill | When to use |
|-------|------------|
| `caveman:caveman` | All chat responses |
| `caveman:caveman-commit` | Every commit message |
| `caveman:caveman-review` | Code reviews / PR feedback |
| `simplify` | After implementing a feature — check for reuse/complexity |
| `review` | Before merging any feature branch |
| `security-review` | Before any deployment |

### ui-ux-pro-max — Visual Review Rule

**NEVER** use Python, Playwright, or any headless browser to verify UI changes.
**DO NOT** install packages (playwright, chromium, puppeteer, etc.) for visual testing.

After implementing UI changes:
1. Run `pnpm build` to verify zero TypeScript / Astro / Tailwind errors
2. Report any build errors found
3. Stop — user performs all visual reviews manually in the browser

---

## Code Conventions

```typescript
// Components: PascalCase files
// Hero.astro, PortfolioGrid.tsx, NavMenu.astro

// CSS tokens in tokens.css — reference via Tailwind config
// Never hardcode hex values in components — always use tokens

// Astro components: Props interface required
interface Props {
  title: string
  subtitle?: string
  variant?: 'light' | 'dark'
}

// React islands: export named function, no default exports
export function PortfolioFilter({ items }: PortfolioFilterProps) {}
```

---

## Performance Targets

| Metric | Target |
|--------|--------|
| Lighthouse Performance | ≥ 95 |
| LCP | < 2.5s |
| CLS | < 0.1 |
| FID/INP | < 200ms |
| Bundle JS (initial) | < 50KB |

---

## Migration Checklist (phases)

- [ ] Phase 0: Env setup (pnpm init, astro, tailwind, tsconfig)
- [ ] Phase 1: Base layout (Header, Footer, Nav, fonts, tokens)
- [ ] Phase 2: Home page (Hero, Services, Portfolio preview, Counters, CTA)
- [ ] Phase 3: About page
- [ ] Phase 4: Portfolio gallery with filter
- [ ] Phase 5: Contact page + form
- [ ] Phase 6: Team page
- [ ] Phase 7: Blog (optional)
- [ ] Phase 8: SEO, OG meta, sitemap, robots
- [ ] Phase 9: Performance audit + optimization
- [ ] Phase 10: Deploy config (Vercel/Netlify)

---

## Paths Reference

```
Template source:  ../Plantilla/splashes-creative-agency-template-2023-11-27-05-21-57-utc/Splashes - Creative Agency Template/
Brand images:     ../images/
Brand videos:     ../videos/
```

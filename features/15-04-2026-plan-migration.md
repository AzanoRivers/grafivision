# Plan de Migración — Grafivision Web
**Fecha:** 15-04-2026  
**Actualizado:** 15-04-2026 — Sistema de color definido  
**Plantilla origen:** Splashes Creative Agency Template v1.0 (2016)  
**Stack destino:** Astro 5 SSR + Tailwind CSS 4 + TypeScript strict + React islands

---

## 0. Línea Gráfica — Decisión de Brand

### 0.1 Dirección Visual Confirmada

**Conversación con cliente (15-04-2026):**
- Marca actual: negro + rojo + grises/blanco (simple, sobrio)
- Dirección nueva: mantener espíritu de la plantilla Splashes (clara, vibrante, "pintura")
- Acento primario: **ROJO** — visible en favicon, botones e imágenes actuales de Grafivision
- Reemplaza: el teal `#00e7b4` de la plantilla → Rojo Grafivision
- El nombre "splash" (pintura) justifica una paleta vibrante y expresiva
- Landing actual es muy simple → oportunidad de rediseño completo

### 0.2 Sistema de Color — Grafivision 2026

```
Inspiración: pintura al óleo, splash de color, estudio creativo colombiano.
Base oscura con explosiones de rojo y calor. Blanco limpio para respiro.
```

#### Paleta Principal

| Token | Hex | RGB | Uso |
|-------|-----|-----|-----|
| `--color-brand-red` | `#E8222B` | 232, 34, 43 | Acento primario — CTAs, hovers, énfasis |
| `--color-brand-red-dark` | `#B91C22` | 185, 28, 34 | Red hover/pressed state |
| `--color-brand-red-light` | `#FF4D54` | 255, 77, 84 | Red tint — fondos sutiles, badges |
| `--color-brand-orange` | `#FF6B2C` | 255, 107, 44 | Acento cálido — splash secundario |
| `--color-brand-pink` | `#FF2D6B` | 255, 45, 107 | Pop vibrante — reemplaza pink plantilla |

#### Superficies (Dark Base)

| Token | Hex | Uso |
|-------|-----|-----|
| `--color-surface-base` | `#0B0B0B` | Fondo de página — negro profundo |
| `--color-surface-raised` | `#161616` | Cards, secciones elevadas |
| `--color-surface-overlay` | `#222222` | Modales, dropdowns, overlays |
| `--color-surface-border` | `#2E2E2E` | Bordes sutiles, divisores |
| `--color-surface-muted` | `#3D3D3D` | Fondos de inputs, placeholders |

#### Texto

| Token | Hex | Uso |
|-------|-----|-----|
| `--color-text-primary` | `#FFFFFF` | Texto principal sobre fondo oscuro |
| `--color-text-secondary` | `#A3A3A3` | Texto secundario, metadatos |
| `--color-text-muted` | `#6B6B6B` | Texto apagado, disabled |
| `--color-text-inverse` | `#0B0B0B` | Texto sobre fondo claro |

#### Superficies Claras (secciones alternadas)

| Token | Hex | Uso |
|-------|-----|-----|
| `--color-light-base` | `#F8F8F8` | Fondo de secciones claras |
| `--color-light-raised` | `#FFFFFF` | Cards sobre fondo claro |
| `--color-light-border` | `#E5E5E5` | Bordes sobre fondo claro |

#### Estado / UI Feedback

| Token | Hex | Uso |
|-------|-----|-----|
| `--color-state-success` | `#22C55E` | Confirmación, éxito |
| `--color-state-warning` | `#F59E0B` | Advertencia |
| `--color-state-error` | `#EF4444` | Error (diferente al brand red) |
| `--color-state-info` | `#3B82F6` | Información |

### 0.3 Sistema Tipográfico — Decisión Final

| Rol | Fuente | Peso | Reemplaza |
|-----|--------|------|-----------|
| **Display / Hero** | Plus Jakarta Sans | 800, 700 | Roboto 900 |
| **Body / UI** | Inter | 400, 500 | Roboto 400 |
| **Accent** | *(ninguna script)* | — | Dancing Script / Pacifico descartadas |

> Las fuentes script (Dancing Script, Pacifico) se descartan. La agencia es profesional/técnica, no decorativa. Plus Jakarta Sans en peso 800 da impacto visual sin perder seriedad.

### 0.4 Tokens CSS — Bloque completo para `tokens.css`

```css
/* src/styles/tokens.css */
@theme {
  /* ─── Breakpoints ──────────────────────────────────── */
  --breakpoint-sm:  270px;
  --breakpoint-md:  360px;
  --breakpoint-lg:  440px;
  --breakpoint-xl:  750px;
  --breakpoint-2xl: 1200px;

  /* ─── Brand Colors ─────────────────────────────────── */
  --color-brand-red:        #E8222B;
  --color-brand-red-dark:   #B91C22;
  --color-brand-red-light:  #FF4D54;
  --color-brand-orange:     #FF6B2C;
  --color-brand-pink:       #FF2D6B;

  /* ─── Dark Surfaces ────────────────────────────────── */
  --color-surface-base:     #0B0B0B;
  --color-surface-raised:   #161616;
  --color-surface-overlay:  #222222;
  --color-surface-border:   #2E2E2E;
  --color-surface-muted:    #3D3D3D;

  /* ─── Light Surfaces ───────────────────────────────── */
  --color-light-base:       #F8F8F8;
  --color-light-raised:     #FFFFFF;
  --color-light-border:     #E5E5E5;

  /* ─── Text ─────────────────────────────────────────── */
  --color-text-primary:     #FFFFFF;
  --color-text-secondary:   #A3A3A3;
  --color-text-muted:       #6B6B6B;
  --color-text-inverse:     #0B0B0B;

  /* ─── UI State ─────────────────────────────────────── */
  --color-state-success:    #22C55E;
  --color-state-warning:    #F59E0B;
  --color-state-error:      #EF4444;
  --color-state-info:       #3B82F6;

  /* ─── Typography ───────────────────────────────────── */
  --font-display: 'Plus Jakarta Sans', system-ui, sans-serif;
  --font-body:    'Inter', system-ui, sans-serif;

  /* ─── Font Sizes ───────────────────────────────────── */
  --text-xs:   0.75rem;
  --text-sm:   0.875rem;
  --text-base: 1rem;
  --text-lg:   1.125rem;
  --text-xl:   1.25rem;
  --text-2xl:  1.5rem;
  --text-3xl:  1.875rem;
  --text-4xl:  2.25rem;
  --text-5xl:  3rem;
  --text-6xl:  3.75rem;
  --text-7xl:  4.5rem;

  /* ─── Spacing extra ────────────────────────────────── */
  --spacing-section-sm: 3rem;
  --spacing-section:    5rem;
  --spacing-section-lg: 8rem;

  /* ─── Border Radius ────────────────────────────────── */
  --radius-sm:   0.25rem;
  --radius-md:   0.5rem;
  --radius-lg:   1rem;
  --radius-xl:   1.5rem;
  --radius-full: 9999px;

  /* ─── Shadows ──────────────────────────────────────── */
  --shadow-red:    0 4px 24px rgba(232, 34, 43, 0.35);
  --shadow-dark:   0 4px 24px rgba(0, 0, 0, 0.6);
  --shadow-card:   0 2px 12px rgba(0, 0, 0, 0.4);

  /* ─── Easing ───────────────────────────────────────── */
  --ease-smooth:  cubic-bezier(0.4, 0, 0.2, 1);
  --ease-bounce:  cubic-bezier(0.34, 1.56, 0.64, 1);
  --ease-out:     cubic-bezier(0, 0, 0.2, 1);
  --ease-in:      cubic-bezier(0.4, 0, 1, 1);

  /* ─── Z-Index ──────────────────────────────────────── */
  --z-base:    0;
  --z-raised:  10;
  --z-overlay: 20;
  --z-modal:   30;
  --z-toast:   40;
  --z-nav:     50;

  /* ─── Transitions ──────────────────────────────────── */
  --transition-fast:   150ms var(--ease-smooth);
  --transition-base:   250ms var(--ease-smooth);
  --transition-slow:   400ms var(--ease-smooth);
}
```

### 0.5 Uso del Color Rojo en la Plantilla (Mapeo)

La plantilla original usa `#00e7b4` (teal) para estos elementos.
Todos se migran a `--color-brand-red` (`#E8222B`):

| Elemento en plantilla | Clase CSS original | Token nuevo |
|----------------------|-------------------|-------------|
| Skill bar progress | `.cp-bg-color` | `bg-[--color-brand-red]` |
| Hover estados en cards | `.portfolio-hover` overlay | `bg-[--color-brand-red]/80` |
| Botones CTA primarios | `.rectangle-button.green` | `bg-[--color-brand-red]` |
| Dividers de acento | `hr.divider-green` | border `--color-brand-red` |
| Iconos de contador | `.counter-block i` | `text-[--color-brand-red]` |
| Active nav link | `.active-link` | `text-[--color-brand-red]` |
| Títulos `main-title` | `.main-title` | `text-[--color-brand-red]` |
| Bordes decorativos | `.slash-icon` | `text-[--color-brand-red]` |
| Testimonial separator | `.testimonial-separator` | `bg-[--color-brand-red]` |
| Info box icons | `.info-box-icon` | Según variante |

### 0.6 Assets Reales Disponibles ✅

**Ruta raíz:** `C:/DevCode/Repositories/Grafivision/`

```
Grafivision/
├── images/          ← 155 fotos WebP (Foto-1..155) + 5 fotos GF (GF 1,2,4,5,6)
├── videos/          ← 11 videos MP4 (maquina_1..11_min.mp4)
├── Web/             ← Proyecto Astro (este proyecto)
└── Plantilla/       ← Template legacy (solo referencia)
```

**Inventario de assets:**

| Carpeta | Archivos | Formato | Uso en proyecto |
|---------|----------|---------|----------------|
| `../images/Foto-*.webp` | 155 imágenes | WebP ✅ | Portfolio, galería, componentes |
| `../images/GF *.webp` | 5 imágenes | WebP ✅ | Fotos de empresa, hero, about |
| `../videos/maquina_*_min.mp4` | 11 videos | MP4 | Hero bg video, sección proceso |

> ✅ **Ya están en WebP** — no requieren conversión. Astro los servirá directamente desde `public/`.

**Estrategia de copia de assets al proyecto:**

```
src/assets/           ← Solo imágenes procesadas por Astro <Image />
public/
  images/
    portfolio/        ← Foto-1.webp ... Foto-155.webp (copiados)
    brand/            ← GF 1.webp ... GF 6.webp (copiados)
  videos/
    machine/          ← maquina_1_min.mp4 ... maquina_11_min.mp4 (copiados)
```

**Asignación de imágenes por sección:**

| Sección | Assets a usar | Cantidad |
|---------|--------------|----------|
| Hero background | `maquina_1_min.mp4` o `GF *.webp` | 1-3 |
| Portfolio grid | `Foto-1.webp` → `Foto-155.webp` | A seleccionar |
| About / empresa | `GF 1.webp`, `GF 2.webp`, `GF 4.webp` | 3-5 |
| Parallax sections | `GF 5.webp`, `GF 6.webp` | 2 |
| Blog preview | `Foto-*` aleatorios | 4 |
| Team cards | `GF *.webp` o `Foto-*` | Por miembro |
| Showcase page | Rotación de `Foto-*` | A definir |

**Regla:** Nunca usar rutas de la plantilla legacy (`images/isotop/iso1.jpg` etc). Siempre assets de `../images/` o `../videos/`.

### 0.7 Google Maps — Decisión ✅

**Problema plantilla:** Usa Google Maps JavaScript API v2 (HTTP) + InfoBox library → ambos obsoletos, requieren API key, links rotos.

**Solución:** `<iframe>` embed estándar de Google Maps — sin API key, sin JS, sin dependencias.

```astro
<!-- MapEmbed.astro — componente simple -->
---
interface Props {
  src: string          // URL del embed de Google Maps
  title?: string
  class?: string
}
const { src, title = 'Ubicación Grafivision', class: className } = Astro.props
---
<div class:list={['w-full overflow-hidden rounded-lg', className]}>
  <iframe
    {src}
    {title}
    width="100%"
    height="450"
    style="border:0"
    allowfullscreen
    loading="lazy"
    referrerpolicy="no-referrer-when-downgrade"
  />
</div>
```

URL embed se obtiene desde: Google Maps → Compartir → Insertar mapa → copiar `src` del iframe. **No requiere API key.**

### 0.8 Checklist Actualizado

- [x] ~~Colores de marca~~ → ✅ Rojo `#E8222B` + dark base
- [x] ~~Tipografías~~ → ✅ Plus Jakarta Sans + Inter
- [x] ~~Línea gráfica~~ → ✅ Espíritu Splashes + rojo Grafivision
- [x] ~~Assets reales~~ → ✅ 155 fotos WebP + 11 videos MP4 disponibles
- [x] ~~Google Maps~~ → ✅ iframe embed sin API key
- [ ] Confirmar servicios reales de Grafivision
- [ ] Decidir CMS (puede ir después del showcase)
- [ ] Obtener logo vectorial SVG
- [ ] Confirmar si Blog va en v1
- [ ] Confirmar hosting (Vercel recomendado)
- [ ] Confirmar servicio email contacto (Resend)

---

---

## 1. Inventario de la Plantilla Original

### 1.1 Tecnologías Legacy

| Categoría | Tecnología | Versión | Reemplazar con |
|-----------|-----------|---------|----------------|
| Framework CSS | Sin framework (grid custom) | — | Tailwind CSS 4 |
| Fuentes | Google Fonts HTTP (Roboto, Dancing Script, Pacifico) | — | Self-hosted Inter + Plus Jakarta Sans |
| Iconos | Font Awesome 4.x (fa fa-*) | 4.x | Lucide React/Astro |
| Sliders | Revolution Slider (jQuery plugin) | 5.x | Hero CSS puro + View Transitions |
| Carruseles | Owl Carousel (jQuery plugin) | — | Embla Carousel (React island) o CSS scroll snap |
| Galería filtrable | jQuery Isotope | — | React island con CSS grid nativo |
| Lightbox | FancyBox (jQuery plugin) | — | `<dialog>` nativo o React island |
| Animaciones scroll | WOW.js (jQuery) | — | IntersectionObserver + CSS `@keyframes` |
| Parallax | Custom JS (`data-parallax-*`) | — | CSS scroll-driven animations |
| Contadores | Custom jQuery (`data-count`) | — | IntersectionObserver + requestAnimationFrame |
| Barras de habilidad | Custom jQuery (`data-value`) | — | CSS transitions + IntersectionObserver |
| Formulario | PHP (contacts-process.php) + jQuery Form | — | Astro API Route (server endpoint) |
| Validación forms | jQuery Validate | — | React Hook Form + Zod |
| Mapa | Google Maps API v2 (HTTP) — **roto, obsoleto** | — | `<iframe>` embed Google Maps (sin API key, ver sección 0.7) |
| JavaScript base | jQuery 1.x | 1.x | Eliminado completamente |
| jQuery UI | jquery-ui.min.js (calendario widget) | — | No migrar |
| Twitter widget | jquery.tweet.js | — | No migrar |
| Flickr widget | jflickrfeed.min.js | — | No migrar |
| Retina images | retina.min.js | — | `<Image />` Astro (automático) |

### 1.2 Archivos CSS Legacy

```
css/
  main.css             ← Estilos principales (1500+ líneas aprox)
  font-awesome.css     ← Iconos FA4
  jquery.fancybox.css  ← Lightbox
  jquery.owl.carousel.css ← Carruseles
  owl.carousel.css     ← Duplicado carrusel
  animate.css          ← Animaciones WOW.js
```

**Colores encontrados en plantilla:**
- `#00e7b4` — acento principal teal/mint (clase `.cp-bg-color`)
- `#ff4a81` — acento secundario pink/coral
- `#000000` / `#2f2f2f` — fondo oscuro
- `#ffffff` / `#ebebeb` — superficie clara
- `#6d6d6d` — texto body

**Fuentes en plantilla:**
```css
@import url('...Roboto:900,500,400italic,300,700,400');
@import url('...Dancing+Script');
@import url('...Pacifico');
```

**Grid system legacy:**
```css
.grid-row        /* contenedor max-width centrado */
.grid-col-row    /* fila flex/float */
.grid-col        /* columna base */
.grid-col-3      /* 25% ancho */
.grid-col-4      /* 33% ancho */
.grid-col-6      /* 50% ancho */
.grid-col-8      /* 66% ancho */
.col-sd-12       /* 100% en mobile (único breakpoint) */
```

### 1.3 JavaScript Libraries

```
js/
  jquery.min.js              ← Base jQuery
  jquery.easing.1.3.js       ← Easing functions
  jquery.fancybox.pack.js    ← Lightbox
  jquery.fancybox-media.js   ← Lightbox media
  jquery.form.min.js         ← AJAX forms
  jquery.isotope.min.js      ← Portfolio filter
  jquery.owl.carousel.js     ← Carruseles
  jquery.tweet.js            ← Twitter feed
  jquery.validate.min.js     ← Form validation
  jquery-ui.min.js           ← UI widgets (calendar)
  jflickrfeed.min.js         ← Flickr feed
  main.js                    ← Lógica principal custom
  retina.min.js              ← Retina images
  wow.min.js                 ← Scroll animations
rs-plugin/
  jquery.themepunch.revolution.min.js     ← Revolution Slider core
  jquery.themepunch.tools.min.js          ← RS Tools
  extensions/revolution.extension.*.min.js ← RS Extensions (8 archivos)
```

### 1.4 PHP

```
php/
  contacts-process.php  ← Mailer de formulario de contacto (PHP mail())
  twitter/              ← Twitter OAuth proxy (obsoleto)
```

---

## 2. Inventario de Páginas

> **Alcance v1 confirmado:** Sin shop, sin blog. Datos hardcodeados (sin CMS/API). Cloudflare para imágenes. Deploy en Vercel.

| Página original | URL destino | Prioridad | Estado |
|----------------|-------------|-----------|--------|
| `shortcodes.html` | `/componentes` | 🔴 Alta — **primero** | Pendiente |
| `index.html` | `/` (index.astro) | 🔴 Alta | Pendiente |
| `aboutus.html` | `/nosotros` | 🔴 Alta | Pendiente |
| `portfolio-four-columns.html` | `/portafolio` | 🔴 Alta | Pendiente |
| `portfolio-single-item.html` | `/portafolio/[slug]` | 🔴 Alta | Pendiente |
| `contact.html` | `/contacto` | 🔴 Alta | Pendiente |
| `team.html` | `/equipo` | 🟡 Media | Pendiente |
| `blog-*.html` | **No migrar — v1** | ❌ Descartado v1 | — |
| `shop-*.html` | **No migrar** | ❌ Descartado | — |

---

## 3. Inventario de Componentes (Shortcodes)

Toda la biblioteca de componentes disponible en la plantilla. Para cada uno se indica el equivalente en la nueva arquitectura.

### 3.1 Componentes UI Primitivos (Átomos)

| Componente legacy | Clase CSS | Nuevo componente Astro | Notas |
|------------------|-----------|----------------------|-------|
| Botón rectangular outline small | `.rectangle-button.button-outline.small` | `Button.astro` variant="outline" size="sm" | |
| Botón rectangular outline medium | `.rectangle-button.button-outline.medium` | `Button.astro` variant="outline" size="md" | |
| Botón rectangular outline default | `.rectangle-button.button-outline` | `Button.astro` variant="outline" size="lg" | |
| Botón sólido green small | `.rectangle-button.small.green` | `Button.astro` variant="primary" size="sm" | |
| Botón sólido green medium | `.rectangle-button.medium.green` | `Button.astro` variant="primary" size="md" | |
| Botón sólido dark small | `.rectangle-button.small` | `Button.astro` variant="dark" size="sm" | |
| Botón round small | `.round-button.small` | `Button.astro` variant="pill" size="sm" | |
| Botón round large | `.round-button.large` | `Button.astro` variant="pill" size="lg" | |
| Botón con ícono FA | `.rectangle-button + .fa-chevron-right` | `Button.astro` con slot icon | Reemplazar FA por Lucide |
| Divider estándar | `<hr>` | `Divider.astro` variant="default" | |
| Divider verde | `<hr class="divider-green">` | `Divider.astro` variant="accent" | |
| Divider verde grueso | `<hr class="divider-big divider-green">` | `Divider.astro` variant="accent-thick" | |
| Info box confirmation | `.info-boxes.confirmation-message` | `Alert.astro` variant="success" | |
| Info box error | `.info-boxes.error-message` | `Alert.astro` variant="error" | |
| Info box warning | `.info-boxes.warning-message` | `Alert.astro` variant="warning" | |
| Info box info | `.info-boxes.info-message` | `Alert.astro` variant="info" | |
| Blockquote blog | `.blog-quote` | `Blockquote.astro` | |
| Badge de fecha | `.date-round > .date-mounth` | `DateBadge.astro` | |
| Splash decorativo | `img.splash`, `#splash-1..4` | Eliminado o rediseñado | Elemento decorativo legacy |

### 3.2 Componentes de Listas

| Componente legacy | Clase CSS | Nuevo componente Astro |
|------------------|-----------|----------------------|
| Lista con ícono splash | `.list-type.list-type-splash` | `List.astro` variant="splash" |
| Lista con punto redondo | `.list-type.list-type-round` | `List.astro` variant="round" |
| Lista con ángulo | `.list-type.list-type-angle` | `List.astro` variant="angle" |

### 3.3 Componentes Interactivos (Moléculas → islands React)

| Componente legacy | Dependencia JS | Nuevo componente | Tipo |
|------------------|----------------|-----------------|------|
| Tabs con íconos | jQuery + `data-tabs-id` | `Tabs.tsx` | React island `client:visible` |
| Toggles (acordeón simple) | jQuery click | `Toggle.tsx` | React island `client:visible` |
| Acordeón expandible | jQuery click | `Accordion.tsx` | React island `client:visible` |
| Carrusel galería | Owl Carousel + jQuery | `Carousel.tsx` (Embla) | React island `client:visible` |
| Carrusel equipo | Owl Carousel + jQuery | `TeamCarousel.tsx` | React island `client:visible` |
| Post slider | Owl Carousel + jQuery | `PostSlider.tsx` | React island `client:visible` |
| Filtro portfolio | jQuery Isotope | `PortfolioFilter.tsx` | React island `client:visible` |
| Lightbox imagen | FancyBox | Dialog nativo o `Lightbox.tsx` | React island `client:load` |
| Contador animado | jQuery `data-count` | `Counter.tsx` | React island `client:visible` |
| Barra de habilidad | jQuery `data-value` + CSS | `SkillBar.astro` + CSS | Astro + CSS animation |
| Menú móvil drawer | jQuery + `.switcher` | `MobileMenu.tsx` | React island `client:load` |
| Formulario contacto | PHP + jQuery Form/Validate | `ContactForm.tsx` | React island `client:load` |
| Newsletter subscribe | PHP + jQuery | `SubscribeForm.tsx` | React island `client:visible` |
| Scroll top button | jQuery smooth scroll | `ScrollTop.astro` | Astro + CSS |

### 3.4 Secciones / Organismos

| Sección en plantilla | Clases CSS | Nuevo componente Astro |
|---------------------|-----------|----------------------|
| Header sticky + nav | `.stick-wrapper > .sticky` | `Header.astro` |
| Nav desktop dropdown | `.nav > ul > li > ul` | `DesktopNav.astro` |
| Nav mobile hamburger | `.switcher + ul` | `MobileMenu.tsx` (island) |
| Hero slider (Revolution Slider) | `.tp-banner-container` | `Hero.astro` (CSS custom) |
| Scroll down button | `.scroll-down-button` | Integrado en `Hero.astro` |
| Sección About (home) | `#about.about-us` | `AboutPreview.astro` |
| Services grid (4 cols) | `.item-example.grid-col-3 × 4` | `ServicesGrid.astro` |
| Parallax counter | `.text-section.parallaxed` | `StatsSection.astro` |
| Team carousel | `#team + .owl-carousel` | `TeamSection.astro` |
| Portfolio Isotope | `#portfolio + .isotope` | `PortfolioGrid.astro` |
| Blog preview list | `#blog + .blog-content` | `BlogPreview.astro` |
| Testimonials carousel | `#innovation + .owl-carousel` | `Testimonials.astro` |
| Contact info + mapa | `#contact` | `ContactSection.astro` |
| Subscribe bar | `.subscribe` | `SubscribeBar.astro` |
| Footer | `#footer` | `Footer.astro` |
| Page title bar | `.top-bg + .page-title` | `PageHero.astro` |
| Skills bars (about) | `.skill-bar > li` | `SkillsSection.astro` |
| Clients logos | — | `ClientsGrid.astro` |

### 3.5 Componentes de Contenido (origen blog — reutilizables)

> **Regla:** No se construye la página `/blog`, pero **todos los componentes** del blog se migran como elementos reutilizables. Un `ContentCard` de tipo video o quote puede aparecer en cualquier sección. Solo se excluye lo que es estructuralmente un comentario o formulario de comentarios.

#### Cards de contenido (tipos del blog)

| Tipo de post | Elemento plantilla | Nuevo componente | Reutilizable en |
|-------------|-------------------|-----------------|-----------------|
| Post imagen | `.item .media-block .picture` | `ContentCard.astro` type="image" | Portfolio, noticias, showcase |
| Post video | `.item .media-block .video` | `ContentCard.astro` type="video" | Proceso, máquinas, showcase |
| Post audio | `.item .media-block .music + audio` | `ContentCard.astro` type="audio" | Showcase |
| Post quote | `.item .quote blockquote` | `ContentCard.astro` type="quote" | Testimonios, showcase |
| Post meta | `.post-info` (fecha/autor/cat) | `PostMeta.astro` | Cualquier card de contenido |
| Date badge | `.date-round .date-mounth` | `DateBadge.astro` | Cards, timelines |
| Blockquote | `.blog-quote` | `Blockquote.astro` | Testimonios, citas, showcase |

#### Widgets (componentes de sidebar/sección)

| Widget legacy | Clase CSS | Nuevo componente | Excluir | Motivo exclusión |
|--------------|-----------|-----------------|---------|-----------------|
| Categorías | `.widget_categories` | `CategoryList.astro` | No | — |
| Búsqueda | `.widget_search` | `SearchWidget.tsx` | No | — |
| Posts recientes | `.widget-recent-posts` | `RecentItemsWidget.astro` | No | — |
| Tags / nube | `.widget_tag_cloud` | `TagCloud.astro` | No | — |
| Archivo | `.widget_archive` | `ArchiveList.astro` | No | — |
| Texto libre | `.widget_text` | `TextWidget.astro` | No | — |
| Últimas noticias | `.widget-latest-news` + newsletter | `NewsWidget.astro` | No | — |
| Galería mini carousel | `.widget-gallery + owl-carousel` | `GalleryWidget.astro` | No | — |
| Formulario contacto (sidebar) | `.wpcf7 form` | `ContactFormWidget.tsx` | No | — |
| Comentarios recientes | `.widget-recent-comments` | `RecentCommentsWidget.astro` | No | Solo muestra, no escribe |
| Follow/Subscribe | `.follow-icon` | `SocialFollowWidget.astro` | No | — |
| **Formulario de comentarios** | *(en blog-single-post.html)* | **EXCLUIDO** | ✅ Sí | Requiere backend complejo, fuera de alcance |
| Twitter feed | `.widget-twitter` | **EXCLUIDO** | ✅ Sí | API obsoleta |
| Flickr | `.widget_flickr` | **EXCLUIDO** | ✅ Sí | Red irrelevante |
| Calendario jQuery UI | `.widget-calendar` | **EXCLUIDO** | ✅ Sí | No hay funcionalidad de booking |
| Meta WordPress | `.widget_meta` | **EXCLUIDO** | ✅ Sí | Era WordPress, sin equivalente |

#### Paginación

| Elemento | Nuevo componente | Nota |
|----------|-----------------|------|
| Paginación de listados | `Pagination.astro` | Reutilizable para portafolio, cualquier grid |

#### Estructura sidebar

```astro
<!-- SidebarLayout.astro — wrapper para layout 2 columnas con sidebar -->
<!-- Componible: cualquier widget en cualquier orden -->
<SidebarLayout>
  <slot />                      <!-- contenido principal -->
  <slot name="sidebar">         <!-- widgets configurables -->
    <SearchWidget />
    <CategoryList categories={...} />
    <RecentItemsWidget items={...} />
    <TagCloud tags={...} />
    <GalleryWidget images={...} />
    <NewsWidget />
  </slot>
</SidebarLayout>
```

---

## 4. Sistema de Diseño Extraído

### 4.1 Paleta de Colores ✅ DEFINIDA

| Plantilla original | Grafivision 2026 | Decisión |
|-------------------|-----------------|----------|
| `#00e7b4` teal (acento primario) | `#E8222B` Rojo Grafivision | **REEMPLAZADO** — rojo es la marca |
| `#ff4a81` pink (acento secundario) | `#FF2D6B` Pink vibrante | **AJUSTADO** — conserva espíritu splash |
| `#000000` base | `#0B0B0B` negro profundo | **REFINADO** — más rico que puro negro |
| `#2f2f2f` raised | `#161616` surface raised | **REFINADO** |
| `#ebebeb` subtle | `#F8F8F8` light base | **REFINADO** |
| `#6d6d6d` texto body | `#A3A3A3` text secondary | **AJUSTADO** — mejor contraste |
| *(sin acento cálido)* | `#FF6B2C` naranja splash | **NUEVO** — tercer color pintura |

Ver bloque completo de tokens en **sección 0.4** de este plan.

### 4.2 Tipografía (plantilla → elecciones modernas)

| Rol | Plantilla | Nuevo | Justificación |
|-----|-----------|-------|--------------|
| Body / UI | Roboto 400/300 | Inter | Más moderna, misma legibilidad |
| Display / Headings | Roboto 900/700 | Plus Jakarta Sans 700-900 | Impacto visual superior |
| Accent / Script | Dancing Script, Pacifico | Descartadas | Agencia profesional, no decorativa |
| Monospace | — | No aplica | Sin secciones de código |

### 4.4 Idioma del Contenido ✅

- **Todo el contenido:** Español (Colombia)
- Identificadores de código, nombres de componentes, comentarios: Inglés (convención técnica)
- Copy de placeholder en showcase y datos hardcodeados: Español
- Labels de UI (botones, formularios, nav): Español

### 4.3 Breakpoints

La plantilla usa **un solo breakpoint** (`.col-sd-12` = mobile), sin media queries documentadas.
El nuevo sistema define **5 breakpoints** basados en resoluciones reales:

```css
@theme {
  --breakpoint-sm:  270px;   /* Tiny phones */
  --breakpoint-md:  360px;   /* Standard Android */
  --breakpoint-lg:  440px;   /* Large phones */
  --breakpoint-xl:  750px;   /* Desktop */
  --breakpoint-2xl: 1200px;  /* Wide desktop */
}
```

---

## 5. Arquitectura del Proyecto (estructura de archivos)

```
src/
├── components/
│   ├── atoms/                          ← Indivisibles, sin lógica
│   │   ├── Button.astro                ← primary/outline/ghost/pill + sm/md/lg
│   │   ├── Alert.astro                 ← success/error/warning/info + dismiss
│   │   ├── Badge.astro                 ← etiquetas/categorías
│   │   ├── Chip.astro                  ← tags clicables
│   │   ├── Divider.astro               ← default/accent/accent-thick
│   │   ├── Icon.astro                  ← wrapper lucide-astro
│   │   ├── Text.astro                  ← h1-h6/body/caption/label
│   │   ├── Avatar.astro                ← imagen + fallback iniciales
│   │   ├── Blockquote.astro            ← cita + autor
│   │   ├── DateBadge.astro             ← círculo día/mes (blog style)
│   │   ├── PostMeta.astro              ← fecha/autor/categoría/comentarios
│   │   └── List.astro                  ← splash/round/angle variants
│   │
│   ├── molecules/                      ← 2-4 átomos con propósito
│   │   ├── Card.astro                  ← card genérica: imagen+título+desc+cta
│   │   ├── ContentCard.astro           ← type: image/video/audio/quote
│   │   ├── NavItem.astro               ← link + icono + active state
│   │   ├── ServiceItem.astro           ← icono + título + línea + descripción
│   │   ├── CounterItem.astro           ← icono + número animado + label
│   │   ├── SocialLink.astro            ← plataforma + URL + estilo icono
│   │   ├── ContactInfoItem.astro       ← icono + label + valor
│   │   ├── PortfolioCard.astro         ← imagen + hover overlay + categoría
│   │   ├── TeamMemberCard.astro        ← foto + nombre + cargo + bio + redes
│   │   ├── RecentPostItem.astro        ← miniatura + título + fecha
│   │   └── TagItem.astro               ← tag individual de nube
│   │
│   ├── organisms/                      ← Secciones completas auto-contenidas
│   │   ├── Header.astro                ← logo + DesktopNav + MobileMenuTrigger
│   │   ├── Footer.astro                ← links + social + copyright
│   │   ├── Hero.astro                  ← hero principal (home)
│   │   ├── PageHero.astro              ← banner de página interior
│   │   ├── AboutPreview.astro          ← texto + imagen (home)
│   │   ├── ServicesGrid.astro          ← grid 4 servicios
│   │   ├── StatsSection.astro          ← parallax + 4 contadores
│   │   ├── TeamSection.astro           ← carrusel selección + panel detalle
│   │   ├── PortfolioGrid.astro         ← grid filtrable isotope
│   │   ├── ContentList.astro           ← lista de ContentCards (tipo blog)
│   │   ├── Testimonials.astro          ← carrusel testimonios
│   │   ├── ContactSection.astro        ← info + mapa + formulario
│   │   ├── SubscribeBar.astro          ← banner newsletter
│   │   ├── SkillsSection.astro         ← barras de habilidad animadas
│   │   ├── ClientsGrid.astro           ← logos de clientes
│   │   └── MapEmbed.astro              ← iframe Google Maps sin API key
│   │
│   ├── widgets/                        ← Componentes de sidebar/panel lateral
│   │   ├── CategoryList.astro          ← lista de categorías con conteo
│   │   ├── SearchWidget.tsx            ← campo de búsqueda (island)
│   │   ├── RecentItemsWidget.astro     ← últimos items con miniatura
│   │   ├── TagCloud.astro              ← nube de tags clicables
│   │   ├── ArchiveList.astro           ← archivo por mes/año
│   │   ├── TextWidget.astro            ← bloque de texto libre
│   │   ├── GalleryWidget.astro         ← mini galería carousel
│   │   ├── NewsWidget.astro            ← últimas noticias + newsletter
│   │   ├── ContactFormWidget.tsx       ← formulario contacto compacto (island)
│   │   ├── RecentCommentsWidget.astro  ← comentarios recientes (solo display)
│   │   └── SocialFollowWidget.astro    ← iconos redes sociales
│   │
│   ├── layouts/                        ← Shells estructurales
│   │   ├── BaseLayout.astro            ← html/head/ViewTransitions/scripts
│   │   ├── PageLayout.astro            ← Header + main + Footer
│   │   ├── SectionLayout.astro         ← padding + max-width wrapper
│   │   └── SidebarLayout.astro         ← 2 cols: contenido + sidebar
│   │
│   ├── transitions/                    ← Animaciones de entrada
│   │   ├── FadeIn.astro                ← fade + translate scroll-triggered
│   │   ├── SlideIn.astro               ← slide direccional
│   │   └── Reveal.astro                ← wrapper genérico con delay prop
│   │
│   ├── animations/                     ← Solo CSS keyframes helpers
│   │   └── index.ts                    ← exports de clases animación
│   │
│   └── islands/                        ← React — solo si requiere estado
│       ├── MobileMenu.tsx              ← drawer hamburger
│       ├── PortfolioFilter.tsx         ← filtro portfolio por categoría
│       ├── ContactForm.tsx
│       ├── Carousel.tsx
│       ├── TeamCarousel.tsx
│       ├── Tabs.tsx
│       ├── Accordion.tsx
│       ├── Counter.tsx
│       ├── SubscribeForm.tsx
│       └── Lightbox.tsx
├── layouts/
│   └── BaseLayout.astro
├── pages/
│   ├── index.astro
│   ├── nosotros.astro
│   ├── equipo.astro
│   ├── contacto.astro
│   ├── portafolio/
│   │   ├── index.astro
│   │   └── [slug].astro
│   ├── blog/
│   │   ├── index.astro
│   │   └── [slug].astro
│   └── api/
│       └── contact.ts          ← Astro API route (reemplaza PHP)
├── styles/
│   ├── tokens.css              ← @theme { } — diseño tokens
│   ├── global.css              ← @import tailwind + base
│   └── animations.css          ← @keyframes
├── lib/
│   ├── types/
│   │   ├── cms.ts              ← Interfaces CMS data
│   │   └── api.ts              ← Response types
│   └── utils.ts
├── content/
│   ├── portfolio/              ← MDX o fetch desde CMS
│   └── blog/                  ← MDX o fetch desde CMS
└── assets/
    ├── fonts/                  ← Self-hosted Inter + Jakarta Sans
    └── images/                 ← Optimizadas con Astro Image
```

---

## 6. Equivalencias de Funcionalidades JS → Modernas

| Funcionalidad | Legacy | Moderno | Complejidad |
|--------------|--------|---------|------------|
| Slider hero | Revolution Slider (jQuery) | CSS `@keyframes` + `animation` + `IntersectionObserver` | Media |
| Portfolio filter | jQuery Isotope | React island + CSS Grid + `Array.filter()` | Media |
| Carrusel | Owl Carousel | Embla Carousel (React) o CSS `scroll-snap` | Baja |
| Lightbox | FancyBox | `<dialog>` HTML nativo o React portal | Baja |
| Scroll animations | WOW.js | `IntersectionObserver` + CSS class toggle | Baja |
| Parallax | Custom JS | CSS `@scroll-timeline` o simple `transform` | Media |
| Counter | jQuery counter | `IntersectionObserver` + RAF loop | Baja |
| Skill bars | jQuery animate | CSS `transition` + `IntersectionObserver` | Baja |
| Sticky nav | jQuery scroll | CSS `position: sticky` | Ninguna |
| Smooth scroll | jQuery easing | CSS `scroll-behavior: smooth` | Ninguna |
| Scroll to top | jQuery animate | CSS anchor + scroll behavior | Ninguna |
| Mobile menu | jQuery toggle | React island + `useState` | Baja |
| Form AJAX | jQuery Form + PHP | Astro API route (fetch) | Media |
| Form validation | jQuery Validate | React Hook Form + Zod | Baja |
| Google Map | Google Maps v2 | `<iframe>` estático | Ninguna |
| Video embed | `<iframe>` YouTube | `<iframe>` YouTube (igual) | Ninguna |
| Audio player | HTML5 `<audio>` | HTML5 `<audio>` (igual) | Ninguna |
| Page transitions | Sin transiciones | Astro View Transitions API | Baja |

---

## 7. Plan de Trabajo por Fases

### Alcance del Primer Entregable (Clarificación)

**Lo que se entrega primero:**
Una adaptación fiel de la plantilla Splashes a Astro + Tailwind 4, que incluya:
1. **Página showcase de componentes** (`/componentes`) — equivalente al `shortcodes.html` original pero con tokens Grafivision y assets reales
2. **Todos los componentes construidos** y funcionales (átomos, moléculas, organismos)
3. **Imágenes reales** de Grafivision en lugar de imágenes rotas de la plantilla
4. **Videos reales** de las máquinas en las secciones que lo requieran
5. **Google Maps** via iframe (sin API key)

Esto permite validar visualmente la línea gráfica antes de construir las páginas reales con CMS.

---

### Phase 0 — Setup del Entorno
**Objetivo:** Proyecto Astro funcional con todas las dependencias.

#### Estrategia de datos — v1 (hardcoded)

No hay CMS ni API en v1. Los datos viven en archivos TypeScript en `src/lib/data/`:

```
src/lib/data/
  portfolio.ts    ← PortfolioItem[] hardcodeado con rutas Cloudflare
  team.ts         ← TeamMember[] hardcodeado
  services.ts     ← Service[] hardcodeado
  stats.ts        ← StatItem[] hardcodeado
  testimonials.ts ← Testimonial[] hardcodeado
  contact.ts      ← ContactInfo hardcodeado
  nav.ts          ← NavItem[] hardcodeado
```

Ejemplo:
```typescript
// src/lib/data/portfolio.ts
import type { PortfolioItem } from '@/lib/types'

export const portfolioItems: PortfolioItem[] = [
  {
    slug: 'branding-empresa-x',
    title: 'Branding Empresa X',
    category: 'branding',
    thumbnail: 'https://imagedelivery.net/ACCOUNT/Foto-1/public',
    images: ['https://imagedelivery.net/ACCOUNT/Foto-1/public'],
    year: 2025,
    featured: true,
  },
  // ...
]
```

Cuando el CMS personalizado esté listo, los archivos `.ts` se reemplazan por `fetch()` — sin tocar los componentes.

#### Astro output mode

- **v1 (datos hardcoded):** `output: 'static'` — genera HTML estático, deploy instantáneo en Vercel
- **v2 (con CMS):** cambiar a `output: 'server'` + `@astrojs/vercel` adapter

Empezamos con `static` para simplicidad y máxima performance.

#### Cloudflare Images

Las imágenes de producción se sirven desde **Cloudflare Images** (CDN).

```
URL format: https://imagedelivery.net/{ACCOUNT_HASH}/{IMAGE_ID}/{variant}
Variants:   public, thumbnail, portfolio, hero
```

Configuración en `astro.config.mjs`:
```javascript
export default defineConfig({
  image: {
    domains: ['imagedelivery.net'],  // permitir imágenes remotas Cloudflare
  },
})
```

Para desarrollo local, los assets en `public/images/` actúan como fallback hasta que estén subidos a Cloudflare.

**Flujo de imágenes:**
```
Desarrollo  → public/images/portfolio/Foto-1.webp  (local)
Producción  → https://imagedelivery.net/.../Foto-1/public  (Cloudflare CDN)
```

Variable de entorno para el account hash:
```
PUBLIC_CF_IMAGES_ACCOUNT=tu-account-hash
```

#### Instalación

```bash
pnpm create astro@latest . -- --template minimal
pnpm add tailwindcss @tailwindcss/vite
pnpm add react @astrojs/react
pnpm add lucide-react lucide-astro
pnpm add embla-carousel-react
pnpm add react-hook-form zod @hookform/resolvers
```

#### Archivos de configuración

- `astro.config.mjs` — `output: 'static'`, integrations, image domains Cloudflare
- `tsconfig.json` — strict mode, path alias `@/` → `src/`
- `.env` — `PUBLIC_CF_IMAGES_ACCOUNT`, `PUBLIC_MAPS_EMBED_URL`
- `.env.example` — plantilla sin valores reales (se commitea)
- `vercel.json` — configuración básica Vercel (si aplica)
- `src/styles/tokens.css` — `@theme { }` completo (ver sección 0.4)
- `src/styles/global.css` — `@import "tailwindcss"` + base reset
- `src/styles/animations.css` — `@keyframes` base
- `src/lib/types/index.ts` — interfaces TypeScript
- `src/lib/data/*.ts` — datos hardcodeados iniciales
- `src/lib/showcase-assets.ts` — mapeo de assets para `/componentes`

#### Copia de assets locales (solo desarrollo)

```bash
# Desde: C:/DevCode/Repositories/Grafivision/Web/
mkdir -p public/images/portfolio public/images/brand public/videos/machine

# Fotos portfolio
cp ../images/Foto-*.webp public/images/portfolio/

# Fotos de marca (normalizar nombres sin espacios)
cp "../images/GF 1.webp" public/images/brand/GF-1.webp
cp "../images/GF 2.webp" public/images/brand/GF-2.webp
cp "../images/GF 4.webp" public/images/brand/GF-4.webp
cp "../images/GF 5.webp" public/images/brand/GF-5.webp
cp "../images/GF 6.webp" public/images/brand/GF-6.webp

# Videos
cp ../videos/*.mp4 public/videos/machine/
```

**Entregable:** `pnpm dev` levanta en `localhost:4321` sin errores. Assets accesibles en `/images/` y `/videos/`.

---

### Phase 1 — Layout Base + Header + Footer
**Fuente:** Sección nav/header/footer de todas las páginas HTML

**Componentes a crear:**
```
atoms/Button.astro
atoms/Icon.astro
atoms/Text.astro
atoms/Divider.astro
molecules/NavItem.astro
molecules/SocialLink.astro
organisms/Header.astro          ← Logo + DesktopNav + MobileMenuTrigger
organisms/Footer.astro          ← Links + Social + Copyright
islands/MobileMenu.tsx          ← Drawer hamburger
layouts/BaseLayout.astro        ← html/head/ViewTransitions
layouts/PageLayout.astro        ← Header + slot + Footer
```

**Funcionalidades:**
- Nav sticky (CSS `position: sticky`) — reemplaza jQuery scroll
- Dropdown desktop en hover (CSS puro)
- Drawer mobile en `xl:` oculto (React island `client:load`)
- Logo linked, fuentes cargadas, tokens activos
- View Transitions activadas

**Validación de breakpoints:**
- sm(270): logo + hamburger
- md(360): logo + hamburger
- lg(440): logo + hamburger  
- xl(750): logo + nav completo + sin hamburger
- 2xl(1200): nav + espacio extra

---

### Phase 1.5 — Showcase de Componentes (`/componentes`)
**Fuente:** `shortcodes.html` — biblioteca completa de la plantilla  
**Objetivo:** Validar visualmente TODOS los componentes con la nueva línea gráfica antes de construir páginas.

Esta página es el equivalente moderno del `shortcodes.html` original. Sirve como:
- Referencia visual para el equipo
- Validación de tokens (colores, tipografía, espaciado)
- Demo funcional de todos los componentes interactivos

**URL:** `/componentes` (solo visible en desarrollo, no en producción final)

**Secciones del showcase en orden:**

```
/componentes
  1. Design Tokens         ← Paleta de colores + tipografía + escala
  2. Botones               ← Todas las variantes (primary/outline/ghost/pill + sizes)
  3. Alertas / Info Boxes  ← success/error/warning/info con dismiss
  4. Listas                ← splash/round/angle variants
  5. Divisores             ← default/accent/accent-thick
  6. Tipografía            ← h1-h6, body, caption, label, blockquote
  7. Tabs                  ← Icon tabs con contenido
  8. Toggles               ← Accordion simple
  9. Acordeones            ← Multi-item expandible
  10. Galería carousel     ← Fotos reales Grafivision (Foto-1..20)
  11. Post slider          ← Fotos reales Grafivision
  12. Barras de habilidad  ← Animated progress bars
  13. Contadores           ← Animated counters (IntersectionObserver)
  14. Video player         ← maquina_1_min.mp4 (video real)
  15. Cards de portfolio   ← Foto-* con hover overlay
  16. Cards de blog        ← Tipos: imagen/video/audio/quote
  17. Team member card     ← GF *.webp con bio y redes
  18. Google Maps iframe   ← Embed sin API key
  19. Formulario contacto  ← React Hook Form + Zod
  20. Formulario suscripción ← Newsletter
  21. Hero section         ← Con GF *.webp o video maquina
  22. Parallax section     ← Con fotos reales
  23. Footer               ← Completo
```

**Assets usados en showcase:**

```typescript
// src/lib/showcase-assets.ts
export const SHOWCASE_IMAGES = {
  portfolio: Array.from({ length: 20 }, (_, i) => `/images/portfolio/Foto-${i + 1}.webp`),
  brand:     ['/images/brand/GF-1.webp', '/images/brand/GF-2.webp', '/images/brand/GF-4.webp'],
  parallax:  ['/images/brand/GF-5.webp', '/images/brand/GF-6.webp'],
  hero:      '/images/brand/GF-1.webp',
}

export const SHOWCASE_VIDEOS = {
  hero:     '/videos/machine/maquina_1_min.mp4',
  process:  '/videos/machine/maquina_2_min.mp4',
}
```

**Imágenes rotas de la plantilla → reemplazadas con:**

| Imagen plantilla (rota) | Asset real Grafivision |
|------------------------|----------------------|
| `images/isotop/iso1..11.jpg` | `Foto-1.webp` → `Foto-11.webp` |
| `images/portfolio_three/*.jpg` | `Foto-12.webp` → `Foto-30.webp` |
| `images/blog-image*.jpg` | `Foto-31.webp` → `Foto-34.webp` |
| `images/team/img-team-*.jpg` | `GF-1.webp`, `GF-2.webp`, `GF-4.webp` |
| `images/parallax-*.jpg` | `GF-5.webp`, `GF-6.webp` |
| `images/slider/first-slide.jpg` | `GF-1.webp` (hero) |
| `images/ipad.png` | Eliminar — reemplazar con mockup real |
| `images/about/ipad3.png` | `GF-4.webp` |
| `images/post-slider-*.jpg` | `Foto-50.webp` → `Foto-53.webp` |
| `images/recent-posts/*.jpg` | `Foto-54.webp` → `Foto-70.webp` |

---

### Phase 2 — Home Page
**Fuente:** `index.html` — 9 secciones

**Secciones a migrar en orden:**

#### 2.1 Hero (reemplaza Revolution Slider)
```
organisms/Hero.astro
  ← No JS, solo CSS animations
  ← 3 slides con autoplay CSS (animation-delay)
  ← Headline + tagline + CTA
  ← Scroll-down indicator (CSS bounce)
  ← Imagen de fondo con lazy load
```

#### 2.2 About Preview
```
organisms/AboutPreview.astro
  ← Grid 2 col: texto + imagen
  ← DL list (title + description)
  ← Imagen iPad decorativa → modernizar con screenshot real
```

#### 2.3 Services Grid (4 items)
```
organisms/ServicesGrid.astro
molecules/ServiceItem.astro
  ← Grid 4 col desktop, 2 col lg, 1 col sm
  ← Icono Lucide + título + línea + descripción
  ← Items: Brand Identity, Packaging, Advertising, Editorial (Grafivision real)
```

#### 2.4 Stats/Counters (parallax)
```
organisms/StatsSection.astro
molecules/CounterItem.astro
islands/Counter.tsx
  ← Parallax → CSS background-attachment: fixed o scroll-driven
  ← Counter animation → IntersectionObserver + RAF
  ← 4 items: proyectos, clientes, años, ??? (datos reales Grafivision)
```

#### 2.5 Team Preview (carousel)
```
organisms/TeamSection.astro
molecules/TeamMemberCard.astro
islands/TeamCarousel.tsx       ← Embla Carousel
  ← Thumbnail selector → tab activo
  ← Panel detalle → nombre + cargo + bio + redes
```

#### 2.6 Portfolio Grid (isotope)
```
organisms/PortfolioGrid.astro
molecules/PortfolioCard.astro
islands/PortfolioFilter.tsx    ← React filter + CSS grid
  ← Categorías: Branding, Packaging, Publicidad, Editorial
  ← Hover overlay con título + categoría
  ← Filtro animado (CSS transition grid reorder)
```

#### 2.7 Blog Preview
```
organisms/BlogPreview.astro
molecules/BlogPostCard.astro
  ← 4 posts: imagen/video/audio/quote types
  ← Date badge, meta info, "Leer más"
  ← Datos desde CMS API (SSR)
```

#### 2.8 Testimonials
```
organisms/Testimonials.astro
islands/Carousel.tsx
  ← Fondo parallax
  ← Autoplay carrusel
  ← Título + separador + texto + autor
```

#### 2.9 Contact Info + Subscribe
```
organisms/ContactSection.astro
islands/SubscribeForm.tsx
  ← 4 info items: ubicación, teléfono, email, horario
  ← Google Maps iframe estático
  ← Newsletter subscribe con Astro API route
```

---

### Phase 3 — Página Nosotros
**Fuente:** `aboutus.html`

**Secciones:**
```
pages/nosotros.astro
  ← PageHero.astro — "Nosotros" banner
  ← AboutPreview (historia empresa)
  ← ServicesGrid (servicios detallados)
  ← SkillsSection.astro + atoms/SkillBar.astro (CSS animation)
  ← StatsSection (counters)
  ← ClientsGrid.astro (logos clientes — datos desde CMS)
```

---

### Phase 4 — Portafolio
**Fuente:** `portfolio-four-columns.html`, `portfolio-three-columns.html`, `portfolio-two-columns.html`, `portfolio-single-item.html`

**Páginas:**
```
pages/portafolio/index.astro
  ← SSR: fetch categorías + items desde CMS
  ← PortfolioFilter.tsx (island) — filtro por categoría
  ← Grid configurable: 4-col, 3-col, 2-col (toggle o parámetro URL)

pages/portafolio/[slug].astro
  ← SSR: fetch item por slug
  ← Galería de imágenes del proyecto
  ← Carousel de imágenes (Embla)
  ← Lightbox al hacer clic
  ← Información del proyecto: cliente, categoría, año, descripción
  ← Proyectos relacionados
```

---

### Phase 5 — Contacto
**Fuente:** `contact.html`

```
pages/contacto.astro
  ← PageHero.astro
  ← Info cards: dirección, teléfono, email, horario, redes
  ← Google Maps iframe
  ← ContactForm.tsx (React island — React Hook Form + Zod)
  
pages/api/contact.ts
  ← Astro server endpoint
  ← Validación Zod en servidor
  ← Email via servicio SMTP (Resend/SendGrid)
  ← Rate limiting básico
```

---

### Phase 6 — Equipo
**Fuente:** `team.html`

```
pages/equipo.astro
  ← PageHero.astro
  ← Grid de miembros (SSR desde CMS)
  ← TeamMemberCard.astro — foto + nombre + cargo + bio + redes
  ← Lightbox o modal de detalle
```

---

### Phase 7 — Blog
**DESCARTADO en v1.** El blog no forma parte del alcance actual.  
Puede planificarse para v2 cuando el CMS personalizado esté disponible.

---

### Phase 8 — SEO + Meta + Sitemap
```
  ← @astrojs/sitemap integration
  ← OG meta tags (title, description, image) en BaseLayout
  ← JSON-LD: Organization, LocalBusiness, BreadcrumbList
  ← robots.txt
  ← Canonical URLs
  ← Astro SEO meta tags dinámicos desde CMS
```

---

### Phase 9 — Performance Audit
```
  ← Lighthouse ≥ 95 en todas las páginas
  ← LCP < 2.5s
  ← CLS < 0.1
  ← Bundle JS inicial < 50KB
  ← Images: WebP + responsive via <Image />
  ← Fonts: self-hosted, font-display: swap
  ← Critical CSS inline
  ← Prefetch de rutas internas
```

---

### Phase 10 — Deploy

**Stack de infraestructura confirmado:**
- **Hosting:** Vercel (Astro static adapter)
- **CDN / Imágenes:** Cloudflare Images
- **Dominio:** `grafivision.com.co` (ya existente)

```
vercel.json (si aplica):
  ← Redirects de URLs legacy si cambian rutas
  ← Headers de seguridad (X-Frame-Options, CSP básico)

Variables de entorno en Vercel:
  PUBLIC_CF_IMAGES_ACCOUNT   ← Cloudflare Images account hash
  PUBLIC_MAPS_EMBED_URL      ← URL iframe Google Maps
  SMTP_API_KEY               ← Resend o servicio email (Fase 5)
  PUBLIC_SITE_URL            ← https://grafivision.com.co

Flujo de deploy:
  pnpm build → dist/ estático → Vercel CDN global
  
Cloudflare Images setup:
  1. Subir Foto-*.webp + GF-*.webp a Cloudflare Images
  2. Crear variantes: public, thumbnail (400px), portfolio (800px), hero (1600px)
  3. Actualizar PUBLIC_CF_IMAGES_ACCOUNT en .env y Vercel
  4. Actualizar rutas en src/lib/data/*.ts

Preview deployments:
  ← Automáticos en cada PR (Vercel)
  ← URL preview para validación del cliente
```

**Migración de `output: 'static'` → `'server'` cuando llegue el CMS:**
```bash
pnpm add @astrojs/vercel
# Cambiar en astro.config.mjs:
# output: 'static' → output: 'server'
# adapter: vercel()
```

---

## 8. Tabla de Decisiones Arquitectónicas

| Decisión | Opción elegida | Alternativa descartada | Razón |
|----------|---------------|----------------------|-------|
| Framework | Astro 5 SSR | Next.js | Mejor para content sites, menos JS, SSR nativo |
| Estilos | Tailwind 4 puro | CSS Modules / Sass | Consistencia de tokens, utilidades atómicas |
| Slider hero | CSS animations custom | Swiper.js / Splide.js | Zero dependencies, control total |
| Carrusel | Embla Carousel | Owl Carousel / Swiper | Tiny bundle, headless, accesible |
| Portfolio filter | React island | Isotope.js | Tree-shakeable, sin jQuery |
| Formulario | React Hook Form + Zod | Formik / nativo | Bundle pequeño, validación type-safe |
| Iconos | Lucide | Font Awesome / Heroicons | Tree-shakeable, moderno, consistente |
| Maps | iframe estático | Google Maps SDK | Zero JS, GDPR friendly |
| Fuentes | Self-hosted | Google Fonts CDN | Performance, privacidad, control |
| Lightbox | `<dialog>` nativo | FancyBox / GLightbox | Zero deps, accesible, nativo |
| Page transitions | Astro View Transitions | Framer Motion | Nativo Astro, CSS-based, no JS extra |
| Animaciones scroll | IntersectionObserver CSS | GSAP / AOS | Zero deps, performante |
| Parallax | CSS scroll-driven | JS parallax libraries | Sin JS extra, GPU-accelerated |

---

## 9. Componentes NO a Migrar

Los siguientes elementos de la plantilla no tienen valor para Grafivision y se descartan:

| Elemento | Razón |
|----------|-------|
| Shop (WooCommerce pages) | No es e-commerce |
| Twitter feed widget | API obsoleta, no relevante |
| Flickr widget | Red irrelevante para agencia |
| jQuery UI Calendar | No hay funcionalidad de booking |
| Splash PNG decorativos (img/splash-1..4.png) | Estética 2016, no encaja con brand moderno |
| Revolution Slider con video YouTube en slide | Reemplazado por Hero moderno |
| Google Fonts via HTTP | Migrar a self-hosted |
| Google Maps v2 API URL obsoleta | iframe estático moderno |

---

## 10. Consideraciones CMS (Futura Integración)

Todas las páginas deben anticipar que **el contenido vendrá del CMS**. Estructura de datos por página:

### Home
```typescript
interface HomePageData {
  hero: { slides: HeroSlide[] }
  about: { title: string; description: string; image: CMSImage }
  services: ServiceItem[]
  stats: StatItem[]
  portfolio: PortfolioItem[]        // preview: últimos 8-10
  blog: BlogPost[]                  // preview: últimos 4
  testimonials: Testimonial[]
  contact: ContactInfo
}
```

### Portafolio
```typescript
interface PortfolioItem {
  slug: string
  title: string
  category: 'branding' | 'packaging' | 'publicidad' | 'editorial'
  thumbnail: CMSImage
  images: CMSImage[]
  client?: string
  year: number
  description?: string
  featured: boolean
}
```

### Blog
```typescript
interface BlogPost {
  slug: string
  title: string
  excerpt: string
  content: string               // HTML o MDX
  type: 'image' | 'video' | 'audio' | 'quote'
  media?: { url: string; type: string }
  category: string
  tags: string[]
  publishedAt: string
  author: { name: string; avatar: CMSImage }
}
```

---

## 11. Checklist Pre-Inicio (Phase 0)

### Confirmado ✅
- [x] Colores de marca → Rojo `#E8222B` + dark base (sección 0.2)
- [x] Tipografías → Plus Jakarta Sans + Inter (sección 0.3)
- [x] Línea gráfica → Espíritu Splashes + rojo Grafivision (sección 0.1)
- [x] Assets → 155 fotos WebP + 11 videos MP4 disponibles (sección 0.6)
- [x] Google Maps → iframe embed sin API key (sección 0.7)
- [x] Blog → **Descartado en v1**
- [x] Shop → **Descartado**
- [x] CMS → **Custom, futura integración. v1 usa datos hardcodeados en `src/lib/data/`**
- [x] Hosting → **Vercel** (`output: 'static'` en v1)
- [x] Imágenes CDN → **Cloudflare Images**
- [x] Primer entregable → Showcase `/componentes` + páginas principales

### Pendiente antes de arrancar
- [ ] Obtener logo vectorial SVG de Grafivision
- [ ] Confirmar lista exacta de servicios reales (para `ServicesGrid` y datos hardcodeados)
- [ ] Confirmar URL embed Google Maps de la oficina
- [ ] Configurar cuenta Cloudflare Images y obtener `ACCOUNT_HASH`
- [ ] Confirmar servicio email para formulario de contacto (Resend recomendado — plan gratis 3000/mes)

---

*Plan creado: 15-04-2026*  
*Basado en análisis de: Splashes Creative Agency Template v1.0*  
*Stack destino: Astro 5 SSR + Tailwind CSS 4 + TypeScript + React islands*

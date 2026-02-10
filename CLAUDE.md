# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Dev Commands

- `npm run dev` — Start Vite dev server (http://localhost:5173)
- `npm run build` — Production build to `dist/`
- `npm run preview` — Preview production build locally
- `npm run deploy` — Build + create `.nojekyll` for GitHub Pages

No test runner or linter is configured.

## Architecture

**Multi-page Lit web component app** built with Vite. Each HTML file in the root is a separate page entry point (auto-discovered by `vite.config.js`).

### Pages

- `index.html` — Home/landing
- `book.html` — Book detail view
- `edit-book.html` — Book editing (tabbed interface)
- `edit-series.html` — Series management with drag-and-drop
- `signup.html` — User registration
- `components.html` — Component showcase/documentation
- `forms.html`, `dropdown-test.html` — Testing pages

### Components (`src/components/`)

All components extend `LitElement`, use Shadow DOM, and follow `ol-*` naming (e.g., `ol-button`, `ol-input`). Registered in `src/components/index.js` via side-effect imports.

Key components: `ol-button`, `ol-input` (form-associated via `ElementInternals`), `ol-field` (label+hint+error wrapper), `ol-search` (autocomplete with keyboard nav), `ol-tab-group`/`ol-tab`/`ol-tab-panel`, `ol-sortable-list`/`ol-sortable-item` (drag-and-drop), `ol-star-rating`, `ol-theme-toggle`.

### Data

Static JSON files in `public/data/` — `books.json` and `series.json`. Loaded via `fetch()` in page-level scripts.

### CSS Design Token System (`styles/`)

Three-tier token architecture:
1. **`primitives.css`** — Base values (color palette, font families, spacing scale)
2. **`semantic.css`** — Purpose-based tokens (`--color-bg-primary`, `--input-padding-y`, etc.)
3. **`index.css`** — Global layout and element styles

Imported via `styles/vars.css`. Always use tokens (`var(--color-text)`, `var(--spacing-3)`) instead of hardcoded values.

Token categories: `--color-*` (bg, text, border), `--spacing-*` (1-8 scale), `--body-font-*`/`--heading-font-*`, `--button-padding-*`/`--input-padding-*`, `--radius-*`, `--border-width-*`, `--focus-ring-*`.

## Component Conventions

Detailed rules in `.cursor/rules/component-standards.mdc` and `.cursor/rules/styling-conventions.mdc`. Key points:

- **Naming**: `ol-` prefix, kebab-case tags, PascalCase classes (`OlButton`)
- **Properties**: Use `static properties` with `reflect: true` for styling hooks. Initialize defaults in `constructor()`.
- **Events**: Kebab-case custom event names (e.g., `ol-search-select`, `ol-sort`). Always set `bubbles: true, composed: true`.
- **Styling**: Use `static styles` with Lit's `css` tag. Style via `:host` and `:host([attribute])`. Mobile-first responsive design.
- **Accessibility**: ARIA attributes required. Keyboard nav for interactive widgets (Tab, Enter, Space, Escape, Arrow keys, Home/End). Visible focus indicators.
- **Lifecycle**: Clean up listeners/timers in `disconnectedCallback()`. No side effects in `constructor()` (SSR-friendly).
- **Private methods**: Prefix with underscore (`_handleClick`)

## Production

- Base path is `/open-library-prototype/` in production, `/` in dev
- Deploys to GitHub Pages via `.github/workflows/deploy.yml` on push to `main`
- Dependencies: `lit@^3.1.0` (runtime), `vite@^5.0.0` (dev)

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

### Page structure

Each HTML page follows the same pattern: loads Google Fonts (Fraunces + Inter), imports `styles/index.css`, imports `src/components/index.js` (registers all `ol-*` elements), then has an inline `<script type="module">` for page-specific logic (data fetching, DOM wiring). There is no client-side router — navigation is plain links between HTML files.

Pages: `index.html` (home), `search.html` (search results), `book.html` (book detail), `edit-book.html` (tabbed book editing), `edit-series.html` (drag-and-drop series management), `signup.html` (registration), `components.html` (component showcase), `forms.html`/`dropdown-test.html` (testing).

### Components (`src/components/`)

All components extend `LitElement`, use Shadow DOM, and follow `ol-*` naming. Registered in `src/components/index.js` via side-effect imports. When adding a new component, add its import to `index.js`.

Key components: `ol-button`, `ol-input` (form-associated via `ElementInternals`), `ol-field` (label+hint+error wrapper), `ol-search`/`ol-search-modal`/`ol-search-result-item`/`ol-past-search-item`/`ol-search-filters`/`ol-search-filter-bar`/`ol-filter-modal` (search system), `ol-tab-group`/`ol-tab`/`ol-tab-panel`, `ol-sortable-list`/`ol-sortable-item` (drag-and-drop), `ol-star-rating`, `ol-theme-toggle`, `ol-main-nav`.

### Data layer

Static JSON files in `public/data/` — `books.json` and `series.json`. The `SearchDataService` singleton (`src/search-data-service.js`) caches fetched data, provides search/filter methods across books/authors/series, handles text highlighting, and manages past searches in localStorage. It uses `import.meta.env.BASE_URL` for path resolution. Components import it directly — there is no global state store.

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
- **SVG in templates**: When interpolating SVG child elements (`<path>`, `<line>`, etc.) via `${...}`, use Lit's `svg` tagged template, not `html`. The `html` parser creates elements in the HTML namespace which won't render as SVG.

## Production

- Base path is `/open-library-prototype/` in production, `/` in dev (set in `vite.config.js` based on `command`)
- Deploys to GitHub Pages via `.github/workflows/deploy.yml` on push to `main`
- Dependencies: `lit@^3.1.0` (runtime), `vite@^5.0.0` (dev)

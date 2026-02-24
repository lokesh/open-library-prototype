import { LitElement, html, css } from 'lit';
import './ol-theme-toggle.js';
import './ol-role-toggle.js';
import './ol-search-modal.js';

export class OlMainNav extends LitElement {
  static properties = {
    hideSearch: { type: Boolean, attribute: 'hide-search', reflect: true },
    _searchOpen: { type: Boolean, state: true },
    _menuOpen: { type: Boolean, state: true },
  };

  static styles = css`
    :host {
      display: block;
      margin-bottom: var(--spacing-section);
      position: relative;
    }

    nav {
      display: flex;
      align-items: center;
      margin-bottom: var(--spacing-section);
      margin-left: -20px;
      margin-right: -20px;
      font-size: var(--body-font-size-sm);
    }

    /* ─── Hamburger Button ─── */

    .hamburger {
      display: flex;
      align-items: center;
      justify-content: center;
      background: none;
      border: none;
      color: var(--color-text);
      cursor: pointer;
      padding: var(--spacing-inline);
      margin-left: var(--spacing-2);
      flex-shrink: 0;
    }

    .hamburger:focus-visible {
      outline: var(--focus-ring-width) solid var(--focus-ring-color);
      outline-offset: 2px;
      border-radius: var(--radius-1);
    }

    .hamburger svg {
      width: 22px;
      height: 22px;
    }

    @media (min-width: 768px) {
      .hamburger {
        display: none;
      }
    }

    /* ─── Nav Links ─── */

    ul {
      list-style: none;
      display: none;
      flex-wrap: nowrap;
      flex: 1;
      margin: 0;
      gap: 0;
      padding: 0;
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: thin;
    }

    :host([menu-open]) ul {
      display: flex;
      flex-direction: column;
      position: absolute;
      top: 100%;
      left: var(--spacing-2);
      right: auto;
      min-width: 160px;
      width: max-content;
      background-color: var(--color-bg-elevated);
      border: var(--border-width-control) solid var(--color-border);
      border-radius: var(--radius-button);
      padding: var(--spacing-inline);
      z-index: var(--z-index-dropdown, 100);
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      opacity: 1;
      transition: opacity 200ms ease;
    }

    @media (min-width: 768px) {
      ul {
        display: flex;
        gap: var(--spacing-inline);
        padding: 0 20px;
      }

      :host([menu-open]) ul {
        position: static;
        flex-direction: row;
        background: none;
        border: none;
        border-radius: 0;
        padding: 0 20px;
        box-shadow: none;
        min-width: 0;
        width: auto;
      }
    }

    /* Hide scrollbar on webkit browsers for cleaner look */
    ul::-webkit-scrollbar {
      height: 4px;
    }

    ul::-webkit-scrollbar-track {
      background: transparent;
    }

    ul::-webkit-scrollbar-thumb {
      background: var(--color-bg-elevated);
      border-radius: 2px;
    }

    ul::-webkit-scrollbar-thumb:hover {
      background: var(--color-bg-elevated-hovered);
    }

    li {
      margin: 0;
      flex-shrink: 0;
    }

    .theme-toggle-item {
      display: flex;
      align-items: center;
    }

    a {
      display: block;
      color: var(--color-text);
      text-decoration: none;
      font-weight: var(--font-weight-semibold);
      padding: var(--spacing-inline) var(--spacing-inline);
      border-bottom: var(--border-width-2) solid transparent;
    }

    :host([menu-open]) a {
      padding: var(--spacing-2) var(--spacing-3);
      border-bottom: none;
      border-radius: var(--radius-1);
    }

    :host([menu-open]) a:hover {
      background-color: var(--color-bg-elevated-hovered);
      border-bottom: none;
    }

    @media (min-width: 768px) {
      :host([menu-open]) a {
        padding: var(--spacing-inline) var(--spacing-inline);
        border-bottom: var(--border-width-2) solid transparent;
        border-radius: 0;
      }

      :host([menu-open]) a:hover {
        background-color: transparent;
        border-bottom: var(--border-width-2) solid var(--color-text);
      }
    }

    a:hover {
      border-bottom: var(--border-width-2) solid var(--color-text);
    }

    /* ─── Mobile menu overlay backdrop ─── */

    .menu-backdrop {
      display: none;
    }

    :host([menu-open]) .menu-backdrop {
      display: block;
      position: fixed;
      inset: 0;
      z-index: 99;
    }

    @media (min-width: 768px) {
      :host([menu-open]) .menu-backdrop {
        display: none;
      }
    }

    /* ─── Nav Actions (search + theme toggle) ─── */

    .nav-actions {
      display: flex;
      align-items: center;
      gap: var(--spacing-2);
      flex-shrink: 0;
      margin-left: auto;
      padding-right: 20px;
    }

    /* ─── Search Trigger (Desktop) ─── */

    .search-trigger {
      display: none;
      align-items: center;
      gap: var(--spacing-2);
      background: var(--color-bg-elevated);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-input-large);
      color: var(--color-text-secondary);
      font-size: var(--body-font-size-sm);
      font-family: inherit;
      padding: var(--spacing-2) var(--spacing-3);
      cursor: pointer;
      white-space: nowrap;
      min-width: 180px;
    }

    @media (min-width: 768px) {
      .search-trigger {
        display: flex;
      }
    }

    .search-trigger:hover {
      border-color: var(--color-border-focused);
      color: var(--color-text);
    }

    .search-trigger:focus-visible {
      outline: var(--focus-ring-width) solid var(--focus-ring-color);
      outline-offset: 2px;
    }

    .search-trigger-icon {
      width: 16px;
      height: 16px;
      flex-shrink: 0;
    }

    .search-trigger-text {
      flex: 1;
      text-align: left;
    }

    /* ─── Search Trigger (Mobile) ─── */

    .search-trigger-mobile {
      display: flex;
      align-items: center;
      justify-content: center;
      background: none;
      border: none;
      color: var(--color-text);
      cursor: pointer;
      padding: var(--spacing-1);
      border-radius: var(--radius-full);
    }

    @media (min-width: 768px) {
      .search-trigger-mobile {
        display: none;
      }
    }

    .search-trigger-mobile:hover {
      background: var(--color-bg-hovered);
    }

    .search-trigger-mobile:focus-visible {
      outline: var(--focus-ring-width) solid var(--focus-ring-color);
      outline-offset: 2px;
    }

    .search-trigger-mobile svg {
      width: 20px;
      height: 20px;
    }

    /* ─── Barcode Scan Button ─── */

    .barcode-trigger {
      display: flex;
      align-items: center;
      justify-content: center;
      background: none;
      border: 1px solid var(--input-border);
      color: var(--color-text-secondary);
      cursor: pointer;
      padding: 0;
      border-radius: var(--radius-input-large);
      flex-shrink: 0;
      align-self: stretch;
      height: 36px;
      width: 36px;
    }

    .barcode-trigger:hover {
      border-color: var(--color-border-focused);
      color: var(--color-text);
    }

    .barcode-trigger:focus-visible {
      outline: var(--focus-ring-width) solid var(--focus-ring-color);
      outline-offset: 2px;
    }

    .barcode-trigger svg {
      width: 18px;
      height: 18px;
    }

    /* ─── Hide search when attribute set ─── */

    :host([hide-search]) .search-trigger,
    :host([hide-search]) .search-trigger-mobile {
      display: none;
    }
  `;

  constructor() {
    super();
    this.hideSearch = false;
    this._searchOpen = false;
    this._menuOpen = false;
  }

  _toggleMenu() {
    this._menuOpen = !this._menuOpen;
    if (this._menuOpen) {
      this.setAttribute('menu-open', '');
    } else {
      this.removeAttribute('menu-open');
    }
  }

  _closeMenu() {
    this._menuOpen = false;
    this.removeAttribute('menu-open');
  }

  _openSearch() {
    this._searchOpen = true;
  }

  _closeSearch() {
    this._searchOpen = false;
  }

  _handleSeeAll(e) {
    this._searchOpen = false;
    const { query, category } = e.detail;
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (category) params.set('category', category);
    window.location.href = `search.html?${params.toString()}`;
  }

  render() {
    return html`
      <nav>
        <button
          class="hamburger"
          @click=${this._toggleMenu}
          aria-label="${this._menuOpen ? 'Close menu' : 'Open menu'}"
          aria-expanded="${this._menuOpen}"
        >
          ${this._menuOpen
            ? html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>`
            : html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="3" y1="6" x2="21" y2="6"/>
                <line x1="3" y1="12" x2="21" y2="12"/>
                <line x1="3" y1="18" x2="21" y2="18"/>
              </svg>`
          }
        </button>
        <ul>
          <li><a href="index.html" @click=${this._closeMenu}>Home</a></li>
          <li><a href="book.html" @click=${this._closeMenu}>Book</a></li>
          <li><a href="signup.html" @click=${this._closeMenu}>Sign Up</a></li>
          <li><a href="components.html" @click=${this._closeMenu}>Components</a></li>
          <li><a href="forms.html" @click=${this._closeMenu}>Tests</a></li>
          <li class="theme-toggle-item"><ol-theme-toggle></ol-theme-toggle></li>
          <li class="theme-toggle-item"><ol-role-toggle></ol-role-toggle></li>
        </ul>
        <div class="nav-actions">
          <button class="search-trigger-mobile" @click=${this._openSearch} aria-label="Search">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </button>
          <button class="search-trigger" @click=${this._openSearch} aria-label="Search">
            <svg class="search-trigger-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <span class="search-trigger-text">Search</span>
          </button>
          <button class="barcode-trigger" aria-label="Scan barcode">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 7V5a2 2 0 0 1 2-2h2"/>
              <path d="M17 3h2a2 2 0 0 1 2 2v2"/>
              <path d="M21 17v2a2 2 0 0 1-2 2h-2"/>
              <path d="M7 21H5a2 2 0 0 1-2-2v-2"/>
              <path d="M8 7v10"/>
              <path d="M12 7v10"/>
              <path d="M17 7v10"/>
            </svg>
          </button>
        </div>
      </nav>
      <div class="menu-backdrop" @click=${this._closeMenu}></div>

      <ol-search-modal
        ?open=${this._searchOpen}
        @ol-search-modal-close=${this._closeSearch}
        @ol-search-modal-see-all=${this._handleSeeAll}
      ></ol-search-modal>
    `;
  }
}

customElements.define('ol-main-nav', OlMainNav);

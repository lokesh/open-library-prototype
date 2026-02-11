import { LitElement, html, css } from 'lit';
import './ol-theme-toggle.js';
import './ol-search-modal.js';

export class OlMainNav extends LitElement {
  static properties = {
    hideSearch: { type: Boolean, attribute: 'hide-search', reflect: true },
    _searchOpen: { type: Boolean, state: true },
  };

  static styles = css`
    :host {
      display: block;
      margin-bottom: var(--spacing-section);
    }

    nav {
      display: flex;
      align-items: center;
      margin-bottom: var(--spacing-section);
      margin-left: -20px;
      margin-right: -20px;
      font-size: var(--body-font-size-sm);
    }

    ul {
      list-style: none;
      display: flex;
      flex-wrap: nowrap;
      flex: 1;
      margin: 0;
      gap: var(--spacing-inline);
      padding: 0 20px;
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: thin;
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

    a {
      display: block;
      color: var(--color-text);
      text-decoration: none;
      font-weight: var(--font-weight-semibold);
      padding: var(--spacing-inline) var(--spacing-inline);
      border-bottom: var(--border-width-2) solid transparent;
    }

    a:hover {
      border-bottom: var(--border-width-2) solid var(--color-text);
    }

    /* ─── Nav Actions (search + theme toggle) ─── */

    .nav-actions {
      display: flex;
      align-items: center;
      gap: var(--spacing-2);
      flex-shrink: 0;
      padding-right: 20px;
    }

    /* ─── Search Trigger (Desktop) ─── */

    .search-trigger {
      display: none;
      align-items: center;
      gap: var(--spacing-2);
      background: var(--color-bg-elevated);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-full);
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
        <ul>
          <li><a href="index.html">Home</a></li>
          <li><a href="book.html">Book</a></li>
          <li><a href="signup.html">Sign Up</a></li>
          <li><a href="components.html">Components</a></li>
          <li><a href="forms.html">Tests</a></li>
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
          <ol-theme-toggle></ol-theme-toggle>
        </div>
      </nav>

      <ol-search-modal
        ?open=${this._searchOpen}
        @ol-search-modal-close=${this._closeSearch}
        @ol-search-modal-see-all=${this._handleSeeAll}
      ></ol-search-modal>
    `;
  }
}

customElements.define('ol-main-nav', OlMainNav);

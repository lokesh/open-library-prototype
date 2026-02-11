import { LitElement, html, css, nothing } from 'lit';
import searchDataService from '../search-data-service.js';
import './ol-past-search-item.js';
import './ol-search-result-item.js';
import './ol-search-filter-bar.js';

const CATEGORIES = [
  { id: 'books', label: 'Books' },
  { id: 'authors', label: 'Authors' },
  { id: 'search-inside', label: 'Search Inside' },
  { id: 'subjects', label: 'Subjects' },
  { id: 'lists', label: 'Lists' },
];

export class OlSearchModal extends LitElement {
  static properties = {
    open: { type: Boolean, reflect: true },
    _query: { type: String, state: true },
    _activeCategory: { type: String, state: true },
    _results: { type: Array, state: true },
    _pastSearches: { type: Array, state: true },
    _activeIndex: { type: Number, state: true },
  };

  static styles = css`
    :host {
      display: none;
    }

    :host([open]) {
      display: block;
    }

    .backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: var(--z-index-modal, 2000);
      display: flex;
      align-items: flex-start;
      justify-content: center;
      padding-top: 10vh;
    }

    @media (max-width: 767px) {
      .backdrop {
        padding-top: 0;
        align-items: stretch;
      }
    }

    .modal {
      background: var(--color-bg-elevated);
      border-radius: var(--radius-overlay);
      border: 1px solid var(--color-border);
      width: 100%;
      max-width: 640px;
      max-height: 80vh;
      display: flex;
      flex-direction: column;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      overflow: hidden;
    }

    @media (max-width: 767px) {
      .modal {
        max-width: none;
        max-height: none;
        height: 100dvh;
        border-radius: 0;
        border: none;
      }
    }

    /* ─── Header ─── */

    .search-input-row {
      display: flex;
      align-items: center;
      gap: var(--spacing-3);
      padding: var(--spacing-3) var(--spacing-4);
      border-bottom: 1px solid var(--color-border-subtle);
    }

    .search-icon {
      width: 20px;
      height: 20px;
      flex-shrink: 0;
      color: var(--color-text-secondary);
    }

    .search-input {
      flex: 1;
      border: none;
      background: transparent;
      font-size: var(--input-font-size);
      font-family: inherit;
      color: var(--input-color-text);
      outline: none;
      min-width: 0;
      min-height: var(--input-min-height);
      padding: var(--input-padding-y) 0;
    }

    .search-input::placeholder {
      color: var(--input-color-placeholder);
    }

    .close-btn {
      flex-shrink: 0;
      background: none;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm);
      color: var(--color-text-secondary);
      font-size: var(--body-font-size-sm);
      font-family: inherit;
      padding: var(--spacing-1) var(--spacing-2);
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: var(--spacing-1);
    }

    .close-btn:hover {
      background: var(--color-bg-hovered);
      color: var(--color-text);
    }

    .close-btn:focus-visible {
      outline: var(--focus-ring-width) solid var(--focus-ring-color);
      outline-offset: 2px;
    }

    .close-icon {
      display: none;
      width: 18px;
      height: 18px;
    }

    .close-text {
      display: inline;
    }

    @media (max-width: 767px) {
      .close-icon {
        display: block;
      }
      .close-text {
        display: none;
      }
      .close-btn {
        border: none;
        padding: var(--spacing-2);
      }
    }

    /* ─── Category Tabs ─── */

    .category-tabs {
      display: flex;
      gap: var(--spacing-1);
      padding: 0 var(--spacing-4);
      border-bottom: 1px solid var(--color-border-subtle);
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: none;
    }

    .category-tabs::-webkit-scrollbar {
      display: none;
    }

    .category-tab {
      flex-shrink: 0;
      background: none;
      border: none;
      border-bottom: 2px solid transparent;
      color: var(--color-text-secondary);
      font-size: var(--body-font-size-sm);
      font-family: inherit;
      font-weight: var(--font-weight-medium);
      padding: var(--spacing-2) var(--spacing-3);
      cursor: pointer;
      white-space: nowrap;
    }

    .category-tab:hover {
      color: var(--color-text);
    }

    .category-tab:focus-visible {
      outline: var(--focus-ring-width) solid var(--focus-ring-color);
      outline-offset: -2px;
      border-radius: var(--radius-sm);
    }

    .category-tab.active {
      color: var(--color-text-strong);
      border-bottom-color: var(--color-bg-primary);
    }

    /* ─── Body ─── */

    .modal-body {
      flex: 1;
      overflow-y: auto;
      min-height: 0;
    }

    .section-label {
      padding: var(--spacing-3) var(--spacing-4) var(--spacing-1);
      font-size: var(--body-font-size-sm);
      font-weight: var(--font-weight-semibold);
      color: var(--color-text-secondary);
      text-transform: capitalize;
    }

    .no-results {
      padding: var(--spacing-6) var(--spacing-4);
      text-align: center;
      color: var(--color-text-secondary);
      font-size: var(--body-font-size);
    }

    .placeholder-msg {
      padding: var(--spacing-6) var(--spacing-4);
      text-align: center;
      color: var(--color-text-secondary);
      font-size: var(--body-font-size-sm);
    }

    /* Result focus highlight */
    ol-search-result-item.focused {
      background: var(--color-bg-hovered);
    }

    /* ─── Footer ─── */

    .modal-footer {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      padding: var(--spacing-3) var(--spacing-4);
      border-top: 1px solid var(--color-border-subtle);
    }

    /* Status live region (visually hidden) */
    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }
  `;

  constructor() {
    super();
    this.open = false;
    this._query = '';
    this._activeCategory = 'books';
    this._results = [];
    this._pastSearches = [];
    this._activeIndex = -1;
    this._debounceTimer = null;
    this._previousFocus = null;
  }

  // ─── Lifecycle ──────────────────────────────────────

  updated(changed) {
    if (changed.has('open')) {
      if (this.open) {
        this._onOpen();
      } else {
        this._onClose();
      }
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._unlockScroll();
    clearTimeout(this._debounceTimer);
  }

  async _onOpen() {
    this._previousFocus = document.activeElement;
    this._pastSearches = searchDataService.getPastSearches();
    this._query = '';
    this._results = [];
    this._activeIndex = -1;
    this._lockScroll();

    await searchDataService.ensureLoaded();

    // Wait for render then focus input
    await this.updateComplete;
    const input = this.shadowRoot.querySelector('.search-input');
    if (input) input.focus();
  }

  _onClose() {
    this._unlockScroll();
    clearTimeout(this._debounceTimer);
    if (this._previousFocus && typeof this._previousFocus.focus === 'function') {
      this._previousFocus.focus();
    }
    this._previousFocus = null;
  }

  _lockScroll() {
    document.body.style.overflow = 'hidden';
  }

  _unlockScroll() {
    document.body.style.overflow = '';
  }

  // ─── Event Handlers ─────────────────────────────────

  _close() {
    this.dispatchEvent(
      new CustomEvent('ol-search-modal-close', {
        bubbles: true,
        composed: true,
      })
    );
  }

  _handleBackdropClick(e) {
    if (e.target === e.currentTarget) {
      this._close();
    }
  }

  _handleInputChange(e) {
    const value = e.target.value;
    this._query = value;
    this._activeIndex = -1;
    clearTimeout(this._debounceTimer);
    this._debounceTimer = setTimeout(() => this._runSearch(), 200);
  }

  _handleInputKeydown(e) {
    switch (e.key) {
      case 'Escape':
        e.preventDefault();
        this._close();
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (this._results.length) {
          this._activeIndex = Math.min(this._activeIndex + 1, this._results.length - 1);
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (this._results.length) {
          this._activeIndex = Math.max(this._activeIndex - 1, -1);
        }
        break;
      case 'Enter':
        e.preventDefault();
        if (this._activeIndex >= 0 && this._results[this._activeIndex]) {
          this._selectResult(this._results[this._activeIndex]);
        } else if (this._query.trim()) {
          this._seeAllResults();
        }
        break;
      case 'Home':
        if (this._results.length) {
          e.preventDefault();
          this._activeIndex = 0;
        }
        break;
      case 'End':
        if (this._results.length) {
          e.preventDefault();
          this._activeIndex = this._results.length - 1;
        }
        break;
    }
  }

  _handleModalKeydown(e) {
    if (e.key === 'Escape') {
      e.preventDefault();
      this._close();
      return;
    }

    // Focus trap
    if (e.key === 'Tab') {
      const focusable = this.shadowRoot.querySelectorAll(
        'input, button, [tabindex]:not([tabindex="-1"])'
      );
      const arr = Array.from(focusable).filter(
        (el) => !el.disabled && el.offsetParent !== null
      );
      if (!arr.length) return;

      const first = arr[0];
      const last = arr[arr.length - 1];

      const activeEl = this.shadowRoot.activeElement;
      if (e.shiftKey && activeEl === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && activeEl === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  _handleCategoryClick(categoryId) {
    this._activeCategory = categoryId;
    this._activeIndex = -1;
    this._runSearch();
  }

  _handlePastSearchSelect(e) {
    this._query = e.detail.query;
    const input = this.shadowRoot.querySelector('.search-input');
    if (input) input.value = this._query;
    this._runSearch();
  }

  _handlePastSearchRemove(e) {
    searchDataService.removePastSearch(e.detail.query);
    this._pastSearches = searchDataService.getPastSearches();
  }

  // ─── Search Logic ───────────────────────────────────

  _runSearch() {
    const q = this._query.trim();
    if (!q) {
      this._results = [];
      return;
    }

    switch (this._activeCategory) {
      case 'books':
        this._results = searchDataService.searchBooks(q);
        break;
      case 'authors':
        this._results = searchDataService.searchAuthors(q);
        break;
      default:
        this._results = [];
        break;
    }
  }

  _selectResult(item) {
    if (this._query.trim()) {
      searchDataService.addPastSearch(this._query.trim());
    }
    // For prototype, navigate to book.html (books) or just close
    this._close();
  }

  _seeAllResults() {
    if (this._query.trim()) {
      searchDataService.addPastSearch(this._query.trim());
    }
    this.dispatchEvent(
      new CustomEvent('ol-search-modal-see-all', {
        detail: { query: this._query.trim(), category: this._activeCategory },
        bubbles: true,
        composed: true,
      })
    );
    this._close();
  }

  // ─── Rendering ──────────────────────────────────────

  _renderBody() {
    const q = this._query.trim();

    // Placeholder categories
    if (!['books', 'authors'].includes(this._activeCategory)) {
      return html`<div class="placeholder-msg">Coming soon</div>`;
    }

    // No query — show past searches
    if (!q) {
      if (!this._pastSearches.length) {
        return html`<div class="placeholder-msg">Start typing to search</div>`;
      }
      return html`
        <div class="section-label">Past Searches</div>
        ${this._pastSearches.map(
          (s) => html`
            <ol-past-search-item
              query=${s}
              @ol-past-search-select=${this._handlePastSearchSelect}
              @ol-past-search-remove=${this._handlePastSearchRemove}
            ></ol-past-search-item>
          `
        )}
      `;
    }

    // No results
    if (!this._results.length) {
      return html`<div class="no-results">No results for "${q}"</div>`;
    }

    // Books results
    if (this._activeCategory === 'books') {
      return this._results.map(
        (book, i) => html`
          <ol-search-result-item
            class=${i === this._activeIndex ? 'focused' : ''}
            title=${book.title}
            author=${book.author}
            year=${book.firstPublished || ''}
            cover-url=${book.coverUrl || ''}
            query=${this._query}
            compact
            @ol-result-select=${() => this._selectResult(book)}
          ></ol-search-result-item>
        `
      );
    }

    // Authors results
    if (this._activeCategory === 'authors') {
      return this._results.map(
        (author) => html`
          <div class="author-result" style="padding: var(--spacing-3) var(--spacing-4); border-bottom: 1px solid var(--color-border-subtle); cursor: pointer;">
            <strong>${author.name}</strong>
            <span style="color: var(--color-text-secondary); font-size: var(--body-font-size-sm); margin-left: var(--spacing-2);">${author.bookCount} book${author.bookCount !== 1 ? 's' : ''}</span>
          </div>
        `
      );
    }

    return nothing;
  }

  _getResultCount() {
    const q = this._query.trim();
    if (!q) return 0;
    return this._results.length;
  }

  render() {
    if (!this.open) return nothing;

    const count = this._getResultCount();
    const q = this._query.trim();

    return html`
      <div class="backdrop" @click=${this._handleBackdropClick}>
        <div
          class="modal"
          role="dialog"
          aria-modal="true"
          aria-label="Search Open Library"
          @keydown=${this._handleModalKeydown}
        >
          <!-- Search Input -->
          <div class="search-input-row">
            <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              class="search-input"
              type="search"
              placeholder="Book, author, series..."
              .value=${this._query}
              @input=${this._handleInputChange}
              @keydown=${this._handleInputKeydown}
              role="combobox"
              aria-expanded=${q && this._results.length > 0}
              aria-autocomplete="list"
              aria-controls="search-results-list"
            />
            <button class="close-btn" @click=${this._close} aria-label="Close search">
              <svg class="close-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
              <span class="close-text">ESC</span>
            </button>
          </div>

          <!-- Filter Bar (condensed) -->
          <ol-search-filter-bar compact></ol-search-filter-bar>

          <!-- Body: Past Searches or Results -->
          <div class="modal-body" id="search-results-list" role="listbox" aria-label="Search results">
            ${this._renderBody()}
          </div>

          <!-- Status (screen reader only) -->
          <div class="sr-only" aria-live="polite">
            ${q && count > 0 ? `${count} result${count !== 1 ? 's' : ''} found` : ''}
            ${q && count === 0 ? `No results found` : ''}
          </div>

          <!-- Footer -->
          <div class="modal-footer">
            <ol-button variant="primary" @click=${this._seeAllResults}>
              ${count > 0 ? `See all ${count} results` : 'See all results'}
            </ol-button>
          </div>
        </div>
      </div>
    `;
  }
}

customElements.define('ol-search-modal', OlSearchModal);

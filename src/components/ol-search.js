import { LitElement, html, css } from 'lit';

/**
 * A search input component with autocomplete popover
 * 
 * @element ol-search
 * 
 * @prop {string} src - URL to JSON data file
 * @prop {string} searchField - Field name to search in the data (default: 'title')
 * @prop {string} displayPrimary - Field to display as primary text in results (default: same as searchField)
 * @prop {string} displaySecondary - Comma-separated fields to display as secondary text (e.g., 'author,firstPublished')
 * @prop {string} placeholder - Placeholder text for the input
 * @prop {number} minChars - Minimum characters before search starts (default: 3)
 * @prop {number} maxResults - Maximum number of results to show (default: 5)
 * @prop {boolean} disabled - Whether the input is disabled
 * 
 * @fires ol-search-select - Emitted when a result is selected, with { detail: { item } }
 * 
 * @example
 * <ol-search
 *   src="/data/books.json"
 *   search-field="title"
 *   display-primary="title"
 *   display-secondary="author,firstPublished"
 *   placeholder="Search books..."
 * ></ol-search>
 */
export class OlSearch extends LitElement {
  static properties = {
    src: { type: String },
    searchField: { type: String, attribute: 'search-field' },
    displayPrimary: { type: String, attribute: 'display-primary' },
    displaySecondary: { type: String, attribute: 'display-secondary' },
    placeholder: { type: String },
    minChars: { type: Number, attribute: 'min-chars' },
    maxResults: { type: Number, attribute: 'max-results' },
    disabled: { type: Boolean, reflect: true },
    // Internal state
    _query: { state: true },
    _results: { state: true },
    _data: { state: true },
    _open: { state: true },
    _loading: { state: true },
    _error: { state: true },
    _activeIndex: { state: true }
  };

  static styles = css`
    :host {
      display: block;
      position: relative;
    }

    :host([disabled]) {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .search-container {
      position: relative;
      width: 100%;
    }

    .input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }

    .search-icon {
      position: absolute;
      left: var(--input-padding-x);
      display: flex;
      align-items: center;
      justify-content: center;
      pointer-events: none;
      color: var(--color-text-secondary);
    }

    .search-icon svg {
      width: 1em;
      height: 1em;
    }

    input {
      width: 100%;
      min-height: var(--input-min-height);
      padding: var(--input-padding-y) var(--input-padding-x);
      padding-left: calc(var(--input-padding-x) * 2 + 1em);
      font-size: var(--input-font-size);
      font-family: inherit;
      color: var(--input-color-text);
      background-color: var(--input-color-bg);
      border: var(--input-border-width) solid var(--input-border);
      border-radius: var(--radius-input);
      box-sizing: border-box;
    }

    input::placeholder {
      color: var(--input-color-placeholder);
    }

    input:hover:not(:disabled) {
      border-color: var(--input-border-hovered);
    }

    input:focus {
      outline: none;
      border-color: var(--input-border-focused);
      box-shadow: var(--input-focus-ring);
    }

    input:disabled {
      cursor: not-allowed;
      background-color: var(--input-disabled-surface);
      opacity: var(--input-disabled-opacity);
    }

    /* Popover */
    .popover {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      margin-top: var(--spacing-1);
      background-color: var(--color-bg-elevated);
      border: var(--border-width-control) solid var(--color-border);
      border-radius: var(--radius-input);
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      z-index: var(--z-index-dropdown, 100);
      max-height: 300px;
      overflow-y: auto;
      opacity: 0;
      pointer-events: none;
      transform: translateY(-4px);
      transition: opacity 150ms ease, transform 150ms ease;
    }

    .popover.open {
      opacity: 1;
      pointer-events: auto;
      transform: translateY(0);
    }

    /* Results list */
    .results-list {
      list-style: none;
      margin: 0;
      padding: var(--spacing-1) 0;
    }

    .result-item {
      padding: var(--spacing-2) var(--spacing-3);
      cursor: pointer;
      transition: background-color 100ms ease;
    }

    .result-item:hover,
    .result-item.active {
      background-color: var(--color-bg-hovered);
    }

    .result-item:focus {
      outline: none;
      background-color: var(--color-bg-hovered);
    }

    .result-primary {
      font-size: var(--body-font-size);
      font-weight: var(--font-weight-medium, 500);
      color: var(--color-text-strong);
      line-height: var(--line-height-tight, 1.25);
    }

    .result-secondary {
      font-size: var(--body-font-size-sm);
      color: var(--color-text-secondary);
      margin-top: var(--spacing-1);
      line-height: var(--line-height-normal, 1.5);
    }

    /* No results message */
    .no-results {
      padding: var(--spacing-3);
      text-align: center;
      color: var(--color-text-secondary);
      font-size: var(--body-font-size-sm);
    }

    /* Loading state */
    .loading {
      padding: var(--spacing-3);
      text-align: center;
      color: var(--color-text-secondary);
      font-size: var(--body-font-size-sm);
    }

    /* Error state */
    .error {
      padding: var(--spacing-3);
      text-align: center;
      color: var(--color-error);
      font-size: var(--body-font-size-sm);
    }
  `;

  constructor() {
    super();
    this.src = '';
    this.searchField = 'title';
    this.displayPrimary = '';
    this.displaySecondary = '';
    this.placeholder = 'Search...';
    this.minChars = 3;
    this.maxResults = 5;
    this.disabled = false;

    // Internal state
    this._query = '';
    this._results = [];
    this._data = [];
    this._open = false;
    this._loading = false;
    this._error = null;
    this._activeIndex = -1;

    // Bind methods
    this._handleOutsideClick = this._handleOutsideClick.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    document.addEventListener('click', this._handleOutsideClick);
    this._loadData();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('click', this._handleOutsideClick);
  }

  /**
   * Load JSON data from src
   */
  async _loadData() {
    if (!this.src) return;

    this._loading = true;
    this._error = null;

    try {
      const response = await fetch(this.src);
      if (!response.ok) {
        throw new Error(`Failed to load data: ${response.statusText}`);
      }
      this._data = await response.json();
    } catch (error) {
      console.error('OlSearch: Failed to load data:', error);
      this._error = 'Failed to load search data';
    } finally {
      this._loading = false;
    }
  }

  /**
   * Handle clicks outside the component to close popover
   */
  _handleOutsideClick(event) {
    if (!this._open) return;

    const path = event.composedPath();
    if (!path.includes(this)) {
      this._closePopover();
    }
  }

  /**
   * Handle input changes
   */
  _handleInput(event) {
    this._query = event.target.value;
    this._activeIndex = -1;

    if (this._query.length >= this.minChars) {
      this._search();
      this._open = true;
    } else {
      this._results = [];
      this._open = false;
    }
  }

  /**
   * Perform search on data
   */
  _search() {
    if (!this._data || !this._data.length) {
      this._results = [];
      return;
    }

    const query = this._query.toLowerCase();
    const field = this.searchField;

    this._results = this._data
      .filter(item => {
        const value = item[field];
        if (typeof value === 'string') {
          return value.toLowerCase().includes(query);
        }
        return false;
      })
      .slice(0, this.maxResults);
  }

  /**
   * Handle keyboard navigation
   */
  _handleKeyDown(event) {
    if (!this._open) {
      // Open popover on arrow down if there's a query
      if (event.key === 'ArrowDown' && this._query.length >= this.minChars) {
        this._search();
        this._open = true;
        event.preventDefault();
      }
      return;
    }

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this._activeIndex = Math.min(this._activeIndex + 1, this._results.length - 1);
        this._scrollActiveIntoView();
        break;

      case 'ArrowUp':
        event.preventDefault();
        this._activeIndex = Math.max(this._activeIndex - 1, -1);
        this._scrollActiveIntoView();
        break;

      case 'Enter':
        event.preventDefault();
        if (this._activeIndex >= 0 && this._results[this._activeIndex]) {
          this._selectItem(this._results[this._activeIndex]);
        }
        break;

      case 'Escape':
        event.preventDefault();
        this._closePopover();
        break;

      case 'Home':
        if (this._results.length > 0) {
          event.preventDefault();
          this._activeIndex = 0;
          this._scrollActiveIntoView();
        }
        break;

      case 'End':
        if (this._results.length > 0) {
          event.preventDefault();
          this._activeIndex = this._results.length - 1;
          this._scrollActiveIntoView();
        }
        break;
    }
  }

  /**
   * Scroll active item into view
   */
  _scrollActiveIntoView() {
    this.updateComplete.then(() => {
      const activeItem = this.shadowRoot.querySelector('.result-item.active');
      if (activeItem) {
        activeItem.scrollIntoView({ block: 'nearest' });
      }
    });
  }

  /**
   * Handle item click
   */
  _handleItemClick(item) {
    this._selectItem(item);
  }

  /**
   * Select an item
   * @fires ol-search-select
   */
  _selectItem(item) {
    this.dispatchEvent(new CustomEvent('ol-search-select', {
      detail: { item },
      bubbles: true,
      composed: true
    }));

    this._closePopover();
    this._query = '';
    
    // Clear the input
    const input = this.shadowRoot.querySelector('input');
    if (input) {
      input.value = '';
    }
  }

  /**
   * Close the popover
   */
  _closePopover() {
    this._open = false;
    this._activeIndex = -1;
  }

  /**
   * Handle focus
   */
  _handleFocus() {
    if (this._query.length >= this.minChars && this._results.length > 0) {
      this._open = true;
    }
  }

  /**
   * Get the display value for the primary field
   */
  _getPrimaryDisplay(item) {
    const field = this.displayPrimary || this.searchField;
    return item[field] ?? '';
  }

  /**
   * Get the display value for secondary fields
   */
  _getSecondaryDisplay(item) {
    if (!this.displaySecondary) return '';

    const fields = this.displaySecondary.split(',').map(f => f.trim());
    const values = fields
      .map(field => item[field])
      .filter(v => v !== undefined && v !== null && v !== '');

    return values.join(' · ');
  }

  /**
   * Delegate focus to the internal input
   */
  focus() {
    const input = this.shadowRoot?.querySelector('input');
    if (input) {
      input.focus();
    }
  }

  /**
   * Clear the search
   */
  clear() {
    this._query = '';
    this._results = [];
    this._closePopover();
    
    const input = this.shadowRoot?.querySelector('input');
    if (input) {
      input.value = '';
    }
  }

  render() {
    const listboxId = 'search-listbox';
    const hasResults = this._results.length > 0;
    const showNoResults = this._open && this._query.length >= this.minChars && !hasResults && !this._loading && !this._error;

    return html`
      <div class="search-container">
        <div class="input-wrapper">
          <span class="search-icon" aria-hidden="true">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clip-rule="evenodd" />
            </svg>
          </span>
          <input
            type="text"
            .value=${this._query}
            placeholder=${this.placeholder}
            ?disabled=${this.disabled}
            @input=${this._handleInput}
            @keydown=${this._handleKeyDown}
            @focus=${this._handleFocus}
            role="combobox"
            aria-expanded=${this._open ? 'true' : 'false'}
            aria-haspopup="listbox"
            aria-controls=${listboxId}
            aria-activedescendant=${this._activeIndex >= 0 ? `result-${this._activeIndex}` : ''}
            aria-autocomplete="list"
          />
        </div>

        <div 
          class="popover ${this._open ? 'open' : ''}"
          role="listbox"
          id=${listboxId}
          aria-label="Search results"
        >
          ${this._loading ? html`
            <div class="loading" aria-live="polite">Loading...</div>
          ` : ''}

          ${this._error ? html`
            <div class="error" role="alert">${this._error}</div>
          ` : ''}

          ${hasResults ? html`
            <ul class="results-list" role="presentation">
              ${this._results.map((item, index) => html`
                <li
                  class="result-item ${index === this._activeIndex ? 'active' : ''}"
                  id="result-${index}"
                  role="option"
                  aria-selected=${index === this._activeIndex ? 'true' : 'false'}
                  @click=${() => this._handleItemClick(item)}
                  @mouseenter=${() => { this._activeIndex = index; }}
                >
                  <div class="result-primary">${this._getPrimaryDisplay(item)}</div>
                  ${this.displaySecondary ? html`
                    <div class="result-secondary">${this._getSecondaryDisplay(item)}</div>
                  ` : ''}
                </li>
              `)}
            </ul>
          ` : ''}

          ${showNoResults ? html`
            <div class="no-results" aria-live="polite">No results found</div>
          ` : ''}
        </div>
      </div>
    `;
  }
}

customElements.define('ol-search', OlSearch);

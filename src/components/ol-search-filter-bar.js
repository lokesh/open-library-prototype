import { LitElement, html, css, svg, nothing } from 'lit';

const STORAGE_KEY_FORMAT = 'ol-filter-format';
const STORAGE_KEY_AVAILABLE = 'ol-filter-available-now';
const STORAGE_KEY_LANGUAGE = 'ol-filter-language';

const FORMAT_OPTIONS = [
  { id: 'all', label: 'All' },
  { id: 'read', label: 'eBooks' },
  { id: 'listen', label: 'Audiobooks' },
];

const SUBJECT_OPTIONS = [
  'Fiction',
  'History',
  'Science',
  'Biography',
  'Philosophy',
  'Art',
];

const LANGUAGE_OPTIONS = [
  'English',
  'Spanish',
  'French',
  'German',
  'Chinese',
  'Japanese',
];

export class OlSearchFilterBar extends LitElement {
  static properties = {
    compact: { type: Boolean, reflect: true },
    _activeFormat: { type: String, state: true },
    _availableNow: { type: Boolean, state: true },
    _activeSubjects: { type: Array, state: true },
    _activeLanguage: { type: String, state: true },
    _showMoreFilters: { type: Boolean, state: true },
    _languageOpen: { type: Boolean, state: true },
  };

  static styles = css`
    :host {
      display: block;
    }

    /* ─── Main row ─── */

    .filter-bar {
      display: flex;
      flex-wrap: nowrap;
      align-items: center;
      gap: var(--spacing-2);
      padding: var(--spacing-2) 0;
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: none;
    }

    @media (max-width: 767px) {
      .filter-bar {
        width: 100vw;
        box-sizing: border-box;
      }

      :host([compact]) .filter-bar {
        padding-left: var(--spacing-6);
        padding-right: var(--spacing-6);
      }
    }

    .filter-bar::-webkit-scrollbar {
      display: none;
    }

    /* ─── Divider between groups ─── */

    .divider {
      width: 1px;
      height: 20px;
      background: var(--color-border);
      flex-shrink: 0;
    }

    /* ─── Segmented control (format) ─── */

    .segment-group {
      display: inline-flex;
      border-radius: var(--radius-button);
      border: 1px solid var(--color-border);
      overflow: hidden;
      flex-shrink: 0;
    }

    .segment-btn {
      background: transparent;
      border: none;
      padding: var(--spacing-1) var(--spacing-3);
      font-size: var(--body-font-size-sm);
      font-family: inherit;
      font-weight: var(--font-weight-medium);
      color: var(--color-text-secondary);
      cursor: pointer;
      white-space: nowrap;
      transition: background 120ms ease, color 120ms ease;
      position: relative;
    }

    .segment-btn:not(:last-child)::after {
      content: '';
      position: absolute;
      right: 0;
      top: 25%;
      height: 50%;
      width: 1px;
      background: var(--color-border-subtle);
    }

    .segment-btn:hover {
      background: var(--color-bg-hovered);
      color: var(--color-text);
    }

    .segment-btn:focus-visible {
      outline: var(--focus-ring-width) solid var(--focus-ring-color);
      outline-offset: -2px;
      border-radius: var(--radius-sm);
      z-index: 1;
    }

    .segment-btn.active {
      background: var(--color-bg-primary);
      color: var(--color-text-on-primary);
    }

    .segment-btn.active::after {
      display: none;
    }

    .segment-btn.active + .segment-btn::after {
      display: none;
    }

    /* ─── Chip (toggle) ─── */

    .chip {
      display: inline-flex;
      align-items: center;
      gap: var(--spacing-1);
      padding: var(--spacing-1) var(--spacing-3);
      border-radius: var(--radius-full);
      border: 1px solid var(--color-border);
      background: transparent;
      font-size: var(--body-font-size-sm);
      font-family: inherit;
      font-weight: var(--font-weight-medium);
      color: var(--color-text-secondary);
      cursor: pointer;
      white-space: nowrap;
      transition: background 120ms ease, color 120ms ease, border-color 120ms ease;
      flex-shrink: 0;
    }

    .chip:hover {
      background: var(--color-bg-hovered);
      color: var(--color-text);
    }

    .chip:focus-visible {
      outline: var(--focus-ring-width) solid var(--focus-ring-color);
      outline-offset: 2px;
    }

    .chip.active {
      background: var(--color-bg-primary);
      color: var(--color-text-on-primary);
      border-color: var(--color-bg-primary);
    }

    .chip.active:hover {
      background: var(--color-bg-primary-hovered);
    }

    .chip svg {
      width: 14px;
      height: 14px;
      flex-shrink: 0;
    }

    /* ─── Dropdown chip (language) ─── */

    .dropdown-wrapper {
      position: relative;
      flex-shrink: 0;
    }

    .dropdown-chip {
      display: inline-flex;
      align-items: center;
      gap: var(--spacing-1);
      padding: var(--spacing-1) var(--spacing-2) var(--spacing-1) var(--spacing-3);
      border-radius: var(--radius-button);
      border: 1px solid var(--color-border);
      background: transparent;
      font-size: var(--body-font-size-sm);
      font-family: inherit;
      font-weight: var(--font-weight-medium);
      color: var(--color-text-secondary);
      cursor: pointer;
      white-space: nowrap;
      transition: background 120ms ease, color 120ms ease, border-color 120ms ease;
    }

    .dropdown-chip:hover {
      background: var(--color-bg-hovered);
      color: var(--color-text);
    }

    .dropdown-chip:focus-visible {
      outline: var(--focus-ring-width) solid var(--focus-ring-color);
      outline-offset: 2px;
    }

    .dropdown-chip.has-value {
      background: var(--color-bg-primary);
      color: var(--color-text-on-primary);
      border-color: var(--color-bg-primary);
    }

    .dropdown-chip.has-value:hover {
      background: var(--color-bg-primary-hovered);
    }

    .dropdown-chevron {
      width: 14px;
      height: 14px;
      flex-shrink: 0;
      transition: transform 150ms ease;
    }

    .dropdown-chevron.open {
      transform: rotate(180deg);
    }

    .dropdown-menu {
      position: fixed;
      min-width: 160px;
      background: var(--color-bg-elevated);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      z-index: var(--z-index-dropdown);
      padding: var(--spacing-1) 0;
      opacity: 0;
      pointer-events: none;
      transform: translateY(-4px);
      transition: opacity 120ms ease, transform 120ms ease;
    }

    .dropdown-menu.open {
      opacity: 1;
      pointer-events: auto;
      transform: translateY(0);
    }

    .dropdown-option {
      display: flex;
      align-items: center;
      gap: var(--spacing-2);
      width: 100%;
      padding: var(--spacing-2) var(--spacing-3);
      border: none;
      background: transparent;
      font-size: var(--body-font-size-sm);
      font-family: inherit;
      color: var(--color-text);
      cursor: pointer;
      text-align: left;
    }

    .dropdown-option:hover {
      background: var(--color-bg-hovered);
    }

    .dropdown-option:focus-visible {
      outline: var(--focus-ring-width) solid var(--focus-ring-color);
      outline-offset: -2px;
    }

    .dropdown-option .check {
      width: 14px;
      height: 14px;
      flex-shrink: 0;
      opacity: 0;
    }

    .dropdown-option.selected .check {
      opacity: 1;
      color: var(--color-bg-primary);
    }

    /* ─── More filters toggle ─── */

    .more-btn {
      display: inline-flex;
      align-items: center;
      gap: var(--spacing-1);
      padding: var(--spacing-1) var(--spacing-3);
      border-radius: var(--radius-button);
      border: 1px solid var(--color-border);
      background: transparent;
      font-size: var(--body-font-size-sm);
      font-family: inherit;
      font-weight: var(--font-weight-medium);
      color: var(--color-text-secondary);
      cursor: pointer;
      white-space: nowrap;
      transition: background 120ms ease, color 120ms ease, border-color 120ms ease;
      flex-shrink: 0;
    }

    .more-btn:hover {
      background: var(--color-bg-hovered);
      color: var(--color-text);
    }

    .more-btn:focus-visible {
      outline: var(--focus-ring-width) solid var(--focus-ring-color);
      outline-offset: 2px;
    }

    .more-btn svg {
      width: 14px;
      height: 14px;
    }

    /* ─── More filters row (mobile only) ─── */

    .more-row {
      display: block;
      padding-bottom: var(--spacing-1);
    }

    @media (min-width: 768px) {
      .more-row {
        display: none;
      }
    }

    /* ─── Secondary row (expanded filters) ─── */

    .filter-bar-secondary {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--spacing-2);
      padding: var(--spacing-1) 0 var(--spacing-2);
    }

    .group-label {
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-semibold);
      color: var(--color-text-secondary);
      text-transform: uppercase;
      letter-spacing: var(--letter-spacing-wide);
      flex-shrink: 0;
      padding-right: var(--spacing-1);
    }

    /* ─── Clear all ─── */

    .clear-link {
      background: none;
      border: none;
      font-size: var(--body-font-size-sm);
      font-family: inherit;
      color: var(--color-link);
      cursor: pointer;
      padding: var(--spacing-1) var(--spacing-2);
      flex-shrink: 0;
    }

    .clear-link:hover {
      text-decoration: underline;
    }

    .clear-link:focus-visible {
      outline: var(--focus-ring-width) solid var(--focus-ring-color);
      outline-offset: 2px;
      border-radius: var(--radius-sm);
    }

    /* ─── Compact mode (modal) ─── */

    :host([compact]) .filter-bar {
      padding: var(--spacing-2) var(--spacing-4) var(--spacing-2);
    }

    :host([compact]) .divider {
      height: 16px;
    }
  `;

  constructor() {
    super();
    this.compact = false;
    this._activeFormat = localStorage.getItem(STORAGE_KEY_FORMAT) || 'all';
    this._availableNow = localStorage.getItem(STORAGE_KEY_AVAILABLE) === 'true';
    this._activeSubjects = [];
    this._activeLanguage = localStorage.getItem(STORAGE_KEY_LANGUAGE) || '';
    this._showMoreFilters = false;
    this._languageOpen = false;
    this._boundCloseDropdown = this._closeDropdownOnOutsideClick.bind(this);
    this._boundCloseOnScroll = this._closeDropdownOnScroll.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    document.addEventListener('click', this._boundCloseDropdown);
    window.addEventListener('scroll', this._boundCloseOnScroll, true);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('click', this._boundCloseDropdown);
    window.removeEventListener('scroll', this._boundCloseOnScroll, true);
  }

  _closeDropdownOnScroll() {
    if (this._languageOpen) {
      this._languageOpen = false;
    }
  }

  _closeDropdownOnOutsideClick(e) {
    if (this._languageOpen) {
      const path = e.composedPath();
      const wrapper = this.shadowRoot?.querySelector('.dropdown-wrapper');
      if (wrapper && !path.includes(wrapper)) {
        this._languageOpen = false;
      }
    }
  }

  // ─── State changes ─────────────────────────────

  _setFormat(id) {
    this._activeFormat = id;
    localStorage.setItem(STORAGE_KEY_FORMAT, id);
    this._dispatchChange();
  }

  _toggleAvailableNow() {
    this._availableNow = !this._availableNow;
    localStorage.setItem(STORAGE_KEY_AVAILABLE, String(this._availableNow));
    this._dispatchChange();
  }

  _toggleSubject(subject) {
    if (this._activeSubjects.includes(subject)) {
      this._activeSubjects = this._activeSubjects.filter(s => s !== subject);
    } else {
      this._activeSubjects = [...this._activeSubjects, subject];
    }
    this._dispatchChange();
  }

  _setLanguage(lang) {
    this._activeLanguage = this._activeLanguage === lang ? '' : lang;
    if (this._activeLanguage) {
      localStorage.setItem(STORAGE_KEY_LANGUAGE, this._activeLanguage);
    } else {
      localStorage.removeItem(STORAGE_KEY_LANGUAGE);
    }
    this._languageOpen = false;
    this._dispatchChange();
  }

  _toggleLanguageDropdown() {
    this._languageOpen = !this._languageOpen;
    if (this._languageOpen) {
      this._positionDropdown();
    }
  }

  async _positionDropdown() {
    await this.updateComplete;
    const chip = this.shadowRoot?.querySelector('.dropdown-chip');
    const menu = this.shadowRoot?.querySelector('.dropdown-menu');
    if (!chip || !menu) return;
    const rect = chip.getBoundingClientRect();
    menu.style.top = `${rect.bottom + 4}px`;
    menu.style.left = `${rect.left}px`;
  }

  _toggleMoreFilters() {
    if (window.innerWidth < 768) {
      this.dispatchEvent(
        new CustomEvent('ol-filter-bar-more', {
          bubbles: true,
          composed: true,
          detail: {
            format: this._activeFormat,
            availableNow: this._availableNow,
            subjects: [...this._activeSubjects],
            language: this._activeLanguage,
          },
        })
      );
      return;
    }
    this._showMoreFilters = !this._showMoreFilters;
  }

  _clearAll() {
    this._activeFormat = 'all';
    this._availableNow = false;
    localStorage.removeItem(STORAGE_KEY_FORMAT);
    localStorage.removeItem(STORAGE_KEY_AVAILABLE);
    localStorage.removeItem(STORAGE_KEY_LANGUAGE);
    this._activeSubjects = [];
    this._activeLanguage = '';
    this._showMoreFilters = false;
    this._dispatchChange();
  }

  _hasActiveFilters() {
    return (
      this._activeFormat !== 'all' ||
      this._availableNow ||
      this._activeSubjects.length > 0 ||
      this._activeLanguage !== ''
    );
  }

  _dispatchChange() {
    this.dispatchEvent(
      new CustomEvent('ol-filter-bar-change', {
        detail: {
          format: this._activeFormat,
          availableNow: this._availableNow,
          subjects: [...this._activeSubjects],
          language: this._activeLanguage,
        },
        bubbles: true,
        composed: true,
      })
    );
  }

  // ─── Rendering ─────────────────────────────────

  _renderFormatSegment() {
    return html`
      <div class="segment-group" role="radiogroup" aria-label="Format">
        ${FORMAT_OPTIONS.map(opt => html`
          <button
            class="segment-btn ${this._activeFormat === opt.id ? 'active' : ''}"
            role="radio"
            aria-checked=${this._activeFormat === opt.id}
            @click=${() => this._setFormat(opt.id)}
          >${opt.label}</button>
        `)}
      </div>
    `;
  }

  _renderAvailabilityChip() {
    return html`
      <button
        class="chip ${this._availableNow ? 'active' : ''}"
        aria-pressed=${this._availableNow}
        @click=${this._toggleAvailableNow}
      >
        ${this._availableNow ? html`
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        ` : nothing}
        Available now
      </button>
    `;
  }

  _renderLanguageDropdown() {
    const label = this._activeLanguage || 'Language';
    return html`
      <div class="dropdown-wrapper">
        <button
          class="dropdown-chip ${this._activeLanguage ? 'has-value' : ''}"
          aria-haspopup="listbox"
          aria-expanded=${this._languageOpen}
          @click=${this._toggleLanguageDropdown}
        >
          ${label}
          <svg class="dropdown-chevron ${this._languageOpen ? 'open' : ''}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>
        <div class="dropdown-menu ${this._languageOpen ? 'open' : ''}" role="listbox" aria-label="Language">
          ${LANGUAGE_OPTIONS.map(lang => html`
            <button
              class="dropdown-option ${this._activeLanguage === lang ? 'selected' : ''}"
              role="option"
              aria-selected=${this._activeLanguage === lang}
              @click=${() => this._setLanguage(lang)}
            >
              <svg class="check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              ${lang}
            </button>
          `)}
        </div>
      </div>
    `;
  }

  _renderSubjectChips() {
    return SUBJECT_OPTIONS.map(subject => html`
      <button
        class="chip ${this._activeSubjects.includes(subject) ? 'active' : ''}"
        aria-pressed=${this._activeSubjects.includes(subject)}
        @click=${() => this._toggleSubject(subject)}
      >${subject}</button>
    `);
  }

  render() {
    return html`
      <!-- Primary row: format + availability + language + more -->
      <div class="filter-bar">
        ${this._renderFormatSegment()}

        <span class="divider"></span>

        ${this._renderLanguageDropdown()}
      </div>

      <!-- More filters row (mobile only) -->
      ${this.compact ? nothing : html`
        <div class="more-row">
          <button
            class="more-btn"
            aria-expanded=${this._showMoreFilters}
            @click=${this._toggleMoreFilters}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              ${this._showMoreFilters
                ? svg`<line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>`
                : svg`<path d="M3 6h18"></path><path d="M7 12h10"></path><path d="M10 18h4"></path>`
              }
            </svg>
            ${this._showMoreFilters ? 'Less' : 'More filters'}
          </button>
        </div>
      `}

      <!-- Secondary row: subjects (progressive disclosure) -->
      ${this._showMoreFilters ? html`
        <div class="filter-bar-secondary">
          <span class="group-label">Subject</span>
          ${this._renderSubjectChips()}
        </div>
      ` : nothing}
    `;
  }
}

customElements.define('ol-search-filter-bar', OlSearchFilterBar);

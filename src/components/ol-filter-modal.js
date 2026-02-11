import { LitElement, html, css, svg, nothing } from 'lit';
import searchDataService from '../search-data-service.js';

const SHOW_MORE_THRESHOLD = 9;

const FILTER_SECTIONS = [
  {
    id: 'subjects',
    label: 'Subjects',
    field: 'subjects',
    options: ['Fiction', 'History', 'Science', 'Biography', 'Philosophy', 'Art', 'Technology', 'Politics', 'Religion'],
  },
  {
    id: 'publisher',
    label: 'Publisher',
    field: 'publishers',
    options: ['Penguin', 'HarperCollins', 'Simon & Schuster', 'Random House', 'Macmillan', 'Hachette'],
  },
  {
    id: 'people',
    label: 'People',
    field: 'people',
    options: ['Napoleon', 'Shakespeare', 'Lincoln', 'Einstein', 'Cleopatra', 'Darwin'],
  },
];

const checkSvg = svg`<polyline points="20 6 9 17 4 12"></polyline>`;

export class OlFilterModal extends LitElement {
  static properties = {
    open: { type: Boolean, reflect: true },
    filters: { type: Object },
    _workingFilters: { type: Object, state: true },
    _expandedSections: { type: Object, state: true },
    _authors: { type: Array, state: true },
  };

  static styles = css`
    /* ─── Host ─── */

    :host {
      display: none;
    }

    :host([open]) {
      display: block;
    }

    /* ─── Backdrop ─── */

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

    /* ─── Modal ─── */

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

    .modal-header {
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      padding: var(--spacing-4);
      border-bottom: 1px solid var(--color-border-subtle);
      flex-shrink: 0;
    }

    .modal-title {
      font-size: var(--body-font-size);
      font-weight: var(--font-weight-semibold);
      color: var(--color-text-strong);
      margin: 0;
    }

    .close-btn {
      position: absolute;
      right: var(--spacing-3);
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      background: none;
      border: none;
      border-radius: var(--radius-button);
      color: var(--color-text-secondary);
      cursor: pointer;
      flex-shrink: 0;
    }

    .close-btn:hover {
      background: var(--color-bg-hovered);
      color: var(--color-text);
    }

    .close-btn:focus-visible {
      outline: var(--focus-ring-width) solid var(--focus-ring-color);
      outline-offset: 2px;
    }

    .close-btn svg {
      width: 20px;
      height: 20px;
    }

    /* ─── Body ─── */

    .modal-body {
      flex: 1;
      overflow-y: auto;
      min-height: 0;
      padding: var(--spacing-6) var(--spacing-4);
    }

    /* ─── Filter section ─── */

    .filter-section {
      margin-bottom: var(--spacing-6);
    }

    .filter-section:last-child {
      margin-bottom: 0;
    }

    .section-heading {
      font-size: var(--body-font-size-sm);
      font-weight: var(--font-weight-semibold);
      color: var(--color-text-strong);
      margin-bottom: var(--spacing-3);
    }

    /* ─── Chip grid ─── */

    .chip-grid {
      display: flex;
      flex-wrap: wrap;
      gap: var(--spacing-2);
    }

    /* ─── Chip ─── */

    .chip {
      display: inline-flex;
      align-items: center;
      gap: var(--spacing-1);
      padding: var(--spacing-1) var(--spacing-2);
      border-radius: var(--chip-radius);
      border: var(--chip-border);
      background: transparent;
      font-size: var(--chip-font-size);
      font-family: inherit;
      font-weight: var(--font-weight-medium);
      color: var(--color-text-secondary);
      cursor: pointer;
      white-space: nowrap;
      transition: background 120ms ease, color 120ms ease, border-color 120ms ease;
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

    /* ─── Show more ─── */

    .show-more-btn {
      background: none;
      border: none;
      font-size: var(--body-font-size-sm);
      font-family: inherit;
      color: var(--color-link);
      cursor: pointer;
      padding: var(--spacing-1) 0;
      margin-top: var(--spacing-2);
      text-decoration: underline;
    }

    .show-more-btn:hover {
      color: var(--color-text);
    }

    .show-more-btn:focus-visible {
      outline: var(--focus-ring-width) solid var(--focus-ring-color);
      outline-offset: 2px;
      border-radius: var(--radius-sm);
    }

    /* ─── Footer ─── */

    .modal-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--spacing-3) var(--spacing-4);
      border-top: 1px solid var(--color-border-subtle);
      flex-shrink: 0;
      gap: var(--spacing-3);
    }

    .reset-btn {
      background: transparent;
      border: 1px solid var(--color-border);
      font-size: var(--body-font-size);
      font-family: inherit;
      font-weight: var(--font-weight-medium);
      color: var(--color-text);
      cursor: pointer;
      padding: var(--spacing-2) var(--spacing-3);
      border-radius: var(--radius-button);
    }

    .reset-btn:hover {
      background: var(--color-bg-hovered);
    }

    .reset-btn:focus-visible {
      outline: var(--focus-ring-width) solid var(--focus-ring-color);
      outline-offset: 2px;
    }

    .reset-btn:disabled {
      opacity: 0.4;
      cursor: default;
    }

    .apply-btn {
      background: var(--color-bg-primary);
      color: var(--color-text-on-primary);
      border: none;
      border-radius: var(--radius-button);
      font-size: var(--body-font-size);
      font-family: inherit;
      font-weight: var(--font-weight-semibold);
      padding: var(--spacing-2) var(--spacing-6);
      cursor: pointer;
      transition: background 120ms ease;
    }

    .apply-btn:hover {
      background: var(--color-bg-primary-hovered);
    }

    .apply-btn:focus-visible {
      outline: var(--focus-ring-width) solid var(--focus-ring-color);
      outline-offset: 2px;
    }
  `;

  constructor() {
    super();
    this.open = false;
    this.filters = {};
    this._workingFilters = this._defaultFilters();
    this._expandedSections = {};
    this._authors = [];
    this._previousFocus = null;
  }

  _defaultFilters() {
    return {
      subjects: [],
      publishers: [],
      people: [],
      authors: [],
    };
  }

  // ─── Lifecycle ───────────────────────────────────

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
  }

  async _onOpen() {
    this._previousFocus = document.activeElement;
    this._workingFilters = this._cloneFilters(this.filters);
    this._expandedSections = {};
    this._lockScroll();

    await searchDataService.ensureLoaded();
    this._authors = searchDataService.getAuthors();

    await this.updateComplete;
    const closeBtn = this.shadowRoot.querySelector('.close-btn');
    if (closeBtn) closeBtn.focus();
  }

  _onClose() {
    this._unlockScroll();
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

  _cloneFilters(filters) {
    const defaults = this._defaultFilters();
    if (!filters || typeof filters !== 'object') return defaults;
    const result = {};
    for (const key of Object.keys(defaults)) {
      result[key] = Array.isArray(filters[key]) ? [...filters[key]] : defaults[key];
    }
    return result;
  }

  // ─── Actions ─────────────────────────────────────

  _close() {
    this.dispatchEvent(
      new CustomEvent('ol-filter-modal-close', {
        bubbles: true,
        composed: true,
      })
    );
  }

  _apply() {
    this.dispatchEvent(
      new CustomEvent('ol-filter-modal-apply', {
        detail: { filters: { ...this._workingFilters } },
        bubbles: true,
        composed: true,
      })
    );
    this._close();
  }

  _reset() {
    this._workingFilters = this._defaultFilters();
    this._expandedSections = {};
  }

  _handleBackdropClick(e) {
    if (e.target === e.currentTarget) {
      this._close();
    }
  }

  _handleKeydown(e) {
    if (e.key === 'Escape') {
      e.preventDefault();
      this._close();
      return;
    }

    if (e.key === 'Tab') {
      const focusable = this.shadowRoot.querySelectorAll(
        'button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      const arr = Array.from(focusable).filter(
        (el) => el.offsetParent !== null
      );
      if (!arr.length) return;
      const first = arr[0];
      const last = arr[arr.length - 1];
      if (e.shiftKey && this.shadowRoot.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && this.shadowRoot.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  _toggleOption(field, value) {
    const list = this._workingFilters[field] || [];
    if (list.includes(value)) {
      this._workingFilters = {
        ...this._workingFilters,
        [field]: list.filter(v => v !== value),
      };
    } else {
      this._workingFilters = {
        ...this._workingFilters,
        [field]: [...list, value],
      };
    }
  }

  _toggleShowMore(sectionId) {
    this._expandedSections = {
      ...this._expandedSections,
      [sectionId]: !this._expandedSections[sectionId],
    };
  }

  _getActiveFilterCount() {
    let count = 0;
    for (const key of Object.keys(this._workingFilters)) {
      const val = this._workingFilters[key];
      if (Array.isArray(val)) count += val.length;
    }
    return count;
  }

  // ─── Rendering ───────────────────────────────────

  _renderChip(field, value, label) {
    const selected = (this._workingFilters[field] || []).includes(value);
    return html`
      <button
        class="chip ${selected ? 'active' : ''}"
        aria-pressed=${selected}
        @click=${() => this._toggleOption(field, value)}
      >
        ${selected ? html`
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            ${checkSvg}
          </svg>
        ` : nothing}
        ${label}
      </button>
    `;
  }

  _renderSection(section) {
    const { id, label, field, options } = section;
    const isExpanded = this._expandedSections[id];
    const needsShowMore = options.length > SHOW_MORE_THRESHOLD;
    const visible = needsShowMore && !isExpanded
      ? options.slice(0, SHOW_MORE_THRESHOLD)
      : options;
    const hiddenCount = options.length - SHOW_MORE_THRESHOLD;

    return html`
      <div class="filter-section">
        <div class="section-heading">${label}</div>
        <div class="chip-grid">
          ${visible.map(opt => this._renderChip(field, opt, opt))}
        </div>
        ${needsShowMore ? html`
          <button class="show-more-btn" @click=${() => this._toggleShowMore(id)}>
            ${isExpanded ? 'Show less' : `Show ${hiddenCount} more`}
          </button>
        ` : nothing}
      </div>
    `;
  }

  _renderAuthorSection() {
    if (!this._authors.length) return nothing;

    const sectionId = 'author';
    const isExpanded = this._expandedSections[sectionId];
    const needsShowMore = this._authors.length > SHOW_MORE_THRESHOLD;
    const visible = needsShowMore && !isExpanded
      ? this._authors.slice(0, SHOW_MORE_THRESHOLD)
      : this._authors;
    const hiddenCount = this._authors.length - SHOW_MORE_THRESHOLD;

    return html`
      <div class="filter-section">
        <div class="section-heading">Author</div>
        <div class="chip-grid">
          ${visible.map(a => this._renderChip('authors', a.name, a.name))}
        </div>
        ${needsShowMore ? html`
          <button class="show-more-btn" @click=${() => this._toggleShowMore(sectionId)}>
            ${isExpanded ? 'Show less' : `Show ${hiddenCount} more`}
          </button>
        ` : nothing}
      </div>
    `;
  }

  render() {
    if (!this.open) return nothing;

    const count = this._getActiveFilterCount();

    return html`
      <div class="backdrop" @click=${this._handleBackdropClick}>
        <div
          class="modal"
          role="dialog"
          aria-modal="true"
          aria-label="Filter options"
          @keydown=${this._handleKeydown}
        >
          <div class="modal-header">
            <h2 class="modal-title">Filters</h2>
            <button class="close-btn" @click=${this._close} aria-label="Close filters">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <div class="modal-body">
            ${this._renderAuthorSection()}
            ${FILTER_SECTIONS.map(s => this._renderSection(s))}
          </div>

          <div class="modal-footer">
            <button
              class="reset-btn"
              @click=${this._reset}
              ?disabled=${this._getActiveFilterCount() === 0}
            >Reset</button>
            <button class="apply-btn" @click=${this._apply}>
              ${count > 0 ? `Apply (${count})` : 'Apply'}
            </button>
          </div>
        </div>
      </div>
    `;
  }
}

customElements.define('ol-filter-modal', OlFilterModal);

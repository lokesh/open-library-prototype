import { LitElement, html, css, svg } from 'lit';
import { getProviderName } from '../import-parser-service.js';

const OL_SHELVES = [
  { value: 'Already Read', label: 'Already Read' },
  { value: 'Currently Reading', label: 'Currently Reading' },
  { value: 'Want to Read', label: 'Want to Read' },
  { value: 'skip', label: 'Don\'t import' },
];

/**
 * Best-guess mapping from common source shelf names to OL shelves.
 * Returns { target, confident } — confident=false means we could not map the
 * shelf, so the caller should surface it for user confirmation rather than
 * silently funneling unknown shelves into "Want to Read".
 */
function guessShelfMapping(sourceShelf) {
  const s = sourceShelf.toLowerCase().trim();
  if (s === 'read' || s.includes('already read') || s === 'finished') {
    return { target: 'Already Read', confident: true };
  }
  if (s === 'currently-reading' || s === 'currently reading' || s === 'started' || s === 'reading') {
    return { target: 'Currently Reading', confident: true };
  }
  if (s === 'to-read' || s === 'to read' || s === 'want to read' || s === 'tbr') {
    return { target: 'Want to Read', confident: true };
  }
  // Unknown shelf — default to skip and flag for user confirmation.
  return { target: 'skip', confident: false };
}

export class OlImportPreview extends LitElement {
  static properties = {
    source: { type: String },
    parsedBooks: { type: Array },
    stats: { type: Object },
    fileName: { type: String },
    parseErrors: { type: Array },
    _shelfMapping: { state: true },
    _shelfConfidence: { state: true },
    _shelfMappingExpanded: { state: true },
    _importOptions: { state: true },
    _customizeExpanded: { state: true },
  };

  static styles = css`
    :host {
      display: block;
    }

    h2 {
      font-family: var(--heading-font-family);
      font-weight: var(--heading-font-weight);
      font-size: var(--font-size-2xl);
      color: var(--heading-color);
      margin: 0 0 var(--spacing-5);
    }

    h3 {
      font-family: var(--heading-font-family);
      font-weight: var(--heading-font-weight);
      font-size: var(--font-size-lg);
      color: var(--heading-color);
      margin: 0 0 var(--spacing-3);
    }

    .section {
      margin-bottom: var(--spacing-8);
    }

    .section-description {
      color: var(--color-text-secondary);
      font-size: var(--font-size-sm);
      margin-bottom: var(--spacing-4);
    }

    /* Unified summary card — file header merged with stat cells so the page
       opens with a single "here's what you uploaded" object instead of a
       filename chip on top of a row of stat tiles. */
    .summary-card {
      border: 1px solid var(--color-border);
      border-radius: var(--radius-card);
      background: var(--color-bg-elevated);
      overflow: hidden;
      margin-bottom: var(--spacing-4);
    }

    .summary-header {
      display: flex;
      align-items: center;
      gap: var(--spacing-3);
      padding: var(--spacing-4);
      border-bottom: 1px solid var(--color-border-subtle);
    }

    .summary-header-icon {
      width: 40px;
      height: 40px;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: var(--radius-md);
      background: var(--color-bg);
      color: var(--color-text-secondary);
    }

    .summary-header-icon svg {
      width: 20px;
      height: 20px;
    }

    .summary-header-text {
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .summary-header-name {
      font-size: var(--font-size-md);
      font-weight: var(--font-weight-semibold);
      color: var(--color-text-strong);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .summary-header-provider {
      font-size: var(--font-size-xs);
      color: var(--color-text-secondary);
      text-transform: uppercase;
      letter-spacing: var(--letter-spacing-wide);
    }

    .summary-stats {
      display: flex;
    }

    .summary-stat {
      flex: 1;
      padding: var(--spacing-4);
      display: flex;
      flex-direction: column;
      gap: var(--spacing-1);
      border-left: 1px solid var(--color-border-subtle);
      min-width: 0;
    }

    .summary-stat:first-child {
      border-left: none;
    }

    .summary-stat-value {
      font-family: var(--heading-font-family);
      font-size: var(--font-size-2xl);
      font-weight: var(--font-weight-bold);
      color: var(--color-text-strong);
      line-height: 1;
    }

    .summary-stat-label {
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
    }

    .parse-errors {
      padding: var(--spacing-2) var(--spacing-3);
      background: var(--color-neutral-100);
      border-radius: var(--radius-md);
      font-size: var(--font-size-xs);
      color: var(--color-text-secondary);
      margin-bottom: var(--spacing-8);
    }

    .parse-errors summary {
      cursor: pointer;
      font-weight: var(--font-weight-medium);
    }

    .parse-errors ul {
      margin: var(--spacing-2) 0 0;
      padding-left: var(--spacing-4);
    }

    /* Shelf mapping */
    .shelf-mapping {
      border: 1px solid var(--color-border);
      border-radius: var(--radius-card);
      overflow: hidden;
    }

    .shelf-row {
      display: grid;
      grid-template-columns: 1fr auto 1fr;
      align-items: center;
      gap: var(--spacing-3);
      padding: var(--spacing-3) var(--spacing-4);
      border-bottom: 1px solid var(--color-border-subtle);
      background: var(--color-bg-elevated);
    }

    .shelf-row:last-child {
      border-bottom: none;
    }

    .shelf-row-header {
      background: var(--color-bg);
      font-weight: var(--font-weight-semibold);
      font-size: var(--font-size-xs);
      color: var(--color-text-secondary);
      text-transform: uppercase;
      letter-spacing: var(--letter-spacing-wide);
    }

    .shelf-source {
      display: flex;
      flex-direction: column;
      gap: 2px;
      min-width: 0;
    }

    .shelf-name {
      font-size: var(--font-size-md);
      font-weight: var(--font-weight-semibold);
      color: var(--color-text-strong);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .shelf-count {
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-semibold);
      color: var(--color-text-secondary);
      letter-spacing: var(--letter-spacing-wide);
      text-transform: uppercase;
    }

    .shelf-arrow {
      color: var(--color-text-secondary);
      text-align: center;
    }

    .shelf-arrow svg {
      width: 16px;
      height: 16px;
      vertical-align: middle;
    }

    select {
      font-family: var(--body-font-family);
      font-size: var(--font-size-sm);
      padding: var(--spacing-1) var(--spacing-2);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      background: var(--color-bg-elevated);
      color: var(--color-text);
      cursor: pointer;
      width: 100%;
    }

    select:focus {
      outline: none;
      border-color: var(--color-border-focused);
      box-shadow: var(--focus-ring);
    }

    /* Shelf mapping collapsed summary */
    .shelf-mapping-collapsed {
      border: 1px solid var(--color-border);
      border-radius: var(--radius-card);
      background: var(--color-bg-elevated);
      padding: var(--spacing-3) var(--spacing-4);
      display: flex;
      align-items: center;
      gap: var(--spacing-4);
      justify-content: space-between;
      flex-wrap: wrap;
    }

    .shelf-mapping-summary-lines {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-1);
      font-size: var(--font-size-sm);
      color: var(--color-text);
      min-width: 0;
    }

    .shelf-summary-line {
      display: flex;
      align-items: center;
      gap: var(--spacing-2);
    }

    .shelf-summary-source {
      color: var(--color-text-strong);
      font-weight: var(--font-weight-medium);
    }

    .shelf-summary-arrow {
      color: var(--color-text-secondary);
    }

    .shelf-summary-target {
      color: var(--color-text-secondary);
    }

    .shelf-summary-count {
      color: var(--color-text-secondary);
      font-size: var(--font-size-xs);
      margin-left: var(--spacing-1);
    }

    .edit-link {
      background: none;
      border: none;
      color: var(--color-link);
      cursor: pointer;
      font-family: var(--body-font-family);
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
      padding: var(--spacing-1) var(--spacing-2);
      flex-shrink: 0;
    }

    .edit-link:hover {
      color: var(--color-link-hovered);
    }

    /* Unmapped shelf row flag */
    .shelf-row.unmapped {
      background: #fef3c7;
    }

    .unmapped-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-semibold);
      color: #92400e;
      text-transform: uppercase;
      letter-spacing: var(--letter-spacing-wide);
      margin-top: 2px;
    }

    /* Progressive-disclosure "Fine-tune import" panel. Holds the per-field
       toggles (ratings/reviews/dates) and duplicate handling. Hidden by
       default because good defaults (import everything, skip duplicates)
       cover the happy path. */
    .fine-tune {
      margin-top: var(--spacing-4);
    }

    .fine-tune-toggle {
      background: none;
      border: none;
      color: var(--color-link);
      cursor: pointer;
      font-family: var(--body-font-family);
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
      padding: var(--spacing-2) 0;
      display: inline-flex;
      align-items: center;
      gap: var(--spacing-1);
    }

    .fine-tune-toggle:hover {
      color: var(--color-link-hovered);
    }

    .fine-tune-toggle svg {
      width: 14px;
      height: 14px;
      transition: transform 0.15s ease;
    }

    .fine-tune-toggle[aria-expanded="true"] svg {
      transform: rotate(180deg);
    }

    .fine-tune-panel {
      margin-top: var(--spacing-3);
      padding: var(--spacing-5);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-card);
      background: var(--color-bg-elevated);
      display: flex;
      flex-direction: column;
      gap: var(--spacing-6);
    }

    .fine-tune-section-title {
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-semibold);
      color: var(--color-text-strong);
      text-transform: uppercase;
      letter-spacing: var(--letter-spacing-wide);
      margin: 0 0 var(--spacing-3);
    }

    .field-toggles {
      display: flex;
      flex-direction: column;
    }

    .field-toggle-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--spacing-3);
      padding: var(--spacing-3) 0;
      border-bottom: 1px solid var(--color-border-subtle);
    }

    .field-toggle-row:last-child {
      border-bottom: none;
    }

    .field-toggle-label {
      display: flex;
      flex-direction: column;
      gap: 2px;
      min-width: 0;
    }

    .field-toggle-title {
      font-size: var(--font-size-md);
      font-weight: var(--font-weight-medium);
      color: var(--color-text-strong);
    }

    .field-toggle-count {
      font-size: var(--font-size-xs);
      color: var(--color-text-secondary);
    }

    .field-toggle-row input[type="checkbox"] {
      width: 18px;
      height: 18px;
      accent-color: var(--color-brand-primary);
      cursor: pointer;
      flex-shrink: 0;
    }

    /* Duplicate handling */
    .radio-group {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-2);
    }

    .radio-group label {
      font-size: var(--font-size-sm);
      color: var(--color-text);
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: var(--spacing-2);
    }

    .radio-group input[type="radio"] {
      accent-color: var(--color-brand-primary);
      cursor: pointer;
    }

    .radio-hint {
      font-size: var(--font-size-xs);
      color: var(--color-text-secondary);
      margin: 0 0 var(--spacing-2) calc(18px + var(--spacing-2));
    }

    @media (max-width: 640px) {
      .summary-stats {
        flex-wrap: wrap;
      }

      .summary-stat {
        flex: 1 1 50%;
        border-left: none;
        border-top: 1px solid var(--color-border-subtle);
      }

      .summary-stat:nth-child(2n) {
        border-left: 1px solid var(--color-border-subtle);
      }

      .summary-stat:nth-child(-n+2) {
        border-top: none;
      }
    }

    @media (max-width: 600px) {
      .shelf-row {
        grid-template-columns: 1fr;
        gap: var(--spacing-1);
      }

      .shelf-arrow {
        display: none;
      }

      .shelf-row-header {
        display: none;
      }
    }
  `;

  constructor() {
    super();
    this.source = '';
    this.parsedBooks = [];
    this.stats = {};
    this.fileName = '';
    this.parseErrors = [];
    this._shelfMapping = {};
    this._shelfConfidence = {};
    this._shelfMappingExpanded = false;
    this._importOptions = { ratings: true, reviews: true, dates: true, duplicates: 'skip' };
    this._customizeExpanded = false;
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('ol-import-primary-invoke', this._continue);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('ol-import-primary-invoke', this._continue);
  }

  willUpdate(changed) {
    if (changed.has('stats') && this.stats?.shelves) {
      // Initialize shelf mapping with best guesses.
      const mapping = {};
      const confidence = {};
      for (const shelf of Object.keys(this.stats.shelves)) {
        const guess = guessShelfMapping(shelf);
        mapping[shelf] = guess.target;
        confidence[shelf] = guess.confident;
      }
      this._shelfMapping = mapping;
      this._shelfConfidence = confidence;
      // Auto-expand the mapping UI when any shelf couldn't be guessed, so the
      // user is forced to eyeball it instead of silently trusting defaults.
      this._shelfMappingExpanded = Object.values(confidence).some((c) => !c);
    }
  }

  updated(changed) {
    // Re-announce primary-state to the wizard whenever any input to the
    // footer summary sentence changes. The summary says how many books
    // will actually be imported given the current shelf mapping + options.
    if (
      changed.has('stats') ||
      changed.has('parsedBooks') ||
      changed.has('_shelfMapping') ||
      changed.has('_importOptions')
    ) {
      this._dispatchPrimaryState();
    }
  }

  _dispatchPrimaryState() {
    const shelves = this.stats?.shelves || {};
    const shelfEntries = Object.entries(shelves);
    const importingShelves = shelfEntries.filter(
      ([shelf]) => this._shelfMapping[shelf] && this._shelfMapping[shelf] !== 'skip'
    );
    const importingBooks = importingShelves.reduce((sum, [, count]) => sum + count, 0);

    const summary = importingBooks > 0
      ? `${importingBooks.toLocaleString()} book${importingBooks === 1 ? '' : 's'} ready to import`
      : 'Nothing selected to import';

    this.dispatchEvent(new CustomEvent('ol-import-primary-state', {
      bubbles: true,
      composed: true,
      detail: {
        visible: true,
        label: 'Start Import',
        disabled: importingBooks === 0,
        summary,
      },
    }));
  }

  _toggleShelfMapping() {
    this._shelfMappingExpanded = !this._shelfMappingExpanded;
  }

  _toggleCustomize() {
    this._customizeExpanded = !this._customizeExpanded;
  }

  _updateShelfMapping(sourceShelf, e) {
    this._shelfMapping = { ...this._shelfMapping, [sourceShelf]: e.target.value };
  }

  _updateOption(key, e) {
    this._importOptions = { ...this._importOptions, [key]: e.target.checked };
  }

  _updateDuplicates(e) {
    this._importOptions = { ...this._importOptions, duplicates: e.target.value };
  }

  _continue = () => {
    this.dispatchEvent(new CustomEvent('ol-import-step-complete', {
      bubbles: true,
      composed: true,
      detail: {
        step: 2,
        data: {
          shelfMapping: this._shelfMapping,
          importOptions: this._importOptions,
        },
      },
    }));
  };

  render() {
    const providerName = getProviderName(this.source);
    const shelves = this.stats?.shelves || {};
    const shelfEntries = Object.entries(shelves).sort((a, b) => b[1] - a[1]);
    const total = this.stats?.total || 0;

    const warnSvg = svg`<path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`;
    const chevronSvg = svg`<path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`;

    // Shelf mapping collapses when every shelf mapped confidently.
    const allConfident = shelfEntries.every(([shelf]) => this._shelfConfidence[shelf]);
    const showCollapsed = allConfident && !this._shelfMappingExpanded && shelfEntries.length > 0;

    const shelfCount = Object.keys(shelves).length;
    const withRatings = this.stats?.withRatings || 0;
    const withReviews = this.stats?.withReviews || 0;
    const withDates = this.stats?.withDates || 0;

    // Stat cells inside the unified summary card. Books and Shelves always
    // show; ratings/reviews/dates only appear if the source file had any.
    const statCells = [
      { value: total, label: total === 1 ? 'Book' : 'Books' },
      { value: shelfCount, label: shelfCount === 1 ? 'Shelf' : 'Shelves' },
      withRatings > 0 ? { value: withRatings, label: withRatings === 1 ? 'Rating' : 'Ratings' } : null,
      withReviews > 0 ? { value: withReviews, label: withReviews === 1 ? 'Review' : 'Reviews' } : null,
      withDates > 0 ? { value: withDates, label: withDates === 1 ? 'Date read' : 'Dates read' } : null,
    ].filter(Boolean);

    // Only surface toggles for fields that actually exist in the file.
    const allToggleCards = [
      { key: 'ratings', title: 'Star ratings', count: withRatings },
      { key: 'reviews', title: 'Reviews', count: withReviews },
      { key: 'dates', title: 'Dates read', count: withDates },
    ];
    const toggleCards = allToggleCards.filter((c) => c.count > 0);

    return html`
      <h2>Preview</h2>

      <div class="summary-card">
        ${this.fileName ? html`
          <div class="summary-header">
            <div class="summary-header-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
            </div>
            <div class="summary-header-text">
              <span class="summary-header-name">${this.fileName}</span>
              <span class="summary-header-provider">from ${providerName}</span>
            </div>
          </div>
        ` : ''}
        <div class="summary-stats">
          ${statCells.map((s) => html`
            <div class="summary-stat">
              <div class="summary-stat-value">${s.value.toLocaleString()}</div>
              <div class="summary-stat-label">${s.label}</div>
            </div>
          `)}
        </div>
      </div>

      ${this.parseErrors?.length ? html`
        <details class="parse-errors">
          <summary>${this.parseErrors.length} row${this.parseErrors.length !== 1 ? 's' : ''} skipped during parsing</summary>
          <ul>
            ${this.parseErrors.map((e) => html`<li>Row ${e.row}: ${e.message}</li>`)}
          </ul>
        </details>
      ` : ''}

      <div class="fine-tune">
        <button
          class="fine-tune-toggle"
          aria-expanded=${this._customizeExpanded ? 'true' : 'false'}
          aria-controls="fine-tune-panel"
          @click=${this._toggleCustomize}
        >
          Fine-tune import
          <svg viewBox="0 0 24 24">${chevronSvg}</svg>
        </button>
        ${this._customizeExpanded ? html`
          <div class="fine-tune-panel" id="fine-tune-panel">
            ${toggleCards.length > 0 ? html`
              <div>
                <h4 class="fine-tune-section-title">Include in import</h4>
                <div class="field-toggles">
                  ${toggleCards.map((card) => html`
                    <label class="field-toggle-row">
                      <div class="field-toggle-label">
                        <span class="field-toggle-title">${card.title}</span>
                        <span class="field-toggle-count">${card.count.toLocaleString()} in file</span>
                      </div>
                      <input
                        type="checkbox"
                        .checked=${this._importOptions[card.key]}
                        @change=${(e) => this._updateOption(card.key, e)}
                      >
                    </label>
                  `)}
                </div>
              </div>
            ` : ''}
            <div>
              <h4 class="fine-tune-section-title">Duplicate handling</h4>
              <div class="radio-group">
                <label>
                  <input type="radio" name="duplicates" value="skip" .checked=${this._importOptions.duplicates === 'skip'} @change=${this._updateDuplicates}>
                  Skip duplicates
                </label>
                <p class="radio-hint">Keep your existing Open Library data unchanged.</p>
                <label>
                  <input type="radio" name="duplicates" value="replace" .checked=${this._importOptions.duplicates === 'replace'} @change=${this._updateDuplicates}>
                  Replace with imported data
                </label>
                <p class="radio-hint">Overwrite existing entries with data from ${providerName}.</p>
              </div>
            </div>
          </div>
        ` : ''}
      </div>

      <div class="section" style="margin-top: var(--spacing-8);">
        <h3>Shelf Mapping</h3>
        <p class="section-description">Choose how your ${providerName} shelves map to Open Library.</p>
        ${showCollapsed ? html`
          <div class="shelf-mapping-collapsed">
            <div class="shelf-mapping-summary-lines">
              ${shelfEntries.map(([shelf, count]) => html`
                <div class="shelf-summary-line">
                  <span class="shelf-summary-source">${shelf}</span>
                  <span class="shelf-summary-arrow">→</span>
                  <span class="shelf-summary-target">${this._shelfMapping[shelf]}</span>
                  <span class="shelf-summary-count">(${count})</span>
                </div>
              `)}
            </div>
            <button class="edit-link" @click=${this._toggleShelfMapping}>Edit mapping</button>
          </div>
        ` : html`
          <div class="shelf-mapping">
            <div class="shelf-row shelf-row-header">
              <span>${providerName} Shelf</span>
              <span></span>
              <span>Open Library Shelf</span>
            </div>
            ${shelfEntries.map(([shelf, count]) => {
              const isUnmapped = !this._shelfConfidence[shelf];
              return html`
                <div class="shelf-row ${isUnmapped ? 'unmapped' : ''}">
                  <div class="shelf-source">
                    <span class="shelf-name">${shelf}</span>
                    <span class="shelf-count">${count} book${count !== 1 ? 's' : ''}</span>
                    ${isUnmapped ? html`
                      <span class="unmapped-badge">
                        <svg viewBox="0 0 24 24" width="12" height="12">${warnSvg}</svg>
                        Needs mapping
                      </span>
                    ` : ''}
                  </div>
                  <div class="shelf-arrow">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </div>
                  <select
                    .value=${this._shelfMapping[shelf] || 'skip'}
                    @change=${(e) => this._updateShelfMapping(shelf, e)}
                  >
                    ${OL_SHELVES.map((s) => html`
                      <option value=${s.value} ?selected=${this._shelfMapping[shelf] === s.value}>${s.label}</option>
                    `)}
                  </select>
                </div>
              `;
            })}
          </div>
        `}
      </div>
    `;
  }
}

customElements.define('ol-import-preview', OlImportPreview);

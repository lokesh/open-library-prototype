import { LitElement, html, css } from 'lit';
import { getProviderName } from '../import-parser-service.js';

const OL_SHELVES = [
  { value: 'Already Read', label: 'Already Read' },
  { value: 'Currently Reading', label: 'Currently Reading' },
  { value: 'Want to Read', label: 'Want to Read' },
  { value: 'skip', label: 'Don\'t import' },
];

/** Best-guess mapping from common source shelf names to OL shelves */
function guessShelfMapping(sourceShelf) {
  const s = sourceShelf.toLowerCase().trim();
  if (s === 'read' || s.includes('already read') || s === 'finished') return 'Already Read';
  if (s === 'currently-reading' || s === 'currently reading' || s === 'started') return 'Currently Reading';
  if (s === 'to-read' || s === 'to read' || s === 'want to read' || s === 'tbr') return 'Want to Read';
  return 'Want to Read';
}

export class OlImportPreview extends LitElement {
  static properties = {
    source: { type: String },
    parsedBooks: { type: Array },
    stats: { type: Object },
    _shelfMapping: { state: true },
    _importOptions: { state: true },
  };

  static styles = css`
    :host {
      display: block;
    }

    h2 {
      font-family: var(--heading-font-family);
      font-weight: var(--heading-font-weight);
      font-size: var(--font-size-xl);
      color: var(--heading-color);
      margin: 0 0 var(--spacing-4);
    }

    h3 {
      font-family: var(--heading-font-family);
      font-weight: var(--heading-font-weight);
      font-size: var(--font-size-lg);
      color: var(--heading-color);
      margin: 0 0 var(--spacing-3);
    }

    /* Summary stats */
    .summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: var(--spacing-3);
      margin-bottom: var(--spacing-8);
    }

    .summary-card {
      border: 1px solid var(--color-border);
      border-radius: var(--radius-card);
      padding: var(--spacing-4);
      background: var(--color-bg-elevated);
      text-align: center;
    }

    .summary-value {
      font-size: var(--font-size-2xl);
      font-weight: var(--font-weight-bold);
      color: var(--color-text-strong);
      font-family: var(--heading-font-family);
    }

    .summary-label {
      font-size: var(--font-size-xs);
      color: var(--color-text-secondary);
      margin-top: var(--spacing-1);
    }

    /* Shelf mapping */
    .section {
      margin-bottom: var(--spacing-8);
    }

    .section-description {
      color: var(--color-text-secondary);
      font-size: var(--font-size-sm);
      margin-bottom: var(--spacing-4);
    }

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

    .shelf-name {
      font-size: var(--font-size-sm);
      color: var(--color-text-strong);
    }

    .shelf-count {
      font-size: var(--font-size-xs);
      color: var(--color-text-secondary);
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

    /* Import options */
    .options {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-3);
    }

    .option-row {
      display: flex;
      align-items: center;
      gap: var(--spacing-3);
    }

    .option-row label {
      font-size: var(--font-size-sm);
      color: var(--color-text);
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: var(--spacing-2);
    }

    .option-row input[type="checkbox"] {
      width: 18px;
      height: 18px;
      accent-color: var(--color-brand-primary);
      cursor: pointer;
    }

    /* Duplicate handling */
    .radio-group {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-2);
      margin-top: var(--spacing-2);
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
      margin-left: calc(18px + var(--spacing-2));
    }

    /* Book preview list */
    .book-preview {
      margin-top: var(--spacing-4);
    }

    .book-preview-list {
      border: 1px solid var(--color-border);
      border-radius: var(--radius-card);
      max-height: 200px;
      overflow-y: auto;
    }

    .book-preview-item {
      padding: var(--spacing-2) var(--spacing-3);
      border-bottom: 1px solid var(--color-border-subtle);
      font-size: var(--font-size-sm);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .book-preview-item:last-child {
      border-bottom: none;
    }

    .book-preview-title {
      color: var(--color-text-strong);
      font-weight: var(--font-weight-medium);
    }

    .book-preview-author {
      color: var(--color-text-secondary);
      font-size: var(--font-size-xs);
    }

    .preview-toggle {
      background: none;
      border: none;
      color: var(--color-link);
      cursor: pointer;
      font-family: var(--body-font-family);
      font-size: var(--font-size-sm);
      padding: 0;
    }

    .preview-toggle:hover {
      color: var(--color-link-hovered);
    }

    /* Actions */
    .actions {
      margin-top: var(--spacing-8);
      display: flex;
      justify-content: flex-end;
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
    this._shelfMapping = {};
    this._importOptions = { ratings: true, reviews: true, dates: true, duplicates: 'skip' };
  }

  willUpdate(changed) {
    if (changed.has('stats') && this.stats?.shelves) {
      // Initialize shelf mapping with best guesses
      const mapping = {};
      for (const shelf of Object.keys(this.stats.shelves)) {
        mapping[shelf] = guessShelfMapping(shelf);
      }
      this._shelfMapping = mapping;
    }
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

  _continue() {
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
  }

  render() {
    const providerName = getProviderName(this.source);
    const shelves = this.stats?.shelves || {};
    const shelfEntries = Object.entries(shelves).sort((a, b) => b[1] - a[1]);

    return html`
      <h2>Review Your Import</h2>

      <div class="summary">
        <div class="summary-card">
          <div class="summary-value">${this.stats?.total || 0}</div>
          <div class="summary-label">Total books</div>
        </div>
        <div class="summary-card">
          <div class="summary-value">${shelfEntries.length}</div>
          <div class="summary-label">Shelves</div>
        </div>
        <div class="summary-card">
          <div class="summary-value">${this.stats?.withRatings || 0}</div>
          <div class="summary-label">Rated</div>
        </div>
        <div class="summary-card">
          <div class="summary-value">${this.stats?.withReviews || 0}</div>
          <div class="summary-label">Reviewed</div>
        </div>
      </div>

      <div class="section">
        <h3>Shelf Mapping</h3>
        <p class="section-description">Choose how your ${providerName} shelves map to Open Library.</p>
        <div class="shelf-mapping">
          <div class="shelf-row shelf-row-header">
            <span>${providerName} Shelf</span>
            <span></span>
            <span>Open Library Shelf</span>
          </div>
          ${shelfEntries.map(([shelf, count]) => html`
            <div class="shelf-row">
              <div>
                <span class="shelf-name">${shelf}</span>
                <span class="shelf-count">(${count} book${count !== 1 ? 's' : ''})</span>
              </div>
              <div class="shelf-arrow">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </div>
              <select
                .value=${this._shelfMapping[shelf] || 'Want to Read'}
                @change=${(e) => this._updateShelfMapping(shelf, e)}
              >
                ${OL_SHELVES.map(s => html`
                  <option value=${s.value} ?selected=${this._shelfMapping[shelf] === s.value}>${s.label}</option>
                `)}
              </select>
            </div>
          `)}
        </div>
      </div>

      <div class="section">
        <h3>What to Import</h3>
        <div class="options">
          <div class="option-row">
            <label>
              <input type="checkbox" .checked=${this._importOptions.ratings} @change=${(e) => this._updateOption('ratings', e)}>
              Star ratings
            </label>
          </div>
          <div class="option-row">
            <label>
              <input type="checkbox" .checked=${this._importOptions.reviews} @change=${(e) => this._updateOption('reviews', e)}>
              Reviews
            </label>
          </div>
          <div class="option-row">
            <label>
              <input type="checkbox" .checked=${this._importOptions.dates} @change=${(e) => this._updateOption('dates', e)}>
              Dates read
            </label>
          </div>
        </div>
      </div>

      <div class="section">
        <h3>Duplicate Handling</h3>
        <p class="section-description">If a book already exists in your Open Library account:</p>
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

      <div class="actions">
        <ol-button variant="primary" @click=${this._continue}>Start Import</ol-button>
      </div>
    `;
  }
}

customElements.define('ol-import-preview', OlImportPreview);

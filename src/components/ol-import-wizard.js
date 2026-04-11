import { LitElement, html, css, svg } from 'lit';

const STEP_LABELS = ['Source', 'Upload', 'Preview', 'Import', 'Review', 'Done'];

export class OlImportWizard extends LitElement {
  static properties = {
    _step: { state: true },
    _source: { state: true },
    _parsedBooks: { state: true },
    _stats: { state: true },
    _shelfMapping: { state: true },
    _importOptions: { state: true },
    _results: { state: true },
    _finalBooks: { state: true },
    _importBatchId: { state: true },
  };

  static styles = css`
    :host {
      display: block;
      max-width: 900px;
      margin: 0 auto;
      padding: var(--spacing-6) var(--spacing-4);
      font-family: var(--body-font-family);
    }

    .wizard-header {
      margin-bottom: var(--spacing-8);
    }

    h1 {
      font-family: var(--heading-font-family);
      font-weight: var(--heading-font-weight);
      font-size: var(--font-size-3xl);
      color: var(--heading-color);
      margin: 0 0 var(--spacing-2);
    }

    .subtitle {
      color: var(--color-text-secondary);
      font-size: var(--font-size-md);
      margin: 0;
    }

    /* Step indicator */
    .step-indicator {
      display: flex;
      align-items: flex-start;
      justify-content: center;
      margin-bottom: var(--spacing-2);
      gap: 0;
    }

    .step-indicator.hidden {
      display: none;
    }

    .step-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--spacing-1);
    }

    .dot {
      width: 32px;
      height: 32px;
      border-radius: var(--radius-full);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-semibold);
      border: 2px solid var(--color-border);
      color: var(--color-text-secondary);
      background: var(--color-bg-elevated);
      transition: all 0.2s ease;
      flex-shrink: 0;
    }

    .dot.active {
      border-color: var(--color-brand-primary);
      background: var(--color-brand-primary);
      color: var(--color-text-on-primary);
    }

    .dot.completed {
      border-color: var(--color-brand-primary);
      background: var(--color-brand-primary);
      color: var(--color-text-on-primary);
    }

    .dot svg {
      width: 16px;
      height: 16px;
    }

    .connector {
      width: 40px;
      height: 2px;
      background: var(--color-border);
      transition: background 0.2s ease;
      margin-top: 16px; /* half of dot height to vertically center */
      flex-shrink: 0;
    }

    .connector.completed {
      background: var(--color-brand-primary);
    }

    .step-label {
      font-size: var(--font-size-xs);
      color: var(--color-text-secondary);
      white-space: nowrap;
      text-align: center;
    }

    .step-label.active {
      color: var(--color-brand-primary);
      font-weight: var(--font-weight-semibold);
    }

    .step-label.completed {
      color: var(--color-brand-primary);
    }

    /* Step content area */
    .step-content {
      min-height: 300px;
    }

    /* Back button */
    .back-button {
      display: inline-flex;
      align-items: center;
      gap: var(--spacing-2);
      background: none;
      border: none;
      color: var(--color-text-secondary);
      cursor: pointer;
      padding: var(--spacing-2) 0;
      font-family: var(--body-font-family);
      font-size: var(--font-size-sm);
      margin-bottom: var(--spacing-4);
    }

    .back-button:hover {
      color: var(--color-text-strong);
    }

    .back-button svg {
      width: 16px;
      height: 16px;
    }

    @media (max-width: 600px) {
      :host {
        padding: var(--spacing-4) var(--spacing-3);
      }

      .connector {
        width: 20px;
      }

      h1 {
        font-size: var(--font-size-2xl);
      }
    }
  `;

  constructor() {
    super();
    this._step = 0;
    this._source = '';
    this._parsedBooks = [];
    this._stats = {};
    this._shelfMapping = {};
    this._importOptions = { ratings: true, reviews: true, dates: true, duplicates: 'skip' };
    this._results = { matched: [], needsReview: [], notFound: [] };
    this._finalBooks = [];
    this._importBatchId = '';
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('ol-import-step-complete', this._handleStepComplete);
    this.addEventListener('ol-import-back', this._handleBack);
    this.addEventListener('ol-import-undo', this._handleUndo);
    this.addEventListener('ol-import-restart', this._handleRestart);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('ol-import-step-complete', this._handleStepComplete);
    this.removeEventListener('ol-import-back', this._handleBack);
    this.removeEventListener('ol-import-undo', this._handleUndo);
    this.removeEventListener('ol-import-restart', this._handleRestart);
  }

  _handleStepComplete = (e) => {
    e.stopPropagation();
    const { step, data } = e.detail;

    switch (step) {
      case 0:
        this._source = data.source;
        break;
      case 1:
        this._parsedBooks = data.books;
        this._stats = data.stats;
        break;
      case 2:
        this._shelfMapping = data.shelfMapping;
        this._importOptions = data.importOptions;
        break;
      case 3:
        this._results = data.results;
        this._importBatchId = `ol-import-${Date.now()}`;
        break;
      case 4:
        // Results review complete — save batch to localStorage
        this._finalBooks = data.finalBooks;
        this._saveBatch(data.finalBooks);
        break;
    }

    this._step = Math.min(step + 1, 5);
  };

  _handleBack = (e) => {
    e.stopPropagation();
    if (this._step > 0 && this._step !== 3) {
      this._step--;
    }
  };

  _handleUndo = (e) => {
    e.stopPropagation();
    if (this._importBatchId) {
      localStorage.removeItem(this._importBatchId);
    }
    this._reset();
  };

  _handleRestart = (e) => {
    e.stopPropagation();
    this._reset();
  };

  _reset() {
    this._step = 0;
    this._source = '';
    this._parsedBooks = [];
    this._stats = {};
    this._shelfMapping = {};
    this._importOptions = { ratings: true, reviews: true, dates: true, duplicates: 'skip' };
    this._results = { matched: [], needsReview: [], notFound: [] };
    this._finalBooks = [];
    this._importBatchId = '';
  }

  _saveBatch(finalBooks) {
    const batch = {
      id: this._importBatchId,
      source: this._source,
      date: new Date().toISOString(),
      stats: {
        total: this._stats.total,
        matched: this._results.matched.length,
        reviewed: this._results.needsReview.length,
        notFound: this._results.notFound.length,
      },
      books: finalBooks || [],
    };
    try {
      localStorage.setItem(this._importBatchId, JSON.stringify(batch));
    } catch (_) {
      // localStorage full — silent fail for prototype
    }
  }

  _renderStepIndicator() {
    if (this._step === 5) return '';

    const checkSvg = svg`<path d="M5 12l5 5L20 7" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>`;

    return html`
      <div class="step-indicator">
        ${STEP_LABELS.slice(0, -1).map((label, i) => html`
          ${i > 0 ? html`<div class="connector ${i <= this._step ? 'completed' : ''}"></div>` : ''}
          <div class="step-item">
            <div class="dot ${i < this._step ? 'completed' : ''} ${i === this._step ? 'active' : ''}">
              ${i < this._step
                ? html`<svg viewBox="0 0 24 24">${checkSvg}</svg>`
                : i + 1}
            </div>
            <div class="step-label ${i === this._step ? 'active' : ''} ${i < this._step ? 'completed' : ''}">${label}</div>
          </div>
        `)}
      </div>
    `;
  }

  _renderBackButton() {
    if (this._step === 0 || this._step === 3 || this._step >= 5) return '';

    return html`
      <button class="back-button" @click=${() => this.dispatchEvent(new CustomEvent('ol-import-back', { bubbles: true, composed: true }))}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        Back
      </button>
    `;
  }

  _renderStep() {
    switch (this._step) {
      case 0:
        return html`<ol-import-source-picker .source=${this._source}></ol-import-source-picker>`;
      case 1:
        return html`<ol-import-upload .source=${this._source}></ol-import-upload>`;
      case 2:
        return html`<ol-import-preview .source=${this._source} .parsedBooks=${this._parsedBooks} .stats=${this._stats}></ol-import-preview>`;
      case 3:
        return html`<ol-import-processing .parsedBooks=${this._parsedBooks} .shelfMapping=${this._shelfMapping} .importOptions=${this._importOptions}></ol-import-processing>`;
      case 4:
        return html`<ol-import-results .results=${this._results} .source=${this._source}></ol-import-results>`;
      case 5:
        return html`<ol-import-complete .results=${this._results} .finalBooks=${this._finalBooks} .source=${this._source} .importBatchId=${this._importBatchId}></ol-import-complete>`;
    }
  }

  render() {
    return html`
      <div class="wizard-header">
        <h1>Import Your Library</h1>
        <p class="subtitle">Bring your books from another platform into Open Library.</p>
      </div>
      ${this._renderStepIndicator()}
      <div class="step-content">
        ${this._renderBackButton()}
        ${this._renderStep()}
      </div>
    `;
  }
}

customElements.define('ol-import-wizard', OlImportWizard);

import { LitElement, html, css, svg } from 'lit';

const STEP_LABELS = ['Choose', 'Upload', 'Preview', 'Match', 'Confirm', 'Done'];

export class OlImportWizard extends LitElement {
  static properties = {
    _step: { state: true },
    _source: { state: true },
    _parsedBooks: { state: true },
    _stats: { state: true },
    _fileName: { state: true },
    _parseErrors: { state: true },
    _shelfMapping: { state: true },
    _importOptions: { state: true },
    _results: { state: true },
    _finalBooks: { state: true },
    _importBatchId: { state: true },
    _primaryState: { state: true },
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
      margin-bottom: var(--spacing-8);
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

    /* Step content area. Bottom padding reserves space for the fixed footer
       bar so the last section is never occluded. Lives here (not on :host)
       because the global reset * { padding: 0 } outcompetes :host rules. */
    .step-content {
      max-width: 560px;
      margin: 0 auto;
      min-height: 300px;
      padding-bottom: calc(var(--spacing-8) + 72px);
    }

    .step-content.wide {
      max-width: 760px;
    }

    /* Fixed footer action bar — back on the left, contextual summary next to
       it, primary action on the right. Each step component tells the wizard
       what the primary button should look like via an ol-import-primary-state
       event; the wizard relays clicks down via an ol-import-primary-invoke
       event on the active step element. This keeps per-step state (shelf
       mapping, matched count) inside the step while the chrome stays here. */
    .wizard-footer {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background: var(--color-bg);
      border-top: 1px solid var(--color-border);
      padding: var(--spacing-3) var(--spacing-4);
      z-index: 10;
    }

    .wizard-footer-inner {
      max-width: 900px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      gap: var(--spacing-4);
      min-height: 40px;
    }

    .footer-left {
      display: flex;
      align-items: center;
      gap: var(--spacing-4);
      flex: 1;
      min-width: 0;
    }

    .footer-right {
      flex-shrink: 0;
      display: flex;
      align-items: center;
      gap: var(--spacing-4);
    }

    /* Back button uses ol-button variant="secondary". We only need to
       style the icon alignment inside its slot. */
    .back-icon {
      display: inline-flex;
      align-items: center;
      gap: var(--spacing-2);
    }

    .back-icon svg {
      width: 16px;
      height: 16px;
    }

    /* ol-button flips its :host to display:block at ≤768px. Keep both
       footer buttons inline so they don't stretch and wreck the row. */
    .footer-left ol-button,
    .footer-right ol-button {
      display: inline-block;
    }

    .footer-summary {
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      min-width: 0;
    }

    .footer-summary strong {
      color: var(--color-text-strong);
      font-weight: var(--font-weight-semibold);
    }

    @media (max-width: 600px) {
      :host {
        padding: var(--spacing-4) var(--spacing-3);
      }

      .step-content {
        padding-bottom: calc(var(--spacing-6) + 72px);
      }

      .connector {
        width: 20px;
      }

      h1 {
        font-size: var(--font-size-2xl);
      }

      .wizard-footer {
        padding: var(--spacing-3);
      }

      /* On narrow screens drop the summary sentence — back + primary is
         the essential pair. */
      .footer-summary {
        display: none;
      }
    }
  `;

  constructor() {
    super();
    this._step = 0;
    this._source = '';
    this._parsedBooks = [];
    this._stats = {};
    this._fileName = '';
    this._parseErrors = [];
    this._shelfMapping = {};
    this._importOptions = { ratings: true, reviews: true, dates: true, duplicates: 'skip' };
    this._results = { matched: [], needsReview: [], notFound: [] };
    this._finalBooks = [];
    this._importBatchId = '';
    this._primaryState = { visible: false, label: '', disabled: false, summary: '' };
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('ol-import-step-complete', this._handleStepComplete);
    this.addEventListener('ol-import-back', this._handleBack);
    this.addEventListener('ol-import-undo', this._handleUndo);
    this.addEventListener('ol-import-restart', this._handleRestart);
    this.addEventListener('ol-import-primary-state', this._handlePrimaryState);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('ol-import-step-complete', this._handleStepComplete);
    this.removeEventListener('ol-import-back', this._handleBack);
    this.removeEventListener('ol-import-undo', this._handleUndo);
    this.removeEventListener('ol-import-restart', this._handleRestart);
    this.removeEventListener('ol-import-primary-state', this._handlePrimaryState);
  }

  willUpdate(changed) {
    // When the step changes, clear the primary-state snapshot. The new step's
    // updated() callback will re-announce its primary button state after mount.
    // Without this reset, a step that doesn't announce (like upload) would
    // briefly inherit the previous step's button.
    if (changed.has('_step')) {
      this._primaryState = { visible: false, label: '', disabled: false, summary: '' };
    }
  }

  _handlePrimaryState = (e) => {
    e.stopPropagation();
    this._primaryState = { ...e.detail };
  };

  _handlePrimaryClick = () => {
    // Belt-and-suspenders: ol-button already swallows clicks when disabled,
    // but this guards against a bare-host click (e.g. synthetic dispatch).
    if (this._primaryState.disabled) return;
    // Relay the click to the active step component so it can run its own
    // continue/finish handler with access to its internal state.
    const stepEl = this.renderRoot.querySelector('.step-content > *');
    stepEl?.dispatchEvent(new CustomEvent('ol-import-primary-invoke'));
  };

  _handleBackClick = () => {
    this.dispatchEvent(new CustomEvent('ol-import-back', { bubbles: true, composed: true }));
  };

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
        this._fileName = data.fileName || '';
        this._parseErrors = data.parseErrors || [];
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
    this._fileName = '';
    this._parseErrors = [];
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

  _renderFooter() {
    // Hide the bar entirely on:
    //   - Step 0 (source picker) — selecting a card advances, no back target
    //   - Step 3 (processing) — auto-running, cancel lives inline
    //   - Step 5+ (done) — wizard is finished
    if (this._step === 0 || this._step === 3 || this._step >= 5) return '';

    const showBack = true; // back is always valid on the remaining steps
    const { visible, label, disabled, summary } = this._primaryState;

    return html`
      <div class="wizard-footer">
        <div class="wizard-footer-inner">
          <div class="footer-left">
            ${showBack ? html`
              <ol-button variant="secondary" @click=${this._handleBackClick}>
                <span class="back-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M19 12H5M12 19l-7-7 7-7"/>
                  </svg>
                  Back
                </span>
              </ol-button>
            ` : ''}
          </div>
          <div class="footer-right">
            ${summary ? html`<span class="footer-summary">${summary}</span>` : ''}
            ${visible ? html`
              <ol-button
                variant="primary"
                ?disabled=${disabled}
                @click=${this._handlePrimaryClick}
              >${label}</ol-button>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  }

  _renderStep() {
    switch (this._step) {
      case 0:
        return html`<ol-import-source-picker .source=${this._source}></ol-import-source-picker>`;
      case 1:
        return html`<ol-import-upload .source=${this._source}></ol-import-upload>`;
      case 2:
        return html`<ol-import-preview
          .source=${this._source}
          .parsedBooks=${this._parsedBooks}
          .stats=${this._stats}
          .fileName=${this._fileName}
          .parseErrors=${this._parseErrors}
        ></ol-import-preview>`;
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
      <div class="step-content ${this._step === 1 ? 'wide' : ''}">
        ${this._renderStep()}
      </div>
      ${this._renderFooter()}
    `;
  }
}

customElements.define('ol-import-wizard', OlImportWizard);

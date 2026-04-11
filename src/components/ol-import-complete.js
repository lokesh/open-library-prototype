import { LitElement, html, css, svg } from 'lit';
import { getProviderName } from '../import-parser-service.js';

export class OlImportComplete extends LitElement {
  static properties = {
    results: { type: Object },
    finalBooks: { type: Array },
    source: { type: String },
    importBatchId: { type: String },
    _showUndo: { state: true },
  };

  static styles = css`
    :host {
      display: block;
    }

    .complete-container {
      text-align: center;
      padding: var(--spacing-8) 0;
    }

    /* Checkmark animation */
    .success-icon {
      width: 80px;
      height: 80px;
      margin: 0 auto var(--spacing-6);
      position: relative;
    }

    .success-circle {
      width: 80px;
      height: 80px;
      border-radius: var(--radius-full);
      background: var(--color-brand-primary);
      display: flex;
      align-items: center;
      justify-content: center;
      animation: scaleIn 0.4s ease-out;
    }

    .success-circle svg {
      width: 40px;
      height: 40px;
      color: white;
    }

    .success-check {
      stroke-dasharray: 30;
      stroke-dashoffset: 30;
      animation: drawCheck 0.4s ease-out 0.3s forwards;
    }

    @keyframes scaleIn {
      0% { transform: scale(0); }
      70% { transform: scale(1.1); }
      100% { transform: scale(1); }
    }

    @keyframes drawCheck {
      to { stroke-dashoffset: 0; }
    }

    /* Confetti */
    .confetti-container {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 1000;
      overflow: hidden;
    }

    .confetti-piece {
      position: absolute;
      width: 10px;
      height: 10px;
      top: -10px;
      animation: confettiFall 3s ease-out forwards;
    }

    @keyframes confettiFall {
      0% {
        transform: translateY(0) rotate(0deg);
        opacity: 1;
      }
      100% {
        transform: translateY(100vh) rotate(720deg);
        opacity: 0;
      }
    }

    h2 {
      font-family: var(--heading-font-family);
      font-weight: var(--heading-font-weight);
      font-size: var(--font-size-2xl);
      color: var(--heading-color);
      margin: 0 0 var(--spacing-2);
    }

    .subtitle {
      color: var(--color-text-secondary);
      font-size: var(--font-size-md);
      margin: 0 0 var(--spacing-8);
    }

    /* Stats */
    .final-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: var(--spacing-3);
      max-width: 500px;
      margin: 0 auto var(--spacing-8);
    }

    .stat {
      border: 1px solid var(--color-border);
      border-radius: var(--radius-card);
      padding: var(--spacing-4);
      background: var(--color-bg-elevated);
    }

    .stat-value {
      font-size: var(--font-size-2xl);
      font-weight: var(--font-weight-bold);
      color: var(--color-text-strong);
      font-family: var(--heading-font-family);
    }

    .stat-label {
      font-size: var(--font-size-xs);
      color: var(--color-text-secondary);
      margin-top: var(--spacing-1);
    }

    /* Actions */
    .actions {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--spacing-3);
    }

    .primary-actions {
      display: flex;
      gap: var(--spacing-3);
      flex-wrap: wrap;
      justify-content: center;
    }

    .undo-section {
      margin-top: var(--spacing-4);
    }

    .undo-btn {
      background: none;
      border: none;
      color: var(--color-text-secondary);
      cursor: pointer;
      font-family: var(--body-font-family);
      font-size: var(--font-size-sm);
      padding: var(--spacing-2);
      text-decoration: underline;
    }

    .undo-btn:hover {
      color: var(--color-error);
    }

    .undo-confirm {
      display: flex;
      align-items: center;
      gap: var(--spacing-3);
      padding: var(--spacing-3) var(--spacing-4);
      border: 1px solid var(--color-border-error);
      border-radius: var(--radius-card);
      background: var(--color-red-50);
      font-size: var(--font-size-sm);
    }

    .undo-confirm p {
      color: var(--color-text);
      margin: 0;
    }

    .from-badge {
      display: inline-flex;
      align-items: center;
      gap: var(--spacing-1);
      font-size: var(--font-size-xs);
      padding: var(--spacing-1) var(--spacing-2);
      border-radius: var(--radius-full);
      background: var(--color-bg);
      color: var(--color-text-secondary);
      margin-left: var(--spacing-2);
    }
  `;

  constructor() {
    super();
    this.results = { matched: [], needsReview: [], notFound: [] };
    this.finalBooks = [];
    this.source = '';
    this.importBatchId = '';
    this._showUndo = false;
  }

  connectedCallback() {
    super.connectedCallback();
    // Trigger confetti on mount
    this._confettiTimeout = setTimeout(() => this.requestUpdate(), 50);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    clearTimeout(this._confettiTimeout);
  }

  _handleUndo() {
    if (!this._showUndo) {
      this._showUndo = true;
      return;
    }
    this.dispatchEvent(new CustomEvent('ol-import-undo', { bubbles: true, composed: true }));
  }

  _cancelUndo() {
    this._showUndo = false;
  }

  _handleRestart() {
    this.dispatchEvent(new CustomEvent('ol-import-restart', { bubbles: true, composed: true }));
  }

  _renderConfetti() {
    const colors = ['#3b82f6', '#ef4444', '#f59e0b', '#10b981', '#8b5cf6', '#ec4899'];
    const pieces = Array.from({ length: 40 }, (_, i) => {
      const color = colors[i % colors.length];
      const left = Math.random() * 100;
      const delay = Math.random() * 2;
      const size = 6 + Math.random() * 8;
      const shape = Math.random() > 0.5 ? 'circle' : 'square';
      return html`
        <div
          class="confetti-piece"
          style="
            left: ${left}%;
            animation-delay: ${delay}s;
            width: ${size}px;
            height: ${size}px;
            background: ${color};
            border-radius: ${shape === 'circle' ? '50%' : '2px'};
          "
        ></div>
      `;
    });

    return html`<div class="confetti-container">${pieces}</div>`;
  }

  render() {
    const providerName = getProviderName(this.source);
    const matchedCount = this.finalBooks?.length || this.results?.matched?.length || 0;

    const checkPath = svg`<polyline class="success-check" points="6 13 10 17 18 9" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`;

    return html`
      ${this._renderConfetti()}

      <div class="complete-container">
        <div class="success-icon">
          <div class="success-circle">
            <svg viewBox="0 0 24 24">${checkPath}</svg>
          </div>
        </div>

        <h2>Your library is ready!</h2>
        <p class="subtitle">
          Successfully imported from ${providerName}
          <span class="from-badge">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
              ${svg`<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" fill="none" stroke="currentColor" stroke-width="2"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" fill="none" stroke="currentColor" stroke-width="2"/>`}
            </svg>
            ${providerName}
          </span>
        </p>

        <div class="final-stats">
          <div class="stat">
            <div class="stat-value">${matchedCount}</div>
            <div class="stat-label">Books imported</div>
          </div>
          <div class="stat">
            <div class="stat-value">${this.results?.needsReview?.length || 0}</div>
            <div class="stat-label">Reviewed</div>
          </div>
          <div class="stat">
            <div class="stat-value">${this.results?.notFound?.length || 0}</div>
            <div class="stat-label">Skipped</div>
          </div>
        </div>

        <div class="actions">
          <div class="primary-actions">
            <ol-button variant="primary" @click=${() => window.location.href = 'index.html'}>Browse Your Library</ol-button>
            <ol-button variant="secondary" @click=${this._handleRestart}>Import More Books</ol-button>
          </div>

          <div class="undo-section">
            ${this._showUndo ? html`
              <div class="undo-confirm">
                <p>Remove all ${matchedCount} books from this import?</p>
                <ol-button variant="destructive" size="small" @click=${this._handleUndo}>Yes, Undo</ol-button>
                <ol-button variant="secondary" size="small" @click=${this._cancelUndo}>Cancel</ol-button>
              </div>
            ` : html`
              <button class="undo-btn" @click=${this._handleUndo}>Undo this import</button>
            `}
          </div>
        </div>
      </div>
    `;
  }
}

customElements.define('ol-import-complete', OlImportComplete);

import { LitElement, html, css } from 'lit';

export class OlReadingStats extends LitElement {
  static properties = {
    wantToRead: { type: Number, attribute: 'want-to-read' },
    currentlyReading: { type: Number, attribute: 'currently-reading' },
    haveRead: { type: Number, attribute: 'have-read' }
  };

  static styles = css`
    :host {
      display: block;
    }

    .stats {
      display: flex;
      flex-wrap: wrap;
      gap: var(--spacing-4);
    }

    .stat {
      display: flex;
      align-items: baseline;
      gap: var(--spacing-1);
    }

    .stat-count {
      font-weight: var(--font-weight-bold);
      font-size: var(--body-font-size);
      color: var(--color-text);
    }

    .stat-label {
      font-size: var(--body-font-size-sm);
      color: var(--color-text-secondary);
    }
  `;

  constructor() {
    super();
    this.wantToRead = 0;
    this.currentlyReading = 0;
    this.haveRead = 0;
  }

  _formatNumber(num) {
    return num.toLocaleString();
  }

  render() {
    return html`
      <div class="stats">
        <div class="stat">
          <span class="stat-count">${this._formatNumber(this.wantToRead)}</span>
          <span class="stat-label">Want to Read</span>
        </div>
        <div class="stat">
          <span class="stat-count">${this._formatNumber(this.currentlyReading)}</span>
          <span class="stat-label">Currently Reading</span>
        </div>
        <div class="stat">
          <span class="stat-count">${this._formatNumber(this.haveRead)}</span>
          <span class="stat-label">Have Read</span>
        </div>
      </div>
    `;
  }
}

customElements.define('ol-reading-stats', OlReadingStats);

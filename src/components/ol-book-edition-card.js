import { LitElement, html, css } from 'lit';
import './ol-book-cover.js';

export class OlBookEditionCard extends LitElement {
  static properties = {
    title: { type: String },
    coverUrl: { type: String, attribute: 'cover-url' },
    year: { type: String },
    language: { type: String },
    format: { type: String },
    isbn: { type: String },
    publisher: { type: String },
    availability: { type: String }
  };

  static styles = css`
    :host {
      display: block;
    }

    .card {
      display: flex;
      gap: var(--spacing-3);
      padding: var(--spacing-3);
      border: var(--border-card);
      border-radius: var(--radius-card);
      background-color: var(--color-bg-elevated);
    }

    .details {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: var(--spacing-1);
    }

    .title {
      font-weight: var(--font-weight-semibold);
      font-size: var(--body-font-size);
      color: var(--color-text);
      margin: 0;
    }

    .meta {
      font-size: var(--body-font-size-sm);
      color: var(--color-text-secondary);
    }

    .isbn {
      font-size: var(--font-size-xs);
      color: var(--color-text-secondary);
      font-family: var(--font-family-mono);
    }

    .badge {
      display: inline-block;
      padding: var(--spacing-1) var(--spacing-2);
      border-radius: var(--radius-full);
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-medium);
      margin-top: auto;
      width: fit-content;
    }

    .badge.borrow {
      background-color: var(--color-blue-50);
      color: var(--color-blue-700);
      border: 1px solid var(--color-blue-200);
    }

    .badge.read {
      background-color: #f0fdf4;
      color: #15803d;
      border: 1px solid #bbf7d0;
    }

    .badge.unavailable {
      background-color: var(--color-bg-hovered);
      color: var(--color-text-secondary);
      border: 1px solid var(--color-border);
    }
  `;

  constructor() {
    super();
    this.title = '';
    this.coverUrl = '';
    this.year = '';
    this.language = '';
    this.format = '';
    this.isbn = '';
    this.publisher = '';
    this.availability = '';
  }

  _renderBadge() {
    if (!this.availability) return '';

    const labels = {
      borrow: 'Borrow',
      read: 'Read',
      unavailable: 'Unavailable'
    };

    const label = labels[this.availability] || this.availability;

    return html`<span class="badge ${this.availability}">${label}</span>`;
  }

  render() {
    const metaParts = [this.year, this.language, this.format].filter(Boolean);

    return html`
      <div class="card">
        <ol-book-cover
          size="medium"
          src=${this.coverUrl}
          alt="${this.title} cover"
        ></ol-book-cover>
        <div class="details">
          <p class="title">${this.title}</p>
          ${metaParts.length ? html`<span class="meta">${metaParts.join(' · ')}</span>` : ''}
          ${this.publisher ? html`<span class="meta">${this.publisher}</span>` : ''}
          ${this.isbn ? html`<span class="isbn">ISBN: ${this.isbn}</span>` : ''}
          ${this._renderBadge()}
        </div>
      </div>
    `;
  }
}

customElements.define('ol-book-edition-card', OlBookEditionCard);

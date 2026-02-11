import { LitElement, html, css, nothing } from 'lit';
import searchDataService from '../search-data-service.js';

export class OlSearchResultItem extends LitElement {
  static properties = {
    title: { type: String },
    author: { type: String },
    year: { type: Number },
    coverUrl: { attribute: 'cover-url', type: String },
    query: { type: String },
    rating: { type: Number },
    readers: { type: Number },
    compact: { type: Boolean, reflect: true },
  };

  static styles = css`
    :host {
      display: block;
    }

    .result {
      display: flex;
      align-items: flex-start;
      gap: var(--spacing-3);
      padding: var(--spacing-3) var(--spacing-4);
      border-bottom: 1px solid var(--color-border-subtle);
      cursor: pointer;
    }

    .result:hover {
      background: var(--color-bg-hovered);
    }

    .cover {
      width: 40px;
      height: 60px;
      object-fit: cover;
      border-radius: var(--radius-sm);
      flex-shrink: 0;
      background: var(--color-bg-recessed);
    }

    .details {
      flex: 1;
      min-width: 0;
    }

    .title {
      font-weight: var(--font-weight-semibold);
      color: var(--color-text-strong);
      line-height: var(--line-height-tight);
      margin-bottom: 2px;
    }

    .author {
      font-size: var(--body-font-size-sm);
      color: var(--color-text-secondary);
      margin-bottom: 4px;
    }

    .meta {
      display: flex;
      align-items: center;
      gap: var(--spacing-2);
      font-size: var(--body-font-size-sm);
      color: var(--color-highlight);
    }

    .meta span {
      white-space: nowrap;
    }

    .star {
      color: var(--color-highlight);
    }

    mark {
      background-color: var(--color-highlight);
      color: inherit;
      border-radius: 2px;
      padding: 0 1px;
    }

    .bookmark-btn {
      display: flex;
      align-items: center;
      gap: var(--spacing-1);
      flex-shrink: 0;
      background: var(--color-bg-elevated);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-button);
      color: var(--color-text);
      font-size: var(--body-font-size-sm);
      font-family: inherit;
      padding: var(--spacing-2) var(--spacing-3);
      cursor: pointer;
      align-self: center;
    }

    .bookmark-btn:hover {
      background: var(--color-bg-hovered);
    }

    .bookmark-btn:focus-visible {
      outline: var(--focus-ring-width) solid var(--focus-ring-color);
      outline-offset: 2px;
    }

    .bookmark-btn svg {
      width: 16px;
      height: 16px;
    }

    .bookmark-btn .chevron {
      width: 12px;
      height: 12px;
      margin-left: 2px;
    }

    .bookmark-label {
      display: none;
    }

    :host(:not([compact])) .bookmark-label {
      display: inline;
    }

    @media (max-width: 767px) {
      :host(:not([compact])) .bookmark-label {
        display: none;
      }
    }
  `;

  constructor() {
    super();
    this.title = '';
    this.author = '';
    this.year = null;
    this.coverUrl = '';
    this.query = '';
    this.rating = null;
    this.readers = null;
    this.compact = false;
  }

  _handleClick() {
    this.dispatchEvent(
      new CustomEvent('ol-result-select', {
        detail: { title: this.title, author: this.author, year: this.year },
        bubbles: true,
        composed: true,
      })
    );
  }

  _handleKeydown(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      this._handleClick();
    }
  }

  _handleBookmark(e) {
    e.stopPropagation();
    this.dispatchEvent(
      new CustomEvent('ol-result-bookmark', {
        detail: { title: this.title, author: this.author },
        bubbles: true,
        composed: true,
      })
    );
  }

  _renderHighlighted(text) {
    const segments = searchDataService.highlightMatch(text, this.query);
    return segments.map((seg) =>
      seg.highlight ? html`<mark>${seg.text}</mark>` : seg.text
    );
  }

  render() {
    return html`
      <div class="result" @click=${this._handleClick} @keydown=${this._handleKeydown} role="option" tabindex="0">
        ${this.coverUrl
          ? html`<img class="cover" src="${this.coverUrl}" alt="${this.title} cover" loading="lazy" />`
          : html`<div class="cover"></div>`}
        <div class="details">
          <div class="title">${this._renderHighlighted(this.title)}</div>
          <div class="author">By ${this._renderHighlighted(this.author)}</div>
          <div class="meta">
            ${this.year ? html`<span>${this.year}</span>` : nothing}
            ${this.readers ? html`<span>&bull; ${this.readers} Readers</span>` : nothing}
            ${this.rating ? html`<span>&bull; ${this.rating} <span class="star">&#9733;</span></span>` : nothing}
          </div>
        </div>
        <button class="bookmark-btn" @click=${this._handleBookmark} aria-label="Save ${this.title}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
          </svg>
          <span class="bookmark-label">Want to Read</span>
          <svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>
      </div>
    `;
  }
}

customElements.define('ol-search-result-item', OlSearchResultItem);

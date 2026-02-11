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
      -webkit-tap-highlight-color: transparent;
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
            ${this.readers ? html`<span>${this.readers} Readers</span>` : nothing}
            ${this.rating ? html`<span>&bull; ${this.rating} <span class="star">&#9733;</span></span>` : nothing}
          </div>
        </div>
      </div>
    `;
  }
}

customElements.define('ol-search-result-item', OlSearchResultItem);

import { LitElement, html, css } from 'lit';

export class OlPastSearchItem extends LitElement {
  static properties = {
    query: { type: String },
  };

  static styles = css`
    :host {
      display: block;
    }

    .past-search {
      display: flex;
      align-items: center;
      gap: var(--spacing-3);
      padding: var(--spacing-3) var(--spacing-4);
      border-bottom: 1px solid var(--color-border-subtle);
    }

    .search-btn {
      display: flex;
      align-items: center;
      gap: var(--spacing-3);
      flex: 1;
      min-width: 0;
      background: none;
      border: none;
      color: var(--color-text);
      font-size: var(--body-font-size);
      font-family: inherit;
      padding: 0;
      cursor: pointer;
      text-align: left;
    }

    .search-btn:hover {
      color: var(--color-text-strong);
    }

    .search-btn:focus-visible {
      outline: var(--focus-ring-width) solid var(--focus-ring-color);
      outline-offset: 2px;
      border-radius: var(--radius-sm);
    }

    .icon {
      flex-shrink: 0;
      width: 16px;
      height: 16px;
      color: var(--color-text-secondary);
    }

    .query-text {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .remove-btn {
      display: flex;
      align-items: center;
      gap: var(--spacing-1);
      flex-shrink: 0;
      background: none;
      border: none;
      color: var(--color-text-secondary);
      font-size: var(--body-font-size-sm);
      font-family: inherit;
      cursor: pointer;
      padding: var(--spacing-1) var(--spacing-2);
      border-radius: var(--radius-sm);
    }

    .remove-btn:hover {
      color: var(--color-text);
      background: var(--color-bg-hovered);
    }

    .remove-btn:focus-visible {
      outline: var(--focus-ring-width) solid var(--focus-ring-color);
      outline-offset: 2px;
    }

    .remove-btn svg {
      width: 14px;
      height: 14px;
    }
  `;

  constructor() {
    super();
    this.query = '';
  }

  _handleSelect() {
    this.dispatchEvent(
      new CustomEvent('ol-past-search-select', {
        detail: { query: this.query },
        bubbles: true,
        composed: true,
      })
    );
  }

  _handleRemove(e) {
    e.stopPropagation();
    this.dispatchEvent(
      new CustomEvent('ol-past-search-remove', {
        detail: { query: this.query },
        bubbles: true,
        composed: true,
      })
    );
  }

  render() {
    return html`
      <div class="past-search">
        <button class="search-btn" @click=${this._handleSelect} aria-label="Search for ${this.query}">
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <span class="query-text">${this.query}</span>
        </button>
        <button class="remove-btn" @click=${this._handleRemove} aria-label="Remove ${this.query} from past searches">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
          clear
        </button>
      </div>
    `;
  }
}

customElements.define('ol-past-search-item', OlPastSearchItem);

import { LitElement, html, css } from 'lit';

export class OlExpandableText extends LitElement {
  static properties = {
    maxLines: { type: Number, attribute: 'max-lines' },
    expanded: { type: Boolean, reflect: true },
    _needsToggle: { type: Boolean, state: true }
  };

  static styles = css`
    :host {
      display: block;
    }

    .content {
      overflow: hidden;
    }

    .content.clamped {
      display: -webkit-box;
      -webkit-box-orient: vertical;
    }

    .toggle {
      background: none;
      border: none;
      padding: 0;
      margin-top: var(--spacing-2);
      color: var(--color-link);
      font-size: var(--body-font-size);
      font-family: var(--body-font-family);
      cursor: pointer;
      text-decoration: underline;
    }

    .toggle:hover {
      color: var(--color-link-hovered);
    }

    .toggle:focus-visible {
      outline: var(--focus-ring-width) solid var(--color-border-focused);
      outline-offset: 2px;
      border-radius: var(--radius-sm);
    }
  `;

  constructor() {
    super();
    this.maxLines = 5;
    this.expanded = false;
    this._needsToggle = false;
  }

  firstUpdated() {
    this._checkOverflow();
  }

  _checkOverflow() {
    const content = this.shadowRoot.querySelector('.content');
    if (content) {
      // Temporarily apply clamp to measure
      content.style.webkitLineClamp = this.maxLines;
      content.classList.add('clamped');
      const isOverflowing = content.scrollHeight > content.clientHeight;
      this._needsToggle = isOverflowing;
      // Restore state
      if (this.expanded) {
        content.classList.remove('clamped');
        content.style.webkitLineClamp = '';
      }
    }
  }

  _handleToggle() {
    this.expanded = !this.expanded;
  }

  render() {
    const clamped = !this.expanded && this._needsToggle;

    return html`
      <div
        class="content ${clamped ? 'clamped' : ''}"
        style=${clamped ? `-webkit-line-clamp: ${this.maxLines}` : ''}
      >
        <slot></slot>
      </div>
      ${this._needsToggle ? html`
        <button
          class="toggle"
          @click=${this._handleToggle}
          aria-expanded=${this.expanded}
        >
          ${this.expanded ? 'Read less' : 'Read more'}
        </button>
      ` : ''}
    `;
  }
}

customElements.define('ol-expandable-text', OlExpandableText);

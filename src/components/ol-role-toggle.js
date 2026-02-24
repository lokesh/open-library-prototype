import { LitElement, html, svg, css } from 'lit';
import userRoleService from '../user-role-service.js';

export class OlRoleToggle extends LitElement {
  static properties = {
    _role: { type: String, state: true },
  };

  static styles = css`
    .toggle-wrapper {
      position: relative;
      display: flex;
      align-items: center;
      height: 100%;
    }

    button {
      padding: var(--spacing-inline);
      cursor: pointer;
      color: var(--color-text);
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: transparent;
      border: none;
      border-bottom: var(--border-width-2) solid transparent;
    }

    button:hover {
      border-bottom: var(--border-width-2) solid var(--color-text);
    }

    button:active {
      transform: scale(0.98);
    }

    button svg {
      width: 20px;
      height: 20px;
    }

    :host([active]) button {
      color: var(--color-bg-primary);
    }

    .toggle-wrapper:hover .tooltip {
      opacity: 1;
      visibility: visible;
    }

    .tooltip {
      position: absolute;
      bottom: -32px;
      left: 50%;
      transform: translateX(-50%);
      background: var(--color-bg-elevated);
      color: var(--color-text);
      font-size: 12px;
      font-family: var(--body-font-family);
      padding: 4px 8px;
      border-radius: var(--radius-md);
      white-space: nowrap;
      pointer-events: none;
      opacity: 0;
      visibility: hidden;
      transition: opacity 150ms ease;
      border: 1px solid var(--color-border);
      z-index: 10;
    }
  `;

  constructor() {
    super();
    this._role = userRoleService.role;
    this._handleRoleChange = this._handleRoleChange.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    document.addEventListener('ol-role-change', this._handleRoleChange);
    this._syncActive();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('ol-role-change', this._handleRoleChange);
  }

  _handleRoleChange(e) {
    this._role = e.detail.role;
    this._syncActive();
  }

  _syncActive() {
    if (this._role === 'librarian') {
      this.setAttribute('active', '');
    } else {
      this.removeAttribute('active');
    }
  }

  _toggle() {
    userRoleService.toggle();
  }

  _renderBookIcon() {
    return html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      ${svg`<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>`}
    </svg>`;
  }

  _renderShieldIcon() {
    return html`<svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      ${svg`<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>`}
    </svg>`;
  }

  render() {
    const isLibrarian = this._role === 'librarian';
    const tooltipText = isLibrarian ? 'Switch to reader mode' : 'Switch to librarian mode';
    return html`
      <div class="toggle-wrapper">
        <button @click="${this._toggle}" aria-label="${tooltipText}">
          ${isLibrarian ? this._renderShieldIcon() : this._renderBookIcon()}
        </button>
        <span class="tooltip">${tooltipText}</span>
      </div>
    `;
  }
}

customElements.define('ol-role-toggle', OlRoleToggle);

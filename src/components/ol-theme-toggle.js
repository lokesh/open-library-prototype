import { LitElement, html, svg, css } from 'lit';

export class OlThemeToggle extends LitElement {
  static properties = {
    theme: { type: String, state: true },
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
    this.theme = localStorage.getItem('theme') || 'light';
    this.applyTheme();
  }

  applyTheme() {
    document.body.setAttribute('data-theme', this.theme);
  }

  toggleTheme() {
    this.theme = this.theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', this.theme);
    this.applyTheme();
  }

  _renderSunIcon() {
    return html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      ${svg`<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>`}
    </svg>`;
  }

  _renderMoonIcon() {
    return html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      ${svg`<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>`}
    </svg>`;
  }

  render() {
    const isDark = this.theme === 'dark';
    const tooltipText = isDark ? 'Toggle light mode' : 'Toggle dark mode';
    return html`
      <div class="toggle-wrapper">
        <button @click="${this.toggleTheme}" aria-label="${tooltipText}">
          ${isDark ? this._renderSunIcon() : this._renderMoonIcon()}
        </button>
        <span class="tooltip">${tooltipText}</span>
      </div>
    `;
  }
}

customElements.define('ol-theme-toggle', OlThemeToggle);

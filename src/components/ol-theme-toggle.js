import { LitElement, html, css } from 'lit';

export class OlThemeToggle extends LitElement {
  static properties = {
    theme: { type: String, state: true },
  };

  static styles = css`
    button {
      padding: var(--spacing-inline) var(--spacing-element);
      cursor: pointer;
      background-color: var(--color-bg-elevated);
      color: var(--color-text);
      border: none;
      border-radius: var(--radius-button);
      font-size: var(--font-body-sm-size);
      font-family: var(--font-body-family);
      height: 100%;
      font-weight: var(--font-weight-semibold);
      display: flex;
      align-items: center;
      gap: 6px;
    }

    button:hover {
      background-color: var(--color-bg-elevated-hovered);
    }

    button:active {
      transform: scale(0.98);
    }

    .icon {
      width: 16px;
      height: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  `;

  constructor() {
    super();
    // Check localStorage for saved theme preference, default to light
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

  render() {
    const isDark = this.theme === 'dark';
    return html`
      <button @click="${this.toggleTheme}" aria-label="Toggle theme">
        <span class="icon">${isDark ? '☀️' : '🌙'}</span>
        <span>${isDark ? 'Light' : 'Dark'} Mode</span>
      </button>
    `;
  }
}

customElements.define('ol-theme-toggle', OlThemeToggle);


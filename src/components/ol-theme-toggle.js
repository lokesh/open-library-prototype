import { LitElement, html, css } from 'lit';

export class OlThemeToggle extends LitElement {
  static properties = {
    theme: { type: String, state: true },
  };

  static styles = css`
    button {
      padding: var(--spacing-inline) var(--spacing-inline);
      cursor: pointer;
      color: var(--color-text);
      font-size: var(--body-font-size-sm);
      font-family: var(--body-font-family);
      height: 100%;
      font-weight: var(--font-weight-semibold);
      display: flex;
      align-items: center;
      gap: 6px;
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
        <span>${isDark ? 'Light' : 'Dark'} Mode</span>
      </button>
    `;
  }
}

customElements.define('ol-theme-toggle', OlThemeToggle);


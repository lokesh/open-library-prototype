import { LitElement, html, css } from 'lit';

export class OlThemeToggle extends LitElement {
  static properties = {
    theme: { type: String, state: true },
  };

  static styles = css`
    button {
      padding: 8px 12px;
      cursor: pointer;
      background: var(--color-bg-secondary);
      color: var(--color-text-primary);
      border: 1px solid var(--color-border-primary);
      border-radius: var(--radius-button);
      font-family: var(--font-body-family);
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
      transition: all var(--transition-button);
      display: flex;
      align-items: center;
      gap: 6px;
    }

    button:hover {
      background: var(--color-bg-tertiary);
      border-color: var(--color-border-focus);
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


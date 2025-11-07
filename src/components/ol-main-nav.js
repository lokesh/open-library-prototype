import { LitElement, html, css } from 'lit';
import './ol-theme-toggle.js';

export class OlMainNav extends LitElement {
  static styles = css`
    :host {
      display: block;
      margin-bottom: var(--spacing-section);
    }

    nav {
      display: flex;
      align-items: center;
      margin-bottom: var(--spacing-section);
      margin-left: -20px;
      margin-right: -20px;
      font-size: var(--font-body-sm-size);
    }

    ul {
      list-style: none;
      display: flex;
      gap: 8px;
      flex-wrap: nowrap;
      flex: 1;
      margin: 0;
      padding: 0 20px;
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: thin;
    }

    /* Hide scrollbar on webkit browsers for cleaner look */
    ul::-webkit-scrollbar {
      height: 4px;
    }

    ul::-webkit-scrollbar-track {
      background: transparent;
    }

    ul::-webkit-scrollbar-thumb {
      background: var(--color-surface-tertiary);
      border-radius: 2px;
    }

    ul::-webkit-scrollbar-thumb:hover {
      background: var(--color-surface-tertiary-hovered);
    }

    li {
      margin: 0;
      flex-shrink: 0;
    }

    a {
      display: block;
      color: var(--color-on-surface);
      text-decoration: none;
      font-weight: var(--font-weight-semibold);
      background-color: var(--color-surface-tertiary);
      padding: var(--spacing-inline) var(--spacing-element);
      border-radius: var(--radius-button);
    }

    a:hover {
      text-decoration: none;
      background-color: var(--color-surface-tertiary-hovered);
    }
  `;

  render() {
    return html`
      <nav>
        <ul>
          <li><a href="index.html">Home</a></li>
          <li><a href="signup.html">Sign Up</a></li>
          <li><a href="trending.html">Trending Books</a></li>
          <li><a href="components.html">Components</a></li>
          <li><a href="forms.html">Forms</a></li>
          <li><ol-theme-toggle></ol-theme-toggle></li>
        </ul>
      </nav>
    `;
  }
}

customElements.define('ol-main-nav', OlMainNav);


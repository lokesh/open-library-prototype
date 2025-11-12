import { LitElement, css, html } from 'lit';

export class OlCard extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    .ol-card {
      background-color: var(--color-bg-elevated);
      color: var(--color-text-on-elevated);
      border: var(--border-card);
      border-radius: var(--radius-card);
      padding: var(--spacing-element);
      transition: box-shadow 0.2s ease;
    }
    ::slotted(p) {
      margin: 0;
    }
  `;

  render() {
    return html`
      <div class="ol-card">
        <slot></slot>
      </div>
    `;
  }
}

customElements.define('ol-card', OlCard);


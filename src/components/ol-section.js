import { LitElement, html, css } from 'lit';

export class OlSection extends LitElement {
  static styles = css`
    section {
      margin-bottom: var(--spaceng-section);
    }
  `;

  render() {
    return html`
      <section>
        <slot></slot>
      </section>
    `;
  }
}

customElements.define('ol-section', OlSection);


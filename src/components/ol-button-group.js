import { LitElement, html, css } from 'lit';

export class OlButtonGroup extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    .button-group {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-inline);
    }

    .button-group ::slotted(*) {
      flex: 1;
      width: 100%;
    }

    .secondary-actions {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-inline);
      }


    /* Desktop layout: horizontal with primary on left, secondary on right */
    @media (min-width: 640px) {
      .button-group {
        flex-direction: row;
        /* justify-content: space-between; */
        align-items: center;
        margin-bottom: var(--spacing-3);
      }

      .button-group ::slotted(*) {
        flex: initial;
        width: auto;
      }

      .secondary-actions {
        flex-direction: row;
      }

      .secondary-actions ::slotted(*) {
        width: auto;
      }
    }
  `;

  render() {
    return html`
      <div class="button-group">
        <div class="primary-action">
          <slot name="primary-action"></slot>
        </div>
        <div class="secondary-actions">
          <slot name="secondary-actions"></slot>
        </div>
      </div>
    `;
  }
}

customElements.define('ol-button-group', OlButtonGroup);


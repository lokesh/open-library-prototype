import { LitElement, html, css } from 'lit';

export class OlButton extends LitElement {
  static properties = {
    type: { type: String },
  };

  static styles = css`
    button {
      padding: var(--button-padding-y) var(--button-padding-x);
      font-size: var(--button-font-size);
      font-weight: var(--button-font-weight);
      cursor: pointer;
      background-color: var(--button-container);
      color: var(--button-on-container);
      border: none;
      border-radius: var(--radius-button);
    }

    button:hover {
      background-color: var(--button-container-hovered);
    }

    button:active {
      background-color: var(--button-container-pressed);
      transform: scale(0.98);
    }

    button:focus {
      outline: none;
      box-shadow: var(--button-focus-ring);
    }
  `;

  constructor() {
    super();
    this.type = 'button';
  }

  handleClick(e) {
    if (this.type === 'submit') {
      // Find the parent form and submit it
      const form = this.closest('form');
      if (form) {
        // Prevent default on the button click
        e.preventDefault();
        // Trigger form submission
        form.requestSubmit();
      }
    }
  }

  render() {
    return html`
      <button type="${this.type}" @click="${this.handleClick}">
        <slot></slot>
      </button>
    `;
  }
}

customElements.define('ol-button', OlButton);


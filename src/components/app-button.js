import { LitElement, html, css } from 'lit';

export class AppButton extends LitElement {
  static properties = {
    type: { type: String },
  };

  static styles = css`
    button {
      padding: 10px 20px;
      font-size: 16px;
      cursor: pointer;
      background-color: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      transition: background-color 0.2s;
    }

    button:hover {
      background-color: #0056b3;
    }

    button:active {
      background-color: #004085;
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

customElements.define('app-button', AppButton);


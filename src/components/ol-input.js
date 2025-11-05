import { LitElement, html, css } from 'lit';

/**
 * ol-input: A low-level, form-associated input component
 * Uses shadow DOM and implements ElementInternals for native form integration (FACE)
 * Handles form semantics, focus delegation, and value management
 */
export class OlInput extends LitElement {
  static formAssociated = true;

  static properties = {
    type: { type: String },
    name: { type: String },
    value: { type: String },
    placeholder: { type: String },
    disabled: { type: Boolean, reflect: true },
    required: { type: Boolean, reflect: true },
    readonly: { type: Boolean, reflect: true },
    autocomplete: { type: String },
  };

  static styles = css`
    :host {
      display: block;
    }

    :host([disabled]) {
      opacity: 0.6;
      cursor: not-allowed;
    }

    input {
      width: 100%;
      min-height: var(--input-min-height);
      padding: var(--input-padding-y) var(--input-padding-x);
      font-size: var(--input-font-size);
      font-family: inherit;
      color: var(--color-text-primary);
      background-color: var(--color-bg-primary);
      border: var(--input-border-width) solid var(--color-border-primary);
      border-radius: var(--radius-input);
      transition: border-color var(--transition-input), box-shadow var(--transition-input);
      box-sizing: border-box;
    }

    input::placeholder {
      color: var(--color-text-tertiary);
    }

    input:hover:not(:disabled) {
      border-color: var(--color-border-focus);
    }

    input:focus {
      outline: none;
      border-color: var(--color-primary);
      box-shadow: var(--input-focus-ring);
    }

    input:disabled {
      cursor: not-allowed;
      background-color: var(--color-bg-secondary);
    }

    /* Only show error state when explicitly marked invalid via aria-invalid */
    input[aria-invalid="true"] {
      border-color: var(--color-error);
    }
  `;

  constructor() {
    super();
    // Initialize ElementInternals for form participation
    this._internals = this.attachInternals();

    this.type = 'text';
    this.name = '';
    this.value = '';
    this.placeholder = '';
    this.disabled = false;
    this.required = false;
    this.readonly = false;
    this.autocomplete = '';
  }

  // Form-associated callbacks
  formResetCallback() {
    this.value = '';
    this._updateFormValue();
  }

  formDisabledCallback(disabled) {
    this.disabled = disabled;
  }

  formStateRestoreCallback(state) {
    this.value = state;
    this._updateFormValue();
  }

  // Delegate focus to the internal input
  focus() {
    const input = this.shadowRoot?.querySelector('input');
    if (input) {
      input.focus();
    }
  }

  // Update the form value and validity
  _updateFormValue() {
    const input = this.shadowRoot?.querySelector('input');
    if (input) {
      this._internals.setFormValue(this.value);

      // Update validity state
      if (input.validity.valid) {
        this._internals.setValidity({});
      } else {
        this._internals.setValidity(
          input.validity,
          input.validationMessage,
          input
        );
      }
    }
  }

  _handleInput(e) {
    this.value = e.target.value;
    this._updateFormValue();

    // Dispatch a custom input event that bubbles out of shadow DOM
    this.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
  }

  _handleChange(e) {
    this.value = e.target.value;
    this._updateFormValue();

    // Dispatch a custom change event
    this.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
  }

  firstUpdated() {
    // Set initial validity state
    this._updateFormValue();
  }

  updated(changedProperties) {
    if (changedProperties.has('value') || changedProperties.has('required')) {
      this._updateFormValue();
    }
  }

  render() {
    return html`
      <input
        type="${this.type}"
        .value="${this.value}"
        placeholder="${this.placeholder}"
        ?disabled="${this.disabled}"
        ?required="${this.required}"
        ?readonly="${this.readonly}"
        autocomplete="${this.autocomplete}"
        @input="${this._handleInput}"
        @change="${this._handleChange}"
        aria-invalid="${this._internals.validity?.valid === false ? 'true' : 'false'}"
      />
    `;
  }
}

customElements.define('ol-input', OlInput);


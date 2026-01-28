import { LitElement, html, css } from 'lit';

/**
 * ol-input: A low-level, form-associated input component
 * Uses shadow DOM and implements ElementInternals for native form integration (FACE)
 * Handles form semantics, focus delegation, and value management
 * 
 * @element ol-input
 * @prop {string} size - Input size: "default", "large", or "xlarge"
 * 
 * @example
 * <ol-input size="large" placeholder="Enter title"></ol-input>
 * <ol-input size="xlarge" value="The Hunger Games"></ol-input>
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
    size: { type: String, reflect: true },
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
      color: var(--input-color-text);
      background-color: var(--input-color-bg);
      border: var(--input-border-width) solid var(--input-border);
      border-radius: var(--radius-input);
      box-sizing: border-box;
    }

    /* Large size */
    :host([size="large"]) input {
      font-size: var(--font-size-xl);
      padding: var(--spacing-3) var(--spacing-4);
      min-height: 52px;
    }

    /* Extra large size */
    :host([size="xlarge"]) input {
      font-size: var(--font-size-2xl);
      font-weight: var(--font-weight-bold);
      padding: var(--spacing-4) var(--spacing-5);
      min-height: 64px;
    }

    input::placeholder {
      color: var(--input-color-placeholder);
    }

    :host([size="xlarge"]) input::placeholder {
      font-weight: var(--font-weight-normal);
    }

    input:hover:not(:disabled) {
      border-color: var(--input-border-hovered);
    }

    input:focus {
      outline: none;
      border-color: var(--input-border-focused);
      box-shadow: var(--input-focus-ring);
    }

    input:disabled {
      cursor: not-allowed;
      background-color: var(--input-disabled-surface);
      opacity: var(--input-disabled-opacity);
    }

    /* Only show error state when explicitly marked invalid via aria-invalid */
    input[aria-invalid="true"] {
      border-color: var(--input-border-error);
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
    this.size = 'default';
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

  _handleKeyDown(e) {
    // Handle Enter key to submit parent form (mimics native input behavior)
    if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
      const form = this.closest('form');
      if (form) {
        // Prevent default to avoid any duplicate submissions
        e.preventDefault();

        // Use requestSubmit() to trigger validation and submit event
        if (form.requestSubmit) {
          form.requestSubmit();
        } else {
          // Fallback for older browsers
          form.submit();
        }
      }
    }
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
        @keydown="${this._handleKeyDown}"
        aria-invalid="${this._internals.validity?.valid === false ? 'true' : 'false'}"
      />
    `;
  }
}

customElements.define('ol-input', OlInput);


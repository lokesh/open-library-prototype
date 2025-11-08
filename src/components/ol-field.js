import { LitElement, html, css } from 'lit';

/**
 * ol-field: A higher-level field component that composes label, hint, error, and an input
 * Handles layout, spacing, and accessibility linking (aria-labelledby/describedby)
 * Uses shadow DOM for encapsulation but allows slotted content
 */
export class OlField extends LitElement {
  static properties = {
    label: { type: String },
    hint: { type: String },
    error: { type: String },
    required: { type: Boolean },
  };

  static styles = css`
    :host {
      display: block;
      margin-bottom: var(--spacing-component);
    }

    .field-wrapper {
      display: flex;
      flex-direction: column;
      /* gap: var(--spacing-1); */
      margin-bottom: var(--spacing-field);
    }

    .label {
      display: flex;
      align-items: center;
      gap: var(--spacing-1);
      font-size: var(--font-body-size);
      font-weight: var(--font-weight-semibold);
      color: var(--color-text);
      margin-bottom: var(--spacing-1);
    }

    .required-indicator {
      color: var(--color-error);
      font-weight: bold;
    }

    .hint {
      font-size: var(--font-body-sm-size);
      color: var(--color-text-secondary);
      margin-bottom: var(--spacing-1);
    }

    .error {
      font-size: var(--font-body-sm-size);
      color: var(--color-error);
      margin-top: var(--spacing-1);
      display: flex;
      align-items: center;
      gap: var(--spacing-1);
    }

    .error-icon {
      flex-shrink: 0;
    }

    ::slotted(ol-input) {
      width: 100%;
    }
  `;

  constructor() {
    super();
    this.label = '';
    this.hint = '';
    this.error = '';
    this.required = false;
    this._labelId = `field-label-${Math.random().toString(36).substr(2, 9)}`;
    this._hintId = `field-hint-${Math.random().toString(36).substr(2, 9)}`;
    this._errorId = `field-error-${Math.random().toString(36).substr(2, 9)}`;
  }

  firstUpdated() {
    this._setupAccessibility();
  }

  updated(changedProperties) {
    if (changedProperties.has('error') || changedProperties.has('hint')) {
      this._setupAccessibility();
    }
  }

  _setupAccessibility() {
    // Find the slotted input element
    const slot = this.shadowRoot.querySelector('slot');
    const assignedElements = slot?.assignedElements();
    const input = assignedElements?.find(el => el.tagName.toLowerCase() === 'ol-input');

    if (input) {
      // Set aria-labelledby to reference the label
      if (this.label) {
        input.setAttribute('aria-labelledby', this._labelId);
      }

      // Build aria-describedby from hint and error
      const describedBy = [];
      if (this.hint) {
        describedBy.push(this._hintId);
      }
      if (this.error) {
        describedBy.push(this._errorId);
      }

      if (describedBy.length > 0) {
        input.setAttribute('aria-describedby', describedBy.join(' '));
      } else {
        input.removeAttribute('aria-describedby');
      }

      // Set aria-invalid if there's an error
      if (this.error) {
        input.setAttribute('aria-invalid', 'true');
      } else {
        input.removeAttribute('aria-invalid');
      }

      // Sync required state
      if (this.required) {
        input.setAttribute('required', '');
      }
    }
  }

  render() {
    return html`
      <div class="field-wrapper">
        ${this.label ? html`
          <label class="label" id="${this._labelId}">
            ${this.label}
            ${this.required ? html`<span class="required-indicator" aria-label="required">*</span>` : ''}
          </label>
        ` : ''}

        ${this.hint ? html`
          <div class="hint" id="${this._hintId}">${this.hint}</div>
        ` : ''}

        <slot @slotchange="${this._setupAccessibility}"></slot>

        ${this.error ? html`
          <div class="error" id="${this._errorId}" role="alert">
            <span class="error-icon" aria-hidden="true">⚠️</span>
            <span>${this.error}</span>
          </div>
        ` : ''}
      </div>
    `;
  }
}

customElements.define('ol-field', OlField);


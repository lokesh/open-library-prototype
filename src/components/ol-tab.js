import { LitElement, html, css } from 'lit';

/**
 * A tab element for use within ol-tab-group
 *
 * @element ol-tab
 *
 * @prop {string} panel - The name of the panel this tab controls
 * @prop {boolean} active - Whether the tab is currently active
 * @prop {boolean} disabled - Whether the tab is disabled
 * @prop {string} placement - Tab position inherited from parent: 'top', 'bottom', 'start', 'end'
 *
 * @slot - Tab label content
 *
 * @example
 * <ol-tab panel="general">General</ol-tab>
 */
export class OlTab extends LitElement {
  static properties = {
    panel: { type: String, reflect: true },
    active: { type: Boolean, reflect: true },
    disabled: { type: Boolean, reflect: true },
    placement: { type: String, reflect: true }
  };

  static styles = css`
    :host {
      display: inline-block;
      flex-shrink: 0;
    }

    .tab {
      display: inline-flex;
      align-items: center;
      padding: var(--spacing-2) var(--spacing-4);
      font-family: var(--body-font-family);
      font-size: var(--body-font-size);
      font-weight: var(--font-weight-medium);
      color: var(--color-text-secondary);
      background: transparent;
      border: none;
      border-bottom: 2px solid transparent;
      cursor: pointer;
      white-space: nowrap;
      transition: color 150ms ease, border-color 150ms ease;
    }

    /* Vertical placement: indicator on the left side instead of bottom */
    :host([placement="start"]) .tab,
    :host([placement="end"]) .tab {
      border-bottom: none;
      border-left: 2px solid transparent;
      width: 100%;
      justify-content: flex-start;
    }

    .tab:hover:not(:disabled) {
      color: var(--color-text);
    }

    :host([active]) .tab {
      color: var(--color-brand-primary);
      border-bottom-color: var(--color-brand-primary);
    }

    :host([active][placement="start"]) .tab,
    :host([active][placement="end"]) .tab {
      border-bottom-color: transparent;
      border-left-color: var(--color-brand-primary);
    }

    .tab:focus-visible {
      outline: var(--focus-ring-width) solid var(--color-border-focused);
      outline-offset: -2px;
      border-radius: var(--radius-button);
    }

    .tab:disabled {
      opacity: var(--opacity-disabled, 0.5);
      cursor: not-allowed;
      color: var(--color-text-secondary);
    }
  `;

  constructor() {
    super();
    this.panel = '';
    this.active = false;
    this.disabled = false;
    this.placement = 'top';
  }

  connectedCallback() {
    super.connectedCallback();
    this.setAttribute('role', 'tab');
    this.setAttribute('slot', 'nav');
  }

  updated(changedProperties) {
    super.updated(changedProperties);
    
    // Update ARIA attributes when active state changes
    if (changedProperties.has('active')) {
      this.setAttribute('aria-selected', this.active ? 'true' : 'false');
      this.setAttribute('tabindex', this.active ? '0' : '-1');
    }

    if (changedProperties.has('disabled')) {
      this.setAttribute('aria-disabled', this.disabled ? 'true' : 'false');
    }

    if (changedProperties.has('panel')) {
      this.setAttribute('aria-controls', this.panel);
    }
  }

  /**
   * Handle tab click
   * @fires ol-tab-select - Emitted when tab is clicked
   */
  _handleClick() {
    if (this.disabled) return;

    this.dispatchEvent(new CustomEvent('ol-tab-select', {
      detail: { panel: this.panel },
      bubbles: true,
      composed: true
    }));
  }

  /**
   * Focus the tab button
   */
  focus() {
    const button = this.shadowRoot?.querySelector('.tab');
    button?.focus();
  }

  render() {
    return html`
      <button
        class="tab"
        type="button"
        ?disabled=${this.disabled}
        @click=${this._handleClick}
      >
        <slot></slot>
      </button>
    `;
  }
}

customElements.define('ol-tab', OlTab);

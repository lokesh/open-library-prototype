import { LitElement, html, css } from 'lit';

/**
 * A dropdown button web component with split button functionality
 *
 * @element ol-dropdown-button
 *
 * @prop {string} variant - Button style variant: 'primary', 'secondary' (default: 'primary')
 * @prop {string} size - Button size: 'small', 'medium', 'large' (default: 'medium')
 * @prop {boolean} fullWidth - Makes button take full width of container (default: false)
 * @prop {boolean} open - Controls dropdown visibility (default: false)
 *
 * @slot - Button text content
 * @slot dropdown - Dropdown content
 *
 * @fires click - Emitted when the main button area is clicked
 *
 * @example
 * <ol-dropdown-button variant="primary" size="medium">
 *   Actions
 *   <div slot="dropdown">
 *     <button>Option 1</button>
 *     <button>Option 2</button>
 *   </div>
 * </ol-dropdown-button>
 */
export class OlDropdownButton extends LitElement {
  static properties = {
    variant: { type: String, reflect: true },
    size: { type: String, reflect: true },
    fullWidth: { type: Boolean, reflect: true, attribute: 'full-width' },
    open: { type: Boolean, reflect: true }
  };

  static styles = css`
    :host {
      display: inline-block;
      position: relative;
    }

    :host([full-width]) {
      display: block;
    }

    .button-container {
      display: flex;
      width: 100%;
      border-radius: var(--radius-button);
      overflow: hidden;
    }

    .main-button,
    .chevron-button {
      border: var(--border-width-control) solid var(--color-brand-primary);
      cursor: pointer;
      font-family: var(--body-font-family);
      text-align: center;
      white-space: nowrap;
      box-sizing: border-box;
      font-weight: var(--font-weight-semibold);
      background: none;
      transition: background-color 150ms ease;
    }

    .main-button {
      flex: 1;
      border-right: none;
      border-top-left-radius: var(--radius-button);
      border-bottom-left-radius: var(--radius-button);
    }

    .chevron-button {
      border-left: none;
      border-top-right-radius: var(--radius-button);
      border-bottom-right-radius: var(--radius-button);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 0.5em;
    }

    .divider {
      width: var(--border-width-control);
      background-color: var(--color-brand-primary);
      align-self: stretch;
    }

    /* Size variants */
    .small .main-button,
    .small .chevron-button {
      font-size: var(--body-font-size-sm);
      padding: var(--button-sm-padding-y) var(--button-sm-padding-x);
    }

    .medium .main-button,
    .medium .chevron-button {
      font-size: var(--body-font-size);
      padding: var(--button-padding-y) var(--button-padding-x);
    }

    .large .main-button,
    .large .chevron-button {
      font-size: 18px;
      padding: 10px 20px;
      line-height: 1.6em;
    }

    .small .chevron-button {
      padding: var(--button-sm-padding-y) 0.5em;
    }

    .medium .chevron-button {
      padding: var(--button-padding-y) 0.75em;
    }

    .large .chevron-button {
      padding: 10px 1em;
    }

    /* Variant styles - Primary */
    .primary .main-button,
    .primary .chevron-button {
      background-color: var(--color-bg-primary);
      color: var(--color-text-on-primary);
      border-color: var(--color-brand-primary);
    }

    .primary .divider {
      background-color: var(--color-brand-primary);
    }

    .primary .main-button:hover,
    .primary .chevron-button:hover {
      background-color: var(--color-bg-primary-hovered);
    }

    /* Variant styles - Secondary */
    .secondary .main-button,
    .secondary .chevron-button {
      background-color: var(--color-bg-elevated);
      color: var(--color-text);
      border-color: var(--color-border);
    }

    .secondary .divider {
      background-color: var(--color-border);
    }

    .secondary .main-button:hover,
    .secondary .chevron-button:hover {
      background-color: var(--color-bg-elevated-hovered);
    }

    /* Focus state */
    .main-button:focus-visible,
    .chevron-button:focus-visible {
      outline: var(--focus-ring-width) solid var(--color-border-focused);
      outline-offset: 2px;
      z-index: 1;
    }

    /* Dropdown */
    .dropdown {
      position: fixed;
      min-width: 120px;
      max-width: 320px;
      width: max-content;
      background-color: var(--color-bg-elevated);
      border: var(--border-width-control) solid var(--color-border);
      border-radius: var(--radius-button);
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      z-index: var(--z-index-dropdown);
      opacity: 0;
      pointer-events: none;
      transition: opacity 200ms ease, transform 200ms ease;
      padding: var(--spacing-inline);
    }

    .dropdown.open {
      opacity: 1;
      pointer-events: auto;
    }

    .chevron {
      user-select: none;
      line-height: 1;
    }

    :host([open]) .chevron {
      transform: rotate(180deg);
    }
  `;

  constructor() {
    super();
    this.variant = 'primary';
    this.size = 'medium';
    this.fullWidth = false;
    this.open = false;
    this._handleOutsideClick = this._handleOutsideClick.bind(this);
    this._handleKeyDown = this._handleKeyDown.bind(this);
    this._handleScroll = this._handleScroll.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    document.addEventListener('click', this._handleOutsideClick);
    document.addEventListener('keydown', this._handleKeyDown);
    window.addEventListener('scroll', this._handleScroll, true);
    window.addEventListener('resize', this._handleScroll);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('click', this._handleOutsideClick);
    document.removeEventListener('keydown', this._handleKeyDown);
    window.removeEventListener('scroll', this._handleScroll, true);
    window.removeEventListener('resize', this._handleScroll);
  }

  /**
   * Handle clicks outside the component to close dropdown
   */
  _handleOutsideClick(event) {
    if (!this.open) return;

    // Check if click is outside this component
    const path = event.composedPath();
    if (!path.includes(this)) {
      this.open = false;
    }
  }

  /**
   * Handle keyboard events (Escape to close)
   */
  _handleKeyDown(event) {
    if (event.key === 'Escape' && this.open) {
      this.open = false;
      // Return focus to the chevron button
      const chevronButton = this.shadowRoot.querySelector('.chevron-button');
      if (chevronButton) {
        chevronButton.focus();
      }
    }
  }

  /**
   * Handle scroll and resize events to reposition dropdown
   */
  _handleScroll() {
    if (this.open) {
      this._positionDropdown();
    }
  }

  /**
   * Handle main button click
   */
  _handleMainButtonClick() {
    // Close dropdown if open
    if (this.open) {
      this.open = false;
    }

    // Dispatch a standard click event
    this.dispatchEvent(new Event('click', { bubbles: true, composed: true }));
  }

  /**
   * Handle chevron button click to toggle dropdown
   */
  _handleChevronClick(event) {
    event.stopPropagation();
    this.open = !this.open;

    if (this.open) {
      // Position dropdown and manage focus
      this.updateComplete.then(() => {
        // Position the dropdown within the viewport
        this._positionDropdown();

        // Focus management: find first tabbable element in dropdown
        const dropdown = this.shadowRoot.querySelector('.dropdown');
        if (dropdown) {
          const slot = dropdown.querySelector('slot[name="dropdown"]');
          if (slot) {
            const assignedElements = slot.assignedElements({ flatten: true });
            const firstTabbable = this._findFirstTabbable(assignedElements);
            if (firstTabbable) {
              firstTabbable.focus();
            }
          }
        }
      });
    }
  }

  /**
   * Find the first tabbable element in the dropdown content
   */
  _findFirstTabbable(elements) {
    const tabbableSelectors = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

    for (const element of elements) {
      // Check the element itself
      if (element.matches && element.matches(tabbableSelectors)) {
        return element;
      }

      // Check children
      const tabbable = element.querySelector(tabbableSelectors);
      if (tabbable) {
        return tabbable;
      }
    }

    return null;
  }

  /**
   * Position the dropdown within the viewport with 12px padding
   */
  _positionDropdown() {
    const dropdown = this.shadowRoot.querySelector('.dropdown');
    const button = this.shadowRoot.querySelector('.button-container');

    if (!dropdown || !button) return;

    const VIEWPORT_PADDING = 12;

    // Get button and dropdown dimensions
    const buttonRect = button.getBoundingClientRect();
    const dropdownRect = dropdown.getBoundingClientRect();

    // Calculate viewport constraints
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Default position: centered below the button
    let left = buttonRect.left + (buttonRect.width / 2) - (dropdownRect.width / 2);
    let top = buttonRect.bottom + 4; // 4px gap below button

    // Adjust horizontal position to stay within viewport
    if (left < VIEWPORT_PADDING) {
      // Too far left
      left = VIEWPORT_PADDING;
    } else if (left + dropdownRect.width > viewportWidth - VIEWPORT_PADDING) {
      // Too far right
      left = viewportWidth - dropdownRect.width - VIEWPORT_PADDING;
    }

    // Adjust vertical position to stay within viewport
    if (top + dropdownRect.height > viewportHeight - VIEWPORT_PADDING) {
      // Not enough space below, try to position above
      const topPosition = buttonRect.top - dropdownRect.height - 4;
      if (topPosition >= VIEWPORT_PADDING) {
        top = topPosition;
      } else {
        // Not enough space above either, position at bottom with padding
        top = viewportHeight - dropdownRect.height - VIEWPORT_PADDING;
      }
    }

    // Ensure minimum top position
    if (top < VIEWPORT_PADDING) {
      top = VIEWPORT_PADDING;
    }

    // Apply the calculated position
    dropdown.style.left = `${left}px`;
    dropdown.style.top = `${top}px`;
  }

  render() {
    const classes = `${this.variant} ${this.size}`;

    return html`
      <div class="button-container ${classes}">
        <button
          class="main-button"
          type="button"
          @click=${this._handleMainButtonClick}
        >
          <slot></slot>
        </button>
        <div class="divider"></div>
        <button
          class="chevron-button"
          type="button"
          @click=${this._handleChevronClick}
          aria-expanded=${this.open}
          aria-haspopup="true"
        >
          <span class="chevron">▾</span>
        </button>
      </div>
      <div class="dropdown ${this.open ? 'open' : ''}">
        <slot name="dropdown"></slot>
      </div>
    `;
  }
}

// Register the custom element
customElements.define('ol-dropdown-button', OlDropdownButton);


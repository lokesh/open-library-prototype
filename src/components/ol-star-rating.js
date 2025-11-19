import { LitElement, html, css } from 'lit';
import './ol-button.js';

/**
 * A star rating web component built with Lit
 *
 * @element ol-star-rating
 *
 * @prop {number} value - Current rating value (0-5) (default: 0)
 * @prop {string} size - Star size: 'small', 'medium', 'large' (default: 'medium')
 * @prop {string} color - Star color: 'default', 'yellow' (default: 'default')
 * @prop {boolean} readonly - Read-only mode, no interactions (default: false)
 * @prop {boolean} disabled - Disabled state (default: false)
 *
 * @fires change - Emitted when rating value changes with detail: { value }
 *
 * @example
 * <ol-star-rating value="3" size="medium"></ol-star-rating>
 * <ol-star-rating value="4" color="yellow" readonly></ol-star-rating>
 */
export class OlStarRating extends LitElement {
  static properties = {
    value: { type: Number, reflect: true },
    size: { type: String, reflect: true },
    color: { type: String, reflect: true },
    readonly: { type: Boolean, reflect: true },
    disabled: { type: Boolean, reflect: true },
    _hoverValue: { type: Number, state: true },
    _focusedIndex: { type: Number, state: true }
  };

  static styles = css`
    :host {
      display: inline-block;
    }

    .star-rating-container {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: var(--spacing-inline);
    }

    .stars-wrapper {
      display: inline-flex;
      align-items: center;
      position: relative;
    }

    :host([disabled]) .stars-wrapper {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .star-button {
      background: none;
      border: none;
      padding: 0.1rem;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: var(--radius-button);
    }

    .star-button:focus-visible {
      outline: var(--focus-ring-width) solid var(--color-border-focused);
      outline-offset: 2px;
    }

    .star-button:disabled {
      cursor: not-allowed;
    }

    :host([readonly]) .star-button {
      cursor: default;
    }

    :host([readonly]) .star-button:hover {
      transform: none;
    }

    /* Star sizes */
    .star-button.small svg {
      width: 16px;
      height: 16px;
    }

    .star-button.medium svg {
      width: 24px;
      height: 24px;
    }

    .star-button.large svg {
      width: 32px;
      height: 32px;
    }

    /* Star colors - default (theme-based) */
    .star-button.default svg {
      color: var(--color-text);
      fill: transparent;
      stroke: currentColor;
      stroke-width: 2;
    }

    .star-button.default.filled svg {
      fill: var(--color-text);
    }

    /* Star colors - yellow */
    .star-button.yellow svg {
      color: #fbbf24;
      fill: transparent;
      stroke: currentColor;
      stroke-width: 2;
    }

    .star-button.yellow.filled svg {
      fill: #fbbf24;
    }
  `;

  constructor() {
    super();
    this.value = 0;
    this.size = 'medium';
    this.color = 'default';
    this.readonly = false;
    this.disabled = false;
    this._hoverValue = null;
    this._focusedIndex = null;
    this._totalStars = 5;
  }

  /**
   * Handle star click
   */
  _handleStarClick(index) {
    if (this.readonly || this.disabled) return;

    const newValue = index + 1;
    this.value = newValue;

    // Dispatch change event
    this.dispatchEvent(new CustomEvent('change', {
      detail: { value: newValue },
      bubbles: true,
      composed: true
    }));
  }

  /**
   * Handle star hover
   */
  _handleStarHover(index) {
    if (this.readonly || this.disabled) return;
    this._hoverValue = index + 1;
  }

  /**
   * Handle mouse leave from stars wrapper
   */
  _handleMouseLeave() {
    if (this.readonly || this.disabled) return;
    this._hoverValue = null;
  }

  /**
   * Handle keyboard navigation
   */
  _handleKeyDown(event, index) {
    if (this.readonly || this.disabled) return;

    let newIndex = index;

    switch (event.key) {
      case 'ArrowRight':
        event.preventDefault();
        newIndex = Math.min(this._totalStars - 1, index + 1);
        this._focusToStar(newIndex);
        break;
      case 'ArrowLeft':
        event.preventDefault();
        newIndex = Math.max(0, index - 1);
        this._focusToStar(newIndex);
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        this._handleStarClick(index);
        break;
      case 'Home':
        event.preventDefault();
        this._focusToStar(0);
        break;
      case 'End':
        event.preventDefault();
        this._focusToStar(this._totalStars - 1);
        break;
    }
  }

  /**
   * Focus on a specific star by index
   */
  _focusToStar(index) {
    this._focusedIndex = index;
    this.updateComplete.then(() => {
      const stars = this.shadowRoot.querySelectorAll('.star-button');
      if (stars[index]) {
        stars[index].focus();
      }
    });
  }

  /**
   * Handle star focus
   */
  _handleStarFocus(index) {
    this._focusedIndex = index;
  }

  /**
   * Handle star blur
   */
  _handleStarBlur() {
    // Small delay to check if focus moved to another star
    setTimeout(() => {
      const activeElement = this.shadowRoot.activeElement;
      if (!activeElement || !activeElement.classList.contains('star-button')) {
        this._focusedIndex = null;
      }
    }, 0);
  }

  /**
   * Handle clear button click
   */
  _handleClear() {
    if (this.readonly || this.disabled) return;

    this.value = 0;

    // Dispatch change event
    this.dispatchEvent(new CustomEvent('change', {
      detail: { value: 0 },
      bubbles: true,
      composed: true
    }));
  }

  /**
   * Check if a star should be filled
   */
  _isStarFilled(index) {
    const displayValue = this._hoverValue !== null ? this._hoverValue : this.value;
    return index < displayValue;
  }

  /**
   * Render a star icon
   */
  _renderStar(index) {
    const isFilled = this._isStarFilled(index);
    const classes = `star-button ${this.size} ${this.color} ${isFilled ? 'filled' : ''}`;

    // Determine tab index: first star is always tabbable, or the star matching current value
    let tabIndex = -1;
    if (index === 0 && this.value === 0) {
      tabIndex = 0;
    } else if (index === this.value - 1 && this.value > 0) {
      tabIndex = 0;
    }

    return html`
      <button
        class=${classes}
        type="button"
        aria-label="Rate ${index + 1} out of ${this._totalStars} stars"
        tabindex=${this.readonly || this.disabled ? -1 : tabIndex}
        ?disabled=${this.disabled}
        @click=${() => this._handleStarClick(index)}
        @mouseenter=${() => this._handleStarHover(index)}
        @keydown=${(e) => this._handleKeyDown(e, index)}
        @focus=${() => this._handleStarFocus(index)}
        @blur=${() => this._handleStarBlur()}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
        >
          <path
            d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
          />
        </svg>
      </button>
    `;
  }

  render() {
    const stars = Array.from({ length: this._totalStars }, (_, index) =>
      this._renderStar(index)
    );

    return html`
      <div
        class="star-rating-container"
        role="group"
        aria-label="Star rating"
      >
        <div
          class="stars-wrapper"
          @mouseleave=${this._handleMouseLeave}
          role="radiogroup"
          aria-label="Rating selection"
        >
        ${stars}
      </div>
      ${this.value > 0 && !this.readonly && !this.disabled ? html`
        <ol-button
          variant="secondary"
          size="small"
          @click=${this._handleClear}
          ?disabled=${this.disabled}
        >
          Clear rating
        </ol-button>
      ` : ''}
    </div>
  `;
  }
}

// Register the custom element
customElements.define('ol-star-rating', OlStarRating);


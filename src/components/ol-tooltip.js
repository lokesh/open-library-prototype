import { LitElement, html, css } from 'lit';

export class OlTooltip extends LitElement {
  static properties = {
    text: { type: String },
    position: { type: String, reflect: true },
    _visible: { type: Boolean, state: true },
  };

  static styles = css`
    :host {
      display: inline-block;
      position: relative;
    }

    .trigger {
      display: inline-flex;
      align-items: center;
      cursor: help;
      border: none;
      background: none;
      padding: 0;
      color: inherit;
      font: inherit;
    }

    .trigger:focus-visible {
      outline: 2px solid var(--focus-ring-color);
      outline-offset: 2px;
      border-radius: var(--radius-sm);
    }

    .bubble {
      position: absolute;
      z-index: 1000;
      width: max-content;
      max-width: 260px;
      padding: var(--spacing-2) var(--spacing-3);
      border-radius: var(--radius-md);
      background: var(--color-neutral-900);
      color: var(--color-neutral-50);
      font-family: var(--body-font-family);
      font-size: var(--body-font-size-sm);
      line-height: var(--body-line-height);
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.15s ease;
    }

    .bubble.visible {
      opacity: 1;
    }

    /* Arrow */
    .bubble::after {
      content: '';
      position: absolute;
      width: 8px;
      height: 8px;
      background: var(--color-neutral-900);
      transform: rotate(45deg);
    }

    /* Position: top (default) */
    :host(:not([position])) .bubble,
    :host([position="top"]) .bubble {
      bottom: calc(100% + 8px);
      left: 50%;
      transform: translateX(-50%);
    }

    :host(:not([position])) .bubble::after,
    :host([position="top"]) .bubble::after {
      bottom: -4px;
      left: 50%;
      margin-left: -4px;
    }

    /* Position: bottom */
    :host([position="bottom"]) .bubble {
      top: calc(100% + 8px);
      left: 50%;
      transform: translateX(-50%);
    }

    :host([position="bottom"]) .bubble::after {
      top: -4px;
      left: 50%;
      margin-left: -4px;
    }

    /* Position: left */
    :host([position="left"]) .bubble {
      right: calc(100% + 8px);
      top: 50%;
      transform: translateY(-50%);
    }

    :host([position="left"]) .bubble::after {
      right: -4px;
      top: 50%;
      margin-top: -4px;
    }

    /* Position: right */
    :host([position="right"]) .bubble {
      left: calc(100% + 8px);
      top: 50%;
      transform: translateY(-50%);
    }

    :host([position="right"]) .bubble::after {
      left: -4px;
      top: 50%;
      margin-top: -4px;
    }
  `;

  constructor() {
    super();
    this.text = '';
    this.position = 'top';
    this._visible = false;
  }

  _show() {
    this._visible = true;
  }

  _hide() {
    this._visible = false;
  }

  _handleKeydown(e) {
    if (e.key === 'Escape') {
      this._hide();
    }
  }

  render() {
    return html`
      <span
        class="trigger"
        tabindex="0"
        @mouseenter=${this._show}
        @mouseleave=${this._hide}
        @focusin=${this._show}
        @focusout=${this._hide}
        @keydown=${this._handleKeydown}
        aria-describedby="tooltip"
      >
        <slot></slot>
      </span>
      <div
        id="tooltip"
        class="bubble ${this._visible ? 'visible' : ''}"
        role="tooltip"
      >${this.text}</div>
    `;
  }
}

customElements.define('ol-tooltip', OlTooltip);

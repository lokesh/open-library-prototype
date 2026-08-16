import { LitElement, html, css } from 'lit';

/**
 * A segmented control (radio-group semantics) — used as the view switcher.
 *
 * @element ol-segmented-control
 * @prop {Array<{value:string,label:string,icon?:string,title?:string}>} options
 * @prop {string} value
 * @prop {string} size - small | medium
 * @prop {boolean} iconOnly - render icons only (labels become tooltips / aria)
 * @fires ol-segmented-control-change {value}
 */
export class OlSegmentedControl extends LitElement {
  static properties = {
    options: { type: Array },
    value: { type: String, reflect: true },
    size: { type: String, reflect: true },
    iconOnly: { type: Boolean, attribute: 'icon-only', reflect: true },
    label: { type: String },
  };

  static styles = css`
    :host { display: inline-flex; }
    .group {
      display: inline-flex;
      border: var(--border-control);
      border-radius: var(--radius-button);
      background: var(--color-bg-elevated);
      overflow: hidden;
    }
    button {
      appearance: none; border: 0; background: transparent; cursor: pointer;
      font-family: var(--body-font-family); font-size: var(--body-font-size-sm); font-weight: var(--font-weight-medium);
      color: var(--color-text); padding: var(--spacing-1) var(--spacing-3);
      display: inline-flex; align-items: center; gap: var(--spacing-2);
      border-right: var(--border-control); line-height: 1.4;
      min-height: 30px;
    }
    :host([size="small"]) button { padding: 2px var(--spacing-2); min-height: 26px; font-size: var(--font-size-xs); }
    button:last-child { border-right: 0; }
    button:hover { background: var(--color-bg-elevated-hovered); }
    button[aria-checked="true"] { background: var(--color-text-strong); color: var(--color-bg-elevated); }
    button:focus-visible { outline: var(--focus-ring-width) solid var(--focus-ring-color); outline-offset: -3px; z-index: 1; }
    .icon { width: 14px; height: 14px; display: inline-block; }
    :host([icon-only]) .lbl { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); }
  `;

  constructor() { super(); this.options = []; this.value = ''; this.size = 'medium'; this.iconOnly = false; this.label = 'View'; }

  _select(v) {
    if (v === this.value) return;
    this.value = v;
    this.dispatchEvent(new CustomEvent('ol-segmented-control-change', { detail: { value: v }, bubbles: true, composed: true }));
  }
  _onKey(e) {
    const idx = this.options.findIndex(o => o.value === this.value);
    let n = idx;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') n = (idx + 1) % this.options.length;
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') n = (idx - 1 + this.options.length) % this.options.length;
    else if (e.key === 'Home') n = 0; else if (e.key === 'End') n = this.options.length - 1; else return;
    e.preventDefault(); this._select(this.options[n].value);
    this.updateComplete.then(() => this.renderRoot.querySelector('button[aria-checked="true"]')?.focus());
  }

  static ICONS = {
    grid: html`<svg class="icon" viewBox="0 0 16 16" fill="currentColor"><rect x="1" y="1" width="6" height="6" rx="1"/><rect x="9" y="1" width="6" height="6" rx="1"/><rect x="1" y="9" width="6" height="6" rx="1"/><rect x="9" y="9" width="6" height="6" rx="1"/></svg>`,
    list: html`<svg class="icon" viewBox="0 0 16 16" fill="currentColor"><rect x="1" y="2" width="14" height="2.4" rx="1"/><rect x="1" y="6.8" width="14" height="2.4" rx="1"/><rect x="1" y="11.6" width="14" height="2.4" rx="1"/></svg>`,
    carousel: html`<svg class="icon" viewBox="0 0 16 16" fill="currentColor"><rect x="0" y="3" width="3" height="10" rx="1"/><rect x="4.5" y="2" width="7" height="12" rx="1"/><rect x="13" y="3" width="3" height="10" rx="1"/></svg>`,
  };

  render() {
    return html`<div class="group" role="radiogroup" aria-label=${this.label} @keydown=${this._onKey}>
      ${this.options.map(o => html`
        <button role="radio" aria-checked=${o.value === this.value ? 'true' : 'false'} tabindex=${o.value === this.value ? '0' : '-1'}
          title=${o.title || o.label} @click=${() => this._select(o.value)}>
          ${o.icon && OlSegmentedControl.ICONS[o.icon] ? OlSegmentedControl.ICONS[o.icon] : ''}<span class="lbl">${o.label}</span>
        </button>`)}
    </div>`;
  }
}
customElements.define('ol-segmented-control', OlSegmentedControl);

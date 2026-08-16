import { LitElement, html, css } from 'lit';

/**
 * Split button: a main action + a caret that opens a menu. Two real buttons
 * with separate accessible names and focus stops.
 *
 * @element ol-split-button
 * @prop {string} variant - primary | secondary | selected | outline
 * @prop {string} size - small | medium
 * @prop {boolean} open - reflected on the caret's aria-expanded
 * @prop {boolean} caretOnly - render only the caret
 * @prop {string} caretLabel - accessible name for the caret
 * @fires ol-split-main
 * @fires ol-split-caret
 */
export class OlSplitButton extends LitElement {
  static properties = {
    variant: { type: String, reflect: true },
    size: { type: String, reflect: true },
    open: { type: Boolean, reflect: true },
    caretOnly: { type: Boolean, attribute: 'caret-only', reflect: true },
    caretLabel: { type: String, attribute: 'caret-label' },
    fullWidth: { type: Boolean, attribute: 'full-width', reflect: true },
  };

  static styles = css`
    :host { display: inline-flex; }
    :host([full-width]) { display: flex; }
    .wrap { display: flex; width: 100%; }
    button {
      appearance: none; cursor: pointer; font-family: var(--body-font-family); font-weight: var(--font-weight-semibold);
      font-size: var(--body-font-size-sm); line-height: 1.3; padding: 7px 10px; min-height: 34px;
      border: var(--border-width-control) solid var(--color-border); background: var(--color-bg-elevated); color: var(--color-text);
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: inline-flex; align-items: center; justify-content: center; gap: 6px;
    }
    :host([size="small"]) button { font-size: var(--font-size-xs); padding: 4px 7px; min-height: 28px; }
    .main { flex: 1; border-radius: var(--radius-button) 0 0 var(--radius-button); border-right-width: 0; min-width: 0; }
    .caret { flex: none; width: 30px; padding: 0; border-radius: 0 var(--radius-button) var(--radius-button) 0; }
    :host([size="small"]) .caret { width: 26px; }
    :host([caret-only]) .caret { border-radius: var(--radius-button); width: 30px; }
    .caret svg { width: 12px; height: 12px; transition: transform 120ms; }
    :host([open]) .caret svg { transform: rotate(180deg); }
    button:hover { background: var(--color-bg-elevated-hovered); }
    button:focus-visible { outline: var(--focus-ring-width) solid var(--focus-ring-color); outline-offset: -2px; z-index: 1; position: relative; }

    :host([variant="primary"]) button { background: var(--color-bg-primary); border-color: var(--color-bg-primary); color: var(--color-text-on-primary); }
    :host([variant="primary"]) button:hover { background: var(--color-bg-primary-hovered); border-color: var(--color-bg-primary-hovered); }
    :host([variant="primary"]) .main { border-right: 1px solid rgba(255,255,255,.35); }
    :host([variant="selected"]) button { background: var(--color-blue-50); border-color: var(--color-brand-primary); color: var(--color-brand-primary); }
    :host([variant="selected"]) button:hover { background: var(--color-blue-100); }
    :host([variant="outline"]) button { background: var(--color-bg-elevated); border-color: var(--color-brand-primary); color: var(--color-brand-primary); }
    :host([variant="outline"]) button:hover { background: var(--color-blue-50); }
    :host([variant="muted"]) button { background: var(--color-bg-recessed); border-color: var(--color-bg-recessed); color: var(--color-text-on-recessed); }
    .chk { font-size: .9em; }
  `;

  constructor() { super(); this.variant = 'secondary'; this.size = 'medium'; this.open = false; this.caretOnly = false; this.caretLabel = 'More options'; this.fullWidth = false; }
  get caretElement() { return this.renderRoot.querySelector('.caret'); }
  _main(e) { e.stopPropagation(); this.dispatchEvent(new CustomEvent('ol-split-main', { bubbles: true, composed: true })); }
  _caret(e) { e.stopPropagation(); this.dispatchEvent(new CustomEvent('ol-split-caret', { detail: { anchor: e.currentTarget }, bubbles: true, composed: true })); }

  render() {
    const caret = html`<button class="caret" aria-haspopup="menu" aria-expanded=${this.open ? 'true' : 'false'} aria-label=${this.caretLabel} @click=${this._caret}>
      <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 4.5 6 8l3.5-3.5"/></svg></button>`;
    if (this.caretOnly) return html`<div class="wrap">${caret}</div>`;
    return html`<div class="wrap"><button class="main" @click=${this._main}><slot></slot></button>${caret}</div>`;
  }
}
customElements.define('ol-split-button', OlSplitButton);

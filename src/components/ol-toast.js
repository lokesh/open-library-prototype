import { LitElement, html, css } from 'lit';

/** Minimal toast. Use `toast('Saved')` from anywhere. */
export class OlToast extends LitElement {
  static properties = { _msg: { state: true }, _show: { state: true } };
  static styles = css`
    :host { position: fixed; left: 50%; bottom: 28px; transform: translateX(-50%); z-index: 3000; pointer-events: none; }
    .t { background: var(--color-text-strong); color: var(--color-bg-elevated); font-family: var(--body-font-family); font-size: var(--body-font-size-sm);
      padding: var(--spacing-2) var(--spacing-4); border-radius: var(--radius-button); box-shadow: 0 8px 24px rgba(0,0,0,.25);
      opacity: 0; transition: opacity 160ms ease, transform 160ms ease; transform: translateY(6px); white-space: nowrap; }
    .t.show { opacity: 1; transform: none; }
    @media (prefers-reduced-motion: reduce) { .t { transition: none; } }
  `;
  constructor() { super(); this._msg = ''; this._show = false; }
  show(msg, ms = 2000) { this._msg = msg; this._show = true; clearTimeout(this._t); this._t = setTimeout(() => { this._show = false; }, ms); }
  render() { return html`<div class="t ${this._show ? 'show' : ''}" role="status" aria-live="polite">${this._msg}</div>`; }
}
customElements.define('ol-toast', OlToast);

let _el = null;
export function toast(msg, ms) {
  if (!_el) { _el = document.createElement('ol-toast'); document.body.appendChild(_el); }
  _el.show(msg, ms);
}

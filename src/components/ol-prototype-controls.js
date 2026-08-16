import { LitElement, html, css, nothing } from 'lit';
import prototypeSettings, { CONTROLS, PRESETS } from '../prototype-settings-service.js';
import bookStateService from '../book-state-service.js';
import { toast } from './ol-toast.js';

/**
 * Floating "prototype settings" drawer: the variant switches from the
 * Views & Verbs report, presets, sign-in toggle, and a reset.
 *
 * @element ol-prototype-controls
 */
export class OlPrototypeControls extends LitElement {
  static properties = { open: { type: Boolean, reflect: true } };
  static styles = css`
    :host { position: fixed; right: 18px; bottom: 18px; z-index: 2500; font-family: var(--body-font-family); }
    .fab { width: 46px; height: 46px; border-radius: 50%; border: 0; background: var(--color-neutral-900); color: var(--color-neutral-50); cursor: pointer; box-shadow: 0 8px 24px rgba(0,0,0,.3); display: flex; align-items: center; justify-content: center; font-size: 20px; }
    .fab:hover { transform: translateY(-1px); }
    .fab:focus-visible { outline: var(--focus-ring-width) solid var(--focus-ring-color); }
    .drawer { position: absolute; right: 0; bottom: 56px; width: 340px; max-width: calc(100vw - 36px); max-height: 78vh; overflow-y: auto; background: var(--color-neutral-900); color: var(--color-neutral-100); border-radius: var(--radius-card); box-shadow: 0 16px 48px rgba(0,0,0,.4); padding: var(--spacing-4); display: none; }
    :host([open]) .drawer { display: block; }
    .hd { display: flex; align-items: baseline; justify-content: space-between; margin-bottom: var(--spacing-3); }
    .hd b { font-size: var(--body-font-size-sm); letter-spacing: -.01em; }
    .hd small { font-family: var(--font-family-mono); font-size: 10px; letter-spacing: .12em; text-transform: uppercase; color: var(--color-neutral-500); margin-left: 6px; }
    .presets { display: flex; gap: 6px; }
    .presets button, .reset { font: inherit; font-size: var(--font-size-xs); padding: 3px 9px; border: 1px solid var(--color-neutral-700); border-radius: var(--radius-button); background: transparent; color: var(--color-neutral-300); cursor: pointer; }
    .presets button:hover, .reset:hover { color: #fff; border-color: var(--color-neutral-500); }
    .g { margin-bottom: var(--spacing-3); }
    .lbl { font-family: var(--font-family-mono); font-size: 10px; letter-spacing: .12em; text-transform: uppercase; color: var(--color-neutral-500); margin-bottom: 5px; }
    .seg { display: inline-flex; flex-wrap: wrap; border: 1px solid var(--color-neutral-700); border-radius: var(--radius-button); overflow: hidden; }
    .seg button { font: inherit; font-size: var(--font-size-xs); padding: 4px 9px; border: 0; border-right: 1px solid var(--color-neutral-700); background: transparent; color: var(--color-neutral-300); cursor: pointer; white-space: nowrap; }
    .seg button:last-child { border-right: 0; }
    .seg button[aria-pressed="true"] { background: #8FD1BA; color: var(--color-neutral-900); font-weight: var(--font-weight-semibold); }
    .seg button:disabled { opacity: .35; cursor: not-allowed; }
    .note { font-size: 11px; color: var(--color-neutral-500); margin-top: 4px; line-height: 1.4; }
    label.chk { display: flex; align-items: flex-start; gap: 7px; font-size: var(--font-size-xs); color: var(--color-neutral-300); margin: 4px 0; cursor: pointer; }
    label.chk input { accent-color: #8FD1BA; margin-top: 2px; }
    .ft { display: flex; justify-content: space-between; align-items: center; margin-top: var(--spacing-3); padding-top: var(--spacing-3); border-top: 1px solid var(--color-neutral-800); }
    .status { font-family: var(--font-family-mono); font-size: 10px; color: var(--color-neutral-500); }
    .status b { color: #8FD1BA; font-weight: 600; }
  `;
  constructor() { super(); this.open = false; }
  connectedCallback() { super.connectedCallback(); this._rerender = () => this.requestUpdate(); document.addEventListener('ol-settings-change', this._rerender); document.addEventListener('ol-book-state-change', this._rerender); }
  disconnectedCallback() { super.disconnectedCallback(); document.removeEventListener('ol-settings-change', this._rerender); document.removeEventListener('ol-book-state-change', this._rerender); }

  render() {
    const s = prototypeSettings.get();
    const today = s.row === 'today';
    return html`
      <div class="drawer" role="dialog" aria-label="Prototype settings">
        <div class="hd"><span><b>Views &amp; Verbs</b><small>prototype</small></span><div class="presets"><button @click=${() => prototypeSettings.preset('today')}>Today</button><button @click=${() => prototypeSettings.preset('recommended')}>Recommended</button></div></div>
        ${CONTROLS.map(c => c.flags
          ? html`<div class="g"><div class="lbl">${c.label}</div>${c.flags.map(([k, l]) => html`<label class="chk"><input type="checkbox" .checked=${!!s[k]} @change=${e => prototypeSettings.set({ [k]: e.target.checked })}> ${l}</label>`)}
              <label class="chk"><input type="checkbox" .checked=${bookStateService.loggedIn} @change=${e => { bookStateService.loggedIn = e.target.checked; }}> Signed in</label></div>`
          : html`<div class="g"><div class="lbl">${c.label}</div><div class="seg">${c.options.map(([v, l]) => html`<button aria-pressed=${s[c.key] === v} ?disabled=${today && c.key !== 'row' && c.key !== 'density'} @click=${() => prototypeSettings.set({ [c.key]: v })}>${l}</button>`)}</div>${c.note ? html`<div class="note">${c.note}</div>` : nothing}</div>`)}
        <div class="ft"><span class="status">row <b>${s.row}</b> · tile <b>${today ? 'today' : s.tile}</b> · locate <b>${s.locate}</b> · intent <b>${s.intent ? 'on' : 'off'}</b></span><button class="reset" @click=${() => { bookStateService.reset(); toast('Shelves, lists and ratings reset'); }}>Reset my books</button></div>
      </div>
      <button class="fab" aria-label="Prototype settings" aria-expanded=${this.open} @click=${() => { this.open = !this.open; }}>⚙</button>`;
  }
}
customElements.define('ol-prototype-controls', OlPrototypeControls);

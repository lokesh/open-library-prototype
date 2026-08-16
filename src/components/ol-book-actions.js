import { LitElement, html, css, nothing } from 'lit';
import './ol-split-button.js';
import { openBookMenu } from './ol-book-menu.js';
import { toast } from './ol-toast.js';
import catalogService from '../catalog-service.js';
import bookStateService, { SHELVES } from '../book-state-service.js';
import prototypeSettings from '../prototype-settings-service.js';

/**
 * The action row for one book: Access (a verb) + state line + Save (the one
 * disclosure). Renders differently by `intent` (which control leads) and
 * `density` (how much room there is), and by the prototype's variant settings.
 *
 * @element ol-book-actions
 * @prop {string} bookKey
 * @prop {string} intent  - discover | manage | commit
 * @prop {string} density - row | tile | peek | dense
 * @prop {object} context - { listId, owner } passed to the menu
 * @fires ol-access-click {book, access}
 */
export class OlBookActions extends LitElement {
  static properties = {
    bookKey: { type: String, attribute: 'book-key' },
    intent: { type: String, reflect: true },
    density: { type: String, reflect: true },
    context: { attribute: false },
  };

  static styles = css`
    :host { display: block; font-family: var(--body-font-family); }
    .stack { display: flex; flex-direction: column; gap: 6px; }
    .h { display: flex; gap: 6px; align-items: flex-start; }
    .h > * { flex: 1; min-width: 0; }
    .h > .kebab { flex: none; }
    button.cta {
      appearance: none; cursor: pointer; width: 100%; font-family: inherit; font-weight: var(--font-weight-semibold);
      font-size: var(--body-font-size-sm); line-height: 1.3; padding: 7px 10px; min-height: 34px;
      border-radius: var(--radius-button); border: var(--border-width-control) solid transparent;
      display: inline-flex; align-items: center; justify-content: center; gap: 6px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    :host([density="tile"]) button.cta, :host([density="dense"]) button.cta { font-size: var(--font-size-xs); padding: 4px 7px; min-height: 28px; }
    button.cta:focus-visible { outline: var(--focus-ring-width) solid var(--focus-ring-color); outline-offset: 2px; }
    .fill { background: var(--color-bg-primary); border-color: var(--color-bg-primary); color: var(--color-text-on-primary); }
    .fill:hover { background: var(--color-bg-primary-hovered); border-color: var(--color-bg-primary-hovered); }
    .outline { background: var(--color-bg-elevated); border-color: var(--color-brand-primary); color: var(--color-brand-primary); }
    .outline:hover { background: var(--color-blue-50); }
    .sec { background: var(--color-bg-elevated); border-color: var(--color-border); color: var(--color-text); }
    .sec:hover { background: var(--color-bg-elevated-hovered); }
    .dead { background: var(--color-bg-recessed); border-color: var(--color-bg-recessed); color: var(--color-text-on-recessed); cursor: default; }
    .grey { background: var(--color-neutral-200); border-color: var(--color-neutral-200); color: var(--color-text); }
    .ext { font-size: .85em; opacity: .85; }
    .kebab { width: 34px; height: 34px; border-radius: var(--radius-button); border: var(--border-control); background: var(--color-bg-elevated); color: var(--color-text); cursor: pointer; font-size: 18px; line-height: 1; padding: 0; }
    :host([density="tile"]) .kebab { width: 28px; height: 28px; font-size: 15px; }
    .kebab:hover { background: var(--color-bg-elevated-hovered); }
    .state { font-size: var(--font-size-xs); color: var(--color-text-secondary); text-align: center; line-height: 1.35; }
    .state.left { text-align: left; }
    .state.pad { padding: 4px 0; }
    ol-split-button { width: 100%; }
    .today-split { display: flex; }
    .today-split .cta { border-radius: var(--radius-button) 0 0 var(--radius-button); }
    .today-split .caret { width: 30px; flex: none; border-radius: 0 var(--radius-button) var(--radius-button) 0; border-left: 0; }
  `;

  constructor() { super(); this.bookKey = ''; this.intent = 'discover'; this.density = 'row'; this.context = {}; }
  connectedCallback() {
    super.connectedCallback();
    this._rerender = () => this.requestUpdate();
    document.addEventListener('ol-book-state-change', this._rerender);
    document.addEventListener('ol-settings-change', this._rerender);
  }
  disconnectedCallback() { super.disconnectedCallback(); document.removeEventListener('ol-book-state-change', this._rerender); document.removeEventListener('ol-settings-change', this._rerender); }

  get book() { return catalogService.get(this.bookKey); }
  get manage() { return prototypeSettings.get().intent && this.intent === 'manage'; }

  // ---- handlers ----
  _access(a) {
    const b = this.book;
    this.dispatchEvent(new CustomEvent('ol-access-click', { detail: { book: b, access: a }, bubbles: true, composed: true }));
    if (a.style === 'dead') return;
    toast(`→ ${a.label}${a.ext ? ' (opens in a new tab)' : ''}`);
  }
  _save() {
    const b = this.book;
    if (!bookStateService.loggedIn) { toast("Sign in to save — we'll add it to Want to Read when you're back"); return; }
    if (bookStateService.shelfOf(b.key)) { this._menu(this.renderRoot.querySelector('ol-split-button') || this); return; }
    bookStateService.setShelf(b.key, 'want'); toast('Added to Want to Read');
  }
  _menu(anchor, withAccess = false) {
    openBookMenu(anchor, { bookKey: this.bookKey, withAccess, context: this.context });
  }

  // ---- pieces ----
  _accessBtn(a, { short = false, secondary = false } = {}) {
    if (a.style === 'none') return nothing;
    const label = short && a.short ? a.short : a.label;
    const cls = secondary ? 'sec' : a.style;
    return html`<button class="cta ${cls}" title=${a.label} @click=${() => this._access(a)}>${label}${a.ext ? html`<span class="ext">↗</span>` : nothing}</button>`;
  }
  _saveSplit({ lead = false, short = false, caretOnly = false } = {}) {
    const b = this.book;
    const set = !!bookStateService.shelfOf(b.key);
    const variant = lead ? (set ? 'selected' : 'primary') : (set ? 'selected' : 'secondary');
    const size = (this.density === 'tile' || this.density === 'dense') ? 'small' : 'medium';
    const label = bookStateService.shelfLabel(b.key, short);
    return html`<ol-split-button variant=${variant} size=${size} ?caret-only=${caretOnly} full-width caret-label="More save options"
      @ol-split-main=${this._save} @ol-split-caret=${e => this._menu(e.currentTarget)}>${set ? '✓ ' : ''}${label}</ol-split-button>`;
  }
  _stateLine(a, left = false, pad = false) { return a.state ? html`<div class="state ${left ? 'left' : ''} ${pad ? 'pad' : ''}">${a.state}</div>` : nothing; }
  _emptySlot(a) { return html`<div class="state left pad">${a.state}</div>`; }

  render() {
    const b = this.book; if (!b) return nothing;
    const s = prototypeSettings.get();
    const a = catalogService.access(b, s);
    const manage = this.manage;
    const short = this.density === 'tile';

    // ---- Today (production baseline) ----
    if (s.row === 'today') {
      const t = catalogService.accessToday(b);
      const shelfLbl = !bookStateService.loggedIn ? 'Add to List' : (bookStateService.shelfOf(b.key) ? '✓ ' + SHELVES[bookStateService.shelfOf(b.key)] : 'Want to Read');
      const acc = html`<button class="cta ${t.style}" @click=${() => this._access(t)}>${t.label}${t.ext ? html`<span class="ext">↗</span>` : nothing}</button>`;
      if (this.density === 'tile' && this.intent !== 'row-grid') return html`<div class="stack">${acc}</div>`;
      return html`<div class="stack">${acc}
        <div class="today-split"><button class="cta grey" @click=${() => this._menu(this.renderRoot.querySelector('.today-split .caret'))}>${shelfLbl}</button><button class="cta grey caret" aria-label="Reading log options" @click=${e => this._menu(e.currentTarget)}>▾</button></div></div>`;
    }

    // ---- Tile density: G2 / G3 / G4 (corner control is rendered by the tile) ----
    if (this.density === 'tile') {
      if (manage) return html`<div class="stack">${this._saveSplit({ lead: true, short: true })}</div>`;
      if (s.tile === 'G4') return html`<div class="h">${this._accessBtn(a, { short: true }) || this._emptySlot({ state: a.short || 'Not online' })}<div style="flex:none;width:30px">${this._saveSplit({ caretOnly: true })}</div></div>`;
      return html`<div class="stack">${this._accessBtn(a, { short: true }) || html`<div class="state">${a.state}</div>`}</div>`;
    }

    // ---- R1: Access + kebab ----
    if (s.row === 'R1') {
      return html`<div class="stack"><div class="h">${this._accessBtn(a) || this._emptySlot(a)}<button class="kebab" aria-label="More actions" aria-haspopup="menu" @click=${e => this._menu(e.currentTarget, true)}>⋮</button></div>${a.label ? this._stateLine(a, true) : nothing}</div>`;
    }
    // ---- R4: one split holding everything ----
    if (s.row === 'R4') {
      const variant = a.style === 'fill' ? 'primary' : a.style === 'outline' ? 'outline' : 'secondary';
      return html`<div class="stack"><ol-split-button variant=${variant} full-width caret-label="All actions" @ol-split-main=${() => a.label ? this._access(a) : this._menu(this.renderRoot.querySelector('ol-split-button'), true)} @ol-split-caret=${e => this._menu(e.currentTarget, true)}>${a.label || 'Save'}${a.ext ? ' ↗' : ''}</ol-split-button>${this._stateLine(a)}</div>`;
    }
    // ---- R3 / R6 ----
    const dense = this.density === 'dense';
    const horizontal = (s.row === 'R6' && !dense && this.density !== 'peek') || dense;
    const acc = manage ? this._accessBtn(a, { secondary: true }) : this._accessBtn(a);
    const save = manage ? this._saveSplit({ lead: true }) : this._saveSplit();
    if (horizontal) {
      const parts = manage ? [save, acc || nothing] : [acc || this._emptySlot(a), save];
      return html`<div class="stack"><div class="h">${parts}</div>${!dense && acc ? this._stateLine(a, true) : nothing}</div>`;
    }
    if (manage) return html`<div class="stack">${save}${acc}${acc ? this._stateLine(a) : this._emptySlot(a)}</div>`;
    return html`<div class="stack">${acc || this._emptySlot(a)}${acc ? this._stateLine(a) : nothing}${save}</div>`;
  }
}
customElements.define('ol-book-actions', OlBookActions);

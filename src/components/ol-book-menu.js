import { LitElement, html, css, nothing } from 'lit';
import './ol-popover.js';
import './ol-star-rating.js';
import { toast } from './ol-toast.js';
import catalogService from '../catalog-service.js';
import bookStateService, { SHELVES } from '../book-state-service.js';
import prototypeSettings from '../prototype-settings-service.js';

/**
 * The one grouped menu (M1). A single instance lives in <body>; call
 * `openBookMenu(anchor, { bookKey, withAccess, context })` from anywhere.
 *
 * Groups (shown only when they apply, always in this order):
 * Read it (R4 only) · Shelf · Rate · Lists · More ways to read · Write · Elsewhere · This list
 */
export class OlBookMenu extends LitElement {
  static properties = {
    bookKey: { type: String, attribute: 'book-key' },
    withAccess: { type: Boolean, attribute: 'with-access' },
    context: { attribute: false },
    open: { type: Boolean, reflect: true },
    _anchor: { state: true },
    _newList: { state: true },
  };

  static styles = css`
    :host { display: contents; }
    .menu { padding: var(--spacing-1) 0 var(--spacing-2); font-family: var(--body-font-family); font-size: var(--body-font-size-sm); }
    .title { padding: var(--spacing-2) var(--spacing-3) var(--spacing-1); font-family: var(--heading-font-family); font-weight: var(--font-weight-semibold); color: var(--color-text-strong); border-bottom: 1px solid var(--color-border-subtle); }
    .g { padding: var(--spacing-2) var(--spacing-3) 2px; font-size: 10.5px; letter-spacing: .1em; text-transform: uppercase; color: var(--color-text-secondary); border-top: 1px solid var(--color-border-subtle); margin-top: var(--spacing-1); font-weight: var(--font-weight-semibold); }
    .g.first { border-top: 0; margin-top: 0; }
    button.mi { display: flex; align-items: center; gap: var(--spacing-2); width: 100%; text-align: left; padding: 6px var(--spacing-3); border: 0; background: none; cursor: pointer; font: inherit; color: var(--color-text-on-elevated); }
    button.mi:hover { background: var(--color-bg-elevated-hovered); }
    button.mi:focus-visible { outline: var(--focus-ring-width) solid var(--focus-ring-color); outline-offset: -3px; }
    button.mi.on { color: var(--color-brand-primary); font-weight: var(--font-weight-semibold); }
    button.mi.dim { color: var(--color-text-secondary); }
    .chk { width: 16px; display: inline-flex; justify-content: center; color: var(--color-brand-primary); flex: none; }
    .ext { margin-left: auto; color: var(--color-text-secondary); font-size: 11px; }
    .rate { padding: 4px var(--spacing-3) 6px; display: flex; align-items: center; gap: var(--spacing-2); }
    .rate small { color: var(--color-text-secondary); }
    .newlist { display: flex; gap: 6px; padding: 4px var(--spacing-3) 6px; }
    .newlist input { flex: 1; font: inherit; padding: 4px 8px; border: var(--border-control); border-radius: var(--radius-input); min-width: 0; }
    .newlist button { font: inherit; padding: 4px 10px; border: 0; border-radius: var(--radius-button); background: var(--color-bg-primary); color: var(--color-text-on-primary); cursor: pointer; }
    .signin { margin: var(--spacing-2) 0 0; padding: var(--spacing-2) var(--spacing-3); font-size: var(--font-size-xs); color: var(--color-text-secondary); background: var(--color-bg); border-top: 1px solid var(--color-border-subtle); }
    .signin a { color: var(--color-link); font-weight: var(--font-weight-semibold); }
  `;

  constructor() { super(); this.bookKey = ''; this.withAccess = false; this.context = {}; this.open = false; this._anchor = null; this._newList = false; }
  connectedCallback() { super.connectedCallback(); this._rerender = () => this.requestUpdate(); document.addEventListener('ol-book-state-change', this._rerender); }
  disconnectedCallback() { super.disconnectedCallback(); document.removeEventListener('ol-book-state-change', this._rerender); }

  openFor(anchor, { bookKey, withAccess = false, context = {} } = {}) {
    if (this.open && this._anchor === anchor) { this.close(); return; }
    this.bookKey = bookKey; this.withAccess = withAccess; this.context = context; this._anchor = anchor; this._newList = false;
    this.open = true;
    this._setAnchorExpanded(true);
    this.updateComplete.then(() => { const first = this.renderRoot.querySelector('button.mi'); first?.focus({ preventScroll: true }); });
  }
  close() { this.open = false; this._setAnchorExpanded(false); }
  _setAnchorExpanded(v) {
    const a = this._anchor; if (!a) return;
    // anchor may be the host of an ol-split-button, or a plain button
    if (a.tagName === 'OL-SPLIT-BUTTON') a.open = v; else if (a.setAttribute) a.setAttribute('aria-expanded', String(v));
  }
  _anchorEl() { const a = this._anchor; if (!a) return null; return a.tagName === 'OL-SPLIT-BUTTON' ? (a.caretElement || a) : a; }

  // ---- actions ----
  _shelf(shelf) {
    if (!bookStateService.loggedIn) { toast(`Sign in to save — we'll add it to ${SHELVES[shelf] || 'your shelf'} when you're back`); this.close(); return; }
    bookStateService.setShelf(this.bookKey, shelf);
    toast(shelf ? `Added to ${SHELVES[shelf]}` : 'Removed from your shelves');
    this.close();
  }
  _rate(e) { const n = e.detail?.value ?? e.target.value; bookStateService.setRating(this.bookKey, n); toast(n ? `Rated ${n} star${n > 1 ? 's' : ''}` : 'Rating cleared'); }
  _list(id) { const on = bookStateService.toggleList(id, this.bookKey); toast(on ? `Added to ${bookStateService.list(id).name}` : `Removed from ${bookStateService.list(id).name}`); }
  _createList(e) { e.preventDefault(); const input = this.renderRoot.querySelector('.newlist input'); const name = input?.value.trim(); if (!name) return; bookStateService.createList(name, this.bookKey); toast(`Created "${name}"`); this._newList = false; }
  _go(label) { toast(`→ ${label}`); this.close(); }
  _removeFromList() { bookStateService.removeFromList(this.context.listId, this.bookKey); toast('Removed from this list'); this.close(); }

  _menuKey(e) {
    const items = [...this.renderRoot.querySelectorAll('button.mi, .newlist input, ol-star-rating')];
    const i = items.indexOf(e.composedPath()[0]) >= 0 ? items.indexOf(e.composedPath()[0]) : items.findIndex(el => el === this.renderRoot.activeElement);
    if (e.key === 'ArrowDown') { e.preventDefault(); (items[i + 1] || items[0])?.focus(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); (items[i - 1] || items[items.length - 1])?.focus(); }
    else if (e.key === 'Home') { e.preventDefault(); items[0]?.focus(); }
    else if (e.key === 'End') { e.preventDefault(); items[items.length - 1]?.focus(); }
  }

  render() {
    const b = catalogService.get(this.bookKey);
    if (!b) return html`<ol-popover .anchor=${this._anchorEl()} .open=${this.open} @ol-popover-close=${() => this.close()}></ol-popover>`;
    const loggedIn = bookStateService.loggedIn;
    const shelf = bookStateService.shelfOf(b.key);
    const a = catalogService.access(b, prototypeSettings.get());
    const ctx = this.context || {};
    const item = (label, { on = false, dim = false, ext = false, onClick } = {}) => html`
      <button class="mi ${on ? 'on' : ''} ${dim ? 'dim' : ''}" role="menuitem" @click=${onClick}><span class="chk">${on ? '✓' : ''}</span>${label}${ext ? html`<span class="ext">↗</span>` : nothing}</button>`;
    let first = true;
    const group = (name) => { const cls = first ? 'g first' : 'g'; first = false; return html`<div class="${cls}">${name}</div>`; };
    const more = [];
    if (a.label !== 'Preview') more.push(item('Preview', { onClick: () => this._go('Preview') }));
    more.push(item('Search inside', { onClick: () => this._go('Search inside') }));
    if (!a.isLocate) more.push(item('Find in a library', { ext: true, onClick: () => this._go('Find in a library') }));
    if (b.ebooks) more.push(item('Download options', { dim: true, onClick: () => this._go('Download options') }));

    return html`<ol-popover .anchor=${this._anchorEl()} .open=${this.open} .width=${268} @ol-popover-close=${() => this.close()}>
      <div class="menu" role="menu" aria-label="Book actions" @keydown=${this._menuKey}>
        <div class="title">${b.title}</div>
        ${this.withAccess && a.label ? html`${group('Read it')}${item(a.label, { ext: a.ext, onClick: () => this._go(a.label) })}` : nothing}
        ${group('Shelf')}
        ${Object.entries(SHELVES).map(([k, lbl]) => item(lbl, { on: shelf === k, onClick: () => this._shelf(k) }))}
        ${shelf ? item('Remove from shelf', { dim: true, onClick: () => this._shelf(null) }) : nothing}
        ${loggedIn ? html`
          ${group('Rate')}
          <div class="rate"><ol-star-rating size="small" color="yellow" .value=${bookStateService.ratingOf(b.key)} @change=${this._rate}></ol-star-rating><small>${bookStateService.ratingOf(b.key) ? 'Your rating' : 'Rate this book'}</small></div>
          ${group('Lists')}
          ${bookStateService.lists.map(l => item(l.name, { on: l.keys.includes(b.key), onClick: () => this._list(l.id) }))}
          ${this._newList
            ? html`<form class="newlist" @submit=${this._createList}><input placeholder="List name" aria-label="New list name" autofocus><button type="submit">Create</button></form>`
            : item('New list…', { dim: true, onClick: () => { this._newList = true; this.updateComplete.then(() => this.renderRoot.querySelector('.newlist input')?.focus()); } })}
        ` : nothing}
        ${group('More ways to read')}${more}
        ${loggedIn && shelf ? html`${group('Write')}${item('Review', { onClick: () => this._go('Review') })}${item('Notes', { onClick: () => this._go('Notes') })}${item('Check in', { onClick: () => this._go('Check in') })}` : nothing}
        ${group('Elsewhere')}
        ${item('Share', { onClick: () => this._go('Share') })}
        ${item('Buy this book', { ext: true, onClick: () => this._go('Buy this book') })}
        ${item(`All ${b.editions} editions`, { onClick: () => this._go('Editions') })}
        ${ctx.listId && ctx.owner ? html`${group('This list')}${item('Remove from this list', { onClick: () => this._removeFromList() })}${item('Edit note', { onClick: () => this._go('Edit note') })}` : nothing}
        ${!loggedIn ? html`<div class="signin"><a href="#" @click=${e => { e.preventDefault(); bookStateService.loggedIn = true; toast('Signed in — you\'re right where you were'); }}>Sign in</a> to save — you'll come right back here.</div>` : nothing}
      </div>
    </ol-popover>`;
  }
}
customElements.define('ol-book-menu', OlBookMenu);

let _menu = null;
/** Open the shared book menu anchored to `anchor`. */
export function openBookMenu(anchor, opts) {
  if (!_menu) { _menu = document.createElement('ol-book-menu'); document.body.appendChild(_menu); }
  _menu.openFor(anchor, opts);
  return _menu;
}
export function closeBookMenu() { _menu?.close(); }

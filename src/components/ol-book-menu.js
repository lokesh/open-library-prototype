import { LitElement, html, css, svg, nothing } from 'lit';
import './ol-popover.js';
import './ol-star-rating.js';
import { toast } from './ol-toast.js';
import catalogService from '../catalog-service.js';
import bookStateService, { SHELVES } from '../book-state-service.js';
import prototypeSettings from '../prototype-settings-service.js';

/** Lucide icon paths (24×24, stroke), keyed by menu label / shelf key. */
const ICONS = {
  // Access verbs
  'Borrow': svg`<path d="m16 6 4 14"/><path d="M12 6v14"/><path d="M8 8v12"/><path d="M4 4v16"/>`,
  'Read': svg`<path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/>`,
  'Listen': svg`<path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3"/>`,
  'Join waitlist': svg`<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>`,
  'Preview': svg`<path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/>`,
  'Find in a library': svg`<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>`,
  // Shelves
  'want': svg`<path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>`,
  'reading': svg`<path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/>`,
  'read': svg`<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>`,
  'stopped': svg`<circle cx="12" cy="12" r="10"/><line x1="10" x2="10" y1="15" y2="9"/><line x1="14" x2="14" y1="15" y2="9"/>`,
  'Remove from shelf': svg`<path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2Z"/><path d="m14.5 7.5-5 5"/><path d="m9.5 7.5 5 5"/>`,
  // Lists
  'Add to list': svg`<path d="M11 12H3"/><path d="M16 6H3"/><path d="M16 18H3"/><path d="M18 9v6"/><path d="M21 12h-6"/>`,
  'Remove from this list': svg`<path d="M11 12H3"/><path d="M16 6H3"/><path d="M16 18H3"/><path d="m19 10-4 4"/><path d="m15 10 4 4"/>`,
  'Edit note': svg`<path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/>`,
  // More ways to read
  'Search inside': svg`<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>`,
  'Download options': svg`<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/>`,
  // Write
  'Review': svg`<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>`,
  'Notes': svg`<path d="M16 3H5a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2V9Z"/><path d="M15 3v4a2 2 0 0 0 2 2h4"/>`,
  'Check in': svg`<path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/><path d="m9 16 2 2 4-4"/>`,
};
const CHECK = svg`<path d="M20 6 9 17l-5-5"/>`;
const icon = (paths) => paths ? html`<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>` : html`<span class="ico"></span>`;
/** Pick an icon for an access verb ("Read on Foo" → Read). */
const accessIcon = (label) => ICONS[label] || (label?.startsWith('Read') ? ICONS['Read'] : null);

/**
 * The one grouped menu (M1). A single instance lives in <body>; call
 * `openBookMenu(anchor, { bookKey, withAccess, context })` from anywhere.
 *
 * Groups (unlabeled, separated by hairlines; shown only when they apply, always in this order):
 * Read it (R4 only) · Shelf · Rate · Lists · More ways to read · Write · This list
 * Each item leads with a Lucide icon (see ICONS below).
 */
export class OlBookMenu extends LitElement {
  static properties = {
    bookKey: { type: String, attribute: 'book-key' },
    withAccess: { type: Boolean, attribute: 'with-access' },
    context: { attribute: false },
    open: { type: Boolean, reflect: true },
    _anchor: { state: true },
    _newList: { state: true },
    _view: { state: true },
    _filter: { state: true },
  };

  static styles = css`
    :host { display: contents; }
    .menu { padding: var(--spacing-1) 0 var(--spacing-2); font-family: var(--body-font-family); font-size: var(--body-font-size-sm); }
    .title { padding: var(--spacing-2) var(--spacing-3) var(--spacing-1); font-size: var(--font-size-xs); color: var(--color-text-secondary); border-bottom: 1px solid var(--color-border-subtle); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .title b { font-weight: var(--font-weight-semibold); color: var(--color-text-strong); }
    .sep { border-top: 1px solid var(--color-border-subtle); margin-top: var(--spacing-1); padding-top: var(--spacing-1); }
    button.mi { display: flex; align-items: center; gap: var(--spacing-2); width: 100%; text-align: left; padding: 6px var(--spacing-3); border: 0; background: none; cursor: pointer; font: inherit; color: var(--color-text-on-elevated); }
    button.mi:hover { background: var(--color-bg-elevated-hovered); }
    button.mi:focus-visible { outline: var(--focus-ring-width) solid var(--focus-ring-color); outline-offset: -3px; }
    button.mi.on { color: var(--color-brand-primary); font-weight: var(--font-weight-semibold); }
    button.mi.dim { color: var(--color-text-secondary); }
    .ico { width: 16px; height: 16px; flex: none; color: var(--color-text-secondary); }
    button.mi.on .ico { color: var(--color-brand-primary); }
    .chk { width: 14px; height: 14px; margin-left: auto; flex: none; color: var(--color-brand-primary); }
    .ext { margin-left: auto; color: var(--color-text-secondary); font-size: 11px; }
    .rate { padding: var(--spacing-2) var(--spacing-3) 6px; margin-top: var(--spacing-1); border-top: 1px solid var(--color-border-subtle); display: flex; align-items: center; gap: var(--spacing-2); }
    .rate small { color: var(--color-text-secondary); }
    .chev { margin-left: auto; color: var(--color-text-secondary); font-size: 12px; }
    .hint { margin-left: auto; color: var(--color-text-secondary); font-size: var(--font-size-xs); }
    button.mi .chev, button.mi .hint { flex: none; }
    button.mi.in .ico { color: var(--color-brand-primary); }
    .sub-head { display: flex; align-items: center; justify-content: space-between; gap: var(--spacing-2); padding: var(--spacing-2) var(--spacing-3); border-bottom: 1px solid var(--color-border-subtle); }
    .back { display: inline-flex; align-items: center; gap: 4px; font: inherit; font-weight: var(--font-weight-semibold); color: var(--color-text-on-elevated); background: none; border: 0; padding: 4px 6px 4px 0; cursor: pointer; border-radius: var(--radius-button); }
    .back:hover { color: var(--color-brand-primary); }
    .create { display: inline-flex; align-items: center; gap: 4px; font: inherit; font-size: var(--font-size-xs); font-weight: var(--font-weight-semibold); padding: 5px 10px; border: 0; border-radius: var(--radius-button); background: var(--color-bg-primary); color: var(--color-text-on-primary); cursor: pointer; white-space: nowrap; }
    .filter { padding: var(--spacing-2) var(--spacing-3) var(--spacing-1); }
    .filter input { width: 100%; box-sizing: border-box; font: inherit; padding: 6px 8px; border: var(--border-control); border-radius: var(--radius-input); }
    .box { width: 16px; height: 16px; flex: none; border: 1.5px solid var(--color-border-strong, var(--color-border)); border-radius: 3px; display: inline-flex; align-items: center; justify-content: center; font-size: 11px; line-height: 1; }
    button.mi.on .box { background: var(--color-brand-primary); border-color: var(--color-brand-primary); color: var(--color-text-on-primary); }
    .count { margin-left: auto; font-size: var(--font-size-xs); color: var(--color-text-secondary); background: var(--color-bg-elevated-hovered); border-radius: var(--radius-full, 999px); padding: 1px 7px; min-width: 20px; text-align: center; }
    .empty { padding: var(--spacing-3); color: var(--color-text-secondary); font-size: var(--font-size-xs); }
    .newlist { display: flex; gap: 6px; padding: 4px var(--spacing-3) 6px; }
    .newlist input { flex: 1; font: inherit; padding: 4px 8px; border: var(--border-control); border-radius: var(--radius-input); min-width: 0; }
    .newlist button { font: inherit; padding: 4px 10px; border: 0; border-radius: var(--radius-button); background: var(--color-bg-primary); color: var(--color-text-on-primary); cursor: pointer; }
    .signin { margin: var(--spacing-2) 0 0; padding: var(--spacing-2) var(--spacing-3); font-size: var(--font-size-xs); color: var(--color-text-secondary); background: var(--color-bg); border-top: 1px solid var(--color-border-subtle); }
    .signin a { color: var(--color-link); font-weight: var(--font-weight-semibold); }
  `;

  constructor() { super(); this.bookKey = ''; this.withAccess = false; this.context = {}; this.open = false; this._anchor = null; this._newList = false; this._view = 'main'; this._filter = ''; }
  connectedCallback() { super.connectedCallback(); this._rerender = () => this.requestUpdate(); document.addEventListener('ol-book-state-change', this._rerender); }
  disconnectedCallback() { super.disconnectedCallback(); document.removeEventListener('ol-book-state-change', this._rerender); }

  openFor(anchor, { bookKey, withAccess = false, context = {} } = {}) {
    if (this.open && this._anchor === anchor) { this.close(); return; }
    this.bookKey = bookKey; this.withAccess = withAccess; this.context = context; this._anchor = anchor; this._newList = false; this._view = 'main'; this._filter = '';
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
  _showLists() { this._view = 'lists'; this._filter = ''; this._newList = false; this.updateComplete.then(() => this.renderRoot.querySelector('.filter input')?.focus({ preventScroll: true })); }
  _showMain() { this._view = 'main'; this.updateComplete.then(() => this.renderRoot.querySelector('button.mi.lists-entry')?.focus({ preventScroll: true })); }
  _startNewList() { this._newList = true; this.updateComplete.then(() => this.renderRoot.querySelector('.newlist input')?.focus()); }
  _go(label) { toast(`→ ${label}`); this.close(); }
  _removeFromList() { bookStateService.removeFromList(this.context.listId, this.bookKey); toast('Removed from this list'); this.close(); }

  _menuKey(e) {
    if (e.key === 'Escape' && this._view === 'lists') { e.preventDefault(); e.stopPropagation(); this._showMain(); return; }
    if (e.key === 'ArrowLeft' && this._view === 'lists' && e.composedPath()[0]?.tagName !== 'INPUT') { e.preventDefault(); this._showMain(); return; }
    const items = [...this.renderRoot.querySelectorAll('.filter input, button.mi, .newlist input, ol-star-rating')];
    const i = items.indexOf(e.composedPath()[0]) >= 0 ? items.indexOf(e.composedPath()[0]) : items.findIndex(el => el === this.renderRoot.activeElement);
    if (e.key === 'ArrowDown') { e.preventDefault(); (items[i + 1] || items[0])?.focus(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); (items[i - 1] || items[items.length - 1])?.focus(); }
    else if (e.key === 'Home') { e.preventDefault(); items[0]?.focus(); }
    else if (e.key === 'End') { e.preventDefault(); items[items.length - 1]?.focus(); }
  }

  _renderLists(b) {
    const q = this._filter.trim().toLowerCase();
    const lists = bookStateService.lists.filter(l => !q || l.name.toLowerCase().includes(q));
    return html`<ol-popover .anchor=${this._anchorEl()} .open=${this.open} .width=${268} @ol-popover-close=${() => this.close()}>
      <div class="menu" role="menu" aria-label="Add to list" @keydown=${this._menuKey}>
        <div class="sub-head">
          <button class="back" @click=${() => this._showMain()} aria-label="Back to book actions">‹ Back</button>
          ${this._newList ? nothing : html`<button class="create" @click=${() => this._startNewList()}>+ Create a list</button>`}
        </div>
        ${this._newList
          ? html`<form class="newlist" @submit=${this._createList}><input placeholder="List name" aria-label="New list name"><button type="submit">Create</button></form>`
          : html`<div class="filter"><input type="search" placeholder="Filter lists…" aria-label="Filter lists" .value=${this._filter} @input=${e => { this._filter = e.target.value; }}></div>`}
        ${lists.length ? lists.map(l => { const on = l.keys.includes(b.key); return html`
          <button class="mi ${on ? 'on' : ''}" role="menuitemcheckbox" aria-checked=${on} @click=${() => this._list(l.id)}><span class="box">${on ? '✓' : ''}</span>${l.name}<span class="count">${l.keys.length}</span></button>`; })
          : html`<div class="empty">${q ? 'No lists match.' : 'No lists yet — create one above.'}</div>`}
      </div>
    </ol-popover>`;
  }

  render() {
    const b = catalogService.get(this.bookKey);
    if (!b) return html`<ol-popover .anchor=${this._anchorEl()} .open=${this.open} @ol-popover-close=${() => this.close()}></ol-popover>`;
    const loggedIn = bookStateService.loggedIn;
    const shelf = bookStateService.shelfOf(b.key);
    const a = catalogService.access(b, prototypeSettings.get());
    const ctx = this.context || {};
    const inLists = bookStateService.listsContaining(b.key);
    if (this._view === 'lists') return this._renderLists(b);
    const item = (label, { icon: ic = ICONS[label], on = false, dim = false, ext = false, onClick } = {}) => html`
      <button class="mi ${on ? 'on' : ''} ${dim ? 'dim' : ''}" role="menuitem" @click=${onClick}>${icon(ic)}${label}${ext ? html`<span class="ext">↗</span>` : nothing}${on ? html`<svg class="chk" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${CHECK}</svg>` : nothing}</button>`;
    let first = true;
    /** Hairline between groups (none before the first group). */
    const sep = () => { const s = first ? nothing : html`<div class="sep"></div>`; first = false; return s; };
    const more = [];
    if (a.label !== 'Preview') more.push(item('Preview', { onClick: () => this._go('Preview') }));
    more.push(item('Search inside', { onClick: () => this._go('Search inside') }));
    if (!a.isLocate) more.push(item('Find in a library', { ext: true, onClick: () => this._go('Find in a library') }));
    if (b.ebooks) more.push(item('Download options', { dim: true, onClick: () => this._go('Download options') }));

    return html`<ol-popover .anchor=${this._anchorEl()} .open=${this.open} .width=${268} @ol-popover-close=${() => this.close()}>
      <div class="menu" role="menu" aria-label="Book actions" @keydown=${this._menuKey}>
        <div class="title" title=${b.author ? `${b.title} by ${b.author}` : b.title}><b>${b.title}</b>${b.author ? html` by ${b.author}` : nothing}</div>
        ${this.withAccess && a.label ? html`${sep()}${item(a.label, { icon: accessIcon(a.label), ext: a.ext, onClick: () => this._go(a.label) })}` : nothing}
        ${sep()}
        ${Object.entries(SHELVES).map(([k, lbl]) => item(lbl, { icon: ICONS[k], on: shelf === k, onClick: () => this._shelf(k) }))}
        ${shelf ? item('Remove from shelf', { dim: true, onClick: () => this._shelf(null) }) : nothing}
        ${loggedIn ? html`
          <div class="rate"><ol-star-rating size="small" color="yellow" .value=${bookStateService.ratingOf(b.key)} @change=${this._rate}></ol-star-rating><small>${bookStateService.ratingOf(b.key) ? 'Your rating' : 'Rate this book'}</small></div>
          <div class="sep"></div>
          <button class="mi lists-entry ${inLists.length ? 'in' : ''}" role="menuitem" aria-haspopup="true" @click=${() => this._showLists()}>${icon(ICONS['Add to list'])}Add to list${inLists.length ? html`<span class="hint">In ${inLists.length} list${inLists.length > 1 ? 's' : ''}</span>` : nothing}<span class="chev">›</span></button>
        ` : nothing}
        ${sep()}${more}
        ${loggedIn && shelf ? html`${sep()}${item('Review', { onClick: () => this._go('Review') })}${item('Notes', { onClick: () => this._go('Notes') })}${item('Check in', { onClick: () => this._go('Check in') })}` : nothing}
        ${ctx.listId && ctx.owner ? html`${sep()}${item('Remove from this list', { onClick: () => this._removeFromList() })}${item('Edit note', { onClick: () => this._go('Edit note') })}` : nothing}
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

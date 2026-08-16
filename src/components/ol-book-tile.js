import { LitElement, html, css, nothing } from 'lit';
import './ol-book-cover.js';
import './ol-book-actions.js';
import { openBookMenu } from './ol-book-menu.js';
import { toast } from './ol-toast.js';
import catalogService from '../catalog-service.js';
import bookStateService, { SHELVES } from '../book-state-service.js';
import prototypeSettings from '../prototype-settings-service.js';

/**
 * Grid / carousel tile: cover (with corner Save + state badge), title,
 * author, and the tile-density action row. One tile template for every
 * cover-led surface.
 *
 * @element ol-book-tile
 * @prop {string} bookKey
 * @prop {string} intent - discover | manage
 */
export class OlBookTile extends LitElement {
  static properties = {
    bookKey: { type: String, attribute: 'book-key' },
    intent: { type: String, reflect: true },
    context: { attribute: false },
  };

  static styles = css`
    :host { display: flex; flex-direction: column; gap: 6px; min-width: 0; font-family: var(--body-font-family); }
    a.t { font-family: var(--heading-font-family); font-size: var(--body-font-size-sm); font-weight: var(--font-weight-semibold); color: var(--color-text-strong); text-decoration: none; line-height: 1.25;
      display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; min-height: 2.5em; }
    a.t:hover { color: var(--color-link); text-decoration: underline; }
    .a { font-size: var(--font-size-xs); color: var(--color-text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .badge { position: absolute; left: 6px; top: 6px; font-size: 9px; font-weight: var(--font-weight-bold); letter-spacing: .05em; text-transform: uppercase; padding: 2px 6px; border-radius: var(--radius-sm); background: rgba(255,255,255,.94); color: var(--color-neutral-900); box-shadow: 0 0 0 1px rgba(0,0,0,.08); }
    .corner { position: absolute; right: 6px; top: 6px; width: 28px; height: 28px; border-radius: 50%; border: 0; background: rgba(255,255,255,.96); color: var(--color-neutral-800); cursor: pointer; font-size: 17px; line-height: 1; display: flex; align-items: center; justify-content: center; padding: 0;
      box-shadow: 0 1px 4px rgba(0,0,0,.3), 0 0 0 1px rgba(0,0,0,.06); transition: transform 100ms; }
    .corner:hover { transform: scale(1.08); }
    .corner:focus-visible { outline: var(--focus-ring-width) solid var(--focus-ring-color); }
    .corner.set { background: var(--color-bg-primary); color: var(--color-text-on-primary); }
    .corner svg { width: 14px; height: 14px; }
    ol-book-cover { display: block; }
    a.cov { display: block; text-decoration: none; }
  `;

  constructor() { super(); this.bookKey = ''; this.intent = 'discover'; this.context = {}; }
  connectedCallback() { super.connectedCallback(); this._rerender = () => this.requestUpdate(); document.addEventListener('ol-book-state-change', this._rerender); document.addEventListener('ol-settings-change', this._rerender); }
  disconnectedCallback() { super.disconnectedCallback(); document.removeEventListener('ol-book-state-change', this._rerender); document.removeEventListener('ol-settings-change', this._rerender); }

  _cornerSave(e) {
    e.preventDefault(); e.stopPropagation();
    const b = catalogService.get(this.bookKey);
    if (!bookStateService.loggedIn) { toast("Sign in to save — we'll add it to Want to Read when you're back"); return; }
    if (bookStateService.shelfOf(b.key)) { openBookMenu(e.currentTarget, { bookKey: b.key, context: this.context }); return; }
    bookStateService.setShelf(b.key, 'want'); toast('Added to Want to Read');
  }
  _cornerAccess(e, a) { e.preventDefault(); e.stopPropagation(); toast(`→ ${a.label}`); }

  render() {
    const b = catalogService.get(this.bookKey); if (!b) return nothing;
    const s = prototypeSettings.get();
    const a = catalogService.access(b, s);
    const manage = s.intent && this.intent === 'manage';
    const set = !!bookStateService.shelfOf(b.key);
    const href = `book.html?key=${b.key}`;
    let corner = nothing, badge = nothing;
    if (s.row !== 'today') {
      if (manage) {
        if (a.label && a.style !== 'none') corner = html`<button class="corner" title=${a.label} aria-label=${a.label} @click=${e => this._cornerAccess(e, a)}><svg viewBox="0 0 16 16" fill="currentColor"><path d="M4 2.5v11l9-5.5z"/></svg></button>`;
        const d = bookStateService.dateOf(b.key);
        if (bookStateService.shelfOf(b.key) === 'reading' && d) badge = html`<div class="badge">Started ${new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</div>`;
      } else {
        if (s.tile === 'G3') corner = html`<button class="corner ${set ? 'set' : ''}" title=${set ? SHELVES[bookStateService.shelfOf(b.key)] : 'Want to Read'} aria-label=${set ? `On your ${SHELVES[bookStateService.shelfOf(b.key)]} shelf — change` : 'Save to Want to Read'} @click=${this._cornerSave}>${set ? '✓' : '+'}</button>`;
        if (s.tile !== 'G2' && a.badge) badge = html`<div class="badge">${a.badge}</div>`;
      }
    }
    return html`
      <a class="cov" href=${href} tabindex="-1" aria-hidden="true"><ol-book-cover size="full" src=${b.coverUrl} alt="" title=${b.title} author=${b.author}>
        <div slot="overlay">${badge}${corner}</div>
      </ol-book-cover></a>
      <a class="t" href=${href}>${b.title}</a>
      <div class="a">${b.author}</div>
      <ol-book-actions book-key=${b.key} intent=${this.intent} density="tile" .context=${this.context}></ol-book-actions>
    `;
  }
}
customElements.define('ol-book-tile', OlBookTile);

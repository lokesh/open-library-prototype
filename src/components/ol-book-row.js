import { LitElement, html, css, nothing } from 'lit';
import './ol-book-cover.js';
import './ol-book-actions.js';
import './ol-star-rating.js';
import { toast } from './ol-toast.js';
import catalogService from '../catalog-service.js';
import bookStateService from '../book-state-service.js';
import prototypeSettings from '../prototype-settings-service.js';

/**
 * List row (the searchResultItem, rebuilt): cover, metadata, optional description
 * or paragraph, manage-only extras (inline rating, check-in), and the action row.
 * Clicking the row (not a control) opens the peek panel when enabled.
 *
 * @element ol-book-row
 * @prop {string} bookKey
 * @prop {string} intent - discover | manage
 * @prop {boolean} active - highlighted (peek panel open on this row)
 * @fires ol-book-peek {key}
 */
export class OlBookRow extends LitElement {
  static properties = {
    bookKey: { type: String, attribute: 'book-key' },
    intent: { type: String, reflect: true },
    active: { type: Boolean, reflect: true },
    context: { attribute: false },
    _dense: { state: true },
    _peekable: { state: true },
  };

  static styles = css`
    :host { display: block; font-family: var(--body-font-family); }
    .row { display: flex; gap: var(--spacing-4); padding: var(--spacing-4) var(--spacing-2); border-bottom: 1px solid var(--color-border-subtle); border-radius: var(--radius-md); }
    :host([peekable]) .row { cursor: pointer; }
    :host([peekable]) .row:hover { background: var(--color-bg-elevated); }
    :host([active]) .row { background: var(--color-blue-50); box-shadow: inset 3px 0 0 var(--color-brand-primary); }
    ol-book-cover { width: 64px; flex: none; }
    :host([dense]) ol-book-cover { width: 32px; }
    :host([desc-on]) ol-book-cover { width: 84px; }
    .meta { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 3px; }
    a.t { font-family: var(--heading-font-family); font-size: var(--font-size-lg); font-weight: var(--font-weight-semibold); color: var(--color-text-strong); text-decoration: none; line-height: 1.2; }
    a.t:hover { color: var(--color-link); text-decoration: underline; }
    :host([dense]) a.t { font-size: var(--body-font-size); }
    .a { font-size: var(--body-font-size-sm); color: var(--color-text); }
    .a a { color: var(--color-link); text-decoration: none; }
    .k { font-size: var(--font-size-xs); color: var(--color-text-secondary); }
    .k a { color: var(--color-link); text-decoration: none; }
    .stars { display: flex; align-items: center; gap: 6px; font-size: var(--font-size-xs); color: var(--color-text-secondary); }
    .desc { font-size: var(--body-font-size-sm); color: var(--color-text); line-height: 1.45; max-width: 62ch; margin-top: 4px; }
    .desc.fallback { color: var(--color-text-secondary); font-style: italic; }
    .desc .more { color: var(--color-link); cursor: pointer; }
    .extra { display: flex; align-items: center; gap: var(--spacing-2); font-size: var(--font-size-xs); color: var(--color-text-secondary); margin-top: 3px; flex-wrap: wrap; }
    .extra a { color: var(--color-link); }
    .acts { width: 172px; flex: none; }
    :host([wide]) .acts { width: 268px; }
    :host([dense]) .row { padding: 6px var(--spacing-2); align-items: center; }
    :host([dense]) .acts { width: auto; }
    @media (max-width: 640px) {
      .row { flex-wrap: wrap; }
      .acts { width: 100%; }
    }
  `;

  constructor() { super(); this.bookKey = ''; this.intent = 'discover'; this.active = false; this.context = {}; }
  connectedCallback() {
    super.connectedCallback();
    this._rerender = () => { this._sync(); this.requestUpdate(); };
    document.addEventListener('ol-book-state-change', this._rerender);
    document.addEventListener('ol-settings-change', this._rerender);
    this._sync();
  }
  disconnectedCallback() { super.disconnectedCallback(); document.removeEventListener('ol-book-state-change', this._rerender); document.removeEventListener('ol-settings-change', this._rerender); }
  _sync() {
    const s = prototypeSettings.get();
    const today = s.row === 'today';
    this.toggleAttribute('dense', s.density === 'dense');
    this.toggleAttribute('wide', s.row === 'R6' && s.density !== 'dense');
    this.toggleAttribute('desc-on', s.descMode === 'paragraph' && s.density !== 'dense' && !today);
    this.toggleAttribute('peekable', s.peek && !today);
  }

  _rowClick(e) {
    if (!this.hasAttribute('peekable')) return;
    const path = e.composedPath();
    if (path.some(el => el.tagName && /^(BUTTON|A|OL-BOOK-ACTIONS|OL-SPLIT-BUTTON|OL-STAR-RATING|INPUT)$/.test(el.tagName))) return;
    this.dispatchEvent(new CustomEvent('ol-book-peek', { detail: { key: this.bookKey }, bubbles: true, composed: true }));
  }
  _rowKey(e) {
    if (!this.hasAttribute('peekable')) return;
    if ((e.key === 'Enter' || e.key === ' ') && e.composedPath()[0] === this.renderRoot.querySelector('.row')) { e.preventDefault(); this.dispatchEvent(new CustomEvent('ol-book-peek', { detail: { key: this.bookKey }, bubbles: true, composed: true })); }
  }
  _rate(e) { bookStateService.setRating(this.bookKey, e.detail.value); toast(`Rated ${e.detail.value} star${e.detail.value > 1 ? 's' : ''}`); }

  render() {
    const b = catalogService.get(this.bookKey); if (!b) return nothing;
    const s = prototypeSettings.get();
    const dense = s.density === 'dense';
    const today = s.row === 'today';
    const manage = s.intent && this.intent === 'manage';
    const href = `book.html?key=${b.key}`;
    const peekable = this.hasAttribute('peekable');

    let desc = nothing;
    if (!dense && !today) {
      if (s.descMode === 'paragraph') {
        desc = b.description
          ? html`<div class="desc">${b.description.length > 220 ? b.description.slice(0, 220).replace(/\s\S*$/, '') + '…' : b.description} <span class="more">more</span></div>`
          : html`<div class="desc fallback">No description yet — ${b.editions} editions, first published ${b.year}.</div>`;
      }
    }
    let extra = nothing;
    if (manage && !dense && !today) {
      const shelf = bookStateService.shelfOf(b.key); const d = bookStateService.dateOf(b.key);
      const dateStr = d ? new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '';
      extra = html`<div class="extra"><ol-star-rating size="small" color="yellow" .value=${bookStateService.ratingOf(b.key)} @change=${this._rate}></ol-star-rating><span>${bookStateService.ratingOf(b.key) ? 'Your rating' : 'Rate this book'}</span>
        ${shelf === 'reading' && d ? html`<span>· Started ${dateStr} · <a href="#" @click=${e => { e.preventDefault(); bookStateService.setShelf(b.key, 'read'); toast('Marked as finished'); }}>Mark finished</a></span>` : nothing}
        ${shelf === 'read' && d ? html`<span>· Finished ${dateStr} · <a href="#" @click=${e => { e.preventDefault(); toast('→ Edit check-in'); }}>Edit</a></span>` : nothing}
      </div>`;
    }
    return html`<div class="row" role=${peekable ? 'button' : 'listitem'} tabindex=${peekable ? '0' : '-1'} aria-expanded=${peekable ? String(this.active) : nothing} @click=${this._rowClick} @keydown=${this._rowKey}>
      <ol-book-cover size="full" src=${b.coverUrl} alt="" title=${b.title} author=${b.author}></ol-book-cover>
      <div class="meta">
        <a class="t" href=${href}>${b.title}</a>
        <div class="a">by <a href="author.html?author=${b.authorKey}">${b.author}</a></div>
        ${dense ? nothing : html`
          <div class="stars"><ol-star-rating size="small" color="yellow" .value=${Math.round(b.rating)} readonly></ol-star-rating><span>${b.rating} · ${b.ratingCount.toLocaleString()} ratings</span></div>
          <div class="k">First published ${b.year} · <a href=${href}>${b.editions} editions</a>${b.ebooks ? html` · <a href=${href}>${b.ebooks} ebooks</a>` : nothing}</div>`}
        ${desc}${extra}
      </div>
      <div class="acts"><ol-book-actions book-key=${b.key} intent=${this.intent} density=${dense ? 'dense' : 'row'} .context=${this.context}></ol-book-actions></div>
    </div>`;
  }
}
customElements.define('ol-book-row', OlBookRow);

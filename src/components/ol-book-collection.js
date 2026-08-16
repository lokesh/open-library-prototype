import { LitElement, html, css, nothing } from 'lit';
import './ol-book-tile.js';
import './ol-book-row.js';
import './ol-carousel.js';
import './ol-segmented-control.js';
import { toast } from './ol-toast.js';
import prototypeSettings from '../prototype-settings-service.js';

/**
 * One collection of books, rendered in one of three views. This is the
 * component that makes "view" a single axis: the same keys, the same tile
 * and row templates, only the container changes.
 *
 * @element ol-book-collection
 * @prop {string[]} keys - book keys, in order
 * @prop {string} view - grid | list | carousel
 * @prop {string} intent - discover | manage
 * @prop {string} heading - optional header (carousels use it as the title)
 * @prop {string} seeAllHref - "See all" target for carousels
 * @prop {boolean} expandable - carousel header gets a Covers / List toggle (X2)
 * @prop {number} cap - rows shown when a carousel is expanded in place
 * @prop {string} activeKey - row currently open in the peek panel
 * @prop {object} context - passed to actions/menu ({listId, owner})
 * @fires ol-collection-view-change {view}
 */
export class OlBookCollection extends LitElement {
  static properties = {
    keys: { type: Array },
    view: { type: String, reflect: true },
    intent: { type: String, reflect: true },
    heading: { type: String },
    seeAllHref: { type: String, attribute: 'see-all-href' },
    expandable: { type: Boolean },
    cap: { type: Number },
    activeKey: { type: String, attribute: 'active-key' },
    context: { attribute: false },
    emptyText: { type: String, attribute: 'empty-text' },
    _expanded: { state: true },
    _shown: { state: true },
  };

  static styles = css`
    :host { display: block; font-family: var(--body-font-family); }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(132px, 1fr)); gap: var(--spacing-6) var(--spacing-4); padding: var(--spacing-2) 0; }
    @media (max-width: 480px) { .grid { grid-template-columns: repeat(2, 1fr); } }
    .list { display: block; }
    .head { display: flex; align-items: center; justify-content: space-between; gap: var(--spacing-3); margin-bottom: var(--spacing-1); }
    .head h2 { font-family: var(--heading-font-family); font-size: var(--heading-title-2-size); font-weight: var(--heading-font-weight); color: var(--heading-color); margin: 0; }
    .head h2 a { color: inherit; text-decoration: none; }
    .head h2 a:hover { text-decoration: underline; }
    .ctl { display: flex; align-items: center; gap: var(--spacing-3); font-size: var(--body-font-size-sm); }
    .ctl a { color: var(--color-link); text-decoration: none; }
    .expanded { border: var(--border-card); border-radius: var(--radius-card); padding: 0 var(--spacing-3); background: var(--color-bg-elevated); }
    .expanded ol-book-row:last-of-type { --last: 1; }
    .more { display: flex; justify-content: center; gap: var(--spacing-3); padding: var(--spacing-3); border-top: 1px solid var(--color-border-subtle); font-size: var(--body-font-size-sm); }
    .more button, .more a { background: none; border: 0; color: var(--color-link); cursor: pointer; font: inherit; text-decoration: none; }
    .more button:hover, .more a:hover { text-decoration: underline; }
    .empty { padding: var(--spacing-8) var(--spacing-4); text-align: center; color: var(--color-text-secondary); }
    .today-note { background: var(--color-bg-elevated); border: 1px dashed var(--color-border); padding: var(--spacing-2) var(--spacing-3); font-size: var(--font-size-xs); color: var(--color-text-secondary); border-radius: var(--radius-md); margin: var(--spacing-2) 0; }
  `;

  constructor() {
    super();
    this.keys = []; this.view = 'list'; this.intent = 'discover'; this.heading = ''; this.seeAllHref = ''; this.expandable = true; this.cap = 8; this.activeKey = ''; this.context = {}; this.emptyText = 'Nothing here yet.';
    this._expanded = false; this._shown = this.cap;
  }
  connectedCallback() { super.connectedCallback(); this._rerender = () => this.requestUpdate(); document.addEventListener('ol-settings-change', this._rerender); }
  disconnectedCallback() { super.disconnectedCallback(); document.removeEventListener('ol-settings-change', this._rerender); }

  _setView(v) { this._expanded = v === 'list'; this._shown = this.cap; this.dispatchEvent(new CustomEvent('ol-collection-view-change', { detail: { view: this._expanded ? 'list' : 'carousel' }, bubbles: true, composed: true })); }

  _tiles(keys) { return keys.map(k => html`<ol-book-tile book-key=${k} intent=${this.intent} .context=${this.context}></ol-book-tile>`); }
  _rows(keys) { return keys.map(k => html`<ol-book-row book-key=${k} intent=${this.intent} ?active=${this.activeKey === k} .context=${this.context}></ol-book-row>`); }

  render() {
    const keys = this.keys || [];
    if (!keys.length) return html`${this._header()}<div class="empty">${this.emptyText}</div>`;
    if (this.view === 'grid') return html`${this._header()}<div class="grid" role="list">${this._tiles(keys)}</div>`;
    if (this.view === 'list') return html`${this._header()}<div class="list" role="list">${this._rows(keys)}</div>`;
    // carousel
    const today = prototypeSettings.get().row === 'today';
    if (this._expanded && !today) {
      const shown = keys.slice(0, this._shown);
      return html`${this._header()}
        <div class="expanded"><div role="list">${this._rows(shown)}</div>
          <div class="more">
            ${keys.length > shown.length ? html`<button @click=${() => { this._shown += this.cap; }}>Show ${Math.min(this.cap, keys.length - shown.length)} more</button>·` : nothing}
            <button @click=${() => this._setView('carousel')}>Collapse</button>
            ${this.seeAllHref ? html`·<a href=${this.seeAllHref}>See all →</a>` : nothing}
          </div>
        </div>`;
    }
    return html`${this._header()}<ol-carousel slide-width="132">${this._tiles(keys)}</ol-carousel>`;
  }
  _header() {
    if (!this.heading) return nothing;
    const today = prototypeSettings.get().row === 'today';
    const isCar = this.view === 'carousel';
    const ctl = isCar && this.expandable && !today
      ? html`<ol-segmented-control size="small" label="Show ${this.heading} as" .value=${this._expanded ? 'list' : 'carousel'} .options=${[{ value: 'carousel', label: 'Covers', icon: 'grid' }, { value: 'list', label: 'List', icon: 'list' }]} @ol-segmented-control-change=${e => this._setView(e.detail.value)}></ol-segmented-control>`
      : (this.seeAllHref ? html`<a href=${this.seeAllHref}>See all</a>` : nothing);
    return html`<div class="head"><h2>${this.seeAllHref ? html`<a href=${this.seeAllHref}>${this.heading}</a>` : this.heading}</h2><div class="ctl">${ctl}</div></div>`;
  }
}
customElements.define('ol-book-collection', OlBookCollection);

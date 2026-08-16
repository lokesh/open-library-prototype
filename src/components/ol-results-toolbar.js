import { LitElement, html, css, nothing } from 'lit';
import './ol-segmented-control.js';

/**
 * Toolbar above a list surface: count / left slot, sort, and the view switcher.
 * The Grid/List preference is remembered globally (localStorage 'ol-view').
 *
 * @element ol-results-toolbar
 * @prop {string} view - grid | list
 * @prop {string[]} views - which views the switcher offers (default both)
 * @prop {string} count - text for the left side
 * @prop {string[]} sorts
 * @fires ol-view-change {view}
 * @fires ol-sort-change {sort}
 */
export class OlResultsToolbar extends LitElement {
  static properties = {
    view: { type: String, reflect: true },
    views: { type: Array },
    count: { type: String },
    sorts: { type: Array },
    sort: { type: String },
    hideSort: { type: Boolean, attribute: 'hide-sort' },
  };
  static styles = css`
    :host { display: block; font-family: var(--body-font-family); }
    .bar { display: flex; align-items: center; justify-content: space-between; gap: var(--spacing-3); flex-wrap: wrap; padding: var(--spacing-2) 0 var(--spacing-3); border-bottom: 1px solid var(--color-border-subtle); margin-bottom: var(--spacing-2); font-size: var(--body-font-size-sm); color: var(--color-text); }
    .right { display: flex; align-items: center; gap: var(--spacing-3); }
    select { font: inherit; font-size: var(--body-font-size-sm); padding: 5px 28px 5px 10px; border: var(--border-control); border-radius: var(--radius-button); background: var(--color-bg-elevated); color: var(--color-text); appearance: none;
      background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'><path d='M2.5 4.5 6 8l3.5-3.5' fill='none' stroke='%23666' stroke-width='1.8' stroke-linecap='round'/></svg>"); background-repeat: no-repeat; background-position: right 8px center; }
    select:focus-visible { outline: var(--focus-ring-width) solid var(--focus-ring-color); }
  `;
  static remembered() { return localStorage.getItem('ol-view') || null; }
  constructor() { super(); this.view = 'list'; this.views = ['grid', 'list']; this.count = ''; this.sorts = ['Relevance', 'Most editions', 'First published', 'Rating']; this.sort = 'Relevance'; this.hideSort = false; }
  _change(e) { this.view = e.detail.value; localStorage.setItem('ol-view', this.view); this.dispatchEvent(new CustomEvent('ol-view-change', { detail: { view: this.view }, bubbles: true, composed: true })); }
  render() {
    const opts = this.views.map(v => ({ value: v, label: v === 'grid' ? 'Grid' : 'List', icon: v }));
    return html`<div class="bar"><div><slot>${this.count}</slot></div><div class="right">
      ${this.hideSort ? nothing : html`<select aria-label="Sort" .value=${this.sort} @change=${e => { this.sort = e.target.value; this.dispatchEvent(new CustomEvent('ol-sort-change', { detail: { sort: this.sort }, bubbles: true, composed: true })); }}>${this.sorts.map(s => html`<option ?selected=${s === this.sort}>${s}</option>`)}</select>`}
      ${this.views.length > 1 ? html`<ol-segmented-control label="Layout" .value=${this.view} .options=${opts} @ol-segmented-control-change=${this._change}></ol-segmented-control>` : nothing}
    </div></div>`;
  }
}
customElements.define('ol-results-toolbar', OlResultsToolbar);

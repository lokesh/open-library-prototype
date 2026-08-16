import { LitElement, html, css, nothing } from 'lit';
import './ol-book-cover.js';
import './ol-book-actions.js';
import './ol-star-rating.js';
import catalogService from '../catalog-service.js';
import prototypeSettings from '../prototype-settings-service.js';

/**
 * The description beside the results, not inside them. Listens for
 * `ol-book-peek` on document; walks the current list with ↑/↓; Esc closes.
 * Pages set `.keys` (the row order) and `intent`; the panel manages the rest.
 *
 * @element ol-peek-panel
 * @prop {string[]} keys
 * @prop {string} intent
 * @prop {string} activeKey (read-only-ish; reflected)
 * @fires ol-peek-change {key|null}
 */
export class OlPeekPanel extends LitElement {
  static properties = { keys: { type: Array }, intent: { type: String }, activeKey: { type: String, attribute: 'active-key', reflect: true }, context: { attribute: false } };
  static styles = css`
    :host { display: none; }
    :host([active-key]:not([active-key=""])) { display: block; }
    aside { position: fixed; top: 0; right: 0; bottom: 0; width: 400px; max-width: 100vw; background: var(--color-bg-elevated); color: var(--color-text-on-elevated); border-left: var(--border-card); box-shadow: -10px 0 30px rgba(0,0,0,.12); overflow-y: auto; z-index: 900; font-family: var(--body-font-family); }
    .h { position: sticky; top: 0; background: var(--color-bg-elevated); display: flex; align-items: center; justify-content: space-between; padding: var(--spacing-2) var(--spacing-3); border-bottom: 1px solid var(--color-border-subtle); font-size: var(--font-size-xs); color: var(--color-text-secondary); z-index: 1; }
    .nav { display: flex; gap: 6px; }
    .nav button { font: inherit; font-size: var(--font-size-xs); padding: 4px 9px; border: var(--border-control); border-radius: var(--radius-button); background: var(--color-bg-elevated); color: var(--color-text); cursor: pointer; }
    .nav button:disabled { opacity: .4; cursor: default; }
    .nav button:hover:not(:disabled) { background: var(--color-bg-elevated-hovered); }
    .b { padding: var(--spacing-4) var(--spacing-4) var(--spacing-8); }
    .top { display: flex; gap: var(--spacing-4); }
    ol-book-cover { width: 104px; flex: none; }
    h2 { font-family: var(--heading-font-family); font-size: var(--font-size-xl); line-height: 1.2; margin: 0 0 4px; color: var(--color-text-strong); }
    h2 a { color: inherit; text-decoration: none; } h2 a:hover { text-decoration: underline; }
    .by { font-size: var(--body-font-size-sm); margin-bottom: 4px; } .by a { color: var(--color-link); text-decoration: none; }
    .stars { display: flex; align-items: center; gap: 6px; font-size: var(--font-size-xs); color: var(--color-text-secondary); }
    .k { font-size: var(--font-size-xs); color: var(--color-text-secondary); margin-top: 6px; line-height: 1.5; } .k a { color: var(--color-link); text-decoration: none; }
    .acts { margin: var(--spacing-4) 0 var(--spacing-2); }
    .desc { font-size: var(--body-font-size-sm); line-height: 1.55; color: var(--color-text); margin: var(--spacing-4) 0 var(--spacing-3); }
    .desc.fb { color: var(--color-text-secondary); font-style: italic; }
    .subj { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: var(--spacing-3); }
    .subj a { font-size: var(--font-size-xs); padding: 3px 10px; border-radius: var(--radius-full); border: var(--chip-border); color: var(--color-text); text-decoration: none; background: var(--color-bg-elevated); }
    .subj a:hover { background: var(--color-bg-elevated-hovered); }
    dl { display: grid; grid-template-columns: 110px 1fr; gap: 3px 10px; font-size: var(--font-size-xs); margin: 0 0 var(--spacing-4); }
    dt { color: var(--color-text-secondary); } dd { margin: 0; }
    .open { display: block; text-align: center; font-size: var(--body-font-size-sm); padding: 8px; border: var(--border-control); border-radius: var(--radius-button); color: var(--color-link); text-decoration: none; }
    .open:hover { background: var(--color-bg-elevated-hovered); }
    .kbd { font-size: 11px; color: var(--color-text-secondary); text-align: center; margin-top: var(--spacing-3); }
    kbd { border: var(--border-control); border-radius: 3px; padding: 0 4px; font-family: inherit; font-size: 10px; }
    @media (max-width: 900px) { aside { top: auto; left: 0; width: auto; max-height: 70vh; border-left: 0; border-top: var(--border-card); border-radius: var(--radius-overlay) var(--radius-overlay) 0 0; } }
  `;
  constructor() { super(); this.keys = []; this.intent = 'discover'; this.activeKey = ''; this.context = {}; this._onPeek = this._onPeek.bind(this); this._onKey = this._onKey.bind(this); this._onSettings = this._onSettings.bind(this); }
  connectedCallback() { super.connectedCallback(); document.addEventListener('ol-book-peek', this._onPeek); document.addEventListener('keydown', this._onKey); document.addEventListener('ol-settings-change', this._onSettings); document.addEventListener('ol-book-state-change', () => this.requestUpdate()); }
  disconnectedCallback() { super.disconnectedCallback(); document.removeEventListener('ol-book-peek', this._onPeek); document.removeEventListener('keydown', this._onKey); document.removeEventListener('ol-settings-change', this._onSettings); this._setBodyClass(false); }
  _onSettings() { if (!prototypeSettings.get().peek || prototypeSettings.get().row === 'today') this.close(); }
  _onPeek(e) { const k = e.detail.key; if (k === this.activeKey) this.close(); else this.open(k); }
  _onKey(e) {
    if (!this.activeKey) return;
    const t = e.composedPath()[0]; if (t && /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) return;
    if (e.key === 'Escape') { this.close(); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); this.step(1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); this.step(-1); }
  }
  open(key) { this.activeKey = key; this._setBodyClass(true); this._emit(); requestAnimationFrame(() => document.querySelector(`ol-book-row[book-key="${key}"]`)?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })); }
  close() { if (!this.activeKey) return; this.activeKey = ''; this._setBodyClass(false); this._emit(); }
  step(d) { const i = this.keys.indexOf(this.activeKey); const n = this.keys[i + d]; if (n) this.open(n); }
  _setBodyClass(on) { document.documentElement.classList.toggle('ol-peek-open', on); }
  _emit() { this.dispatchEvent(new CustomEvent('ol-peek-change', { detail: { key: this.activeKey || null }, bubbles: true, composed: true })); }

  render() {
    const b = catalogService.get(this.activeKey); if (!b) return nothing;
    const i = this.keys.indexOf(b.key); const n = this.keys.length;
    const a = catalogService.access(b, prototypeSettings.get());
    return html`<aside role="complementary" aria-label="Book details">
      <div class="h"><span>${i >= 0 ? `${i + 1} of ${n}` : ''}</span><div class="nav">
        <button ?disabled=${i <= 0} @click=${() => this.step(-1)}>↑ Prev</button><button ?disabled=${i >= n - 1} @click=${() => this.step(1)}>↓ Next</button><button aria-label="Close" @click=${() => this.close()}>✕</button></div></div>
      <div class="b">
        <div class="top"><ol-book-cover size="full" src=${b.coverUrl} alt="" title=${b.title} author=${b.author}></ol-book-cover>
          <div style="min-width:0"><h2><a href="book.html?key=${b.key}">${b.title}</a></h2><div class="by">by <a href="author.html?author=${b.authorKey}">${b.author}</a></div>
            <div class="stars"><ol-star-rating size="small" color="yellow" .value=${Math.round(b.rating)} readonly></ol-star-rating><span>${b.rating} · ${b.ratingCount.toLocaleString()}</span></div>
            <div class="k">First published ${b.year}<br><a href="book.html?key=${b.key}">${b.editions} editions</a>${b.ebooks ? html` · ${b.ebooks} ebooks` : nothing}</div></div></div>
        <div class="acts"><ol-book-actions book-key=${b.key} intent=${this.intent} density="peek" .context=${this.context}></ol-book-actions></div>
        ${b.description ? html`<p class="desc">${b.description}</p>` : html`<p class="desc fb">No description has been added for this work yet.${b.firstSentence ? ` It opens: “${b.firstSentence}”` : ''}</p>`}
        <div class="subj">${(b.subjects || []).map(s => html`<a href="subject.html?subject=${encodeURIComponent(s)}">${s}</a>`)}</div>
        <dl><dt>Editions</dt><dd>${b.editions}</dd><dt>Ebooks</dt><dd>${b.ebooks || 'None online'}</dd><dt>Pages</dt><dd>${b.pages}</dd><dt>Availability</dt><dd>${a.state || '—'}</dd></dl>
        <a class="open" href="book.html?key=${b.key}">Open book page →</a>
        <div class="kbd"><kbd>↑</kbd> <kbd>↓</kbd> walk results · <kbd>Esc</kbd> close</div>
      </div></aside>`;
  }
}
customElements.define('ol-peek-panel', OlPeekPanel);

import { LitElement, html, css } from 'lit';

/**
 * Horizontal scroll track with prev/next arrows and snap points. Children are
 * the slides. Keyboard: arrows on the track scroll by a page.
 *
 * @element ol-carousel
 * @prop {number} slideWidth - px width of each slide (sets a CSS var)
 */
export class OlCarousel extends LitElement {
  static properties = { slideWidth: { type: Number, attribute: 'slide-width' }, _atStart: { state: true }, _atEnd: { state: true } };
  static styles = css`
    :host { display: block; position: relative; --slide-w: 132px; }
    .track { display: flex; gap: var(--spacing-4); overflow-x: auto; scroll-snap-type: x mandatory; scrollbar-width: none; padding: var(--spacing-3) var(--spacing-1) var(--spacing-4); scroll-padding: var(--spacing-1); }
    .track::-webkit-scrollbar { display: none; }
    ::slotted(*) { flex: none; width: var(--slide-w); scroll-snap-align: start; }
    .arrow { position: absolute; top: 34%; width: 36px; height: 36px; border-radius: 50%; border: var(--border-control); background: var(--color-bg-elevated); color: var(--color-text); cursor: pointer; box-shadow: 0 2px 8px rgba(0,0,0,.18); display: flex; align-items: center; justify-content: center; z-index: 1; font-size: 18px; line-height: 1; padding: 0; }
    .arrow:hover { background: var(--color-bg-elevated-hovered); }
    .arrow:focus-visible { outline: var(--focus-ring-width) solid var(--focus-ring-color); }
    .prev { left: -14px; } .next { right: -14px; }
    .arrow[hidden] { display: none; }
    @media (max-width: 640px) { .arrow { display: none; } }
  `;
  constructor() { super(); this.slideWidth = 132; this._atStart = true; this._atEnd = false; }
  firstUpdated() { this._track = this.renderRoot.querySelector('.track'); this._onScroll(); this._ro = new ResizeObserver(() => this._onScroll()); this._ro.observe(this._track); }
  disconnectedCallback() { super.disconnectedCallback(); this._ro?.disconnect(); }
  updated(c) { if (c.has('slideWidth')) this.style.setProperty('--slide-w', `${this.slideWidth}px`); }
  _onScroll() { const t = this._track; if (!t) return; this._atStart = t.scrollLeft <= 2; this._atEnd = t.scrollLeft + t.clientWidth >= t.scrollWidth - 2; }
  _page(dir) { const t = this._track; t.scrollBy({ left: dir * (t.clientWidth - 60), behavior: 'smooth' }); }
  render() {
    return html`
      <button class="prev arrow" aria-label="Scroll left" ?hidden=${this._atStart} @click=${() => this._page(-1)}>‹</button>
      <div class="track" @scroll=${this._onScroll} tabindex="0" aria-label="Carousel" @keydown=${e => { if (e.key === 'ArrowRight') { e.preventDefault(); this._page(1); } if (e.key === 'ArrowLeft') { e.preventDefault(); this._page(-1); } }}><slot></slot></div>
      <button class="next arrow" aria-label="Scroll right" ?hidden=${this._atEnd} @click=${() => this._page(1)}>›</button>`;
  }
}
customElements.define('ol-carousel', OlCarousel);

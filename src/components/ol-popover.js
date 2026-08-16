import { LitElement, html, css } from 'lit';

/**
 * Anchored popover: fixed-position panel that flips to stay on screen,
 * closes on outside click / Escape, and returns focus to its anchor.
 *
 * @element ol-popover
 * @prop {boolean} open
 * @prop {HTMLElement} anchor - element to position against (set as a property)
 * @prop {string} placement - 'bottom-end' | 'bottom-start'
 * @fires ol-popover-close
 */
export class OlPopover extends LitElement {
  static properties = {
    open: { type: Boolean, reflect: true },
    anchor: { attribute: false },
    placement: { type: String },
    width: { type: Number },
  };

  static styles = css`
    :host { display: contents; }
    .panel {
      position: fixed; z-index: var(--z-index-dropdown);
      background: var(--color-bg-elevated); color: var(--color-text-on-elevated);
      border: var(--border-card); border-radius: var(--radius-card);
      box-shadow: 0 10px 30px rgba(0,0,0,.18), 0 2px 6px rgba(0,0,0,.08);
      max-height: min(70vh, 560px); overflow-y: auto;
      opacity: 0; pointer-events: none; transform: translateY(-4px);
      transition: opacity 120ms ease, transform 120ms ease;
    }
    :host([open]) .panel { opacity: 1; pointer-events: auto; transform: none; }
    @media (prefers-reduced-motion: reduce) { .panel { transition: none; } }
    @media (max-width: 640px) {
      .panel { left: 0 !important; right: 0 !important; top: auto !important; bottom: 0 !important;
        width: auto !important; max-width: none; border-radius: var(--radius-overlay) var(--radius-overlay) 0 0; max-height: 80vh; transform: translateY(12px); }
      :host([open]) .panel { transform: none; }
      .grabber { width: 36px; height: 4px; border-radius: 2px; background: var(--color-border); margin: 8px auto 0; }
    }
    @media (min-width: 641px) { .grabber { display: none; } }
  `;

  constructor() {
    super();
    this.open = false; this.anchor = null; this.placement = 'bottom-end'; this.width = 260;
    this._onDocClick = this._onDocClick.bind(this);
    this._onKey = this._onKey.bind(this);
    this._reposition = this._reposition.bind(this);
  }
  connectedCallback() { super.connectedCallback(); document.addEventListener('click', this._onDocClick, true); document.addEventListener('keydown', this._onKey); window.addEventListener('resize', this._reposition); window.addEventListener('scroll', this._reposition, true); }
  disconnectedCallback() { super.disconnectedCallback(); document.removeEventListener('click', this._onDocClick, true); document.removeEventListener('keydown', this._onKey); window.removeEventListener('resize', this._reposition); window.removeEventListener('scroll', this._reposition, true); }

  updated(changed) {
    if (changed.has('open') || changed.has('anchor')) {
      if (this.open) { this._reposition(); requestAnimationFrame(() => this._reposition()); }
      else if (changed.get('open') === true && this.anchor && this._returnFocus) { try { this.anchor.focus(); } catch {} }
    }
  }
  _reposition() {
    if (!this.open || !this.anchor) return;
    const panel = this.renderRoot.querySelector('.panel'); if (!panel) return;
    if (window.innerWidth <= 640) return;
    const r = this.anchor.getBoundingClientRect();
    const w = Math.min(this.width, window.innerWidth - 16);
    const h = panel.offsetHeight || 300;
    let left = this.placement === 'bottom-start' ? r.left : r.right - w;
    left = Math.max(8, Math.min(left, window.innerWidth - w - 8));
    let top = r.bottom + 6;
    if (top + h > window.innerHeight - 8 && r.top - h - 6 > 8) top = r.top - h - 6;
    panel.style.left = `${left}px`; panel.style.top = `${top}px`; panel.style.width = `${w}px`;
  }
  _onDocClick(e) {
    if (!this.open) return;
    const path = e.composedPath();
    if (path.includes(this) || (this.anchor && path.includes(this.anchor))) return;
    this.close();
  }
  _onKey(e) { if (this.open && e.key === 'Escape') { e.stopPropagation(); this._returnFocus = true; this.close(); } }
  close() { if (!this.open) return; this.open = false; this.dispatchEvent(new CustomEvent('ol-popover-close', { bubbles: true, composed: true })); }

  render() {
    return html`<div class="panel" role="presentation" @click=${e => e.stopPropagation()}><div class="grabber"></div><slot></slot></div>`;
  }
}
customElements.define('ol-popover', OlPopover);

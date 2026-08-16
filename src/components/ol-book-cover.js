import { LitElement, html, css } from 'lit';

/**
 * Book cover with a graceful placeholder (title/author on a tinted ground)
 * when there is no image or it fails to load, and an overlay slot for
 * corner controls and badges.
 *
 * @element ol-book-cover
 * @prop {string} src
 * @prop {string} alt
 * @prop {string} size - small | medium | large | full
 * @prop {string} title - used by the placeholder
 * @prop {string} author - used by the placeholder
 * @slot overlay - absolutely positioned over the cover
 */
export class OlBookCover extends LitElement {
  static properties = {
    src: { type: String },
    alt: { type: String },
    size: { type: String, reflect: true },
    title: { type: String },
    author: { type: String },
    _failed: { type: Boolean, state: true },
  };

  static styles = css`
    :host { display: block; }
    .cover {
      position: relative;
      aspect-ratio: 2 / 3;
      overflow: hidden;
      border-radius: var(--radius-image);
      background-color: var(--color-bg-recessed);
      box-shadow: 0 1px 2px rgba(0,0,0,.12), inset -3px 0 0 rgba(0,0,0,.08);
    }
    img { width: 100%; height: 100%; object-fit: cover; display: block; }
    .placeholder {
      position: absolute; inset: 0;
      display: flex; flex-direction: column; justify-content: space-between;
      padding: 10% 9%;
      background: linear-gradient(160deg, var(--cover-tint, hsl(210, 30%, 40%)) 0%, hsl(215, 30%, 16%) 100%);
      color: rgba(255,255,255,.92);
      text-align: center;
    }
    .placeholder .t { font-family: var(--heading-font-family); font-weight: var(--font-weight-semibold); font-size: clamp(9px, 1.1em, 15px); line-height: 1.15; }
    .placeholder .a { font-size: clamp(7px, .7em, 10px); letter-spacing: .06em; text-transform: uppercase; opacity: .8; }
    .overlay { position: absolute; inset: 0; pointer-events: none; }
    .overlay ::slotted(*) { pointer-events: auto; }
    :host([size="small"]) .cover { width: 40px; }
    :host([size="medium"]) .cover { width: 80px; }
    :host([size="large"]) .cover { width: 160px; }
    :host([size="full"]) .cover { width: 100%; }
  `;

  constructor() {
    super();
    this.src = ''; this.alt = ''; this.size = 'medium'; this.title = ''; this.author = '';
    this._failed = false;
  }
  updated(changed) { if (changed.has('src')) this._failed = false; }

  _tint() {
    // stable hue from the title so placeholders differ from each other
    let n = 0; for (const c of (this.title || '')) n = (n * 31 + c.charCodeAt(0)) >>> 0;
    return `hsl(${n % 360}, 32%, 38%)`;
  }

  render() {
    const showImg = this.src && !this._failed;
    return html`
      <div class="cover" style="--cover-tint:${this._tint()}">
        ${showImg
          ? html`<img src=${this.src} alt=${this.alt} loading="lazy" @error=${() => { this._failed = true; }}>`
          : html`<div class="placeholder" role="img" aria-label=${this.alt || this.title}><div class="t">${this.title}</div><div class="a">${this.author}</div></div>`}
        <div class="overlay"><slot name="overlay"></slot></div>
      </div>
    `;
  }
}
customElements.define('ol-book-cover', OlBookCover);

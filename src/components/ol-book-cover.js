import { LitElement, html, css } from 'lit';

export class OlBookCover extends LitElement {
  static properties = {
    src: { type: String },
    alt: { type: String },
    size: { type: String, reflect: true }
  };

  static styles = css`
    :host {
      display: block;
    }

    .cover {
      position: relative;
      aspect-ratio: 2 / 3;
      overflow: hidden;
      border-radius: var(--radius-image);
      background-color: var(--color-bg-elevated);
    }

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    /* Size variants */
    :host([size="small"]) .cover {
      width: 40px;
    }

    :host([size="medium"]) .cover {
      width: 80px;
    }

    :host([size="large"]) .cover {
      width: 160px;
    }

    :host([size="full"]) .cover {
      width: 100%;
    }
  `;

  constructor() {
    super();
    this.src = '';
    this.alt = '';
    this.size = 'medium';
  }

  render() {
    return html`
      <div class="cover">
        ${this.src
          ? html`<img
              src=${this.src}
              alt=${this.alt}
              loading="lazy"
            >`
          : ''}
      </div>
    `;
  }
}

customElements.define('ol-book-cover', OlBookCover);

import { LitElement, html, css } from 'lit';

/**
 * A tab panel element for use within ol-tab-group
 *
 * @element ol-tab-panel
 *
 * @prop {string} name - Unique name that matches an ol-tab's panel attribute
 * @prop {boolean} active - Whether the panel is currently visible
 *
 * @slot - Panel content
 *
 * @example
 * <ol-tab-panel name="general">
 *   This is the general tab panel content.
 * </ol-tab-panel>
 */
export class OlTabPanel extends LitElement {
  static properties = {
    name: { type: String, reflect: true },
    active: { type: Boolean, reflect: true }
  };

  static styles = css`
    :host {
      display: block;
    }

    :host(:not([active])) {
      display: none;
    }

    :host(:focus) {
      outline: none;
    }

    .panel {
      padding: var(--spacing-4);
    }
  `;

  constructor() {
    super();
    this.name = '';
    this.active = false;
  }

  connectedCallback() {
    super.connectedCallback();
    this.setAttribute('role', 'tabpanel');
  }

  updated(changedProperties) {
    super.updated(changedProperties);

    if (changedProperties.has('name')) {
      this.id = this.name;
      this.setAttribute('aria-labelledby', `tab-${this.name}`);
    }

    if (changedProperties.has('active')) {
      this.setAttribute('tabindex', this.active ? '0' : '-1');
    }
  }

  render() {
    return html`
      <div class="panel">
        <slot></slot>
      </div>
    `;
  }
}

customElements.define('ol-tab-panel', OlTabPanel);

import { LitElement, html, css } from 'lit';

/**
 * A tab group container that manages tabs and panels
 *
 * @element ol-tab-group
 *
 * @prop {string} active - The name of the currently active panel
 * @prop {string} placement - Tab position: 'top', 'bottom', 'start', 'end' (default: 'top')
 * @prop {string} activation - Tab activation mode: 'auto' or 'manual' (default: 'auto')
 *
 * @slot nav - Slot for ol-tab elements (automatically assigned by ol-tab)
 * @slot - Default slot for ol-tab-panel elements
 *
 * @fires ol-tab-show - Emitted when a tab panel is shown
 * @fires ol-tab-hide - Emitted when a tab panel is hidden
 *
 * @example
 * <ol-tab-group active="general">
 *   <ol-tab panel="general">General</ol-tab>
 *   <ol-tab panel="custom">Custom</ol-tab>
 *   <ol-tab panel="advanced">Advanced</ol-tab>
 *
 *   <ol-tab-panel name="general">This is the general tab panel.</ol-tab-panel>
 *   <ol-tab-panel name="custom">This is the custom tab panel.</ol-tab-panel>
 *   <ol-tab-panel name="advanced">This is the advanced tab panel.</ol-tab-panel>
 * </ol-tab-group>
 */
export class OlTabGroup extends LitElement {
  static properties = {
    active: { type: String, reflect: true },
    placement: { type: String, reflect: true },
    activation: { type: String, reflect: true }
  };

  static styles = css`
    :host {
      display: block;
    }

    .tab-group {
      display: flex;
      flex-direction: column;
    }

    /* Placement variants */
    :host([placement="bottom"]) .tab-group {
      flex-direction: column-reverse;
    }

    :host([placement="start"]) .tab-group {
      flex-direction: row;
    }

    :host([placement="end"]) .tab-group {
      flex-direction: row-reverse;
    }

    .nav {
      display: flex;
      overflow-x: auto;
      scrollbar-width: thin;
      border-bottom: var(--border-width-1, 1px) solid var(--color-border);
    }

    :host([placement="bottom"]) .nav {
      border-bottom: none;
      border-top: var(--border-width-1, 1px) solid var(--color-border);
    }

    :host([placement="start"]) .nav,
    :host([placement="end"]) .nav {
      flex-direction: column;
      border-bottom: none;
      overflow-x: visible;
      overflow-y: auto;
    }

    :host([placement="start"]) .nav {
      border-right: var(--border-width-1, 1px) solid var(--color-border);
    }

    :host([placement="end"]) .nav {
      border-left: var(--border-width-1, 1px) solid var(--color-border);
    }

    .body {
      flex: 1;
    }
  `;

  constructor() {
    super();
    this.active = '';
    this.placement = 'top';
    this.activation = 'auto';
    this._handleTabSelect = this._handleTabSelect.bind(this);
    this._handleKeyDown = this._handleKeyDown.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('ol-tab-select', this._handleTabSelect);
    this.addEventListener('keydown', this._handleKeyDown);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('ol-tab-select', this._handleTabSelect);
    this.removeEventListener('keydown', this._handleKeyDown);
  }

  firstUpdated() {
    // Set initial active tab if not specified
    if (!this.active) {
      const firstTab = this._getTabs()[0];
      if (firstTab && !firstTab.disabled) {
        this.active = firstTab.panel;
      }
    }
    this._updateActiveState();
  }

  updated(changedProperties) {
    super.updated(changedProperties);
    if (changedProperties.has('active') || changedProperties.has('placement')) {
      this._updateActiveState();
    }
  }

  /**
   * Get all tab elements
   * @returns {Array<Element>}
   */
  _getTabs() {
    const slot = this.shadowRoot?.querySelector('slot[name="nav"]');
    if (!slot) return [];
    return slot.assignedElements().filter(el => el.tagName === 'OL-TAB');
  }

  /**
   * Get all panel elements
   * @returns {Array<Element>}
   */
  _getPanels() {
    const slot = this.shadowRoot?.querySelector('slot:not([name])');
    if (!slot) return [];
    return slot.assignedElements().filter(el => el.tagName === 'OL-TAB-PANEL');
  }

  /**
   * Update the active state of tabs and panels
   */
  _updateActiveState() {
    const tabs = this._getTabs();
    const panels = this._getPanels();

    tabs.forEach(tab => {
      const isActive = tab.panel === this.active;
      tab.active = isActive;
      tab.placement = this.placement;
      tab.id = `tab-${tab.panel}`;
    });

    panels.forEach(panel => {
      const wasActive = panel.active;
      const isActive = panel.name === this.active;
      panel.active = isActive;

      // Fire events for show/hide
      if (isActive && !wasActive) {
        this.dispatchEvent(new CustomEvent('ol-tab-show', {
          detail: { name: panel.name },
          bubbles: true,
          composed: true
        }));
      } else if (!isActive && wasActive) {
        this.dispatchEvent(new CustomEvent('ol-tab-hide', {
          detail: { name: panel.name },
          bubbles: true,
          composed: true
        }));
      }
    });
  }

  /**
   * Handle tab selection from child ol-tab elements
   * @param {CustomEvent} event
   */
  _handleTabSelect(event) {
    const { panel } = event.detail;
    if (panel && panel !== this.active) {
      this.active = panel;
    }
  }

  /**
   * Handle keyboard navigation
   * @param {KeyboardEvent} event
   */
  _handleKeyDown(event) {
    // Only handle keyboard navigation when focus is on a tab element
    // This prevents intercepting arrow keys from other components (e.g., search inputs)
    const target = event.composedPath()[0];
    const isTabFocused = target?.tagName === 'OL-TAB';
    if (!isTabFocused) return;

    const tabs = this._getTabs().filter(tab => !tab.disabled);
    if (tabs.length === 0) return;

    const currentIndex = tabs.findIndex(tab => tab.panel === this.active);
    if (currentIndex === -1) return;

    // Determine navigation direction based on placement
    const isVertical = this.placement === 'start' || this.placement === 'end';
    const isRTL = getComputedStyle(this).direction === 'rtl';

    let nextIndex = currentIndex;
    let shouldNavigate = false;

    switch (event.key) {
      case 'ArrowLeft':
        if (!isVertical) {
          nextIndex = isRTL ? currentIndex + 1 : currentIndex - 1;
          shouldNavigate = true;
        }
        break;
      case 'ArrowRight':
        if (!isVertical) {
          nextIndex = isRTL ? currentIndex - 1 : currentIndex + 1;
          shouldNavigate = true;
        }
        break;
      case 'ArrowUp':
        if (isVertical) {
          nextIndex = currentIndex - 1;
          shouldNavigate = true;
        }
        break;
      case 'ArrowDown':
        if (isVertical) {
          nextIndex = currentIndex + 1;
          shouldNavigate = true;
        }
        break;
      case 'Home':
        nextIndex = 0;
        shouldNavigate = true;
        break;
      case 'End':
        nextIndex = tabs.length - 1;
        shouldNavigate = true;
        break;
      case 'Enter':
      case ' ':
        if (this.activation === 'manual') {
          event.preventDefault();
          this.active = tabs[currentIndex].panel;
        }
        return;
      default:
        return;
    }

    if (!shouldNavigate) return;

    event.preventDefault();

    // Wrap around
    if (nextIndex < 0) {
      nextIndex = tabs.length - 1;
    } else if (nextIndex >= tabs.length) {
      nextIndex = 0;
    }

    const nextTab = tabs[nextIndex];
    nextTab.focus();

    // Auto activation: switch tab immediately on focus
    if (this.activation === 'auto') {
      this.active = nextTab.panel;
    }
  }

  /**
   * Show a specific tab panel by name
   * @param {string} panelName - The name of the panel to show
   */
  show(panelName) {
    const tabs = this._getTabs();
    const tab = tabs.find(t => t.panel === panelName);
    if (tab && !tab.disabled) {
      this.active = panelName;
    }
  }

  render() {
    return html`
      <div class="tab-group" role="tablist" aria-label="Tabs">
        <div class="nav" part="nav">
          <slot name="nav"></slot>
        </div>
        <div class="body" part="body">
          <slot @slotchange=${this._updateActiveState}></slot>
        </div>
      </div>
    `;
  }
}

customElements.define('ol-tab-group', OlTabGroup);

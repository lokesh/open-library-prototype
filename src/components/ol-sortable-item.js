import { LitElement, html, css } from 'lit';

/**
 * A sortable list item with a drag handle
 *
 * @element ol-sortable-item
 *
 * @prop {boolean} dragging - Whether the item is currently being dragged
 *
 * @slot - Free-form content (text, images, inputs, buttons, etc.)
 *
 * @example
 * <ol-sortable-item>
 *   <span>Item content here</span>
 * </ol-sortable-item>
 */
export class OlSortableItem extends LitElement {
  static properties = {
    dragging: { type: Boolean, reflect: true },
    _dropPosition: { type: String, state: true }
  };

  static styles = css`
    :host {
      display: block;
    }

    :host([dragging]) {
      opacity: 0.4;
    }

    .item-wrapper {
      position: relative;
      /* Add padding for larger drop target area */
      padding: var(--sortable-drop-zone-size, 6px) 0;
      margin: calc(-1 * var(--sortable-drop-zone-size, 6px)) 0;
    }

    /* Drop zone indicators - visual line */
    .drop-zone {
      position: absolute;
      left: 0;
      right: 0;
      height: 4px;
      background: var(--color-brand-primary);
      border-radius: 2px;
      pointer-events: none;
      display: none;
    }

    .drop-zone.before {
      top: 2px;
    }

    .drop-zone.after {
      bottom: 2px;
    }

    :host([data-drop="before"]) .drop-zone.before,
    :host([data-drop="after"]) .drop-zone.after {
      display: block;
    }

    .item {
      display: flex;
      align-items: center;
      gap: var(--spacing-3);
      padding: var(--spacing-3);
      background: var(--color-bg-elevated);
      border: var(--border-control);
      border-radius: var(--radius-button);
    }

    :host([dragging]) .item {
      border-color: var(--color-brand-primary);
    }

    .drag-handle {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: var(--spacing-2);
      cursor: grab;
      touch-action: none;
      color: var(--color-text-secondary);
      border: none;
      background: transparent;
      border-radius: var(--radius-button);
      flex-shrink: 0;
    }

    .drag-handle:hover {
      color: var(--color-text);
      background: var(--color-bg-hovered);
    }

    .drag-handle:focus-visible {
      outline: var(--focus-ring-width) solid var(--color-border-focused);
      outline-offset: 2px;
    }

    .drag-handle:active {
      cursor: grabbing;
    }

    .drag-handle-icon {
      display: flex;
      flex-direction: column;
      gap: 3px;
    }

    .drag-handle-icon span {
      display: block;
      width: 14px;
      height: 2px;
      background: currentColor;
      border-radius: 1px;
    }

    .content {
      flex: 1;
      min-width: 0;
    }
  `;

  constructor() {
    super();
    this.dragging = false;
    this._dropPosition = null;
    this._handleKeyDown = this._handleKeyDown.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    this.setAttribute('role', 'listitem');
  }

  /**
   * Set the drop indicator position
   * @param {string|null} position - 'before', 'after', or null
   */
  setDropPosition(position) {
    this._dropPosition = position;
    if (position) {
      this.setAttribute('data-drop', position);
    } else {
      this.removeAttribute('data-drop');
    }
  }

  /**
   * Get the index of this item within its parent list
   * @returns {number}
   */
  getIndex() {
    const parent = this.closest('ol-sortable-list');
    if (!parent) return -1;
    const items = Array.from(parent.querySelectorAll('ol-sortable-item'));
    return items.indexOf(this);
  }

  /**
   * Handle keyboard events for reordering
   * @param {KeyboardEvent} event
   */
  _handleKeyDown(event) {
    if (!event.altKey) return;

    const parent = this.closest('ol-sortable-list');
    if (!parent) return;

    const currentIndex = this.getIndex();
    let newIndex = currentIndex;

    if (event.key === 'ArrowUp' && currentIndex > 0) {
      newIndex = currentIndex - 1;
    } else if (event.key === 'ArrowDown') {
      const items = parent.querySelectorAll('ol-sortable-item');
      if (currentIndex < items.length - 1) {
        newIndex = currentIndex + 1;
      }
    } else {
      return;
    }

    if (newIndex !== currentIndex) {
      event.preventDefault();
      parent._moveItem(currentIndex, newIndex);

      requestAnimationFrame(() => {
        const items = parent.querySelectorAll('ol-sortable-item');
        const movedItem = items[newIndex];
        if (movedItem) {
          const handle = movedItem.shadowRoot?.querySelector('.drag-handle');
          handle?.focus();
        }
      });
    }
  }

  /**
   * Handle drag start
   * @param {DragEvent} event
   */
  _handleDragStart(event) {
    this.dragging = true;
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', this.getIndex().toString());

    this.dispatchEvent(new CustomEvent('ol-drag-start', {
      detail: { index: this.getIndex() },
      bubbles: true,
      composed: true
    }));
  }

  /**
   * Handle drag end
   */
  _handleDragEnd() {
    this.dragging = false;

    this.dispatchEvent(new CustomEvent('ol-drag-end', {
      bubbles: true,
      composed: true
    }));
  }

  /**
   * Handle drag over
   * @param {DragEvent} event
   */
  _handleDragOver(event) {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';

    if (this.dragging) return;

    const rect = this.getBoundingClientRect();
    const midpoint = rect.top + rect.height / 2;
    const position = event.clientY < midpoint ? 'before' : 'after';

    this.setDropPosition(position);

    this.dispatchEvent(new CustomEvent('ol-item-dragover', {
      detail: { 
        index: this.getIndex(),
        position: position
      },
      bubbles: true,
      composed: true
    }));
  }

  /**
   * Handle drag leave
   * @param {DragEvent} event
   */
  _handleDragLeave(event) {
    const rect = this.getBoundingClientRect();
    if (
      event.clientX < rect.left ||
      event.clientX > rect.right ||
      event.clientY < rect.top ||
      event.clientY > rect.bottom
    ) {
      this.setDropPosition(null);
    }
  }

  /**
   * Handle drop
   * @param {DragEvent} event
   */
  _handleDrop(event) {
    event.preventDefault();
    event.stopPropagation();

    const position = this._dropPosition;
    this.setDropPosition(null);

    const fromIndex = parseInt(event.dataTransfer.getData('text/plain'), 10);
    if (isNaN(fromIndex)) return;

    let toIndex = this.getIndex();

    // Calculate final position based on where we're dropping
    if (position === 'after') {
      toIndex += 1;
    }

    // Adjust if dragging from before this position
    if (fromIndex < toIndex) {
      toIndex -= 1;
    }

    const parent = this.closest('ol-sortable-list');
    if (parent) {
      const items = parent.querySelectorAll('ol-sortable-item');
      toIndex = Math.max(0, Math.min(toIndex, items.length - 1));
    }

    if (fromIndex !== toIndex) {
      this.dispatchEvent(new CustomEvent('ol-drop', {
        detail: { fromIndex, toIndex },
        bubbles: true,
        composed: true
      }));
    }
  }

  /**
   * Handle touch start for mobile drag
   * @param {TouchEvent} event
   */
  _handleTouchStart(event) {
    this._touchStartY = event.touches[0].clientY;
    this._touchStartIndex = this.getIndex();
    this._touchActive = false;

    this._touchTimer = setTimeout(() => {
      this._touchActive = true;
      this.dragging = true;
      this.dispatchEvent(new CustomEvent('ol-drag-start', {
        detail: { index: this._touchStartIndex },
        bubbles: true,
        composed: true
      }));
    }, 200);
  }

  /**
   * Handle touch move for mobile drag
   * @param {TouchEvent} event
   */
  _handleTouchMove(event) {
    if (this._touchTimer) {
      clearTimeout(this._touchTimer);
      this._touchTimer = null;
    }

    if (!this._touchActive) return;
    event.preventDefault();

    const touch = event.touches[0];
    const parent = this.closest('ol-sortable-list');
    if (!parent) return;

    const items = Array.from(parent.querySelectorAll('ol-sortable-item'));
    
    // Clear all drop positions first
    items.forEach(item => item.setDropPosition(null));

    // Find item under touch point
    for (const item of items) {
      if (item === this) continue;

      const rect = item.getBoundingClientRect();
      if (touch.clientY >= rect.top && touch.clientY <= rect.bottom) {
        const midpoint = rect.top + rect.height / 2;
        const position = touch.clientY < midpoint ? 'before' : 'after';
        item.setDropPosition(position);
        this._touchTargetItem = item;
        this._touchTargetPosition = position;
        break;
      }
    }
  }

  /**
   * Handle touch end for mobile drag
   */
  _handleTouchEnd() {
    if (this._touchTimer) {
      clearTimeout(this._touchTimer);
      this._touchTimer = null;
    }

    if (!this._touchActive) return;

    this.dragging = false;
    this._touchActive = false;

    const parent = this.closest('ol-sortable-list');
    if (!parent) return;

    // Clear all drop indicators
    const items = Array.from(parent.querySelectorAll('ol-sortable-item'));
    items.forEach(item => item.setDropPosition(null));

    if (this._touchTargetItem) {
      const fromIndex = this._touchStartIndex;
      let toIndex = this._touchTargetItem.getIndex();

      if (this._touchTargetPosition === 'after') {
        toIndex += 1;
      }

      if (fromIndex < toIndex) {
        toIndex -= 1;
      }

      toIndex = Math.max(0, Math.min(toIndex, items.length - 1));

      if (fromIndex !== toIndex) {
        this.dispatchEvent(new CustomEvent('ol-drop', {
          detail: { fromIndex, toIndex },
          bubbles: true,
          composed: true
        }));
      }

      this._touchTargetItem = null;
      this._touchTargetPosition = null;
    }

    this.dispatchEvent(new CustomEvent('ol-drag-end', {
      bubbles: true,
      composed: true
    }));
  }

  render() {
    return html`
      <div class="item-wrapper">
        <div class="drop-zone before"></div>
        <div
          class="item"
          draggable="true"
          @dragstart=${this._handleDragStart}
          @dragend=${this._handleDragEnd}
          @dragover=${this._handleDragOver}
          @dragleave=${this._handleDragLeave}
          @drop=${this._handleDrop}
        >
          <button
            class="drag-handle"
            type="button"
            aria-label="Drag to reorder, or use Alt+Arrow keys"
            @keydown=${this._handleKeyDown}
            @touchstart=${this._handleTouchStart}
            @touchmove=${this._handleTouchMove}
            @touchend=${this._handleTouchEnd}
          >
            <span class="drag-handle-icon" aria-hidden="true">
              <span></span>
              <span></span>
              <span></span>
            </span>
          </button>
          <div class="content">
            <slot></slot>
          </div>
        </div>
        <div class="drop-zone after"></div>
      </div>
    `;
  }
}

customElements.define('ol-sortable-item', OlSortableItem);

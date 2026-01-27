import { LitElement, html, css } from 'lit';

/**
 * A sortable list container that manages draggable items
 *
 * @element ol-sortable-list
 *
 * @slot - Slot for ol-sortable-item elements
 *
 * @fires ol-sort - Emitted when items are reordered, with { oldIndex, newIndex } detail
 *
 * @example
 * <ol-sortable-list>
 *   <ol-sortable-item>First item</ol-sortable-item>
 *   <ol-sortable-item>Second item</ol-sortable-item>
 *   <ol-sortable-item>Third item</ol-sortable-item>
 * </ol-sortable-list>
 */
export class OlSortableList extends LitElement {
  static styles = css`
    :host {
      display: block;
      /* Customize drop zone hit area size */
      --sortable-drop-zone-size: 8px;
    }

    .list {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-3);
      /* Contain the negative margins from items */
      padding: var(--sortable-drop-zone-size) 0;
    }
  `;

  constructor() {
    super();
    this._handleDrop = this._handleDrop.bind(this);
    this._handleDragEnd = this._handleDragEnd.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    this.setAttribute('role', 'list');
    this.addEventListener('ol-drop', this._handleDrop);
    this.addEventListener('ol-drag-end', this._handleDragEnd);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('ol-drop', this._handleDrop);
    this.removeEventListener('ol-drag-end', this._handleDragEnd);
  }

  /**
   * Get all sortable items
   * @returns {Array<Element>}
   */
  _getItems() {
    return Array.from(this.querySelectorAll('ol-sortable-item'));
  }

  /**
   * Clear all drop indicators
   */
  _clearDropIndicators() {
    this._getItems().forEach(item => item.setDropPosition(null));
  }

  /**
   * Handle drag end - clear all states
   */
  _handleDragEnd() {
    this._clearDropIndicators();
  }

  /**
   * Handle drop event from child items
   * @param {CustomEvent} event
   */
  _handleDrop(event) {
    event.stopPropagation();
    const { fromIndex, toIndex } = event.detail;
    this._clearDropIndicators();
    this._moveItem(fromIndex, toIndex);
  }

  /**
   * Move an item from one position to another
   * @param {number} fromIndex - The current index of the item
   * @param {number} toIndex - The target index
   */
  _moveItem(fromIndex, toIndex) {
    const items = this._getItems();

    if (fromIndex < 0 || fromIndex >= items.length) return;
    if (toIndex < 0 || toIndex >= items.length) return;
    if (fromIndex === toIndex) return;

    const itemToMove = items[fromIndex];
    const targetItem = items[toIndex];

    if (fromIndex < toIndex) {
      targetItem.after(itemToMove);
    } else {
      targetItem.before(itemToMove);
    }

    this.dispatchEvent(new CustomEvent('ol-sort', {
      detail: {
        oldIndex: fromIndex,
        newIndex: toIndex
      },
      bubbles: true,
      composed: true
    }));
  }

  /**
   * Get the current order of items
   * @returns {Array<Element>}
   */
  getOrder() {
    return this._getItems();
  }

  render() {
    return html`
      <div class="list">
        <slot></slot>
      </div>
    `;
  }
}

customElements.define('ol-sortable-list', OlSortableList);

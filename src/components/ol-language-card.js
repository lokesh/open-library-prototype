import { LitElement, html, svg, css } from 'lit';
import userRoleService from '../user-role-service.js';

export class OlLanguageCard extends LitElement {
  static properties = {
    languages: { type: Array },
    _editing: { type: Boolean, state: true },
    _isLibrarian: { type: Boolean, state: true },
    _editLanguages: { type: Array, state: true },
  };

  static styles = css`
    :host {
      display: flex;
    }

    .card {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: var(--spacing-1);
      padding: var(--spacing-4) var(--spacing-3);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-card);
      position: relative;
      width: 100%;
      box-sizing: border-box;
    }

    .card.editing {
      align-items: stretch;
      text-align: left;
    }

    .label {
      font-size: var(--body-font-size-sm);
      color: var(--color-text-secondary);
    }

    .value {
      font-size: var(--body-font-size-lg);
      font-weight: var(--font-weight-semibold);
      color: var(--color-text);
      line-height: var(--line-height-tight);
    }

    .value a {
      color: var(--color-link);
      text-decoration: none;
    }

    .value a:hover {
      text-decoration: underline;
    }

    .edit-trigger {
      position: absolute;
      top: var(--spacing-2);
      right: var(--spacing-2);
      background: none;
      border: none;
      color: var(--color-text-secondary);
      cursor: pointer;
      padding: 4px;
      border-radius: var(--radius-1);
      opacity: 0;
      transition: opacity 150ms ease;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .card:hover .edit-trigger {
      opacity: 1;
    }

    .edit-trigger:hover {
      color: var(--color-text);
      background: var(--color-bg-hovered);
    }

    .edit-trigger:focus-visible {
      opacity: 1;
      outline: var(--focus-ring-width) solid var(--focus-ring-color);
      outline-offset: 2px;
    }

    .edit-trigger svg {
      width: 14px;
      height: 14px;
    }

    /* ─── Edit mode ─── */

    .edit-fields {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-2);
      width: 100%;
      margin-top: var(--spacing-2);
    }

    .edit-row {
      display: flex;
      align-items: center;
      gap: var(--spacing-2);
    }

    .edit-row input {
      flex: 1;
      padding: var(--spacing-2);
      font-size: var(--body-font-size-sm);
      font-family: var(--body-font-family);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-1);
      background: var(--color-bg-primary-input, var(--color-bg));
      color: var(--color-text);
    }

    .edit-row input:focus {
      outline: var(--focus-ring-width) solid var(--focus-ring-color);
      outline-offset: 1px;
      border-color: var(--color-border-focused);
    }

    .remove-btn {
      background: none;
      border: none;
      color: var(--color-text-secondary);
      cursor: pointer;
      padding: 4px;
      border-radius: var(--radius-1);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .remove-btn:hover {
      color: var(--color-text);
      background: var(--color-bg-hovered);
    }

    .remove-btn svg {
      width: 16px;
      height: 16px;
    }

    .add-link {
      background: none;
      border: none;
      color: var(--color-link);
      cursor: pointer;
      font-size: var(--body-font-size-sm);
      font-family: var(--body-font-family);
      padding: var(--spacing-1) 0;
      text-align: left;
    }

    .add-link:hover {
      text-decoration: underline;
    }

    .edit-actions {
      display: flex;
      gap: var(--spacing-2);
      margin-top: var(--spacing-2);
      justify-content: flex-start;
    }

    .edit-actions button {
      padding: var(--spacing-1) var(--spacing-3);
      font-size: var(--body-font-size-sm);
      font-family: var(--body-font-family);
      border-radius: var(--radius-button, var(--radius-1));
      cursor: pointer;
      border: 1px solid var(--color-border);
    }

    .save-btn {
      background: var(--color-bg-primary);
      color: var(--color-text-on-primary);
      border-color: var(--color-bg-primary) !important;
    }

    .save-btn:hover {
      background: var(--color-bg-primary-hovered);
    }

    .cancel-btn {
      background: transparent;
      color: var(--color-text);
    }

    .cancel-btn:hover {
      background: var(--color-bg-hovered);
    }
  `;

  constructor() {
    super();
    this.languages = [];
    this._editing = false;
    this._isLibrarian = userRoleService.isLibrarian;
    this._editLanguages = [];
    this._handleRoleChange = this._handleRoleChange.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    document.addEventListener('ol-role-change', this._handleRoleChange);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('ol-role-change', this._handleRoleChange);
  }

  _handleRoleChange(e) {
    this._isLibrarian = e.detail.role === 'librarian';
    if (!this._isLibrarian && this._editing) {
      this._cancelEdit();
    }
  }

  _startEdit() {
    this._editLanguages = [...this.languages];
    this._editing = true;
  }

  _cancelEdit() {
    this._editing = false;
    this._editLanguages = [];
  }

  _saveEdit() {
    const filtered = this._editLanguages
      .map(l => l.trim())
      .filter(l => l.length > 0);
    if (filtered.length === 0) return;
    this.languages = filtered;
    this._editing = false;
    this._editLanguages = [];
    this.dispatchEvent(new CustomEvent('ol-language-change', {
      detail: { languages: this.languages },
      bubbles: true,
      composed: true,
    }));
  }

  _updateLanguage(index, value) {
    this._editLanguages = this._editLanguages.map((l, i) => i === index ? value : l);
  }

  _removeLanguage(index) {
    this._editLanguages = this._editLanguages.filter((_, i) => i !== index);
  }

  _addLanguage() {
    this._editLanguages = [...this._editLanguages, ''];
  }

  _renderPencilIcon() {
    return html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      ${svg`<path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>`}
    </svg>`;
  }

  _renderXIcon() {
    return html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      ${svg`<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>`}
    </svg>`;
  }

  _renderReadMode() {
    const langDisplay = this.languages.length > 0
      ? this.languages.map((lang, i) => html`${i > 0 ? ', ' : ''}<a href="search.html?language=${encodeURIComponent(lang)}">${lang}</a>`)
      : 'Unknown';

    return html`
      <div class="card">
        ${this._isLibrarian ? html`
          <button class="edit-trigger" @click="${this._startEdit}" aria-label="Edit languages">
            ${this._renderPencilIcon()}
          </button>
        ` : ''}
        <span class="label">Language</span>
        <span class="value">${langDisplay}</span>
      </div>
    `;
  }

  _renderEditMode() {
    return html`
      <div class="card editing">
        <span class="label">Language</span>
        <div class="edit-fields">
          ${this._editLanguages.map((lang, i) => html`
            <div class="edit-row">
              <input
                type="text"
                .value="${lang}"
                @input="${(e) => this._updateLanguage(i, e.target.value)}"
                placeholder="Language name"
              />
              ${this._editLanguages.length > 1 ? html`
                <button class="remove-btn" @click="${() => this._removeLanguage(i)}" aria-label="Remove language">
                  ${this._renderXIcon()}
                </button>
              ` : ''}
            </div>
          `)}
          <button class="add-link" @click="${this._addLanguage}">+ Add another language</button>
        </div>
        <div class="edit-actions">
          <button class="save-btn" @click="${this._saveEdit}">Save</button>
          <button class="cancel-btn" @click="${this._cancelEdit}">Cancel</button>
        </div>
      </div>
    `;
  }

  render() {
    return this._editing ? this._renderEditMode() : this._renderReadMode();
  }
}

customElements.define('ol-language-card', OlLanguageCard);

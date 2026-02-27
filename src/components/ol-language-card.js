import { LitElement, html, svg, css, nothing } from 'lit';
import userRoleService from '../user-role-service.js';

export class OlLanguageCard extends LitElement {
  static properties = {
    languages: { type: Array },
    bookTitle: { type: String, attribute: 'book-title' },
    bookAuthor: { type: String, attribute: 'book-author' },
    publishDate: { type: String, attribute: 'publish-date' },
    _editing: { type: Boolean, state: true },
    _isLibrarian: { type: Boolean, state: true },
    _editLanguages: { type: Array, state: true },
    _originalLanguages: { type: Array, state: true },
    _showAddComment: { type: Boolean, state: true },
    _commentModalOpen: { type: Boolean, state: true },
    _commentText: { type: String, state: true },
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

    @media (max-width: 767px) {
      .edit-trigger {
        opacity: 1;
      }
    }

    /* ─── Add Comment button ─── */

    .add-comment-btn {
      background: none;
      border: none;
      color: var(--color-link);
      text-decoration: underline;
      font-size: var(--body-font-size-sm);
      font-family: var(--body-font-family);
      cursor: pointer;
      padding: var(--spacing-1) var(--spacing-2);
      margin-top: var(--spacing-1);
    }

    .add-comment-btn:hover {
      color: var(--color-text);
    }

    .add-comment-btn:focus-visible {
      outline: var(--focus-ring-width) solid var(--focus-ring-color);
      outline-offset: 2px;
      border-radius: var(--radius-sm);
    }

    @media (max-width: 767px) {
      .add-comment-btn {
        padding: var(--spacing-2);
      }
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

    /* ─── Comment Modal ─── */

    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: var(--z-index-modal, 2000);
      display: flex;
      align-items: flex-start;
      justify-content: center;
      padding-top: 10vh;
    }

    @media (max-width: 767px) {
      .modal-backdrop {
        padding-top: 0;
        align-items: stretch;
      }
    }

    .modal {
      background: var(--color-bg-elevated);
      border-radius: var(--radius-overlay);
      border: 1px solid var(--color-border);
      width: 100%;
      max-width: 480px;
      max-height: 80vh;
      display: flex;
      flex-direction: column;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      overflow: hidden;
    }

    @media (max-width: 767px) {
      .modal {
        max-width: none;
        max-height: none;
        height: 100dvh;
        border-radius: 0;
        border: none;
      }
    }

    .modal-header {
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      padding: var(--spacing-4);
      border-bottom: 1px solid var(--color-border-subtle);
      flex-shrink: 0;
    }

    .modal-title {
      font-size: var(--body-font-size);
      font-weight: var(--font-weight-semibold);
      color: var(--color-text-strong);
      margin: 0;
    }

    .close-btn {
      position: absolute;
      right: var(--spacing-3);
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      background: none;
      border: none;
      border-radius: var(--radius-button);
      color: var(--color-text-secondary);
      cursor: pointer;
      flex-shrink: 0;
    }

    .close-btn:hover {
      background: var(--color-bg-hovered);
      color: var(--color-text);
    }

    .close-btn:focus-visible {
      outline: var(--focus-ring-width) solid var(--focus-ring-color);
      outline-offset: 2px;
    }

    .close-btn svg {
      width: 20px;
      height: 20px;
    }

    .modal-body {
      flex: 1;
      overflow-y: auto;
      min-height: 0;
      padding: var(--spacing-4);
      display: flex;
      flex-direction: column;
      gap: var(--spacing-4);
    }

    .book-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .book-info-title {
      font-family: var(--heading-font-family);
      font-weight: var(--heading-font-weight);
      line-height: var(--heading-line-height);
      color: var(--color-text);
    }

    .book-info-author {
      font-size: var(--body-font-size-sm);
      color: var(--color-text-secondary);
    }

    .change-summary {
      background: var(--color-bg-secondary);
      border-radius: var(--radius-1);
      font-size: var(--body-font-size-sm);
      color: var(--color-text-secondary);
      display: flex;
      flex-direction: column;
      gap: var(--spacing-1);
    }

    .change-summary strong {
      color: var(--color-text);
      font-weight: var(--font-weight-semibold);
    }

    .change-arrow {
      color: var(--color-text-tertiary);
    }

    .comment-textarea {
      width: 100%;
      min-height: 100px;
      padding: var(--spacing-2);
      font-size: var(--body-font-size-sm);
      font-family: var(--body-font-family);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-input);
      background: var(--color-bg-primary-input, var(--color-bg));
      color: var(--color-text);
      resize: vertical;
      box-sizing: border-box;
    }

    .comment-textarea:focus {
      outline: var(--focus-ring-width) solid var(--focus-ring-color);
      outline-offset: 1px;
      border-color: var(--color-border-focused);
    }

    .comment-textarea::placeholder {
      color: var(--color-text-tertiary);
    }

    .modal-footer {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      padding: var(--spacing-3) var(--spacing-4);
      border-top: 1px solid var(--color-border-subtle);
      flex-shrink: 0;
      gap: var(--spacing-2);
    }

    .modal-cancel-btn {
      background: transparent;
      border: 1px solid var(--color-border);
      font-size: var(--body-font-size-sm);
      font-family: var(--body-font-family);
      font-weight: var(--font-weight-medium);
      color: var(--color-text);
      cursor: pointer;
      padding: var(--spacing-2) var(--spacing-3);
      border-radius: var(--radius-button, var(--radius-1));
    }

    .modal-cancel-btn:hover {
      background: var(--color-bg-hovered);
    }

    .modal-cancel-btn:focus-visible {
      outline: var(--focus-ring-width) solid var(--focus-ring-color);
      outline-offset: 2px;
    }

    .modal-submit-btn {
      background: var(--color-bg-primary);
      color: var(--color-text-on-primary);
      border: none;
      border-radius: var(--radius-button, var(--radius-1));
      font-size: var(--body-font-size-sm);
      font-family: var(--body-font-family);
      font-weight: var(--font-weight-semibold);
      padding: var(--spacing-2) var(--spacing-4);
      cursor: pointer;
    }

    .modal-submit-btn:hover {
      background: var(--color-bg-primary-hovered);
    }

    .modal-submit-btn:focus-visible {
      outline: var(--focus-ring-width) solid var(--focus-ring-color);
      outline-offset: 2px;
    }
  `;

  constructor() {
    super();
    this.languages = [];
    this.bookTitle = '';
    this.bookAuthor = '';
    this.publishDate = '';
    this._editing = false;
    this._isLibrarian = userRoleService.isLibrarian;
    this._editLanguages = [];
    this._originalLanguages = [];
    this._showAddComment = false;
    this._commentModalOpen = false;
    this._commentText = '';
    this._previousFocus = null;
    this._handleRoleChange = this._handleRoleChange.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    document.addEventListener('ol-role-change', this._handleRoleChange);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('ol-role-change', this._handleRoleChange);
    if (this._commentModalOpen) {
      this._unlockScroll();
    }
  }

  _handleRoleChange(e) {
    this._isLibrarian = e.detail.role === 'librarian';
    if (!this._isLibrarian && this._editing) {
      this._cancelEdit();
    }
  }

  // ─── Edit logic ─────────────────────────────────

  async _startEdit() {
    this._originalLanguages = [...this.languages];
    this._showAddComment = false;
    this._editLanguages = [...this.languages];
    this._editing = true;

    await this.updateComplete;
    const input = this.shadowRoot.querySelector('.edit-row input');
    if (input) input.focus();
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

    const oldSorted = JSON.stringify([...this._originalLanguages].sort());
    const newSorted = JSON.stringify([...filtered].sort());
    const hasChanged = oldSorted !== newSorted;

    this.languages = filtered;
    this._editing = false;
    this._editLanguages = [];
    this._showAddComment = hasChanged;

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

  // ─── Comment modal logic ────────────────────────

  async _openCommentModal() {
    this._previousFocus = this.shadowRoot.activeElement || document.activeElement;
    this._commentText = '';
    this._commentModalOpen = true;
    this._lockScroll();

    await this.updateComplete;
    const textarea = this.shadowRoot.querySelector('.comment-textarea');
    if (textarea) textarea.focus();
  }

  _closeCommentModal() {
    this._commentModalOpen = false;
    this._unlockScroll();
    if (this._previousFocus && typeof this._previousFocus.focus === 'function') {
      this._previousFocus.focus();
    }
    this._previousFocus = null;
  }

  _submitComment() {
    this.dispatchEvent(new CustomEvent('ol-language-comment', {
      detail: {
        comment: this._commentText,
        previousLanguages: [...this._originalLanguages],
        newLanguages: [...this.languages],
        bookTitle: this.bookTitle,
        bookAuthor: this.bookAuthor,
        publishDate: this.publishDate,
      },
      bubbles: true,
      composed: true,
    }));
    this._showAddComment = false;
    this._closeCommentModal();
  }

  _lockScroll() {
    document.body.style.overflow = 'hidden';
  }

  _unlockScroll() {
    document.body.style.overflow = '';
  }

  _handleBackdropClick(e) {
    if (e.target === e.currentTarget) {
      this._closeCommentModal();
    }
  }

  _handleModalKeydown(e) {
    if (e.key === 'Escape') {
      e.preventDefault();
      this._closeCommentModal();
      return;
    }

    if (e.key === 'Tab') {
      const focusable = this.shadowRoot.querySelectorAll(
        '.modal button:not([disabled]), .modal textarea, .modal [tabindex]:not([tabindex="-1"])'
      );
      const arr = Array.from(focusable).filter(el => el.offsetParent !== null);
      if (!arr.length) return;
      const first = arr[0];
      const last = arr[arr.length - 1];
      if (e.shiftKey && this.shadowRoot.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && this.shadowRoot.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  // ─── Icons ──────────────────────────────────────

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

  // ─── Templates ──────────────────────────────────

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
        ${this._showAddComment ? html`
          <button class="add-comment-btn" @click="${this._openCommentModal}">Add Comment</button>
        ` : nothing}
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

  _renderCommentModal() {
    if (!this._commentModalOpen) return nothing;

    const beforeText = this._originalLanguages.join(', ') || 'None';
    const afterText = this.languages.join(', ') || 'None';

    return html`
      <div class="modal-backdrop" @click="${this._handleBackdropClick}" @keydown="${this._handleModalKeydown}">
        <div class="modal" role="dialog" aria-modal="true" aria-label="Add Comment">
          <div class="modal-header">
            <h2 class="modal-title">Add Comment</h2>
            <button class="close-btn" @click="${this._closeCommentModal}" aria-label="Close">
              ${this._renderXIcon()}
            </button>
          </div>
          <div class="modal-body">
            ${this.bookTitle ? html`
              <div class="book-info">
                <span class="book-info-title">${this.bookTitle}${this.publishDate ? html` <span class="book-info-year">(${this.publishDate.match(/\d{4}/)?.[0] ?? this.publishDate})</span>` : nothing}</span>
                ${this.bookAuthor ? html`<span class="book-info-author">by ${this.bookAuthor}</span>` : nothing}
              </div>
            ` : nothing}
            <div class="change-summary">
              <span><strong>Before:</strong> ${beforeText}</span>
              <span class="change-arrow">\u2193</span>
              <span><strong>After:</strong> ${afterText}</span>
            </div>
            <textarea
              class="comment-textarea"
              placeholder="Why did you make this change?"
              .value="${this._commentText}"
              @input="${(e) => this._commentText = e.target.value}"
            ></textarea>
          </div>
          <div class="modal-footer">
            <button class="modal-cancel-btn" @click="${this._closeCommentModal}">Cancel</button>
            <button class="modal-submit-btn" @click="${this._submitComment}">Submit</button>
          </div>
        </div>
      </div>
    `;
  }

  render() {
    return html`
      ${this._editing ? this._renderEditMode() : this._renderReadMode()}
      ${this._renderCommentModal()}
    `;
  }
}

customElements.define('ol-language-card', OlLanguageCard);

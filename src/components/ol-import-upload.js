import { LitElement, html, css, svg } from 'lit';
import { parseImportFile, validateFile, getProviderName } from '../import-parser-service.js';

const SOURCE_INSTRUCTIONS = {
  goodreads: {
    name: 'Goodreads',
    steps: [
      'Go to goodreads.com and sign in',
      'Click "My Books" in the top navigation',
      'Scroll down and click "Import and Export" in the left sidebar',
      'Click "Export Library" — this will generate a CSV file',
      'Download the CSV file when it\'s ready',
    ],
  },
  storygraph: {
    name: 'StoryGraph',
    steps: [
      'Go to app.thestorygraph.com and sign in',
      'Go to your Profile → Settings',
      'Click "Manage Account" and find "Export Your Data"',
      'Click "Generate Export" and wait for the file',
      'Download the CSV file',
    ],
  },
  librarything: {
    name: 'LibraryThing',
    steps: [
      'Go to librarything.com and sign in',
      'Go to More → Import/Export',
      'Under "Export", choose "Export as tab-delimited"',
      'Download the TSV file',
    ],
  },
};

export class OlImportUpload extends LitElement {
  static properties = {
    source: { type: String },
    _dragOver: { state: true },
    _file: { state: true },
    _parsing: { state: true },
    _error: { state: true },
    _stats: { state: true },
    _books: { state: true },
  };

  static styles = css`
    :host {
      display: block;
    }

    .upload-layout {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--spacing-6);
      align-items: start;
    }

    .instructions {
      padding-top: var(--spacing-2);
    }

    .instructions-title {
      font-weight: var(--font-weight-semibold);
      font-size: var(--font-size-sm);
      color: var(--color-text-strong);
      margin-bottom: var(--spacing-3);
    }

    .instructions ol {
      margin: 0;
      padding-left: var(--spacing-6);
    }

    .instructions li {
      font-size: var(--font-size-sm);
      color: var(--color-text);
      line-height: var(--line-height-relaxed);
      padding-left: var(--spacing-1);
    }

    .instructions li + li {
      margin-top: var(--spacing-1);
    }

    .upload-zone {
      border: 2px dashed var(--color-border);
      border-radius: var(--radius-card);
      padding: var(--spacing-8) var(--spacing-6);
      text-align: center;
      cursor: pointer;
      transition: border-color 0.15s ease, background 0.15s ease;
      background: var(--color-bg-elevated);
    }

    @media (max-width: 600px) {
      .upload-layout {
        grid-template-columns: 1fr;
      }
    }

    .upload-zone:hover,
    .upload-zone.drag-over {
      border-color: var(--color-brand-primary);
      background: var(--color-blue-50);
    }

    .upload-icon {
      width: 48px;
      height: 48px;
      margin: 0 auto var(--spacing-4);
      color: var(--color-text-secondary);
    }

    .drag-over .upload-icon {
      color: var(--color-brand-primary);
    }

    .upload-title {
      font-size: var(--font-size-lg);
      font-weight: var(--font-weight-semibold);
      color: var(--color-text-strong);
      margin-bottom: var(--spacing-2);
    }

    .upload-hint {
      color: var(--color-text-secondary);
      font-size: var(--font-size-sm);
      margin-bottom: var(--spacing-4);
    }

    .upload-hint strong {
      color: var(--color-brand-primary);
      cursor: pointer;
    }

    .file-limit {
      font-size: var(--font-size-xs);
      color: var(--color-text-secondary);
    }

    input[type="file"] {
      display: none;
    }

    /* Error state */
    .error {
      margin-top: var(--spacing-4);
      padding: var(--spacing-3) var(--spacing-4);
      background: var(--color-red-50);
      border: 1px solid var(--color-red-200);
      border-radius: var(--radius-md);
      color: var(--color-red-700);
      font-size: var(--font-size-sm);
      display: flex;
      align-items: flex-start;
      gap: var(--spacing-2);
    }

    .error svg {
      width: 18px;
      height: 18px;
      flex-shrink: 0;
      margin-top: 1px;
    }

    /* Success / stats state */
    .file-info {
      margin-top: var(--spacing-6);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-card);
      background: var(--color-bg-elevated);
      overflow: hidden;
    }

    .file-header {
      display: flex;
      align-items: center;
      gap: var(--spacing-3);
      padding: var(--spacing-4);
      border-bottom: 1px solid var(--color-border-subtle);
    }

    .file-icon {
      width: 36px;
      height: 36px;
      background: var(--color-blue-50);
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--color-brand-primary);
      flex-shrink: 0;
    }

    .file-icon svg {
      width: 20px;
      height: 20px;
    }

    .file-name {
      font-weight: var(--font-weight-semibold);
      color: var(--color-text-strong);
      font-size: var(--font-size-sm);
    }

    .file-size {
      color: var(--color-text-secondary);
      font-size: var(--font-size-xs);
    }

    .file-remove {
      margin-left: auto;
      background: none;
      border: none;
      color: var(--color-text-secondary);
      cursor: pointer;
      padding: var(--spacing-1);
      border-radius: var(--radius-sm);
    }

    .file-remove:hover {
      color: var(--color-text-strong);
      background: var(--color-bg);
    }

    .file-remove svg {
      width: 18px;
      height: 18px;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 1px;
      background: var(--color-border-subtle);
    }

    .stat {
      background: var(--color-bg-elevated);
      padding: var(--spacing-4);
      text-align: center;
    }

    .stat-value {
      font-size: var(--font-size-2xl);
      font-weight: var(--font-weight-bold);
      color: var(--color-text-strong);
      font-family: var(--heading-font-family);
    }

    .stat-label {
      font-size: var(--font-size-xs);
      color: var(--color-text-secondary);
      margin-top: var(--spacing-1);
    }

    /* Parsing state */
    .parsing {
      margin-top: var(--spacing-4);
      text-align: center;
      padding: var(--spacing-4);
      color: var(--color-text-secondary);
      font-size: var(--font-size-sm);
    }

    .parsing-spinner {
      display: inline-block;
      width: 20px;
      height: 20px;
      border: 2px solid var(--color-border);
      border-top-color: var(--color-brand-primary);
      border-radius: var(--radius-full);
      animation: spin 0.6s linear infinite;
      margin-right: var(--spacing-2);
      vertical-align: middle;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* Actions */
    .actions {
      margin-top: var(--spacing-6);
      display: flex;
      justify-content: flex-end;
    }

    /* Parse errors */
    .parse-errors {
      margin-top: var(--spacing-3);
      padding: var(--spacing-3) var(--spacing-4);
      background: var(--color-neutral-100);
      border-radius: var(--radius-md);
      font-size: var(--font-size-xs);
      color: var(--color-text-secondary);
    }

    .parse-errors summary {
      cursor: pointer;
      font-weight: var(--font-weight-medium);
    }

    .parse-errors ul {
      margin: var(--spacing-2) 0 0;
      padding-left: var(--spacing-4);
    }
  `;

  constructor() {
    super();
    this.source = '';
    this._dragOver = false;
    this._file = null;
    this._parsing = false;
    this._error = '';
    this._stats = null;
    this._books = [];
  }

  _onDragOver(e) {
    e.preventDefault();
    this._dragOver = true;
  }

  _onDragLeave() {
    this._dragOver = false;
  }

  _onDrop(e) {
    e.preventDefault();
    this._dragOver = false;
    const file = e.dataTransfer?.files?.[0];
    if (file) this._processFile(file);
  }

  _onFileSelect(e) {
    const file = e.target.files?.[0];
    if (file) this._processFile(file);
    // Reset input so re-selecting same file triggers change
    e.target.value = '';
  }

  _openFilePicker() {
    this.renderRoot.querySelector('#file-input').click();
  }

  async _processFile(file) {
    this._file = file;
    this._error = '';
    this._stats = null;
    this._books = [];

    // Validate
    const validationError = validateFile(file, this.source);
    if (validationError) {
      this._error = validationError;
      return;
    }

    // Parse
    this._parsing = true;
    try {
      const result = await parseImportFile(file, this.source);
      this._parsing = false;

      if (result.errors.length > 0 && result.books.length === 0) {
        this._error = result.errors[0].message;
        return;
      }

      this._books = result.books;
      this._stats = result.stats;
      this._parseErrors = result.errors;
    } catch (err) {
      this._parsing = false;
      this._error = `Failed to read file: ${err.message}`;
    }
  }

  _removeFile() {
    this._file = null;
    this._error = '';
    this._stats = null;
    this._books = [];
  }

  _continue() {
    if (!this._books.length) return;
    this.dispatchEvent(new CustomEvent('ol-import-step-complete', {
      bubbles: true,
      composed: true,
      detail: { step: 1, data: { books: this._books, stats: this._stats } },
    }));
  }

  _formatFileSize(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  render() {
    const providerName = getProviderName(this.source);
    const info = SOURCE_INSTRUCTIONS[this.source];

    return html`
      ${!this._file ? html`
        <div class="upload-layout">
          ${info ? html`
            <div class="instructions">
              <div class="instructions-title">How to export from ${info.name}:</div>
              <ol>
                ${info.steps.map(step => html`<li>${step}</li>`)}
              </ol>
            </div>
          ` : ''}
          <div>
            <div
              class="upload-zone ${this._dragOver ? 'drag-over' : ''}"
              @dragover=${this._onDragOver}
              @dragleave=${this._onDragLeave}
              @drop=${this._onDrop}
              @click=${this._openFilePicker}
            >
              <svg class="upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              <div class="upload-title">Drop your ${providerName} export file here</div>
              <div class="upload-hint">or <strong>click to browse</strong></div>
              <div class="file-limit">${this.source === 'librarything' ? 'TSV' : 'CSV'} file, up to 10MB</div>
            </div>
            <input
              id="file-input"
              type="file"
              accept="${this.source === 'librarything' ? '.tsv,.csv,.txt' : '.csv'}"
              @change=${this._onFileSelect}
            />
          </div>
        </div>
      ` : ''}

      ${this._error ? html`
        <div class="error">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <span>${this._error}</span>
        </div>
        ${this._file ? html`
          <div class="actions">
            <ol-button variant="secondary" @click=${this._removeFile}>Try Another File</ol-button>
          </div>
        ` : ''}
      ` : ''}

      ${this._parsing ? html`
        <div class="parsing">
          <span class="parsing-spinner"></span>
          Reading your ${providerName} export...
        </div>
      ` : ''}

      ${this._stats && this._file ? html`
        <div class="file-info">
          <div class="file-header">
            <div class="file-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
            </div>
            <div>
              <div class="file-name">${this._file.name}</div>
              <div class="file-size">${this._formatFileSize(this._file.size)}</div>
            </div>
            <button class="file-remove" @click=${this._removeFile} aria-label="Remove file">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <div class="stats-grid">
            <div class="stat">
              <div class="stat-value">${this._stats.total}</div>
              <div class="stat-label">Books found</div>
            </div>
            <div class="stat">
              <div class="stat-value">${Object.keys(this._stats.shelves || {}).length}</div>
              <div class="stat-label">Shelves</div>
            </div>
            <div class="stat">
              <div class="stat-value">${this._stats.withRatings}</div>
              <div class="stat-label">With ratings</div>
            </div>
            <div class="stat">
              <div class="stat-value">${this._stats.withReviews}</div>
              <div class="stat-label">With reviews</div>
            </div>
          </div>
        </div>

        ${this._parseErrors?.length ? html`
          <details class="parse-errors">
            <summary>${this._parseErrors.length} row${this._parseErrors.length !== 1 ? 's' : ''} skipped</summary>
            <ul>
              ${this._parseErrors.map(e => html`<li>Row ${e.row}: ${e.message}</li>`)}
            </ul>
          </details>
        ` : ''}

        <div class="actions">
          <ol-button variant="primary" @click=${this._continue}>Continue</ol-button>
        </div>
      ` : ''}
    `;
  }
}

customElements.define('ol-import-upload', OlImportUpload);

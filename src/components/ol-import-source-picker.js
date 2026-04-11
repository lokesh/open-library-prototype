import { LitElement, html, css, svg } from 'lit';

const SOURCES = [
  {
    id: 'goodreads',
    name: 'Goodreads',
    description: 'Import your Goodreads library via CSV export.',
    instructions: [
      'Go to goodreads.com and sign in',
      'Click "My Books" in the top navigation',
      'Scroll down and click "Import and Export" in the left sidebar',
      'Click "Export Library" — this will generate a CSV file',
      'Download the CSV file when it\'s ready',
    ],
    fileType: 'CSV',
  },
  {
    id: 'storygraph',
    name: 'StoryGraph',
    description: 'Import your StoryGraph library via CSV export.',
    instructions: [
      'Go to app.thestorygraph.com and sign in',
      'Go to your Profile → Settings',
      'Click "Manage Account" and find "Export Your Data"',
      'Click "Generate Export" and wait for the file',
      'Download the CSV file',
    ],
    fileType: 'CSV',
  },
  {
    id: 'librarything',
    name: 'LibraryThing',
    description: 'Import your LibraryThing library via TSV export.',
    instructions: [
      'Go to librarything.com and sign in',
      'Go to More → Import/Export',
      'Under "Export", choose "Export as tab-delimited"',
      'Download the TSV file',
    ],
    fileType: 'TSV',
  },
];

export class OlImportSourcePicker extends LitElement {
  static properties = {
    source: { type: String },
  };

  static styles = css`
    :host {
      display: block;
    }

    .source-grid {
      display: grid;
      gap: var(--spacing-4);
    }

    .source-card {
      border: 2px solid var(--color-border);
      border-radius: var(--radius-card);
      padding: var(--spacing-6);
      cursor: pointer;
      background: var(--color-bg-elevated);
      transition: border-color 0.15s ease, box-shadow 0.15s ease;
    }

    .source-card:hover {
      border-color: var(--color-brand-primary);
    }

    .source-card:active {
      transform: scale(0.99);
    }

    .card-header {
      display: flex;
      align-items: center;
      gap: var(--spacing-3);
    }

    .card-icon {
      width: 40px;
      height: 40px;
      border-radius: var(--radius-md);
      background: var(--color-bg);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .card-icon svg {
      width: 22px;
      height: 22px;
      color: var(--color-text-secondary);
    }

    .card-title {
      font-weight: var(--font-weight-semibold);
      font-size: var(--font-size-lg);
      color: var(--color-text-strong);
    }

    .card-description {
      color: var(--color-text-secondary);
      font-size: var(--font-size-sm);
      margin-top: var(--spacing-1);
    }

    .card-badge {
      margin-left: auto;
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-semibold);
      color: var(--color-text-secondary);
      background: var(--color-bg);
      padding: var(--spacing-1) var(--spacing-2);
      border-radius: var(--radius-full);
    }

  `;

  constructor() {
    super();
    this.source = '';
  }

  _selectSource(id) {
    this.dispatchEvent(new CustomEvent('ol-import-step-complete', {
      bubbles: true,
      composed: true,
      detail: { step: 0, data: { source: id } },
    }));
  }

  _renderSourceIcon() {
    return svg`
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    `;
  }

  render() {
    return html`
      <div class="source-grid">
        ${SOURCES.map(s => html`
          <div
            class="source-card"
            @click=${() => this._selectSource(s.id)}
            role="button"
            tabindex="0"
            @keydown=${(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this._selectSource(s.id); } }}
          >
            <div class="card-header">
              <div class="card-icon">
                <svg viewBox="0 0 24 24">${this._renderSourceIcon()}</svg>
              </div>
              <div>
                <div class="card-title">${s.name}</div>
                <div class="card-description">${s.description}</div>
              </div>
              <span class="card-badge">${s.fileType}</span>
            </div>
          </div>
        `)}
      </div>
    `;
  }
}

customElements.define('ol-import-source-picker', OlImportSourcePicker);

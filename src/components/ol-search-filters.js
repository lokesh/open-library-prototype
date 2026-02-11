import { LitElement, html, css } from 'lit';
import searchDataService from '../search-data-service.js';

export class OlSearchFilters extends LitElement {
  static properties = {
    expanded: { type: Boolean, reflect: true },
    _filters: { type: Object, state: true },
    _expandedSections: { type: Object, state: true },
    _authors: { type: Array, state: true },
  };

  static styles = css`
    :host {
      display: block;
    }

    .filter-toggle {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      background: none;
      border: none;
      color: var(--color-text-strong);
      font-size: var(--font-size-xl);
      font-weight: var(--font-weight-semibold);
      font-family: var(--font-family-serif);
      padding: var(--spacing-3) 0;
      cursor: pointer;
    }

    @media (min-width: 768px) {
      .filter-toggle {
        cursor: default;
        pointer-events: none;
      }

      .filter-toggle .chevron {
        display: none;
      }
    }

    .filter-toggle:focus-visible {
      outline: var(--focus-ring-width) solid var(--focus-ring-color);
      outline-offset: 2px;
      border-radius: var(--radius-sm);
    }

    .chevron {
      width: 20px;
      height: 20px;
      transition: transform 150ms ease;
    }

    :host([expanded]) .chevron {
      transform: rotate(180deg);
    }

    .filter-body {
      display: none;
    }

    :host([expanded]) .filter-body {
      display: block;
    }

    @media (min-width: 768px) {
      .filter-body {
        display: block;
      }
    }

    .clear-btn {
      background: none;
      border: none;
      color: var(--color-link);
      font-size: var(--body-font-size-sm);
      font-family: inherit;
      cursor: pointer;
      padding: var(--spacing-1) 0;
      margin-bottom: var(--spacing-3);
    }

    .clear-btn:hover {
      text-decoration: underline;
    }

    .clear-btn:focus-visible {
      outline: var(--focus-ring-width) solid var(--focus-ring-color);
      outline-offset: 2px;
      border-radius: var(--radius-sm);
    }

    .section {
      border-bottom: var(--border-control);
      padding: var(--spacing-2) 0;
    }

    .section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      background: none;
      border: none;
      color: var(--color-text-strong);
      font-size: var(--body-font-size);
      font-weight: var(--font-weight-semibold);
      font-family: inherit;
      color: var(--color-text-secondary);
      padding: var(--spacing-1) 0;
      cursor: pointer;
    }

    .section-header:focus-visible {
      outline: var(--focus-ring-width) solid var(--focus-ring-color);
      outline-offset: 2px;
      border-radius: var(--radius-sm);
    }

    .section-chevron {
      width: 16px;
      height: 16px;
      transition: transform 150ms ease;
    }

    .section-chevron.open {
      transform: rotate(180deg);
    }

    .section-body {
      padding-top: var(--spacing-2);
    }

    .range-row {
      display: flex;
      align-items: center;
      gap: var(--spacing-2);
    }

    .range-input {
      width: 70px;
      padding: var(--spacing-1) var(--spacing-2);
      border: var(--border-control);
      border-radius: var(--radius-input);
      background: var(--input-color-bg);
      color: var(--input-color-text);
      font-size: var(--body-font-size);
      font-family: inherit;
    }

    .range-input:focus {
      outline: none;
      border-color: var(--color-border-focused);
      box-shadow: var(--focus-ring);
    }

    .range-label {
      font-size: var(--body-font-size-sm);
      color: var(--color-text-secondary);
    }

    .go-btn {
      padding: 6px 10px;
      background: var(--color-bg-primary);
      color: var(--color-text-on-primary);
      border: none;
      border-radius: var(--radius-button);
      font-size: var(--body-font-size-sm);
      font-family: inherit;
      cursor: pointer;
    }

    .go-btn:hover {
      background: var(--color-bg-primary-hovered);
    }

    .go-btn:focus-visible {
      outline: var(--focus-ring-width) solid var(--focus-ring-color);
      outline-offset: 2px;
    }

    .checkbox-list {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-1);
      max-height: 200px;
      overflow-y: auto;
    }

    .checkbox-item {
      display: flex;
      align-items: center;
      gap: var(--spacing-2);
      font-size: var(--body-font-size-sm);
      color: var(--color-text);
    }

    .checkbox-item input {
      margin: 0;
    }
  `;

  constructor() {
    super();
    this.expanded = false;
    this._filters = {
      yearMin: '',
      yearMax: '',
      languages: [],
      authors: [],
      subjects: [],
      publishers: [],
      people: [],
      places: [],
      times: [],
    };
    this._expandedSections = {
      language: true,
      author: true,
      subjects: false,
      year: true,
      publisher: false,
      people: false,
      places: false,
      times: false,
    };
    this._authors = [];
  }

  async connectedCallback() {
    super.connectedCallback();
    await searchDataService.ensureLoaded();
    this._authors = searchDataService.getAuthors();
  }

  _togglePanel() {
    this.expanded = !this.expanded;
  }

  _toggleSection(name) {
    this._expandedSections = {
      ...this._expandedSections,
      [name]: !this._expandedSections[name],
    };
  }

  _handleRangeChange(field, value) {
    this._filters = { ...this._filters, [field]: value };
    this._dispatchChange();
  }

  _dispatchChange() {
    this.dispatchEvent(
      new CustomEvent('ol-filters-change', {
        detail: { filters: { ...this._filters } },
        bubbles: true,
        composed: true,
      })
    );
  }

  _handleCheckboxToggle(field, value, checked) {
    const list = checked
      ? [...this._filters[field], value]
      : this._filters[field].filter((v) => v !== value);
    this._filters = { ...this._filters, [field]: list };
    this._dispatchChange();
  }

  _handleClear() {
    this._filters = {
      yearMin: '',
      yearMax: '',
      languages: [],
      authors: [],
      subjects: [],
      publishers: [],
      people: [],
      places: [],
      times: [],
    };
    this.dispatchEvent(
      new CustomEvent('ol-filters-clear', {
        bubbles: true,
        composed: true,
      })
    );
  }

  _renderSection(name, label, content) {
    const isOpen = this._expandedSections[name];
    return html`
      <div class="section">
        <button
          class="section-header"
          @click=${() => this._toggleSection(name)}
          aria-expanded=${isOpen}
          aria-controls="section-${name}"
        >
          ${label}
          <svg class="section-chevron ${isOpen ? 'open' : ''}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>
        ${isOpen ? html`<div class="section-body" id="section-${name}">${content}</div>` : ''}
      </div>
    `;
  }

  _renderRangeFilter(minField, maxField, minVal, maxVal) {
    return html`
      <div class="range-row">
        <input
          class="range-input"
          type="number"
          inputmode="numeric"
          .value=${minVal}
          placeholder=${minVal || ''}
          aria-label="Minimum"
          @change=${(e) => this._handleRangeChange(minField, e.target.value)}
        />
        <span class="range-label">to</span>
        <input
          class="range-input"
          type="number"
          inputmode="numeric"
          .value=${maxVal}
          placeholder=${maxVal || ''}
          aria-label="Maximum"
          @change=${(e) => this._handleRangeChange(maxField, e.target.value)}
        />
        <button class="go-btn" @click=${this._dispatchChange}>Go</button>

      </div>
    `;
  }

  render() {
    return html`
      <button class="filter-toggle" @click=${this._togglePanel} aria-expanded=${this.expanded}>
        Filters
        <svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      <div class="filter-body">

        ${this._renderSection('author', 'Author', html`
          <div class="checkbox-list">
            ${this._authors.map(
              (a) => html`
                <label class="checkbox-item">
                  <input
                    type="checkbox"
                    .checked=${this._filters.authors.includes(a.name)}
                    @change=${(e) => this._handleCheckboxToggle('authors', a.name, e.target.checked)}
                  />
                  ${a.name}
                </label>
              `
            )}
          </div>
        `)}

        ${this._renderSection('subjects', 'Subjects', html`
          <div class="checkbox-list">
            ${['Fiction', 'History', 'Science', 'Biography', 'Philosophy', 'Art', 'Technology', 'Politics', 'Education', 'Religion'].map(
              (s) => html`
                <label class="checkbox-item">
                  <input
                    type="checkbox"
                    .checked=${this._filters.subjects.includes(s)}
                    @change=${(e) => this._handleCheckboxToggle('subjects', s, e.target.checked)}
                  />
                  ${s}
                </label>
              `
            )}
          </div>
        `)}

        ${this._renderSection('year', 'First Published',
          this._renderRangeFilter('yearMin', 'yearMax', this._filters.yearMin, this._filters.yearMax)
        )}

        ${this._renderSection('publisher', 'Publisher', html`
          <div class="checkbox-list">
            ${['Penguin', 'HarperCollins', 'Simon & Schuster', 'Random House', 'Macmillan', 'Hachette'].map(
              (p) => html`
                <label class="checkbox-item">
                  <input
                    type="checkbox"
                    .checked=${this._filters.publishers.includes(p)}
                    @change=${(e) => this._handleCheckboxToggle('publishers', p, e.target.checked)}
                  />
                  ${p}
                </label>
              `
            )}
          </div>
        `)}

        ${this._renderSection('people', 'People', html`
          <div class="checkbox-list">
            ${['Napoleon', 'Shakespeare', 'Lincoln', 'Einstein', 'Cleopatra', 'Darwin'].map(
              (person) => html`
                <label class="checkbox-item">
                  <input
                    type="checkbox"
                    .checked=${this._filters.people.includes(person)}
                    @change=${(e) => this._handleCheckboxToggle('people', person, e.target.checked)}
                  />
                  ${person}
                </label>
              `
            )}
          </div>
        `)}

        ${this._renderSection('places', 'Places', html`
          <div class="checkbox-list">
            ${['England', 'France', 'United States', 'India', 'China', 'Egypt'].map(
              (place) => html`
                <label class="checkbox-item">
                  <input
                    type="checkbox"
                    .checked=${this._filters.places.includes(place)}
                    @change=${(e) => this._handleCheckboxToggle('places', place, e.target.checked)}
                  />
                  ${place}
                </label>
              `
            )}
          </div>
        `)}

        ${this._renderSection('times', 'Times', html`
          <div class="checkbox-list">
            ${['Ancient', 'Medieval', '18th century', '19th century', '20th century', '21st century'].map(
              (time) => html`
                <label class="checkbox-item">
                  <input
                    type="checkbox"
                    .checked=${this._filters.times.includes(time)}
                    @change=${(e) => this._handleCheckboxToggle('times', time, e.target.checked)}
                  />
                  ${time}
                </label>
              `
            )}
          </div>
        `)}
      </div>
    `;
  }
}

customElements.define('ol-search-filters', OlSearchFilters);

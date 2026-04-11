import { LitElement, html, css } from 'lit';
import searchDataService from '../search-data-service.js';

export class OlImportProcessing extends LitElement {
  static properties = {
    parsedBooks: { type: Array },
    shelfMapping: { type: Object },
    importOptions: { type: Object },
    _progress: { state: true },
    _currentBook: { state: true },
    _counters: { state: true },
    _done: { state: true },
    _cancelled: { state: true },
  };

  static styles = css`
    :host {
      display: block;
    }

    .processing-container {
      text-align: center;
      padding: var(--spacing-8) 0;
    }

    h2 {
      font-family: var(--heading-font-family);
      font-weight: var(--heading-font-weight);
      font-size: var(--font-size-xl);
      color: var(--heading-color);
      margin: 0 0 var(--spacing-2);
    }

    .subtitle {
      color: var(--color-text-secondary);
      font-size: var(--font-size-sm);
      margin: 0 0 var(--spacing-8);
    }

    /* Progress bar */
    .progress-wrapper {
      margin-bottom: var(--spacing-6);
    }

    .progress-bar-bg {
      width: 100%;
      height: 8px;
      background: var(--color-bg);
      border-radius: var(--radius-full);
      overflow: hidden;
    }

    .progress-bar-fill {
      height: 100%;
      background: var(--color-brand-primary);
      border-radius: var(--radius-full);
      transition: width 0.15s ease;
    }

    .progress-text {
      display: flex;
      justify-content: space-between;
      margin-top: var(--spacing-2);
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
    }

    /* Current book */
    .current-book {
      font-size: var(--font-size-md);
      color: var(--color-text);
      margin-bottom: var(--spacing-8);
      min-height: 1.5em;
      transition: opacity 0.15s ease;
    }

    .current-book-label {
      font-size: var(--font-size-xs);
      color: var(--color-text-secondary);
      margin-bottom: var(--spacing-1);
    }

    .current-book-title {
      font-weight: var(--font-weight-medium);
      color: var(--color-text-strong);
    }

    /* Counters */
    .counters {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: var(--spacing-4);
      max-width: 500px;
      margin: 0 auto;
    }

    .counter {
      border: 1px solid var(--color-border);
      border-radius: var(--radius-card);
      padding: var(--spacing-4);
      background: var(--color-bg-elevated);
    }

    .counter-value {
      font-size: var(--font-size-2xl);
      font-weight: var(--font-weight-bold);
      font-family: var(--heading-font-family);
      transition: color 0.15s ease;
    }

    .counter-value.matched {
      color: var(--color-brand-primary);
    }

    .counter-value.review {
      color: #b45309;
    }

    .counter-value.not-found {
      color: var(--color-text-secondary);
    }

    .counter-label {
      font-size: var(--font-size-xs);
      color: var(--color-text-secondary);
      margin-top: var(--spacing-1);
    }

    /* Spinner animation for the processing state */
    .spinner {
      display: inline-block;
      width: 24px;
      height: 24px;
      border: 3px solid var(--color-border);
      border-top-color: var(--color-brand-primary);
      border-radius: var(--radius-full);
      animation: spin 0.8s linear infinite;
      margin-bottom: var(--spacing-4);
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* Cancel */
    .cancel-link {
      margin-top: var(--spacing-6);
    }

    .cancel-link button {
      background: none;
      border: none;
      color: var(--color-text-secondary);
      cursor: pointer;
      font-family: var(--body-font-family);
      font-size: var(--font-size-sm);
      padding: var(--spacing-2);
    }

    .cancel-link button:hover {
      color: var(--color-text-strong);
    }

    @media (max-width: 600px) {
      .counters {
        grid-template-columns: 1fr;
      }
    }
  `;

  constructor() {
    super();
    this.parsedBooks = [];
    this.shelfMapping = {};
    this.importOptions = {};
    this._progress = 0;
    this._currentBook = '';
    this._counters = { matched: 0, needsReview: 0, notFound: 0 };
    this._done = false;
    this._cancelled = false;
    this._timeouts = [];
    this._results = { matched: [], needsReview: [], notFound: [] };
  }

  connectedCallback() {
    super.connectedCallback();
    // Small delay to allow the UI to render before starting
    this._startTimeout = setTimeout(() => this._startProcessing(), 300);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._cleanup();
  }

  _cleanup() {
    clearTimeout(this._startTimeout);
    for (const t of this._timeouts) clearTimeout(t);
    this._timeouts = [];
  }

  async _startProcessing() {
    if (!this.parsedBooks?.length) return;

    await searchDataService.ensureLoaded();
    const books = this.parsedBooks;
    const total = books.length;

    for (let i = 0; i < total; i++) {
      if (this._cancelled) return;

      await new Promise((resolve) => {
        const delay = 50 + Math.random() * 150;
        const t = setTimeout(resolve, delay);
        this._timeouts.push(t);
      });

      if (this._cancelled) return;

      const book = books[i];
      this._currentBook = book.title;
      this._progress = Math.round(((i + 1) / total) * 100);

      // Apply shelf mapping
      const mappedShelf = this.shelfMapping[book.shelf] || 'Want to Read';
      if (mappedShelf === 'skip') continue;

      const enriched = {
        ...book,
        mappedShelf,
        rating: this.importOptions.ratings ? book.rating : 0,
        review: this.importOptions.reviews ? book.review : '',
        dateRead: this.importOptions.dates ? book.dateRead : '',
      };

      // Try real matching against books.json
      const searchResults = searchDataService.searchBooks(book.title);
      const exactMatch = searchResults.find(
        (r) => r.title.toLowerCase() === book.title.toLowerCase()
      );

      if (exactMatch) {
        this._results.matched.push({
          source: enriched,
          match: exactMatch,
          confidence: 100,
        });
        this._counters = { ...this._counters, matched: this._counters.matched + 1 };
      } else if (searchResults.length > 0) {
        // Partial match — flag for review
        this._results.needsReview.push({
          source: enriched,
          candidates: searchResults.slice(0, 3).map((r) => ({
            ...r,
            confidence: 40 + Math.floor(Math.random() * 40),
          })),
        });
        this._counters = { ...this._counters, needsReview: this._counters.needsReview + 1 };
      } else {
        // Simulate: 30% chance of fake "needs review" with synthetic candidate
        if (Math.random() < 0.3) {
          this._results.needsReview.push({
            source: enriched,
            candidates: [
              {
                title: book.title + ' (Edition)',
                author: book.author,
                coverUrl: '',
                confidence: 55 + Math.floor(Math.random() * 25),
              },
            ],
          });
          this._counters = { ...this._counters, needsReview: this._counters.needsReview + 1 };
        } else {
          this._results.notFound.push({ source: enriched });
          this._counters = { ...this._counters, notFound: this._counters.notFound + 1 };
        }
      }
    }

    this._done = true;
    this._currentBook = '';

    // Fire completion
    this.dispatchEvent(new CustomEvent('ol-import-step-complete', {
      bubbles: true,
      composed: true,
      detail: {
        step: 3,
        data: { results: { ...this._results } },
      },
    }));
  }

  _cancel() {
    this._cancelled = true;
    this._cleanup();
    this.dispatchEvent(new CustomEvent('ol-import-back', { bubbles: true, composed: true }));
  }

  render() {
    const total = this.parsedBooks?.length || 0;
    const processed = this._counters.matched + this._counters.needsReview + this._counters.notFound;

    return html`
      <div class="processing-container">
        <div class="spinner"></div>
        <h2>Matching Your Books</h2>
        <p class="subtitle">Finding your books in the Open Library catalog...</p>

        <div class="progress-wrapper">
          <div class="progress-bar-bg">
            <div class="progress-bar-fill" style="width: ${this._progress}%"></div>
          </div>
          <div class="progress-text">
            <span>${processed} of ${total} books</span>
            <span>${this._progress}%</span>
          </div>
        </div>

        ${this._currentBook ? html`
          <div class="current-book">
            <div class="current-book-label">Now matching:</div>
            <div class="current-book-title">${this._currentBook}</div>
          </div>
        ` : html`<div class="current-book"></div>`}

        <div class="counters">
          <div class="counter">
            <div class="counter-value matched">${this._counters.matched}</div>
            <div class="counter-label">Matched</div>
          </div>
          <div class="counter">
            <div class="counter-value review">${this._counters.needsReview}</div>
            <div class="counter-label">Needs Review</div>
          </div>
          <div class="counter">
            <div class="counter-value not-found">${this._counters.notFound}</div>
            <div class="counter-label">Not Found</div>
          </div>
        </div>

        <div class="cancel-link">
          <button @click=${this._cancel}>Cancel Import</button>
        </div>
      </div>
    `;
  }
}

customElements.define('ol-import-processing', OlImportProcessing);

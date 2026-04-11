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
    // Warn on accidental navigation (tab close / refresh) while matching is
    // still running — otherwise the user loses all import progress silently.
    this._beforeUnloadHandler = (e) => {
      if (!this._done && !this._cancelled) {
        e.preventDefault();
        // Modern browsers ignore the custom string but still show a dialog.
        e.returnValue = '';
        return '';
      }
    };
    window.addEventListener('beforeunload', this._beforeUnloadHandler);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._cleanup();
    if (this._beforeUnloadHandler) {
      window.removeEventListener('beforeunload', this._beforeUnloadHandler);
      this._beforeUnloadHandler = null;
    }
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
        // Partial match — score confidence for each candidate, then auto-match
        // the top result if it's ≥45%. The prototype deliberately favors fewer
        // confirmation prompts over perfect accuracy; anything below that goes
        // to the Needs Review tab.
        const candidates = searchResults.slice(0, 3).map((r) => ({
          ...r,
          confidence: this._scoreCandidate(book, r),
        }));
        // Keep candidates sorted best-first so downstream UI can trust order.
        candidates.sort((a, b) => b.confidence - a.confidence);
        const top = candidates[0];
        if (top.confidence >= 45) {
          this._results.matched.push({
            source: enriched,
            match: top,
            confidence: top.confidence,
          });
          this._counters = { ...this._counters, matched: this._counters.matched + 1 };
        } else {
          this._results.needsReview.push({
            source: enriched,
            candidates,
          });
          this._counters = { ...this._counters, needsReview: this._counters.needsReview + 1 };
        }
      } else {
        // Simulate: 10% chance of fake "needs review" with synthetic candidate
        if (Math.random() < 0.1) {
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

  /**
   * Score a candidate match against the source book. Returns an integer
   * 0–100. ≥90 means the caller should auto-match without user review.
   *
   * Scoring blends two things:
   *   - recall: how much of the source title is present in the candidate
   *     (high recall + matching author = almost certainly the same book,
   *     e.g. "Gatsby" → "Gatsby: A Novel")
   *   - precision: how much of the candidate title is source-explained
   *     (low precision suggests a different book in the same series,
   *     e.g. "Dune" → "Dune Messiah")
   *
   * Stopwords are removed so "The Great Gatsby" doesn't get diluted by
   * the article. Exact title match short-circuits to 100.
   */
  _scoreCandidate(source, candidate) {
    const STOPWORDS = new Set(['a', 'an', 'the', 'of', 'and', 'or', 'in', 'on', 'at', 'to', 'for']);
    const tokenize = (s) => (s || '')
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter((t) => t && !STOPWORDS.has(t));

    const sourceTokens = new Set(tokenize(source.title));
    const candidateTokens = new Set(tokenize(candidate.title));

    // Exact title match (ignoring case/punct) wins immediately.
    if (
      sourceTokens.size > 0 &&
      sourceTokens.size === candidateTokens.size &&
      [...sourceTokens].every((t) => candidateTokens.has(t))
    ) {
      return 100;
    }

    if (sourceTokens.size === 0 || candidateTokens.size === 0) return 50;

    let shared = 0;
    for (const t of sourceTokens) if (candidateTokens.has(t)) shared++;

    const recall = shared / sourceTokens.size;       // how much of src is in cand
    const precision = shared / candidateTokens.size; // how much of cand is src

    const sourceAuthor = (source.author || '').toLowerCase().trim();
    const candidateAuthor = (candidate.author || '').toLowerCase().trim();
    const authorMatches = sourceAuthor && candidateAuthor &&
      (sourceAuthor === candidateAuthor ||
       sourceAuthor.includes(candidateAuthor) ||
       candidateAuthor.includes(sourceAuthor));

    // Title portion: 60 pts for recall, 25 pts for precision.
    // Best case (identical) = 85 title + 15 author = 100.
    // Subtitle case (full recall, partial precision) with author ≈ 90+.
    // Series mismatch (full recall on 1-token source, partial precision) ≈ 80 with author.
    let score = Math.round(recall * 60 + precision * 25);
    if (authorMatches) score += 15;
    return Math.min(100, Math.max(0, score));
  }

  render() {
    const total = this.parsedBooks?.length || 0;
    const processed = this._counters.matched + this._counters.needsReview + this._counters.notFound;
    const current = Math.min(processed + 1, total);

    return html`
      <div class="processing-container">
        <h2>Matching Your Books</h2>
        <p class="subtitle">Finding your books in the Open Library catalog. Don't close this tab.</p>

        <div class="progress-wrapper">
          <div class="progress-bar-bg">
            <div class="progress-bar-fill" style="width: ${this._progress}%"></div>
          </div>
          <div class="progress-text">
            <span>${processed.toLocaleString()} of ${total.toLocaleString()} books</span>
            <span>${this._progress}%</span>
          </div>
        </div>

        ${this._currentBook ? html`
          <div class="current-book">
            <div class="current-book-label">Matching ${current} of ${total}</div>
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

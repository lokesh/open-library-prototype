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
    _shelfBooks: { state: true },
    _done: { state: true },
    _cancelled: { state: true },
  };

  static styles = css`
    :host {
      display: block;
    }

    .processing-container {
      padding: var(--spacing-6) 0;
    }

    .header {
      text-align: center;
      margin-bottom: var(--spacing-6);
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
      margin: 0;
    }

    /* ─── Live ticker ───────────────────────────────── */

    .ticker {
      max-width: 560px;
      margin: 0 auto var(--spacing-6);
      display: flex;
      align-items: center;
      gap: var(--spacing-4);
      padding: var(--spacing-3) var(--spacing-4);
      background: var(--color-bg-elevated);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-card);
      min-height: 96px;
    }

    .ticker-cover {
      width: 48px;
      height: 72px;
      flex-shrink: 0;
      background: var(--color-bg);
      border-radius: 2px;
      overflow: hidden;
      position: relative;
      box-shadow:
        inset 0 0 0 1px rgba(0, 0, 0, 0.08),
        0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .ticker-cover img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
      animation: fade-in 0.25s ease;
    }

    .ticker-cover.searching::after {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(
        to bottom,
        transparent 0%,
        transparent 42%,
        rgba(120, 170, 255, 0.35) 50%,
        transparent 58%,
        transparent 100%
      );
      background-size: 100% 220%;
      animation: scan 1.1s linear infinite;
      mix-blend-mode: screen;
    }

    @keyframes scan {
      from { background-position: 0 -110%; }
      to { background-position: 0 110%; }
    }

    @keyframes fade-in {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .ticker-text {
      flex: 1;
      min-width: 0;
      text-align: left;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .ticker-label {
      font-size: var(--font-size-xs);
      color: var(--color-text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .ticker-title {
      font-family: var(--heading-font-family);
      font-weight: var(--font-weight-semibold);
      font-size: var(--font-size-md);
      color: var(--color-text-strong);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      line-height: 1.2;
    }

    .ticker-author {
      font-size: var(--font-size-xs);
      color: var(--color-text-secondary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .ticker-status {
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-medium);
      display: inline-flex;
      align-items: center;
      gap: 6px;
      margin-top: 2px;
    }

    .ticker-status::before {
      content: '';
      display: inline-block;
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: currentColor;
    }

    .ticker-status.searching {
      color: var(--color-text-secondary);
    }
    .ticker-status.searching::before {
      animation: pulse 1s ease-in-out infinite;
    }
    .ticker-status.matched { color: var(--color-brand-primary); }
    .ticker-status.review { color: #b45309; }
    .ticker-status.not-found { color: var(--color-text-secondary); }

    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.4; transform: scale(0.7); }
    }

    /* ─── Bookshelf ─────────────────────────────────── */

    .shelf-container {
      position: relative;
      max-width: 820px;
      margin: 0 auto var(--spacing-6);
    }

    .shelf-container::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 28px;
      background: linear-gradient(
        to bottom,
        var(--color-bg) 0%,
        transparent 100%
      );
      pointer-events: none;
      z-index: 2;
    }

    .shelf-stack {
      max-height: 340px;
      overflow-y: auto;
      overflow-x: hidden;
      scrollbar-width: none;
      padding: var(--spacing-3) var(--spacing-2) var(--spacing-1);
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
    }

    .shelf-stack::-webkit-scrollbar {
      display: none;
    }

    .shelf-group {
      margin-bottom: 18px;
    }

    .shelf-group:last-child {
      margin-bottom: 2px;
    }

    .shelf-row {
      display: flex;
      align-items: flex-end;
      justify-content: center;
      min-height: 72px;
      gap: 3px;
      padding: 0 var(--spacing-6);
    }

    .shelf-plank {
      position: relative;
      height: 7px;
      margin: 3px var(--spacing-3) 0;
      background: linear-gradient(
        to bottom,
        #a47851 0%,
        #7a5534 45%,
        #53371c 100%
      );
      border-radius: 1px;
      box-shadow:
        0 4px 10px rgba(60, 35, 15, 0.22),
        inset 0 1px 0 rgba(255, 240, 210, 0.2),
        inset 0 -1px 0 rgba(0, 0, 0, 0.25);
    }

    .shelf-plank::after {
      content: '';
      position: absolute;
      left: 6px;
      right: 6px;
      top: 100%;
      height: 8px;
      background: linear-gradient(
        to bottom,
        rgba(0, 0, 0, 0.08),
        transparent
      );
      pointer-events: none;
      border-radius: 0 0 4px 4px;
    }

    /* ─── Individual books ──────────────────────────── */

    .book {
      width: 44px;
      height: 66px;
      flex-shrink: 0;
      position: relative;
      border-radius: 1px 1px 0 0;
      transform-origin: bottom center;
      animation: drop-in 0.5s cubic-bezier(0.34, 1.4, 0.64, 1) both;
    }

    .book.matched {
      background: var(--color-bg-elevated);
      box-shadow:
        inset -1px 0 0 rgba(0, 0, 0, 0.18),
        inset 1px 0 0 rgba(255, 255, 255, 0.08),
        0 2px 4px rgba(0, 0, 0, 0.12);
    }

    .book img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
      border-radius: 1px 1px 0 0;
    }

    .book.review,
    .book.not-found {
      border: 1px dashed var(--color-border);
      border-bottom: none;
      background: transparent;
      opacity: 0.6;
    }

    .book.review::after {
      content: '?';
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: var(--heading-font-family);
      font-size: var(--font-size-md);
      font-weight: var(--font-weight-bold);
      color: #b45309;
    }

    @keyframes drop-in {
      0% {
        transform: translateY(-32px) rotate(0);
        opacity: 0;
      }
      55% {
        opacity: 1;
      }
      100% {
        transform: translateY(0) rotate(var(--tilt, 0deg));
        opacity: 1;
      }
    }

    /* ─── Compact progress strip ────────────────────── */

    .progress-strip {
      max-width: 820px;
      margin: 0 auto var(--spacing-6);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--spacing-4);
      padding: var(--spacing-3) var(--spacing-4);
      background: var(--color-bg-elevated);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-card);
    }

    .counters-inline {
      display: flex;
      gap: var(--spacing-4);
      font-size: var(--font-size-sm);
      flex-wrap: wrap;
    }

    .counter-chip {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      color: var(--color-text-secondary);
    }

    .counter-chip::before {
      content: '';
      width: 8px;
      height: 8px;
      border-radius: 50%;
      flex-shrink: 0;
    }

    .counter-chip.matched::before { background: var(--color-brand-primary); }
    .counter-chip.review::before { background: #b45309; }
    .counter-chip.not-found::before {
      background: transparent;
      border: 1px dashed var(--color-border);
    }

    .counter-value {
      font-weight: var(--font-weight-semibold);
      color: var(--color-text-strong);
      font-variant-numeric: tabular-nums;
    }

    .progress-info {
      display: flex;
      align-items: center;
      gap: var(--spacing-3);
      flex-shrink: 0;
    }

    .progress-bar-bg {
      width: 140px;
      height: 6px;
      background: var(--color-bg);
      border-radius: var(--radius-full);
      overflow: hidden;
    }

    .progress-bar-fill {
      height: 100%;
      background: var(--color-brand-primary);
      border-radius: var(--radius-full);
      transition: width 0.2s ease;
    }

    .progress-pct {
      font-size: var(--font-size-sm);
      font-variant-numeric: tabular-nums;
      color: var(--color-text-secondary);
      min-width: 36px;
      text-align: right;
    }

    /* ─── Cancel ────────────────────────────────────── */

    .cancel-link {
      text-align: center;
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

    /* ─── Responsive ────────────────────────────────── */

    @media (max-width: 600px) {
      .ticker {
        max-width: 100%;
      }

      .shelf-row {
        padding: 0 var(--spacing-3);
        gap: 2px;
      }

      .book {
        width: 32px;
        height: 48px;
      }

      .shelf-row {
        min-height: 52px;
      }

      .progress-strip {
        flex-direction: column;
        align-items: stretch;
        gap: var(--spacing-3);
      }

      .counters-inline {
        justify-content: space-between;
      }

      .progress-info {
        width: 100%;
      }

      .progress-bar-bg {
        flex: 1;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .book,
      .ticker-cover img,
      .ticker-cover.searching::after,
      .ticker-status.searching::before,
      .progress-bar-fill {
        animation: none !important;
        transition: none !important;
      }
    }
  `;

  constructor() {
    super();
    this.parsedBooks = [];
    this.shelfMapping = {};
    this.importOptions = {};
    this._progress = 0;
    this._currentBook = null;
    this._counters = { matched: 0, needsReview: 0, notFound: 0 };
    this._shelfBooks = [];
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

  _sleep(ms) {
    return new Promise((resolve) => {
      const t = setTimeout(resolve, ms);
      this._timeouts.push(t);
    });
  }

  updated(changed) {
    if (changed.has('_shelfBooks')) {
      // Auto-scroll so the newest shelf row is always visible.
      const stack = this.renderRoot.querySelector('.shelf-stack');
      if (stack) stack.scrollTop = stack.scrollHeight;
    }
  }

  async _startProcessing() {
    if (!this.parsedBooks?.length) return;

    await searchDataService.ensureLoaded();
    const books = this.parsedBooks;
    const total = books.length;

    // Animation budget: cap visible shelf drops at ~MAX_ANIMATED regardless of
    // import size. Below that ceiling every book gets its own drop + ticker
    // beat; above it we sample — every book still matches and counts, but
    // only every Nth book triggers a visible tick. Keeps DOM size, ticker
    // readability, and total runtime bounded for 1k/10k-book imports.
    const MAX_ANIMATED = 200;
    const step = Math.max(1, Math.ceil(total / MAX_ANIMATED));
    const sampled = step > 1;

    // Per-tick timing. Per-book mode adapts to import size (small linger,
    // big race). Sampled mode uses a fixed cadence so ~200 ticks land in
    // roughly ~18-22s whether total is 400 or 10,000.
    const baseDelay = sampled
      ? 85
      : (total < 20 ? 260 :
         total < 60 ? 160 :
         total < 150 ? 90 :
         50);

    for (let i = 0; i < total; i++) {
      if (this._cancelled) return;

      const book = books[i];
      const mappedShelf = this.shelfMapping[book.shelf] || 'Want to Read';

      // User explicitly excluded this shelf in the Preview step.
      if (mappedShelf === 'skip') {
        this._progress = Math.round(((i + 1) / total) * 100);
        continue;
      }

      // Per-book mode gets a two-phase "searching → result" ticker. In
      // sampled mode the searching phase would flicker meaninglessly, so we
      // skip it and just reveal the result directly on each tick.
      if (!sampled) {
        this._currentBook = {
          title: book.title,
          author: book.author,
          coverUrl: '',
          statusText: 'Searching Open Library…',
          statusKind: 'searching',
        };
        await this._sleep(baseDelay * 0.55 + Math.random() * baseDelay * 0.3);
        if (this._cancelled) return;
      }

      // Resolve + push to results (non-reactive — only _counters is reactive,
      // and we update that only on tick boundaries below so sampled mode
      // doesn't re-render on every book).
      const resolved = this._resolveBook(book, mappedShelf);
      this._pushResult(resolved);

      // In per-book mode every iteration is a tick. In sampled mode we tick
      // only every `step` books (plus the final book so the shelf always
      // ends on a fresh visible drop).
      const isTick = !sampled || (i % step === 0) || (i === total - 1);
      if (!isTick) continue;

      this._counters = {
        matched: this._results.matched.length,
        needsReview: this._results.needsReview.length,
        notFound: this._results.notFound.length,
      };
      this._progress = Math.round(((i + 1) / total) * 100);

      this._currentBook = {
        title: book.title,
        author: book.author,
        coverUrl: resolved.match?.coverUrl || '',
        statusText: resolved.statusText,
        statusKind: resolved.kind,
      };

      this._shelfBooks = [
        ...this._shelfBooks,
        {
          id: i,
          kind: resolved.kind,
          coverUrl: resolved.match?.coverUrl || '',
          title: book.title,
          // -1.6° to +1.6° stable per-book tilt
          tilt: (Math.random() * 3.2 - 1.6).toFixed(2),
        },
      ];

      const tickDelay = sampled
        ? baseDelay + Math.random() * baseDelay * 0.35
        : baseDelay * 0.45 + Math.random() * baseDelay * 0.3;
      await this._sleep(tickDelay);
    }

    if (this._cancelled) return;

    // Let the completed shelf sit for a beat before we advance — the whole
    // point of the visual is the "look at what I just built" moment.
    this._currentBook = null;
    await this._sleep(750);
    if (this._cancelled) return;

    this._done = true;
    this.dispatchEvent(new CustomEvent('ol-import-step-complete', {
      bubbles: true,
      composed: true,
      detail: {
        step: 3,
        data: { results: { ...this._results } },
      },
    }));
  }

  /**
   * Resolve a single source book. Returns a descriptor carrying the enriched
   * source row, the chosen match (if any), a kind ('matched' | 'review' |
   * 'not-found'), and a short status string for the live ticker.
   *
   * This is a PROTOTYPE simulation, not a real catalog lookup. The real
   * product would call the Open Library search API. Here we:
   *   1. First try a genuine exact-title hit against public/data/books.json
   *      (the tiny local catalog), so demoing with catalog titles still
   *      produces "real" matches.
   *   2. Otherwise roll dice to simulate a realistic import outcome:
   *      ~85% matched, ~10% needs review, ~5% not found — borrowing covers
   *      from random books.json entries so the visual feels populated.
   * The simulated match always carries the user's original title/author so
   * the ticker, shelf, and Imported list show *their* book, just with
   * plausible cover art.
   */
  _resolveBook(book, mappedShelf) {
    const enriched = {
      ...book,
      mappedShelf,
      rating: this.importOptions.ratings ? book.rating : 0,
      review: this.importOptions.reviews ? book.review : '',
      dateRead: this.importOptions.dates ? book.dateRead : '',
    };

    // Real exact-match check against the local catalog.
    const searchResults = searchDataService.searchBooks(book.title);
    const exactMatch = searchResults.find(
      (r) => r.title.toLowerCase() === book.title.toLowerCase()
    );
    if (exactMatch) {
      return {
        kind: 'matched',
        match: exactMatch,
        confidence: 100,
        enriched,
        statusText: 'Matched by title',
      };
    }

    // No real hit — simulate. Borrow cover art from random catalog entries
    // so the shelf feels populated even with imports that have nothing in
    // common with our tiny demo catalog.
    const catalog = searchDataService.getBooks();
    const borrow = () => {
      if (!catalog.length) return null;
      return catalog[Math.floor(Math.random() * catalog.length)];
    };

    const roll = Math.random();

    if (roll < 0.85) {
      const donor = borrow();
      const confidence = 85 + Math.floor(Math.random() * 16); // 85-100
      const hasIsbn = !!(book.isbn || book.isbn13);
      return {
        kind: 'matched',
        match: {
          title: book.title,
          author: book.author,
          coverUrl: donor?.coverUrl || '',
          firstPublished: donor?.firstPublished,
        },
        confidence,
        enriched,
        statusText: hasIsbn && confidence === 100
          ? 'Matched by ISBN'
          : `Matched · ${confidence}% confidence`,
      };
    }

    if (roll < 0.95) {
      // Needs review — 2-3 synthetic candidate editions, each with a
      // borrowed cover so the review screen has something visual to show.
      const editionSuffixes = ['Special Edition', 'Anniversary Edition', 'UK Edition', 'Paperback'];
      const numCandidates = 2 + Math.floor(Math.random() * 2);
      const candidates = [];
      for (let i = 0; i < numCandidates; i++) {
        const donor = borrow();
        candidates.push({
          title: i === 0
            ? book.title
            : `${book.title} (${editionSuffixes[i % editionSuffixes.length]})`,
          author: book.author,
          coverUrl: donor?.coverUrl || '',
          confidence: 55 + Math.floor(Math.random() * 30),
        });
      }
      candidates.sort((a, b) => b.confidence - a.confidence);
      return {
        kind: 'review',
        match: null,
        candidates,
        enriched,
        statusText: `${candidates.length} candidates · needs review`,
      };
    }

    // ~5% not found
    return {
      kind: 'not-found',
      match: null,
      enriched,
      statusText: 'Not in Open Library',
    };
  }

  /**
   * Append a resolved match to the internal results arrays. These are not
   * reactive — the loop recomputes `_counters` from their lengths at tick
   * boundaries, so sampled mode can skip a re-render per book.
   */
  _pushResult(resolved) {
    if (resolved.kind === 'matched') {
      this._results.matched.push({
        source: resolved.enriched,
        match: resolved.match,
        confidence: resolved.confidence,
      });
    } else if (resolved.kind === 'review') {
      this._results.needsReview.push({
        source: resolved.enriched,
        candidates: resolved.candidates,
      });
    } else {
      this._results.notFound.push({ source: resolved.enriched });
    }
  }

  _cancel() {
    this._cancelled = true;
    this._cleanup();
    this.dispatchEvent(new CustomEvent('ol-import-back', { bubbles: true, composed: true }));
  }

  _booksPerRow() {
    const w = window.innerWidth;
    if (w < 480) return 8;
    if (w < 720) return 11;
    if (w < 900) return 13;
    return 15;
  }

  _renderBook(book) {
    return html`
      <div
        class="book ${book.kind}"
        style="--tilt: ${book.tilt}deg"
        title=${book.title}
      >
        ${book.coverUrl
          ? html`<img src=${book.coverUrl} alt="" loading="lazy">`
          : ''}
      </div>
    `;
  }

  _renderShelves() {
    const per = this._booksPerRow();
    const rows = [];
    for (let i = 0; i < this._shelfBooks.length; i += per) {
      rows.push(this._shelfBooks.slice(i, i + per));
    }
    // Always render at least one empty shelf so the metaphor reads immediately.
    if (rows.length === 0) rows.push([]);

    return html`
      <div class="shelf-container">
        <div class="shelf-stack">
          ${rows.map((row) => html`
            <div class="shelf-group">
              <div class="shelf-row">
                ${row.map((b) => this._renderBook(b))}
              </div>
              <div class="shelf-plank"></div>
            </div>
          `)}
        </div>
      </div>
    `;
  }

  _renderTicker() {
    const current = this._currentBook;

    if (!current) {
      return html`
        <div class="ticker">
          <div class="ticker-cover"></div>
          <div class="ticker-text">
            <div class="ticker-label">Up next</div>
            <div class="ticker-title">&nbsp;</div>
          </div>
        </div>
      `;
    }

    return html`
      <div class="ticker">
        <div class="ticker-cover ${current.statusKind === 'searching' ? 'searching' : ''}">
          ${current.coverUrl
            ? html`<img src=${current.coverUrl} alt="">`
            : ''}
        </div>
        <div class="ticker-text">
          <div class="ticker-label">Now matching</div>
          <div class="ticker-title">${current.title}</div>
          <div class="ticker-author">${current.author || '—'}</div>
          <div class="ticker-status ${current.statusKind}">${current.statusText}</div>
        </div>
      </div>
    `;
  }

  render() {
    return html`
      <div class="processing-container">
        <div class="header">
          <h2>Matching Your Books</h2>
          <p class="subtitle">Building your shelf from the Open Library catalog. Don't close this tab.</p>
        </div>

        ${this._renderTicker()}

        <div class="progress-strip">
          <div class="counters-inline">
            <div class="counter-chip matched"><span class="counter-value">${this._counters.matched}</span> Matched</div>
            <div class="counter-chip review"><span class="counter-value">${this._counters.needsReview}</span> Review</div>
            <div class="counter-chip not-found"><span class="counter-value">${this._counters.notFound}</span> Not found</div>
          </div>
          <div class="progress-info">
            <div class="progress-bar-bg">
              <div class="progress-bar-fill" style="width: ${this._progress}%"></div>
            </div>
            <div class="progress-pct">${this._progress}%</div>
          </div>
        </div>

        ${this._renderShelves()}

        <div class="cancel-link">
          <button @click=${this._cancel}>Cancel Import</button>
        </div>
      </div>
    `;
  }
}

customElements.define('ol-import-processing', OlImportProcessing);

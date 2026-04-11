import { LitElement, html, css, svg } from 'lit';
import searchDataService from '../search-data-service.js';

export class OlImportResults extends LitElement {
  static properties = {
    results: { type: Object },
    source: { type: String },
    _matched: { state: true },
    _needsReview: { state: true },
    _notFound: { state: true },
    _activeTab: { state: true },
    _searchingIndex: { state: true },
    _searchQuery: { state: true },
    _searchResults: { state: true },
  };

  static styles = css`
    :host {
      display: block;
    }

    /* Summary header */
    .summary-header {
      text-align: center;
      margin-bottom: var(--spacing-6);
    }

    .summary-header h2 {
      font-family: var(--heading-font-family);
      font-weight: var(--heading-font-weight);
      font-size: var(--font-size-2xl);
      color: var(--heading-color);
      margin: 0 0 var(--spacing-3);
    }

    .breakdown-bar {
      display: flex;
      height: 8px;
      border-radius: var(--radius-full);
      overflow: hidden;
      margin-bottom: var(--spacing-3);
      gap: 2px;
    }

    .bar-segment {
      transition: width 0.3s ease;
    }

    .bar-matched { background: var(--color-brand-primary); }
    .bar-review { background: #f59e0b; }
    .bar-not-found { background: var(--color-neutral-400); }

    .breakdown-legend {
      display: flex;
      justify-content: center;
      gap: var(--spacing-4);
      font-size: var(--font-size-xs);
      color: var(--color-text-secondary);
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: var(--spacing-1);
    }

    .legend-dot {
      width: 8px;
      height: 8px;
      border-radius: var(--radius-full);
    }

    /* Tabs */
    .tabs {
      display: flex;
      border-bottom: 2px solid var(--color-border-subtle);
      margin-bottom: var(--spacing-4);
      gap: 0;
    }

    .tab {
      padding: var(--spacing-3) var(--spacing-4);
      border: none;
      background: none;
      cursor: pointer;
      font-family: var(--body-font-family);
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
      color: var(--color-text-secondary);
      border-bottom: 2px solid transparent;
      margin-bottom: -2px;
      transition: color 0.15s ease, border-color 0.15s ease;
      white-space: nowrap;
    }

    .tab:hover {
      color: var(--color-text-strong);
    }

    .tab.active {
      color: var(--color-brand-primary);
      border-bottom-color: var(--color-brand-primary);
    }

    .tab-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 20px;
      height: 20px;
      border-radius: var(--radius-full);
      background: var(--color-bg);
      font-size: var(--font-size-xs);
      padding: 0 6px;
      margin-left: var(--spacing-1);
    }

    .tab.active .tab-badge {
      background: var(--color-brand-primary);
      color: var(--color-text-on-primary);
    }

    /* Bulk actions */
    .bulk-actions {
      display: flex;
      align-items: center;
      gap: var(--spacing-3);
      padding: var(--spacing-3) 0;
      border-bottom: 1px solid var(--color-border-subtle);
      margin-bottom: var(--spacing-3);
    }

    .bulk-actions span {
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
    }

    .bulk-btn {
      background: none;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-button);
      padding: var(--spacing-1) var(--spacing-3);
      font-family: var(--body-font-family);
      font-size: var(--font-size-xs);
      color: var(--color-text);
      cursor: pointer;
      transition: background 0.1s ease;
    }

    .bulk-btn:hover {
      background: var(--color-bg);
    }

    /* Book list */
    .book-list {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-3);
    }

    .book-item {
      border: 1px solid var(--color-border);
      border-radius: var(--radius-card);
      padding: var(--spacing-4);
      background: var(--color-bg-elevated);
      transition: opacity 0.2s ease;
    }

    .book-item.removed {
      opacity: 0.4;
    }

    .book-row {
      display: flex;
      align-items: flex-start;
      gap: var(--spacing-3);
    }

    .book-cover {
      width: 40px;
      height: 60px;
      border-radius: var(--radius-sm);
      background: var(--color-bg);
      border: 1px solid var(--color-border-subtle);
      object-fit: cover;
      flex-shrink: 0;
    }

    .book-cover-placeholder {
      width: 40px;
      height: 60px;
      border-radius: var(--radius-sm);
      background: var(--color-bg);
      border: 1px solid var(--color-border-subtle);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .book-cover-placeholder svg {
      width: 20px;
      height: 20px;
      color: var(--color-text-secondary);
    }

    .book-info {
      flex: 1;
      min-width: 0;
    }

    .book-title {
      font-weight: var(--font-weight-semibold);
      font-size: var(--font-size-sm);
      color: var(--color-text-strong);
      margin-bottom: var(--spacing-1);
    }

    .book-author {
      font-size: var(--font-size-xs);
      color: var(--color-text-secondary);
    }

    .book-meta {
      display: flex;
      gap: var(--spacing-3);
      margin-top: var(--spacing-2);
      flex-wrap: wrap;
      align-items: center;
    }

    .shelf-badge {
      font-size: var(--font-size-xs);
      padding: 2px var(--spacing-2);
      border-radius: var(--radius-full);
      background: var(--color-bg);
      color: var(--color-text-secondary);
      border: 1px solid var(--color-border-subtle);
    }

    .book-actions {
      display: flex;
      gap: var(--spacing-2);
      flex-shrink: 0;
      align-items: flex-start;
    }

    .action-btn {
      background: none;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-button);
      padding: var(--spacing-1) var(--spacing-3);
      font-family: var(--body-font-family);
      font-size: var(--font-size-xs);
      color: var(--color-text);
      cursor: pointer;
      white-space: nowrap;
      transition: background 0.1s ease, border-color 0.1s ease;
    }

    .action-btn:hover {
      background: var(--color-bg);
      border-color: var(--color-text-secondary);
    }

    .action-btn.primary {
      background: var(--color-brand-primary);
      border-color: var(--color-brand-primary);
      color: var(--color-text-on-primary);
    }

    .action-btn.primary:hover {
      background: var(--color-brand-primary-hovered);
    }

    .action-btn.destructive {
      color: var(--color-error);
      border-color: var(--color-error);
    }

    .action-btn.destructive:hover {
      background: var(--color-red-50);
    }

    /* Review item: source vs match comparison */
    .comparison {
      display: grid;
      grid-template-columns: 1fr auto 1fr;
      gap: var(--spacing-3);
      margin-top: var(--spacing-3);
      padding-top: var(--spacing-3);
      border-top: 1px solid var(--color-border-subtle);
    }

    .comparison-side {
      min-width: 0;
    }

    .comparison-label {
      font-size: var(--font-size-xs);
      color: var(--color-text-secondary);
      font-weight: var(--font-weight-semibold);
      margin-bottom: var(--spacing-2);
      text-transform: uppercase;
      letter-spacing: var(--letter-spacing-wide);
    }

    .comparison-arrow {
      display: flex;
      align-items: center;
      color: var(--color-text-secondary);
    }

    .comparison-arrow svg {
      width: 20px;
      height: 20px;
    }

    .confidence {
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-semibold);
      padding: 2px 6px;
      border-radius: var(--radius-full);
    }

    .confidence.high {
      background: var(--color-blue-50);
      color: var(--color-brand-primary);
    }

    .confidence.medium {
      background: #fef3c7;
      color: #92400e;
    }

    .confidence.low {
      background: var(--color-red-50);
      color: var(--color-error);
    }

    /* Inline search */
    .inline-search {
      margin-top: var(--spacing-3);
      padding-top: var(--spacing-3);
      border-top: 1px solid var(--color-border-subtle);
    }

    .search-input-row {
      display: flex;
      gap: var(--spacing-2);
      margin-bottom: var(--spacing-3);
    }

    .search-input-row input {
      flex: 1;
      font-family: var(--body-font-family);
      font-size: var(--font-size-sm);
      padding: var(--spacing-2) var(--spacing-3);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-input);
      background: var(--color-bg-elevated);
      color: var(--color-text);
    }

    .search-input-row input:focus {
      outline: none;
      border-color: var(--color-border-focused);
      box-shadow: var(--focus-ring);
    }

    .search-results-list {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-2);
    }

    .search-result-option {
      display: flex;
      align-items: center;
      gap: var(--spacing-3);
      padding: var(--spacing-2) var(--spacing-3);
      border: 1px solid var(--color-border-subtle);
      border-radius: var(--radius-md);
      cursor: pointer;
      transition: border-color 0.1s ease;
    }

    .search-result-option:hover {
      border-color: var(--color-brand-primary);
      background: var(--color-blue-50);
    }

    .search-empty {
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
      padding: var(--spacing-2);
    }

    /* Empty tab state */
    .empty-state {
      text-align: center;
      padding: var(--spacing-8);
      color: var(--color-text-secondary);
    }

    .empty-state svg {
      width: 48px;
      height: 48px;
      margin-bottom: var(--spacing-3);
    }

    .empty-state p {
      font-size: var(--font-size-sm);
    }

    /* Final actions */
    .final-actions {
      margin-top: var(--spacing-8);
      display: flex;
      justify-content: flex-end;
    }

    @media (max-width: 600px) {
      .tabs {
        overflow-x: auto;
      }

      .book-row {
        flex-wrap: wrap;
      }

      .book-actions {
        width: 100%;
        justify-content: flex-end;
      }

      .comparison {
        grid-template-columns: 1fr;
      }

      .comparison-arrow {
        justify-content: center;
        transform: rotate(90deg);
      }
    }
  `;

  constructor() {
    super();
    this.results = { matched: [], needsReview: [], notFound: [] };
    this.source = '';
    this._matched = [];
    this._needsReview = [];
    this._notFound = [];
    this._activeTab = 'matched';
    this._searchingIndex = -1;
    this._searchQuery = '';
    this._searchResults = [];
  }

  willUpdate(changed) {
    if (changed.has('results') && this.results) {
      this._matched = [...(this.results.matched || [])];
      this._needsReview = [...(this.results.needsReview || [])];
      this._notFound = [...(this.results.notFound || [])];

      // Default to the tab with the most items to review
      if (this._needsReview.length > 0) {
        this._activeTab = 'review';
      } else if (this._notFound.length > 0) {
        this._activeTab = 'notFound';
      } else {
        this._activeTab = 'matched';
      }
    }
  }

  // ── Tab switching ──
  _switchTab(tab) {
    this._activeTab = tab;
    this._closeSearch();
  }

  // ── Matched tab actions ──
  _removeMatched(index) {
    this._matched = this._matched.filter((_, i) => i !== index);
    this.requestUpdate();
  }

  _undoAllMatched() {
    this._matched = [];
    this.requestUpdate();
  }

  // ── Review tab actions ──
  _acceptMatch(index) {
    const item = this._needsReview[index];
    if (item.candidates?.[0]) {
      this._matched = [...this._matched, {
        source: item.source,
        match: item.candidates[0],
        confidence: item.candidates[0].confidence,
      }];
    }
    this._needsReview = this._needsReview.filter((_, i) => i !== index);
    this._closeSearch();
  }

  _skipReview(index) {
    this._needsReview = this._needsReview.filter((_, i) => i !== index);
    this._closeSearch();
  }

  _acceptAllReview() {
    for (const item of this._needsReview) {
      if (item.candidates?.[0]) {
        this._matched.push({
          source: item.source,
          match: item.candidates[0],
          confidence: item.candidates[0].confidence,
        });
      }
    }
    this._matched = [...this._matched];
    this._needsReview = [];
    this._closeSearch();
  }

  _skipAllReview() {
    this._needsReview = [];
    this._closeSearch();
  }

  // ── Not Found tab actions ──
  _addAsNew(index) {
    const item = this._notFound[index];
    this._matched = [...this._matched, {
      source: item.source,
      match: { title: item.source.title, author: item.source.author, coverUrl: '', addedAsNew: true },
      confidence: 0,
    }];
    this._notFound = this._notFound.filter((_, i) => i !== index);
    this._closeSearch();
  }

  _skipNotFound(index) {
    this._notFound = this._notFound.filter((_, i) => i !== index);
    this._closeSearch();
  }

  _addAllAsNew() {
    for (const item of this._notFound) {
      this._matched.push({
        source: item.source,
        match: { title: item.source.title, author: item.source.author, coverUrl: '', addedAsNew: true },
        confidence: 0,
      });
    }
    this._matched = [...this._matched];
    this._notFound = [];
  }

  _skipAllNotFound() {
    this._notFound = [];
    this._closeSearch();
  }

  // ── Inline search ──
  _openSearch(index) {
    this._searchingIndex = index;
    this._searchQuery = '';
    this._searchResults = [];
    this.updateComplete.then(() => {
      const input = this.renderRoot.querySelector('.search-input');
      if (input) input.focus();
    });
  }

  _closeSearch() {
    this._searchingIndex = -1;
    this._searchQuery = '';
    this._searchResults = [];
  }

  async _onSearchInput(e) {
    this._searchQuery = e.target.value;
    if (this._searchQuery.length < 2) {
      this._searchResults = [];
      return;
    }
    await searchDataService.ensureLoaded();
    this._searchResults = searchDataService.searchBooks(this._searchQuery).slice(0, 5);
  }

  _selectSearchResult(result, listName, index) {
    if (listName === 'review') {
      // Replace the review item with a matched item
      const item = this._needsReview[index];
      this._matched = [...this._matched, {
        source: item.source,
        match: result,
        confidence: 100,
      }];
      this._needsReview = this._needsReview.filter((_, i) => i !== index);
    } else {
      // Not found → matched
      const item = this._notFound[index];
      this._matched = [...this._matched, {
        source: item.source,
        match: result,
        confidence: 100,
      }];
      this._notFound = this._notFound.filter((_, i) => i !== index);
    }
    this._closeSearch();
  }

  // ── Finish ──
  _finish() {
    const finalBooks = this._matched.map((m) => ({
      title: m.match?.title || m.source.title,
      author: m.match?.author || m.source.author,
      coverUrl: m.match?.coverUrl || '',
      shelf: m.source.mappedShelf || m.source.shelf,
      rating: m.source.rating,
      review: m.source.review,
      dateRead: m.source.dateRead,
      isbn: m.source.isbn,
      addedAsNew: m.match?.addedAsNew || false,
    }));

    this.dispatchEvent(new CustomEvent('ol-import-step-complete', {
      bubbles: true,
      composed: true,
      detail: { step: 4, data: { finalBooks } },
    }));
  }

  // ── Render helpers ──

  _bookIcon() {
    return svg`
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    `;
  }

  _renderCover(coverUrl) {
    if (coverUrl) {
      return html`<img class="book-cover" src="${coverUrl}" alt="" loading="lazy" />`;
    }
    return html`<div class="book-cover-placeholder"><svg viewBox="0 0 24 24">${this._bookIcon()}</svg></div>`;
  }

  _confidenceClass(confidence) {
    if (confidence >= 80) return 'high';
    if (confidence >= 50) return 'medium';
    return 'low';
  }

  _renderInlineSearch(listName, index) {
    if (this._searchingIndex !== index) return '';

    return html`
      <div class="inline-search">
        <div class="search-input-row">
          <input
            class="search-input"
            type="text"
            placeholder="Search Open Library..."
            .value=${this._searchQuery}
            @input=${this._onSearchInput}
          />
          <button class="action-btn" @click=${this._closeSearch}>Cancel</button>
        </div>
        ${this._searchResults.length > 0 ? html`
          <div class="search-results-list">
            ${this._searchResults.map((r) => html`
              <div class="search-result-option" @click=${() => this._selectSearchResult(r, listName, index)}>
                ${this._renderCover(r.coverUrl)}
                <div class="book-info">
                  <div class="book-title">${r.title}</div>
                  <div class="book-author">${r.author}</div>
                </div>
              </div>
            `)}
          </div>
        ` : this._searchQuery.length >= 2 ? html`
          <div class="search-empty">No results found for "${this._searchQuery}"</div>
        ` : ''}
      </div>
    `;
  }

  _renderMatchedTab() {
    if (this._matched.length === 0) {
      return html`<div class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/></svg>
        <p>No matched books yet.</p>
      </div>`;
    }

    return html`
      <div class="bulk-actions">
        <span>${this._matched.length} book${this._matched.length !== 1 ? 's' : ''}</span>
        <button class="bulk-btn" @click=${this._undoAllMatched}>Remove All</button>
      </div>
      <div class="book-list">
        ${this._matched.map((item, i) => html`
          <div class="book-item">
            <div class="book-row">
              ${this._renderCover(item.match?.coverUrl)}
              <div class="book-info">
                <div class="book-title">${item.match?.title || item.source.title}</div>
                <div class="book-author">${item.match?.author || item.source.author}</div>
                <div class="book-meta">
                  <span class="shelf-badge">${item.source.mappedShelf || item.source.shelf}</span>
                  ${item.source.rating ? html`<ol-star-rating value="${item.source.rating}" size="small" readonly></ol-star-rating>` : ''}
                  ${item.match?.addedAsNew ? html`<span class="shelf-badge">Added as new</span>` : ''}
                </div>
              </div>
              <div class="book-actions">
                <button class="action-btn destructive" @click=${() => this._removeMatched(i)}>Remove</button>
              </div>
            </div>
          </div>
        `)}
      </div>
    `;
  }

  _renderReviewTab() {
    if (this._needsReview.length === 0) {
      return html`<div class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        <p>All items reviewed!</p>
      </div>`;
    }

    return html`
      <div class="bulk-actions">
        <span>${this._needsReview.length} book${this._needsReview.length !== 1 ? 's' : ''} to review</span>
        <button class="bulk-btn" @click=${this._acceptAllReview}>Accept All</button>
        <button class="bulk-btn" @click=${this._skipAllReview}>Skip All</button>
      </div>
      <div class="book-list">
        ${this._needsReview.map((item, i) => html`
          <div class="book-item">
            <div class="book-row">
              <div class="book-info">
                <div class="book-title">${item.source.title}</div>
                <div class="book-author">${item.source.author}</div>
              </div>
              <div class="book-actions">
                <button class="action-btn primary" @click=${() => this._acceptMatch(i)}>Accept</button>
                <button class="action-btn" @click=${() => this._openSearch(i)}>Search</button>
                <button class="action-btn" @click=${() => this._skipReview(i)}>Skip</button>
              </div>
            </div>
            ${item.candidates?.length ? html`
              <div class="comparison">
                <div class="comparison-side">
                  <div class="comparison-label">Your book</div>
                  <div class="book-title">${item.source.title}</div>
                  <div class="book-author">${item.source.author}</div>
                  ${item.source.isbn ? html`<div class="book-author">ISBN: ${item.source.isbn}</div>` : ''}
                </div>
                <div class="comparison-arrow">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </div>
                <div class="comparison-side">
                  <div class="comparison-label">Best match</div>
                  <div class="book-title">${item.candidates[0].title}</div>
                  <div class="book-author">${item.candidates[0].author}</div>
                  <span class="confidence ${this._confidenceClass(item.candidates[0].confidence)}">${item.candidates[0].confidence}% match</span>
                </div>
              </div>
            ` : ''}
            ${this._renderInlineSearch('review', i)}
          </div>
        `)}
      </div>
    `;
  }

  _renderNotFoundTab() {
    if (this._notFound.length === 0) {
      return html`<div class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        <p>All items resolved!</p>
      </div>`;
    }

    return html`
      <div class="bulk-actions">
        <span>${this._notFound.length} book${this._notFound.length !== 1 ? 's' : ''} not found</span>
        <button class="bulk-btn" @click=${this._addAllAsNew}>Add All as New</button>
        <button class="bulk-btn" @click=${this._skipAllNotFound}>Skip All</button>
      </div>
      <div class="book-list">
        ${this._notFound.map((item, i) => html`
          <div class="book-item">
            <div class="book-row">
              <div class="book-info">
                <div class="book-title">${item.source.title}</div>
                <div class="book-author">${item.source.author}</div>
                <div class="book-meta">
                  ${item.source.isbn ? html`<span class="shelf-badge">ISBN: ${item.source.isbn}</span>` : ''}
                  <span class="shelf-badge">${item.source.mappedShelf || item.source.shelf}</span>
                </div>
              </div>
              <div class="book-actions">
                <button class="action-btn" @click=${() => this._openSearch(i)}>Search</button>
                <button class="action-btn primary" @click=${() => this._addAsNew(i)}>Add as New</button>
                <button class="action-btn" @click=${() => this._skipNotFound(i)}>Skip</button>
              </div>
            </div>
            ${this._renderInlineSearch('notFound', i)}
          </div>
        `)}
      </div>
    `;
  }

  render() {
    const totalProcessed = this._matched.length + this._needsReview.length + this._notFound.length;
    const matchedPct = totalProcessed ? (this._matched.length / totalProcessed * 100) : 0;
    const reviewPct = totalProcessed ? (this._needsReview.length / totalProcessed * 100) : 0;
    const notFoundPct = totalProcessed ? (this._notFound.length / totalProcessed * 100) : 0;

    return html`
      <div class="summary-header">
        <h2>${this._matched.length} of ${totalProcessed} books ready</h2>
        <div class="breakdown-bar">
          <div class="bar-segment bar-matched" style="width: ${matchedPct}%"></div>
          <div class="bar-segment bar-review" style="width: ${reviewPct}%"></div>
          <div class="bar-segment bar-not-found" style="width: ${notFoundPct}%"></div>
        </div>
        <div class="breakdown-legend">
          <span class="legend-item"><span class="legend-dot" style="background: var(--color-brand-primary)"></span> Matched (${this._matched.length})</span>
          <span class="legend-item"><span class="legend-dot" style="background: #f59e0b"></span> Needs Review (${this._needsReview.length})</span>
          <span class="legend-item"><span class="legend-dot" style="background: var(--color-neutral-400)"></span> Not Found (${this._notFound.length})</span>
        </div>
      </div>

      <div class="tabs" role="tablist">
        <button class="tab ${this._activeTab === 'matched' ? 'active' : ''}" role="tab" @click=${() => this._switchTab('matched')}>
          Imported <span class="tab-badge">${this._matched.length}</span>
        </button>
        <button class="tab ${this._activeTab === 'review' ? 'active' : ''}" role="tab" @click=${() => this._switchTab('review')}>
          Needs Review <span class="tab-badge">${this._needsReview.length}</span>
        </button>
        <button class="tab ${this._activeTab === 'notFound' ? 'active' : ''}" role="tab" @click=${() => this._switchTab('notFound')}>
          Not Found <span class="tab-badge">${this._notFound.length}</span>
        </button>
      </div>

      ${this._activeTab === 'matched' ? this._renderMatchedTab() : ''}
      ${this._activeTab === 'review' ? this._renderReviewTab() : ''}
      ${this._activeTab === 'notFound' ? this._renderNotFoundTab() : ''}

      <div class="final-actions">
        <ol-button variant="primary" @click=${this._finish}>
          Finish Import (${this._matched.length} book${this._matched.length !== 1 ? 's' : ''})
        </ol-button>
      </div>
    `;
  }
}

customElements.define('ol-import-results', OlImportResults);

/**
 * Shared search logic, data caching, and localStorage management.
 * Plain JavaScript — no Lit dependency.
 */

const STORAGE_KEY = 'ol-past-searches';
const MAX_PAST_SEARCHES = 10;

class SearchDataService {
  constructor() {
    this._books = null;
    this._series = null;
    this._authors = null;
    this._loading = null;
  }

  /** Ensure data is fetched and cached. Safe to call multiple times. */
  async ensureLoaded() {
    if (this._books && this._series) return;
    if (this._loading) return this._loading;

    this._loading = this._fetchAll();
    await this._loading;
    this._loading = null;
  }

  async _fetchAll() {
    const base = import.meta.env?.BASE_URL ?? '/';
    const [booksRes, seriesRes] = await Promise.all([
      fetch(`${base}data/books.json`),
      fetch(`${base}data/series.json`),
    ]);
    this._books = await booksRes.json();
    this._series = await seriesRes.json();
    this._authors = this._deriveAuthors(this._books);
  }

  /** Extract unique authors from books data. */
  _deriveAuthors(books) {
    const counts = {};
    for (const book of books) {
      const name = book.author?.trim();
      if (name) {
        counts[name] = (counts[name] || 0) + 1;
      }
    }
    return Object.entries(counts)
      .map(([name, bookCount]) => ({ name, bookCount }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  // ─── Search Functions ──────────────────────────────

  searchBooks(query) {
    if (!this._books || !query) return [];
    const q = query.toLowerCase();
    return this._books.filter(
      (b) =>
        b.title?.toLowerCase().includes(q) ||
        b.author?.toLowerCase().includes(q)
    );
  }

  searchAuthors(query) {
    if (!this._authors || !query) return [];
    const q = query.toLowerCase();
    return this._authors.filter((a) => a.name.toLowerCase().includes(q));
  }

  searchSeries(query) {
    if (!this._series || !query) return [];
    const q = query.toLowerCase();
    return this._series.filter((s) => s.title?.toLowerCase().includes(q));
  }

  /** Get all books (for filters page). */
  getBooks() {
    return this._books || [];
  }

  /** Get all authors. */
  getAuthors() {
    return this._authors || [];
  }

  /** Get all series. */
  getSeries() {
    return this._series || [];
  }

  // ─── Text Highlighting ─────────────────────────────

  /**
   * Split `text` into segments: { text, highlight }.
   * Returns an array like [{text:'The ', highlight:false}, {text:'Hunger', highlight:true}, ...]
   */
  highlightMatch(text, query) {
    if (!query || !text) return [{ text: text || '', highlight: false }];
    const q = query.toLowerCase();
    const lower = text.toLowerCase();
    const segments = [];
    let last = 0;
    let idx = lower.indexOf(q, last);

    while (idx !== -1) {
      if (idx > last) {
        segments.push({ text: text.slice(last, idx), highlight: false });
      }
      segments.push({ text: text.slice(idx, idx + query.length), highlight: true });
      last = idx + query.length;
      idx = lower.indexOf(q, last);
    }

    if (last < text.length) {
      segments.push({ text: text.slice(last), highlight: false });
    }

    return segments.length ? segments : [{ text, highlight: false }];
  }

  // ─── Past Searches (localStorage) ──────────────────

  getPastSearches() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  addPastSearch(query) {
    if (!query?.trim()) return;
    const q = query.trim();
    let searches = this.getPastSearches().filter((s) => s !== q);
    searches.unshift(q);
    if (searches.length > MAX_PAST_SEARCHES) {
      searches = searches.slice(0, MAX_PAST_SEARCHES);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(searches));
  }

  removePastSearch(query) {
    const searches = this.getPastSearches().filter((s) => s !== query);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(searches));
  }

  clearPastSearches() {
    localStorage.removeItem(STORAGE_KEY);
  }
}

/** Singleton instance shared across the app. */
const searchDataService = new SearchDataService();
export default searchDataService;

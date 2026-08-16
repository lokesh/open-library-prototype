/**
 * CatalogService — loads the mock catalog and answers questions about books:
 * collections (trending, subjects, by author), search, and the Access decision
 * table (lending state → verb + state line). Plain JS, no Lit.
 */
const STORAGE_KEY = 'ol-catalog-cache';

class CatalogService {
  constructor() {
    this._books = null;
    this._byKey = new Map();
    this._loading = null;
  }

  async ensureLoaded() {
    if (this._books) return this._books;
    if (!this._loading) {
      const base = import.meta.env.BASE_URL || '/';
      this._loading = fetch(`${base}data/catalog.json`).then(r => r.json()).then(books => {
        this._books = books;
        books.forEach(b => this._byKey.set(b.key, b));
        return books;
      });
    }
    return this._loading;
  }

  get books() { return this._books || []; }
  get(key) { return this._byKey.get(key); }
  getMany(keys) { return keys.map(k => this._byKey.get(k)).filter(Boolean); }

  // ---- collections ----------------------------------------------------------
  /** Deterministic "trending": mix of modern + classic, readable-first. */
  trending(limit = 18) {
    const score = b => (b.description ? 1000 : 0) + (b.rating * 100) + (b.year > 1990 ? 60 : 0) + (b.ebooks ? 30 : 0) + (b.ratingCount / 100);
    return [...this.books].sort((a, b) => score(b) - score(a)).slice(0, limit);
  }
  classics(limit = 18) {
    return this.books.filter(b => b.year < 1928).sort((a, b) => b.ratingCount - a.ratingCount).slice(0, limit);
  }
  bySubject(subject, limit = 40) {
    const s = subject.toLowerCase();
    return this.books.filter(b => (b.subjects || []).some(x => x.toLowerCase() === s)).slice(0, limit);
  }
  byAuthorKey(authorKey) {
    return this.books.filter(b => b.authorKey === authorKey).sort((a, b) => a.year - b.year);
  }
  authors() {
    const map = new Map();
    for (const b of this.books) {
      const a = map.get(b.authorKey) || { key: b.authorKey, name: b.author, books: [] };
      a.books.push(b); map.set(b.authorKey, a);
    }
    return [...map.values()].sort((a, b) => b.books.length - a.books.length);
  }
  allSubjects() {
    const c = new Map();
    for (const b of this.books) for (const s of (b.subjects || [])) c.set(s, (c.get(s) || 0) + 1);
    return [...c.entries()].sort((a, b) => b[1] - a[1]).map(([name, count]) => ({ name, count }));
  }
  /** Books that share a subject with the given book, excluding it. */
  related(key, limit = 12) {
    const b = this.get(key); if (!b) return [];
    const subj = new Set(b.subjects || []);
    return this.books.filter(x => x.key !== key && (x.subjects || []).some(s => subj.has(s)))
      .concat(this.books.filter(x => x.key !== key && x.authorKey === b.authorKey))
      .filter((x, i, arr) => arr.indexOf(x) === i).slice(0, limit);
  }

  // ---- search ---------------------------------------------------------------
  search(query, { readableOnly = false, subjects = [], authors = [], yearMin, yearMax } = {}) {
    const q = (query || '').trim().toLowerCase();
    let res = this.books;
    if (q) {
      const terms = q.split(/\s+/);
      const scoreOf = b => {
        const hay = `${b.title} ${b.author} ${(b.subjects || []).join(' ')}`.toLowerCase();
        let s = 0;
        for (const t of terms) {
          if (b.title.toLowerCase().includes(t)) s += 3;
          else if (b.author.toLowerCase().includes(t)) s += 2;
          else if (hay.includes(t)) s += 1;
          else return 0;
        }
        return s + b.rating / 10;
      };
      res = res.map(b => [scoreOf(b), b]).filter(([s]) => s > 0).sort((a, b) => b[0] - a[0]).map(([, b]) => b);
    }
    if (readableOnly) res = res.filter(b => this.access(b).readable);
    if (subjects.length) res = res.filter(b => (b.subjects || []).some(s => subjects.includes(s)));
    if (authors.length) res = res.filter(b => authors.includes(b.author));
    if (yearMin) res = res.filter(b => b.year >= yearMin);
    if (yearMax) res = res.filter(b => b.year <= yearMax);
    return res;
  }

  // ---- ACCESS SLOT: the decision table ---------------------------------------
  /**
   * @param {object} book
   * @param {object} opts  { locate: 'F1'|'F2'|'F3' }  how the no-copy case renders
   * @returns {{label, short, style, state, ext, isLocate, readable, badge}}
   *   style: 'fill' | 'outline' | 'none'
   */
  access(book, opts = {}) {
    const locate = opts.locate || 'F1';
    switch (book.lendingState) {
      case 'borrowable': {
        const [n, m] = book.copies || [1, 1];
        return { label: 'Borrow', short: 'Borrow', style: 'fill', readable: true, state: `${n} of ${m} ${m === 1 ? 'copy' : 'copies'} available` };
      }
      case 'open':
        return { label: 'Read', short: 'Read', style: 'fill', readable: true, state: 'Free to read' };
      case 'partner':
        return { label: `Read on ${book.provider}`, short: 'Read', style: 'fill', ext: true, readable: true, state: 'Free · leaves Open Library' };
      case 'waitlist':
        return { label: 'Join waitlist', short: 'Waitlist', style: 'fill', readable: false, state: `${book.queue} readers in line`, badge: 'Waitlist' };
      case 'preview_only':
        return { label: 'Preview', short: 'Preview', style: 'fill', readable: false, state: 'Preview only · no full text', badge: 'Preview' };
      case 'checkedout':
      case 'none': {
        const why = book.lendingState === 'checkedout' ? 'All copies checked out' : 'Not available online';
        const noIds = book.lendingState === 'none' && book.hasIdentifiers === false;
        if (locate === 'F3' || noIds) return { label: null, style: 'none', readable: false, state: why, badge: 'Not online' };
        return { label: 'Find in a library', short: 'Find', style: locate === 'F2' ? 'fill' : 'outline', ext: true, isLocate: true, readable: false, state: why, badge: 'Not online' };
      }
      default:
        return { label: null, style: 'none', readable: false, state: '' };
    }
  }

  /** What production shows today (for the "Today" preset). */
  accessToday(book) {
    switch (book.lendingState) {
      case 'borrowable': return { label: 'Borrow', style: 'fill' };
      case 'open': return { label: 'Read', style: 'fill' };
      case 'partner': return { label: 'Read', style: 'fill', ext: true };
      case 'waitlist': return { label: 'Join Waitlist', style: 'fill' };
      case 'preview_only': return { label: 'Preview Only', style: 'fill' };
      case 'checkedout': return { label: 'Checked Out', style: 'fill' };
      default: return { label: 'Not in Library', style: 'dead' };
    }
  }
}

const catalogService = new CatalogService();
export default catalogService;

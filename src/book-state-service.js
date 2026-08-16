/**
 * BookStateService — the signed-in reader's relationship to books:
 * shelf, lists, ratings, and whether they're signed in at all.
 * Persisted to localStorage; fires `ol-book-state-change` on document.
 */
const KEY = 'ol-book-state-v1';

export const SHELVES = {
  want: 'Want to Read',
  reading: 'Currently Reading',
  read: 'Already Read',
  stopped: 'Stopped Reading',
};
export const SHELF_SHORT = { want: 'Want to Read', reading: 'Reading', read: 'Read', stopped: 'Stopped' };
export const SHELF_SLUG = { want: 'want-to-read', reading: 'currently-reading', read: 'already-read', stopped: 'stopped-reading' };

const DEFAULTS = {
  loggedIn: true,
  shelves: {          // bookKey -> shelf id
    'beloved': 'reading', 'project-hail-mary': 'reading', 'circe': 'reading',
    'pachinko': 'want', 'the-song-of-achilles': 'want', 'dune': 'want', 'educated': 'want', 'the-book-thief': 'want',
    'the-hobbit': 'read', 'pride-and-prejudice': 'read', 'the-hunger-games': 'read', 'gone-girl': 'read',
    'the-catcher-in-the-rye': 'stopped',
  },
  dates: { 'beloved': '2026-07-12', 'project-hail-mary': '2026-08-02', 'the-hobbit': '2026-05-20', 'the-hunger-games': '2026-03-14', 'gone-girl': '2026-06-30', 'pride-and-prejudice': '2026-01-08' },
  ratings: { 'the-hobbit': 5, 'pride-and-prejudice': 4, 'the-hunger-games': 4, 'gone-girl': 3 },
  lists: [
    { id: 'summer-2026', name: 'Summer 2026', description: 'Long, sunny, mostly fiction.', keys: ['dune', 'circe', 'the-song-of-achilles', 'pachinko', 'where-the-crawdads-sing', 'the-goldfinch'] },
    { id: 'sci-fi-to-reread', name: 'Sci-fi to reread', description: 'The ones that got better the second time.', keys: ['dune', 'neuromancer', 'ender-s-game', 'the-hitchhiker-s-guide-to-the-galaxy', 'brave-new-world'] },
    { id: 'gothic-autumn', name: 'Gothic autumn', description: '', keys: ['frankenstein', 'dracula', 'jane-eyre', 'wuthering-heights', 'the-picture-of-dorian-gray'] },
  ],
};

class BookStateService {
  constructor() {
    this._state = this._load();
  }
  _load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) return { ...structuredClone(DEFAULTS), ...JSON.parse(raw) };
    } catch {}
    return structuredClone(DEFAULTS);
  }
  _save(detail = {}) {
    localStorage.setItem(KEY, JSON.stringify(this._state));
    document.dispatchEvent(new CustomEvent('ol-book-state-change', { detail }));
  }
  reset() { this._state = structuredClone(DEFAULTS); this._save({ reset: true }); }

  // ---- session ---------------------------------------------------------------
  get loggedIn() { return !!this._state.loggedIn; }
  set loggedIn(v) { this._state.loggedIn = !!v; this._save({ loggedIn: v }); }

  // ---- shelves ---------------------------------------------------------------
  shelfOf(key) { return this.loggedIn ? (this._state.shelves[key] || null) : null; }
  shelfLabel(key, short = false) {
    const s = this.shelfOf(key);
    if (!s) return 'Want to Read';
    return (short ? SHELF_SHORT : SHELVES)[s];
  }
  setShelf(key, shelf) {
    if (shelf) { this._state.shelves[key] = shelf; if (!this._state.dates[key]) this._state.dates[key] = new Date().toISOString().slice(0, 10); }
    else { delete this._state.shelves[key]; delete this._state.dates[key]; }
    this._save({ key, shelf });
  }
  dateOf(key) { return this._state.dates[key] || null; }
  keysOnShelf(shelf) { return Object.entries(this._state.shelves).filter(([, s]) => s === shelf).map(([k]) => k); }
  shelfCounts() {
    const c = { want: 0, reading: 0, read: 0, stopped: 0 };
    for (const s of Object.values(this._state.shelves)) if (c[s] !== undefined) c[s]++;
    return c;
  }

  // ---- ratings ---------------------------------------------------------------
  ratingOf(key) { return this.loggedIn ? (this._state.ratings[key] || 0) : 0; }
  setRating(key, n) { if (n) this._state.ratings[key] = n; else delete this._state.ratings[key]; this._save({ key, rating: n }); }

  // ---- lists -----------------------------------------------------------------
  get lists() { return this._state.lists; }
  list(id) { return this._state.lists.find(l => l.id === id); }
  listsContaining(key) { return this._state.lists.filter(l => l.keys.includes(key)); }
  toggleList(listId, key) {
    const l = this.list(listId); if (!l) return false;
    const i = l.keys.indexOf(key);
    if (i >= 0) l.keys.splice(i, 1); else l.keys.push(key);
    this._save({ key, listId, inList: i < 0 });
    return i < 0;
  }
  createList(name, key) {
    const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || `list-${Date.now()}`;
    this._state.lists.push({ id, name, description: '', keys: key ? [key] : [] });
    this._save({ key, listId: id, inList: true, created: true });
    return id;
  }
  removeFromList(listId, key) {
    const l = this.list(listId); if (!l) return;
    l.keys = l.keys.filter(k => k !== key); this._save({ key, listId, inList: false });
  }
}

const bookStateService = new BookStateService();
export default bookStateService;

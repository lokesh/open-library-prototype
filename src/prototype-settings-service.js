/**
 * PrototypeSettingsService — the variant switches from the "Views & Verbs"
 * exploration. Persisted to localStorage; fires `ol-settings-change`.
 *
 * row:     'today' | 'R3' | 'R6' | 'R1' | 'R4'   — the action row shape
 * tile:    'G2' | 'G3' | 'G4'                    — Save at tile width
 * locate:  'F1' | 'F2' | 'F3'                    — the no-online-copy case
 * density: 'standard' | 'dense'                  — L2 vs L1 rows
 * descMode:'none' | 'paragraph'                  — description in list rows
 * peek:    boolean                               — click a row to open the side panel
 * intent:  boolean                               — manage surfaces lead with the shelf
 */
const KEY = 'ol-prototype-settings-v1';

export const PRESETS = {
  today: { row: 'today', tile: 'G2', locate: 'F1', density: 'standard', descMode: 'none', peek: false, intent: false },
  recommended: { row: 'R3', tile: 'G3', locate: 'F1', density: 'standard', descMode: 'none', peek: true, intent: true },
};

export const CONTROLS = [
  { key: 'row', label: 'Action row', options: [['today', 'Today'], ['R3', 'R3 stacked'], ['R6', 'R6 horizontal'], ['R1', 'R1 kebab'], ['R4', 'R4 single split']],
    note: 'R3 = Access + "Save ▾" split; R6 = same, side by side; R1 = Access + ⋮; R4 = one split holding everything.' },
  { key: 'tile', label: 'Grid / carousel tile', options: [['G2', 'G2 access only'], ['G3', 'G3 corner Save'], ['G4', 'G4 strip']], note: 'How Save fits at tile width.' },
  { key: 'locate', label: 'No online copy', options: [['F1', 'F1 outlined'], ['F2', 'F2 filled'], ['F3', 'F3 empty slot']], note: 'What the Access slot shows when nothing is readable.' },
  { key: 'density', label: 'List density', options: [['standard', 'L2 standard'], ['dense', 'L1 dense']] },
  { key: 'descMode', label: 'Description in list rows', options: [['none', 'None'], ['paragraph', 'D1 paragraph']],
    note: 'Paragraph = the old "Show descriptions" toggle, kept for comparison.' },
  { key: 'flags', label: 'Flags', flags: [['peek', 'Peek panel: click a row to open the book beside the results'], ['intent', 'Intent-aware: shelf leads on manage pages']] },
];

class PrototypeSettingsService {
  constructor() {
    let saved = {};
    try { saved = JSON.parse(localStorage.getItem(KEY) || '{}'); } catch {}
    this._s = { ...PRESETS.recommended, ...saved };
    if (this._s.descMode === 'teaser') this._s.descMode = 'none';
  }
  get() { return { ...this._s }; }
  set(patch) {
    Object.assign(this._s, patch);
    localStorage.setItem(KEY, JSON.stringify(this._s));
    document.dispatchEvent(new CustomEvent('ol-settings-change', { detail: this.get() }));
  }
  preset(name) { this.set(PRESETS[name]); }
  get isToday() { return this._s.row === 'today'; }
}

const prototypeSettings = new PrototypeSettingsService();
export default prototypeSettings;

/**
 * Manages user role state (reader vs librarian).
 * Plain JavaScript — no Lit dependency.
 */

const STORAGE_KEY = 'ol-user-role';
const DEFAULT_ROLE = 'reader';

class UserRoleService {
  constructor() {
    this._role = localStorage.getItem(STORAGE_KEY) || DEFAULT_ROLE;
  }

  get role() {
    return this._role;
  }

  get isLibrarian() {
    return this._role === 'librarian';
  }

  toggle() {
    this._role = this._role === 'reader' ? 'librarian' : 'reader';
    localStorage.setItem(STORAGE_KEY, this._role);
    document.dispatchEvent(new CustomEvent('ol-role-change', {
      detail: { role: this._role },
    }));
  }
}

/** Singleton instance shared across the app. */
const userRoleService = new UserRoleService();
export default userRoleService;

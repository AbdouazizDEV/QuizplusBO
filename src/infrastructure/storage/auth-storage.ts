const KEY_AUTH = 'qzbo:authed';
const KEY_EMAIL = 'qzbo:email';

export const authStorage = {
  setAuthed(authed: boolean): void {
    try {
      if (authed) localStorage.setItem(KEY_AUTH, '1');
      else localStorage.removeItem(KEY_AUTH);
    } catch {
      // noop (Safari private mode etc.)
    }
  },
  isAuthed(): boolean {
    try {
      return localStorage.getItem(KEY_AUTH) === '1';
    } catch {
      return false;
    }
  },
  setEmail(email: string | null): void {
    try {
      if (email) localStorage.setItem(KEY_EMAIL, email);
      else localStorage.removeItem(KEY_EMAIL);
    } catch {
      // noop
    }
  },
  getEmail(): string | null {
    try {
      return localStorage.getItem(KEY_EMAIL);
    } catch {
      return null;
    }
  },
};

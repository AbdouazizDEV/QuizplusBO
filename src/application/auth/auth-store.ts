import { create } from 'zustand';
import { authStorage } from '@infrastructure/storage/auth-storage';

interface AuthState {
  authed: boolean;
  email: string | null;
  signIn: (email: string) => void;
  signOut: () => void;
  init: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  authed: false,
  email: null,
  init: () => {
    set({ authed: authStorage.isAuthed(), email: authStorage.getEmail() });
  },
  signIn: (email: string) => {
    authStorage.setAuthed(true);
    authStorage.setEmail(email);
    set({ authed: true, email });
  },
  signOut: () => {
    authStorage.setAuthed(false);
    authStorage.setEmail(null);
    set({ authed: false, email: null });
  },
}));

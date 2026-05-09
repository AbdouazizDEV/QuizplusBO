import { beforeEach, describe, expect, it } from 'vitest';
import { useAuthStore } from '@application/auth/auth-store';

describe('auth-store', () => {
  beforeEach(() => {
    localStorage.clear();
    useAuthStore.setState({ email: null, authed: false });
  });

  it('signIn persiste l’email et passe authed=true', () => {
    useAuthStore.getState().signIn('admin@example.com');
    const state = useAuthStore.getState();
    expect(state.email).toBe('admin@example.com');
    expect(state.authed).toBe(true);
    expect(localStorage.getItem('qzbo:authed')).toBe('1');
    expect(localStorage.getItem('qzbo:email')).toBe('admin@example.com');
  });

  it('signOut nettoie tout', () => {
    useAuthStore.getState().signIn('admin@example.com');
    useAuthStore.getState().signOut();
    const state = useAuthStore.getState();
    expect(state.email).toBeNull();
    expect(state.authed).toBe(false);
    expect(localStorage.getItem('qzbo:authed')).toBeNull();
    expect(localStorage.getItem('qzbo:email')).toBeNull();
  });

  it('init relit le storage', () => {
    localStorage.setItem('qzbo:authed', '1');
    localStorage.setItem('qzbo:email', 'persist@example.com');
    useAuthStore.getState().init();
    const state = useAuthStore.getState();
    expect(state.email).toBe('persist@example.com');
    expect(state.authed).toBe(true);
  });
});

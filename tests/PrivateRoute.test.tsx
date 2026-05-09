import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { PrivateRoute } from '@presentation/routes/PrivateRoute';
import { useAuthStore } from '@application/auth/auth-store';

function setup(initialPath: string) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route
          path="/"
          element={
            <PrivateRoute>
              <p>Privé</p>
            </PrivateRoute>
          }
        />
        <Route path="/login" element={<p>Login</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('<PrivateRoute />', () => {
  beforeEach(() => {
    localStorage.clear();
    useAuthStore.setState({ email: null, authed: false });
  });

  it('redirige vers /login si non authentifié', () => {
    setup('/');
    expect(screen.getByText('Login')).toBeInTheDocument();
  });

  it('rend les enfants si authentifié', () => {
    useAuthStore.setState({ email: 'admin@example.com', authed: true });
    setup('/');
    expect(screen.getByText('Privé')).toBeInTheDocument();
  });
});

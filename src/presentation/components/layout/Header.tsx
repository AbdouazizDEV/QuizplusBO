import { Menu, Moon, Sun, LogOut, User } from 'lucide-react';
import { useTheme } from '@presentation/theme/ThemeProvider';
import { useAuthStore } from '@application/auth/auth-store';
import { Button } from '../ui/Button';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  onOpenSidebar: () => void;
}

export function Header({ onOpenSidebar }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const signOut = useAuthStore((s) => s.signOut);
  const email = useAuthStore((s) => s.email);
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-background/85 px-4 backdrop-blur-md sm:px-6">
      <button
        type="button"
        onClick={onOpenSidebar}
        className="rounded-lg p-2 text-muted hover:bg-surfaceMuted hover:text-foreground lg:hidden"
        aria-label="Ouvrir le menu"
      >
        <Menu className="h-5 w-5" />
      </button>
      <div className="flex flex-1 items-center justify-end gap-2">
        {email ? (
          <div className="hidden items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 sm:flex">
            <span className="quizz-gradient inline-flex h-6 w-6 items-center justify-center rounded-full text-white">
              <User className="h-3 w-3" />
            </span>
            <span className="text-xs font-semibold text-foreground max-w-[200px] truncate">
              {email}
            </span>
          </div>
        ) : null}

        <button
          type="button"
          onClick={toggleTheme}
          aria-label="Changer le thème"
          className="rounded-lg p-2 text-muted hover:bg-surfaceMuted hover:text-foreground"
        >
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>

        <Button
          size="sm"
          variant="secondary"
          leftIcon={<LogOut className="h-4 w-4" />}
          onClick={() => {
            signOut();
            navigate('/login', { replace: true });
          }}
        >
          Déconnexion
        </Button>
      </div>
    </header>
  );
}

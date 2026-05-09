import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Layers,
  FolderTree,
  Folder,
  ListTodo,
  Swords,
  Trophy,
  Users,
  Bell,
  ImageUp,
  X,
} from 'lucide-react';
import { cn } from '@shared/lib/cn';
import { Logo } from './Logo';
import type { LucideIcon } from 'lucide-react';

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  group?: string;
}

const NAV: NavItem[] = [
  { to: '/', label: 'Tableau de bord', icon: LayoutDashboard, group: 'Général' },
  { to: '/levels', label: 'Niveaux', icon: Layers, group: 'Catalogue' },
  { to: '/categories', label: 'Catégories', icon: FolderTree, group: 'Catalogue' },
  { to: '/subcategories', label: 'Sous-catégories', icon: Folder, group: 'Catalogue' },
  { to: '/quizzes', label: 'Quiz', icon: ListTodo, group: 'Contenus' },
  { to: '/challenges', label: 'Défis', icon: Swords, group: 'Contenus' },
  { to: '/competitions', label: 'Compétitions', icon: Trophy, group: 'Contenus' },
  { to: '/profiles', label: 'Profils', icon: Users, group: 'Audience' },
  { to: '/notifications', label: 'Notifications', icon: Bell, group: 'Audience' },
  { to: '/media', label: 'Upload média', icon: ImageUp, group: 'Outils' },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const groups = NAV.reduce<Record<string, NavItem[]>>((acc, item) => {
    const key = item.group ?? '';
    acc[key] = acc[key] ? [...acc[key], item] : [item];
    return acc;
  }, {});

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={cn(
          'fixed inset-0 z-30 bg-black/40 backdrop-blur-sm lg:hidden transition-opacity',
          open ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        onClick={onClose}
        aria-hidden
      />

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-72 shrink-0 border-r border-border bg-surface transition-transform duration-200',
          'lg:sticky lg:top-0 lg:translate-x-0 lg:h-screen',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-border px-5">
          <Logo />
          <button
            type="button"
            aria-label="Fermer"
            className="rounded-lg p-1.5 text-muted hover:bg-surfaceMuted lg:hidden"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex h-[calc(100vh-4rem)] flex-col overflow-y-auto px-3 py-4 scrollbar-thin">
          {Object.entries(groups).map(([group, items]) => (
            <div key={group} className="mb-2">
              <p className="px-3 pb-1 pt-2 text-2xs font-bold uppercase tracking-[0.16em] text-subtle">
                {group}
              </p>
              <ul className="space-y-1">
                {items.map(({ to, label, icon: Icon }) => (
                  <li key={to}>
                    <NavLink
                      to={to}
                      end={to === '/'}
                      onClick={onClose}
                      className={({ isActive }) =>
                        cn(
                          'group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold transition-colors',
                          isActive
                            ? 'bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300'
                            : 'text-muted hover:bg-surfaceMuted hover:text-foreground',
                        )
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <span
                            className={cn(
                              'absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-brand-500 opacity-0 transition-opacity',
                              isActive && 'opacity-100',
                            )}
                          />
                          <Icon className="h-4 w-4" />
                          <span>{label}</span>
                        </>
                      )}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="mt-auto pt-4">
            <div className="quizz-gradient rounded-2xl p-4 text-white shadow-glow">
              <p className="text-2xs font-bold uppercase tracking-widest opacity-80">Quizz+</p>
              <h4 className="mt-0.5 text-sm font-black">Console admin</h4>
              <p className="mt-1 text-2xs font-medium opacity-90">
                Gérez le contenu et l'audience de l'app mobile en un coup d'œil.
              </p>
            </div>
          </div>
        </nav>
      </aside>
    </>
  );
}

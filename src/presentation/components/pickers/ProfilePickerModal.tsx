import { useMemo, useState } from 'react';
import { Search, Check } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import type { Profile } from '@domain/entities/profile';
import { Modal } from '@presentation/components/ui/Modal';
import { Input } from '@presentation/components/ui/Input';
import { Button } from '@presentation/components/ui/Button';
import { useDebouncedValue } from '@shared/lib/use-debounced-value';
import { formatProfileLabel } from '@shared/lib/profile-label';
import { cn } from '@shared/lib/cn';
import { profilesRepository } from '@infrastructure/repositories/profiles.repository';
import { queryKeys } from '@application/query-keys';

interface ProfilePickerModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (profile: Profile) => void;
  selectedId?: string | null;
  /** Exclure certains profils (ex. éviter challenger = challenged). */
  excludeIds?: string[];
}

export function ProfilePickerModal({
  open,
  onClose,
  onSelect,
  selectedId,
  excludeIds = [],
}: ProfilePickerModalProps) {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 300);

  const list = useQuery({
    queryKey: queryKeys.profiles({ page: 1, limit: 50, search: debouncedSearch || undefined }),
    queryFn: () =>
      profilesRepository.list({ page: 1, limit: 50, search: debouncedSearch || undefined }),
    enabled: open,
  });

  const items = useMemo(() => {
    const exclude = new Set(excludeIds);
    return (list.data?.items ?? []).filter((p) => !exclude.has(p.id));
  }, [list.data?.items, excludeIds]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title="Choisir un joueur"
      description="Recherchez par nom ou pseudo."
      footer={
        <Button variant="secondary" onClick={onClose}>
          Fermer
        </Button>
      }
    >
      <div className="space-y-4">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher un joueur…"
          leftIcon={<Search className="h-4 w-4" />}
        />

        {list.isLoading ? (
          <p className="py-8 text-center text-sm text-muted">Chargement des profils…</p>
        ) : items.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted">Aucun joueur trouvé.</p>
        ) : (
          <ul className="max-h-72 space-y-1 overflow-y-auto scrollbar-thin">
            {items.map((profile) => {
              const selected = profile.id === selectedId;
              return (
                <li key={profile.id}>
                  <button
                    type="button"
                    onClick={() => {
                      onSelect(profile);
                      onClose();
                    }}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors',
                      selected
                        ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/10'
                        : 'border-border hover:bg-surfaceMuted',
                    )}
                  >
                    <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-black text-brand-600 dark:bg-brand-500/20">
                      {(profile.username ?? profile.full_name ?? '?').slice(0, 2).toUpperCase()}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold">
                        {formatProfileLabel(profile)}
                      </span>
                      {profile.is_suspended ? (
                        <span className="block text-2xs text-danger">Profil suspendu</span>
                      ) : null}
                    </span>
                    {selected ? <Check className="h-4 w-4 shrink-0 text-brand-600" /> : null}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Modal>
  );
}


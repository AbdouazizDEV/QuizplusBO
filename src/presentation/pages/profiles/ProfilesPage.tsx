import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Eye, Ban, ShieldCheck, Bell } from 'lucide-react';
import { toast } from 'sonner';
import {
  useProfilesQuery,
  useSuspendProfile,
} from '@application/profiles/use-profiles';
import type { Profile, ProfilesListQuery } from '@domain/entities/profile';
import { PageHeader } from '@presentation/components/data/PageHeader';
import { DataTable, type Column } from '@presentation/components/data/DataTable';
import { Pagination } from '@presentation/components/data/Pagination';
import { Button } from '@presentation/components/ui/Button';
import { Input } from '@presentation/components/ui/Input';
import { Select } from '@presentation/components/ui/Select';
import { Badge } from '@presentation/components/ui/Badge';
import { SuspendProfileModal } from './SuspendProfileModal';
import { useDebouncedValue } from '@shared/lib/use-debounced-value';
import { toastApiError } from '@shared/lib/api-error-toast';
import { formatDate } from '@shared/lib/format';

export default function ProfilesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'' | 'active' | 'suspended'>('');
  const debounced = useDebouncedValue(search, 300);

  const filters: ProfilesListQuery = useMemo(
    () => ({
      page,
      limit: 20,
      search: debounced || undefined,
      is_suspended: filter === 'suspended' ? true : filter === 'active' ? false : undefined,
    }),
    [page, debounced, filter],
  );

  const list = useProfilesQuery(filters);
  const suspendM = useSuspendProfile();
  const [target, setTarget] = useState<Profile | null>(null);

  const columns: Column<Profile>[] = [
    {
      key: 'name',
      header: 'Profil',
      cell: (p) => (
        <div className="flex items-center gap-3">
          <span className="quizz-gradient inline-flex h-9 w-9 items-center justify-center rounded-full text-white font-black text-xs">
            {(p.username ?? p.full_name ?? '?').slice(0, 2).toUpperCase()}
          </span>
          <div className="min-w-0">
            <p className="font-bold truncate">{p.username ?? p.full_name ?? '—'}</p>
            <p className="text-2xs text-muted truncate">{p.full_name && p.username !== p.full_name ? p.full_name : p.id}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Statut',
      width: '160px',
      cell: (p) =>
        p.is_suspended ? <Badge tone="danger">Suspendu</Badge> : <Badge tone="success">Actif</Badge>,
    },
    {
      key: 'until',
      header: 'Suspension jusqu’au',
      width: '200px',
      cell: (p) => <span className="text-xs text-muted">{formatDate(p.suspended_until)}</span>,
    },
    {
      key: 'actions',
      header: <span className="sr-only">Actions</span>,
      align: 'right',
      width: '180px',
      cell: (p) => (
        <div className="flex items-center justify-end gap-1.5">
          <Link to={`/profiles/${p.id}`}>
            <Button variant="ghost" size="icon" aria-label="Voir le détail">
              <Eye className="h-4 w-4" />
            </Button>
          </Link>
          <Link to={`/notifications?user_id=${p.id}`}>
            <Button variant="ghost" size="icon" aria-label="Envoyer une notification">
              <Bell className="h-4 w-4" />
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            aria-label={p.is_suspended ? 'Réactiver' : 'Suspendre'}
            className={p.is_suspended ? 'text-success hover:bg-success/10' : 'text-danger hover:bg-danger/10'}
            onClick={() => setTarget(p)}
          >
            {p.is_suspended ? <ShieldCheck className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumb="Audience"
        title="Profils utilisateurs"
        description="Modérez votre communauté : recherche, suspension, notifications."
      />

      <div className="rounded-2xl border border-border bg-surface p-3 shadow-soft">
        <div className="grid gap-3 sm:grid-cols-3">
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            leftIcon={<Search className="h-4 w-4" />}
            placeholder="Rechercher (username, nom)…"
          />
          <Select
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value as '' | 'active' | 'suspended');
              setPage(1);
            }}
            options={[
              { value: '', label: 'Tous les profils' },
              { value: 'active', label: 'Profils actifs' },
              { value: 'suspended', label: 'Profils suspendus' },
            ]}
          />
          <div className="flex items-center justify-end text-xs text-muted">
            {list.data?.total ?? 0} résultat{(list.data?.total ?? 0) > 1 ? 's' : ''}
          </div>
        </div>
      </div>

      <DataTable<Profile>
        columns={columns}
        data={list.data?.items}
        rowKey={(p) => p.id}
        loading={list.isLoading}
        error={list.error}
        onRetry={() => list.refetch()}
        emptyTitle="Aucun profil"
        emptyDescription="Aucun profil ne correspond à votre recherche."
      />

      <Pagination
        page={list.data?.page ?? page}
        limit={list.data?.limit ?? 20}
        total={list.data?.total ?? 0}
        onPageChange={setPage}
      />

      <SuspendProfileModal
        open={!!target}
        profile={target}
        onClose={() => setTarget(null)}
        submitting={suspendM.isPending}
        onSubmit={async (input) => {
          if (!target) return;
          try {
            await suspendM.mutateAsync({ id: target.id, input });
            toast.success(input.is_suspended ? 'Profil suspendu' : 'Profil réactivé');
            setTarget(null);
          } catch (err) {
            toastApiError(err);
          }
        }}
      />
    </div>
  );
}

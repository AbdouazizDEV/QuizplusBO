import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  useChallengesQuery,
  useCreateChallenge,
  useDeleteChallenge,
  useUpdateChallenge,
} from '@application/challenges/use-challenges';
import type { Challenge, ChallengeStatus } from '@domain/entities/challenge';
import { PageHeader } from '@presentation/components/data/PageHeader';
import { DataTable, type Column } from '@presentation/components/data/DataTable';
import { Pagination } from '@presentation/components/data/Pagination';
import { Button } from '@presentation/components/ui/Button';
import { Badge } from '@presentation/components/ui/Badge';
import { ConfirmDialog } from '@presentation/components/feedback/ConfirmDialog';
import { ChallengeFormModal } from './ChallengeFormModal';
import { toastApiError } from '@shared/lib/api-error-toast';
import { formatDate } from '@shared/lib/format';

const STATUS_TONE: Record<string, 'info' | 'success' | 'warning' | 'danger' | 'neutral'> = {
  pending: 'info',
  accepted: 'warning',
  completed: 'success',
  declined: 'danger',
  expired: 'neutral',
};

function shortId(v?: string | null): string {
  if (!v) return '—';
  return `${v.slice(0, 4)}…${v.slice(-4)}`;
}

export default function ChallengesPage() {
  const [page, setPage] = useState(1);
  const list = useChallengesQuery({ page, limit: 20 });
  const createM = useCreateChallenge();
  const updateM = useUpdateChallenge();
  const deleteM = useDeleteChallenge();

  const [editing, setEditing] = useState<Challenge | null>(null);
  const [openForm, setOpenForm] = useState(false);
  const [toDelete, setToDelete] = useState<Challenge | null>(null);

  const onCreate = () => {
    setEditing(null);
    setOpenForm(true);
  };
  const onEdit = (c: Challenge) => {
    setEditing(c);
    setOpenForm(true);
  };

  const columns: Column<Challenge>[] = [
    {
      key: 'players',
      header: 'Joueurs',
      cell: (c) => (
        <div className="text-sm">
          <span className="font-bold">{shortId(c.challenger_id)}</span>
          <span className="px-1.5 text-muted">vs</span>
          <span className="font-bold">{shortId(c.challenged_id)}</span>
        </div>
      ),
    },
    { key: 'quiz', header: 'Quiz', cell: (c) => <code className="text-xs text-muted">{shortId(c.quiz_id)}</code>, width: '160px' },
    {
      key: 'status',
      header: 'Statut',
      width: '140px',
      cell: (c) => (
        <Badge tone={STATUS_TONE[String(c.status)] ?? 'neutral'}>{String(c.status)}</Badge>
      ),
    },
    {
      key: 'score',
      header: 'Score',
      width: '120px',
      cell: (c) => (
        <span className="tabular-nums text-sm">
          {c.challenger_score ?? '—'} <span className="text-muted">·</span>{' '}
          {c.challenged_score ?? '—'}
        </span>
      ),
    },
    {
      key: 'expires',
      header: 'Expire le',
      width: '180px',
      cell: (c) => <span className="text-xs text-muted">{formatDate(c.expires_at)}</span>,
    },
    {
      key: 'actions',
      header: <span className="sr-only">Actions</span>,
      align: 'right',
      width: '140px',
      cell: (c) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button variant="ghost" size="icon" aria-label="Modifier" onClick={() => onEdit(c)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Supprimer"
            className="text-danger hover:bg-danger/10"
            onClick={() => setToDelete(c)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumb="Contenus"
        title="Défis"
        description="Suivez et gérez les défis lancés entre joueurs."
        actions={
          <Button variant="gradient" leftIcon={<Plus className="h-4 w-4" />} onClick={onCreate}>
            Nouveau défi
          </Button>
        }
      />

      <DataTable<Challenge>
        columns={columns}
        data={list.data?.items}
        rowKey={(r) => r.id}
        loading={list.isLoading}
        error={list.error}
        onRetry={() => list.refetch()}
        emptyTitle="Aucun défi"
        emptyDescription="Créez un défi de test ou attendez les premiers défis utilisateurs."
      />

      <Pagination
        page={list.data?.page ?? page}
        limit={list.data?.limit ?? 20}
        total={list.data?.total ?? 0}
        onPageChange={setPage}
      />

      <ChallengeFormModal
        open={openForm}
        initial={editing}
        onClose={() => setOpenForm(false)}
        submitting={createM.isPending || updateM.isPending}
        onSubmit={async (values) => {
          try {
            if (editing) {
              await updateM.mutateAsync({ id: editing.id, input: values });
              toast.success('Défi mis à jour');
            } else {
              await createM.mutateAsync({
                ...values,
                status: (values.status ?? 'pending') as ChallengeStatus,
              });
              toast.success('Défi créé');
            }
            setOpenForm(false);
          } catch (err) {
            toastApiError(err);
          }
        }}
      />

      <ConfirmDialog
        open={!!toDelete}
        title="Supprimer ce défi ?"
        description="Cette action est irréversible."
        destructive
        loading={deleteM.isPending}
        onCancel={() => setToDelete(null)}
        onConfirm={async () => {
          if (!toDelete) return;
          try {
            await deleteM.mutateAsync(toDelete.id);
            toast.success('Défi supprimé');
            setToDelete(null);
          } catch (err) {
            toastApiError(err);
          }
        }}
      />
    </div>
  );
}

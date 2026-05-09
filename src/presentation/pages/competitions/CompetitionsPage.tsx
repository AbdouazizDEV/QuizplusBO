import { useState } from 'react';
import { Plus, Pencil, Trash2, Trophy } from 'lucide-react';
import { toast } from 'sonner';
import {
  useCompetitionsQuery,
  useCreateCompetition,
  useDeleteCompetition,
  useUpdateCompetition,
} from '@application/competitions/use-competitions';
import type { Competition } from '@domain/entities/competition';
import { PageHeader } from '@presentation/components/data/PageHeader';
import { DataTable, type Column } from '@presentation/components/data/DataTable';
import { Pagination } from '@presentation/components/data/Pagination';
import { Button } from '@presentation/components/ui/Button';
import { Badge } from '@presentation/components/ui/Badge';
import { ConfirmDialog } from '@presentation/components/feedback/ConfirmDialog';
import { CompetitionFormModal } from './CompetitionFormModal';
import { toastApiError } from '@shared/lib/api-error-toast';
import { formatDate, truncate } from '@shared/lib/format';

const STATUS_TONE: Record<string, 'info' | 'success' | 'warning' | 'danger' | 'neutral'> = {
  scheduled: 'info',
  live: 'success',
  closed: 'neutral',
  cancelled: 'danger',
};

export default function CompetitionsPage() {
  const [page, setPage] = useState(1);
  const list = useCompetitionsQuery({ page, limit: 20 });
  const createM = useCreateCompetition();
  const updateM = useUpdateCompetition();
  const deleteM = useDeleteCompetition();

  const [editing, setEditing] = useState<Competition | null>(null);
  const [openForm, setOpenForm] = useState(false);
  const [toDelete, setToDelete] = useState<Competition | null>(null);

  const onCreate = () => {
    setEditing(null);
    setOpenForm(true);
  };
  const onEdit = (c: Competition) => {
    setEditing(c);
    setOpenForm(true);
  };

  const columns: Column<Competition>[] = [
    {
      key: 'title',
      header: 'Compétition',
      cell: (c) => (
        <div className="flex items-center gap-3">
          <span className="quizz-gradient inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white">
            <Trophy className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="font-bold truncate">{c.title}</p>
            <p className="text-2xs text-muted">{truncate(c.description, 80)}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Statut',
      width: '140px',
      cell: (c) => (
        <Badge tone={STATUS_TONE[String(c.status)] ?? 'neutral'}>{String(c.status)}</Badge>
      ),
    },
    {
      key: 'period',
      header: 'Période',
      width: '260px',
      cell: (c) => (
        <span className="text-xs text-muted">
          {formatDate(c.starts_at, false)} <span className="px-1">→</span>{' '}
          {formatDate(c.ends_at, false)}
        </span>
      ),
    },
    {
      key: 'reward',
      header: 'Récompense',
      cell: (c) => <span className="text-sm">{c.reward_text ?? '—'}</span>,
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
        title="Compétitions"
        description="Animez votre communauté avec des compétitions thématiques."
        actions={
          <Button variant="gradient" leftIcon={<Plus className="h-4 w-4" />} onClick={onCreate}>
            Nouvelle compétition
          </Button>
        }
      />

      <DataTable<Competition>
        columns={columns}
        data={list.data?.items}
        rowKey={(r) => r.id}
        loading={list.isLoading}
        error={list.error}
        onRetry={() => list.refetch()}
        emptyTitle="Aucune compétition"
        emptyDescription="Lancez une compétition pour stimuler la rétention."
        emptyAction={
          <Button variant="primary" leftIcon={<Plus className="h-4 w-4" />} onClick={onCreate}>
            Créer une compétition
          </Button>
        }
      />

      <Pagination
        page={list.data?.page ?? page}
        limit={list.data?.limit ?? 20}
        total={list.data?.total ?? 0}
        onPageChange={setPage}
      />

      <CompetitionFormModal
        open={openForm}
        initial={editing}
        onClose={() => setOpenForm(false)}
        submitting={createM.isPending || updateM.isPending}
        onSubmit={async (values) => {
          try {
            if (editing) {
              await updateM.mutateAsync({ id: editing.id, input: values });
              toast.success('Compétition mise à jour');
            } else {
              await createM.mutateAsync(values);
              toast.success('Compétition créée');
            }
            setOpenForm(false);
          } catch (err) {
            toastApiError(err);
          }
        }}
      />

      <ConfirmDialog
        open={!!toDelete}
        title={`Supprimer "${toDelete?.title ?? ''}" ?`}
        description="Les classements liés peuvent être impactés."
        destructive
        loading={deleteM.isPending}
        onCancel={() => setToDelete(null)}
        onConfirm={async () => {
          if (!toDelete) return;
          try {
            await deleteM.mutateAsync(toDelete.id);
            toast.success('Compétition supprimée');
            setToDelete(null);
          } catch (err) {
            toastApiError(err);
          }
        }}
      />
    </div>
  );
}

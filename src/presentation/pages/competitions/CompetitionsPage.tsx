import { useMemo, useState } from 'react';
import { Plus, Pencil, Trash2, Trophy, Play, CalendarCheck, Flag, Ban } from 'lucide-react';
import { toast } from 'sonner';
import {
  useCompetitionsQuery,
  useCreateCompetition,
  useDeleteCompetition,
  useUpdateCompetition,
} from '@application/competitions/use-competitions';
import { useQuizzesQuery } from '@application/quizzes/use-quizzes';
import { useCategoriesQuery } from '@application/categories/use-categories';
import type { Competition, CompetitionStatus } from '@domain/entities/competition';
import { PageHeader } from '@presentation/components/data/PageHeader';
import { DataTable, type Column } from '@presentation/components/data/DataTable';
import { Pagination } from '@presentation/components/data/Pagination';
import { Button } from '@presentation/components/ui/Button';
import { Badge } from '@presentation/components/ui/Badge';
import { Select } from '@presentation/components/ui/Select';
import { ConfirmDialog } from '@presentation/components/feedback/ConfirmDialog';
import { CompetitionFormModal } from './CompetitionFormModal';
import { toastApiError } from '@shared/lib/api-error-toast';
import { formatDate, truncate } from '@shared/lib/format';
import {
  COMPETITION_STATUSES,
  COMPETITION_STATUS_LABELS,
  COMPETITION_STATUS_TONES,
} from '@shared/lib/competition-status';
import { formatQuizLabel } from '@shared/lib/quiz-label';

function statusLabel(status: string): string {
  return COMPETITION_STATUS_LABELS[status as CompetitionStatus] ?? status;
}

export default function CompetitionsPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const list = useCompetitionsQuery({ page, limit: 20 });
  const quizzes = useQuizzesQuery({ page: 1, limit: 100 });
  const categories = useCategoriesQuery();
  const createM = useCreateCompetition();
  const updateM = useUpdateCompetition();
  const deleteM = useDeleteCompetition();

  const [editing, setEditing] = useState<Competition | null>(null);
  const [openForm, setOpenForm] = useState(false);
  const [toDelete, setToDelete] = useState<Competition | null>(null);

  const quizLabelById = useMemo(() => {
    const map = new Map<string, string>();
    (quizzes.data?.items ?? []).forEach((q) => map.set(q.id, formatQuizLabel(q)));
    return map;
  }, [quizzes.data?.items]);

  const categoryNameById = useMemo(() => {
    const map = new Map<string, string>();
    (categories.data ?? []).forEach((c) => map.set(c.id, c.name));
    return map;
  }, [categories.data]);

  const filteredItems = useMemo(() => {
    const items = list.data?.items ?? [];
    if (!statusFilter) return items;
    return items.filter((c) => c.status === statusFilter);
  }, [list.data?.items, statusFilter]);

  const onCreate = () => {
    setEditing(null);
    setOpenForm(true);
  };
  const onEdit = (c: Competition) => {
    setEditing(c);
    setOpenForm(true);
  };

  const changeStatus = async (c: Competition, status: CompetitionStatus, successMsg: string) => {
    try {
      await updateM.mutateAsync({ id: c.id, input: { status } });
      toast.success(successMsg);
    } catch (err) {
      toastApiError(err);
    }
  };

  const columns: Column<Competition>[] = [
    {
      key: 'title',
      header: 'Tournoi',
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
      width: '160px',
      cell: (c) => (
        <Badge tone={COMPETITION_STATUS_TONES[String(c.status) as CompetitionStatus] ?? 'neutral'}>
          {statusLabel(String(c.status))}
        </Badge>
      ),
    },
    {
      key: 'period',
      header: 'Période',
      width: '240px',
      cell: (c) => (
        <span className="text-xs text-muted">
          {formatDate(c.starts_at, false)} <span className="px-1">→</span>{' '}
          {formatDate(c.ends_at, false)}
        </span>
      ),
    },
    {
      key: 'max_participants',
      header: 'Places',
      width: '100px',
      cell: (c) => <span className="text-sm tabular-nums">{c.max_participants ?? 32}</span>,
    },
    {
      key: 'quiz',
      header: 'Quiz',
      cell: (c) => (
        <span className="text-sm">
          {c.quiz_id ? quizLabelById.get(c.quiz_id) ?? 'Quiz lié' : '—'}
        </span>
      ),
    },
    {
      key: 'category',
      header: 'Catégorie',
      width: '140px',
      cell: (c) => (
        <span className="text-sm">
          {c.category_id ? categoryNameById.get(c.category_id) ?? '—' : '—'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: <span className="sr-only">Actions</span>,
      align: 'right',
      width: '200px',
      cell: (c) => (
        <div className="flex items-center justify-end gap-1">
          {c.status === 'draft' ? (
            <Button
              variant="ghost"
              size="icon"
              aria-label="Publier les inscriptions"
              title="Publier les inscriptions"
              onClick={() => changeStatus(c, 'scheduled', 'Inscriptions ouvertes')}
            >
              <CalendarCheck className="h-4 w-4" />
            </Button>
          ) : null}
          {c.status === 'scheduled' ? (
            <Button
              variant="ghost"
              size="icon"
              aria-label="Démarrer"
              title="Démarrer"
              onClick={() => changeStatus(c, 'live', 'Tournoi démarré')}
            >
              <Play className="h-4 w-4" />
            </Button>
          ) : null}
          {c.status === 'live' ? (
            <Button
              variant="ghost"
              size="icon"
              aria-label="Clôturer"
              title="Clôturer"
              onClick={() => changeStatus(c, 'completed', 'Tournoi clôturé')}
            >
              <Flag className="h-4 w-4" />
            </Button>
          ) : null}
          {c.status !== 'cancelled' && c.status !== 'completed' ? (
            <Button
              variant="ghost"
              size="icon"
              aria-label="Annuler"
              title="Annuler"
              className="text-danger hover:bg-danger/10"
              onClick={() => changeStatus(c, 'cancelled', 'Tournoi annulé')}
            >
              <Ban className="h-4 w-4" />
            </Button>
          ) : null}
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
        title="Tournois"
        description="Gérez les tournois visibles dans l'écran mobile « Tournoi »."
        actions={
          <Button variant="gradient" leftIcon={<Plus className="h-4 w-4" />} onClick={onCreate}>
            Nouveau tournoi
          </Button>
        }
      />

      <div className="flex flex-wrap items-end gap-3">
        <div className="w-full max-w-xs">
          <Select
            label="Filtrer par statut"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            options={[
              { value: '', label: 'Tous les statuts' },
              ...COMPETITION_STATUSES.map((s) => ({
                value: s,
                label: COMPETITION_STATUS_LABELS[s],
              })),
            ]}
          />
        </div>
      </div>

      <DataTable<Competition>
        columns={columns}
        data={filteredItems}
        rowKey={(r) => r.id}
        loading={list.isLoading}
        error={list.error}
        onRetry={() => list.refetch()}
        emptyTitle="Aucun tournoi"
        emptyDescription="Créez un tournoi pour l'afficher dans l'app mobile."
        emptyAction={
          <Button variant="primary" leftIcon={<Plus className="h-4 w-4" />} onClick={onCreate}>
            Créer un tournoi
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
              toast.success('Tournoi mis à jour');
            } else {
              await createM.mutateAsync(values);
              toast.success('Tournoi créé');
            }
            setOpenForm(false);
          } catch (err) {
            toastApiError(err);
          }
        }}
      />

      <ConfirmDialog
        open={!!toDelete}
        title={`Supprimer « ${toDelete?.title ?? ''} » ?`}
        description="Cette action est irréversible."
        destructive
        loading={deleteM.isPending}
        onCancel={() => setToDelete(null)}
        onConfirm={async () => {
          if (!toDelete) return;
          try {
            await deleteM.mutateAsync(toDelete.id);
            toast.success('Tournoi supprimé');
            setToDelete(null);
          } catch (err) {
            toastApiError(err);
          }
        }}
      />
    </div>
  );
}


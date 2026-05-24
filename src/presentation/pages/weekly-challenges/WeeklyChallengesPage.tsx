import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2, CalendarRange, Rocket, Flag } from 'lucide-react';
import { toast } from 'sonner';
import {
  useWeeklyChallengesQuery,
  useCreateWeeklyChallenge,
  useDeleteWeeklyChallenge,
  useUpdateWeeklyChallenge,
} from '@application/weekly-challenges/use-weekly-challenges';
import { useWeeklyChallengeQuizzesQuery } from '@application/weekly-challenges/use-weekly-challenges';
import type { WeeklyChallenge, WeeklyChallengeStatus } from '@domain/entities/weekly-challenge';
import { PageHeader } from '@presentation/components/data/PageHeader';
import { DataTable, type Column } from '@presentation/components/data/DataTable';
import { Pagination } from '@presentation/components/data/Pagination';
import { Button } from '@presentation/components/ui/Button';
import { Badge } from '@presentation/components/ui/Badge';
import { Select } from '@presentation/components/ui/Select';
import { ConfirmDialog } from '@presentation/components/feedback/ConfirmDialog';
import { WeeklyChallengeFormModal } from './WeeklyChallengeFormModal';
import { toastApiError } from '@shared/lib/api-error-toast';
import { formatDate } from '@shared/lib/format';
import {
  WEEKLY_CHALLENGE_STATUSES,
  WEEKLY_CHALLENGE_STATUS_LABELS,
  WEEKLY_CHALLENGE_STATUS_TONES,
} from '@shared/lib/weekly-challenge-status';

function QuizCountCell({ id }: { id: string }) {
  const quizzes = useWeeklyChallengeQuizzesQuery(id);
  if (quizzes.isLoading) return <span className="text-xs text-muted">…</span>;
  return <span className="text-sm font-medium">{quizzes.data?.length ?? 0} quiz</span>;
}

function statusLabel(status: string): string {
  return WEEKLY_CHALLENGE_STATUS_LABELS[status as WeeklyChallengeStatus] ?? status;
}

export default function WeeklyChallengesPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<WeeklyChallengeStatus | ''>('');
  const list = useWeeklyChallengesQuery({
    page,
    limit: 20,
    status: statusFilter || undefined,
  });
  const createM = useCreateWeeklyChallenge();
  const updateM = useUpdateWeeklyChallenge();
  const deleteM = useDeleteWeeklyChallenge();

  const [editing, setEditing] = useState<WeeklyChallenge | null>(null);
  const [openForm, setOpenForm] = useState(false);
  const [toDelete, setToDelete] = useState<WeeklyChallenge | null>(null);

  const onCreate = () => {
    setEditing(null);
    setOpenForm(true);
  };
  const onEdit = (c: WeeklyChallenge) => {
    setEditing(c);
    setOpenForm(true);
  };

  const changeStatus = async (
    c: WeeklyChallenge,
    status: WeeklyChallengeStatus,
    successMsg: string,
  ) => {
    try {
      await updateM.mutateAsync({ id: c.id, input: { status } });
      toast.success(successMsg);
    } catch (err) {
      toastApiError(err);
    }
  };

  const columns: Column<WeeklyChallenge>[] = useMemo(
    () => [
      {
        key: 'title',
        header: 'Challenge hebdo',
        cell: (c) => (
          <div className="min-w-0">
            <Link
              to={`/weekly-challenges/${c.id}`}
              className="font-bold text-brand-600 hover:underline dark:text-brand-300"
            >
              {c.title}
            </Link>
            <p className="text-2xs text-muted">{c.description ?? '—'}</p>
          </div>
        ),
      },
      {
        key: 'status',
        header: 'Statut',
        width: '150px',
        cell: (c) => (
          <Badge tone={WEEKLY_CHALLENGE_STATUS_TONES[String(c.status) as WeeklyChallengeStatus] ?? 'neutral'}>
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
        key: 'quizzes',
        header: 'Quiz planifiés',
        width: '120px',
        cell: (c) => <QuizCountCell id={c.id} />,
      },
      {
        key: 'actions',
        header: <span className="sr-only">Actions</span>,
        align: 'right',
        width: '220px',
        cell: (c) => (
          <div className="flex items-center justify-end gap-1">
            <Link
              to={`/weekly-challenges/${c.id}`}
              className="inline-flex h-8 items-center rounded-lg px-3 text-xs font-semibold text-foreground hover:bg-surfaceMuted"
            >
              Planning
            </Link>
            {c.status === 'draft' ? (
              <Button
                variant="ghost"
                size="icon"
                aria-label="Publier"
                title="Publier"
                onClick={() => changeStatus(c, 'actif', 'Challenge publié')}
              >
                <Rocket className="h-4 w-4" />
              </Button>
            ) : null}
            {c.status === 'actif' ? (
              <Button
                variant="ghost"
                size="icon"
                aria-label="Clôturer"
                title="Clôturer"
                onClick={() => changeStatus(c, 'termine', 'Challenge clôturé')}
              >
                <Flag className="h-4 w-4" />
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
    ],
    [],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumb="Contenus"
        title="Challenges hebdo"
        description="Challenges hebdomadaires visibles dans l'écran mobile « Challenge »."
        actions={
          <Button variant="gradient" leftIcon={<Plus className="h-4 w-4" />} onClick={onCreate}>
            Nouveau challenge
          </Button>
        }
      />

      <div className="flex flex-wrap items-end gap-3">
        <div className="w-full max-w-xs">
          <Select
            label="Filtrer par statut"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as WeeklyChallengeStatus | '');
              setPage(1);
            }}
            options={[
              { value: '', label: 'Tous les statuts' },
              ...WEEKLY_CHALLENGE_STATUSES.map((s) => ({
                value: s,
                label: WEEKLY_CHALLENGE_STATUS_LABELS[s],
              })),
            ]}
          />
        </div>
      </div>

      <DataTable<WeeklyChallenge>
        columns={columns}
        data={list.data?.items}
        rowKey={(r) => r.id}
        loading={list.isLoading}
        error={list.error}
        onRetry={() => list.refetch()}
        emptyTitle="Aucun challenge hebdo"
        emptyDescription="Créez un challenge en brouillon puis planifiez les quiz sur 7 jours."
        emptyAction={
          <Button variant="primary" leftIcon={<CalendarRange className="h-4 w-4" />} onClick={onCreate}>
            Créer un challenge
          </Button>
        }
      />

      <Pagination
        page={list.data?.page ?? page}
        limit={list.data?.limit ?? 20}
        total={list.data?.total ?? 0}
        onPageChange={setPage}
      />

      <WeeklyChallengeFormModal
        open={openForm}
        initial={editing}
        onClose={() => setOpenForm(false)}
        submitting={createM.isPending || updateM.isPending}
        onSubmit={async (values) => {
          try {
            if (editing) {
              await updateM.mutateAsync({ id: editing.id, input: values });
              toast.success('Challenge mis à jour');
              setOpenForm(false);
            } else {
              const created = await createM.mutateAsync(values);
              toast.success('Challenge créé — planifiez les quiz');
              setOpenForm(false);
              navigate(`/weekly-challenges/${created.id}`);
            }
          } catch (err) {
            toastApiError(err);
          }
        }}
      />

      <ConfirmDialog
        open={!!toDelete}
        title={`Supprimer « ${toDelete?.title ?? ''} » ?`}
        description="Le planning des quiz associés sera également supprimé."
        destructive
        loading={deleteM.isPending}
        onCancel={() => setToDelete(null)}
        onConfirm={async () => {
          if (!toDelete) return;
          try {
            await deleteM.mutateAsync(toDelete.id);
            toast.success('Challenge supprimé');
            setToDelete(null);
          } catch (err) {
            toastApiError(err);
          }
        }}
      />
    </div>
  );
}


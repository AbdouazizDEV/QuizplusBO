import { useMemo, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  useChallengesQuery,
  useCreateChallenge,
  useDeleteChallenge,
  useUpdateChallenge,
} from '@application/challenges/use-challenges';
import { useProfilesQuery } from '@application/profiles/use-profiles';
import { useQuizzesQuery } from '@application/quizzes/use-quizzes';
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
import { formatProfileLabel } from '@shared/lib/profile-label';
import { formatQuizLabel } from '@shared/lib/quiz-label';
import {
  CHALLENGE_STATUS_LABELS,
  CHALLENGE_STATUS_TONES,
} from '@shared/lib/challenge-status';

export default function ChallengesPage() {
  const [page, setPage] = useState(1);
  const list = useChallengesQuery({ page, limit: 20 });
  const profiles = useProfilesQuery({ page: 1, limit: 100 });
  const quizzes = useQuizzesQuery({ page: 1, limit: 100 });
  const createM = useCreateChallenge();
  const updateM = useUpdateChallenge();
  const deleteM = useDeleteChallenge();

  const [editing, setEditing] = useState<Challenge | null>(null);
  const [openForm, setOpenForm] = useState(false);
  const [toDelete, setToDelete] = useState<Challenge | null>(null);

  const profileLabelById = useMemo(() => {
    const map = new Map<string, string>();
    (profiles.data?.items ?? []).forEach((p) => map.set(p.id, formatProfileLabel(p)));
    return map;
  }, [profiles.data?.items]);

  const quizLabelById = useMemo(() => {
    const map = new Map<string, string>();
    (quizzes.data?.items ?? []).forEach((q) => map.set(q.id, formatQuizLabel(q)));
    return map;
  }, [quizzes.data?.items]);

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
          <span className="font-bold">
            {profileLabelById.get(c.challenger_id) ?? 'Joueur inconnu'}
          </span>
          <span className="px-1.5 text-muted">vs</span>
          <span className="font-bold">
            {profileLabelById.get(c.challenged_id) ?? 'Joueur inconnu'}
          </span>
        </div>
      ),
    },
    {
      key: 'quiz',
      header: 'Quiz',
      cell: (c) => (
        <span className="text-sm">{quizLabelById.get(c.quiz_id) ?? 'Quiz inconnu'}</span>
      ),
    },
    {
      key: 'status',
      header: 'Statut',
      width: '140px',
      cell: (c) => (
        <Badge tone={CHALLENGE_STATUS_TONES[String(c.status) as ChallengeStatus] ?? 'neutral'}>
          {CHALLENGE_STATUS_LABELS[String(c.status) as ChallengeStatus] ?? String(c.status)}
        </Badge>
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
      key: 'winner',
      header: 'Gagnant',
      width: '180px',
      cell: (c) => (
        <span className="text-sm text-muted">
          {c.winner_id ? profileLabelById.get(c.winner_id) ?? '—' : '—'}
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
        title="Duels 1v1"
        description="Gérez les défis lancés entre deux joueurs sur un quiz."
        actions={
          <Button variant="gradient" leftIcon={<Plus className="h-4 w-4" />} onClick={onCreate}>
            Nouveau duel
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
        emptyTitle="Aucun duel"
        emptyDescription="Créez un duel de test ou attendez les premiers défis entre joueurs."
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
              toast.success('Duel mis à jour');
            } else {
              await createM.mutateAsync({
                ...values,
                status: (values.status ?? 'pending') as ChallengeStatus,
              });
              toast.success('Duel créé');
            }
            setOpenForm(false);
          } catch (err) {
            toastApiError(err);
          }
        }}
      />

      <ConfirmDialog
        open={!!toDelete}
        title="Supprimer ce duel ?"
        description="Cette action est irréversible."
        destructive
        loading={deleteM.isPending}
        onCancel={() => setToDelete(null)}
        onConfirm={async () => {
          if (!toDelete) return;
          try {
            await deleteM.mutateAsync(toDelete.id);
            toast.success('Duel supprimé');
            setToDelete(null);
          } catch (err) {
            toastApiError(err);
          }
        }}
      />
    </div>
  );
}

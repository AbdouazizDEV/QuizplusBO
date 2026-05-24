import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, Pencil, Trash2, Rocket, Flag } from 'lucide-react';
import { toast } from 'sonner';
import {
  useWeeklyChallengeQuery,
  useWeeklyChallengeQuizzesQuery,
  useUpdateWeeklyChallenge,
  useAddWeeklyChallengeQuiz,
  useUpdateWeeklyChallengeQuizLink,
  useRemoveWeeklyChallengeQuizLink,
} from '@application/weekly-challenges/use-weekly-challenges';
import type { WeeklyChallengeQuizLink, WeeklyChallengeStatus } from '@domain/entities/weekly-challenge';
import { PageHeader } from '@presentation/components/data/PageHeader';
import { Button } from '@presentation/components/ui/Button';
import { Badge } from '@presentation/components/ui/Badge';
import { Card, CardHeader, CardBody } from '@presentation/components/ui/Card';
import { ConfirmDialog } from '@presentation/components/feedback/ConfirmDialog';
import { ErrorState } from '@presentation/components/feedback/ErrorState';
import { PageLoader } from '@presentation/components/feedback/PageLoader';
import { WeeklyChallengeFormModal } from './WeeklyChallengeFormModal';
import { WeeklyChallengeQuizLinkModal } from './WeeklyChallengeQuizLinkModal';
import { toastApiError } from '@shared/lib/api-error-toast';
import { formatDate } from '@shared/lib/format';
import {
  WEEKLY_CHALLENGE_STATUS_LABELS,
  WEEKLY_CHALLENGE_STATUS_TONES,
} from '@shared/lib/weekly-challenge-status';
import { daysBetween, formatScheduledDay } from '@shared/lib/date-helpers';
import { formatQuizLabel } from '@shared/lib/quiz-label';

export default function WeeklyChallengeDetailPage() {
  const { id = '' } = useParams();
  const challenge = useWeeklyChallengeQuery(id);
  const quizzes = useWeeklyChallengeQuizzesQuery(id);
  const updateM = useUpdateWeeklyChallenge();
  const addQuizM = useAddWeeklyChallengeQuiz();
  const updateLinkM = useUpdateWeeklyChallengeQuizLink();
  const removeLinkM = useRemoveWeeklyChallengeQuizLink();

  const [openEdit, setOpenEdit] = useState(false);
  const [linkModal, setLinkModal] = useState<{
    open: boolean;
    initial: WeeklyChallengeQuizLink | null;
    defaultDay?: string;
    defaultOrder?: number;
  }>({ open: false, initial: null });
  const [toDeleteLink, setToDeleteLink] = useState<WeeklyChallengeQuizLink | null>(null);

  const calendarDays = useMemo(() => {
    if (!challenge.data) return [];
    return daysBetween(challenge.data.starts_at, challenge.data.ends_at);
  }, [challenge.data]);

  const linksByDay = useMemo(() => {
    const map = new Map<string, WeeklyChallengeQuizLink[]>();
    (quizzes.data ?? []).forEach((link) => {
      const list = map.get(link.scheduled_day) ?? [];
      list.push(link);
      map.set(link.scheduled_day, list);
    });
    for (const [day, list] of map) {
      map.set(
        day,
        [...list].sort((a, b) => a.day_order - b.day_order),
      );
    }
    return map;
  }, [quizzes.data]);

  if (challenge.isLoading) return <PageLoader />;
  if (challenge.error || !challenge.data) {
    return (
      <ErrorState
        error={challenge.error ?? new Error('Challenge introuvable')}
        onRetry={() => challenge.refetch()}
      />
    );
  }

  const item = challenge.data;
  const status = String(item.status) as WeeklyChallengeStatus;

  const changeStatus = async (next: WeeklyChallengeStatus, msg: string) => {
    try {
      await updateM.mutateAsync({ id, input: { status: next } });
      toast.success(msg);
    } catch (err) {
      toastApiError(err);
    }
  };

  const openAddForDay = (day: string, order: number) => {
    setLinkModal({ open: true, initial: null, defaultDay: day, defaultOrder: order });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted">
        <Link to="/weekly-challenges" className="inline-flex items-center gap-1 hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Retour aux challenges hebdo
        </Link>
      </div>

      <PageHeader
        breadcrumb="Contenus / Challenges hebdo"
        title={item.title}
        description={item.description ?? 'Planifiez un quiz par jour entre le début et la fin du challenge.'}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={WEEKLY_CHALLENGE_STATUS_TONES[status] ?? 'neutral'}>
              {WEEKLY_CHALLENGE_STATUS_LABELS[status] ?? status}
            </Badge>
            {status === 'draft' ? (
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Rocket className="h-4 w-4" />}
                loading={updateM.isPending}
                onClick={() => changeStatus('actif', 'Challenge publié')}
              >
                Publier
              </Button>
            ) : null}
            {status === 'actif' ? (
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<Flag className="h-4 w-4" />}
                loading={updateM.isPending}
                onClick={() => changeStatus('termine', 'Challenge clôturé')}
              >
                Clôturer
              </Button>
            ) : null}
            <Button variant="outline" size="sm" onClick={() => setOpenEdit(true)}>
              Modifier
            </Button>
          </div>
        }
      />

      <Card>
        <CardHeader title="Informations" />
        <CardBody className="grid gap-2 sm:grid-cols-2 pt-0">
          <p className="text-sm">
            <span className="font-semibold text-muted">Période : </span>
            {formatDate(item.starts_at, false)} → {formatDate(item.ends_at, false)}
          </p>
          <p className="text-sm">
            <span className="font-semibold text-muted">Récompense : </span>
            {item.reward_text ?? '—'}
          </p>
        </CardBody>
      </Card>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-lg font-bold">Planning des quiz</h3>
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={() =>
              setLinkModal({
                open: true,
                initial: null,
                defaultDay: calendarDays[0],
                defaultOrder: 1,
              })
            }
          >
            Ajouter un quiz
          </Button>
        </div>

        <div className="grid gap-3">
          {calendarDays.map((day, index) => {
            const dayLinks = linksByDay.get(day) ?? [];
            return (
              <Card key={day} className="p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="font-bold">{formatScheduledDay(day, index + 1)}</p>
                    <p className="text-2xs text-muted">{day}</p>
                  </div>
                  <div className="flex-1 space-y-2">
                    {dayLinks.length === 0 ? (
                      <p className="text-sm text-muted">Aucun quiz planifié pour ce jour.</p>
                    ) : (
                      dayLinks.map((link) => {
                        const quiz = link.quizzes;
                        const label = quiz ? formatQuizLabel(quiz) : 'Quiz planifié';
                        return (
                          <div
                            key={link.id}
                            className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-surfaceMuted/40 px-3 py-2"
                          >
                            <span className="text-sm font-medium">{label}</span>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                aria-label="Modifier"
                                onClick={() => setLinkModal({ open: true, initial: link })}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                aria-label="Supprimer"
                                className="text-danger hover:bg-danger/10"
                                onClick={() => setToDeleteLink(link)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        );
                      })
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      leftIcon={<Plus className="h-3.5 w-3.5" />}
                      onClick={() => openAddForDay(day, dayLinks.length + 1 || index + 1)}
                    >
                      Choisir un quiz
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {calendarDays.length === 0 ? (
          <p className="text-sm text-muted">
            Les dates de début et de fin du challenge sont invalides ou vides.
          </p>
        ) : null}
      </section>

      <WeeklyChallengeFormModal
        open={openEdit}
        initial={item}
        onClose={() => setOpenEdit(false)}
        submitting={updateM.isPending}
        onSubmit={async (values) => {
          try {
            await updateM.mutateAsync({ id, input: values });
            toast.success('Challenge mis à jour');
            setOpenEdit(false);
          } catch (err) {
            toastApiError(err);
          }
        }}
      />

      <WeeklyChallengeQuizLinkModal
        open={linkModal.open}
        initial={linkModal.initial}
        defaultDay={linkModal.defaultDay}
        defaultOrder={linkModal.defaultOrder}
        onClose={() => setLinkModal({ open: false, initial: null })}
        submitting={addQuizM.isPending || updateLinkM.isPending}
        onSubmit={async (values) => {
          try {
            if (linkModal.initial) {
              await updateLinkM.mutateAsync({
                challengeId: id,
                linkId: linkModal.initial.id,
                input: values,
              });
              toast.success('Planning mis à jour');
            } else {
              await addQuizM.mutateAsync({ challengeId: id, input: values });
              toast.success('Quiz planifié');
            }
            setLinkModal({ open: false, initial: null });
          } catch (err) {
            toastApiError(err);
          }
        }}
      />

      <ConfirmDialog
        open={!!toDeleteLink}
        title="Retirer ce quiz du planning ?"
        description="Le quiz restera disponible dans le catalogue."
        destructive
        loading={removeLinkM.isPending}
        onCancel={() => setToDeleteLink(null)}
        onConfirm={async () => {
          if (!toDeleteLink) return;
          try {
            await removeLinkM.mutateAsync({ challengeId: id, linkId: toDeleteLink.id });
            toast.success('Quiz retiré du planning');
            setToDeleteLink(null);
          } catch (err) {
            toastApiError(err);
          }
        }}
      />
    </div>
  );
}


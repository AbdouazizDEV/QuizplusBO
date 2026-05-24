import { useEffect, useMemo, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Challenge, CreateChallengeInput } from '@domain/entities/challenge';
import type { Profile } from '@domain/entities/profile';
import type { Quiz } from '@domain/entities/quiz';
import { Modal } from '@presentation/components/ui/Modal';
import { Input } from '@presentation/components/ui/Input';
import { Select } from '@presentation/components/ui/Select';
import { Button } from '@presentation/components/ui/Button';
import { ProfilePickerField } from '@presentation/components/pickers/ProfilePickerField';
import { QuizPickerField } from '@presentation/components/pickers/QuizPickerField';
import { CHALLENGE_STATUSES, CHALLENGE_STATUS_LABELS } from '@shared/lib/challenge-status';
import { formatProfileLabel } from '@shared/lib/profile-label';
import { formatQuizLabel } from '@shared/lib/quiz-label';
import { datetimeLocalToIso, isoToDatetimeLocal } from '@shared/lib/date-helpers';
import { useProfilesQuery } from '@application/profiles/use-profiles';
import { useQuizzesQuery } from '@application/quizzes/use-quizzes';

const schema = z
  .object({
    challenger_id: z.string().min(1, 'Sélectionnez le joueur qui lance le défi'),
    challenged_id: z.string().min(1, 'Sélectionnez le joueur défié'),
    quiz_id: z.string().min(1, 'Sélectionnez un quiz'),
    status: z.enum(CHALLENGE_STATUSES),
    challenger_score: z.coerce.number().int().min(0).optional().nullable(),
    challenged_score: z.coerce.number().int().min(0).optional().nullable(),
    winner_id: z.string().optional().or(z.literal('')),
    expires_at: z.string().optional().nullable(),
  })
  .refine((data) => data.challenger_id !== data.challenged_id, {
    message: 'Les deux joueurs doivent être différents',
    path: ['challenged_id'],
  });

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  initial: Challenge | null;
  onClose: () => void;
  onSubmit: (input: CreateChallengeInput) => Promise<void> | void;
  submitting?: boolean;
}

export function ChallengeFormModal({ open, initial, onClose, onSubmit, submitting }: Props) {
  const profiles = useProfilesQuery({ page: 1, limit: 100 });
  const quizzes = useQuizzesQuery({ page: 1, limit: 100 });

  const [challengerLabel, setChallengerLabel] = useState<string | null>(null);
  const [challengedLabel, setChallengedLabel] = useState<string | null>(null);
  const [quizLabel, setQuizLabel] = useState<string | null>(null);

  const profileById = useMemo(() => {
    const map = new Map<string, Profile>();
    (profiles.data?.items ?? []).forEach((p) => map.set(p.id, p));
    return map;
  }, [profiles.data?.items]);

  const quizById = useMemo(() => {
    const map = new Map<string, Quiz>();
    (quizzes.data?.items ?? []).forEach((q) => map.set(q.id, q));
    return map;
  }, [quizzes.data?.items]);

  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      challenger_id: '',
      challenged_id: '',
      quiz_id: '',
      status: 'pending',
      challenger_score: null,
      challenged_score: null,
      winner_id: '',
      expires_at: '',
    },
  });

  const challengerId = watch('challenger_id');
  const challengedId = watch('challenged_id');

  const winnerOptions = useMemo(() => {
    const opts: { value: string; label: string }[] = [{ value: '', label: 'Aucun gagnant' }];
    if (challengerId && profileById.has(challengerId)) {
      const p = profileById.get(challengerId)!;
      opts.push({ value: p.id, label: `Gagnant : ${formatProfileLabel(p)} (lanceur)` });
    }
    if (challengedId && profileById.has(challengedId) && challengedId !== challengerId) {
      const p = profileById.get(challengedId)!;
      opts.push({ value: p.id, label: `Gagnant : ${formatProfileLabel(p)} (défié)` });
    }
    return opts;
  }, [challengerId, challengedId, profileById]);

  useEffect(() => {
    if (open) {
      const challenger = initial?.challenger_id ? profileById.get(initial.challenger_id) : undefined;
      const challenged = initial?.challenged_id ? profileById.get(initial.challenged_id) : undefined;
      const quiz = initial?.quiz_id ? quizById.get(initial.quiz_id) : undefined;

      setChallengerLabel(challenger ? formatProfileLabel(challenger) : null);
      setChallengedLabel(challenged ? formatProfileLabel(challenged) : null);
      setQuizLabel(quiz ? formatQuizLabel(quiz) : null);

      reset({
        challenger_id: initial?.challenger_id ?? '',
        challenged_id: initial?.challenged_id ?? '',
        quiz_id: initial?.quiz_id ?? '',
        status: (initial?.status as FormValues['status']) ?? 'pending',
        challenger_score: initial?.challenger_score ?? null,
        challenged_score: initial?.challenged_score ?? null,
        winner_id: initial?.winner_id ?? '',
        expires_at: isoToDatetimeLocal(initial?.expires_at),
      });
    }
  }, [open, initial, reset, profileById, quizById]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={initial ? 'Modifier le duel' : 'Nouveau duel 1v1'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Annuler
          </Button>
          <Button
            variant="primary"
            loading={submitting}
            onClick={handleSubmit(async (values) => {
              await onSubmit({
                challenger_id: values.challenger_id,
                challenged_id: values.challenged_id,
                quiz_id: values.quiz_id,
                status: values.status,
                challenger_score: values.challenger_score ?? null,
                challenged_score: values.challenged_score ?? null,
                winner_id: values.winner_id || null,
                expires_at: datetimeLocalToIso(values.expires_at),
              });
            })}
          >
            {initial ? 'Enregistrer' : 'Créer'}
          </Button>
        </>
      }
    >
      <form className="grid gap-4 sm:grid-cols-2">
        <Controller
          control={control}
          name="challenger_id"
          render={({ field }) => (
            <ProfilePickerField
              label="Joueur qui lance le défi"
              value={field.value}
              displayLabel={challengerLabel}
              excludeIds={challengedId ? [challengedId] : []}
              onChange={(id, profile) => {
                field.onChange(id ?? '');
                setChallengerLabel(profile ? formatProfileLabel(profile) : null);
              }}
              error={errors.challenger_id?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="challenged_id"
          render={({ field }) => (
            <ProfilePickerField
              label="Joueur défié"
              value={field.value}
              displayLabel={challengedLabel}
              excludeIds={challengerId ? [challengerId] : []}
              onChange={(id, profile) => {
                field.onChange(id ?? '');
                setChallengedLabel(profile ? formatProfileLabel(profile) : null);
              }}
              error={errors.challenged_id?.message}
            />
          )}
        />

        <div className="sm:col-span-2">
          <Controller
            control={control}
            name="quiz_id"
            render={({ field }) => (
              <QuizPickerField
                label="Quiz du duel"
                value={field.value}
                displayLabel={quizLabel}
                allowClear={false}
                onChange={(id, quiz) => {
                  field.onChange(id ?? '');
                  setQuizLabel(quiz ? formatQuizLabel(quiz) : null);
                }}
                error={errors.quiz_id?.message}
              />
            )}
          />
        </div>

        <Select
          {...register('status')}
          label="Statut"
          options={CHALLENGE_STATUSES.map((s) => ({
            value: s,
            label: CHALLENGE_STATUS_LABELS[s],
          }))}
          error={errors.status?.message}
        />

        <Select
          {...register('winner_id')}
          label="Gagnant (optionnel)"
          options={winnerOptions}
          error={errors.winner_id?.message}
          hint="Choisissez parmi les deux joueurs du duel."
        />

        <Input
          {...register('challenger_score', { valueAsNumber: true })}
          type="number"
          min={0}
          label="Score du lanceur"
        />
        <Input
          {...register('challenged_score', { valueAsNumber: true })}
          type="number"
          min={0}
          label="Score du défié"
        />

        <div className="sm:col-span-2">
          <Input
            {...register('expires_at')}
            type="datetime-local"
            label="Expire le"
            error={errors.expires_at?.message ?? undefined}
          />
        </div>
      </form>
    </Modal>
  );
}

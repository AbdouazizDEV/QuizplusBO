import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Competition, CompetitionStatus, CreateCompetitionInput } from '@domain/entities/competition';
import type { Quiz } from '@domain/entities/quiz';
import { Modal } from '@presentation/components/ui/Modal';
import { Input } from '@presentation/components/ui/Input';
import { Textarea } from '@presentation/components/ui/Textarea';
import { Select } from '@presentation/components/ui/Select';
import { Button } from '@presentation/components/ui/Button';
import { QuizPickerField } from '@presentation/components/pickers/QuizPickerField';
import { CategoryPickerField } from '@presentation/components/pickers/CategoryPickerField';
import {
  COMPETITION_STATUSES,
  COMPETITION_STATUS_LABELS,
} from '@shared/lib/competition-status';
import { datetimeLocalToIso, isoToDatetimeLocal } from '@shared/lib/date-helpers';
import { formatQuizLabel } from '@shared/lib/quiz-label';
import { useQuizzesQuery } from '@application/quizzes/use-quizzes';
import { useCategoriesQuery } from '@application/categories/use-categories';
import { useMemo } from 'react';

const schema = z
  .object({
    title: z.string().trim().min(1, 'Le titre est requis').max(160),
    description: z.string().trim().max(500).optional().nullable(),
    quiz_id: z.string().nullable().optional(),
    category_id: z.string().nullable().optional(),
    max_participants: z.coerce.number().int().min(2, 'Min. 2').max(128, 'Max. 128'),
    status: z.enum(COMPETITION_STATUSES),
    starts_at: z.string().min(1, 'La date de début est requise'),
    ends_at: z.string().min(1, 'La date de fin est requise'),
    reward_text: z.string().trim().max(280).optional().nullable(),
  })
  .refine(
    (data) => {
      if (!data.starts_at || !data.ends_at) return true;
      return new Date(data.ends_at).getTime() > new Date(data.starts_at).getTime();
    },
    { message: 'La date de fin doit être strictement après la date de début', path: ['ends_at'] },
  )
  .refine(
    (data) => {
      if (data.status === 'scheduled' || data.status === 'live') {
        return Boolean(data.category_id);
      }
      return true;
    },
    {
      message: 'La catégorie est requise pour ouvrir ou démarrer un tournoi',
      path: ['category_id'],
    },
  );

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  initial: Competition | null;
  onClose: () => void;
  onSubmit: (input: CreateCompetitionInput) => Promise<void> | void;
  submitting?: boolean;
}

export function CompetitionFormModal({ open, initial, onClose, onSubmit, submitting }: Props) {
  const quizzes = useQuizzesQuery({ page: 1, limit: 100 });
  const categories = useCategoriesQuery();
  const [quizLabel, setQuizLabel] = useState<string | null>(null);

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
      title: '',
      description: '',
      quiz_id: null,
      category_id: null,
      max_participants: 32,
      status: 'draft',
      starts_at: '',
      ends_at: '',
      reward_text: '',
    },
  });

  const quizId = watch('quiz_id');

  useEffect(() => {
    if (open) {
      const linkedQuiz = initial?.quiz_id ? quizById.get(initial.quiz_id) : undefined;
      setQuizLabel(linkedQuiz ? formatQuizLabel(linkedQuiz) : null);
      reset({
        title: initial?.title ?? '',
        description: initial?.description ?? '',
        quiz_id: initial?.quiz_id ?? null,
        category_id: initial?.category_id ?? null,
        max_participants: initial?.max_participants ?? 32,
        status: (initial?.status as CompetitionStatus) ?? 'draft',
        starts_at: isoToDatetimeLocal(initial?.starts_at),
        ends_at: isoToDatetimeLocal(initial?.ends_at),
        reward_text: initial?.reward_text ?? '',
      });
    }
  }, [open, initial, reset, quizById]);

  useEffect(() => {
    if (quizId && quizById.has(quizId)) {
      setQuizLabel(formatQuizLabel(quizById.get(quizId)!));
    }
  }, [quizId, quizById]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={initial ? 'Modifier le tournoi' : 'Nouveau tournoi'}
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
                title: values.title,
                description: values.description || null,
                quiz_id: values.quiz_id || null,
                category_id: values.category_id || null,
                max_participants: values.max_participants,
                status: values.status,
                starts_at: datetimeLocalToIso(values.starts_at),
                ends_at: datetimeLocalToIso(values.ends_at),
                reward_text: values.reward_text || null,
              });
            })}
          >
            {initial ? 'Enregistrer' : 'Créer'}
          </Button>
        </>
      }
    >
      <form className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Input
            {...register('title')}
            label="Titre"
            placeholder="Tournoi Culture Générale"
            error={errors.title?.message}
          />
        </div>
        <div className="sm:col-span-2">
          <Textarea
            {...register('description')}
            label="Description"
            rows={3}
            error={errors.description?.message}
          />
        </div>

        <Controller
          control={control}
          name="quiz_id"
          render={({ field }) => (
            <QuizPickerField
              label="Quiz associé (optionnel)"
              value={field.value}
              displayLabel={quizLabel}
              onChange={(id, quiz) => {
                field.onChange(id);
                setQuizLabel(quiz ? formatQuizLabel(quiz) : null);
              }}
              error={errors.quiz_id?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="category_id"
          render={({ field }) => (
            <CategoryPickerField
              label="Catégorie (requise pour inscriptions / live)"
              value={field.value}
              onChange={field.onChange}
              error={errors.category_id?.message}
              hint={categories.isLoading ? 'Chargement des catégories…' : undefined}
            />
          )}
        />

        <Input
          {...register('max_participants')}
          type="number"
          min={2}
          max={128}
          label="Participants max"
          error={errors.max_participants?.message}
        />

        <Select
          {...register('status')}
          label="Statut"
          options={COMPETITION_STATUSES.map((s) => ({
            value: s,
            label: COMPETITION_STATUS_LABELS[s],
          }))}
          error={errors.status?.message}
        />
        <Input
          {...register('reward_text')}
          label="Récompense"
          placeholder="Top 3 : badges + points bonus"
          error={errors.reward_text?.message ?? undefined}
        />

        <Input
          {...register('starts_at')}
          type="datetime-local"
          label="Date/heure début"
          error={errors.starts_at?.message ?? undefined}
        />
        <Input
          {...register('ends_at')}
          type="datetime-local"
          label="Date/heure fin"
          error={errors.ends_at?.message ?? undefined}
        />
      </form>
    </Modal>
  );
}

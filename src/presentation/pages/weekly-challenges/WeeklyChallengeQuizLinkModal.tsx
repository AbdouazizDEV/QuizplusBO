import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type {
  WeeklyChallengeQuizLink,
  CreateWeeklyChallengeQuizLinkInput,
} from '@domain/entities/weekly-challenge';
import { Modal } from '@presentation/components/ui/Modal';
import { Input } from '@presentation/components/ui/Input';
import { Button } from '@presentation/components/ui/Button';
import { QuizPickerField } from '@presentation/components/pickers/QuizPickerField';
import { formatQuizLabel } from '@shared/lib/quiz-label';
import { formatScheduledDay } from '@shared/lib/date-helpers';

const schema = z.object({
  scheduled_day: z.string().min(1, 'Le jour est requis'),
  day_order: z.coerce.number().int().min(1, 'Minimum 1').max(7, 'Maximum 7'),
  quiz_id: z.string().min(1, 'Sélectionnez un quiz'),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  initial: WeeklyChallengeQuizLink | null;
  defaultDay?: string;
  defaultOrder?: number;
  onClose: () => void;
  onSubmit: (input: CreateWeeklyChallengeQuizLinkInput) => Promise<void> | void;
  submitting?: boolean;
}

export function WeeklyChallengeQuizLinkModal({
  open,
  initial,
  defaultDay,
  defaultOrder,
  onClose,
  onSubmit,
  submitting,
}: Props) {
  const [quizLabel, setQuizLabel] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      scheduled_day: '',
      day_order: 1,
      quiz_id: '',
    },
  });

  useEffect(() => {
    if (open) {
      const quiz = initial?.quizzes;
      setQuizLabel(quiz ? formatQuizLabel(quiz) : null);
      reset({
        scheduled_day: initial?.scheduled_day ?? defaultDay ?? '',
        day_order: initial?.day_order ?? defaultOrder ?? 1,
        quiz_id: initial?.quiz_id ?? '',
      });
    }
  }, [open, initial, defaultDay, defaultOrder, reset]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="md"
      title={initial ? 'Modifier le quiz planifié' : 'Ajouter un quiz au planning'}
      description={
        initial?.scheduled_day
          ? formatScheduledDay(initial.scheduled_day, initial.day_order)
          : undefined
      }
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
                quiz_id: values.quiz_id,
                scheduled_day: values.scheduled_day,
                day_order: values.day_order,
              });
            })}
          >
            {initial ? 'Enregistrer' : 'Planifier'}
          </Button>
        </>
      }
    >
      <form className="grid gap-4">
        <Input
          {...register('scheduled_day')}
          type="date"
          label="Jour"
          error={errors.scheduled_day?.message}
        />
        <Input
          {...register('day_order', { valueAsNumber: true })}
          type="number"
          min={1}
          max={7}
          label="Ordre du jour (1–7)"
          error={errors.day_order?.message}
        />
        <Controller
          control={control}
          name="quiz_id"
          render={({ field }) => (
            <QuizPickerField
              label="Quiz"
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
      </form>
    </Modal>
  );
}

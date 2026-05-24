import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type {
  WeeklyChallenge,
  WeeklyChallengeStatus,
  CreateWeeklyChallengeInput,
} from '@domain/entities/weekly-challenge';
import { Modal } from '@presentation/components/ui/Modal';
import { Input } from '@presentation/components/ui/Input';
import { Textarea } from '@presentation/components/ui/Textarea';
import { Select } from '@presentation/components/ui/Select';
import { Button } from '@presentation/components/ui/Button';
import {
  WEEKLY_CHALLENGE_STATUSES,
  WEEKLY_CHALLENGE_STATUS_LABELS,
} from '@shared/lib/weekly-challenge-status';
import { datetimeLocalToIso, isoToDatetimeLocal } from '@shared/lib/date-helpers';

const schema = z
  .object({
    title: z.string().trim().min(1, 'Le titre est requis').max(160),
    description: z.string().trim().max(500).optional().nullable(),
    type: z.literal('hebdomadaire'),
    status: z.enum(WEEKLY_CHALLENGE_STATUSES),
    starts_at: z.string().min(1, 'La date de début est requise'),
    ends_at: z.string().min(1, 'La date de fin est requise'),
    reward_text: z.string().trim().max(280).optional().nullable(),
  })
  .refine(
    (data) => new Date(data.ends_at).getTime() > new Date(data.starts_at).getTime(),
    { message: 'La date de fin doit être strictement après la date de début', path: ['ends_at'] },
  );

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  initial: WeeklyChallenge | null;
  onClose: () => void;
  onSubmit: (input: CreateWeeklyChallengeInput) => Promise<void> | void;
  submitting?: boolean;
}

export function WeeklyChallengeFormModal({ open, initial, onClose, onSubmit, submitting }: Props) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      description: '',
      type: 'hebdomadaire',
      status: 'draft',
      starts_at: '',
      ends_at: '',
      reward_text: '',
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        title: initial?.title ?? '',
        description: initial?.description ?? '',
        type: 'hebdomadaire',
        status: (initial?.status as WeeklyChallengeStatus) ?? 'draft',
        starts_at: isoToDatetimeLocal(initial?.starts_at),
        ends_at: isoToDatetimeLocal(initial?.ends_at),
        reward_text: initial?.reward_text ?? '',
      });
    }
  }, [open, initial, reset]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={initial ? 'Modifier le challenge hebdo' : 'Nouveau challenge hebdo'}
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
                type: 'hebdomadaire',
                status: values.status,
                starts_at: datetimeLocalToIso(values.starts_at)!,
                ends_at: datetimeLocalToIso(values.ends_at)!,
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
            placeholder="Challenge de la semaine"
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

        <input type="hidden" {...register('type')} />

        <Select
          label="Type"
          value="hebdomadaire"
          disabled
          options={[{ value: 'hebdomadaire', label: 'Hebdomadaire' }]}
          hint="Type fixe pour les challenges mobile"
        />

        <Select
          {...register('status')}
          label="Statut"
          options={WEEKLY_CHALLENGE_STATUSES.map((s) => ({
            value: s,
            label: WEEKLY_CHALLENGE_STATUS_LABELS[s],
          }))}
          error={errors.status?.message}
        />

        <Input
          {...register('reward_text')}
          label="Récompense"
          placeholder="Meilleur score cumulé"
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


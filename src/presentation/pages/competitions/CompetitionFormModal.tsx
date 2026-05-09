import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Competition, CompetitionStatus, CreateCompetitionInput } from '@domain/entities/competition';
import { Modal } from '@presentation/components/ui/Modal';
import { Input } from '@presentation/components/ui/Input';
import { Textarea } from '@presentation/components/ui/Textarea';
import { Select } from '@presentation/components/ui/Select';
import { Button } from '@presentation/components/ui/Button';

const STATUSES = ['scheduled', 'live', 'closed', 'cancelled'] as const;

const schema = z
  .object({
    title: z.string().trim().min(1, 'Le titre est requis').max(160),
    description: z.string().trim().max(500).optional().nullable(),
    quiz_id: z.string().uuid('UUID invalide').optional().or(z.literal('')),
    category_id: z.string().uuid('UUID invalide').optional().or(z.literal('')),
    status: z.enum(STATUSES),
    starts_at: z.string().optional().nullable(),
    ends_at: z.string().optional().nullable(),
    reward_text: z.string().trim().max(280).optional().nullable(),
  })
  .refine(
    (data) => {
      if (!data.starts_at || !data.ends_at) return true;
      return new Date(data.ends_at).getTime() >= new Date(data.starts_at).getTime();
    },
    { message: 'La date de fin doit être après la date de début', path: ['ends_at'] },
  );

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  initial: Competition | null;
  onClose: () => void;
  onSubmit: (input: CreateCompetitionInput) => Promise<void> | void;
  submitting?: boolean;
}

function isoToInput(v?: string | null): string {
  if (!v) return '';
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function inputToIso(v?: string | null): string | null {
  if (!v) return null;
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

export function CompetitionFormModal({ open, initial, onClose, onSubmit, submitting }: Props) {
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
      quiz_id: '',
      category_id: '',
      status: 'scheduled',
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
        quiz_id: initial?.quiz_id ?? '',
        category_id: initial?.category_id ?? '',
        status: (initial?.status as CompetitionStatus) ?? 'scheduled',
        starts_at: isoToInput(initial?.starts_at),
        ends_at: isoToInput(initial?.ends_at),
        reward_text: initial?.reward_text ?? '',
      });
    }
  }, [open, initial, reset]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={initial ? 'Modifier la compétition' : 'Nouvelle compétition'}
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
                status: values.status,
                starts_at: inputToIso(values.starts_at),
                ends_at: inputToIso(values.ends_at),
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
            placeholder="Compétition hebdomadaire"
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

        <Input
          {...register('quiz_id')}
          label="Quiz (UUID, optionnel)"
          placeholder="uuid…"
          error={errors.quiz_id?.message}
        />
        <Input
          {...register('category_id')}
          label="Catégorie (UUID, optionnel)"
          placeholder="uuid…"
          error={errors.category_id?.message}
        />

        <Select
          {...register('status')}
          label="Statut"
          options={STATUSES.map((s) => ({ value: s, label: s }))}
          error={errors.status?.message}
        />
        <Input
          {...register('reward_text')}
          label="Récompense (texte)"
          placeholder="Top 3 récompensés…"
          error={errors.reward_text?.message ?? undefined}
        />

        <Input
          {...register('starts_at')}
          type="datetime-local"
          label="Début"
          error={errors.starts_at?.message ?? undefined}
        />
        <Input
          {...register('ends_at')}
          type="datetime-local"
          label="Fin"
          error={errors.ends_at?.message ?? undefined}
        />
      </form>
    </Modal>
  );
}

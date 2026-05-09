import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Challenge, CreateChallengeInput } from '@domain/entities/challenge';
import { Modal } from '@presentation/components/ui/Modal';
import { Input } from '@presentation/components/ui/Input';
import { Select } from '@presentation/components/ui/Select';
import { Button } from '@presentation/components/ui/Button';

const uuid = z.string().uuid('UUID requis');

const STATUSES = ['pending', 'accepted', 'completed', 'declined', 'expired'] as const;

const schema = z.object({
  challenger_id: uuid,
  challenged_id: uuid,
  quiz_id: uuid,
  status: z.enum(STATUSES),
  challenger_score: z.coerce.number().int().min(0).optional().nullable(),
  challenged_score: z.coerce.number().int().min(0).optional().nullable(),
  winner_id: z.string().uuid().optional().or(z.literal('')),
  expires_at: z.string().optional().nullable(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  initial: Challenge | null;
  onClose: () => void;
  onSubmit: (input: CreateChallengeInput) => Promise<void> | void;
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

export function ChallengeFormModal({ open, initial, onClose, onSubmit, submitting }: Props) {
  const {
    register,
    handleSubmit,
    reset,
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

  useEffect(() => {
    if (open) {
      reset({
        challenger_id: initial?.challenger_id ?? '',
        challenged_id: initial?.challenged_id ?? '',
        quiz_id: initial?.quiz_id ?? '',
        status: (initial?.status as FormValues['status']) ?? 'pending',
        challenger_score: initial?.challenger_score ?? null,
        challenged_score: initial?.challenged_score ?? null,
        winner_id: initial?.winner_id ?? '',
        expires_at: isoToInput(initial?.expires_at),
      });
    }
  }, [open, initial, reset]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={initial ? 'Modifier le défi' : 'Nouveau défi'}
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
                expires_at: inputToIso(values.expires_at),
              });
            })}
          >
            {initial ? 'Enregistrer' : 'Créer'}
          </Button>
        </>
      }
    >
      <form className="grid gap-4 sm:grid-cols-2">
        <Input
          {...register('challenger_id')}
          label="Challenger (UUID profil)"
          placeholder="uuid…"
          error={errors.challenger_id?.message}
        />
        <Input
          {...register('challenged_id')}
          label="Challenged (UUID profil)"
          placeholder="uuid…"
          error={errors.challenged_id?.message}
        />
        <Input
          {...register('quiz_id')}
          label="Quiz (UUID)"
          placeholder="uuid…"
          error={errors.quiz_id?.message}
        />
        <Select
          {...register('status')}
          label="Statut"
          options={STATUSES.map((s) => ({ value: s, label: s }))}
          error={errors.status?.message}
        />
        <Input
          {...register('challenger_score', { valueAsNumber: true })}
          type="number"
          min={0}
          label="Score challenger"
        />
        <Input
          {...register('challenged_score', { valueAsNumber: true })}
          type="number"
          min={0}
          label="Score challenged"
        />
        <Input
          {...register('winner_id')}
          label="Winner (UUID, optionnel)"
          placeholder="uuid ou vide"
          error={errors.winner_id?.message}
        />
        <Input
          {...register('expires_at')}
          type="datetime-local"
          label="Expire le"
          error={errors.expires_at?.message ?? undefined}
        />
      </form>
    </Modal>
  );
}

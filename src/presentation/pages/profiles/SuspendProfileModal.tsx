import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Profile, SuspendProfileInput } from '@domain/entities/profile';
import { Modal } from '@presentation/components/ui/Modal';
import { Input } from '@presentation/components/ui/Input';
import { Textarea } from '@presentation/components/ui/Textarea';
import { Switch } from '@presentation/components/ui/Switch';
import { Button } from '@presentation/components/ui/Button';

const schema = z.object({
  is_suspended: z.boolean(),
  suspended_until: z.string().optional().nullable(),
  suspension_reason: z.string().trim().max(500).optional().nullable(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  profile: Profile | null;
  onClose: () => void;
  onSubmit: (input: SuspendProfileInput) => Promise<void> | void;
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

export function SuspendProfileModal({ open, profile, onClose, onSubmit, submitting }: Props) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      is_suspended: true,
      suspended_until: '',
      suspension_reason: '',
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        is_suspended: profile ? !profile.is_suspended : true,
        suspended_until: isoToInput(profile?.suspended_until ?? null),
        suspension_reason: profile?.suspension_reason ?? '',
      });
    }
  }, [open, profile, reset]);

  const isSuspended = watch('is_suspended');
  const willSuspend = isSuspended;

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="md"
      title={willSuspend ? 'Suspendre le profil' : 'Réactiver le profil'}
      description={
        profile
          ? `Action sur ${profile.username ?? profile.full_name ?? profile.id}`
          : undefined
      }
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Annuler
          </Button>
          <Button
            variant={willSuspend ? 'danger' : 'primary'}
            loading={submitting}
            onClick={handleSubmit(async (values) => {
              await onSubmit({
                is_suspended: values.is_suspended,
                suspended_until: values.is_suspended ? inputToIso(values.suspended_until) : null,
                suspension_reason: values.is_suspended ? values.suspension_reason || null : null,
              });
            })}
          >
            {willSuspend ? 'Suspendre' : 'Réactiver'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="rounded-xl border border-border bg-surfaceMuted/50 p-3">
          <Switch
            checked={isSuspended}
            onCheckedChange={(v) => setValue('is_suspended', v)}
            label="Suspendre ce profil"
            description="Désactivé : le profil retrouve l'accès."
          />
        </div>

        {isSuspended && (
          <>
            <Input
              {...register('suspended_until')}
              type="datetime-local"
              label="Suspension jusqu'au (optionnel)"
              hint="Laisser vide pour une suspension indéfinie."
              error={errors.suspended_until?.message ?? undefined}
            />
            <Textarea
              {...register('suspension_reason')}
              label="Raison"
              rows={3}
              placeholder="Ex. Violation des règles communautaires"
              error={errors.suspension_reason?.message}
            />
          </>
        )}
      </div>
    </Modal>
  );
}

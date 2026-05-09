import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { CreateLevelInput, DifficultyLevel } from '@domain/entities/level';
import { Modal } from '@presentation/components/ui/Modal';
import { Input } from '@presentation/components/ui/Input';
import { Textarea } from '@presentation/components/ui/Textarea';
import { Button } from '@presentation/components/ui/Button';
import { Switch } from '@presentation/components/ui/Switch';

const schema = z.object({
  code: z
    .string()
    .trim()
    .min(1, 'Le code est requis')
    .max(20, 'Le code doit faire 20 caractères max'),
  label: z.string().trim().min(1, 'Le libellé est requis'),
  description: z.string().trim().max(280).optional().nullable(),
  max_questions_per_quiz: z.coerce
    .number({ invalid_type_error: 'Doit être un nombre' })
    .int('Doit être un entier')
    .min(1, 'Au moins 1')
    .max(100, '100 max'),
  sort_order: z.coerce.number({ invalid_type_error: 'Doit être un nombre' }).int().min(0),
  is_active: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  initial: DifficultyLevel | null;
  onClose: () => void;
  onSubmit: (values: CreateLevelInput) => Promise<void> | void;
  submitting?: boolean;
}

export function LevelFormModal({ open, initial, onClose, onSubmit, submitting }: Props) {
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
      code: '',
      label: '',
      description: '',
      max_questions_per_quiz: 10,
      sort_order: 0,
      is_active: true,
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        code: initial?.code ?? '',
        label: initial?.label ?? '',
        description: initial?.description ?? '',
        max_questions_per_quiz: initial?.max_questions_per_quiz ?? 10,
        sort_order: initial?.sort_order ?? 0,
        is_active: initial ? !!initial.is_active : true,
      });
    }
  }, [open, initial, reset]);

  const isActive = watch('is_active');

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? 'Modifier le niveau' : 'Nouveau niveau'}
      description="Définit la difficulté d'un quiz et le nombre maximum de questions associées."
      size="lg"
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
                code: values.code,
                label: values.label,
                description: values.description || null,
                max_questions_per_quiz: values.max_questions_per_quiz,
                sort_order: values.sort_order,
                is_active: values.is_active,
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
          {...register('code')}
          label="Code"
          placeholder="Z0, Z1, Z2…"
          error={errors.code?.message}
        />
        <Input {...register('label')} label="Libellé" placeholder="Facile, Moyen…" error={errors.label?.message} />

        <div className="sm:col-span-2">
          <Textarea
            {...register('description')}
            label="Description"
            placeholder="Optionnel"
            rows={3}
            error={errors.description?.message}
          />
        </div>

        <Input
          {...register('max_questions_per_quiz', { valueAsNumber: true })}
          type="number"
          min={1}
          max={100}
          label="Questions max / quiz"
          error={errors.max_questions_per_quiz?.message}
        />
        <Input
          {...register('sort_order', { valueAsNumber: true })}
          type="number"
          min={0}
          label="Ordre d'affichage"
          error={errors.sort_order?.message}
        />

        <div className="sm:col-span-2">
          <Switch
            checked={isActive}
            onCheckedChange={(v) => setValue('is_active', v, { shouldDirty: true })}
            label="Actif"
            description="Disponible pour la création de quiz"
          />
        </div>
      </form>
    </Modal>
  );
}

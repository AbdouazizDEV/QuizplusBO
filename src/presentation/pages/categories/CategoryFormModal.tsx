import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Category, CreateCategoryInput } from '@domain/entities/category';
import { Modal } from '@presentation/components/ui/Modal';
import { Input } from '@presentation/components/ui/Input';
import { Button } from '@presentation/components/ui/Button';
import { slugify } from '@shared/lib/format';

const schema = z.object({
  name: z.string().trim().min(1, 'Le nom est requis'),
  slug: z
    .string()
    .trim()
    .min(1, 'Le slug est requis')
    .regex(/^[a-z0-9-]+$/, 'Lettres minuscules, chiffres et tirets uniquement'),
  icon: z.string().trim().max(40).optional().nullable(),
  color: z
    .string()
    .trim()
    .regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, 'Format hexadécimal (#FFAA22)')
    .optional()
    .or(z.literal('')),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  initial: Category | null;
  onClose: () => void;
  onSubmit: (input: CreateCategoryInput) => Promise<void> | void;
  submitting?: boolean;
}

export function CategoryFormModal({ open, initial, onClose, onSubmit, submitting }: Props) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, dirtyFields },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', slug: '', icon: '', color: '' },
  });

  useEffect(() => {
    if (open) {
      reset({
        name: initial?.name ?? '',
        slug: initial?.slug ?? '',
        icon: initial?.icon ?? '',
        color: initial?.color ?? '',
      });
    }
  }, [open, initial, reset]);

  const name = watch('name');
  useEffect(() => {
    if (!initial && !dirtyFields.slug) {
      setValue('slug', slugify(name || ''));
    }
  }, [name, initial, dirtyFields.slug, setValue]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
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
                name: values.name,
                slug: values.slug,
                icon: values.icon || null,
                color: values.color ? values.color : null,
              });
            })}
          >
            {initial ? 'Enregistrer' : 'Créer'}
          </Button>
        </>
      }
    >
      <form className="grid gap-4 sm:grid-cols-2">
        <Input {...register('name')} label="Nom" placeholder="Sciences" error={errors.name?.message} />
        <Input {...register('slug')} label="Slug" placeholder="sciences" error={errors.slug?.message} />
        <Input
          {...register('icon')}
          label="Icône (clé)"
          placeholder="atom, book…"
          hint="Clé d'icône utilisée par l'app mobile"
          error={errors.icon?.message ?? undefined}
        />
        <Input
          {...register('color')}
          label="Couleur"
          placeholder="#3366FF"
          hint="Format hexadécimal"
          error={errors.color?.message ?? undefined}
        />
      </form>
    </Modal>
  );
}

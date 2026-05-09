import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type {
  CreateSubcategoryInput,
  Subcategory,
} from '@domain/entities/subcategory';
import type { Category } from '@domain/entities/category';
import { Modal } from '@presentation/components/ui/Modal';
import { Input } from '@presentation/components/ui/Input';
import { Textarea } from '@presentation/components/ui/Textarea';
import { Select } from '@presentation/components/ui/Select';
import { Button } from '@presentation/components/ui/Button';
import { slugify } from '@shared/lib/format';

const schema = z.object({
  category_id: z.string().min(1, 'Sélectionnez une catégorie'),
  name: z.string().trim().min(1, 'Le nom est requis'),
  slug: z
    .string()
    .trim()
    .min(1, 'Le slug est requis')
    .regex(/^[a-z0-9-]+$/, 'Lettres minuscules, chiffres et tirets'),
  description: z.string().trim().max(280).optional().nullable(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  initial: Subcategory | null;
  categories: Category[];
  onClose: () => void;
  onSubmit: (input: CreateSubcategoryInput) => Promise<void> | void;
  submitting?: boolean;
}

export function SubcategoryFormModal({
  open,
  initial,
  categories,
  onClose,
  onSubmit,
  submitting,
}: Props) {
  const defaultCategory = useMemo(
    () => initial?.category_id ?? categories[0]?.id ?? '',
    [initial, categories],
  );
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, dirtyFields },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      category_id: defaultCategory,
      name: '',
      slug: '',
      description: '',
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        category_id: initial?.category_id ?? defaultCategory,
        name: initial?.name ?? '',
        slug: initial?.slug ?? '',
        description: initial?.description ?? '',
      });
    }
  }, [open, initial, defaultCategory, reset]);

  const name = watch('name');
  useEffect(() => {
    if (!initial && !dirtyFields.slug) setValue('slug', slugify(name || ''));
  }, [name, initial, dirtyFields.slug, setValue]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? 'Modifier la sous-catégorie' : 'Nouvelle sous-catégorie'}
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
                category_id: values.category_id,
                name: values.name,
                slug: values.slug,
                description: values.description || null,
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
          <Select
            {...register('category_id')}
            label="Catégorie parente"
            placeholder="Sélectionner…"
            options={categories.map((c) => ({ value: c.id, label: c.name }))}
            error={errors.category_id?.message}
          />
        </div>
        <Input {...register('name')} label="Nom" placeholder="Astronomie" error={errors.name?.message} />
        <Input
          {...register('slug')}
          label="Slug"
          placeholder="astronomie"
          error={errors.slug?.message}
        />
        <div className="sm:col-span-2">
          <Textarea
            {...register('description')}
            label="Description"
            placeholder="Optionnel"
            rows={3}
            error={errors.description?.message}
          />
        </div>
      </form>
    </Modal>
  );
}

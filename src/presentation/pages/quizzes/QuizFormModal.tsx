import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { CreateQuizInput, Quiz } from '@domain/entities/quiz';
import type { Category } from '@domain/entities/category';
import type { Subcategory } from '@domain/entities/subcategory';
import type { DifficultyLevel } from '@domain/entities/level';
import { Modal } from '@presentation/components/ui/Modal';
import { Input } from '@presentation/components/ui/Input';
import { Textarea } from '@presentation/components/ui/Textarea';
import { Select } from '@presentation/components/ui/Select';
import { Switch } from '@presentation/components/ui/Switch';
import { Button } from '@presentation/components/ui/Button';

const schema = z.object({
  title: z.string().trim().min(1, 'Le titre est requis').max(160),
  description: z.string().trim().max(500).optional().nullable(),
  category_id: z.string().min(1, 'Sélectionnez une catégorie'),
  subcategory_id: z.string().min(1, 'Sélectionnez une sous-catégorie'),
  difficulty_level: z.string().min(1, 'Sélectionnez une difficulté'),
  theme: z.string().trim().max(80).optional().nullable(),
  thumbnail_url: z.string().trim().url('URL invalide').optional().or(z.literal('')),
  points_per_question: z.coerce.number().int().min(0).max(1000).optional(),
  completion_bonus: z.coerce.number().int().min(0).max(10000).optional(),
  is_published: z.boolean(),
});
type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  initial: Quiz | null;
  categories: Category[];
  subcategories: Subcategory[];
  levels: DifficultyLevel[];
  onClose: () => void;
  onSubmit: (input: CreateQuizInput) => Promise<void> | void;
  submitting?: boolean;
}

export function QuizFormModal({
  open,
  initial,
  categories,
  subcategories,
  levels,
  onClose,
  onSubmit,
  submitting,
}: Props) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      description: '',
      category_id: '',
      subcategory_id: '',
      difficulty_level: '',
      theme: '',
      thumbnail_url: '',
      points_per_question: 1,
      completion_bonus: 0,
      is_published: false,
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        title: initial?.title ?? '',
        description: initial?.description ?? '',
        category_id: initial?.category_id ?? '',
        subcategory_id: initial?.subcategory_id ?? '',
        difficulty_level: initial?.difficulty_level ?? '',
        theme: initial?.theme ?? '',
        thumbnail_url: initial?.thumbnail_url ?? '',
        points_per_question: initial?.points_per_question ?? 1,
        completion_bonus: initial?.completion_bonus ?? 0,
        is_published: initial?.is_published ?? false,
      });
    }
  }, [open, initial, reset]);

  const categoryId = watch('category_id');
  const isPublished = watch('is_published');

  const filteredSubcats = useMemo(
    () => subcategories.filter((s) => !categoryId || s.category_id === categoryId),
    [subcategories, categoryId],
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="xl"
      title={initial ? 'Modifier le quiz' : 'Nouveau quiz'}
      description="Renseignez les informations de base du quiz. Les questions s'ajoutent depuis la fiche détail."
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
                category_id: values.category_id,
                subcategory_id: values.subcategory_id,
                difficulty_level: values.difficulty_level,
                theme: values.theme || null,
                thumbnail_url: values.thumbnail_url ? values.thumbnail_url : null,
                points_per_question: values.points_per_question ?? 1,
                completion_bonus: values.completion_bonus ?? 0,
                is_published: values.is_published,
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
            placeholder="Ex. Culture générale du Sénégal"
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

        <Select
          {...register('category_id')}
          label="Catégorie"
          placeholder="Sélectionner…"
          options={categories.map((c) => ({ value: c.id, label: c.name }))}
          error={errors.category_id?.message}
          onChange={(e) => {
            setValue('category_id', e.target.value, { shouldValidate: true });
            setValue('subcategory_id', '', { shouldValidate: true });
          }}
        />
        <Select
          {...register('subcategory_id')}
          label="Sous-catégorie"
          placeholder={categoryId ? 'Sélectionner…' : 'Choisissez d’abord une catégorie'}
          options={filteredSubcats.map((s) => ({ value: s.id, label: s.name }))}
          error={errors.subcategory_id?.message}
          disabled={!categoryId}
        />

        <Select
          {...register('difficulty_level')}
          label="Difficulté"
          placeholder="Sélectionner…"
          options={levels
            .slice()
            .sort((a, b) => a.sort_order - b.sort_order)
            .map((l) => ({ value: l.code, label: `${l.code} • ${l.label}` }))}
          error={errors.difficulty_level?.message}
        />
        <Input {...register('theme')} label="Thème" placeholder="geographie, histoire…" error={errors.theme?.message ?? undefined} />

        <Input
          {...register('thumbnail_url')}
          label="Thumbnail (URL)"
          placeholder="https://…"
          error={errors.thumbnail_url?.message}
          hint="Astuce : utilisez l'outil Upload Média pour obtenir une URL Cloudinary."
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            {...register('points_per_question', { valueAsNumber: true })}
            type="number"
            min={0}
            label="Points / question"
            error={errors.points_per_question?.message}
          />
          <Input
            {...register('completion_bonus', { valueAsNumber: true })}
            type="number"
            min={0}
            label="Bonus complétion"
            error={errors.completion_bonus?.message}
          />
        </div>

        <div className="sm:col-span-2 rounded-xl border border-border bg-surfaceMuted/50 p-3">
          <Switch
            checked={isPublished}
            onCheckedChange={(v) => setValue('is_published', v)}
            label="Publié"
            description="Visible et jouable côté mobile."
          />
        </div>
      </form>
    </Modal>
  );
}

import { useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ImageUp, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import type { CreateQuizInput, Quiz } from '@domain/entities/quiz';
import type { Category } from '@domain/entities/category';
import type { Subcategory } from '@domain/entities/subcategory';
import type { DifficultyLevel } from '@domain/entities/level';
import { useUploadImage } from '@application/media/use-media';
import { Modal } from '@presentation/components/ui/Modal';
import { Input } from '@presentation/components/ui/Input';
import { Textarea } from '@presentation/components/ui/Textarea';
import { Select } from '@presentation/components/ui/Select';
import { Switch } from '@presentation/components/ui/Switch';
import { Button } from '@presentation/components/ui/Button';
import { cn } from '@shared/lib/cn';
import { toastApiError } from '@shared/lib/api-error-toast';

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

const schema = z.object({
  title: z.string().trim().min(1, 'Le titre est requis').max(160),
  description: z.string().trim().max(500).optional().nullable(),
  category_id: z.string().min(1, 'Sélectionnez une catégorie'),
  subcategory_id: z.string().min(1, 'Sélectionnez une sous-catégorie'),
  difficulty_level: z.string().min(1, 'Sélectionnez une difficulté'),
  theme: z.string().trim().max(80).optional().nullable(),
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
  const uploadImage = useUploadImage();
  const fileRef = useRef<HTMLInputElement>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [keptThumbnailUrl, setKeptThumbnailUrl] = useState<string | null>(null);
  const [blobPreview, setBlobPreview] = useState<string | null>(null);

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
        points_per_question: initial?.points_per_question ?? 1,
        completion_bonus: initial?.completion_bonus ?? 0,
        is_published: initial?.is_published ?? false,
      });
      setThumbnailFile(null);
      setKeptThumbnailUrl(initial?.thumbnail_url ?? null);
    }
  }, [open, initial, reset]);

  useEffect(() => {
    if (!thumbnailFile) {
      setBlobPreview(null);
      return;
    }
    const url = URL.createObjectURL(thumbnailFile);
    setBlobPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [thumbnailFile]);

  const previewUrl = blobPreview ?? keptThumbnailUrl;

  const categoryId = watch('category_id');
  const isPublished = watch('is_published');
  const isBusy = submitting || uploadImage.isPending;

  const filteredSubcats = useMemo(
    () => subcategories.filter((s) => !categoryId || s.category_id === categoryId),
    [subcategories, categoryId],
  );

  const onPickFile = (file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez choisir une image (PNG, JPG, WEBP…).');
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      toast.error('Image trop volumineuse (5 Mo max).');
      return;
    }
    setThumbnailFile(file);
  };

  const clearThumbnail = () => {
    setThumbnailFile(null);
    setKeptThumbnailUrl(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="xl"
      title={initial ? 'Modifier le quiz' : 'Nouveau quiz'}
      description="Renseignez les informations de base du quiz. Les questions s'ajoutent depuis la fiche détail."
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isBusy}>
            Annuler
          </Button>
          <Button
            variant="primary"
            loading={isBusy}
            onClick={handleSubmit(async (values) => {
              try {
                let thumbnailUrl = keptThumbnailUrl;
                if (thumbnailFile) {
                  const res = await uploadImage.mutateAsync({
                    file: thumbnailFile,
                    ownerId: `quiz-${values.title.trim().slice(0, 40) || 'cover'}`,
                  });
                  thumbnailUrl = res.secure_url;
                }

                await onSubmit({
                  title: values.title,
                  description: values.description || null,
                  category_id: values.category_id,
                  subcategory_id: values.subcategory_id,
                  difficulty_level: values.difficulty_level,
                  theme: values.theme || null,
                  thumbnail_url: thumbnailUrl,
                  points_per_question: values.points_per_question ?? 1,
                  completion_bonus: values.completion_bonus ?? 0,
                  is_published: values.is_published,
                });
              } catch (err) {
                toastApiError(err);
              }
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

        <div className="sm:col-span-2">
          <p className="mb-1.5 text-sm font-semibold text-foreground">Image de couverture</p>
          <div className="flex flex-col gap-3 rounded-xl border border-border bg-surfaceMuted/40 p-3 sm:flex-row sm:items-center">
            <div
              className={cn(
                'flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-dashed border-border bg-surface',
                previewUrl && 'border-solid',
              )}
            >
              {previewUrl ? (
                <img src={previewUrl} alt="Aperçu" className="h-full w-full object-cover" />
              ) : (
                <ImageUp className="h-8 w-8 text-muted" />
              )}
            </div>
            <div className="flex flex-1 flex-wrap items-center gap-2">
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) onPickFile(f);
                  e.currentTarget.value = '';
                }}
              />
              <Button type="button" variant="secondary" size="sm" onClick={() => fileRef.current?.click()}>
                Choisir une image
              </Button>
              {previewUrl && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  leftIcon={<Trash2 className="h-3.5 w-3.5" />}
                  onClick={clearThumbnail}
                >
                  Retirer
                </Button>
              )}
            </div>
          </div>
          <p className="mt-1.5 text-2xs text-muted">PNG, JPG ou WEBP — 5 Mo max. L’image est envoyée sur Cloudinary à la création.</p>
        </div>

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

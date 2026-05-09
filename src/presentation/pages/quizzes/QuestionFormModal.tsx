import { useEffect } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2 } from 'lucide-react';
import type { CreateQuestionInput, Question } from '@domain/entities/question';
import { Modal } from '@presentation/components/ui/Modal';
import { Input } from '@presentation/components/ui/Input';
import { Textarea } from '@presentation/components/ui/Textarea';
import { Button } from '@presentation/components/ui/Button';
import { Select } from '@presentation/components/ui/Select';

const optionSchema = z.object({
  id: z.string().trim().min(1, 'ID requis'),
  label: z.string().trim().min(1, 'Libellé requis'),
});

const schema = z
  .object({
    question_text: z.string().trim().min(1, 'Question requise'),
    options: z.array(optionSchema).min(2, 'Au moins 2 options').max(6, '6 options max'),
    correct_option_id: z.string().min(1, 'Sélectionnez la bonne réponse'),
    explanation: z.string().trim().max(500).optional().nullable(),
    order_index: z.coerce.number().int().min(0).optional(),
    subcategory: z.string().trim().max(80).optional().nullable(),
    tags: z.string().trim().optional(),
    difficulty_label: z.string().trim().max(80).optional().nullable(),
  })
  .refine((data) => data.options.some((o) => o.id === data.correct_option_id), {
    message: 'La bonne réponse doit correspondre à un ID d’option',
    path: ['correct_option_id'],
  });

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  quizId: string;
  initial: Question | null;
  onClose: () => void;
  onSubmit: (input: CreateQuestionInput) => Promise<void> | void;
  submitting?: boolean;
}

export function QuestionFormModal({ open, quizId, initial, onClose, onSubmit, submitting }: Props) {
  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      question_text: '',
      options: [
        { id: 'A', label: '' },
        { id: 'B', label: '' },
        { id: 'C', label: '' },
        { id: 'D', label: '' },
      ],
      correct_option_id: 'A',
      explanation: '',
      order_index: 1,
      subcategory: '',
      tags: '',
      difficulty_label: '',
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'options' });

  useEffect(() => {
    if (open) {
      reset({
        question_text: initial?.question_text ?? '',
        options:
          initial?.options && initial.options.length >= 2
            ? initial.options
            : [
                { id: 'A', label: '' },
                { id: 'B', label: '' },
                { id: 'C', label: '' },
                { id: 'D', label: '' },
              ],
        correct_option_id: initial?.correct_option_id ?? 'A',
        explanation: initial?.explanation ?? '',
        order_index: initial?.order_index ?? 1,
        subcategory: initial?.subcategory ?? '',
        tags: (initial?.tags ?? []).join(', '),
        difficulty_label: initial?.difficulty_label ?? '',
      });
    }
  }, [open, initial, reset]);

  const options = watch('options');

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="xl"
      title={initial ? 'Modifier la question' : 'Nouvelle question'}
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
                quiz_id: quizId,
                question_text: values.question_text,
                options: values.options,
                correct_option_id: values.correct_option_id,
                explanation: values.explanation || null,
                order_index: values.order_index ?? null,
                subcategory: values.subcategory || null,
                tags: values.tags
                  ? values.tags.split(',').map((t) => t.trim()).filter(Boolean)
                  : null,
                difficulty_label: values.difficulty_label || null,
              });
            })}
          >
            {initial ? 'Enregistrer' : 'Créer'}
          </Button>
        </>
      }
    >
      <form className="space-y-4">
        <Textarea
          {...register('question_text')}
          label="Question"
          rows={3}
          placeholder="Quelle est la capitale du Sénégal ?"
          error={errors.question_text?.message}
        />

        <div className="rounded-xl border border-border p-4">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="text-sm font-bold">Options de réponse</h4>
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<Plus className="h-3.5 w-3.5" />}
              disabled={fields.length >= 6}
              onClick={() => {
                const nextId = String.fromCharCode(65 + fields.length);
                append({ id: nextId, label: '' });
              }}
            >
              Ajouter
            </Button>
          </div>
          <div className="space-y-2.5">
            {fields.map((f, idx) => (
              <div key={f.id} className="grid grid-cols-[80px_1fr_auto] items-start gap-2">
                <Input
                  {...register(`options.${idx}.id` as const)}
                  placeholder="A"
                  error={errors.options?.[idx]?.id?.message}
                />
                <Input
                  {...register(`options.${idx}.label` as const)}
                  placeholder={`Option ${idx + 1}`}
                  error={errors.options?.[idx]?.label?.message}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-danger hover:bg-danger/10"
                  onClick={() => fields.length > 2 && remove(idx)}
                  disabled={fields.length <= 2}
                  aria-label="Retirer"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          {errors.options?.message && (
            <p className="mt-2 text-xs font-medium text-danger">{errors.options.message}</p>
          )}
        </div>

        <Select
          {...register('correct_option_id')}
          label="Bonne réponse"
          placeholder="Sélectionner…"
          options={options.map((o) => ({ value: o.id, label: `${o.id} — ${o.label || '(vide)'}` }))}
          error={errors.correct_option_id?.message}
        />

        <Textarea
          {...register('explanation')}
          label="Explication (optionnel)"
          rows={2}
          placeholder="Affichée après la réponse"
          error={errors.explanation?.message}
        />

        <div className="grid gap-3 sm:grid-cols-3">
          <Input
            {...register('order_index', { valueAsNumber: true })}
            type="number"
            min={0}
            label="Ordre"
            error={errors.order_index?.message}
          />
          <Input
            {...register('subcategory')}
            label="Sous-catégorie (libellé)"
            placeholder="Ex. Histoire"
            error={errors.subcategory?.message ?? undefined}
          />
          <Input
            {...register('difficulty_label')}
            label="Difficulté (libellé)"
            placeholder="Facile…"
            error={errors.difficulty_label?.message ?? undefined}
          />
        </div>
        <Input
          {...register('tags')}
          label="Tags"
          placeholder="senegal, histoire (séparés par des virgules)"
        />
      </form>
    </Modal>
  );
}

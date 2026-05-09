import { useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Plus,
  Upload,
  CheckCircle2,
  Sparkles,
  Eye,
  EyeOff,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  useDeleteQuiz,
  useImportIntoQuiz,
  useQuizzesQuery,
  useUpdateQuiz,
} from '@application/quizzes/use-quizzes';
import {
  useCreateQuestion,
  useDeleteQuestion,
  useQuestionsQuery,
  useUpdateQuestion,
} from '@application/questions/use-questions';
import { useCategoriesQuery } from '@application/categories/use-categories';
import { useSubcategoriesQuery } from '@application/subcategories/use-subcategories';
import { useLevelsQuery } from '@application/levels/use-levels';
import type { Question } from '@domain/entities/question';
import type { Quiz } from '@domain/entities/quiz';
import { PageHeader } from '@presentation/components/data/PageHeader';
import { Card, CardBody, CardHeader } from '@presentation/components/ui/Card';
import { Button } from '@presentation/components/ui/Button';
import { Badge } from '@presentation/components/ui/Badge';
import { Skeleton } from '@presentation/components/ui/Skeleton';
import { ConfirmDialog } from '@presentation/components/feedback/ConfirmDialog';
import { EmptyState } from '@presentation/components/feedback/EmptyState';
import { ErrorState } from '@presentation/components/feedback/ErrorState';
import { QuizFormModal } from './QuizFormModal';
import { QuestionFormModal } from './QuestionFormModal';
import { toastApiError } from '@shared/lib/api-error-toast';

export default function QuizDetailPage() {
  const { quizId = '' } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);

  const cats = useCategoriesQuery();
  const subs = useSubcategoriesQuery();
  const lvls = useLevelsQuery();
  const allQuiz = useQuizzesQuery({ page: 1, limit: 200 });
  const quiz = allQuiz.data?.items.find((q) => q.id === quizId);

  const updateQuiz = useUpdateQuiz();
  const deleteQuiz = useDeleteQuiz();
  const importInto = useImportIntoQuiz();

  const questions = useQuestionsQuery(quizId);
  const createQ = useCreateQuestion();
  const updateQ = useUpdateQuestion(quizId);
  const deleteQ = useDeleteQuestion(quizId);

  const [openEdit, setOpenEdit] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);

  const [openQ, setOpenQ] = useState(false);
  const [editingQ, setEditingQ] = useState<Question | null>(null);
  const [delQ, setDelQ] = useState<Question | null>(null);

  const onCreateQ = () => {
    setEditingQ(null);
    setOpenQ(true);
  };
  const onEditQ = (q: Question) => {
    setEditingQ(q);
    setOpenQ(true);
  };

  const onTogglePublish = async (q: Quiz) => {
    try {
      await updateQuiz.mutateAsync({ id: q.id, input: { is_published: !q.is_published } });
      toast.success(q.is_published ? 'Quiz dépublié' : 'Quiz publié');
    } catch (err) {
      toastApiError(err);
    }
  };

  const handleImportFile = async (file: File) => {
    if (!quiz) return;
    try {
      const res = await importInto.mutateAsync({ quizId: quiz.id, file });
      toast.success('Import réussi', {
        description: `${res.imported_questions} question(s) ajoutée(s).`,
      });
    } catch (err) {
      toastApiError(err);
    }
  };

  if (allQuiz.isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate('/quizzes')}>
          Retour
        </Button>
        <ErrorState error={new Error('Quiz introuvable')} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumb={
          <Link to="/quizzes" className="hover:text-foreground">
            ← Tous les quiz
          </Link>
        }
        title={quiz.title}
        description={quiz.description ?? 'Détail du quiz et gestion des questions.'}
        actions={
          <>
            <Button
              variant="secondary"
              leftIcon={quiz.is_published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              onClick={() => onTogglePublish(quiz)}
              loading={updateQuiz.isPending}
            >
              {quiz.is_published ? 'Dépublier' : 'Publier'}
            </Button>
            <Button variant="secondary" leftIcon={<Pencil className="h-4 w-4" />} onClick={() => setOpenEdit(true)}>
              Modifier
            </Button>
            <Button
              variant="secondary"
              leftIcon={<Trash2 className="h-4 w-4" />}
              className="text-danger hover:bg-danger/10"
              onClick={() => setConfirmDel(true)}
            >
              Supprimer
            </Button>
          </>
        }
      />

      <Card>
        <CardBody className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Difficulté" value={<Badge tone="brand">{quiz.difficulty_level ?? '—'}</Badge>} />
          <Stat label="Questions" value={<span className="text-xl font-black">{quiz.total_questions ?? questions.data?.length ?? 0}</span>} />
          <Stat
            label="Catégorie"
            value={
              <Badge tone="accent">
                {cats.data?.find((c) => c.id === quiz.category_id)?.name ?? '—'}
              </Badge>
            }
          />
          <Stat
            label="Sous-catégorie"
            value={
              <Badge tone="info">
                {subs.data?.find((s) => s.id === quiz.subcategory_id)?.name ?? '—'}
              </Badge>
            }
          />
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="Questions"
          description="Modifiez et complétez les questions de ce quiz."
          actions={
            <>
              <Button
                variant="secondary"
                leftIcon={<Upload className="h-4 w-4" />}
                onClick={() => fileRef.current?.click()}
                loading={importInto.isPending}
              >
                Importer
              </Button>
              <input
                ref={fileRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleImportFile(f);
                  e.currentTarget.value = '';
                }}
              />
              <Button variant="gradient" leftIcon={<Plus className="h-4 w-4" />} onClick={onCreateQ}>
                Nouvelle question
              </Button>
            </>
          }
        />
        <CardBody className="space-y-3">
          {questions.isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : questions.error ? (
            <ErrorState error={questions.error} onRetry={() => questions.refetch()} />
          ) : (questions.data?.length ?? 0) === 0 ? (
            <EmptyState
              icon={<Sparkles className="h-5 w-5" />}
              title="Aucune question"
              description="Ajoutez la première question manuellement ou importez un fichier."
              action={
                <Button variant="primary" leftIcon={<Plus className="h-4 w-4" />} onClick={onCreateQ}>
                  Créer une question
                </Button>
              }
            />
          ) : (
            questions.data!.map((q, idx) => (
              <article
                key={q.id}
                className="rounded-2xl border border-border bg-surface p-4 transition-shadow hover:shadow-soft"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex items-start gap-3">
                    <span className="quizz-gradient inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white text-xs font-black">
                      {idx + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-foreground">{q.question_text}</p>
                      <ul className="mt-2 grid gap-1 sm:grid-cols-2">
                        {q.options.map((opt) => {
                          const isCorrect = opt.id === q.correct_option_id;
                          return (
                            <li
                              key={opt.id}
                              className={
                                isCorrect
                                  ? 'flex items-center gap-2 rounded-lg bg-success/10 px-2.5 py-1.5 text-xs font-semibold text-success ring-1 ring-inset ring-success/20'
                                  : 'flex items-center gap-2 rounded-lg bg-surfaceMuted px-2.5 py-1.5 text-xs font-semibold text-foreground ring-1 ring-inset ring-border'
                              }
                            >
                              <span className="font-black">{opt.id}</span>
                              <span className="truncate">{opt.label}</span>
                              {isCorrect && <CheckCircle2 className="ml-auto h-3.5 w-3.5" />}
                            </li>
                          );
                        })}
                      </ul>
                      {q.explanation && (
                        <p className="mt-2 text-xs text-muted">
                          <span className="font-bold">Explication : </span>
                          {q.explanation}
                        </p>
                      )}
                      {(q.tags?.length ?? 0) > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {q.tags!.map((t) => (
                            <Badge key={t} size="sm">
                              #{t}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <Button variant="ghost" size="icon" aria-label="Modifier" onClick={() => onEditQ(q)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-danger hover:bg-danger/10"
                      onClick={() => setDelQ(q)}
                      aria-label="Supprimer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </article>
            ))
          )}
        </CardBody>
      </Card>

      <QuizFormModal
        open={openEdit}
        initial={quiz}
        categories={cats.data ?? []}
        subcategories={subs.data ?? []}
        levels={lvls.data ?? []}
        onClose={() => setOpenEdit(false)}
        submitting={updateQuiz.isPending}
        onSubmit={async (values) => {
          try {
            await updateQuiz.mutateAsync({ id: quiz.id, input: values });
            toast.success('Quiz mis à jour');
            setOpenEdit(false);
          } catch (err) {
            toastApiError(err);
          }
        }}
      />

      <QuestionFormModal
        open={openQ}
        quizId={quiz.id}
        initial={editingQ}
        onClose={() => setOpenQ(false)}
        submitting={createQ.isPending || updateQ.isPending}
        onSubmit={async (input) => {
          try {
            if (editingQ) {
              const { quiz_id: _qid, ...rest } = input;
              await updateQ.mutateAsync({ id: editingQ.id, input: rest });
              toast.success('Question mise à jour');
            } else {
              await createQ.mutateAsync(input);
              toast.success('Question créée');
            }
            setOpenQ(false);
          } catch (err) {
            toastApiError(err);
          }
        }}
      />

      <ConfirmDialog
        open={!!delQ}
        title="Supprimer cette question ?"
        description="Cette opération est irréversible."
        destructive
        loading={deleteQ.isPending}
        onCancel={() => setDelQ(null)}
        onConfirm={async () => {
          if (!delQ) return;
          try {
            await deleteQ.mutateAsync(delQ.id);
            toast.success('Question supprimée');
            setDelQ(null);
          } catch (err) {
            toastApiError(err);
          }
        }}
      />

      <ConfirmDialog
        open={confirmDel}
        title={`Supprimer "${quiz.title}" ?`}
        description="Toutes les questions associées seront supprimées."
        destructive
        loading={deleteQuiz.isPending}
        onCancel={() => setConfirmDel(false)}
        onConfirm={async () => {
          try {
            await deleteQuiz.mutateAsync(quiz.id);
            toast.success('Quiz supprimé');
            navigate('/quizzes');
          } catch (err) {
            toastApiError(err);
          }
        }}
      />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-2xs font-bold uppercase tracking-widest text-muted">{label}</p>
      <div className="mt-1.5">{value}</div>
    </div>
  );
}

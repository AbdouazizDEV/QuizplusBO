import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, Upload, Search, Eye, Sparkles, X } from 'lucide-react';
import { toast } from 'sonner';
import {
  useCreateQuiz,
  useDeleteQuiz,
  useQuizzesQuery,
  useUpdateQuiz,
} from '@application/quizzes/use-quizzes';
import { useCategoriesQuery } from '@application/categories/use-categories';
import { useSubcategoriesQuery } from '@application/subcategories/use-subcategories';
import { useLevelsQuery } from '@application/levels/use-levels';
import type { Quiz, QuizListQuery } from '@domain/entities/quiz';
import { PageHeader } from '@presentation/components/data/PageHeader';
import { DataTable, type Column } from '@presentation/components/data/DataTable';
import { Pagination } from '@presentation/components/data/Pagination';
import { Button } from '@presentation/components/ui/Button';
import { Input } from '@presentation/components/ui/Input';
import { Select } from '@presentation/components/ui/Select';
import { Badge } from '@presentation/components/ui/Badge';
import { ConfirmDialog } from '@presentation/components/feedback/ConfirmDialog';
import { QuizFormModal } from './QuizFormModal';
import { QuizImportModal } from './QuizImportModal';
import { useDebouncedValue } from '@shared/lib/use-debounced-value';
import { toastApiError } from '@shared/lib/api-error-toast';
import { truncate } from '@shared/lib/format';

export default function QuizzesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [subcategoryId, setSubcategoryId] = useState('');
  const [level, setLevel] = useState('');

  const debouncedSearch = useDebouncedValue(search, 300);
  const filters: QuizListQuery = useMemo(
    () => ({
      page,
      limit: 20,
      search: debouncedSearch || undefined,
      category_id: categoryId || undefined,
      subcategory_id: subcategoryId || undefined,
      difficulty_level: level || undefined,
    }),
    [page, debouncedSearch, categoryId, subcategoryId, level],
  );

  const list = useQuizzesQuery(filters);
  const cats = useCategoriesQuery();
  const subs = useSubcategoriesQuery(categoryId || undefined);
  const lvls = useLevelsQuery();

  const createM = useCreateQuiz();
  const updateM = useUpdateQuiz();
  const deleteM = useDeleteQuiz();

  const [editing, setEditing] = useState<Quiz | null>(null);
  const [openForm, setOpenForm] = useState(false);
  const [openImport, setOpenImport] = useState(false);
  const [toDelete, setToDelete] = useState<Quiz | null>(null);

  const categoryNameById = useMemo(() => {
    const map = new Map<string, string>();
    (cats.data ?? []).forEach((c) => map.set(c.id, c.name));
    return map;
  }, [cats.data]);

  const onCreate = () => {
    setEditing(null);
    setOpenForm(true);
  };
  const onEdit = (q: Quiz) => {
    setEditing(q);
    setOpenForm(true);
  };

  const resetFilters = () => {
    setSearch('');
    setCategoryId('');
    setSubcategoryId('');
    setLevel('');
    setPage(1);
  };

  const columns: Column<Quiz>[] = [
    {
      key: 'title',
      header: 'Quiz',
      cell: (q) => (
        <Link
          to={`/quizzes/${q.id}`}
          className="group flex items-center gap-3 hover:text-brand-600"
        >
          <span className="quizz-gradient inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white shadow-soft">
            <Sparkles className="h-4 w-4" />
          </span>
          <span className="min-w-0">
            <span className="block truncate font-bold">{q.title}</span>
            <span className="block text-2xs text-muted">{truncate(q.description, 80)}</span>
          </span>
        </Link>
      ),
    },
    {
      key: 'category',
      header: 'Catégorie',
      cell: (q) => (
        <Badge tone="brand">
          {q.category_id ? (categoryNameById.get(q.category_id) ?? '—') : '—'}
        </Badge>
      ),
      width: '180px',
    },
    {
      key: 'difficulty',
      header: 'Difficulté',
      cell: (q) => <Badge tone="accent">{q.difficulty_level ?? '—'}</Badge>,
      width: '120px',
    },
    {
      key: 'questions',
      header: 'Questions',
      align: 'right',
      cell: (q) => <span className="tabular-nums">{q.total_questions ?? '—'}</span>,
      width: '120px',
    },
    {
      key: 'published',
      header: 'Statut',
      cell: (q) =>
        q.is_published ? <Badge tone="success">Publié</Badge> : <Badge>Brouillon</Badge>,
      width: '120px',
    },
    {
      key: 'actions',
      header: <span className="sr-only">Actions</span>,
      align: 'right',
      width: '180px',
      cell: (q) => (
        <div className="flex items-center justify-end gap-1.5">
          <Link to={`/quizzes/${q.id}`}>
            <Button variant="ghost" size="icon" aria-label="Voir">
              <Eye className="h-4 w-4" />
            </Button>
          </Link>
          <Button variant="ghost" size="icon" aria-label="Modifier" onClick={() => onEdit(q)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Supprimer"
            className="text-danger hover:bg-danger/10"
            onClick={() => setToDelete(q)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const hasFilters = !!(search || categoryId || subcategoryId || level);

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumb="Contenus"
        title="Quiz"
        description="Gérez votre catalogue, importez en masse, modifiez les statuts."
        actions={
          <>
            <Button
              variant="secondary"
              leftIcon={<Upload className="h-4 w-4" />}
              onClick={() => setOpenImport(true)}
            >
              Importer
            </Button>
            <Button variant="gradient" leftIcon={<Plus className="h-4 w-4" />} onClick={onCreate}>
              Nouveau quiz
            </Button>
          </>
        }
      />

      <div className="rounded-2xl border border-border bg-surface p-3 shadow-soft">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            leftIcon={<Search className="h-4 w-4" />}
            placeholder="Rechercher un quiz…"
          />
          <Select
            value={categoryId}
            onChange={(e) => {
              setCategoryId(e.target.value);
              setSubcategoryId('');
              setPage(1);
            }}
            options={[
              { value: '', label: 'Toutes les catégories' },
              ...(cats.data ?? []).map((c) => ({ value: c.id, label: c.name })),
            ]}
          />
          <Select
            value={subcategoryId}
            onChange={(e) => {
              setSubcategoryId(e.target.value);
              setPage(1);
            }}
            disabled={!categoryId}
            options={[
              { value: '', label: categoryId ? 'Toutes les sous-catégories' : 'Filtrer par catégorie d’abord' },
              ...(subs.data ?? []).map((s) => ({ value: s.id, label: s.name })),
            ]}
          />
          <Select
            value={level}
            onChange={(e) => {
              setLevel(e.target.value);
              setPage(1);
            }}
            options={[
              { value: '', label: 'Toutes difficultés' },
              ...(lvls.data ?? [])
                .slice()
                .sort((a, b) => a.sort_order - b.sort_order)
                .map((l) => ({ value: l.code, label: `${l.code} • ${l.label}` })),
            ]}
          />
        </div>
        {hasFilters && (
          <div className="mt-3 flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<X className="h-3.5 w-3.5" />}
              onClick={resetFilters}
            >
              Réinitialiser
            </Button>
          </div>
        )}
      </div>

      <DataTable<Quiz>
        columns={columns}
        data={list.data?.items}
        rowKey={(q) => q.id}
        loading={list.isLoading}
        error={list.error}
        onRetry={() => list.refetch()}
        emptyTitle={hasFilters ? 'Aucun résultat' : 'Aucun quiz'}
        emptyDescription={
          hasFilters
            ? 'Essayez d’ajuster vos filtres ou votre recherche.'
            : 'Créez votre premier quiz ou importez-en plusieurs depuis un fichier CSV/XLSX.'
        }
        emptyAction={
          hasFilters ? null : (
            <Button variant="primary" leftIcon={<Plus className="h-4 w-4" />} onClick={onCreate}>
              Créer un quiz
            </Button>
          )
        }
      />

      <Pagination
        page={list.data?.page ?? page}
        limit={list.data?.limit ?? 20}
        total={list.data?.total ?? 0}
        onPageChange={setPage}
      />

      <QuizFormModal
        open={openForm}
        initial={editing}
        categories={cats.data ?? []}
        subcategories={subs.data ?? []}
        levels={lvls.data ?? []}
        onClose={() => setOpenForm(false)}
        submitting={createM.isPending || updateM.isPending}
        onSubmit={async (values) => {
          try {
            if (editing) {
              await updateM.mutateAsync({ id: editing.id, input: values });
              toast.success('Quiz mis à jour');
            } else {
              await createM.mutateAsync(values);
              toast.success('Quiz créé');
            }
            setOpenForm(false);
          } catch (err) {
            toastApiError(err);
          }
        }}
      />

      <QuizImportModal
        open={openImport}
        onClose={() => setOpenImport(false)}
        categories={cats.data ?? []}
        subcategories={subs.data ?? []}
        levels={lvls.data ?? []}
      />

      <ConfirmDialog
        open={!!toDelete}
        title={`Supprimer "${toDelete?.title ?? ''}" ?`}
        description="Toutes les questions associées au quiz seront également supprimées."
        confirmLabel="Supprimer"
        destructive
        loading={deleteM.isPending}
        onCancel={() => setToDelete(null)}
        onConfirm={async () => {
          if (!toDelete) return;
          try {
            await deleteM.mutateAsync(toDelete.id);
            toast.success('Quiz supprimé');
            setToDelete(null);
          } catch (err) {
            toastApiError(err);
          }
        }}
      />
    </div>
  );
}

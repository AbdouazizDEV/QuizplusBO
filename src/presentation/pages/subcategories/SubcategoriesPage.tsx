import { useMemo, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  useCreateSubcategory,
  useDeleteSubcategory,
  useSubcategoriesQuery,
  useUpdateSubcategory,
} from '@application/subcategories/use-subcategories';
import { useCategoriesQuery } from '@application/categories/use-categories';
import type { Subcategory } from '@domain/entities/subcategory';
import { PageHeader } from '@presentation/components/data/PageHeader';
import { DataTable, type Column } from '@presentation/components/data/DataTable';
import { Button } from '@presentation/components/ui/Button';
import { Select } from '@presentation/components/ui/Select';
import { Badge } from '@presentation/components/ui/Badge';
import { ConfirmDialog } from '@presentation/components/feedback/ConfirmDialog';
import { SubcategoryFormModal } from './SubcategoryFormModal';
import { toastApiError } from '@shared/lib/api-error-toast';

export default function SubcategoriesPage() {
  const [filterCategory, setFilterCategory] = useState<string>('');
  const subList = useSubcategoriesQuery(filterCategory || undefined);
  const catList = useCategoriesQuery();
  const createM = useCreateSubcategory();
  const updateM = useUpdateSubcategory();
  const deleteM = useDeleteSubcategory();

  const [editing, setEditing] = useState<Subcategory | null>(null);
  const [openForm, setOpenForm] = useState(false);
  const [toDelete, setToDelete] = useState<Subcategory | null>(null);

  const categoryNameById = useMemo(() => {
    const map = new Map<string, string>();
    (catList.data ?? []).forEach((c) => map.set(c.id, c.name));
    return map;
  }, [catList.data]);

  const onCreate = () => {
    setEditing(null);
    setOpenForm(true);
  };
  const onEdit = (s: Subcategory) => {
    setEditing(s);
    setOpenForm(true);
  };

  const columns: Column<Subcategory>[] = [
    { key: 'name', header: 'Nom', cell: (s) => <span className="font-bold">{s.name}</span> },
    { key: 'slug', header: 'Slug', cell: (s) => <code className="text-xs text-muted">{s.slug}</code> },
    {
      key: 'cat',
      header: 'Catégorie',
      cell: (s) => <Badge tone="brand">{categoryNameById.get(s.category_id) ?? s.category_id}</Badge>,
    },
    {
      key: 'desc',
      header: 'Description',
      cell: (s) => <span className="text-muted">{s.description ?? '—'}</span>,
    },
    {
      key: 'actions',
      header: <span className="sr-only">Actions</span>,
      align: 'right',
      width: '140px',
      cell: (s) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button variant="ghost" size="icon" aria-label="Modifier" onClick={() => onEdit(s)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Supprimer"
            className="text-danger hover:bg-danger/10"
            onClick={() => setToDelete(s)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumb="Catalogue"
        title="Sous-catégories"
        description="Affinez votre catalogue avec des thèmes plus précis."
        actions={
          <Button
            variant="gradient"
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={onCreate}
            disabled={(catList.data?.length ?? 0) === 0}
          >
            Nouvelle sous-catégorie
          </Button>
        }
      />

      <div className="rounded-2xl border border-border bg-surface p-3 shadow-soft">
        <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
          <div className="flex-1">
            <Select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              placeholder="Toutes les catégories"
              options={[
                { value: '', label: 'Toutes les catégories' },
                ...(catList.data ?? []).map((c) => ({ value: c.id, label: c.name })),
              ]}
            />
          </div>
          <p className="text-2xs text-muted sm:px-1">
            {subList.data?.length ?? 0} sous-catégorie{(subList.data?.length ?? 0) > 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <DataTable<Subcategory>
        columns={columns}
        data={subList.data}
        rowKey={(r) => r.id}
        loading={subList.isLoading}
        error={subList.error}
        onRetry={() => subList.refetch()}
        emptyTitle="Aucune sous-catégorie"
        emptyDescription="Créez une sous-catégorie pour affiner le catalogue."
        emptyAction={
          (catList.data?.length ?? 0) > 0 ? (
            <Button variant="primary" leftIcon={<Plus className="h-4 w-4" />} onClick={onCreate}>
              Créer
            </Button>
          ) : null
        }
      />

      <SubcategoryFormModal
        open={openForm}
        initial={editing}
        categories={catList.data ?? []}
        onClose={() => setOpenForm(false)}
        submitting={createM.isPending || updateM.isPending}
        onSubmit={async (values) => {
          try {
            if (editing) {
              await updateM.mutateAsync({ id: editing.id, input: values });
              toast.success('Sous-catégorie mise à jour');
            } else {
              await createM.mutateAsync(values);
              toast.success('Sous-catégorie créée');
            }
            setOpenForm(false);
          } catch (err) {
            toastApiError(err);
          }
        }}
      />

      <ConfirmDialog
        open={!!toDelete}
        title={`Supprimer "${toDelete?.name ?? ''}" ?`}
        description="Les quiz qui pointent vers cette sous-catégorie pourraient être impactés."
        confirmLabel="Supprimer"
        destructive
        loading={deleteM.isPending}
        onCancel={() => setToDelete(null)}
        onConfirm={async () => {
          if (!toDelete) return;
          try {
            await deleteM.mutateAsync(toDelete.id);
            toast.success('Sous-catégorie supprimée');
            setToDelete(null);
          } catch (err) {
            toastApiError(err);
          }
        }}
      />
    </div>
  );
}

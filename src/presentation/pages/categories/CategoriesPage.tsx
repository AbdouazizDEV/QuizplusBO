import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  useCategoriesQuery,
  useCreateCategory,
  useDeleteCategory,
  useUpdateCategory,
} from '@application/categories/use-categories';
import type { Category } from '@domain/entities/category';
import { PageHeader } from '@presentation/components/data/PageHeader';
import { DataTable, type Column } from '@presentation/components/data/DataTable';
import { Button } from '@presentation/components/ui/Button';
import { Badge } from '@presentation/components/ui/Badge';
import { ConfirmDialog } from '@presentation/components/feedback/ConfirmDialog';
import { CategoryFormModal } from './CategoryFormModal';
import { toastApiError } from '@shared/lib/api-error-toast';

export default function CategoriesPage() {
  const list = useCategoriesQuery();
  const createM = useCreateCategory();
  const updateM = useUpdateCategory();
  const deleteM = useDeleteCategory();

  const [editing, setEditing] = useState<Category | null>(null);
  const [openForm, setOpenForm] = useState(false);
  const [toDelete, setToDelete] = useState<Category | null>(null);

  const onCreate = () => {
    setEditing(null);
    setOpenForm(true);
  };
  const onEdit = (c: Category) => {
    setEditing(c);
    setOpenForm(true);
  };

  const columns: Column<Category>[] = [
    {
      key: 'name',
      header: 'Catégorie',
      cell: (c) => (
        <div className="flex items-center gap-2.5">
          <span
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-2xs font-black text-white shadow-soft"
            style={{ background: c.color || '#E8431A' }}
            aria-hidden
          >
            {c.name.slice(0, 2).toUpperCase()}
          </span>
          <span className="font-bold">{c.name}</span>
        </div>
      ),
    },
    {
      key: 'slug',
      header: 'Slug',
      cell: (c) => <code className="text-xs text-muted">{c.slug}</code>,
    },
    {
      key: 'icon',
      header: 'Icône',
      cell: (c) => (c.icon ? <Badge>{c.icon}</Badge> : <span className="text-muted">—</span>),
      width: '140px',
    },
    {
      key: 'color',
      header: 'Couleur',
      width: '140px',
      cell: (c) =>
        c.color ? (
          <div className="inline-flex items-center gap-2">
            <span
              className="h-4 w-4 rounded ring-1 ring-inset ring-border"
              style={{ background: c.color }}
              aria-hidden
            />
            <code className="text-2xs text-muted">{c.color}</code>
          </div>
        ) : (
          <span className="text-muted">—</span>
        ),
    },
    {
      key: 'actions',
      header: <span className="sr-only">Actions</span>,
      align: 'right',
      width: '140px',
      cell: (c) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button variant="ghost" size="icon" aria-label="Modifier" onClick={() => onEdit(c)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Supprimer"
            className="text-danger hover:bg-danger/10"
            onClick={() => setToDelete(c)}
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
        title="Catégories"
        description="Organisez votre catalogue de quiz par grands domaines."
        actions={
          <Button variant="gradient" leftIcon={<Plus className="h-4 w-4" />} onClick={onCreate}>
            Nouvelle catégorie
          </Button>
        }
      />

      <DataTable<Category>
        columns={columns}
        data={list.data}
        rowKey={(r) => r.id}
        loading={list.isLoading}
        error={list.error}
        onRetry={() => list.refetch()}
        emptyTitle="Aucune catégorie"
        emptyDescription="Créez une première catégorie pour structurer vos quiz."
        emptyAction={
          <Button variant="primary" leftIcon={<Plus className="h-4 w-4" />} onClick={onCreate}>
            Créer une catégorie
          </Button>
        }
      />

      <CategoryFormModal
        open={openForm}
        initial={editing}
        onClose={() => setOpenForm(false)}
        submitting={createM.isPending || updateM.isPending}
        onSubmit={async (values) => {
          try {
            if (editing) {
              await updateM.mutateAsync({ id: editing.id, input: values });
              toast.success('Catégorie mise à jour');
            } else {
              await createM.mutateAsync(values);
              toast.success('Catégorie créée');
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
        description="Les sous-catégories et quiz liés peuvent être impactés. Cette action est irréversible."
        confirmLabel="Supprimer"
        destructive
        loading={deleteM.isPending}
        onCancel={() => setToDelete(null)}
        onConfirm={async () => {
          if (!toDelete) return;
          try {
            await deleteM.mutateAsync(toDelete.id);
            toast.success('Catégorie supprimée');
            setToDelete(null);
          } catch (err) {
            toastApiError(err);
          }
        }}
      />
    </div>
  );
}

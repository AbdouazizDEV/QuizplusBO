import { useState } from 'react';
import { Plus, Pencil, Trash2, Layers } from 'lucide-react';
import { toast } from 'sonner';
import {
  useCreateLevel,
  useDeleteLevel,
  useLevelsQuery,
  useUpdateLevel,
} from '@application/levels/use-levels';
import type { DifficultyLevel } from '@domain/entities/level';
import { PageHeader } from '@presentation/components/data/PageHeader';
import { DataTable, type Column } from '@presentation/components/data/DataTable';
import { Button } from '@presentation/components/ui/Button';
import { Badge } from '@presentation/components/ui/Badge';
import { ConfirmDialog } from '@presentation/components/feedback/ConfirmDialog';
import { LevelFormModal } from './LevelFormModal';
import { toastApiError } from '@shared/lib/api-error-toast';
import { formatNumber } from '@shared/lib/format';

export default function LevelsPage() {
  const list = useLevelsQuery();
  const createM = useCreateLevel();
  const updateM = useUpdateLevel();
  const deleteM = useDeleteLevel();

  const [editing, setEditing] = useState<DifficultyLevel | null>(null);
  const [openForm, setOpenForm] = useState(false);
  const [toDelete, setToDelete] = useState<DifficultyLevel | null>(null);

  const onCreate = () => {
    setEditing(null);
    setOpenForm(true);
  };
  const onEdit = (lvl: DifficultyLevel) => {
    setEditing(lvl);
    setOpenForm(true);
  };

  const columns: Column<DifficultyLevel>[] = [
    {
      key: 'code',
      header: 'Code',
      cell: (l) => <Badge tone="brand">{l.code}</Badge>,
      width: '110px',
    },
    {
      key: 'label',
      header: 'Libellé',
      cell: (l) => <span className="font-bold">{l.label}</span>,
    },
    {
      key: 'max',
      header: 'Q. max / quiz',
      align: 'right',
      cell: (l) => <span className="tabular-nums">{formatNumber(l.max_questions_per_quiz)}</span>,
      width: '160px',
    },
    {
      key: 'order',
      header: 'Ordre',
      align: 'right',
      cell: (l) => <span className="tabular-nums text-muted">{l.sort_order}</span>,
      width: '100px',
    },
    {
      key: 'active',
      header: 'Statut',
      cell: (l) => (l.is_active ? <Badge tone="success">Actif</Badge> : <Badge>Inactif</Badge>),
      width: '120px',
    },
    {
      key: 'actions',
      header: <span className="sr-only">Actions</span>,
      align: 'right',
      width: '140px',
      cell: (l) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button variant="ghost" size="icon" aria-label="Modifier" onClick={() => onEdit(l)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Supprimer"
            className="text-danger hover:bg-danger/10"
            onClick={() => setToDelete(l)}
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
        title="Niveaux de difficulté"
        description="Définit le nombre maximum de questions par quiz selon la difficulté."
        actions={
          <Button variant="gradient" leftIcon={<Plus className="h-4 w-4" />} onClick={onCreate}>
            Nouveau niveau
          </Button>
        }
      />

      <DataTable<DifficultyLevel>
        columns={columns}
        data={list.data}
        rowKey={(r) => r.id}
        loading={list.isLoading}
        error={list.error}
        onRetry={() => list.refetch()}
        emptyTitle="Aucun niveau"
        emptyDescription="Créez votre premier niveau pour structurer la difficulté des quiz."
        emptyAction={
          <Button variant="primary" leftIcon={<Plus className="h-4 w-4" />} onClick={onCreate}>
            Créer un niveau
          </Button>
        }
      />

      <LevelFormModal
        open={openForm}
        initial={editing}
        onClose={() => setOpenForm(false)}
        onSubmit={async (values) => {
          try {
            if (editing) {
              await updateM.mutateAsync({ id: editing.id, input: values });
              toast.success('Niveau mis à jour');
            } else {
              await createM.mutateAsync(values);
              toast.success('Niveau créé');
            }
            setOpenForm(false);
          } catch (err) {
            toastApiError(err);
          }
        }}
        submitting={createM.isPending || updateM.isPending}
      />

      <ConfirmDialog
        open={!!toDelete}
        title={`Supprimer "${toDelete?.label ?? ''}" ?`}
        description="Cette action est irréversible. Les quiz qui dépendent de ce niveau pourraient être impactés."
        confirmLabel="Supprimer"
        destructive
        loading={deleteM.isPending}
        onCancel={() => setToDelete(null)}
        onConfirm={async () => {
          if (!toDelete) return;
          try {
            await deleteM.mutateAsync(toDelete.id);
            toast.success('Niveau supprimé');
            setToDelete(null);
          } catch (err) {
            toastApiError(err);
          }
        }}
      />

      {!list.isLoading && (list.data?.length ?? 0) === 0 && null}
      {!list.isLoading && (list.data?.length ?? 0) > 0 && (
        <p className="px-1 text-2xs text-muted flex items-center gap-1.5">
          <Layers className="h-3 w-3" />
          {list.data!.length} niveau{list.data!.length > 1 ? 'x' : ''} configuré{list.data!.length > 1 ? 's' : ''}
        </p>
      )}
    </div>
  );
}

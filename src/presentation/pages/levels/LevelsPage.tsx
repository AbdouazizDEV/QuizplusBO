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

function LevelMark({ code }: { code: string }) {
  const badge = LEVEL_MARKS.find((item) => item.code === code) ?? {
    mark: '•',
    tint: '#E5E7EB',
  };
  return (
    <span
      className="inline-flex h-8 min-w-10 items-center justify-center rounded-full px-2 text-sm font-black tracking-wide text-[#1A1A2E] ring-1 ring-[#1A1A2E]/35"
      style={{ background: badge.tint }}
      title={`Badge ${code}`}
    >
      {badge.mark}
    </span>
  );
}

const LEVEL_MARKS = [
  { code: 'Z0', mark: 'I', tint: '#7DCEA0' },
  { code: 'Z1', mark: 'II', tint: '#5DADE2' },
  { code: 'Z2', mark: 'III', tint: '#F5B041' },
  { code: 'Z3', mark: 'IV', tint: '#BB8FCE' },
  { code: 'A1', mark: 'V', tint: '#E59866' },
  { code: 'A2', mark: 'VI', tint: '#EC7063' },
  { code: 'A3', mark: 'VII', tint: '#F4D03F' },
  { code: 'B1', mark: 'VIII', tint: '#F5CBA7' },
  { code: 'B2', mark: 'IX', tint: '#76D7C4' },
  { code: 'B3', mark: 'X', tint: '#85C1E9' },
  { code: 'B4', mark: 'XI', tint: '#F1948A' },
  { code: 'B5', mark: 'XII', tint: '#D7BDE2' },
];

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
      cell: (l) => (
        <span className="inline-flex items-center gap-2">
          <LevelMark code={l.code} />
          <Badge tone="brand">{l.code}</Badge>
        </span>
      ),
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

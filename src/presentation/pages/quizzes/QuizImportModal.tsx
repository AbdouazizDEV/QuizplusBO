import { useEffect, useMemo, useRef, useState } from 'react';
import { FileSpreadsheet, Upload } from 'lucide-react';
import { toast } from 'sonner';
import type { Category } from '@domain/entities/category';
import type { Subcategory } from '@domain/entities/subcategory';
import type { DifficultyLevel } from '@domain/entities/level';
import { Modal } from '@presentation/components/ui/Modal';
import { Input } from '@presentation/components/ui/Input';
import { Select } from '@presentation/components/ui/Select';
import { Button } from '@presentation/components/ui/Button';
import { useImportQuizzes } from '@application/quizzes/use-quizzes';
import { toastApiError } from '@shared/lib/api-error-toast';
import { cn } from '@shared/lib/cn';

interface Props {
  open: boolean;
  onClose: () => void;
  categories: Category[];
  subcategories: Subcategory[];
  levels: DifficultyLevel[];
}

const ACCEPT = '.xlsx,.xls,.csv';

export function QuizImportModal({ open, onClose, categories, subcategories, levels }: Props) {
  const importM = useImportQuizzes();
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [subcategoryId, setSubcategoryId] = useState('');
  const [level, setLevel] = useState('');
  const [theme, setTheme] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) {
      setFile(null);
      setTitle('');
      setCategoryId('');
      setSubcategoryId('');
      setLevel('');
      setTheme('');
    }
  }, [open]);

  const subOptions = useMemo(
    () => subcategories.filter((s) => !categoryId || s.category_id === categoryId),
    [subcategories, categoryId],
  );

  const onSubmit = async () => {
    if (!file || !title || !categoryId || !subcategoryId) {
      toast.error('Veuillez compléter le titre, le fichier et la catégorisation.');
      return;
    }
    try {
      const res = await importM.mutateAsync({
        file,
        title,
        category_id: categoryId,
        subcategory_id: subcategoryId,
        difficulty_level: level || null,
        theme: theme || null,
      });
      toast.success('Import réussi', {
        description: `${res.imported_questions} question(s) importée(s) sur ${res.quiz_ids.length} quiz.`,
      });
      onClose();
    } catch (err) {
      toastApiError(err);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title="Importer des quiz (CSV / XLSX)"
      description="Le backend distribuera automatiquement les questions sur un ou plusieurs quiz selon le niveau."
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={importM.isPending}>
            Annuler
          </Button>
          <Button variant="gradient" onClick={onSubmit} loading={importM.isPending}>
            Lancer l'import
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const f = e.dataTransfer.files?.[0];
            if (f) setFile(f);
          }}
          className={cn(
            'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border p-8 text-center transition-colors',
            'hover:border-brand-500/60 hover:bg-brand-50/40 dark:hover:bg-brand-500/5',
          )}
        >
          <span className="quizz-gradient inline-flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-glow">
            {file ? <FileSpreadsheet className="h-5 w-5" /> : <Upload className="h-5 w-5" />}
          </span>
          {file ? (
            <>
              <p className="text-sm font-bold text-foreground">{file.name}</p>
              <p className="text-xs text-muted">{(file.size / 1024).toFixed(1)} Ko</p>
            </>
          ) : (
            <>
              <p className="text-sm font-bold text-foreground">Glissez-déposez votre fichier</p>
              <p className="text-xs text-muted">XLSX ou CSV</p>
            </>
          )}
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPT}
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Input
            label="Titre du quiz"
            placeholder="Ex. Quiz Histoire"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Select
            label="Difficulté (optionnel)"
            placeholder="Auto par fichier"
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            options={[
              { value: '', label: 'Auto par fichier' },
              ...levels
                .slice()
                .sort((a, b) => a.sort_order - b.sort_order)
                .map((l) => ({ value: l.code, label: `${l.code} • ${l.label}` })),
            ]}
          />
          <Select
            label="Catégorie"
            placeholder="Sélectionner…"
            value={categoryId}
            onChange={(e) => {
              setCategoryId(e.target.value);
              setSubcategoryId('');
            }}
            options={[{ value: '', label: 'Sélectionner…' }, ...categories.map((c) => ({ value: c.id, label: c.name }))]}
          />
          <Select
            label="Sous-catégorie"
            placeholder="Sélectionner…"
            value={subcategoryId}
            onChange={(e) => setSubcategoryId(e.target.value)}
            disabled={!categoryId}
            options={[{ value: '', label: categoryId ? 'Sélectionner…' : 'Choisissez d’abord une catégorie' }, ...subOptions.map((s) => ({ value: s.id, label: s.name }))]}
          />
          <div className="sm:col-span-2">
            <Input
              label="Thème (optionnel)"
              placeholder="geographie, histoire…"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
            />
          </div>
        </div>
      </div>
    </Modal>
  );
}

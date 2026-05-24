import { useMemo, useState } from 'react';
import { Search, Check, ListTodo } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import type { Quiz } from '@domain/entities/quiz';
import { Modal } from '@presentation/components/ui/Modal';
import { Input } from '@presentation/components/ui/Input';
import { Button } from '@presentation/components/ui/Button';
import { useDebouncedValue } from '@shared/lib/use-debounced-value';
import { formatQuizLabel } from '@shared/lib/quiz-label';
import { cn } from '@shared/lib/cn';
import { quizzesRepository } from '@infrastructure/repositories/quizzes.repository';
import { queryKeys } from '@application/query-keys';

interface QuizPickerModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (quiz: Quiz) => void;
  selectedId?: string | null;
  publishedOnly?: boolean;
}

export function QuizPickerModal({
  open,
  onClose,
  onSelect,
  selectedId,
  publishedOnly = true,
}: QuizPickerModalProps) {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 300);

  const list = useQuery({
    queryKey: queryKeys.quizzes({ page: 1, limit: 50, search: debouncedSearch || undefined }),
    queryFn: () =>
      quizzesRepository.list({ page: 1, limit: 50, search: debouncedSearch || undefined }),
    enabled: open,
  });

  const items = useMemo(() => {
    const raw = list.data?.items ?? [];
    if (!publishedOnly) return raw;
    return raw.filter((q) => q.is_published !== false);
  }, [list.data?.items, publishedOnly]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title="Choisir un quiz"
      description="Recherchez par titre. Seuls les quiz publiés sont affichés."
      footer={
        <Button variant="secondary" onClick={onClose}>
          Fermer
        </Button>
      }
    >
      <div className="space-y-4">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher un quiz…"
          leftIcon={<Search className="h-4 w-4" />}
        />

        {list.isLoading ? (
          <p className="py-8 text-center text-sm text-muted">Chargement des quiz…</p>
        ) : items.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted">Aucun quiz publié trouvé.</p>
        ) : (
          <ul className="max-h-72 space-y-1 overflow-y-auto scrollbar-thin">
            {items.map((quiz) => {
              const selected = quiz.id === selectedId;
              return (
                <li key={quiz.id}>
                  <button
                    type="button"
                    onClick={() => {
                      onSelect(quiz);
                      onClose();
                    }}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors',
                      selected
                        ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/10'
                        : 'border-border hover:bg-surfaceMuted',
                    )}
                  >
                    <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-100 text-brand-600 dark:bg-brand-500/20">
                      <ListTodo className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold">{quiz.title}</span>
                      <span className="block truncate text-2xs text-muted">{formatQuizLabel(quiz)}</span>
                    </span>
                    {selected ? <Check className="h-4 w-4 shrink-0 text-brand-600" /> : null}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Modal>
  );
}

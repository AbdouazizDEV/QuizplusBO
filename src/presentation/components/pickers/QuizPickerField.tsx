import { useState } from 'react';
import { ListTodo, X } from 'lucide-react';
import type { Quiz } from '@domain/entities/quiz';
import { Button } from '@presentation/components/ui/Button';
import { QuizPickerModal } from './QuizPickerModal';
import { cn } from '@shared/lib/cn';

interface QuizPickerFieldProps {
  label?: string;
  hint?: string;
  error?: string;
  value: string | null | undefined;
  displayLabel?: string | null;
  onChange: (quizId: string | null, quiz?: Quiz | null) => void;
  allowClear?: boolean;
}

export function QuizPickerField({
  label = 'Quiz associé',
  hint,
  error,
  value,
  displayLabel,
  onChange,
  allowClear = true,
}: QuizPickerFieldProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="w-full">
      {label ? <p className="mb-1.5 text-sm font-semibold text-foreground">{label}</p> : null}
      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" variant="secondary" size="sm" onClick={() => setOpen(true)}>
          {value ? 'Changer de quiz' : 'Choisir un quiz'}
        </Button>
        {value && allowClear ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            leftIcon={<X className="h-3.5 w-3.5" />}
            onClick={() => onChange(null, null)}
          >
            Retirer le quiz
          </Button>
        ) : null}
      </div>

      {value ? (
        <div
          className={cn(
            'mt-2 flex items-center gap-2 rounded-lg border border-border bg-surfaceMuted/50 px-3 py-2',
            error && 'border-danger',
          )}
        >
          <ListTodo className="h-4 w-4 shrink-0 text-brand-600" />
          <span className="min-w-0 truncate text-sm font-medium">
            {displayLabel ?? 'Quiz sélectionné'}
          </span>
        </div>
      ) : (
        <p className="mt-1.5 text-xs text-muted">Aucun quiz sélectionné (optionnel)</p>
      )}

      {error ? (
        <p className="mt-1.5 text-xs font-medium text-danger">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-muted">{hint}</p>
      ) : null}

      <QuizPickerModal
        open={open}
        onClose={() => setOpen(false)}
        selectedId={value}
        onSelect={(quiz) => onChange(quiz.id, quiz)}
      />
    </div>
  );
}

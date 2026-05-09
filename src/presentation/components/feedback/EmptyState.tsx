import type { ReactNode } from 'react';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export function EmptyState({
  title = 'Aucun élément',
  description = 'Il n’y a rien à afficher pour le moment.',
  icon,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
      <span className="quizz-gradient inline-flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-glow">
        {icon ?? <Inbox className="h-6 w-6" />}
      </span>
      <h4 className="text-base font-bold text-foreground">{title}</h4>
      <p className="max-w-md text-sm text-muted">{description}</p>
      {action ? <div className="mt-1">{action}</div> : null}
    </div>
  );
}

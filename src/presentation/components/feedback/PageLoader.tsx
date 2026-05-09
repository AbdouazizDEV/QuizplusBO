import { Loader2 } from 'lucide-react';

export function PageLoader() {
  return (
    <div className="flex h-full min-h-[60vh] w-full items-center justify-center">
      <span className="inline-flex items-center gap-2 rounded-full bg-surface px-4 py-2 text-sm font-semibold text-muted shadow-soft">
        <Loader2 className="h-4 w-4 animate-spin text-brand-500" />
        Chargement…
      </span>
    </div>
  );
}

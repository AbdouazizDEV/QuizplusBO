import { useState } from 'react';
import { User, X } from 'lucide-react';
import type { Profile } from '@domain/entities/profile';
import { Button } from '@presentation/components/ui/Button';
import { ProfilePickerModal } from './ProfilePickerModal';
import { cn } from '@shared/lib/cn';

interface ProfilePickerFieldProps {
  label?: string;
  hint?: string;
  error?: string;
  value: string | null | undefined;
  displayLabel?: string | null;
  onChange: (profileId: string | null, profile?: Profile | null) => void;
  allowClear?: boolean;
  excludeIds?: string[];
}

export function ProfilePickerField({
  label = 'Joueur',
  hint,
  error,
  value,
  displayLabel,
  onChange,
  allowClear = false,
  excludeIds,
}: ProfilePickerFieldProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="w-full">
      {label ? <p className="mb-1.5 text-sm font-semibold text-foreground">{label}</p> : null}
      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" variant="secondary" size="sm" onClick={() => setOpen(true)}>
          {value ? 'Changer de joueur' : 'Choisir un joueur'}
        </Button>
        {value && allowClear ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            leftIcon={<X className="h-3.5 w-3.5" />}
            onClick={() => onChange(null, null)}
          >
            Retirer
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
          <User className="h-4 w-4 shrink-0 text-brand-600" />
          <span className="min-w-0 truncate text-sm font-medium">
            {displayLabel ?? 'Joueur sélectionné'}
          </span>
        </div>
      ) : (
        <p className="mt-1.5 text-xs text-muted">Aucun joueur sélectionné</p>
      )}

      {error ? (
        <p className="mt-1.5 text-xs font-medium text-danger">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-muted">{hint}</p>
      ) : null}

      <ProfilePickerModal
        open={open}
        onClose={() => setOpen(false)}
        selectedId={value}
        excludeIds={excludeIds}
        onSelect={(profile) => onChange(profile.id, profile)}
      />
    </div>
  );
}

import { useMemo } from 'react';
import { useCategoriesQuery } from '@application/categories/use-categories';
import { Select } from '@presentation/components/ui/Select';

interface CategoryPickerFieldProps {
  label?: string;
  hint?: string;
  error?: string;
  value: string | null | undefined;
  onChange: (categoryId: string | null) => void;
  allowEmpty?: boolean;
}

export function CategoryPickerField({
  label = 'Catégorie',
  hint,
  error,
  value,
  onChange,
  allowEmpty = true,
}: CategoryPickerFieldProps) {
  const cats = useCategoriesQuery();

  const options = useMemo(() => {
    const items = (cats.data ?? []).map((c) => ({ value: c.id, label: c.name }));
    if (allowEmpty) {
      return [{ value: '', label: 'Aucune catégorie' }, ...items];
    }
    return items;
  }, [cats.data, allowEmpty]);

  return (
    <Select
      label={label}
      hint={hint}
      error={error}
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value || null)}
      options={options}
      disabled={cats.isLoading}
    />
  );
}

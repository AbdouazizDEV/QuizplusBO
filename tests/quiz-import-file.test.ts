import { describe, expect, it } from 'vitest';
import { validateQuizImportRows } from '@shared/lib/quiz-import-file';

describe('validateQuizImportRows', () => {
  it('accepte un fichier avec des difficultés mixtes', () => {
    const res = validateQuizImportRows(
      [
        { difficulty: 'Z0', category: 'Vie quotidienne', subcategory: 'Cuisine & Santé' },
        { difficulty: 'Z1', category: 'Vie quotidienne', subcategory: 'Cuisine & Santé' },
        { difficulty: 'Z2', category: 'Autre', subcategory: 'Autre' },
      ],
      {
        difficultyLevel: 'Z0',
        categoryName: 'Vie quotidienne',
        subcategoryName: 'Cuisine & Santé',
      },
    );
    expect(res.ok).toBe(true);
  });

  it('refuse un fichier sans questions', () => {
    const res = validateQuizImportRows([]);
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.message).toMatch(/aucune question/i);
  });
});

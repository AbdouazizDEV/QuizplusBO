import { describe, expect, it } from 'vitest';
import { validateQuizImportRows } from '@shared/lib/quiz-import-file';

describe('validateQuizImportRows', () => {
  const baseRows = [
    { difficulty: 'Z1', category: 'Culture générale', subcategory: 'Histoire' },
    { difficulty: 'Z1', category: 'Culture générale', subcategory: 'Histoire' },
  ];

  it('accepte un fichier homogène conforme au quiz', () => {
    const res = validateQuizImportRows(baseRows, {
      difficultyLevel: 'Z1',
      categoryName: 'Culture générale',
      subcategoryName: 'Histoire',
    });
    expect(res.ok).toBe(true);
  });

  it('refuse plusieurs difficultés', () => {
    const res = validateQuizImportRows(
      [
        { difficulty: 'Z1', category: 'Culture générale', subcategory: 'Histoire' },
        { difficulty: 'Z2', category: 'Culture générale', subcategory: 'Histoire' },
      ],
      undefined,
    );
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.message).toMatch(/plusieurs niveaux de difficulté/i);
  });

  it('refuse une catégorie différente du quiz', () => {
    const res = validateQuizImportRows(baseRows, {
      difficultyLevel: 'Z1',
      categoryName: 'Sport',
      subcategoryName: 'Histoire',
    });
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.message).toMatch(/catégorie/i);
  });
});

import * as XLSX from 'xlsx';

export interface QuizImportRowMeta {
  difficulty: string;
  category: string;
  subcategory: string;
}

function cell(row: Record<string, unknown>, ...keys: string[]): string {
  for (const key of keys) {
    const v = row[key];
    if (v !== undefined && v !== null && String(v).trim()) return String(v).trim();
  }
  return '';
}

function normText(value: string): string {
  return value.trim().toLowerCase();
}

function normDifficulty(value: string): string {
  return value.trim().toUpperCase();
}

export function extractImportRows(buffer: ArrayBuffer): QuizImportRowMeta[] {
  const wb = XLSX.read(buffer, { type: 'array' });
  const sheet = wb.Sheets[wb.SheetNames[0] ?? ''];
  if (!sheet) return [];

  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' });
  const out: QuizImportRowMeta[] = [];

  for (const row of rows) {
    const question = cell(row, 'question', 'Question');
    if (!question) continue;

    out.push({
      difficulty: cell(row, 'difficulty', 'Difficulty'),
      category: cell(row, 'category', 'Category', 'categorie', 'catégorie'),
      subcategory: cell(row, 'subcategory', 'Subcategory', 'sous_categorie', 'sous-catégorie'),
    });
  }

  return out;
}

export async function readQuizImportRows(file: File): Promise<QuizImportRowMeta[]> {
  const buffer = await file.arrayBuffer();
  return extractImportRows(buffer);
}

export interface QuizImportExpectation {
  difficultyLevel: string | null;
  categoryName: string;
  subcategoryName: string;
}

export type QuizImportValidationResult =
  | { ok: true; rows: QuizImportRowMeta[] }
  | { ok: false; message: string };

function uniqueNonEmpty(values: string[], normalize: (v: string) => string): string[] {
  const set = new Set<string>();
  for (const value of values) {
    const n = normalize(value);
    if (n) set.add(n);
  }
  return [...set];
}

export function validateQuizImportRows(
  rows: QuizImportRowMeta[],
  expectation?: QuizImportExpectation,
): QuizImportValidationResult {
  if (!rows.length) {
    return {
      ok: false,
      message:
        'Aucune question valide trouvée dans le fichier. Vérifiez les colonnes (question, answer_1…4, correct_answer, difficulty, category, subcategory).',
    };
  }

  const difficulties = uniqueNonEmpty(
    rows.map((r) => r.difficulty),
    normDifficulty,
  );
  const categories = uniqueNonEmpty(
    rows.map((r) => r.category),
    normText,
  );
  const subcategories = uniqueNonEmpty(
    rows.map((r) => r.subcategory),
    normText,
  );

  if (difficulties.length === 0) {
    return { ok: false, message: 'La colonne « difficulty » est vide ou manquante sur toutes les lignes.' };
  }
  if (difficulties.length > 1) {
    return {
      ok: false,
      message: `Le fichier contient plusieurs niveaux de difficulté (${difficulties.join(', ')}). Toutes les questions doivent avoir la même difficulté.`,
    };
  }

  if (categories.length === 0) {
    return { ok: false, message: 'La colonne « category » est vide ou manquante sur toutes les lignes.' };
  }
  if (categories.length > 1) {
    return {
      ok: false,
      message: `Le fichier contient plusieurs catégories (${categories.join(', ')}). Toutes les questions doivent avoir la même catégorie.`,
    };
  }

  if (subcategories.length === 0) {
    return {
      ok: false,
      message: 'La colonne « subcategory » est vide ou manquante sur toutes les lignes.',
    };
  }
  if (subcategories.length > 1) {
    return {
      ok: false,
      message: `Le fichier contient plusieurs sous-catégories (${subcategories.join(', ')}). Toutes les questions doivent avoir la même sous-catégorie.`,
    };
  }

  if (expectation) {
    const fileDifficulty = difficulties[0]!;
    const fileCategory = categories[0]!;
    const fileSubcategory = subcategories[0]!;

    if (expectation.difficultyLevel) {
      const expected = normDifficulty(expectation.difficultyLevel);
      if (fileDifficulty !== expected) {
        return {
          ok: false,
          message: `La difficulté du fichier (${fileDifficulty}) ne correspond pas à celle du quiz (${expected}).`,
        };
      }
    }

    const expectedCategory = normText(expectation.categoryName);
    if (fileCategory !== expectedCategory) {
      return {
        ok: false,
        message: `La catégorie du fichier (« ${rows.find((r) => r.category)?.category} ») ne correspond pas à celle du quiz (« ${expectation.categoryName} »).`,
      };
    }

    const expectedSubcategory = normText(expectation.subcategoryName);
    if (fileSubcategory !== expectedSubcategory) {
      return {
        ok: false,
        message: `La sous-catégorie du fichier (« ${rows.find((r) => r.subcategory)?.subcategory} ») ne correspond pas à celle du quiz (« ${expectation.subcategoryName} »).`,
      };
    }
  }

  return { ok: true, rows };
}

export async function validateQuizImportFile(
  file: File,
  expectation?: QuizImportExpectation,
): Promise<QuizImportValidationResult> {
  try {
    const rows = await readQuizImportRows(file);
    return validateQuizImportRows(rows, expectation);
  } catch {
    return {
      ok: false,
      message: 'Impossible de lire le fichier. Utilisez un modèle XLSX ou CSV valide.',
    };
  }
}

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

/** Conservé pour compat : plus de contrôle difficulté/catégorie/sous-catégorie. */
export interface QuizImportExpectation {
  difficultyLevel: string | null;
  categoryName: string;
  subcategoryName: string;
}

export type QuizImportValidationResult =
  | { ok: true; rows: QuizImportRowMeta[] }
  | { ok: false; message: string };

/**
 * Vérifie seulement qu’il y a des lignes questions.
 * difficulty / category / subcategory sont libres (mix autorisé, y compris plus dures en fin de quiz).
 */
export function validateQuizImportRows(
  rows: QuizImportRowMeta[],
  _expectation?: QuizImportExpectation,
): QuizImportValidationResult {
  if (!rows.length) {
    return {
      ok: false,
      message:
        'Aucune question valide trouvée dans le fichier. Vérifiez les colonnes (question, answer_1…4, correct_answer).',
    };
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

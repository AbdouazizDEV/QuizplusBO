export type DifficultyCode = 'Z0' | 'Z1' | 'Z2' | 'Z3';

export interface DifficultyLevel {
  id: string;
  code: DifficultyCode | string;
  label: string;
  description?: string | null;
  max_questions_per_quiz: number;
  sort_order: number;
  is_active: boolean;
}

export interface CreateLevelInput {
  code: string;
  label: string;
  description?: string | null;
  max_questions_per_quiz: number;
  sort_order: number;
  is_active?: boolean;
}

export type UpdateLevelInput = Partial<CreateLevelInput>;

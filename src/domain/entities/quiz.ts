import type { DifficultyCode } from './level';

export interface Quiz {
  id: string;
  title: string;
  description?: string | null;
  difficulty_level: DifficultyCode | string | null;
  category_id: string | null;
  subcategory_id: string | null;
  theme?: string | null;
  thumbnail_url?: string | null;
  points_per_question?: number | null;
  completion_bonus?: number | null;
  is_published?: boolean;
  total_questions?: number;
}

export interface CreateQuizInput {
  title: string;
  description?: string | null;
  category_id: string;
  subcategory_id: string;
  difficulty_level: DifficultyCode | string;
  theme?: string | null;
  thumbnail_url?: string | null;
  points_per_question?: number | null;
  completion_bonus?: number | null;
  is_published?: boolean;
}

export type UpdateQuizInput = Partial<CreateQuizInput>;

export interface QuizListQuery {
  page?: number;
  limit?: number;
  search?: string;
  category_id?: string;
  subcategory_id?: string;
  difficulty_level?: DifficultyCode | string;
}

export interface QuizListResponse {
  items: Quiz[];
  page: number;
  limit: number;
  total: number;
  has_more: boolean;
}

export interface ImportQuizInput {
  file: File;
  title: string;
  category_id: string;
  subcategory_id: string;
  difficulty_level?: DifficultyCode | string | null;
  theme?: string | null;
}

export interface ImportQuizResult {
  quiz_ids: string[];
  imported_questions: number;
}

export interface ImportIntoQuizResult {
  quiz_id: string;
  imported_questions: number;
}

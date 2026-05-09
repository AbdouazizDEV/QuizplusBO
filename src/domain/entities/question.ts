export interface QuestionOption {
  id: string;
  label: string;
}

export interface Question {
  id: string;
  quiz_id: string;
  question_text: string;
  options: QuestionOption[];
  correct_option_id: string;
  explanation?: string | null;
  order_index?: number | null;
  subcategory?: string | null;
  tags?: string[] | null;
  difficulty_label?: string | null;
}

export interface CreateQuestionInput {
  quiz_id: string;
  question_text: string;
  options: QuestionOption[];
  correct_option_id: string;
  explanation?: string | null;
  order_index?: number | null;
  subcategory?: string | null;
  tags?: string[] | null;
  difficulty_label?: string | null;
}

export type UpdateQuestionInput = Partial<Omit<CreateQuestionInput, 'quiz_id'>>;

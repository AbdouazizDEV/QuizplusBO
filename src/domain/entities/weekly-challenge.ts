export type WeeklyChallengeStatus = 'draft' | 'actif' | 'termine';

export interface WeeklyChallenge {
  id: string;
  title: string;
  description?: string | null;
  type: 'hebdomadaire' | string;
  status: WeeklyChallengeStatus | string;
  starts_at: string;
  ends_at: string;
  reward_text?: string | null;
}

export interface WeeklyChallengeQuizLink {
  id: string;
  challenge_id: string;
  quiz_id: string;
  scheduled_day: string;
  day_order: number;
  quizzes?: {
    id: string;
    title: string;
    difficulty_level?: string | null;
    is_published?: boolean;
    total_questions?: number;
  } | null;
}

export interface CreateWeeklyChallengeInput {
  title: string;
  description?: string | null;
  type: 'hebdomadaire';
  status: WeeklyChallengeStatus;
  starts_at: string;
  ends_at: string;
  reward_text?: string | null;
}

export type UpdateWeeklyChallengeInput = Partial<CreateWeeklyChallengeInput>;

export interface WeeklyChallengeListQuery {
  page?: number;
  limit?: number;
  status?: WeeklyChallengeStatus;
}

export interface CreateWeeklyChallengeQuizLinkInput {
  quiz_id: string;
  scheduled_day: string;
  day_order: number;
}

export type UpdateWeeklyChallengeQuizLinkInput = Partial<CreateWeeklyChallengeQuizLinkInput>;

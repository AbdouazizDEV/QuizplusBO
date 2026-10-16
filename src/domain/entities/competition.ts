export type CompetitionStatus = 'draft' | 'scheduled' | 'live' | 'completed' | 'cancelled';

export interface Competition {
  id: string;
  title: string;
  description?: string | null;
  quiz_id?: string | null;
  category_id?: string | null;
  max_participants?: number | null;
  status: CompetitionStatus | string;
  starts_at?: string | null;
  ends_at?: string | null;
  reward_text?: string | null;
}

export interface CreateCompetitionInput {
  title: string;
  description?: string | null;
  quiz_id?: string | null;
  category_id?: string | null;
  max_participants?: number;
  status: CompetitionStatus;
  starts_at?: string | null;
  ends_at?: string | null;
  reward_text?: string | null;
}

export type UpdateCompetitionInput = Partial<CreateCompetitionInput>;

export interface CompetitionListQuery {
  page?: number;
  limit?: number;
}

export type ChallengeStatus = 'pending' | 'accepted' | 'completed' | 'declined' | 'expired';

export interface Challenge {
  id: string;
  challenger_id: string;
  challenged_id: string;
  quiz_id: string;
  status: ChallengeStatus | string;
  challenger_score?: number | null;
  challenged_score?: number | null;
  winner_id?: string | null;
  expires_at?: string | null;
  created_at?: string;
}

export interface CreateChallengeInput {
  challenger_id: string;
  challenged_id: string;
  quiz_id: string;
  status?: ChallengeStatus;
  challenger_score?: number | null;
  challenged_score?: number | null;
  winner_id?: string | null;
  expires_at?: string | null;
}

export type UpdateChallengeInput = Partial<CreateChallengeInput>;

export interface ChallengeListQuery {
  page?: number;
  limit?: number;
}

export interface Profile {
  id: string;
  username?: string | null;
  full_name?: string | null;
  avatar_url?: string | null;
  is_suspended: boolean;
  suspended_until?: string | null;
  suspension_reason?: string | null;
  total_xp?: number | null;
  level?: number | null;
  created_at?: string;
}

export interface ProfileWithAuth {
  profile: Profile;
  auth?: {
    email?: string | null;
    last_sign_in_at?: string | null;
  } | null;
}

export interface ProfilesListQuery {
  page?: number;
  limit?: number;
  search?: string;
  is_suspended?: boolean;
}

export interface ProfilesListResponse {
  items: Profile[];
  page: number;
  limit: number;
  total: number;
}

export interface SuspendProfileInput {
  is_suspended: boolean;
  suspended_until?: string | null;
  suspension_reason?: string | null;
}

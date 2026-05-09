import type {
  Profile,
  ProfilesListQuery,
  ProfilesListResponse,
  ProfileWithAuth,
  SuspendProfileInput,
} from '@domain/entities/profile';
import type { ProfilesRepository } from '@domain/ports/repositories';
import { apiClient } from '../http/api-client';
import { Endpoints } from '../http/endpoints';

interface RawListResp {
  ok: boolean;
  items: Profile[];
  page: number;
  limit: number;
  total: number;
}
interface RawDetailResp {
  ok: boolean;
  profile: Profile;
  auth?: ProfileWithAuth['auth'];
}
interface RawSuspendResp {
  ok: boolean;
  item: Profile;
}

export class HttpProfilesRepository implements ProfilesRepository {
  async list(query?: ProfilesListQuery): Promise<ProfilesListResponse> {
    const params: Record<string, string | number | boolean | undefined> = {
      page: query?.page,
      limit: query?.limit,
      search: query?.search,
    };
    if (typeof query?.is_suspended === 'boolean') {
      params.is_suspended = query.is_suspended;
    }
    const res = await apiClient.get<RawListResp>(Endpoints.profiles.list, params);
    return {
      items: res.items ?? [],
      page: res.page ?? 1,
      limit: res.limit ?? 20,
      total: res.total ?? 0,
    };
  }
  async getById(id: string): Promise<ProfileWithAuth> {
    const res = await apiClient.get<RawDetailResp>(Endpoints.profiles.detail(id));
    return { profile: res.profile, auth: res.auth ?? null };
  }
  async suspend(id: string, input: SuspendProfileInput): Promise<Profile> {
    const res = await apiClient.patch<RawSuspendResp>(Endpoints.profiles.suspend(id), input);
    return res.item;
  }
}

export const profilesRepository: ProfilesRepository = new HttpProfilesRepository();

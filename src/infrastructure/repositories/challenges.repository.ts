import type {
  Challenge,
  ChallengeListQuery,
  CreateChallengeInput,
  UpdateChallengeInput,
} from '@domain/entities/challenge';
import type { ChallengesRepository } from '@domain/ports/repositories';
import { apiClient } from '../http/api-client';
import { Endpoints } from '../http/endpoints';

interface ListResp {
  ok: boolean;
  items: Challenge[];
  page: number;
  limit: number;
  total: number;
}
interface ItemResp {
  ok: boolean;
  item: Challenge;
}

export class HttpChallengesRepository implements ChallengesRepository {
  async list(query?: ChallengeListQuery) {
    const res = await apiClient.get<ListResp>(Endpoints.challenges.list, query);
    return {
      items: res.items ?? [],
      total: res.total ?? 0,
      page: res.page ?? 1,
      limit: res.limit ?? 20,
    };
  }
  async create(input: CreateChallengeInput): Promise<Challenge> {
    const res = await apiClient.post<ItemResp>(Endpoints.challenges.create, input);
    return res.item;
  }
  async update(id: string, input: UpdateChallengeInput): Promise<Challenge> {
    const res = await apiClient.put<ItemResp>(Endpoints.challenges.update(id), input);
    return res.item;
  }
  async remove(id: string): Promise<void> {
    await apiClient.delete(Endpoints.challenges.remove(id));
  }
}

export const challengesRepository: ChallengesRepository = new HttpChallengesRepository();

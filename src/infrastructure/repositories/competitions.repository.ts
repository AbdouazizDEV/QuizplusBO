import type {
  Competition,
  CompetitionListQuery,
  CreateCompetitionInput,
  UpdateCompetitionInput,
} from '@domain/entities/competition';
import type { CompetitionsRepository } from '@domain/ports/repositories';
import { apiClient } from '../http/api-client';
import { Endpoints } from '../http/endpoints';

interface ListResp {
  ok: boolean;
  items: Competition[];
  page: number;
  limit: number;
  total: number;
}
interface ItemResp {
  ok: boolean;
  item: Competition;
}

export class HttpCompetitionsRepository implements CompetitionsRepository {
  async list(query?: CompetitionListQuery) {
    const res = await apiClient.get<ListResp>(Endpoints.competitions.list, query);
    return {
      items: res.items ?? [],
      total: res.total ?? 0,
      page: res.page ?? 1,
      limit: res.limit ?? 20,
    };
  }
  async create(input: CreateCompetitionInput): Promise<Competition> {
    const res = await apiClient.post<ItemResp>(Endpoints.competitions.create, input);
    return res.item;
  }
  async update(id: string, input: UpdateCompetitionInput): Promise<Competition> {
    const res = await apiClient.put<ItemResp>(Endpoints.competitions.update(id), input);
    return res.item;
  }
  async remove(id: string): Promise<void> {
    await apiClient.delete(Endpoints.competitions.remove(id));
  }
}

export const competitionsRepository: CompetitionsRepository = new HttpCompetitionsRepository();

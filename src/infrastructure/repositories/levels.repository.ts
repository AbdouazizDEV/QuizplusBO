import type {
  CreateLevelInput,
  DifficultyLevel,
  UpdateLevelInput,
} from '@domain/entities/level';
import type { LevelsRepository } from '@domain/ports/repositories';
import { apiClient } from '../http/api-client';
import { Endpoints } from '../http/endpoints';

interface ListResp {
  ok: boolean;
  items: DifficultyLevel[];
}
interface ItemResp {
  ok: boolean;
  item: DifficultyLevel;
}

export class HttpLevelsRepository implements LevelsRepository {
  async list(): Promise<DifficultyLevel[]> {
    const res = await apiClient.get<ListResp>(Endpoints.levels.list);
    return res.items ?? [];
  }
  async create(input: CreateLevelInput): Promise<DifficultyLevel> {
    const res = await apiClient.post<ItemResp>(Endpoints.levels.create, input);
    return res.item;
  }
  async update(id: string, input: UpdateLevelInput): Promise<DifficultyLevel> {
    const res = await apiClient.put<ItemResp>(Endpoints.levels.update(id), input);
    return res.item;
  }
  async remove(id: string): Promise<void> {
    await apiClient.delete(Endpoints.levels.remove(id));
  }
}

export const levelsRepository: LevelsRepository = new HttpLevelsRepository();

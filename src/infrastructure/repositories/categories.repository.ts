import type { Category, CreateCategoryInput, UpdateCategoryInput } from '@domain/entities/category';
import type { CategoriesRepository } from '@domain/ports/repositories';
import { apiClient } from '../http/api-client';
import { Endpoints } from '../http/endpoints';

interface ListResp {
  ok: boolean;
  items: Category[];
}
interface ItemResp {
  ok: boolean;
  item: Category;
}

export class HttpCategoriesRepository implements CategoriesRepository {
  async list(): Promise<Category[]> {
    const res = await apiClient.get<ListResp>(Endpoints.categories.list);
    return res.items ?? [];
  }
  async create(input: CreateCategoryInput): Promise<Category> {
    const res = await apiClient.post<ItemResp>(Endpoints.categories.create, input);
    return res.item;
  }
  async update(id: string, input: UpdateCategoryInput): Promise<Category> {
    const res = await apiClient.put<ItemResp>(Endpoints.categories.update(id), input);
    return res.item;
  }
  async remove(id: string): Promise<void> {
    await apiClient.delete(Endpoints.categories.remove(id));
  }
}

export const categoriesRepository: CategoriesRepository = new HttpCategoriesRepository();

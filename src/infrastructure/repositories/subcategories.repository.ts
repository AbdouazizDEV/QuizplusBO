import type {
  CreateSubcategoryInput,
  Subcategory,
  UpdateSubcategoryInput,
} from '@domain/entities/subcategory';
import type { SubcategoriesRepository } from '@domain/ports/repositories';
import { apiClient } from '../http/api-client';
import { Endpoints } from '../http/endpoints';

interface ListResp {
  ok: boolean;
  items: Subcategory[];
}
interface ItemResp {
  ok: boolean;
  item: Subcategory;
}

export class HttpSubcategoriesRepository implements SubcategoriesRepository {
  async list(categoryId?: string): Promise<Subcategory[]> {
    const res = await apiClient.get<ListResp>(
      Endpoints.subcategories.list,
      categoryId ? { category_id: categoryId } : undefined,
    );
    return res.items ?? [];
  }
  async create(input: CreateSubcategoryInput): Promise<Subcategory> {
    const res = await apiClient.post<ItemResp>(Endpoints.subcategories.create, input);
    return res.item;
  }
  async update(id: string, input: UpdateSubcategoryInput): Promise<Subcategory> {
    const res = await apiClient.put<ItemResp>(Endpoints.subcategories.update(id), input);
    return res.item;
  }
  async remove(id: string): Promise<void> {
    await apiClient.delete(Endpoints.subcategories.remove(id));
  }
}

export const subcategoriesRepository: SubcategoriesRepository =
  new HttpSubcategoriesRepository();

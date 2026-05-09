export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string | null;
  color?: string | null;
}

export interface CreateCategoryInput {
  name: string;
  slug: string;
  icon?: string | null;
  color?: string | null;
}

export type UpdateCategoryInput = Partial<CreateCategoryInput>;

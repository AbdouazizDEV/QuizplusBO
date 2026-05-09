export interface Subcategory {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  description?: string | null;
}

export interface CreateSubcategoryInput {
  category_id: string;
  name: string;
  slug: string;
  description?: string | null;
}

export type UpdateSubcategoryInput = Partial<Omit<CreateSubcategoryInput, 'category_id'>> & {
  category_id?: string;
};

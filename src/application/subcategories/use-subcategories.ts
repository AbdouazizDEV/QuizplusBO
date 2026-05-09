import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  CreateSubcategoryInput,
  UpdateSubcategoryInput,
} from '@domain/entities/subcategory';
import { subcategoriesRepository } from '@infrastructure/repositories/subcategories.repository';
import { queryKeys } from '../query-keys';

export function useSubcategoriesQuery(categoryId?: string) {
  return useQuery({
    queryKey: queryKeys.subcategories(categoryId),
    queryFn: () => subcategoriesRepository.list(categoryId),
  });
}

export function useCreateSubcategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateSubcategoryInput) => subcategoriesRepository.create(input),
    onSuccess: () =>
      qc.invalidateQueries({ predicate: (q) => q.queryKey[0] === 'subcategories' }),
  });
}

export function useUpdateSubcategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string; input: UpdateSubcategoryInput }) =>
      subcategoriesRepository.update(vars.id, vars.input),
    onSuccess: () =>
      qc.invalidateQueries({ predicate: (q) => q.queryKey[0] === 'subcategories' }),
  });
}

export function useDeleteSubcategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => subcategoriesRepository.remove(id),
    onSuccess: () =>
      qc.invalidateQueries({ predicate: (q) => q.queryKey[0] === 'subcategories' }),
  });
}

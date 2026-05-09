import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CreateCategoryInput, UpdateCategoryInput } from '@domain/entities/category';
import { categoriesRepository } from '@infrastructure/repositories/categories.repository';
import { queryKeys } from '../query-keys';

export function useCategoriesQuery() {
  return useQuery({
    queryKey: queryKeys.categories,
    queryFn: () => categoriesRepository.list(),
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateCategoryInput) => categoriesRepository.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.categories }),
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string; input: UpdateCategoryInput }) =>
      categoriesRepository.update(vars.id, vars.input),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.categories }),
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => categoriesRepository.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.categories }),
  });
}

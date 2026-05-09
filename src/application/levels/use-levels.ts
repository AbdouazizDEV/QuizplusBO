import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CreateLevelInput, UpdateLevelInput } from '@domain/entities/level';
import { levelsRepository } from '@infrastructure/repositories/levels.repository';
import { queryKeys } from '../query-keys';

export function useLevelsQuery() {
  return useQuery({
    queryKey: queryKeys.levels,
    queryFn: () => levelsRepository.list(),
  });
}

export function useCreateLevel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateLevelInput) => levelsRepository.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.levels }),
  });
}

export function useUpdateLevel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string; input: UpdateLevelInput }) =>
      levelsRepository.update(vars.id, vars.input),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.levels }),
  });
}

export function useDeleteLevel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => levelsRepository.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.levels }),
  });
}

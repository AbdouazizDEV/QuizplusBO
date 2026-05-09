import { useMutation, useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import type {
  CompetitionListQuery,
  CreateCompetitionInput,
  UpdateCompetitionInput,
} from '@domain/entities/competition';
import { competitionsRepository } from '@infrastructure/repositories/competitions.repository';
import { queryKeys } from '../query-keys';

export function useCompetitionsQuery(filters?: CompetitionListQuery) {
  return useQuery({
    queryKey: queryKeys.competitions(filters),
    queryFn: () => competitionsRepository.list(filters),
    placeholderData: keepPreviousData,
  });
}

function invalidate(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ predicate: (q) => q.queryKey[0] === 'competitions' });
}

export function useCreateCompetition() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateCompetitionInput) => competitionsRepository.create(input),
    onSuccess: () => invalidate(qc),
  });
}

export function useUpdateCompetition() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string; input: UpdateCompetitionInput }) =>
      competitionsRepository.update(vars.id, vars.input),
    onSuccess: () => invalidate(qc),
  });
}

export function useDeleteCompetition() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => competitionsRepository.remove(id),
    onSuccess: () => invalidate(qc),
  });
}

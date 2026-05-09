import { useMutation, useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import type {
  ChallengeListQuery,
  CreateChallengeInput,
  UpdateChallengeInput,
} from '@domain/entities/challenge';
import { challengesRepository } from '@infrastructure/repositories/challenges.repository';
import { queryKeys } from '../query-keys';

export function useChallengesQuery(filters?: ChallengeListQuery) {
  return useQuery({
    queryKey: queryKeys.challenges(filters),
    queryFn: () => challengesRepository.list(filters),
    placeholderData: keepPreviousData,
  });
}

function invalidate(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ predicate: (q) => q.queryKey[0] === 'challenges' });
}

export function useCreateChallenge() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateChallengeInput) => challengesRepository.create(input),
    onSuccess: () => invalidate(qc),
  });
}

export function useUpdateChallenge() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string; input: UpdateChallengeInput }) =>
      challengesRepository.update(vars.id, vars.input),
    onSuccess: () => invalidate(qc),
  });
}

export function useDeleteChallenge() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => challengesRepository.remove(id),
    onSuccess: () => invalidate(qc),
  });
}

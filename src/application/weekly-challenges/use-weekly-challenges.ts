import { useMutation, useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import type {
  WeeklyChallengeListQuery,
  CreateWeeklyChallengeInput,
  UpdateWeeklyChallengeInput,
  CreateWeeklyChallengeQuizLinkInput,
  UpdateWeeklyChallengeQuizLinkInput,
} from '@domain/entities/weekly-challenge';
import { weeklyChallengesRepository } from '@infrastructure/repositories/weekly-challenges.repository';
import { queryKeys } from '../query-keys';

export function useWeeklyChallengesQuery(filters?: WeeklyChallengeListQuery) {
  return useQuery({
    queryKey: queryKeys.weeklyChallenges(filters),
    queryFn: () => weeklyChallengesRepository.list(filters),
    placeholderData: keepPreviousData,
  });
}

export function useWeeklyChallengeQuery(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.weeklyChallenge(id ?? ''),
    queryFn: () => weeklyChallengesRepository.getById(id!),
    enabled: !!id,
  });
}

export function useWeeklyChallengeQuizzesQuery(challengeId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.weeklyChallengeQuizzes(challengeId ?? ''),
    queryFn: () => weeklyChallengesRepository.listQuizzes(challengeId!),
    enabled: !!challengeId,
  });
}

function invalidateList(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ predicate: (q) => q.queryKey[0] === 'weekly-challenges' });
}

function invalidateDetail(qc: ReturnType<typeof useQueryClient>, id: string) {
  qc.invalidateQueries({ queryKey: queryKeys.weeklyChallenge(id) });
  qc.invalidateQueries({ queryKey: queryKeys.weeklyChallengeQuizzes(id) });
  invalidateList(qc);
}

export function useCreateWeeklyChallenge() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateWeeklyChallengeInput) => weeklyChallengesRepository.create(input),
    onSuccess: () => invalidateList(qc),
  });
}

export function useUpdateWeeklyChallenge() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string; input: UpdateWeeklyChallengeInput }) =>
      weeklyChallengesRepository.update(vars.id, vars.input),
    onSuccess: (_data, vars) => invalidateDetail(qc, vars.id),
  });
}

export function useDeleteWeeklyChallenge() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => weeklyChallengesRepository.remove(id),
    onSuccess: () => invalidateList(qc),
  });
}

export function useAddWeeklyChallengeQuiz() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { challengeId: string; input: CreateWeeklyChallengeQuizLinkInput }) =>
      weeklyChallengesRepository.addQuiz(vars.challengeId, vars.input),
    onSuccess: (_data, vars) => invalidateDetail(qc, vars.challengeId),
  });
}

export function useUpdateWeeklyChallengeQuizLink() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: {
      challengeId: string;
      linkId: string;
      input: UpdateWeeklyChallengeQuizLinkInput;
    }) => weeklyChallengesRepository.updateQuizLink(vars.challengeId, vars.linkId, vars.input),
    onSuccess: (_data, vars) => invalidateDetail(qc, vars.challengeId),
  });
}

export function useRemoveWeeklyChallengeQuizLink() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { challengeId: string; linkId: string }) =>
      weeklyChallengesRepository.removeQuizLink(vars.challengeId, vars.linkId),
    onSuccess: (_data, vars) => invalidateDetail(qc, vars.challengeId),
  });
}

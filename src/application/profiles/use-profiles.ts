import { useMutation, useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import type { ProfilesListQuery, SuspendProfileInput } from '@domain/entities/profile';
import { profilesRepository } from '@infrastructure/repositories/profiles.repository';
import { queryKeys } from '../query-keys';

export function useProfilesQuery(filters?: ProfilesListQuery) {
  return useQuery({
    queryKey: queryKeys.profiles(filters),
    queryFn: () => profilesRepository.list(filters),
    placeholderData: keepPreviousData,
  });
}

export function useProfileQuery(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.profile(id ?? ''),
    queryFn: () => profilesRepository.getById(id as string),
    enabled: !!id,
  });
}

export function useSuspendProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string; input: SuspendProfileInput }) =>
      profilesRepository.suspend(vars.id, vars.input),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ predicate: (q) => q.queryKey[0] === 'profiles' });
      qc.invalidateQueries({ queryKey: queryKeys.profile(vars.id) });
    },
  });
}

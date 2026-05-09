import { useMutation, useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import type {
  CreateQuizInput,
  ImportQuizInput,
  QuizListQuery,
  UpdateQuizInput,
} from '@domain/entities/quiz';
import { quizzesRepository } from '@infrastructure/repositories/quizzes.repository';
import { queryKeys } from '../query-keys';

export function useQuizzesQuery(filters?: QuizListQuery) {
  return useQuery({
    queryKey: queryKeys.quizzes(filters),
    queryFn: () => quizzesRepository.list(filters),
    placeholderData: keepPreviousData,
  });
}

function invalidateQuizzes(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ predicate: (q) => q.queryKey[0] === 'quizzes' });
}

export function useCreateQuiz() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateQuizInput) => quizzesRepository.create(input),
    onSuccess: () => invalidateQuizzes(qc),
  });
}

export function useUpdateQuiz() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string; input: UpdateQuizInput }) =>
      quizzesRepository.update(vars.id, vars.input),
    onSuccess: () => invalidateQuizzes(qc),
  });
}

export function useDeleteQuiz() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => quizzesRepository.remove(id),
    onSuccess: () => invalidateQuizzes(qc),
  });
}

export function useImportQuizzes() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ImportQuizInput) => quizzesRepository.importMany(input),
    onSuccess: () => invalidateQuizzes(qc),
  });
}

export function useImportIntoQuiz() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { quizId: string; file: File }) =>
      quizzesRepository.importIntoQuiz(vars.quizId, vars.file),
    onSuccess: (_data, vars) => {
      invalidateQuizzes(qc);
      qc.invalidateQueries({ queryKey: queryKeys.questions(vars.quizId) });
    },
  });
}

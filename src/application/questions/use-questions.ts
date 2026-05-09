import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CreateQuestionInput, UpdateQuestionInput } from '@domain/entities/question';
import { questionsRepository } from '@infrastructure/repositories/questions.repository';
import { queryKeys } from '../query-keys';

export function useQuestionsQuery(quizId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.questions(quizId ?? ''),
    queryFn: () => questionsRepository.listByQuiz(quizId as string),
    enabled: !!quizId,
  });
}

export function useCreateQuestion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateQuestionInput) => questionsRepository.create(input),
    onSuccess: (_data, input) =>
      qc.invalidateQueries({ queryKey: queryKeys.questions(input.quiz_id) }),
  });
}

export function useUpdateQuestion(quizId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string; input: UpdateQuestionInput }) =>
      questionsRepository.update(vars.id, vars.input),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.questions(quizId) }),
  });
}

export function useDeleteQuestion(quizId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => questionsRepository.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.questions(quizId) }),
  });
}

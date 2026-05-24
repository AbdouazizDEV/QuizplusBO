import type { Quiz } from '@domain/entities/quiz';

export function formatQuizLabel(
  quiz: Pick<Quiz, 'title' | 'total_questions'> & { difficulty_level?: Quiz['difficulty_level'] | null },
): string {
  const level = quiz.difficulty_level ?? '—';
  const count = quiz.total_questions ?? 0;
  return `${quiz.title} · ${level} · ${count} question${count > 1 ? 's' : ''}`;
}

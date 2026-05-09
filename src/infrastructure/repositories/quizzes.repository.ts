import type {
  CreateQuizInput,
  ImportIntoQuizResult,
  ImportQuizInput,
  ImportQuizResult,
  Quiz,
  QuizListQuery,
  QuizListResponse,
  UpdateQuizInput,
} from '@domain/entities/quiz';
import type { QuizzesRepository } from '@domain/ports/repositories';
import { apiClient } from '../http/api-client';
import { Endpoints } from '../http/endpoints';

interface RawListResp {
  ok: boolean;
  items: Quiz[];
  page: number;
  limit: number;
  total: number;
  has_more: boolean;
}
interface ItemResp {
  ok: boolean;
  item: Quiz;
}

export class HttpQuizzesRepository implements QuizzesRepository {
  async list(query?: QuizListQuery): Promise<QuizListResponse> {
    const res = await apiClient.get<RawListResp>(Endpoints.quizzes.list, query);
    return {
      items: res.items ?? [],
      page: res.page ?? 1,
      limit: res.limit ?? 20,
      total: res.total ?? 0,
      has_more: res.has_more ?? false,
    };
  }
  async create(input: CreateQuizInput): Promise<Quiz> {
    const res = await apiClient.post<ItemResp>(Endpoints.quizzes.create, input);
    return res.item;
  }
  async update(id: string, input: UpdateQuizInput): Promise<Quiz> {
    const res = await apiClient.put<ItemResp>(Endpoints.quizzes.update(id), input);
    return res.item;
  }
  async remove(id: string): Promise<void> {
    await apiClient.delete(Endpoints.quizzes.remove(id));
  }
  async importMany(input: ImportQuizInput): Promise<ImportQuizResult> {
    const fd = new FormData();
    fd.append('file', input.file);
    fd.append('title', input.title);
    fd.append('category_id', input.category_id);
    fd.append('subcategory_id', input.subcategory_id);
    if (input.difficulty_level) fd.append('difficulty_level', String(input.difficulty_level));
    if (input.theme) fd.append('theme', input.theme);
    const res = await apiClient.postForm<{
      ok: boolean;
      quiz_ids: string[];
      imported_questions: number;
    }>(Endpoints.quizzes.importMany, fd);
    return { quiz_ids: res.quiz_ids, imported_questions: res.imported_questions };
  }
  async importIntoQuiz(quizId: string, file: File): Promise<ImportIntoQuizResult> {
    const fd = new FormData();
    fd.append('file', file);
    const res = await apiClient.postForm<{
      ok: boolean;
      quiz_id: string;
      imported_questions: number;
    }>(Endpoints.quizzes.importIntoQuiz(quizId), fd);
    return { quiz_id: res.quiz_id, imported_questions: res.imported_questions };
  }
}

export const quizzesRepository: QuizzesRepository = new HttpQuizzesRepository();

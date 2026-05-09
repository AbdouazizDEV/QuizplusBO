import type {
  CreateQuestionInput,
  Question,
  UpdateQuestionInput,
} from '@domain/entities/question';
import type { QuestionsRepository } from '@domain/ports/repositories';
import { apiClient } from '../http/api-client';
import { Endpoints } from '../http/endpoints';

interface ListResp {
  ok: boolean;
  items: Question[];
}
interface ItemResp {
  ok: boolean;
  item: Question;
}

export class HttpQuestionsRepository implements QuestionsRepository {
  async listByQuiz(quizId: string): Promise<Question[]> {
    const res = await apiClient.get<ListResp>(Endpoints.quizzes.questions(quizId));
    return res.items ?? [];
  }
  async create(input: CreateQuestionInput): Promise<Question> {
    const res = await apiClient.post<ItemResp>(Endpoints.questions.create, input);
    return res.item;
  }
  async update(id: string, input: UpdateQuestionInput): Promise<Question> {
    const res = await apiClient.put<ItemResp>(Endpoints.questions.update(id), input);
    return res.item;
  }
  async remove(id: string): Promise<void> {
    await apiClient.delete(Endpoints.questions.remove(id));
  }
}

export const questionsRepository: QuestionsRepository = new HttpQuestionsRepository();

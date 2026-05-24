import type {
  WeeklyChallenge,
  WeeklyChallengeListQuery,
  WeeklyChallengeQuizLink,
  CreateWeeklyChallengeInput,
  UpdateWeeklyChallengeInput,
  CreateWeeklyChallengeQuizLinkInput,
  UpdateWeeklyChallengeQuizLinkInput,
} from '@domain/entities/weekly-challenge';
import type { WeeklyChallengesRepository } from '@domain/ports/repositories';
import { apiClient } from '../http/api-client';
import { Endpoints } from '../http/endpoints';

interface ListResp {
  ok: boolean;
  items: WeeklyChallenge[];
  page: number;
  limit: number;
  total: number;
}
interface ItemResp {
  ok: boolean;
  item: WeeklyChallenge;
}
interface QuizLinksResp {
  ok: boolean;
  items: WeeklyChallengeQuizLink[];
}
interface QuizLinkItemResp {
  ok: boolean;
  item: WeeklyChallengeQuizLink;
}

export class HttpWeeklyChallengesRepository implements WeeklyChallengesRepository {
  async list(query?: WeeklyChallengeListQuery) {
    const res = await apiClient.get<ListResp>(Endpoints.weeklyChallenges.list, query);
    return {
      items: res.items ?? [],
      total: res.total ?? 0,
      page: res.page ?? 1,
      limit: res.limit ?? 20,
    };
  }

  async getById(id: string): Promise<WeeklyChallenge> {
    const res = await apiClient.get<ItemResp>(Endpoints.weeklyChallenges.detail(id));
    return res.item;
  }

  async create(input: CreateWeeklyChallengeInput): Promise<WeeklyChallenge> {
    const res = await apiClient.post<ItemResp>(Endpoints.weeklyChallenges.create, input);
    return res.item;
  }

  async update(id: string, input: UpdateWeeklyChallengeInput): Promise<WeeklyChallenge> {
    const res = await apiClient.put<ItemResp>(Endpoints.weeklyChallenges.update(id), input);
    return res.item;
  }

  async remove(id: string): Promise<void> {
    await apiClient.delete(Endpoints.weeklyChallenges.remove(id));
  }

  async listQuizzes(challengeId: string): Promise<WeeklyChallengeQuizLink[]> {
    const res = await apiClient.get<QuizLinksResp>(Endpoints.weeklyChallenges.quizzes(challengeId));
    return res.items ?? [];
  }

  async addQuiz(
    challengeId: string,
    input: CreateWeeklyChallengeQuizLinkInput,
  ): Promise<WeeklyChallengeQuizLink> {
    const res = await apiClient.post<QuizLinkItemResp>(
      Endpoints.weeklyChallenges.quizzes(challengeId),
      input,
    );
    return res.item;
  }

  async updateQuizLink(
    challengeId: string,
    linkId: string,
    input: UpdateWeeklyChallengeQuizLinkInput,
  ): Promise<WeeklyChallengeQuizLink> {
    const res = await apiClient.put<QuizLinkItemResp>(
      Endpoints.weeklyChallenges.quizLink(challengeId, linkId),
      input,
    );
    return res.item;
  }

  async removeQuizLink(challengeId: string, linkId: string): Promise<void> {
    await apiClient.delete(Endpoints.weeklyChallenges.quizLink(challengeId, linkId));
  }
}

export const weeklyChallengesRepository: WeeklyChallengesRepository =
  new HttpWeeklyChallengesRepository();

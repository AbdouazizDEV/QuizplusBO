import type {
  Category,
  CreateCategoryInput,
  UpdateCategoryInput,
} from '../entities/category';
import type { Subcategory, CreateSubcategoryInput, UpdateSubcategoryInput } from '../entities/subcategory';
import type { DifficultyLevel, CreateLevelInput, UpdateLevelInput } from '../entities/level';
import type {
  Quiz,
  QuizListQuery,
  QuizListResponse,
  CreateQuizInput,
  UpdateQuizInput,
  ImportQuizInput,
  ImportQuizResult,
  ImportIntoQuizResult,
} from '../entities/quiz';
import type {
  Question,
  CreateQuestionInput,
  UpdateQuestionInput,
} from '../entities/question';
import type {
  Challenge,
  CreateChallengeInput,
  UpdateChallengeInput,
  ChallengeListQuery,
} from '../entities/challenge';
import type {
  Competition,
  CreateCompetitionInput,
  UpdateCompetitionInput,
  CompetitionListQuery,
} from '../entities/competition';
import type {
  ProfilesListQuery,
  ProfilesListResponse,
  ProfileWithAuth,
  SuspendProfileInput,
  Profile,
} from '../entities/profile';
import type {
  BroadcastNotificationInput,
  NotificationItem,
  SendNotificationInput,
} from '../entities/notification';
import type { UploadImageInput, UploadImageResult } from '../entities/media';

export interface PaginatedQuery {
  page?: number;
  limit?: number;
}

export interface LevelsRepository {
  list(): Promise<DifficultyLevel[]>;
  create(input: CreateLevelInput): Promise<DifficultyLevel>;
  update(id: string, input: UpdateLevelInput): Promise<DifficultyLevel>;
  remove(id: string): Promise<void>;
}

export interface CategoriesRepository {
  list(): Promise<Category[]>;
  create(input: CreateCategoryInput): Promise<Category>;
  update(id: string, input: UpdateCategoryInput): Promise<Category>;
  remove(id: string): Promise<void>;
}

export interface SubcategoriesRepository {
  list(categoryId?: string): Promise<Subcategory[]>;
  create(input: CreateSubcategoryInput): Promise<Subcategory>;
  update(id: string, input: UpdateSubcategoryInput): Promise<Subcategory>;
  remove(id: string): Promise<void>;
}

export interface QuizzesRepository {
  list(query?: QuizListQuery): Promise<QuizListResponse>;
  create(input: CreateQuizInput): Promise<Quiz>;
  update(id: string, input: UpdateQuizInput): Promise<Quiz>;
  remove(id: string): Promise<void>;
  importMany(input: ImportQuizInput): Promise<ImportQuizResult>;
  importIntoQuiz(quizId: string, file: File): Promise<ImportIntoQuizResult>;
}

export interface QuestionsRepository {
  listByQuiz(quizId: string): Promise<Question[]>;
  create(input: CreateQuestionInput): Promise<Question>;
  update(id: string, input: UpdateQuestionInput): Promise<Question>;
  remove(id: string): Promise<void>;
}

export interface ChallengesRepository {
  list(query?: ChallengeListQuery): Promise<{ items: Challenge[]; total: number; page: number; limit: number }>;
  create(input: CreateChallengeInput): Promise<Challenge>;
  update(id: string, input: UpdateChallengeInput): Promise<Challenge>;
  remove(id: string): Promise<void>;
}

export interface CompetitionsRepository {
  list(query?: CompetitionListQuery): Promise<{ items: Competition[]; total: number; page: number; limit: number }>;
  create(input: CreateCompetitionInput): Promise<Competition>;
  update(id: string, input: UpdateCompetitionInput): Promise<Competition>;
  remove(id: string): Promise<void>;
}

export interface ProfilesRepository {
  list(query?: ProfilesListQuery): Promise<ProfilesListResponse>;
  getById(id: string): Promise<ProfileWithAuth>;
  suspend(id: string, input: SuspendProfileInput): Promise<Profile>;
}

export interface NotificationsRepository {
  send(input: SendNotificationInput): Promise<NotificationItem>;
  broadcast(input: BroadcastNotificationInput): Promise<{ inserted: number }>;
}

export interface MediaRepository {
  uploadImage(input: UploadImageInput): Promise<UploadImageResult>;
}

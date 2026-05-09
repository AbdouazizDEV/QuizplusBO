export const queryKeys = {
  levels: ['levels'] as const,
  categories: ['categories'] as const,
  subcategories: (categoryId?: string) =>
    categoryId ? (['subcategories', categoryId] as const) : (['subcategories'] as const),
  quizzes: (filters?: object) => ['quizzes', filters ?? {}] as const,
  questions: (quizId: string) => ['questions', quizId] as const,
  challenges: (filters?: object) => ['challenges', filters ?? {}] as const,
  competitions: (filters?: object) => ['competitions', filters ?? {}] as const,
  profiles: (filters?: object) => ['profiles', filters ?? {}] as const,
  profile: (id: string) => ['profiles', 'detail', id] as const,
};

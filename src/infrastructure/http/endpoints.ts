export const Endpoints = {
  media: {
    uploadImage: '/media/upload-image',
  },
  levels: {
    list: '/levels',
    create: '/levels',
    update: (id: string) => `/levels/${id}`,
    remove: (id: string) => `/levels/${id}`,
  },
  categories: {
    list: '/categories',
    create: '/categories',
    update: (id: string) => `/categories/${id}`,
    remove: (id: string) => `/categories/${id}`,
  },
  subcategories: {
    list: '/subcategories',
    create: '/subcategories',
    update: (id: string) => `/subcategories/${id}`,
    remove: (id: string) => `/subcategories/${id}`,
  },
  quizzes: {
    list: '/quizzes',
    create: '/quizzes',
    update: (id: string) => `/quizzes/${id}`,
    remove: (id: string) => `/quizzes/${id}`,
    importMany: '/quizzes/import',
    importIntoQuiz: (id: string) => `/quizzes/${id}/import`,
    questions: (id: string) => `/quizzes/${id}/questions`,
  },
  questions: {
    create: '/questions',
    update: (id: string) => `/questions/${id}`,
    remove: (id: string) => `/questions/${id}`,
  },
  challenges: {
    list: '/challenges',
    create: '/challenges',
    update: (id: string) => `/challenges/${id}`,
    remove: (id: string) => `/challenges/${id}`,
  },
  competitions: {
    list: '/competitions',
    create: '/competitions',
    update: (id: string) => `/competitions/${id}`,
    remove: (id: string) => `/competitions/${id}`,
  },
  profiles: {
    list: '/profiles',
    detail: (id: string) => `/profiles/${id}`,
    suspend: (id: string) => `/profiles/${id}/suspend`,
  },
  notifications: {
    send: '/notifications/send',
    broadcast: '/notifications/broadcast',
  },
} as const;

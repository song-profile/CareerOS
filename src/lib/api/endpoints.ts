export const apiEndpoints = {
  health: "/api/health",
  auth: {
    me: "/api/auth/me",
    logout: "/api/auth/logout",
  },
  oauth: {
    googleStart: "/oauth2/authorization/google",
  },
  applications: {
    list: "/api/applications",
    detail: (id: string | number) => `/api/applications/${id}`,
    status: (id: string | number) => `/api/applications/${id}/status`,
    essayQuestions: (applicationId: string | number) =>
      `/api/applications/${applicationId}/essay-questions`,
  },
  essays: {
    list: "/api/essays",
    question: (id: string | number) => `/api/essay-questions/${id}`,
    createAnswer: (questionId: string | number) => `/api/essay-questions/${questionId}/answers`,
    answer: (id: string | number) => `/api/essay-answers/${id}`,
    versions: (id: string | number) => `/api/essay-answers/${id}/versions`,
    submitLock: (id: string | number) => `/api/essay-answers/${id}/submit-lock`,
    tags: "/api/experience-tags",
    answerTags: (id: string | number) => `/api/essay-answers/${id}/tags`,
    answerTag: (id: string | number, tagId: string | number) =>
      `/api/essay-answers/${id}/tags/${tagId}`,
  },
  credentials: {
    list: "/api/credentials",
    detail: (id: string | number) => `/api/credentials/${id}`,
    number: (id: string | number) => `/api/credentials/${id}/number`,
  },
  files: {
    list: "/api/files",
    detail: (id: string | number) => `/api/files/${id}`,
    download: (id: string | number) => `/api/files/${id}/download`,
  },
  externalLinks: {
    list: "/api/external-links",
    detail: (id: string | number) => `/api/external-links/${id}`,
  },
} as const;

export const apiEndpoints = {
  health: "/api/health",
  auth: {
    me: "/api/auth/me",
    logout: "/api/auth/logout",
  },
  oauth: {
    googleStart: "/oauth2/authorization/google",
  },
  dashboard: {
    summary: "/api/dashboard/summary",
  },
  notifications: {
    list: "/api/notifications",
    unreadCount: "/api/notifications/unread-count",
    read: (id: string | number) => `/api/notifications/${id}/read`,
    readAll: "/api/notifications/read-all",
    detail: (id: string | number) => `/api/notifications/${id}`,
  },
  applications: {
    list: "/api/applications",
    detail: (id: string | number) => `/api/applications/${id}`,
    status: (id: string | number) => `/api/applications/${id}/status`,
    essayQuestions: (applicationId: string | number) =>
      `/api/applications/${applicationId}/essay-questions`,
    resources: (applicationId: string | number) => `/api/applications/${applicationId}/resources`,
    files: (applicationId: string | number) => `/api/applications/${applicationId}/files`,
    file: (applicationId: string | number, fileId: string | number) =>
      `/api/applications/${applicationId}/files/${fileId}`,
    credentials: (applicationId: string | number) =>
      `/api/applications/${applicationId}/credentials`,
    credential: (applicationId: string | number, credentialId: string | number) =>
      `/api/applications/${applicationId}/credentials/${credentialId}`,
    externalLinks: (applicationId: string | number) =>
      `/api/applications/${applicationId}/external-links`,
    externalLink: (applicationId: string | number, linkId: string | number) =>
      `/api/applications/${applicationId}/external-links/${linkId}`,
  },
  calendar: {
    events: "/api/calendar/events",
    event: (id: string | number) => `/api/calendar/events/${id}`,
    connect: "/api/calendar/connect",
    oauthCallback: "/api/calendar/oauth/callback",
    status: "/api/calendar/status",
    sync: "/api/calendar/sync",
    disconnect: "/api/calendar/disconnect",
    testEvent: "/api/calendar/test-event",
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

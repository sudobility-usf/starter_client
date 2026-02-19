export type FirebaseIdToken = string;

export const QUERY_KEYS = {
  histories: (userId: string) => ['starter', 'histories', userId] as const,
  historiesTotal: () => ['starter', 'histories', 'total'] as const,
  user: (userId: string) => ['starter', 'user', userId] as const,
} as const;

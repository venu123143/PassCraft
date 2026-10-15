/** React Query cache keys, built in one place so invalidation stays consistent. */
export const queryKeys = {
  passes: {
    all: ['passes'] as const,
    detail: (id: string) => ['passes', id] as const,
  },
}

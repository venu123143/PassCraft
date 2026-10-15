/** Route paths and builders; components never hard-code URLs. */
export const ROUTES = {
  createPass: '/',
  passes: '/passes',
  passDetail: '/passes/:passId',
} as const

export const buildPassDetailPath = (passId: string) => `/passes/${encodeURIComponent(passId)}`

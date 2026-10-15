import { z } from 'zod'
import { PASS_RULES } from '@/constants/pass-rules'

const hasAtMostTwoDecimals = (value: number) => {
  const scaled = value * 10 ** PASS_RULES.value.maxDecimals
  return Math.abs(scaled - Math.round(scaled)) < 1e-9
}

/** Number on the pass; mirrors the server's rules so errors show before submitting. */
export const passValueSchema = z
  .number({ error: 'Enter a number' })
  .min(PASS_RULES.value.min, `Use a number of ${PASS_RULES.value.min} or more`)
  .max(PASS_RULES.value.max, 'Use a number up to 1,000,000,000')
  .refine(hasAtMostTwoDecimals, 'Use at most 2 decimal places')

export const createPassSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Enter the name to show on the pass')
    .max(PASS_RULES.name.max, `Keep the name under ${PASS_RULES.name.max} characters`),
  label: z
    .string()
    .trim()
    .min(1, 'Enter a label, like Balance or Points')
    .max(PASS_RULES.label.max, `Keep the label under ${PASS_RULES.label.max} characters`),
  value: passValueSchema,
})

export type CreatePassFormValues = z.infer<typeof createPassSchema>

export const updatePassValueSchema = z.object({ value: passValueSchema })

export type UpdatePassValueFormValues = z.infer<typeof updatePassValueSchema>

export const openPassSchema = z.object({
  passId: z.string().trim().pipe(z.uuid({ error: 'Paste the pass id, a 36-character code like 3f0c6f4e-5b8a-…' })),
})

export type OpenPassFormValues = z.infer<typeof openPassSchema>

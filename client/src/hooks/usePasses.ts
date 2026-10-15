import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/constants/query-keys'
import { passService } from '@/services/passService'
import { ApiError } from '@/types/api.types'
import type { CreatePassRequest, Pass } from '@/types/pass.types'
import { useRecentPasses } from './useRecentPasses'

/** Fetches one pass. A 404 is final, so it isn't retried. */
export function usePass(passId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.passes.detail(passId ?? ''),
    queryFn: () => passService.getById(passId as string),
    enabled: Boolean(passId),
    retry: (failureCount, error) =>
      !(error instanceof ApiError && error.status !== null && error.status < 500) && failureCount < 2,
  })
}

/** Creates a pass, caches it and remembers it in "My passes". */
export function useCreatePass() {
  const queryClient = useQueryClient()
  const { upsert } = useRecentPasses()

  return useMutation({
    mutationFn: (payload: CreatePassRequest) => passService.create(payload),
    onSuccess: (created) => {
      const { qrCodeDataUrl: _qr, ...pass } = created
      queryClient.setQueryData<Pass>(queryKeys.passes.detail(pass.id), pass)
      upsert({
        id: pass.id,
        name: pass.name,
        label: pass.label,
        value: pass.value,
        createdAt: pass.createdAt,
      })
    },
  })
}

/** Pushes a new number to the pass; the wallet on the phone picks it up live. */
export function useUpdatePassValue(passId: string) {
  const queryClient = useQueryClient()
  const { update } = useRecentPasses()

  return useMutation({
    mutationFn: (value: number) => passService.updateValue(passId, { value }),
    onSuccess: (pass) => {
      queryClient.setQueryData<Pass>(queryKeys.passes.detail(pass.id), pass)
      update(pass.id, { value: pass.value })
    },
  })
}

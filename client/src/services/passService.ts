import { API_ENDPOINTS } from '@/api/endpoints'
import { apiClient } from '@/services/api'
import type {
  CreatePassRequest,
  CreatePassResponse,
  Pass,
  UpdatePassValueRequest,
} from '@/types/pass.types'

/** Typed wrappers around the passes endpoints. */
export const passService = {
  async create(payload: CreatePassRequest): Promise<CreatePassResponse> {
    const { data } = await apiClient.post<CreatePassResponse>(API_ENDPOINTS.passes.create, payload)
    return data
  },

  async getById(id: string): Promise<Pass> {
    const { data } = await apiClient.get<Pass>(API_ENDPOINTS.passes.detail(id))
    return data
  },

  async updateValue(id: string, payload: UpdatePassValueRequest): Promise<Pass> {
    const { data } = await apiClient.post<Pass>(API_ENDPOINTS.passes.updateValue(id), payload)
    return data
  },
}

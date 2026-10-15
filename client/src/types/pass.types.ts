export type WalletPlatform = 'google'

/** A pass as returned by GET /passes/:id and POST /passes/:id. */
export interface Pass {
  id: string
  uniquePassId: string
  name: string
  label: string
  value: number
  platform: WalletPlatform
  saveUrl: string | null
  createdAt: string
  updatedAt: string
}

export interface CreatePassRequest {
  name: string
  label: string
  value: number
  platform?: WalletPlatform
}

/** POST /passes response: the pass plus its save link and a QR image of that link. */
export interface CreatePassResponse extends Omit<Pass, 'saveUrl'> {
  saveUrl: string
  qrCodeDataUrl: string
}

export interface UpdatePassValueRequest {
  value: number
}

/** Minimal record kept in localStorage so "My passes" survives reloads. */
export interface RecentPass {
  id: string
  name: string
  label: string
  value: number
  createdAt: string
}

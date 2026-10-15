import { useCallback, useSyncExternalStore } from 'react'
import { STORAGE_KEYS } from '@/constants/storage-keys'
import type { RecentPass } from '@/types/pass.types'

const MAX_RECENT = 20
const listeners = new Set<() => void>()
let cachedRaw: string | null | undefined
let cachedList: RecentPass[] = []

function readRaw(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEYS.recentPasses)
  } catch {
    return null
  }
}

/** Returns a stable array reference until the stored value changes. */
function getSnapshot(): RecentPass[] {
  const raw = readRaw()
  if (raw !== cachedRaw) {
    cachedRaw = raw
    try {
      const parsed: unknown = raw ? JSON.parse(raw) : []
      cachedList = Array.isArray(parsed) ? (parsed as RecentPass[]) : []
    } catch {
      cachedList = []
    }
  }
  return cachedList
}

function write(list: RecentPass[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.recentPasses, JSON.stringify(list.slice(0, MAX_RECENT)))
  } catch {
    // Storage unavailable: the list just won't persist.
  }
  listeners.forEach((notify) => notify())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEYS.recentPasses) listener()
  }
  window.addEventListener('storage', onStorage)
  return () => {
    listeners.delete(listener)
    window.removeEventListener('storage', onStorage)
  }
}

/**
 * Passes created in this browser, newest first. Stored locally so the
 * "My passes" page works without a list endpoint on the server.
 */
export function useRecentPasses() {
  const passes = useSyncExternalStore(subscribe, getSnapshot, () => [])

  const upsert = useCallback((pass: RecentPass) => {
    write([pass, ...getSnapshot().filter((item) => item.id !== pass.id)])
  }, [])

  const update = useCallback((id: string, changes: Partial<Omit<RecentPass, 'id'>>) => {
    const list = getSnapshot()
    if (!list.some((item) => item.id === id)) return
    write(list.map((item) => (item.id === id ? { ...item, ...changes } : item)))
  }, [])

  const remove = useCallback((id: string) => {
    write(getSnapshot().filter((item) => item.id !== id))
  }, [])

  return { passes, upsert, update, remove }
}

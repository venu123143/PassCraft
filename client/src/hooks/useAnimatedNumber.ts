import { useEffect, useRef, useState } from 'react'
import { usePrefersReducedMotion } from './usePrefersReducedMotion'

const easeOutCubic = (t: number) => 1 - (1 - t) ** 3

/**
 * Rolls a displayed number from its previous value to `target`.
 * Jumps straight to the target when reduced motion is requested.
 */
export function useAnimatedNumber(target: number, durationMs = 700): number {
  const reducedMotion = usePrefersReducedMotion()
  const [display, setDisplay] = useState(target)
  const fromRef = useRef(target)

  useEffect(() => {
    const from = fromRef.current
    fromRef.current = target
    if (reducedMotion || from === target || !Number.isFinite(from) || !Number.isFinite(target)) {
      setDisplay(target)
      return
    }

    let frame = 0
    const start = performance.now()
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / durationMs)
      const next = from + (target - from) * easeOutCubic(progress)
      setDisplay(progress === 1 ? target : Math.round(next * 100) / 100)
      if (progress < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [target, durationMs, reducedMotion])

  return display
}

import { QrCode } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { PASS_CARD_TITLE } from '@/constants/config'
import { useAnimatedNumber } from '@/hooks/useAnimatedNumber'
import { cn } from '@/utils/cn'
import { formatPassValue } from '@/utils/format'

interface PassCardProps {
  name: string
  label: string
  value: number
  /** Present once the pass exists; encoded in the QR exactly like the real pass. */
  uniquePassId?: string
  /** Change this number to play the "synced" sheen across the card. */
  syncKey?: number
  className?: string
}

/**
 * Mirrors the Google Wallet "Generic" pass the server issues: card title,
 * name as header, label + number on the front and a QR of the unique pass id.
 */
export function PassCard({ name, label, value, uniquePassId, syncKey = 0, className }: PassCardProps) {
  const displayValue = useAnimatedNumber(value)
  const trimmedName = name.trim()
  const trimmedLabel = label.trim()
  const hasValue = Number.isFinite(value)

  return (
    <article
      aria-label={`Pass preview for ${trimmedName || 'a new pass'}`}
      className={cn(
        'relative isolate w-full max-w-[22rem] overflow-hidden rounded-pass bg-pass text-pass-foreground shadow-pass',
        className,
      )}
    >
      {syncKey > 0 && (
        <span
          key={syncKey}
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-1/2 animate-sheen bg-gradient-to-r from-transparent via-white/35 to-transparent"
        />
      )}

      <header className="flex items-center gap-3 px-5 pt-5">
        <span
          aria-hidden
          className="grid size-9 place-items-center rounded-full bg-white font-display text-lg font-bold text-pass"
        >
          {PASS_CARD_TITLE.charAt(0)}
        </span>
        <span className="text-[0.95rem] font-medium">{PASS_CARD_TITLE}</span>
      </header>

      <p
        className={cn(
          'px-5 pt-7 font-display text-[1.75rem] leading-[1.15] font-semibold tracking-tight break-words',
          !trimmedName && 'text-pass-muted',
        )}
      >
        {trimmedName || 'Name on the pass'}
      </p>

      <div className="px-5 pt-5 pb-6">
        <p className={cn('text-sm', trimmedLabel ? 'text-pass-muted' : 'text-pass-muted/70')}>
          {trimmedLabel || 'Label'}
        </p>
        <p
          className={cn(
            'mt-0.5 font-display text-[3.25rem] leading-none font-semibold tracking-tight tabular-nums',
            !hasValue && 'text-pass-muted/70',
          )}
        >
          {hasValue ? formatPassValue(displayValue) : '0'}
        </p>
      </div>

      <div className="mx-4 mb-4 flex flex-col items-center gap-2.5 rounded-2xl bg-white px-4 pt-4 pb-3 text-slate-700">
        {uniquePassId ? (
          <QRCodeSVG value={uniquePassId} size={136} level="M" marginSize={0} title={`QR code for pass ${uniquePassId}`} />
        ) : (
          <div className="grid size-[136px] place-items-center rounded-lg border-2 border-dashed border-slate-300 text-center text-slate-500">
            <div className="grid justify-items-center gap-1.5 px-3">
              <QrCode className="size-7" aria-hidden />
              <span className="text-xs leading-snug">Pass ID is added when you create the pass</span>
            </div>
          </div>
        )}
        <p className="max-w-full text-center text-[0.7rem] font-medium break-all text-slate-500">
          {uniquePassId ?? 'Pass ID pending'}
        </p>
      </div>
    </article>
  )
}

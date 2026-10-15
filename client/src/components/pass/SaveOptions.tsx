import { Smartphone } from 'lucide-react'
import { AddToGoogleWalletButton } from './AddToGoogleWalletButton'

interface SaveOptionsProps {
  saveUrl: string
  /** PNG data URL of a QR that opens saveUrl (returned by POST /passes). */
  qrCodeDataUrl?: string
}

/** The two ways to get the pass onto a phone: tap the button, or scan from a computer. */
export function SaveOptions({ saveUrl, qrCodeDataUrl }: SaveOptionsProps) {
  return (
    <div className="grid gap-6 sm:grid-cols-[1fr_auto] sm:items-center">
      <div className="grid gap-2">
        <p className="text-sm text-muted-foreground">On your Android phone, tap the button and choose Save.</p>
        <AddToGoogleWalletButton saveUrl={saveUrl} className="-ml-2 justify-self-start" />
      </div>

      {qrCodeDataUrl && (
        <figure className="grid justify-items-start gap-2 sm:justify-items-center">
          <img
            src={qrCodeDataUrl}
            alt="QR code that opens the Add to Google Wallet link"
            width={148}
            height={148}
            className="size-[148px] rounded-xl border border-border bg-white p-2"
          />
          <figcaption className="flex max-w-[12rem] items-start gap-1.5 text-xs text-muted-foreground sm:text-center">
            <Smartphone className="mt-px size-3.5 shrink-0" aria-hidden />
            On a computer? Scan this with your phone's camera.
          </figcaption>
        </figure>
      )}
    </div>
  )
}

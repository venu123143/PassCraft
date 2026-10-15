import addToGoogleWalletBadge from '@/assets/add-to-google-wallet.svg'
import { cn } from '@/utils/cn'

interface AddToGoogleWalletButtonProps {
  saveUrl: string
  className?: string
}

/**
 * Official "Add to Google Wallet" button (unaltered asset from Google's
 * brand guidelines: black only, keep aspect ratio, at least 48dp tall,
 * 8dp clear space).
 */
export function AddToGoogleWalletButton({ saveUrl, className }: AddToGoogleWalletButtonProps) {
  return (
    <a
      href={saveUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={cn('inline-block rounded-full p-2 focus-visible:outline-offset-0', className)}
    >
      <img src={addToGoogleWalletBadge} alt="Add to Google Wallet" width={283} height={50} className="h-[50px] w-auto" />
    </a>
  )
}

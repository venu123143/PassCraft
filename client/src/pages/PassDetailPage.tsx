import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, Check, CircleCheck, RefreshCw, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, useParams } from 'react-router'
import { toast } from 'sonner'
import { AddToGoogleWalletButton } from '@/components/pass/AddToGoogleWalletButton'
import { PassCard } from '@/components/pass/PassCard'
import { PassStage } from '@/components/pass/PassStage'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { buttonVariants } from '@/components/ui/button-variants'
import { CopyButton } from '@/components/ui/copy-button'
import { FormField } from '@/components/ui/form-field'
import { Input } from '@/components/ui/input'
import { API_ENDPOINTS } from '@/api/endpoints'
import { API_BASE_URL } from '@/constants/config'
import { usePass, useUpdatePassValue } from '@/hooks/usePasses'
import { useRecentPasses } from '@/hooks/useRecentPasses'
import { ROUTES } from '@/routes/paths'
import { updatePassValueSchema, type UpdatePassValueFormValues } from '@/schemas/pass.schema'
import { ApiError } from '@/types/api.types'
import type { Pass } from '@/types/pass.types'
import { getErrorMessage } from '@/utils/errors'
import { formatDate, formatPassValue, formatTime } from '@/utils/format'

interface SentUpdate {
  value: number
  at: string
}

export function PassDetailPage() {
  const { passId = '' } = useParams()
  const passQuery = usePass(passId)

  if (passQuery.isPending) return <PassDetailSkeleton />

  if (passQuery.isError) {
    return passQuery.error instanceof ApiError && passQuery.error.isNotFound ? (
      <PassMissing passId={passId} />
    ) : (
      <div className="grid max-w-xl gap-6">
        <BackLink />
        <Alert title="This pass couldn't be loaded">{getErrorMessage(passQuery.error)}</Alert>
        <div>
          <Button variant="secondary" onClick={() => passQuery.refetch()} loading={passQuery.isFetching}>
            <RefreshCw aria-hidden />
            Try again
          </Button>
        </div>
      </div>
    )
  }

  return <PassUpdater pass={passQuery.data} />
}

function PassUpdater({ pass }: { pass: Pass }) {
  const updateValue = useUpdatePassValue(pass.id)
  const [sentUpdates, setSentUpdates] = useState<SentUpdate[]>([])
  const [syncKey, setSyncKey] = useState(0)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(updatePassValueSchema), mode: 'onTouched' })

  const onSubmit = ({ value }: UpdatePassValueFormValues) => {
    updateValue.mutate(value, {
      onSuccess: (updated) => {
        setSentUpdates((previous) => [{ value: updated.value, at: updated.updatedAt }, ...previous])
        setSyncKey((key) => key + 1)
        reset()
        toast.success('Update sent to Google Wallet', {
          description: `The pass now shows ${formatPassValue(updated.value)}. The phone picks it up within moments.`,
        })
      },
    })
  }

  const curlCommand = `curl -X POST ${API_BASE_URL}${API_ENDPOINTS.passes.updateValue(pass.id)} \\
  -H 'Content-Type: application/json' \\
  -d '{ "value": 55 }'`

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,27rem)] lg:gap-16">
      <div className="grid max-w-xl content-start gap-10">
        <div>
          <BackLink />
          <h1 className="mt-6 text-[2.5rem] leading-[1.05] font-semibold tracking-tight break-words sm:text-5xl">
            {pass.name}
          </h1>
          <p className="mt-4 max-w-[34rem] text-lg text-muted-foreground">
            {pass.label} is <span className="font-medium text-foreground tabular-nums">{formatPassValue(pass.value)}</span>.
            Send a new number and the pass already saved on the phone updates by itself.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-4">
          <div className="flex flex-wrap items-start gap-3">
            <FormField label="New number" required error={errors.value?.message} className="w-full sm:w-56">
              <Input
                type="number"
                inputMode="decimal"
                step="any"
                placeholder={String(pass.value)}
                className="tabular-nums"
                {...register('value', { valueAsNumber: true })}
              />
            </FormField>
            <Button type="submit" size="lg" loading={updateValue.isPending} className="sm:mt-7">
              {updateValue.isPending ? 'Sending update…' : 'Send update'}
            </Button>
          </div>
          {updateValue.isError && <Alert title="The update wasn't sent">{getErrorMessage(updateValue.error)}</Alert>}
        </form>

        {sentUpdates.length > 0 && (
          <section aria-labelledby="sent-updates" className="grid gap-3">
            <h2 id="sent-updates" className="text-lg font-semibold">
              Updates sent
            </h2>
            <ol className="grid divide-y divide-border border-y border-border text-sm">
              {sentUpdates.map((update, index) => (
                <li key={`${update.at}-${index}`} className="flex items-center gap-3 py-3">
                  <Check className="size-4 text-success" aria-hidden />
                  <span>
                    Changed to <span className="font-medium tabular-nums">{formatPassValue(update.value)}</span>
                  </span>
                  <time dateTime={update.at} className="ml-auto text-muted-foreground tabular-nums">
                    {formatTime(update.at)}
                  </time>
                </li>
              ))}
            </ol>
          </section>
        )}

        <section aria-labelledby="pass-details" className="grid gap-5">
          <h2 id="pass-details" className="text-lg font-semibold">
            Pass details
          </h2>
          <dl className="grid gap-4 text-sm">
            <DetailRow term="Pass ID (in the QR code)" value={pass.uniquePassId} copySubject="pass ID" />
            <DetailRow term="API id (used in the update URL)" value={pass.id} copySubject="API id" />
            <div className="grid gap-1">
              <dt className="text-muted-foreground">Created</dt>
              <dd>{formatDate(pass.createdAt)}</dd>
            </div>
          </dl>
          <div className="grid gap-2">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">Or send the update from a terminal:</p>
              <CopyButton value={curlCommand} subject="command" />
            </div>
            <pre className="overflow-x-auto rounded-xl bg-stage p-4 text-[0.8rem] leading-relaxed">
              <code>{curlCommand}</code>
            </pre>
          </div>
        </section>
      </div>

      <PassStage
        caption={
          sentUpdates.length > 0 ? (
            <span className="flex items-center gap-1.5 text-success" aria-live="polite">
              <CircleCheck className="size-4" aria-hidden />
              Sent to Google Wallet at {formatTime(sentUpdates[0].at)}
            </span>
          ) : (
            <span aria-live="polite">How the pass looks in Google Wallet</span>
          )
        }
        footer={
          pass.saveUrl && (
            <div className="grid justify-items-center gap-1 text-center">
              <p className="text-sm text-muted-foreground">Not on the phone yet?</p>
              <AddToGoogleWalletButton saveUrl={pass.saveUrl} />
            </div>
          )
        }
      >
        <PassCard
          name={pass.name}
          label={pass.label}
          value={pass.value}
          uniquePassId={pass.uniquePassId}
          syncKey={syncKey}
        />
      </PassStage>
    </div>
  )
}

function DetailRow({ term, value, copySubject }: { term: string; value: string; copySubject: string }) {
  return (
    <div className="grid gap-1.5">
      <dt className="text-muted-foreground">{term}</dt>
      <dd className="flex flex-wrap items-center gap-3">
        <code className="font-medium break-all">{value}</code>
        <CopyButton value={value} subject={copySubject} />
      </dd>
    </div>
  )
}

function BackLink() {
  return (
    <Link to={ROUTES.passes} className={buttonVariants({ variant: 'link', className: 'w-fit gap-1.5 text-sm' })}>
      <ArrowLeft aria-hidden />
      My passes
    </Link>
  )
}

function PassMissing({ passId }: { passId: string }) {
  const navigate = useNavigate()
  const { passes, remove } = useRecentPasses()
  const isSaved = passes.some((pass) => pass.id === passId)

  return (
    <div className="grid max-w-xl gap-6">
      <BackLink />
      <h1 className="text-4xl font-semibold tracking-tight">This pass isn't on the server</h1>
      <p className="text-lg text-muted-foreground">
        No pass has the id <code className="break-all text-foreground">{passId}</code>. The demo server starts with
        an empty database after each redeploy, so older passes can't be updated. Copies already saved in Google
        Wallet stay on the phone.
      </p>
      <div className="flex flex-wrap gap-3">
        <Link to={ROUTES.createPass} className={buttonVariants({ size: 'lg' })}>
          Issue a new pass
        </Link>
        {isSaved && (
          <Button
            variant="secondary"
            size="lg"
            onClick={() => {
              remove(passId)
              navigate(ROUTES.passes)
            }}
          >
            <Trash2 aria-hidden />
            Remove from My passes
          </Button>
        )}
      </div>
    </div>
  )
}

function PassDetailSkeleton() {
  return (
    <div
      className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,27rem)] lg:gap-16"
      aria-busy="true"
      aria-label="Loading pass"
    >
      <div className="grid max-w-xl content-start gap-5">
        <div className="h-5 w-28 animate-pulse rounded bg-muted" />
        <div className="h-12 w-3/4 animate-pulse rounded-lg bg-muted" />
        <div className="h-6 w-full animate-pulse rounded bg-muted" />
        <div className="mt-6 h-12 w-56 animate-pulse rounded-xl bg-muted" />
      </div>
      <div className="flex justify-center rounded-[1.75rem] bg-stage px-4 py-8">
        <div className="h-[30rem] w-full max-w-[22rem] animate-pulse rounded-pass bg-muted" />
      </div>
    </div>
  )
}

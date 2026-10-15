import { zodResolver } from '@hookform/resolvers/zod'
import { CircleCheck, RotateCcw } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { Link } from 'react-router'
import { toast } from 'sonner'
import { PassCard } from '@/components/pass/PassCard'
import { PassStage } from '@/components/pass/PassStage'
import { SaveOptions } from '@/components/pass/SaveOptions'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { buttonVariants } from '@/components/ui/button-variants'
import { CopyButton } from '@/components/ui/copy-button'
import { FormField } from '@/components/ui/form-field'
import { Input } from '@/components/ui/input'
import { PASS_RULES } from '@/constants/pass-rules'
import { useCreatePass } from '@/hooks/usePasses'
import { buildPassDetailPath } from '@/routes/paths'
import { createPassSchema, type CreatePassFormValues } from '@/schemas/pass.schema'
import type { CreatePassResponse } from '@/types/pass.types'
import { getErrorMessage } from '@/utils/errors'

export function CreatePassPage() {
  const [created, setCreated] = useState<CreatePassResponse | null>(null)
  const createPass = useCreatePass()

  const form = useForm({
    resolver: zodResolver(createPassSchema),
    mode: 'onTouched',
    defaultValues: { name: '', label: '' },
  })
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = form
  const [name = '', label = '', value] = useWatch({ control, name: ['name', 'label', 'value'] })

  const onSubmit = (values: CreatePassFormValues) => {
    createPass.mutate(values, {
      onSuccess: (pass) => {
        setCreated(pass)
        toast.success('Pass created', { description: 'Add it to Google Wallet with the button on this page.' })
      },
    })
  }

  const startOver = () => {
    setCreated(null)
    createPass.reset()
    reset()
  }

  const preview = created ?? { name, label, value: typeof value === 'number' ? value : Number.NaN }

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,27rem)] lg:gap-16">
      <div className="max-w-xl">
        {created ? (
          <PassIssued pass={created} onStartOver={startOver} />
        ) : (
          <>
            <h1 className="text-[2.5rem] leading-[1.05] font-semibold tracking-tight sm:text-5xl">Issue a pass</h1>
            <p className="mt-4 max-w-[34rem] text-lg text-muted-foreground">
              Fill in the details. The card shows exactly what will appear in Google Wallet, and you can change the
              number later without re-adding the pass.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-10 grid gap-6">
              <FormField label="Name" required error={errors.name?.message}>
                <Input
                  autoComplete="name"
                  placeholder="Venu Reddy"
                  maxLength={PASS_RULES.name.max}
                  {...register('name')}
                />
              </FormField>

              <div className="grid gap-6 sm:grid-cols-[minmax(0,1fr)_minmax(0,11rem)]">
                <FormField
                  label="Label"
                  required
                  hint="Shown above the number, like Balance or Points."
                  error={errors.label?.message}
                >
                  <Input placeholder="Balance" maxLength={PASS_RULES.label.max} {...register('label')} />
                </FormField>

                <FormField label="Number" required error={errors.value?.message}>
                  <Input
                    type="number"
                    inputMode="decimal"
                    step="any"
                    placeholder="40"
                    className="tabular-nums"
                    {...register('value', { valueAsNumber: true })}
                  />
                </FormField>
              </div>

              {createPass.isError && (
                <Alert title="The pass wasn't created">{getErrorMessage(createPass.error)}</Alert>
              )}

              <div>
                <Button type="submit" size="lg" loading={createPass.isPending}>
                  {createPass.isPending ? 'Creating pass…' : 'Create pass'}
                </Button>
              </div>
            </form>
          </>
        )}
      </div>

      <PassStage
        caption={
          created ? (
            <span className="flex items-center gap-1.5 text-success">
              <CircleCheck className="size-4" aria-hidden />
              Issued to Google Wallet
            </span>
          ) : (
            'Preview of the pass in Google Wallet'
          )
        }
      >
        <PassCard
          name={preview.name}
          label={preview.label}
          value={preview.value}
          uniquePassId={created?.uniquePassId}
        />
      </PassStage>
    </div>
  )
}

function PassIssued({ pass, onStartOver }: { pass: CreatePassResponse; onStartOver: () => void }) {
  const headingRef = useRef<HTMLHeadingElement>(null)

  // Move focus to the result so keyboard and screen-reader users land on it.
  useEffect(() => {
    headingRef.current?.focus()
  }, [])

  return (
    <div className="grid animate-pop-in gap-10">
      <div>
        <h1
          ref={headingRef}
          tabIndex={-1}
          className="text-[2.5rem] leading-[1.05] font-semibold tracking-tight outline-none sm:text-5xl"
        >
          Your pass is ready
        </h1>
        <p className="mt-4 max-w-[34rem] text-lg text-muted-foreground">
          Add it to Google Wallet. Then open the update page, change the number, and watch it change on the phone.
        </p>
      </div>

      <SaveOptions saveUrl={pass.saveUrl} qrCodeDataUrl={pass.qrCodeDataUrl} />

      <dl className="grid gap-4 border-y border-border py-5 text-sm">
        <div className="grid gap-1.5">
          <dt className="text-muted-foreground">Pass ID (in the QR code)</dt>
          <dd className="flex flex-wrap items-center gap-3">
            <code className="font-medium break-all text-foreground">{pass.uniquePassId}</code>
            <CopyButton value={pass.uniquePassId} subject="pass ID" />
          </dd>
        </div>
      </dl>

      <div className="flex flex-wrap gap-3">
        <Link to={buildPassDetailPath(pass.id)} className={buttonVariants({ size: 'lg' })}>
          Update the number
        </Link>
        <Button variant="secondary" size="lg" onClick={onStartOver}>
          <RotateCcw aria-hidden />
          Issue another pass
        </Button>
      </div>
    </div>
  )
}

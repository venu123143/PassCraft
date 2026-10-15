import { zodResolver } from '@hookform/resolvers/zod'
import { ChevronRight, X } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router'
import { Button } from '@/components/ui/button'
import { buttonVariants } from '@/components/ui/button-variants'
import { FormField } from '@/components/ui/form-field'
import { Input } from '@/components/ui/input'
import { useRecentPasses } from '@/hooks/useRecentPasses'
import { buildPassDetailPath, ROUTES } from '@/routes/paths'
import { openPassSchema, type OpenPassFormValues } from '@/schemas/pass.schema'
import { formatDate, formatPassValue } from '@/utils/format'

export function PassesPage() {
  const { passes, remove } = useRecentPasses()

  return (
    <div className="grid max-w-3xl gap-12">
      <div>
        <h1 className="text-[2.5rem] leading-[1.05] font-semibold tracking-tight sm:text-5xl">My passes</h1>
        <p className="mt-4 max-w-[34rem] text-lg text-muted-foreground">
          Passes issued from this browser. Open one to change its number.
        </p>
      </div>

      {passes.length === 0 ? (
        <div className="grid justify-items-start gap-4 border-y border-border py-8">
          <p className="text-lg font-medium">No passes yet</p>
          <p className="max-w-md text-muted-foreground">
            Issue your first pass, add it to Google Wallet, then come back here to update it.
          </p>
          <Link to={ROUTES.createPass} className={buttonVariants()}>
            Issue a pass
          </Link>
        </div>
      ) : (
        <ul className="grid divide-y divide-border border-y border-border">
          {passes.map((pass) => (
            <li key={pass.id} className="group flex items-center gap-2">
              <Link
                to={buildPassDetailPath(pass.id)}
                className="flex min-w-0 flex-1 items-center gap-4 rounded-xl py-4 pr-2 hover:bg-muted/60 sm:px-2"
              >
                <span aria-hidden className="grid h-10 w-14 shrink-0 place-items-end rounded-lg bg-pass p-1.5">
                  <span className="size-3 rounded-[3px] bg-white" />
                </span>
                <span className="grid min-w-0 flex-1 gap-0.5">
                  <span className="truncate font-medium">{pass.name}</span>
                  <span className="truncate text-sm text-muted-foreground">
                    {pass.label}: <span className="tabular-nums">{formatPassValue(pass.value)}</span>
                    <span className="hidden sm:inline">, created {formatDate(pass.createdAt)}</span>
                  </span>
                </span>
                <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => remove(pass.id)}
                aria-label={`Remove ${pass.name} from this list`}
                title="Remove from this list"
                className="text-muted-foreground"
              >
                <X aria-hidden />
              </Button>
            </li>
          ))}
        </ul>
      )}

      <OpenPassById />
    </div>
  )
}

function OpenPassById() {
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(openPassSchema), mode: 'onTouched', defaultValues: { passId: '' } })

  const onSubmit = ({ passId }: OpenPassFormValues) => navigate(buildPassDetailPath(passId))

  return (
    <section aria-labelledby="open-by-id" className="grid gap-4">
      <div>
        <h2 id="open-by-id" className="text-lg font-semibold">
          Open a pass by id
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          For passes created somewhere else, like Swagger or curl. Use the API id from the create response.
        </p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-wrap items-start gap-3">
        <FormField label="API id" required error={errors.passId?.message} className="w-full sm:w-[26rem]">
          <Input
            placeholder="3f0c6f4e-5b8a-4d55-9a57-2f1f0f7b9c11"
            autoComplete="off"
            spellCheck={false}
            {...register('passId')}
          />
        </FormField>
        <Button type="submit" variant="secondary" size="lg" className="sm:mt-7">
          Open pass
        </Button>
      </form>
    </section>
  )
}

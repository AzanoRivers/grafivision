import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const schema = z.object({ email: z.string().email('Email inválido') })
type FormData = z.infer<typeof schema>

interface SubscribeFormProps {
  placeholder?: string
  buttonLabel?: string
}

export function SubscribeForm({
  placeholder = 'tu@email.com',
  buttonLabel = 'Suscribirme',
}: SubscribeFormProps) {
  const [done, setDone] = useState(false)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (_data: FormData) => {
    await new Promise((r) => setTimeout(r, 600))
    setDone(true)
  }

  if (done) {
    return (
      <p className="text-sm font-medium" style={{ color: 'var(--color-state-success)' }}>
        ✓ ¡Suscrito! Te mantendremos al tanto.
      </p>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-2 sm:flex-row">
      <div className="flex-1">
        <input
          {...register('email')}
          type="email"
          placeholder={placeholder}
          autoComplete="email"
          className="w-full rounded-lg border px-4 py-2.5 text-base bg-transparent text-white placeholder-white/50 outline-none transition-colors focus:border-white"
          style={{ borderColor: errors.email ? 'var(--color-state-error)' : 'rgba(255,255,255,0.35)' }}
        />
        {errors.email && (
          <p className="mt-1 text-xs" style={{ color: 'var(--color-state-error)' }}>{errors.email.message}</p>
        )}
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="shrink-0 rounded-lg px-6 py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95 disabled:opacity-60"
        style={{ backgroundColor: 'var(--color-brand-red)' }}
      >
        {isSubmitting ? '…' : buttonLabel}
      </button>
    </form>
  )
}

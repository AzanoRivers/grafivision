import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState } from 'react'

const schema = z.object({
  name:    z.string().min(2, 'Mínimo 2 caracteres'),
  email:   z.string().email('Email inválido'),
  phone:   z.string().optional(),
  subject: z.string().min(3, 'Mínimo 3 caracteres'),
  message: z.string().min(10, 'Mínimo 10 caracteres'),
})

type FormData = z.infer<typeof schema>

type Status = 'idle' | 'sending' | 'success' | 'error'

export function ContactForm() {
  const [status, setStatus] = useState<Status>('idle')

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    setStatus('sending')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (res.ok) {
        setStatus('success')
        reset()
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  const inputClass =
    'w-full rounded-lg border px-4 py-2.5 text-base bg-transparent text-text-primary placeholder-text-muted outline-none transition-colors focus:border-brand-red'
  const errorClass = 'mt-1 text-xs text-state-error'

  const borderStyle = (hasError: boolean) => ({
    borderColor: hasError ? 'var(--color-state-error)' : 'var(--color-surface-border)',
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
      {/* Row: name + email */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <input
            {...register('name')}
            placeholder="Nombre completo *"
            className={inputClass}
            style={borderStyle(!!errors.name)}
            autoComplete="name"
          />
          {errors.name && <p className={errorClass}>{errors.name.message}</p>}
        </div>
        <div>
          <input
            {...register('email')}
            type="email"
            placeholder="Email *"
            className={inputClass}
            style={borderStyle(!!errors.email)}
            autoComplete="email"
          />
          {errors.email && <p className={errorClass}>{errors.email.message}</p>}
        </div>
      </div>

      {/* Row: phone + subject */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <input
            {...register('phone')}
            type="tel"
            placeholder="Teléfono (opcional)"
            className={inputClass}
            style={borderStyle(false)}
            autoComplete="tel"
          />
        </div>
        <div>
          <input
            {...register('subject')}
            placeholder="Asunto *"
            className={inputClass}
            style={borderStyle(!!errors.subject)}
          />
          {errors.subject && <p className={errorClass}>{errors.subject.message}</p>}
        </div>
      </div>

      {/* Message */}
      <div>
        <textarea
          {...register('message')}
          rows={5}
          placeholder="¿En qué podemos ayudarte? *"
          className={[inputClass, 'resize-none'].join(' ')}
          style={borderStyle(!!errors.message)}
        />
        {errors.message && <p className={errorClass}>{errors.message.message}</p>}
      </div>

      {/* Status messages */}
      {status === 'success' && (
        <p className="rounded-lg border p-3 text-sm text-state-success" style={{ borderColor: 'var(--color-state-success)', backgroundColor: 'rgba(34,197,94,0.08)' }}>
          ✓ Mensaje enviado. Te contactamos pronto.
        </p>
      )}
      {status === 'error' && (
        <p className="rounded-lg border p-3 text-sm text-state-error" style={{ borderColor: 'var(--color-state-error)', backgroundColor: 'rgba(239,68,68,0.08)' }}>
          ✕ Error al enviar. Intenta de nuevo o escríbenos directamente.
        </p>
      )}

      <button
        type="submit"
        disabled={status === 'sending'}
        className="flex items-center justify-center gap-2 rounded-lg px-8 py-3 text-sm font-semibold text-white transition-all active:scale-95 disabled:opacity-60"
        style={{ backgroundColor: 'var(--color-brand-red)' }}
      >
        {status === 'sending' ? (
          <>
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Enviando…
          </>
        ) : 'Enviar mensaje'}
      </button>
    </form>
  )
}

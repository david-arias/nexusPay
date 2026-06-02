'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { register, loginWithGoogle } from '@/app/auth/actions'
import { cn } from '@/lib/utils'

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isPending, startTransition] = useTransition()

  async function handleRegister(formData: FormData) {
    setError(null)
    const password = formData.get('password') as string
    const confirm = formData.get('confirm_password') as string

    if (password !== confirm) {
      setError('Las contraseñas no coinciden.')
      return
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.')
      return
    }

    startTransition(async () => {
      const result = await register(formData)
      if (result?.error) setError(result.error)
    })
  }

  if (success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
           style={{ background: 'linear-gradient(160deg, #EFF6FF 0%, #F9F9FF 60%)' }}>
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <span className="text-3xl">✉️</span>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">¡Revisa tu correo!</h2>
        <p className="text-gray-500 text-sm">
          Te enviamos un enlace de confirmación a tu email.
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(160deg, #EFF6FF 0%, #F9F9FF 60%)' }}>
      <div className="flex-1 flex flex-col justify-center px-6 py-12">

        {/* Brand */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-600 mb-6">NexusPay</h1>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Crear cuenta</h2>
          <p className="text-gray-500 text-sm">
            Empieza a controlar tus finanzas hoy.
          </p>
        </div>

        <form action={handleRegister} className="flex flex-col gap-4">

          {/* Full name */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="full_name" className="text-[11px] font-semibold uppercase tracking-widest text-gray-500">
              Nombre completo
            </label>
            <input
              id="full_name"
              name="full_name"
              type="text"
              required
              autoComplete="name"
              placeholder="Juan Pérez"
              className="w-full h-14 px-4 rounded-2xl bg-white border border-gray-200
                         text-gray-900 placeholder-gray-400 text-[15px]
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         transition-all duration-150"
            />
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-[11px] font-semibold uppercase tracking-widest text-gray-500">
              Correo Electrónico
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="nombre@ejemplo.com"
              className="w-full h-14 px-4 rounded-2xl bg-white border border-gray-200
                         text-gray-900 placeholder-gray-400 text-[15px]
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         transition-all duration-150"
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-[11px] font-semibold uppercase tracking-widest text-gray-500">
              Contraseña
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="new-password"
                placeholder="Mínimo 6 caracteres"
                className="w-full h-14 px-4 pr-12 rounded-2xl bg-white border border-gray-200
                           text-gray-900 placeholder-gray-400 text-[15px]
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           transition-all duration-150"
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400
                           hover:text-gray-600 transition-colors tap-none"
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Confirm password */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="confirm_password" className="text-[11px] font-semibold uppercase tracking-widest text-gray-500">
              Confirmar contraseña
            </label>
            <input
              id="confirm_password"
              name="confirm_password"
              type={showPassword ? 'text' : 'password'}
              required
              autoComplete="new-password"
              placeholder="Repite tu contraseña"
              className="w-full h-14 px-4 rounded-2xl bg-white border border-gray-200
                         text-gray-900 placeholder-gray-400 text-[15px]
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         transition-all duration-150"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isPending}
            className={cn(
              'w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[15px]',
              'rounded-2xl transition-all duration-150 flex items-center justify-center gap-2',
              'disabled:opacity-60 disabled:cursor-not-allowed tap-none mt-1'
            )}
          >
            {isPending ? <Loader2 size={20} className="animate-spin" /> : null}
            Crear Cuenta
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
            O continúa con
          </span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* Google */}
        <button
          type="button"
          onClick={() => {
            startTransition(async () => {
              const result = await loginWithGoogle()
              if (result?.error) setError(result.error)
            })
          }}
          disabled={isPending}
          className="w-full h-14 bg-white border border-gray-200 hover:bg-gray-50
                     rounded-2xl flex items-center justify-center gap-3
                     text-gray-700 font-semibold text-[15px]
                     transition-colors duration-150 tap-none disabled:opacity-60"
        >
          <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          Google
        </button>

        <p className="text-center text-sm text-gray-500 mt-6">
          ¿Ya tienes cuenta?{' '}
          <Link href="/auth/login" className="font-semibold text-blue-600 hover:underline">
            Iniciar sesión
          </Link>
        </p>
      </div>
    </div>
  )
}

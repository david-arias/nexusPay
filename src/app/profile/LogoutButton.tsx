'use client'

import { useTransition } from 'react'
import { LogOut, Loader2 } from 'lucide-react'
import { logout } from '@/app/auth/actions'

export function LogoutButton() {
  const [isPending, startTransition] = useTransition()

  return (
    <button
      onClick={() => startTransition(() => logout())}
      disabled={isPending}
      className="w-full h-14 bg-red-50 hover:bg-red-100 border border-red-200
                 text-red-600 font-bold text-[15px] rounded-2xl
                 flex items-center justify-center gap-2
                 transition-colors duration-150 tap-none disabled:opacity-60"
    >
      {isPending
        ? <Loader2 size={18} className="animate-spin" />
        : <LogOut size={18} />
      }
      Cerrar Sesión
    </button>
  )
}

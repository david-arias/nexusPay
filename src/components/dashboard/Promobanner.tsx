import { Bell } from 'lucide-react'
import Link from 'next/link'

/**
 * CTA banner prompting users to set up automatic reminders.
 * Shown on dashboard when reminders aren't configured.
 */
export function PromoBanner() {
  return (
    <div className="mx-4 bg-primary-600 rounded-2xl p-5 flex items-center gap-4 overflow-hidden relative">
      {/* Background decoration */}
      <Bell
        size={80}
        className="absolute -right-4 -bottom-4 text-white/10"
        strokeWidth={1}
      />

      <div className="flex-1 z-10">
        <p className="text-white font-semibold text-[15px] leading-snug mb-1">
          Ahorra tiempo
        </p>
        <p className="text-blue-100 text-xs leading-snug">
          Configura recordatorios automáticos y olvídate de los recargos por mora.
        </p>
      </div>

      <Link
        href="/settings/reminders"
        className="flex-shrink-0 bg-white/20 hover:bg-white/30 text-white
                   text-xs font-semibold px-4 py-2 rounded-full
                   transition-colors duration-150 tap-none z-10 whitespace-nowrap"
      >
        CONFIGURAR
      </Link>
    </div>
  )
}

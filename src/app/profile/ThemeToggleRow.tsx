'use client'

import { Sun, Moon } from 'lucide-react'
import { useTheme } from '@/components/layout/ThemeProvider'

export function ThemeToggleRow() {
  const { theme, toggle } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      onClick={toggle}
      className="flex items-center gap-3 px-4 py-4 w-full hover:bg-[var(--surface)] transition-colors tap-none"
    >
      <span className="text-[var(--text-secondary)]">
        {isDark ? <Moon size={18} /> : <Sun size={18} />}
      </span>
      <span className="flex-1 text-[15px] text-[var(--text-primary)] text-left">
        {isDark ? 'Modo Oscuro' : 'Modo Claro'}
      </span>
      {/* Visual toggle pill */}
      <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isDark ? 'bg-blue-600' : 'bg-gray-300'}`}>
        <span className={`inline-block h-[18px] w-[18px] transform rounded-full bg-white shadow-md transition-transform ${isDark ? 'translate-x-[22px]' : 'translate-x-[3px]'}`} />
      </div>
    </button>
  )
}

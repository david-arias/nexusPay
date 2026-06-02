'use client'

import { cn } from '@/lib/utils'

interface ToggleProps {
  checked: boolean
  onChange: (v: boolean) => void
  label?: string
  description?: string
}

/**
 * Standard iOS-style toggle switch.
 * Uses items-center + inline-block thumb for perfect vertical alignment.
 */
export function Toggle({ checked, onChange, label, description }: ToggleProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      {(label || description) && (
        <div>
          {label && <p className="text-[15px] font-semibold text-[var(--text-primary)]">{label}</p>}
          {description && <p className="text-xs text-[var(--text-secondary)] mt-0.5">{description}</p>}
        </div>
      )}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full',
          'transition-colors duration-200 focus:outline-none tap-none',
          checked ? 'bg-blue-600' : 'bg-[var(--divider)]'
        )}
      >
        <span
          className={cn(
            'inline-block h-[18px] w-[18px] transform rounded-full bg-white shadow-md',
            'transition-transform duration-200',
            checked ? 'translate-x-[22px]' : 'translate-x-[3px]'
          )}
        />
      </button>
    </div>
  )
}

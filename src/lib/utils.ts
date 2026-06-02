import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { differenceInDays, parseISO } from 'date-fns'
import type { PaymentStatus } from '@/types'

/** Merge Tailwind classes safely */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Format amount as currency string */
export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount)
}

/** Days until due date (negative = overdue) */
export function daysUntilDue(dueDateISO: string): number {
  return differenceInDays(parseISO(dueDateISO), new Date())
}

/** Derive status label and color classes for a payment entry */
export function getStatusConfig(status: PaymentStatus, daysUntil?: number) {
  if (status === 'paid') {
    return {
      label: 'Pagado',
      dotColor: 'bg-success',
      textColor: 'text-success-text',
      bgColor: 'bg-success-bg',
    }
  }
  if (status === 'overdue' || (daysUntil !== undefined && daysUntil < 0)) {
    return {
      label: 'Vencido',
      dotColor: 'bg-danger',
      textColor: 'text-danger-text',
      bgColor: 'bg-danger-bg',
    }
  }
  if (daysUntil === 0) {
    return {
      label: 'Vence hoy',
      dotColor: 'bg-warning',
      textColor: 'text-warning-text',
      bgColor: 'bg-warning-bg',
    }
  }
  if (daysUntil !== undefined && daysUntil <= 3) {
    return {
      label: `Vence en ${daysUntil} día${daysUntil !== 1 ? 's' : ''}`,
      dotColor: 'bg-warning',
      textColor: 'text-warning-text',
      bgColor: 'bg-warning-bg',
    }
  }
  return {
    label: daysUntil !== undefined ? `Vence en ${daysUntil} días` : 'Pendiente',
    dotColor: 'bg-primary-500',
    textColor: 'text-primary-600',
    bgColor: 'bg-primary-50',
  }
}

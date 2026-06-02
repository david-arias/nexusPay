import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { differenceInDays, parseISO } from 'date-fns'
import type { PaymentStatus } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function daysUntilDue(dueDateISO: string): number {
  return differenceInDays(parseISO(dueDateISO), new Date())
}

export function getStatusConfig(status: PaymentStatus, daysUntil?: number) {
  if (status === 'paid') {
    return { label: 'Pagado',    dotColor: 'bg-green-500',  textColor: 'text-green-600' }
  }
  if (status === 'overdue' || (daysUntil !== undefined && daysUntil < 0)) {
    return { label: 'Vencido',   dotColor: 'bg-red-500',    textColor: 'text-red-600'   }
  }
  if (daysUntil === 0) {
    return { label: 'Vence hoy', dotColor: 'bg-amber-500',  textColor: 'text-amber-600' }
  }
  if (daysUntil !== undefined && daysUntil <= 3) {
    return {
      label: `Vence en ${daysUntil} día${daysUntil !== 1 ? 's' : ''}`,
      dotColor: 'bg-amber-500', textColor: 'text-amber-600',
    }
  }
  return {
    label: daysUntil !== undefined ? `Vence en ${daysUntil} días` : 'Pendiente',
    dotColor: 'bg-blue-500', textColor: 'text-blue-600',
  }
}

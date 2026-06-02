'use client'

import { useState, useTransition } from 'react'
import { Bell } from 'lucide-react'
import Link from 'next/link'
import { BottomNav } from '@/components/layout/BottomNav'
import { SummaryCard } from '@/components/dashboard/SummaryCard'
import { PaymentItem } from '@/components/dashboard/PaymentItem'
import { PromoBanner } from '@/components/dashboard/Promobanner'
import { PaidConfirmModal } from '@/components/dashboard/PaidConfirmModal'
import { togglePaymentPaid } from './actions'
import type { DashboardSummary, UpcomingPayment } from '@/types'

interface DashboardClientProps {
  initialEntries: UpcomingPayment[]
  summary: DashboardSummary
  monthLabel: string
  userName: string
  userInitials: string
}

export function DashboardClient({
  initialEntries, summary, monthLabel, userName, userInitials,
}: DashboardClientProps) {
  const [entries, setEntries]               = useState(initialEntries)
  const [isPending, startTransition]        = useTransition()
  const [pendingEntry, setPendingEntry]     = useState<UpcomingPayment | null>(null) // modal target

  // Called when user taps the check button
  function handleTogglePaid(id: string) {
    const entry = entries.find(e => e.id === id)
    if (!entry) return

    if (entry.status === 'paid') {
      // Undo — no modal needed
      doToggle(entry, true)
    } else {
      // Open confirmation modal
      setPendingEntry(entry)
    }
  }

  // Confirm from modal
  function handleConfirmPaid(opts: { paidAt: string; amountPaid: number; method: string }) {
    if (!pendingEntry) return
    doToggle(pendingEntry, false, opts)
    setPendingEntry(null)
  }

  function doToggle(entry: UpcomingPayment, currentlyPaid: boolean, opts?: any) {
    // Optimistic update
    setEntries(prev => prev.map(e =>
      e.id === entry.id
        ? { ...e, status: currentlyPaid ? 'pending' : 'paid', paid_at: currentlyPaid ? null : new Date().toISOString() }
        : e
    ))

    startTransition(async () => {
      const result = await togglePaymentPaid(entry.id, currentlyPaid, opts)
      if (result?.error) {
        // Revert
        setEntries(prev => prev.map(e => e.id === entry.id ? { ...e, ...entry } : e))
      }
    })
  }

  const liveSummary: DashboardSummary = {
    ...summary,
    total_paid:    entries.filter(e => e.status === 'paid').reduce((s, e) => s + (e.payment?.amount ?? 0), 0),
    total_pending: entries.filter(e => e.status !== 'paid').reduce((s, e) => s + (e.payment?.amount ?? 0), 0),
  }

  const hasUrgent = entries.some(e => e.status === 'overdue' || e.days_until_due === 0)

  return (
    <div className="flex flex-col min-h-screen pb-24" style={{ backgroundColor: '#F9F9FF' }}>

      {/* Header */}
      <header className="flex items-center justify-between px-4 pt-12 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center
                          text-white font-bold text-sm flex-shrink-0">
            {userInitials}
          </div>
          <div>
            <p className="text-xs text-gray-500">Hola, {userName}</p>
            <h1 className="text-lg font-bold text-gray-900 leading-tight">Mis Pagos</h1>
          </div>
        </div>
        <Link href="/notifications"
          className="relative w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors tap-none"
          aria-label="Notificaciones">
          <Bell size={22} className="text-gray-700" />
          {hasUrgent && (
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
          )}
        </Link>
      </header>

      {/* Summary */}
      <SummaryCard summary={liveSummary} month={monthLabel} />

      {/* Payments list */}
      <section className="px-4 mt-6" aria-labelledby="upcoming-heading">
        <div className="flex items-center justify-between mb-3">
          <h2 id="upcoming-heading" className="text-base font-bold text-gray-900">Próximos Pagos</h2>
          <Link href="/payments" className="text-sm font-medium text-blue-600 tap-none">Ver todo</Link>
        </div>

        {entries.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-sm">Sin pagos este mes.</p>
            <Link href="/add" className="mt-3 inline-block text-sm font-semibold text-blue-600">+ Añadir pago</Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {entries.map(entry => (
              <PaymentItem key={entry.id} entry={entry} onTogglePaid={handleTogglePaid} />
            ))}
          </div>
        )}
      </section>

      {/* Promo */}
      <div className="mt-6">
        <PromoBanner />
      </div>

      {/* Paid confirmation modal */}
      {pendingEntry && (
        <PaidConfirmModal
          entry={pendingEntry}
          onConfirm={handleConfirmPaid}
          onCancel={() => setPendingEntry(null)}
          isPending={isPending}
        />
      )}

      <BottomNav />
    </div>
  )
}

'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Undo2, Loader2 } from 'lucide-react'
import { PaidConfirmModal } from '@/components/dashboard/PaidConfirmModal'
import { cn } from '@/lib/utils'
import type { UpcomingPayment } from '@/types'

interface Props {
  entry: any
  payment: any
}

export function PaymentDetailActions({ entry, payment }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [showModal, setShowModal]    = useState(false)
  const isPaid = entry.status === 'paid'

  // Build a minimal UpcomingPayment-shaped object for the modal
  const modalEntry: UpcomingPayment = {
    ...entry,
    days_until_due: 0,
    payment: { ...payment },
  }

  function handleConfirmPaid(opts: { paidAt: string; amountPaid: number; method: string }) {
    setShowModal(false)
    startTransition(async () => {
      const { createClient } = await import('@/lib/supabase/client')
      await createClient()
        .from('payment_entries')
        .update({
          status: 'paid',
          paid_at: opts.paidAt,
          paid_by: null, // server would set this; acceptable for client update
          amount_paid: opts.amountPaid,
          payment_method: opts.method,
        })
        .eq('id', entry.id)
      router.refresh()
    })
  }

  function handleUnpaid() {
    startTransition(async () => {
      const { createClient } = await import('@/lib/supabase/client')
      await createClient()
        .from('payment_entries')
        .update({ status: 'pending', paid_at: null, paid_by: null, amount_paid: null, payment_method: null })
        .eq('id', entry.id)
      router.refresh()
    })
  }

  return (
    <>
      {!isPaid ? (
        <button
          onClick={() => setShowModal(true)}
          disabled={isPending}
          className={cn(
            'w-full h-14 bg-green-500 hover:bg-green-600 text-white font-bold text-[15px]',
            'rounded-2xl flex items-center justify-center gap-2 transition-colors tap-none',
            'disabled:opacity-60'
          )}
        >
          {isPending ? <Loader2 size={20} className="animate-spin" /> : <Check size={20} strokeWidth={2.5} />}
          Marcar como pagado
        </button>
      ) : (
        <button
          onClick={handleUnpaid}
          disabled={isPending}
          className={cn(
            'w-full h-14 bg-gray-100 hover:bg-gray-200 text-gray-600 font-semibold text-[15px]',
            'rounded-2xl flex items-center justify-center gap-2 transition-colors tap-none',
            'disabled:opacity-60'
          )}
        >
          {isPending ? <Loader2 size={20} className="animate-spin" /> : <Undo2 size={20} />}
          Desmarcar como pagado
        </button>
      )}

      {showModal && (
        <PaidConfirmModal
          entry={modalEntry}
          onConfirm={handleConfirmPaid}
          onCancel={() => setShowModal(false)}
          isPending={isPending}
        />
      )}
    </>
  )
}

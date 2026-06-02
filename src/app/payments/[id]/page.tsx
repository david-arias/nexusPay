import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Calendar, Tag, Repeat, CreditCard, Pencil } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { BottomNav } from '@/components/layout/BottomNav'
import { CategoryIcon } from '@/components/ui/CategoryIcon'
import { formatByCurrency } from '@/lib/exchange-rate'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { cn } from '@/lib/utils'

export default async function PaymentDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: entry } = await supabase
    .from('payment_entries')
    .select('*, payment:payments(*, category:categories(*), space:spaces(name))')
    .eq('id', params.id)
    .single()

  if (!entry) notFound()

  const payment = entry.payment
  const cat = payment?.category
  const isPaid = entry.status === 'paid'

  return (
    <div className="flex flex-col min-h-screen pb-24" style={{ backgroundColor: '#F9F9FF' }}>
      <header className="flex items-center gap-3 px-4 pt-12 pb-4">
        <Link href="/payments"
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 tap-none">
          <ChevronLeft size={22} className="text-gray-700" />
        </Link>
        <h1 className="text-lg font-bold text-gray-900 flex-1">Detalle del Pago</h1>
        <Link href={`/payments/${params.id}/edit`}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 tap-none">
          <Pencil size={20} className="text-gray-600" />
        </Link>
      </header>

      <div className="px-4 flex flex-col gap-4">
        {/* Hero card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col items-center text-center">
          <CategoryIcon icon={cat?.icon ?? 'circle'} color={cat?.color ?? '#3B82F6'} size="lg" />
          <h2 className="text-xl font-bold text-gray-900 mt-3">{payment?.name}</h2>
          <p className="text-3xl font-bold mt-2 tabular-nums" style={{ color: cat?.color ?? '#3B82F6' }}>
            {formatByCurrency(payment?.amount ?? 0, payment?.currency ?? 'COP')}
          </p>
          <span className={cn(
            'mt-3 px-4 py-1 rounded-full text-xs font-bold uppercase',
            isPaid ? 'bg-green-100 text-green-700' :
            entry.status === 'overdue' ? 'bg-red-100 text-red-700' :
            'bg-blue-100 text-blue-700'
          )}>
            {isPaid ? 'Pagado' : entry.status === 'overdue' ? 'Vencido' : 'Pendiente'}
          </span>
        </div>

        {/* Details */}
        <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50">
          <DetailRow icon={<Calendar size={18} />} label="Vencimiento"
            value={format(parseISO(entry.due_date), "d 'de' MMMM yyyy", { locale: es })} />
          <DetailRow icon={<Tag size={18} />} label="Categoría" value={cat?.name ?? '—'} />
          <DetailRow icon={<Repeat size={18} />} label="Recurrente" value={payment?.is_recurring ? 'Sí, mensual' : 'No'} />
          {payment?.space && (
            <DetailRow icon={<CreditCard size={18} />} label="Espacio" value={payment.space.name} />
          )}
          {isPaid && entry.paid_at && (
            <DetailRow icon={<CreditCard size={18} />} label="Pagado el"
              value={format(new Date(entry.paid_at), "d 'de' MMMM yyyy", { locale: es })} />
          )}
          {entry.payment_method && (
            <DetailRow icon={<CreditCard size={18} />} label="Método" value={entry.payment_method} />
          )}
        </div>

        {/* Notes */}
        {payment?.notes && (
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-1">Notas</p>
            <p className="text-[15px] text-gray-700">{payment.notes}</p>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}

function DetailRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 px-4 py-4">
      <span className="text-gray-400">{icon}</span>
      <span className="flex-1 text-sm text-gray-500">{label}</span>
      <span className="text-sm font-semibold text-gray-900">{value}</span>
    </div>
  )
}

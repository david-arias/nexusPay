import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getSpaces } from '@/lib/supabase/queries'
import { BottomNav } from '@/components/layout/BottomNav'

export default async function SpacesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const spaces = await getSpaces(user.id) as any[]

  return (
    <div className="flex flex-col min-h-screen pb-24" style={{ backgroundColor: 'var(--surface)' }}>

      {/* Header */}
      <header className="px-4 pt-12 pb-4">
        <h1 className="text-lg font-bold text-[var(--text-primary)]">Espacios</h1>
      </header>

      <div className="px-4">
        <p className="text-sm text-[var(--text-secondary)] mb-5">
          Gestiona gastos comunes con roomies, colegas o familia.
        </p>

        {/* Create space */}
        <Link
          href="/spaces/new"
          className="flex items-center justify-center gap-2 w-full h-14
                     bg-blue-600 hover:bg-blue-700 text-white font-bold text-[15px]
                     rounded-2xl transition-colors duration-150 tap-none mb-5"
        >
          <Plus size={20} />
          Crear Nuevo Espacio
        </Link>

        {/* Spaces list */}
        {spaces.length === 0 ? (
          <div className="text-center py-16 text-[var(--text-secondary)]">
            <p className="text-sm">Aún no tienes espacios compartidos.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {spaces.map((space: any) => (
              <SpaceCard key={space.id} space={space} />
            ))}
          </div>
        )}

        {/* New space placeholder card */}
        <Link
          href="/spaces/new"
          className="flex flex-col items-center justify-center gap-2 mt-4
                     border-2 border-dashed border-[var(--border)] rounded-2xl p-8
                     text-[var(--text-secondary)] hover:border-blue-300 hover:text-blue-500
                     transition-colors duration-150 tap-none"
        >
          <div className="w-10 h-10 rounded-full bg-[var(--input-bg)] flex items-center justify-center">
            <Plus size={20} />
          </div>
          <p className="text-sm font-medium">Nuevo Espacio</p>
          <p className="text-xs">Añade un grupo para compartir tus pagos.</p>
        </Link>
      </div>

      <BottomNav />
    </div>
  )
}

function SpaceCard({ space }: { space: any }) {
  const totalPending = space.pending_amount ?? 0
  const paidPct = 60 // TODO: compute from real entries

  return (
    <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-4">
      {/* Space header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-bold text-[var(--text-primary)] text-[16px]">{space.name}</h3>
          {space.description && <p className="text-xs text-[var(--text-secondary)] mt-0.5">{space.description}</p>}
        </div>
      </div>

      {/* Pending amount */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-[var(--text-secondary)]">Facturas pendientes</span>
          <span className="font-bold text-blue-600">${totalPending.toFixed(2)}</span>
        </div>
        <div className="h-1.5 bg-[var(--input-bg)] rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 rounded-full"
            style={{ width: `${paidPct}%` }}
          />
        </div>
      </div>

      {/* Actions */}
      <Link href={`/spaces/${space.id}`}
        className="w-full h-11 bg-[var(--input-bg)] hover:bg-[var(--divider)] rounded-xl
                   text-sm font-semibold text-[var(--text-primary)]
                   flex items-center justify-center transition-colors tap-none">
        Ver Detalles
      </Link>
    </div>
  )
}

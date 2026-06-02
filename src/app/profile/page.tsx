import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight, ExternalLink, Bell, Lock, User, Grid2X2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getCategories } from '@/lib/supabase/queries'
import { BottomNav } from '@/components/layout/BottomNav'
import { CategoryIcon } from '@/components/ui/CategoryIcon'
import { LogoutButton } from './LogoutButton'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const [profileResult, categories] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    getCategories(user.id),
  ])

  const profile = profileResult.data
  const initials = profile?.full_name
    ? profile.full_name.split(' ').map((n: string) => n[0]).slice(0, 2).join('')
    : user.email?.[0]?.toUpperCase() ?? 'U'

  return (
    <div className="flex flex-col min-h-screen pb-24" style={{ backgroundColor: '#F9F9FF' }}>

      {/* Header */}
      <header className="flex items-center justify-between px-4 pt-12 pb-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center
                          text-white font-bold text-sm">
            {initials}
          </div>
          <h1 className="text-lg font-bold text-gray-900">Mis Pagos</h1>
        </div>
        <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 tap-none">
          <Bell size={22} className="text-gray-700" />
        </button>
      </header>

      {/* Avatar + name */}
      <div className="flex flex-col items-center py-6 gap-1">
        <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center
                        text-white text-2xl font-bold border-4 border-blue-100">
          {initials}
        </div>
        <p className="text-lg font-bold text-gray-900 mt-2">
          {profile?.full_name ?? 'Usuario'}
        </p>
        <p className="text-sm text-gray-500">{user.email}</p>
      </div>

      {/* Manage categories CTA */}
      <div className="px-4 mb-6">
        <Link
          href="/profile/categories"
          className="flex items-center gap-4 bg-blue-600 rounded-2xl p-4 text-white"
        >
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <Grid2X2 size={20} className="text-white" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-[15px]">Gestionar Categorías</p>
            <p className="text-blue-100 text-xs">Personaliza tus gastos</p>
          </div>
          <ChevronRight size={20} className="text-white/70" />
        </Link>
      </div>

      {/* Config section */}
      <div className="px-4 mb-4">
        <p className="text-xs font-semibold text-gray-400 mb-2 px-1">Configuración</p>
        <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50">
          <SettingRow href="/profile/info" icon={<User size={18} />} label="Información Personal" />
          <SettingRow href="/profile/notifications" icon={<Bell size={18} />} label="Notificaciones" badge="ON" />
          <SettingRow href="/profile/security" icon={<Lock size={18} />} label="Seguridad" />
        </div>
      </div>

      {/* More section */}
      <div className="px-4 mb-6">
        <p className="text-xs font-semibold text-gray-400 mb-2 px-1">Más</p>
        <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50">
          <SettingRow href="https://help.nexuspay.app" icon={<ExternalLink size={18} />} label="Centro de Ayuda" external />
          <SettingRow href="https://nexuspay.app/privacy" icon={<ExternalLink size={18} />} label="Políticas de Privacidad" external />
        </div>
      </div>

      {/* Logout */}
      <div className="px-4">
        <LogoutButton />
      </div>

      <BottomNav />
    </div>
  )
}

function SettingRow({
  href, icon, label, badge, external,
}: {
  href: string
  icon: React.ReactNode
  label: string
  badge?: string
  external?: boolean
}) {
  return (
    <Link
      href={href}
      target={external ? '_blank' : undefined}
      className="flex items-center gap-3 px-4 py-4 hover:bg-gray-50 transition-colors tap-none"
    >
      <span className="text-gray-500">{icon}</span>
      <span className="flex-1 text-[15px] text-gray-900">{label}</span>
      {badge && (
        <span className="bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
          {badge}
        </span>
      )}
      {external
        ? <ExternalLink size={16} className="text-gray-400" />
        : <ChevronRight size={18} className="text-gray-400" />
      }
    </Link>
  )
}

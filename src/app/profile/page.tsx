import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight, Bell, Lock, User, Grid2X2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { BottomNav } from '@/components/layout/BottomNav'
import { LogoutButton } from './LogoutButton'
import { ThemeToggleRow } from './ThemeToggleRow'
import { AvatarUpload } from './AvatarUpload'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map((n: string) => n[0]).slice(0, 2).join('')
    : user.email?.[0]?.toUpperCase() ?? 'U'

  return (
    <div className="flex flex-col min-h-screen pb-24 bg-[var(--surface)]">

      {/* Header */}
      <header className="px-4 pt-12 pb-2">
        <h1 className="text-lg font-bold text-[var(--text-primary)]">Perfil</h1>
      </header>

      {/* Avatar + name */}
      <AvatarUpload initials={initials} avatarUrl={profile?.avatar_url ?? null} />
      <div className="flex flex-col items-center pb-2 gap-0.5 -mt-3">
        <p className="text-lg font-bold text-[var(--text-primary)]">
          {profile?.full_name ?? 'Usuario'}
        </p>
        <p className="text-sm text-[var(--text-secondary)]">{user.email}</p>
      </div>

      {/* Manage categories CTA */}
      <div className="px-4 mb-6">
        <Link href="/profile/categories"
          className="flex items-center gap-4 bg-blue-600 rounded-2xl p-4 text-white">
          <div className="w-10 h-10 bg-[var(--card)]/20 rounded-xl flex items-center justify-center">
            <Grid2X2 size={20} className="text-white" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-[15px]">Gestionar Categorías</p>
            <p className="text-blue-100 text-xs">Personaliza tus gastos</p>
          </div>
          <ChevronRight size={20} className="text-white/70" />
        </Link>
      </div>

      {/* Config */}
      <div className="px-4 mb-4">
        <p className="text-xs font-semibold text-[var(--text-secondary)] mb-2 px-1 uppercase tracking-wider">Configuración</p>
        <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] divide-y divide-[var(--border)]">
          <SettingRow href="/profile/info"            icon={<User size={18} />} label="Información Personal" />
          <SettingRow href="/notifications/settings"  icon={<Bell size={18} />} label="Recordatorios" />
          <SettingRow href="/profile/security"        icon={<Lock size={18} />} label="Seguridad" />
          <ThemeToggleRow />
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

function SettingRow({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link href={href} className="flex items-center gap-3 px-4 py-4 hover:bg-[var(--surface)] transition-colors tap-none">
      <span className="text-[var(--text-secondary)]">{icon}</span>
      <span className="flex-1 text-[15px] text-[var(--text-primary)]">{label}</span>
      <ChevronRight size={18} className="text-[var(--text-secondary)]" />
    </Link>
  )
}

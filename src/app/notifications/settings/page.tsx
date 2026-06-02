'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Bell, BellOff, Check } from 'lucide-react'
import { Toggle } from '@/components/ui/Toggle'
import { BottomNav } from '@/components/layout/BottomNav'

export default function NotificationSettingsPage() {
  const router = useRouter()
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [remindDaysBefore, setRemindDaysBefore] = useState(3)
  const [remindOnDueDay, setRemindOnDueDay]     = useState(true)
  const [remindOverdue, setRemindOverdue]       = useState(true)
  const [saved, setSaved]                       = useState(false)

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission)
    }
    // Load saved prefs from localStorage
    const prefs = localStorage.getItem('nexuspay_notif_prefs')
    if (prefs) {
      const p = JSON.parse(prefs)
      setRemindDaysBefore(p.daysBefore ?? 3)
      setRemindOnDueDay(p.onDueDay ?? true)
      setRemindOverdue(p.overdue ?? true)
    }
  }, [])

  async function requestPermission() {
    if (!('Notification' in window)) return
    const result = await Notification.requestPermission()
    setPermission(result)
    if (result === 'granted') {
      new Notification('NexusPay', {
        body: '✅ Notificaciones activadas. Te avisaremos antes de cada vencimiento.',
        icon: '/icons/icon-192.png',
      })
    }
  }

  function handleSave() {
    localStorage.setItem('nexuspay_notif_prefs', JSON.stringify({
      daysBefore: remindDaysBefore,
      onDueDay:   remindOnDueDay,
      overdue:    remindOverdue,
    }))
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="flex flex-col min-h-screen pb-24" style={{ backgroundColor: 'var(--surface)' }}>
      <header className="flex items-center gap-3 px-4 pt-12 pb-4">
        <button onClick={() => router.back()}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[var(--card-hover)] tap-none">
          <ChevronLeft size={22} className="text-[var(--text-primary)]" />
        </button>
        <h1 className="text-lg font-bold text-[var(--text-primary)]">Recordatorios</h1>
      </header>

      <div className="px-4 flex flex-col gap-4">

        {/* Push permission card */}
        <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-5">
          <div className="flex items-center gap-3 mb-4">
            {permission === 'granted'
              ? <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center"><Bell size={20} className="text-green-600" /></div>
              : <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center"><BellOff size={20} className="text-amber-600" /></div>
            }
            <div>
              <p className="font-semibold text-[var(--text-primary)]">Notificaciones del sistema</p>
              <p className="text-xs text-[var(--text-secondary)]">
                {permission === 'granted' ? 'Activadas ✓' : permission === 'denied' ? 'Bloqueadas en el navegador' : 'Sin activar'}
              </p>
            </div>
          </div>

          {permission !== 'granted' && permission !== 'denied' && (
            <button onClick={requestPermission}
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl
                         flex items-center justify-center gap-2 transition-colors tap-none">
              <Bell size={18} />
              Activar notificaciones
            </button>
          )}
          {permission === 'denied' && (
            <p className="text-xs text-red-500 bg-red-50 rounded-xl p-3 leading-relaxed">
              Bloqueaste las notificaciones. Para activarlas ve a la configuración del navegador → Privacidad → Notificaciones → y permite este sitio.
            </p>
          )}
          {permission === 'granted' && (
            <p className="text-xs text-green-600 font-medium">✓ Recibirás alertas en tu dispositivo</p>
          )}
        </div>

        {/* Settings */}
        <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] divide-y divide-[var(--divider)]">
          <div className="p-4">
            <Toggle
              checked={remindOnDueDay}
              onChange={setRemindOnDueDay}
              label="El día del vencimiento"
              description="Notificación el mismo día que vence el pago"
            />
          </div>
          <div className="p-4">
            <Toggle
              checked={remindOverdue}
              onChange={setRemindOverdue}
              label="Pagos vencidos"
              description="Recordatorio si un pago sigue sin pagarse"
            />
          </div>
        </div>

        {/* Days before */}
        <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-4">
          <p className="font-semibold text-[var(--text-primary)] mb-1">Avisar con anticipación</p>
          <p className="text-xs text-[var(--text-secondary)] mb-3">Días antes del vencimiento para recordarte</p>
          <div className="flex gap-2">
            {[1, 2, 3, 5, 7].map(d => (
              <button key={d} type="button" onClick={() => setRemindDaysBefore(d)}
                className={`flex-1 h-10 rounded-xl text-sm font-semibold tap-none transition-all
                  ${remindDaysBefore === d ? 'bg-blue-600 text-white' : 'bg-[var(--input-bg)] text-[var(--text-secondary)]'}`}>
                {d}d
              </button>
            ))}
          </div>
        </div>

        {/* Save */}
        <button onClick={handleSave}
          className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[15px]
                     rounded-2xl flex items-center justify-center gap-2 transition-colors tap-none">
          {saved ? <><Check size={20} /> ¡Guardado!</> : 'Guardar preferencias'}
        </button>

        <p className="text-xs text-[var(--text-secondary)] text-center leading-relaxed">
          Las notificaciones funcionan incluso cuando la app está cerrada (requiere permiso del navegador).
          En iOS, instala la app en tu pantalla de inicio para habilitarlas.
        </p>
      </div>

      <BottomNav />
    </div>
  )
}

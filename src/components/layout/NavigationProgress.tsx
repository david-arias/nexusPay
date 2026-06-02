'use client'

import { useEffect, useState, useRef, Suspense } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

function Loader() {
  const pathname     = usePathname()
  const searchParams = useSearchParams()
  const [show, setShow]     = useState(false)
  const [fading, setFading] = useState(false)
  const hideTimer = useRef<NodeJS.Timeout | null>(null)

  // Route changed → hide loader
  useEffect(() => {
    setFading(true)
    hideTimer.current = setTimeout(() => {
      setShow(false)
      setFading(false)
    }, 300)
    return () => { if (hideTimer.current) clearTimeout(hideTimer.current) }
  }, [pathname, searchParams])

  // Intercept link clicks → show loader
  useEffect(() => {
    function onLinkClick(e: MouseEvent) {
      const a = (e.target as HTMLElement).closest('a')
      if (!a) return
      const href = a.getAttribute('href')
      if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto')) return
      if (href === pathname) return  // same page
      setFading(false)
      setShow(true)
    }
    document.addEventListener('click', onLinkClick)
    return () => document.removeEventListener('click', onLinkClick)
  }, [pathname])

  if (!show) return null

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-4"
      style={{
        backgroundColor: 'var(--surface)',
        opacity: fading ? 0 : 1,
        transition: 'opacity 0.3s ease',
      }}
    >
      {/* Logo */}
      <div className="flex flex-col items-center gap-3">
        <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
          <span className="text-white text-3xl font-bold">N</span>
        </div>
        <span className="text-blue-600 font-bold text-lg">NexusPay</span>
      </div>

      {/* Spinner */}
      <div className="w-8 h-8 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin mt-2"
        style={{ borderWidth: 3 }} />
    </div>
  )
}

export function NavigationProgress() {
  return (
    <Suspense>
      <Loader />
    </Suspense>
  )
}

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, PlusCircle, Grid2X2, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/dashboard',  label: 'Inicio',    Icon: Home      },
  { href: '/add',        label: 'Añadir',    Icon: PlusCircle },
  { href: '/spaces',     label: 'Espacios',  Icon: Grid2X2   },
  { href: '/profile',    label: 'Perfil',    Icon: User       },
]

/**
 * Bottom Navigation Bar — fixed to the bottom of the viewport.
 * Uses safe-area-inset-bottom to play nicely with iPhone home indicator.
 */
export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md
                 bg-[var(--card)] border-t border-[var(--border)] z-40"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      aria-label="Navegación principal"
    >
      <ul className="flex items-center justify-around h-16">
        {NAV_ITEMS.map(({ href, label, Icon }) => {
          const isActive = pathname.startsWith(href)
          const isAdd = href === '/add'

          return (
            <li key={href}>
              <Link
                href={href}
                className={cn(
                  'flex flex-col items-center justify-center gap-0.5',
                  'min-w-[56px] min-h-[44px] tap-none',
                  isActive && !isAdd ? 'text-primary-600' : 'text-gray-400',
                  'transition-colors duration-150'
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                {isAdd ? (
                  /* Prominent "Add" button */
                  <span className="flex items-center justify-center w-12 h-12
                                   bg-primary-600 rounded-full shadow-lg
                                   text-white -mt-4">
                    <Icon size={22} strokeWidth={2.5} />
                  </span>
                ) : (
                  <>
                    <Icon
                      size={22}
                      strokeWidth={isActive ? 2.5 : 1.8}
                      className={isActive ? 'text-primary-600' : 'text-gray-400'}
                    />
                    <span className={cn(
                      'text-[10px] font-medium leading-none',
                      isActive ? 'text-primary-600' : 'text-gray-400'
                    )}>
                      {label}
                    </span>
                  </>
                )}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

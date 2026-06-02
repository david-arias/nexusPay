import {
  Home, Zap, Wifi, Tv, Car, ShieldPlus, Dumbbell,
  ShoppingCart, Clapperboard, Circle, type LucideProps,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const ICON_MAP: Record<string, React.FC<LucideProps>> = {
  home:        Home,
  zap:         Zap,
  wifi:        Wifi,
  tv:          Tv,
  car:         Car,
  'shield-plus': ShieldPlus,
  dumbbell:    Dumbbell,
  'shopping-cart': ShoppingCart,
  clapperboard: Clapperboard,
}

interface CategoryIconProps {
  icon: string
  color: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const SIZE_MAP = {
  sm: { container: 'w-8 h-8',  icon: 16 },
  md: { container: 'w-11 h-11', icon: 20 },
  lg: { container: 'w-14 h-14', icon: 24 },
}

/**
 * Rounded category icon badge with tinted background.
 * Hex color → 15% opacity background, full-opacity icon.
 */
export function CategoryIcon({ icon, color, size = 'md', className }: CategoryIconProps) {
  const Icon = ICON_MAP[icon] ?? Circle
  const { container, icon: iconSize } = SIZE_MAP[size]

  return (
    <span
      className={cn('flex items-center justify-center rounded-xl flex-shrink-0', container, className)}
      style={{ backgroundColor: `${color}20` }}  // 20 = ~12% opacity in hex
    >
      <Icon size={iconSize} strokeWidth={2} style={{ color }} />
    </span>
  )
}

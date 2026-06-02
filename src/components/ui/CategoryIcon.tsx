import {
  Home, Zap, Wifi, Tv, Car, ShieldPlus, Dumbbell, ShoppingCart, Clapperboard,
  Sofa, Bath, Lamp, Key, Droplets, Flame, Phone, Music, Gamepad2, BookOpen,
  Fuel, Bus, Bike, Plane, Pill, Stethoscope, HeartPulse, Utensils, Coffee,
  Pizza, Apple, CreditCard, Banknote, PiggyBank, TrendingUp, Receipt,
  GraduationCap, Briefcase, Monitor, Printer, PenTool, Dog, Baby, Gift,
  Smile, Users, Repeat, Cloud, Shield, Globe, MoreHorizontal, Circle,
  type LucideProps,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const ICON_MAP: Record<string, React.FC<LucideProps>> = {
  'home': Home, 'zap': Zap, 'wifi': Wifi, 'tv': Tv, 'car': Car,
  'shield-plus': ShieldPlus, 'dumbbell': Dumbbell, 'shopping-cart': ShoppingCart,
  'clapperboard': Clapperboard, 'sofa': Sofa, 'bath': Bath, 'lamp': Lamp,
  'key': Key, 'droplets': Droplets, 'flame': Flame, 'phone': Phone,
  'music': Music, 'gamepad-2': Gamepad2, 'book-open': BookOpen, 'fuel': Fuel,
  'bus': Bus, 'bike': Bike, 'plane': Plane, 'pill': Pill,
  'stethoscope': Stethoscope, 'heart-pulse': HeartPulse, 'utensils': Utensils,
  'coffee': Coffee, 'pizza': Pizza, 'apple': Apple, 'credit-card': CreditCard,
  'banknote': Banknote, 'piggy-bank': PiggyBank, 'trending-up': TrendingUp,
  'receipt': Receipt, 'graduation-cap': GraduationCap, 'briefcase': Briefcase,
  'monitor': Monitor, 'printer': Printer, 'pen-tool': PenTool, 'dog': Dog,
  'baby': Baby, 'gift': Gift, 'smile': Smile, 'users': Users, 'repeat': Repeat,
  'cloud': Cloud, 'shield': Shield, 'globe': Globe, 'more-horizontal': MoreHorizontal,
  'circle': Circle,
}

interface CategoryIconProps {
  icon: string
  color: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const SIZE_MAP = {
  sm: { container: 'w-7 h-7',   icon: 14 },
  md: { container: 'w-11 h-11', icon: 20 },
  lg: { container: 'w-14 h-14', icon: 26 },
}

export function CategoryIcon({ icon, color, size = 'md', className }: CategoryIconProps) {
  const Icon = ICON_MAP[icon] ?? Circle
  const { container, icon: iconSize } = SIZE_MAP[size]

  return (
    <span
      className={cn('flex items-center justify-center rounded-xl flex-shrink-0', container, className)}
      style={{ backgroundColor: `${color}20` }}
    >
      <Icon size={iconSize} strokeWidth={2} style={{ color }} />
    </span>
  )
}

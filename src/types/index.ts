// ============================================================
// NexusPay – Core TypeScript Types
// Mirrors the Supabase database schema
// ============================================================

export type PaymentStatus = 'pending' | 'paid' | 'overdue' | 'scheduled'
export type SpaceMemberRole = 'owner' | 'member'
export type InvitationStatus = 'pending' | 'accepted' | 'declined' | 'expired'

export interface Profile {
  id: string
  full_name: string | null
  avatar_url: string | null
  currency: string
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  user_id: string
  name: string
  description: string | null
  icon: string      // Lucide icon name
  color: string     // Hex color
  created_at: string
}

export interface Space {
  id: string
  name: string
  description: string | null
  owner_id: string
  created_at: string
  updated_at: string
  // Joined relations
  members?: SpaceMember[]
  pending_amount?: number
}

export interface SpaceMember {
  id: string
  space_id: string
  user_id: string
  role: SpaceMemberRole
  joined_at: string
  // Joined
  profile?: Pick<Profile, 'id' | 'full_name' | 'avatar_url'>
}

export interface Payment {
  id: string
  user_id: string
  space_id: string | null  // null = personal
  category_id: string | null
  name: string
  amount: number
  currency: string
  due_day: number          // 1-31
  is_recurring: boolean
  notes: string | null
  created_at: string
  updated_at: string
  // Joined relations
  category?: Category
  space?: Space
}

export interface PaymentEntry {
  id: string
  payment_id: string
  user_id: string
  year: number
  month: number            // 1-12
  due_date: string         // ISO date
  paid_at: string | null
  paid_by: string | null
  payment_method: string | null
  amount_paid: number | null
  status: PaymentStatus
  created_at: string
  updated_at: string
  // Joined
  payment?: Payment
}

// ---- UI-specific types (not in DB) ----

export interface DashboardSummary {
  total_month: number
  total_paid: number
  total_pending: number
  currency: string
}

export interface UpcomingPayment extends PaymentEntry {
  payment: Payment & { category?: Category }
  days_until_due: number
}

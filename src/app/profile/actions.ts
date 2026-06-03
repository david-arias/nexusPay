'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateAvatar(base64: string) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'No autenticado' }

    // Basic validation — must be a data URL image
    if (!base64.startsWith('data:image/')) {
      return { error: 'Formato de imagen inválido.' }
    }

    const { error } = await supabase
      .from('profiles')
      .update({ avatar_url: base64, updated_at: new Date().toISOString() })
      .eq('id', user.id)

    if (error) return { error: error.message }

    revalidatePath('/profile')
    revalidatePath('/dashboard')
    return { success: true }
  } catch (err: any) {
    return { error: err.message ?? 'Error desconocido' }
  }
}

export async function removeAvatar() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'No autenticado' }

    const { error } = await supabase
      .from('profiles')
      .update({ avatar_url: null, updated_at: new Date().toISOString() })
      .eq('id', user.id)

    if (error) return { error: error.message }

    revalidatePath('/profile')
    revalidatePath('/dashboard')
    return { success: true }
  } catch (err: any) {
    return { error: err.message ?? 'Error desconocido' }
  }
}

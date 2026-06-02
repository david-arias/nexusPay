'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function createSpace(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const name        = (formData.get('name') as string).trim()
  const description = (formData.get('description') as string).trim() || null

  if (!name) return { error: 'El nombre es obligatorio.' }

  const { error } = await supabase
    .from('spaces')
    .insert({ name, description, owner_id: user.id })

  if (error) return { error: error.message }

  revalidatePath('/spaces')
  redirect('/spaces')
}

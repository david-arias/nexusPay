import { redirect } from 'next/navigation'

// Root redirect → dashboard (auth check will be added later)
export default function RootPage() {
  redirect('/dashboard')
}

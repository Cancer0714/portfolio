import { redirect } from 'next/navigation'
import { ChordApp } from '@/components/chord-app'
import { createClient } from '@/lib/supabase/server'
import { getProgressions } from '@/app/actions'

export default async function Page() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const progressions = await getProgressions()

  return (
    <ChordApp
      userEmail={user.email ?? 'ユーザー'}
      initialProgressions={progressions}
    />
  )
}

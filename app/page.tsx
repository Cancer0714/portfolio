import { ChordApp } from '@/components/chord-app'
import { createClient } from '@/lib/supabase/server'
import { getProgressions } from '@/app/actions'

export default async function Page() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const progressions = user ? await getProgressions() : []

  return (
    <ChordApp
      userEmail={user?.email ?? 'ゲスト'}
      isAuthenticated={Boolean(user)}
      initialProgressions={progressions}
    />
  )
}

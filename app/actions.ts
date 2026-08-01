'use server'

import { createClient } from '@/lib/supabase/server'
import { CHORD_LIST, type ChordName } from '@/lib/chords'
import type { Progression } from '@/lib/types'

const VALID_CHORDS = new Set<ChordName>(CHORD_LIST)

function sanitizeChords(chords: unknown): ChordName[] {
  if (!Array.isArray(chords)) return []
  return chords
    .filter(
      (c): c is ChordName => typeof c === 'string' && VALID_CHORDS.has(c as ChordName),
    )
    .slice(0, 64)
}

function toProgression(row: {
  id: string
  title: string
  chords: unknown
  created_at: string
}): Progression {
  return {
    id: row.id,
    title: row.title,
    chords: sanitizeChords(row.chords),
    created_at: row.created_at,
  }
}

export async function getProgressions(): Promise<Progression[]> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('progressions')
    .select('id, title, chords, created_at')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[v0] getProgressions error:', error.message)
    return []
  }

  return (data ?? []).map(toProgression)
}

export async function saveProgression(
  title: string,
  chords: ChordName[],
): Promise<{ progression?: Progression; error?: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'ログインが必要です' }

  const trimmed = title.trim().slice(0, 100)
  if (!trimmed) return { error: 'タイトルを入力してください' }

  const safeChords = sanitizeChords(chords)
  if (safeChords.length === 0) return { error: 'コードがありません' }

  const { data, error } = await supabase
    .from('progressions')
    .insert({ user_id: user.id, title: trimmed, chords: safeChords })
    .select('id, title, chords, created_at')
    .single()

  if (error || !data) {
    console.error('[v0] saveProgression error:', error?.message)
    return { error: '保存に失敗しました' }
  }

  return { progression: toProgression(data) }
}

export async function deleteProgression(id: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'ログインが必要です' }

  const { error } = await supabase.from('progressions').delete().eq('id', id)
  if (error) {
    console.error('[v0] deleteProgression error:', error.message)
    return { error: '削除に失敗しました' }
  }
  return {}
}

'use client'

import { useCallback, useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Delete, ListMusic, LogOut, Play, Save, Square, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ChordPad } from '@/components/chord-pad'
import { ProgressionBar } from '@/components/progression-bar'
import { SaveDialog } from '@/components/save-dialog'
import { HistoryPanel } from '@/components/history-panel'
import { playChord, playSequence, type PlaybackHandle } from '@/lib/audio'
import { createClient } from '@/lib/supabase/client'
import { deleteProgression, saveProgression } from '@/app/actions'
import type { ChordName } from '@/lib/chords'
import type { Progression } from '@/lib/types'

type ChordAppProps = {
  userEmail: string
  initialProgressions: Progression[]
}

export function ChordApp({ userEmail, initialProgressions }: ChordAppProps) {
  const router = useRouter()
  const [chords, setChords] = useState<ChordName[]>([])
  const [activeChord, setActiveChord] = useState<ChordName | null>(null)
  const [playingIndex, setPlayingIndex] = useState<number | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const [saveOpen, setSaveOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [progressions, setProgressions] = useState<Progression[]>(initialProgressions)
  const [, startTransition] = useTransition()

  const playbackRef = useRef<PlaybackHandle | null>(null)
  const activeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const flashActive = useCallback((chord: ChordName) => {
    setActiveChord(chord)
    if (activeTimerRef.current) clearTimeout(activeTimerRef.current)
    activeTimerRef.current = setTimeout(() => setActiveChord(null), 300)
  }, [])

  const handleChordClick = useCallback(
    (chord: ChordName) => {
      void playChord(chord)
      flashActive(chord)
      setChords((prev) => [...prev, chord])
      setMessage(null)
    },
    [flashActive],
  )

  const stopPlayback = useCallback(() => {
    playbackRef.current?.stop()
    playbackRef.current = null
    setIsPlaying(false)
    setPlayingIndex(null)
  }, [])

  const startPlayback = useCallback(
    async (list: ChordName[]) => {
      if (list.length === 0) {
        setMessage('コードを選択してください')
        return
      }
      stopPlayback()
      setIsPlaying(true)
      setMessage(null)
      playbackRef.current = await playSequence(list, {
        bpm: 90,
        onStep: (index) => {
          setPlayingIndex(index)
          if (index === null) {
            setIsPlaying(false)
            playbackRef.current = null
          }
        },
      })
    },
    [stopPlayback],
  )

  const handleDeleteLast = useCallback(() => {
    setChords((prev) => prev.slice(0, -1))
  }, [])

  const handleClearAll = useCallback(() => {
    setChords([])
    setMessage(null)
  }, [])

  const handleSave = useCallback(
    async (title: string) => {
      setSaving(true)
      const { progression, error } = await saveProgression(title, chords)
      setSaving(false)
      if (error || !progression) {
        setMessage(error ?? '保存に失敗しました')
        return
      }
      setProgressions((prev) => [progression, ...prev])
      setSaveOpen(false)
      setMessage(`「${progression.title}」を保存しました`)
    },
    [chords],
  )

  const handlePlaySaved = useCallback(
    (p: Progression) => {
      setChords(p.chords)
      setHistoryOpen(false)
      void startPlayback(p.chords)
    },
    [startPlayback],
  )

  const handleDeleteSaved = useCallback((id: string) => {
    setProgressions((prev) => prev.filter((p) => p.id !== id))
    startTransition(async () => {
      const { error } = await deleteProgression(id)
      if (error) setMessage(error)
    })
  }, [])

  const handleLogout = useCallback(async () => {
    stopPlayback()
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
    router.refresh()
  }, [router, stopPlayback])

  return (
    <main className="mx-auto flex min-h-svh max-w-4xl flex-col gap-6 px-4 py-8">
      <header className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight">ChordPad</h1>
          <p className="truncate text-sm text-muted-foreground">
            {userEmail}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button variant="outline" onClick={() => setHistoryOpen(true)}>
            <ListMusic className="size-4" />
            保存履歴
          </Button>
          <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="ログアウト">
            <LogOut className="size-4" />
          </Button>
        </div>
      </header>

      <section aria-label="コード一覧">
        <ChordPad activeChord={activeChord} onChordClick={handleChordClick} />
      </section>

      <section aria-label="コード進行" className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">コード進行</span>
          <span className="text-xs text-muted-foreground">{chords.length} コード</span>
        </div>
        <ProgressionBar chords={chords} playingIndex={playingIndex} />
        {message && <p className="text-sm text-muted-foreground">{message}</p>}
      </section>

      <section aria-label="操作" className="flex flex-wrap gap-2">
        {isPlaying ? (
          <Button variant="secondary" onClick={stopPlayback}>
            <Square className="size-4" />
            停止
          </Button>
        ) : (
          <Button onClick={() => startPlayback(chords)}>
            <Play className="size-4" />
            再生
          </Button>
        )}
        <Button variant="outline" onClick={handleDeleteLast} disabled={chords.length === 0}>
          <Delete className="size-4" />
          最後を削除
        </Button>
        <Button variant="outline" onClick={handleClearAll} disabled={chords.length === 0}>
          <Trash2 className="size-4" />
          全削除
        </Button>
        <Button
          variant="outline"
          onClick={() => setSaveOpen(true)}
          disabled={chords.length === 0}
        >
          <Save className="size-4" />
          保存
        </Button>
      </section>

      <SaveDialog
        open={saveOpen}
        chords={chords}
        saving={saving}
        onClose={() => setSaveOpen(false)}
        onSave={handleSave}
      />
      <HistoryPanel
        open={historyOpen}
        progressions={progressions}
        onClose={() => setHistoryOpen(false)}
        onPlay={handlePlaySaved}
        onDelete={handleDeleteSaved}
      />
    </main>
  )
}

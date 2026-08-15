'use client'

import { useCallback, useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Delete, ListMusic, LogOut, Play, Save, Send, Square, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ChordPad } from '@/components/chord-pad'
import { ProgressionBar } from '@/components/progression-bar'
import { SaveDialog } from '@/components/save-dialog'
import { HistoryPanel } from '@/components/history-panel'
import { playChord, playSequence, type PlaybackHandle, type Waveform } from '@/lib/audio'
import { createClient } from '@/lib/supabase/client'
import { deleteProgression, saveProgression } from '@/app/actions'
import { SUGGESTION_CHORDS, type ChordName } from '@/lib/chords'
import type { Progression } from '@/lib/types'

type ChordAppProps = {
  userEmail: string
  isAuthenticated: boolean
  initialProgressions: Progression[]
}

function normalizeSuggestedChords(value: unknown): ChordName[] {
  const raw = Array.isArray(value) ? value : []
  return raw.filter((item): item is ChordName => {
    return typeof item === 'string' && SUGGESTION_CHORDS.includes(item as ChordName)
  }) as ChordName[]
}

export function ChordApp({
  userEmail,
  isAuthenticated,
  initialProgressions,
}: ChordAppProps) {
  const router = useRouter()
  const [chords, setChords] = useState<ChordName[]>([])
  const [activeChord, setActiveChord] = useState<ChordName | null>(null)
  const [playingIndex, setPlayingIndex] = useState<number | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [waveform, setWaveform] = useState<Waveform>('triangle')
  const [volume, setVolume] = useState<number>(-8)
  const [aiPrompt, setAiPrompt] = useState('')
  const [aiSuggestion, setAiSuggestion] = useState<ChordName[]>([])
  const [aiLoading, setAiLoading] = useState(false)

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
      void playChord(chord, '0.8n', waveform, volume)
      flashActive(chord)
      setChords((prev) => [...prev, chord])
      setMessage(null)
    },
    [flashActive, volume, waveform],
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
        waveform,
        volume,
        onStep: (index) => {
          setPlayingIndex(index)
          if (index === null) {
            setIsPlaying(false)
            playbackRef.current = null
          }
        },
      })
    },
    [stopPlayback, volume, waveform],
  )

  const handleDeleteLast = useCallback(() => {
    setChords((prev) => prev.slice(0, -1))
  }, [])

  const handleClearAll = useCallback(() => {
    setChords([])
    setMessage(null)
  }, [])

  const handleOpenHistory = useCallback(() => {
    if (!isAuthenticated) {
      router.push('/auth/login')
      return
    }
    setHistoryOpen(true)
  }, [isAuthenticated, router])

  const handleOpenSave = useCallback(() => {
    if (!isAuthenticated) {
      router.push('/auth/login')
      return
    }
    setSaveOpen(true)
  }, [isAuthenticated, router])

  const handleSave = useCallback(
    async (title: string) => {
      if (!isAuthenticated) {
        router.push('/auth/login')
        return
      }
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
    [chords, isAuthenticated, router],
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

  const handleAiSuggest = useCallback(async () => {
    const prompt = aiPrompt.trim()
    if (!prompt) {
      setMessage('AIに伝えたい雰囲気を入力してください')
      return
    }

    setAiLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/chord-suggestion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      })

      const data = await response.json()
      const suggestions = normalizeSuggestedChords(data.chords)

      if (suggestions.length === 0) {
        setMessage('その要望には該当するコードが見つかりませんでした')
        return
      }

      setAiSuggestion(suggestions)
      setChords(suggestions)
      setMessage('AIが提案したコード進行を反映しました')
    } catch (error) {
      console.error('[v0] chord suggestion error:', error)
      setMessage('AI提案の取得に失敗しました')
    } finally {
      setAiLoading(false)
    }
  }, [aiPrompt])

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
          <Button variant="outline" onClick={handleOpenHistory}>
            <ListMusic className="size-4" />
            保存履歴
          </Button>
          {isAuthenticated ? (
            <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="ログアウト">
              <LogOut className="size-4" />
            </Button>
          ) : null}
        </div>
      </header>

      <section aria-label="コード一覧">
        <ChordPad activeChord={activeChord} onChordClick={handleChordClick} />
      </section>

      <section aria-label="音色と音量" className="flex flex-wrap items-center gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">音色</span>
          {(['sine', 'triangle', 'square', 'sawtooth'] as const).map((option) => (
            <Button
              key={option}
              variant={waveform === option ? 'secondary' : 'outline'}
              onClick={() => setWaveform(option)}
            >
              {option}
            </Button>
          ))}
        </div>

        <div className="ml-auto flex min-w-[180px] flex-1 items-center gap-2 md:max-w-xs">
          <label htmlFor="volume" className="text-sm font-medium text-muted-foreground">
            音量
          </label>
          <input
            id="volume"
            type="range"
            min={-30}
            max={6}
            step={1}
            value={volume}
            onChange={(event) => setVolume(Number(event.target.value))}
            className="w-full accent-violet-500"
            aria-label="音量調整"
          />
          <span className="w-10 text-right text-xs text-muted-foreground">{volume}dB</span>
        </div>
      </section>

      <section aria-label="AIコード提案" className="rounded-xl border border-border bg-card p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">AIコード提案</h2>
          <span className="text-xs text-muted-foreground">対応範囲: C / Cm / F / Fm / G / Gm 系</span>
        </div>
        <div className="flex flex-col gap-3">
          <textarea
            value={aiPrompt}
            onChange={(event) => setAiPrompt(event.target.value)}
            placeholder="例: きれいで明るい、朝の爽やかな感じ"
            className="min-h-24 rounded-lg border border-border bg-background p-3 text-sm outline-none ring-0 placeholder:text-muted-foreground"
          />
          <div className="flex items-center gap-2">
            <Button onClick={handleAiSuggest} disabled={aiLoading}>
              <Send className="size-4" />
              {aiLoading ? '提案中...' : 'コードを提案'}
            </Button>
            {aiSuggestion.length > 0 && (
              <Button variant="outline" onClick={() => setChords(aiSuggestion)}>
                反映する
              </Button>
            )}
          </div>
          {aiSuggestion.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {aiSuggestion.map((chord) => (
                <span
                  key={chord}
                  className="rounded bg-secondary px-2 py-1 text-sm font-medium text-secondary-foreground"
                >
                  {chord}
                </span>
              ))}
            </div>
          )}
        </div>
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
          onClick={handleOpenSave}
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

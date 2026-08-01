'use client'

import type { ChordName } from '@/lib/chords'
import { cn } from '@/lib/utils'

type ProgressionBarProps = {
  chords: ChordName[]
  playingIndex: number | null
}

export function ProgressionBar({ chords, playingIndex }: ProgressionBarProps) {
  return (
    <div className="flex min-h-24 flex-wrap items-center gap-2 rounded-xl border border-border bg-card/50 p-4">
      {chords.length === 0 ? (
        <p className="w-full text-center text-sm text-muted-foreground">
          コードボタンを押して進行を作りましょう
        </p>
      ) : (
        chords.map((chord, i) => (
          <div
            key={`${chord}-${i}`}
            className={cn(
              'flex h-14 min-w-14 items-center justify-center rounded-lg border border-border bg-secondary px-3 text-base font-medium text-secondary-foreground transition-all',
              playingIndex === i && 'scale-105 border-primary bg-primary text-primary-foreground',
            )}
          >
            {chord}
          </div>
        ))
      )}
    </div>
  )
}

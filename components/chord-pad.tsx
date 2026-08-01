'use client'

import { CHORD_LIST, type ChordName } from '@/lib/chords'
import { cn } from '@/lib/utils'

type ChordPadProps = {
  activeChord: ChordName | null
  onChordClick: (chord: ChordName) => void
}

export function ChordPad({ activeChord, onChordClick }: ChordPadProps) {
  return (
    <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
      {CHORD_LIST.map((chord) => (
        <button
          key={chord}
          type="button"
          onClick={() => onChordClick(chord)}
          className={cn(
            'flex h-16 items-center justify-center rounded-lg border border-border bg-card text-lg font-medium text-card-foreground transition-colors',
            'hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            activeChord === chord && 'border-primary bg-primary text-primary-foreground',
          )}
        >
          {chord}
        </button>
      ))}
    </div>
  )
}

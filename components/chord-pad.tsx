'use client'

import { CHORD_DISPLAY_NAMES, CHORD_SECTIONS, type ChordName } from '@/lib/chords'
import { cn } from '@/lib/utils'

type ChordPadProps = {
  activeChord: ChordName | null
  onChordClick: (chord: ChordName) => void
}

export function ChordPad({ activeChord, onChordClick }: ChordPadProps) {
  return (
    <div className="space-y-6">
      {CHORD_SECTIONS.map((section) => (
        <div key={section.title}>
          <h2 className="mb-3 text-xl font-bold text-foreground">{section.title}</h2>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-7">
            {section.chords.map((chord) => (
              <button
                key={chord}
                type="button"
                onClick={() => onChordClick(chord)}
                className={cn(
                  'flex h-12 items-center justify-center rounded-lg border border-border bg-card text-base font-medium text-card-foreground transition-colors',
                  'hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  activeChord === chord && 'border-primary bg-primary text-primary-foreground',
                )}
              >
                {CHORD_DISPLAY_NAMES[chord]}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

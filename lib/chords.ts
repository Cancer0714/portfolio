// Chord definitions. Each chord maps to the notes (with octave) played by the synth.
// "-5" indicates a flattened fifth (diminished flavor).

export type ChordName =
  | 'C'
  | 'Cm'
  | 'D'
  | 'Dm'
  | 'Dm-5'
  | 'Em'
  | 'Eb'
  | 'F'
  | 'Fm'
  | 'G'
  | 'Gm'
  | 'Am'
  | 'Am-5'
  | 'Bm'
  | 'Bm-5'
  | 'Ab'
  | 'Bb'
  | 'Bbm'
  | 'Db'
  | 'F#m'
  | 'F#m-5'

export const CHORD_NOTES: Record<ChordName, string[]> = {
  C: ['C4', 'E4', 'G4'],
  Cm: ['C4', 'Eb4', 'G4'],
  D: ['D4', 'F#4', 'A4'],
  Dm: ['D4', 'F4', 'A4'],
  'Dm-5': ['D4', 'F4', 'Ab4'],
  Em: ['E4', 'G4', 'B4'],
  Eb: ['Eb4', 'G4', 'Bb4'],
  F: ['F4', 'A4', 'C5'],
  Fm: ['F4', 'Ab4', 'C5'],
  G: ['G4', 'B4', 'D5'],
  Gm: ['G4', 'Bb4', 'D5'],
  Am: ['A4', 'C5', 'E5'],
  'Am-5': ['A4', 'C5', 'Eb5'],
  Bm: ['B4', 'D5', 'F#5'],
  'Bm-5': ['B4', 'D5', 'F5'],
  Ab: ['Ab4', 'C5', 'Eb5'],
  Bb: ['Bb4', 'D5', 'F5'],
  Bbm: ['Bb4', 'Db5', 'F5'],
  Db: ['Db4', 'F4', 'Ab4'],
  'F#m': ['F#4', 'A4', 'C#5'],
  'F#m-5': ['Gb4', 'A4', 'C5'],
}

export const CHORD_DISPLAY_NAMES: Record<ChordName, string> = {
  C: 'C',
  Cm: 'Cm',
  D: 'D',
  Dm: 'Dm',
  'Dm-5': 'Dm♭5',
  Em: 'Em',
  Eb: 'E♭',
  F: 'F',
  Fm: 'Fm',
  G: 'G',
  Gm: 'Gm',
  Am: 'Am',
  'Am-5': 'Am♭5',
  Bm: 'Bm',
  'Bm-5': 'Bm♭5',
  Ab: 'A♭',
  Bb: 'B♭',
  Bbm: 'B♭m',
  Db: 'D♭',
  'F#m': 'F♯m',
  'F#m-5': 'F♯m♭5',
}

export const CHORD_COLORS: Record<ChordName, string> = {
  C: 'bg-red-500',
  Cm: 'bg-red-700',
  D: 'bg-yellow-500',
  Dm: 'bg-orange-500',
  'Dm-5': 'bg-orange-600',
  Em: 'bg-green-500',
  Eb: 'bg-green-300',
  F: 'bg-purple-500',
  Fm: 'bg-purple-700',
  G: 'bg-blue-500',
  Gm: 'bg-blue-700',
  Am: 'bg-pink-500',
  'Am-5': 'bg-pink-700',
  Bm: 'bg-gray-500',
  'Bm-5': 'bg-gray-600',
  Ab: 'bg-amber-700',
  Bb: 'bg-yellow-600',
  Bbm: 'bg-amber-800',
  Db: 'bg-purple-300',
  'F#m': 'bg-cyan-500',
  'F#m-5': 'bg-cyan-700',
}

export const CHORD_LIST: ChordName[] = [
  'C',
  'Dm',
  'Em',
  'F',
  'G',
  'Am',
  'Bm',
  'Cm',
  'Eb',
  'Fm',
  'Gm',
  'Ab',
  'Bb',
  'Bbm',
  'Db',
  'D',
  'F#m',
]

export type ChordSection = {
  title: string
  chords: ChordName[]
}

export const CHORD_SECTIONS: ChordSection[] = [
  {
    title: 'C Major',
    chords: ['C', 'Dm', 'Em', 'F', 'G', 'Am', 'Bm'],
  },
  {
    title: 'C Minor',
    chords: ['Cm', 'Dm', 'Eb', 'Fm', 'Gm', 'Ab', 'Bb'],
  },
  {
    title: 'F Major',
    chords: ['F', 'Gm', 'Am', 'Bb', 'C', 'Dm', 'Em'],
  },
  {
    title: 'F Minor',
    chords: ['Fm', 'Gm', 'Ab', 'Bbm', 'Cm', 'Db', 'Eb'],
  },
  {
    title: 'G Major',
    chords: ['G', 'Am', 'Bm', 'C', 'D', 'Em', 'F#m'],
  },
  {
    title: 'G Minor',
    chords: ['Gm', 'Am', 'Bb', 'Cm', 'Dm', 'Eb', 'F'],
  },
]

export const SUGGESTION_CHORDS: ChordName[] = Array.from(
  new Set(CHORD_SECTIONS.flatMap((section) => section.chords)),
)

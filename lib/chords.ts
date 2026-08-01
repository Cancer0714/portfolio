// Chord definitions. Each chord maps to the notes (with octave) played by the synth.
// "-5" indicates a flattened fifth (diminished flavor).

export type ChordName =
  | 'C'
  | 'Cm'
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
  | 'Db'
  | 'F#m-5'

export const CHORD_NOTES: Record<ChordName, string[]> = {
  C: ['C4', 'E4', 'G4'],
  Cm: ['C4', 'Eb4', 'G4'],
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
  Bm: ['B4', 'D5', 'Gb5'],
  'Bm-5': ['B4', 'D5', 'F5'],
  Ab: ['Ab4', 'C5', 'Eb5'],
  Bb: ['Bb4', 'D5', 'F5'],
  Db: ['Db4', 'F4', 'Ab4'],
  'F#m-5': ['Gb4', 'A4', 'C5'],
}

export const CHORD_LIST: ChordName[] = [
  'C',
  'Cm',
  'Dm',
  'Dm-5',
  'Em',
  'Eb',
  'F',
  'Fm',
  'G',
  'Gm',
  'Am',
  'Am-5',
  'Bm',
  'Bm-5',
  'Ab',
  'Bb',
  'Db',
  'F#m-5',
]

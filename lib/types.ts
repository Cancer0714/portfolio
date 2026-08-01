import type { ChordName } from './chords'

export type Progression = {
  id: string
  title: string
  chords: ChordName[]
  created_at: string
}

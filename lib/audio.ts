import * as Tone from 'tone'
import { CHORD_NOTES, type ChordName } from './chords'

let synth: Tone.PolySynth | null = null

async function getSynth(): Promise<Tone.PolySynth> {
  // Tone requires a user gesture before the AudioContext can start.
  await Tone.start()
  if (!synth) {
    synth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.02, decay: 0.15, sustain: 0.4, release: 0.6 },
    }).toDestination()
    synth.volume.value = -8
  }
  return synth
}

// Play a single chord immediately for the given duration (default ~0.8s).
export async function playChord(chord: ChordName, duration = '0.8n') {
  const s = await getSynth()
  const notes = CHORD_NOTES[chord]
  s.triggerAttackRelease(notes, duration)
}

export type PlaybackHandle = {
  stop: () => void
}

// Play a sequence of chords one after another at a fixed tempo.
// onStep is called with the index of the chord currently playing (or null when finished).
export async function playSequence(
  chords: ChordName[],
  opts: { bpm?: number; onStep?: (index: number | null) => void } = {},
): Promise<PlaybackHandle> {
  const { bpm = 90, onStep } = opts
  const s = await getSynth()

  const beatMs = (60 / bpm) * 1000 * 2 // one chord per two beats (half note)
  const timeouts: ReturnType<typeof setTimeout>[] = []
  let stopped = false

  chords.forEach((chord, i) => {
    const t = setTimeout(() => {
      if (stopped) return
      onStep?.(i)
      s.triggerAttackRelease(CHORD_NOTES[chord], (beatMs / 1000) * 0.9)
    }, beatMs * i)
    timeouts.push(t)
  })

  const endTimeout = setTimeout(() => {
    if (!stopped) onStep?.(null)
  }, beatMs * chords.length)
  timeouts.push(endTimeout)

  return {
    stop: () => {
      stopped = true
      timeouts.forEach(clearTimeout)
      s.releaseAll()
      onStep?.(null)
    },
  }
}

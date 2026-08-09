

import * as Tone from 'tone'
import { CHORD_NOTES, type ChordName } from './chords'

export type Waveform = 'sine' | 'triangle' | 'square' | 'sawtooth'

let synth: Tone.PolySynth | null = null
let currentWaveform: Waveform = 'triangle'

async function getSynth(waveform: Waveform = 'triangle'): Promise<Tone.PolySynth> {
  await Tone.start()

  if (!synth || currentWaveform !== waveform) {
    synth?.dispose()
    synth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: waveform },
      envelope: { attack: 0.02, decay: 0.15, sustain: 0.4, release: 0.6 },
    }).toDestination()
    synth.volume.value = -8
    currentWaveform = waveform
  }

  return synth
}

function playChordNotes(synth: Tone.PolySynth, notes: string[], duration: string | number) {
  synth.triggerAttackRelease(notes, duration)
}

// Play a single chord immediately for the given duration (default ~0.8s).
export async function playChord(
  chord: ChordName,
  duration = '0.8n',
  waveform: Waveform = 'triangle',
) {
  const s = await getSynth(waveform)
  const notes = CHORD_NOTES[chord]
  playChordNotes(s, notes, duration)
}

export type PlaybackHandle = {
  stop: () => void
}

// Play a sequence of chords one after another at a fixed tempo.
// onStep is called with the index of the chord currently playing (or null when finished).
export async function playSequence(
  chords: ChordName[],
  opts: {
    bpm?: number
    waveform?: Waveform
    onStep?: (index: number | null) => void
  } = {},
): Promise<PlaybackHandle> {
  const { bpm = 90, waveform = 'triangle', onStep } = opts
  const s = await getSynth(waveform)

  const beatMs = (60 / bpm) * 1000 * 2 // one chord per two beats (half note)
  const duration = (beatMs / 1000) * 0.9
  const timeouts: ReturnType<typeof setTimeout>[] = []
  let stopped = false

  chords.forEach((chord, i) => {
    const t = setTimeout(() => {
      if (stopped) return
      onStep?.(i)
      playChordNotes(s, CHORD_NOTES[chord], duration)
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

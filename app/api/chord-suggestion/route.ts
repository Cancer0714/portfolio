import { NextResponse } from 'next/server'
import { SUGGESTION_CHORDS, type ChordName } from '@/lib/chords'

const ALLOWED = new Set<ChordName>(SUGGESTION_CHORDS)

function normalizeChordList(value: unknown): ChordName[] {
  if (!Array.isArray(value)) return []
  return value.filter((item): item is ChordName => {
    return typeof item === 'string' && ALLOWED.has(item as ChordName)
  })
}

const CHORD_KEYWORDS: Array<{ keywords: string[]; chords: ChordName[] }> = [
  { keywords: ['happy', 'bright', 'joy', 'upbeat', 'sunny', 'celebrate', 'optimistic'], chords: ['C', 'F', 'G', 'Am', 'Em', 'D'] },
  { keywords: ['calm', 'peaceful', 'gentle', 'soft', 'warm', 'serene'], chords: ['Em', 'Am', 'G', 'C', 'Dm', 'Eb'] },
  { keywords: ['sad', 'melancholy', 'blue', 'tear', 'lonely', 'nostalgic'], chords: ['Cm', 'Dm', 'Fm', 'Gm', 'Eb', 'Bb'] },
  { keywords: ['dark', 'moody', 'gloomy', 'rainy', 'stormy', 'mysterious'], chords: ['Cm', 'Gm', 'Fm', 'Bb', 'Eb', 'Db'] },
  { keywords: ['romantic', 'dreamy', 'lush', 'love', 'gentle love', 'sweet'], chords: ['Em', 'Am', 'C', 'G', 'Eb', 'Dm'] },
  { keywords: ['dramatic', 'epic', 'powerful', 'cinematic', 'heroic'], chords: ['F#m', 'G', 'D', 'Am', 'Bm', 'C'] },
  { keywords: ['energetic', 'dance', 'party', 'excited', 'punchy'], chords: ['G', 'D', 'C', 'F', 'Am', 'Em'] },
  { keywords: ['soulful', 'jazzy', 'groovy', 'cool', 'late night'], chords: ['Bb', 'Gm', 'Eb', 'Cm', 'F', 'Dm'] },
  { keywords: ['hopeful', 'motivated', 'confident', 'strong'], chords: ['C', 'F', 'G', 'Am', 'D', 'Em'] },
  { keywords: ['night', 'midnight', 'quiet', 'slow', 'sleepy'], chords: ['Bbm', 'Gm', 'Cm', 'Eb', 'F', 'Am'] },
]

function pickSuggestions(prompt: string): ChordName[] {
  const lower = prompt.toLowerCase()
  const scoreMap = new Map<ChordName, number>()

  for (const { keywords, chords } of CHORD_KEYWORDS) {
    const matched = keywords.some((keyword) => lower.includes(keyword))
    if (!matched) continue

    for (const chord of chords) {
      scoreMap.set(chord, (scoreMap.get(chord) ?? 0) + 3)
    }
  }

  const explicitMatches = Array.from(scoreMap.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([chord]) => chord)

  if (explicitMatches.length > 0) {
    const ordered = Array.from(new Set(explicitMatches))
    return ordered.slice(0, 6)
  }

  return ['C', 'F', 'G', 'Am', 'Em', 'Dm']
}

async function callGemini(prompt: string): Promise<ChordName[]> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) return []

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Return only a JSON array of 4 to 6 chord names selected exclusively from this exact list: ${SUGGESTION_CHORDS.join(', ')}. Match the mood: ${prompt}. Do not include other chords or text.`,
            }],
          }],
        }),
      },
    )

    if (!response.ok) {
      return []
    }

    const data = await response.json()
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
    const cleaned = text.replace(/```json|```/gi, '').trim()

    try {
      const parsed = JSON.parse(cleaned)
      const normalized = normalizeChordList(parsed)
      if (normalized.length > 0) return normalized.slice(0, 6)
    } catch {
      // fallback to prompt-based matching below
    }

    const extracted = cleaned
      .match(/[A-G](?:#|b)?m?/g)
      ?.filter((item) => ALLOWED.has(item as ChordName))
      .filter((item, index, arr) => arr.indexOf(item) === index)
      .slice(0, 6)

    if (extracted && extracted.length > 0) {
      return extracted as ChordName[]
    }

    return []
  } catch {
    return []
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const prompt = typeof body?.prompt === 'string' ? body.prompt : ''

    if (!prompt.trim()) {
      return NextResponse.json({ error: 'prompt is required' }, { status: 400 })
    }

    const geminiSuggestions = await callGemini(prompt)
    const suggestions = geminiSuggestions.length > 0 ? geminiSuggestions : pickSuggestions(prompt)

    return NextResponse.json({ chords: suggestions })
  } catch (error) {
    console.error('[v0] chord suggestion route error:', error)
    return NextResponse.json({ error: 'failed to generate suggestion' }, { status: 500 })
  }
}

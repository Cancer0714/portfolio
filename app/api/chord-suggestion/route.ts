import { NextResponse } from 'next/server'
import { SUGGESTION_CHORDS, type ChordName } from '@/lib/chords'

const ALLOWED = new Set<ChordName>(SUGGESTION_CHORDS)

function normalizeChordList(value: unknown): ChordName[] {
  if (!Array.isArray(value)) return []
  return value.filter((item): item is ChordName => {
    return typeof item === 'string' && ALLOWED.has(item as ChordName)
  })
}

const MOOD_MAP: Record<string, ChordName[]> = {
  happy: ['C', 'F', 'G', 'Am', 'Em'],
  bright: ['C', 'F', 'G', 'Am', 'Em'],
  sunny: ['C', 'F', 'G', 'Am', 'Em'],
  calm: ['Em', 'Am', 'G', 'C', 'Dm'],
  gentle: ['Dm', 'Em', 'Am', 'C', 'G'],
  sad: ['Cm', 'Dm', 'Fm', 'Gm', 'Eb'],
  moody: ['Cm', 'Fm', 'Gm', 'Eb', 'Bb'],
  dark: ['Cm', 'Fm', 'Gm', 'Eb', 'Bb'],
  rainy: ['Gm', 'Cm', 'Eb', 'Bb', 'Fm'],
  dreamy: ['Am', 'Em', 'Eb', 'Bbm', 'G'],
  romantic: ['Em', 'Am', 'C', 'Eb', 'G'],
  upbeat: ['C', 'F', 'G', 'Am', 'D'],
  energetic: ['G', 'D', 'C', 'F', 'Am'],
  dramatic: ['Bm', 'Db', 'F#m', 'G', 'Am'],
  epic: ['F#m', 'G', 'D', 'Am', 'C'],
  nostalgic: ['Am', 'Em', 'F', 'C', 'G'],
  soulful: ['Bb', 'Gm', 'Eb', 'Cm', 'F'],
}

function pickSuggestions(prompt: string): ChordName[] {
  const lower = prompt.toLowerCase()
  const matches = Object.entries(MOOD_MAP)
    .filter(([keyword]) => lower.includes(keyword))
    .flatMap(([, chords]) => chords)

  if (matches.length > 0) {
    const unique = Array.from(new Set(matches))
    return unique.slice(0, 6)
  }

  return ['C', 'Dm', 'Em', 'F', 'G', 'Am']
}

async function callGemini(prompt: string): Promise<ChordName[]> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) return []

  try {
    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + apiKey,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `You are a chord progression assistant. Return only a JSON array of chord names from this exact allowed list: ${SUGGESTION_CHORDS.join(', ')}. The array should contain 4 to 6 chord names matching the emotion or mood: ${prompt}. No extra text, no markdown.`,
                },
              ],
            },
          ],
        }),
      },
    )

    if (!response.ok) {
      return []
    }

    const data = await response.json()
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
    const jsonText = text.replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(jsonText)
    return normalizeChordList(parsed)
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

    return NextResponse.json({
      chords: suggestions,
    })
  } catch (error) {
    console.error('[v0] chord suggestion route error:', error)
    return NextResponse.json({ error: 'failed to generate suggestion' }, { status: 500 })
  }
}

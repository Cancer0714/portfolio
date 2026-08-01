'use client'

import { Play, Trash2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Progression } from '@/lib/types'

type HistoryPanelProps = {
  open: boolean
  progressions: Progression[]
  onClose: () => void
  onPlay: (p: Progression) => void
  onDelete: (id: string) => void
}

export function HistoryPanel({
  open,
  progressions,
  onClose,
  onPlay,
  onDelete,
}: HistoryPanelProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-black/60" onClick={onClose}>
      <aside
        className="flex h-full w-full max-w-md flex-col border-l border-border bg-card text-card-foreground"
        onClick={(e) => e.stopPropagation()}
        aria-label="保存履歴"
      >
        <header className="flex items-center justify-between border-b border-border p-4">
          <h2 className="text-lg font-semibold">保存履歴</h2>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="閉じる">
            <X className="size-5" />
          </Button>
        </header>

        <div className="flex-1 overflow-y-auto p-4">
          {progressions.length === 0 ? (
            <p className="mt-8 text-center text-sm text-muted-foreground">
              保存されたコード進行はありません
            </p>
          ) : (
            <ul className="flex flex-col gap-3">
              {progressions.map((p) => (
                <li
                  key={p.id}
                  className="rounded-lg border border-border bg-secondary/40 p-4"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-medium">{p.title}</h3>
                    <span className="text-xs text-muted-foreground">
                      {new Date(p.created_at).toLocaleString('ja-JP', {
                        month: 'numeric',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="mt-2 font-mono text-sm text-muted-foreground">
                    {p.chords.join('  ')}
                  </p>
                  <div className="mt-3 flex gap-2">
                    <Button size="sm" onClick={() => onPlay(p)}>
                      <Play className="size-4" />
                      再生
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onDelete(p.id)}
                      aria-label="削除"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>
    </div>
  )
}

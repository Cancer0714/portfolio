'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { ChordName } from '@/lib/chords'

type SaveDialogProps = {
  open: boolean
  chords: ChordName[]
  saving?: boolean
  onClose: () => void
  onSave: (title: string) => void
}

export function SaveDialog({ open, chords, saving = false, onClose, onSave }: SaveDialogProps) {
  const [title, setTitle] = useState('')

  useEffect(() => {
    if (open) setTitle('')
  }, [open])

  if (!open) return null

  const handleSubmit = () => {
    const trimmed = title.trim()
    if (!trimmed || saving) return
    onSave(trimmed)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl border border-border bg-card p-6 text-card-foreground shadow-lg"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="save-dialog-title"
      >
        <h2 id="save-dialog-title" className="text-lg font-semibold">
          コード進行を保存
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {chords.join('  ') || 'コードがありません'}
        </p>

        <div className="mt-4 flex flex-col gap-2">
          <Label htmlFor="progression-title">タイトル</Label>
          <Input
            id="progression-title"
            value={title}
            autoFocus
            placeholder="例: 王道進行"
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.nativeEvent.isComposing && e.keyCode !== 229) {
                handleSubmit()
              }
            }}
          />
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            キャンセル
          </Button>
          <Button onClick={handleSubmit} disabled={!title.trim() || saving}>
            {saving ? '保存中...' : '保存'}
          </Button>
        </div>
      </div>
    </div>
  )
}

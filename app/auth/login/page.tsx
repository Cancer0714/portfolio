'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

// 資格情報・存在シグナルのみ汎用化する（メール登録の有無を明かさないため）。
// ユーザーが対処すべきエラーはそのまま伝え、想定外は想定外として報告する。
function loginErrorMessage(error: unknown): string {
  const { code, status } = (error ?? {}) as { code?: string; status?: number }

  if (code === 'email_not_confirmed') {
    return 'メールアドレスの確認が必要です。受信トレイの確認リンクをご確認ください。'
  }
  if (code === 'over_request_rate_limit' || status === 429) {
    return '試行回数が多すぎます。しばらく待ってから再度お試しください。'
  }
  if (code === 'invalid_credentials') {
    return 'メールアドレスまたはパスワードが正しくありません。'
  }
  return '問題が発生しました。もう一度お試しください。'
}

export default function Page() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      router.push('/')
    } catch (error: unknown) {
      console.error('Login error:', error)
      setError(loginErrorMessage(error))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-background p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            ChordPad
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            コード進行メーカー
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">ログイン</CardTitle>
            <CardDescription>
              メールアドレスとパスワードでログインします
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="email">メールアドレス</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">パスワード</Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'ログイン中...' : 'ログイン'}
                </Button>
              </div>
              <div className="mt-4 text-center text-sm text-muted-foreground">
                アカウントをお持ちでないですか？{' '}
                <Link
                  href="/auth/sign-up"
                  className="text-foreground underline underline-offset-4"
                >
                  新規登録
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

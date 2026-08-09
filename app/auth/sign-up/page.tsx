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

// メール登録済みかどうかは明かさないため、フォールバックは汎用のまま。
// 入力に関する検証エラーは列挙攻撃のオラクルにならないため表示する。
function signUpErrorMessage(error: unknown): string {
  const { code, status } = (error ?? {}) as { code?: string; status?: number }

  if (code === 'weak_password') {
    return 'より強力なパスワードを選択してください。'
  }
  if (code === 'email_address_invalid') {
    return '実在するメールアドレスを使用してください（example / test ドメインは使用できません）。'
  }
  if (code === 'email_address_not_authorized') {
    return 'このアドレスには確認メールを送信できません。別のアドレスをお試しください。'
  }
  if (code === 'validation_failed') {
    return '入力内容をご確認ください。'
  }
  if (code === 'over_email_send_rate_limit' || status === 429) {
    return '試行回数が多すぎます。しばらく待ってから再度お試しください。'
  }
  return '登録を完了できませんでした。もう一度お試しください。'
}

export default function Page() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [repeatPassword, setRepeatPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    if (password !== repeatPassword) {
      setError('パスワードが一致しません')
      setIsLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo:
            process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ??
            `${window.location.origin}/auth/callback`,
        },
      })
      if (error) throw error
      router.push('/auth/sign-up-success')
    } catch (error: unknown) {
      console.error('Sign-up error:', error)
      setError(signUpErrorMessage(error))
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
            <CardTitle className="text-xl">新規登録</CardTitle>
            <CardDescription>新しいアカウントを作成します</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignUp}>
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
                <div className="grid gap-2">
                  <Label htmlFor="repeat-password">パスワード（確認）</Label>
                  <Input
                    id="repeat-password"
                    type="password"
                    required
                    value={repeatPassword}
                    onChange={(e) => setRepeatPassword(e.target.value)}
                  />
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'アカウント作成中...' : '新規登録'}
                </Button>
              </div>
              <div className="mt-4 text-center text-sm text-muted-foreground">
                すでにアカウントをお持ちですか？{' '}
                <Link
                  href="/auth/login"
                  className="text-foreground underline underline-offset-4"
                >
                  ログイン
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

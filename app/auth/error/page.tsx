import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-background p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">認証エラー</CardTitle>
            <CardDescription>
              認証中に問題が発生しました
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              リンクの有効期限が切れているか、無効です。もう一度ログインをお試しください。
            </p>
            <Button asChild className="w-full">
              <Link href="/auth/login">ログインへ戻る</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

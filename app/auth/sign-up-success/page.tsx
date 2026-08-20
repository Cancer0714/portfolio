import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import Link from 'next/link'

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-background p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">ご登録ありがとうございます</CardTitle>
            <CardDescription>確認メールをご確認ください</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground leading-relaxed">
              登録が完了しました。ログインする前に、確認メール内のリンクをクリックしてアカウントを有効化してください。
            </p>
            <Link
              href="/"
              className="mt-4 block text-center text-sm text-foreground underline underline-offset-4"
            >
              トップページへ戻る
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

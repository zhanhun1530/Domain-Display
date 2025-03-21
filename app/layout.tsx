import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '域名展示',
  description: '使用Ai生成',
  generator: 'v0.dev',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  )
}

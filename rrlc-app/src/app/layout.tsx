import './globals.css'
import Provider  from '@/app/provider'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'RRLC App',
  description: 'Redwood Region Logging Conference App',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body>
        <Provider>{children}</Provider>
      </body>
    </html>
  )
}

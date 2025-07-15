import './globals.css'
import { Provider } from '@/components/ui/provider'
import type { Metadata } from 'next'
import Navbar from '@/components/navbar'

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
        <Provider>
          <Navbar />
          {children}
        </Provider>
      </body>
    </html>
  )
}

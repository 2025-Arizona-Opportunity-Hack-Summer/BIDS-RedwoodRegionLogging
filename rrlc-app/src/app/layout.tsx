import './globals.css'
import { Provider } from '@/components/ui/provider'
import { AuthProvider } from '@/contexts/AuthContext'
import type { Metadata } from 'next'
import Navbar from '@/components/navbar'

export const metadata: Metadata = {
  title: 'RRLC Scholarship Portal',
  description: 'Redwood Region Logging Conference Scholarship Management System',
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
          <AuthProvider>
            <Navbar />
            {children}
          </AuthProvider>
        </Provider>
      </body>
    </html>
  )
}

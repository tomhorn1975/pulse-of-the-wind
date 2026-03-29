import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Pulse of the Wind Raffle | TJ\'s Race',
  description: 'Support our charity — buy raffle tickets online for a chance to win amazing prizes.',
  openGraph: {
    title: 'Pulse of the Wind Raffle',
    description: 'Support our charity and win amazing prizes.',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        {children}
      </body>
    </html>
  )
}

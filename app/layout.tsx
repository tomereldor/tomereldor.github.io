import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'TOMER ELDOR // DEFENSE SYSTEM',
  description: 'AI-powered portfolio defense — challenge my qualifications, ARIA will defend them.',
  openGraph: {
    title: 'Tomer Eldor — AI Defense Portfolio',
    description: 'Try to attack my resume. My AI agent will defend it with evidence.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scanlines">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="bg-grid" style={{ background: 'var(--void)', height: '100vh', overflow: 'hidden' }}>
        {children}
      </body>
    </html>
  )
}

import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'NexusPay',
  description: 'Controla y planifica tus pagos recurrentes',
  manifest: '/manifest.json',
  other: {
    'mobile-web-app-capable': 'yes',
  },
}

export const viewport: Viewport = {
  themeColor: '#0058BE',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1, // Prevent zoom on input focus (mobile UX)
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>
        {/* Max-width wrapper — looks great on desktop too */}
        <div className="mx-auto max-w-md min-h-screen relative">
          {children}
        </div>
      </body>
    </html>
  )
}

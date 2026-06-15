import type { Metadata } from 'next'
import './globals.css'
import { CartProvider } from '@/components/CartContext'
import Navbar from '@/components/Navbar'

export const metadata: Metadata = {
  title: 'ServiceStore - Professional Services',
  description: 'Buy professional services online: web design, SEO, consulting, and more.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-sans bg-gray-50 min-h-screen">
        <CartProvider>
          <Navbar />
          <main>{children}</main>
        </CartProvider>
      </body>
    </html>
  )
}

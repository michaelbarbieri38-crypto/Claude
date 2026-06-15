'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useCart } from '@/components/CartContext'

export default function SuccessPage() {
  const { dispatch } = useCart()
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')

  useEffect(() => {
    dispatch({ type: 'CLEAR_CART' })
  }, [dispatch])

  return (
    <div className="max-w-xl mx-auto px-4 py-24 text-center">
      <div className="flex justify-center mb-6">
        <div className="bg-green-100 rounded-full p-4">
          <svg className="h-16 w-16 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </div>
      <h1 className="text-4xl font-extrabold text-gray-900 mb-3">Thank You!</h1>
      <p className="text-xl text-gray-600 mb-2">Your order has been confirmed!</p>
      <p className="text-gray-400 text-sm mb-8">
        We will send you a confirmation email shortly. You can expect delivery within the specified timeframe.
      </p>
      {sessionId && (
        <p className="text-xs text-gray-300 mb-8 font-mono break-all">
          Session ID: {sessionId}
        </p>
      )}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          href="/"
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
        >
          Back to Home
        </Link>
        <Link
          href="/admin"
          className="border border-indigo-600 text-indigo-600 hover:bg-indigo-50 font-semibold px-6 py-3 rounded-lg transition-colors"
        >
          View Admin Dashboard
        </Link>
      </div>
    </div>
  )
}

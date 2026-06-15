'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/components/CartContext'

export default function CheckoutPage() {
  const { state, total } = useCart()
  const router = useRouter()
  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: state.items, customerName, customerEmail }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        setError('Failed to create checkout session.')
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (state.items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <h2 className="text-2xl font-bold text-gray-700 mb-4">Your cart is empty</h2>
        <a href="/" className="text-indigo-600 hover:underline">Browse Services</a>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Checkout</h1>
      <div className="md:flex gap-8">
        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 bg-white rounded-xl shadow p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Your Information</h2>
          {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="name">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              required
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Jane Doe"
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              required
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="jane@example.com"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-colors text-lg flex items-center justify-center gap-2"
          >
            {loading ? 'Redirecting...' : 'Pay with Stripe'}
            {!loading && (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            )}
          </button>
        </form>

        {/* Order Summary */}
        <div className="md:w-72 mt-6 md:mt-0">
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>
            <ul className="divide-y divide-gray-100 mb-4">
              {state.items.map((item) => (
                <li key={item.id} className="py-2 flex justify-between text-sm text-gray-700">
                  <span>
                    {item.name} × {item.quantity}
                  </span>
                  <span className="font-semibold">${((item.price * item.quantity) / 100).toFixed(2)}</span>
                </li>
              ))}
            </ul>
            <div className="border-t pt-4 flex justify-between font-extrabold text-gray-900">
              <span>Total</span>
              <span>${(total / 100).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

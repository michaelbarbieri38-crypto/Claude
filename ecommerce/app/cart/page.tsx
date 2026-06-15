'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '@/components/CartContext'

export default function CartPage() {
  const { state, dispatch, total } = useCart()

  if (state.items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <svg className="mx-auto h-16 w-16 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <h2 className="text-2xl font-bold text-gray-700 mb-2">Your cart is empty</h2>
        <p className="text-gray-400 mb-6">Browse our services and add some to your cart.</p>
        <Link href="/" className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors">
          Browse Services
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Your Cart</h1>
      <div className="md:flex gap-8">
        {/* Items */}
        <div className="flex-1">
          <ul className="divide-y divide-gray-200 bg-white rounded-xl shadow overflow-hidden">
            {state.items.map((item) => (
              <li key={item.id} className="flex items-center gap-4 p-4">
                <div className="relative h-16 w-16 rounded-lg overflow-hidden flex-shrink-0">
                  <Image src={item.image} alt={item.name} fill className="object-cover" sizes="64px" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{item.name}</p>
                  <p className="text-indigo-600 font-bold">${(item.price / 100).toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => dispatch({ type: 'UPDATE_QUANTITY', payload: { id: item.id, quantity: item.quantity - 1 } })}
                    className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors text-gray-600 font-bold"
                  >
                    -
                  </button>
                  <span className="w-6 text-center font-semibold">{item.quantity}</span>
                  <button
                    onClick={() => dispatch({ type: 'UPDATE_QUANTITY', payload: { id: item.id, quantity: item.quantity + 1 } })}
                    className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors text-gray-600 font-bold"
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={() => dispatch({ type: 'REMOVE_ITEM', payload: { id: item.id } })}
                  className="text-red-400 hover:text-red-600 text-sm font-medium ml-2 transition-colors"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Summary */}
        <div className="md:w-72 mt-6 md:mt-0">
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>
            <div className="flex justify-between text-gray-600 mb-2">
              <span>Subtotal</span>
              <span>${(total / 100).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600 mb-4">
              <span>Tax</span>
              <span>$0.00</span>
            </div>
            <div className="border-t pt-4 flex justify-between font-extrabold text-gray-900 text-lg">
              <span>Total</span>
              <span>${(total / 100).toFixed(2)}</span>
            </div>
            <Link
              href="/checkout"
              className="mt-6 block text-center bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-colors"
            >
              Proceed to Checkout
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

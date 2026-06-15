'use client'

import Image from 'next/image'
import { useCart } from '@/components/CartContext'

export default function CartDrawer() {
  const { state, dispatch, total } = useCart()

  if (state.items.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500">
        <p className="text-lg font-medium">Your cart is empty</p>
        <p className="text-sm mt-1">Add some services to get started.</p>
      </div>
    )
  }

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold text-gray-900 mb-4">Cart Summary</h2>
      <ul className="divide-y divide-gray-100">
        {state.items.map((item) => (
          <li key={item.id} className="flex items-center gap-3 py-3">
            <div className="relative h-12 w-12 rounded overflow-hidden flex-shrink-0">
              <Image src={item.image} alt={item.name} fill className="object-cover" sizes="48px" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">{item.name}</p>
              <p className="text-xs text-gray-500">
                ${(item.price / 100).toFixed(2)} × {item.quantity}
              </p>
            </div>
            <button
              onClick={() => dispatch({ type: 'REMOVE_ITEM', payload: { id: item.id } })}
              className="text-red-400 hover:text-red-600 text-xs font-medium transition-colors"
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
      <div className="mt-4 border-t pt-4 flex justify-between font-bold text-gray-900">
        <span>Total</span>
        <span>${(total / 100).toFixed(2)}</span>
      </div>
    </div>
  )
}

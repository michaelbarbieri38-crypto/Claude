'use client'

import { useCart } from '@/components/CartContext'
import { Service } from '@/lib/services'

export default function AddToCartButton({ service }: { service: Service }) {
  const { dispatch } = useCart()

  return (
    <button
      onClick={() =>
        dispatch({
          type: 'ADD_ITEM',
          payload: {
            id: service.id,
            name: service.name,
            price: service.price,
            quantity: 1,
            image: service.image,
          },
        })
      }
      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-colors text-lg"
    >
      Add to Cart
    </button>
  )
}

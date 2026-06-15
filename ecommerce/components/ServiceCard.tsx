'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Service } from '@/lib/services'
import { useCart } from '@/components/CartContext'

interface Props {
  service: Service
}

export default function ServiceCard({ service }: Props) {
  const { dispatch } = useCart()

  const handleAddToCart = () => {
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

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow flex flex-col">
      <Link href={`/services/${service.id}`} className="relative block h-48 w-full">
        <Image
          src={service.image}
          alt={service.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
      </Link>
      <div className="p-5 flex flex-col flex-1">
        <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wide mb-1">
          {service.category}
        </span>
        <Link href={`/services/${service.id}`}>
          <h3 className="text-lg font-bold text-gray-900 hover:text-indigo-600 transition-colors mb-1">
            {service.name}
          </h3>
        </Link>
        <p className="text-gray-500 text-sm mb-4 flex-1 line-clamp-2">
          {service.description}
        </p>
        <div className="flex items-center justify-between mt-auto">
          <span className="text-2xl font-bold text-gray-900">
            ${(service.price / 100).toFixed(2)}
          </span>
          <button
            onClick={handleAddToCart}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  )
}

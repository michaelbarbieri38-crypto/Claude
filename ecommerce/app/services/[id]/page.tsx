import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getAllServices, getServiceById } from '@/lib/services'
import AddToCartButton from './AddToCartButton'

interface Props {
  params: { id: string }
}

export default function ServiceDetailPage({ params }: Props) {
  const service = getServiceById(params.id)
  if (!service) notFound()

  const related = getAllServices()
    .filter((s) => s.id !== service.id)
    .slice(0, 3)

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link href="/" className="text-indigo-600 hover:underline text-sm mb-6 inline-block">
        ← Back to Services
      </Link>

      <div className="bg-white rounded-2xl shadow-md overflow-hidden md:flex">
        <div className="relative md:w-1/2 h-64 md:h-auto">
          <Image
            src={service.image}
            alt={service.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
        </div>
        <div className="p-8 md:w-1/2 flex flex-col justify-center">
          <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wide mb-2">
            {service.category}
          </span>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-3">{service.name}</h1>
          <p className="text-gray-600 mb-6 leading-relaxed">{service.description}</p>
          <div className="flex items-center gap-6 mb-6">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide">Price</p>
              <p className="text-3xl font-bold text-indigo-600">${(service.price / 100).toFixed(2)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide">Delivery</p>
              <p className="text-lg font-semibold text-gray-800">{service.deliveryTime}</p>
            </div>
          </div>
          <AddToCartButton service={service} />
        </div>
      </div>

      {/* Related services */}
      {related.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Services</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {related.map((s) => (
              <Link
                key={s.id}
                href={`/services/${s.id}`}
                className="bg-white rounded-xl shadow hover:shadow-md transition-shadow p-4 flex items-center gap-4"
              >
                <div className="relative h-16 w-16 rounded-lg overflow-hidden flex-shrink-0">
                  <Image src={s.image} alt={s.name} fill className="object-cover" sizes="64px" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{s.name}</p>
                  <p className="text-indigo-600 font-bold text-sm">${(s.price / 100).toFixed(2)}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

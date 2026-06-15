'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import ServiceCard from '@/components/ServiceCard'
import { Service } from '@/lib/services'

const CATEGORIES = ['All', 'Web Design', 'SEO', 'Branding', 'Marketing', 'Consulting']

export default function HomePage() {
  const [services, setServices] = useState<Service[]>([])
  const [activeCategory, setActiveCategory] = useState('All')

  useEffect(() => {
    fetch('/api/admin/services')
      .then((r) => r.json())
      .then(setServices)
  }, [])

  const filtered =
    activeCategory === 'All'
      ? services
      : services.filter((s) => s.category === activeCategory)

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-indigo-600 to-indigo-800 text-white py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight mb-4">
            Professional Services,<br />Delivered Fast
          </h1>
          <p className="text-indigo-200 text-lg sm:text-xl mb-8 max-w-2xl mx-auto">
            Hire expert freelancers for web design, SEO, branding, marketing, and consulting. Quality work, transparent pricing.
          </p>
          <Link
            href="/#services"
            className="inline-block bg-white text-indigo-700 font-bold px-8 py-3 rounded-full hover:bg-indigo-50 transition-colors shadow-lg"
          >
            Browse Services
          </Link>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Our Services</h2>

        {/* Category filters */}
        <div className="flex flex-wrap gap-2 justify-center mb-10">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors ${
                activeCategory === cat
                  ? 'bg-indigo-600 text-white shadow'
                  : 'bg-white text-gray-700 border border-gray-200 hover:border-indigo-400 hover:text-indigo-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <p className="text-center text-gray-500">No services found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        )}
      </section>
    </>
  )
}

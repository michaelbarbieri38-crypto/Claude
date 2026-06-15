'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const CATEGORIES = ['Web Design', 'SEO', 'Branding', 'Marketing', 'Consulting']

export default function NewServicePage() {
  const router = useRouter()
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    category: CATEGORIES[0],
    deliveryTime: '',
    image: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Failed to add service')
      } else {
        router.push('/admin')
      }
    } catch {
      setError('Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Add New Service</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-8 space-y-5">
        {error && <p className="text-red-500 text-sm">{error}</p>}

        <Field label="Service Name" name="name" value={form.name} onChange={handleChange} required placeholder="e.g. Website Redesign" />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            name="description"
            required
            rows={4}
            value={form.description}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Describe the service..."
          />
        </div>
        <Field label="Price (USD)" name="price" type="number" value={form.price} onChange={handleChange} required placeholder="99.00" step="0.01" min="0" />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <Field label="Delivery Time" name="deliveryTime" value={form.deliveryTime} onChange={handleChange} required placeholder="e.g. 5 days" />
        <Field label="Image URL" name="image" value={form.image} onChange={handleChange} required placeholder="https://picsum.photos/seed/xyz/600/400" />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-colors"
        >
          {loading ? 'Adding...' : 'Add Service'}
        </button>
      </form>
    </div>
  )
}

function Field({
  label, name, value, onChange, required, placeholder, type = 'text', step, min,
}: {
  label: string
  name: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  required?: boolean
  placeholder?: string
  type?: string
  step?: string
  min?: string
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        step={step}
        min={min}
        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
    </div>
  )
}

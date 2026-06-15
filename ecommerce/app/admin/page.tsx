'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Service } from '@/lib/services'
import { Order } from '@/lib/orders'

export default function AdminPage() {
  const [services, setServices] = useState<Service[]>([])
  const [orders, setOrders] = useState<Order[]>([])

  useEffect(() => {
    fetch('/api/admin/services').then((r) => r.json()).then(setServices)
    fetch('/api/orders').then((r) => r.json()).then(setOrders)
  }, [])

  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0)

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this service?')) return
    await fetch(`/api/admin/services/${id}`, { method: 'DELETE' })
    setServices((prev) => prev.filter((s) => s.id !== id))
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">Admin Dashboard</h1>
        <Link
          href="/admin/services/new"
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-2 rounded-lg transition-colors"
        >
          + Add Service
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
        <StatCard label="Total Revenue" value={`$${(totalRevenue / 100).toFixed(2)}`} color="indigo" />
        <StatCard label="Total Orders" value={String(orders.length)} color="green" />
        <StatCard label="Total Services" value={String(services.length)} color="purple" />
      </div>

      {/* Services Table */}
      <h2 className="text-xl font-bold text-gray-800 mb-4">Services</h2>
      <div className="bg-white rounded-xl shadow overflow-hidden mb-12">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {['Name', 'Category', 'Price', 'Delivery', 'Actions'].map((h) => (
                <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {services.map((s) => (
              <tr key={s.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900">{s.name}</td>
                <td className="px-6 py-4 text-gray-500">{s.category}</td>
                <td className="px-6 py-4 text-gray-700 font-semibold">${(s.price / 100).toFixed(2)}</td>
                <td className="px-6 py-4 text-gray-500">{s.deliveryTime}</td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => handleDelete(s.id)}
                    className="text-red-500 hover:text-red-700 text-sm font-medium transition-colors"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Orders Table */}
      <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Orders</h2>
      <div className="bg-white rounded-xl shadow overflow-hidden">
        {orders.length === 0 ? (
          <p className="px-6 py-8 text-center text-gray-400">No orders yet.</p>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {['Order ID', 'Customer', 'Email', 'Total', 'Status', 'Date'].map((h) => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-mono text-xs text-gray-500">{o.id}</td>
                  <td className="px-6 py-4 font-medium text-gray-900">{o.customerName}</td>
                  <td className="px-6 py-4 text-gray-500">{o.customerEmail}</td>
                  <td className="px-6 py-4 font-semibold text-gray-700">${(o.total / 100).toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 capitalize">
                      {o.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-sm">
                    {new Date(o.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  const colors: Record<string, string> = {
    indigo: 'bg-indigo-50 text-indigo-700',
    green: 'bg-green-50 text-green-700',
    purple: 'bg-purple-50 text-purple-700',
  }
  return (
    <div className={`rounded-xl p-6 ${colors[color]}`}>
      <p className="text-sm font-medium opacity-75 mb-1">{label}</p>
      <p className="text-3xl font-extrabold">{value}</p>
    </div>
  )
}

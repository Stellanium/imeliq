'use client'

import { useState } from 'react'
import Link from 'next/link'

const PICKUP_LOCATIONS = {
  courier: 'Kuller (kohaletoimetamine)',
  tallinn: 'Tallinn: Liivalao 14 (Jet Express OÜ, tööajal)',
  parnu: 'Pärnu: Jeti ladu',
  tartu: 'Tartu: Jeti ladu',
  vantaa: 'Vantaa (Soome): Jeti ladu'
}

export default function OrderPage() {
  const [form, setForm] = useState({
    email: '',
    quantity: 1,
    pickup_location: '' as keyof typeof PICKUP_LOCATIONS | '',
    gave_data: true
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const pricePerUnit = form.gave_data ? 1 : 2
  const totalPrice = form.quantity * pricePerUnit

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!form.email || !form.pickup_location) {
      setError('Palun täida kõik väljad!')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: form.email,
          quantity: form.quantity,
          price_per_unit: pricePerUnit,
          pickup_location: form.pickup_location
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Viga tellimuse salvestamisel')
      }

      setSuccess(true)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Midagi läks valesti. Proovi uuesti.'
      setError(errorMessage)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🎉</span>
            </div>
            <h1 className="text-2xl font-bold mb-4 text-gray-800">Tellimus vastu võetud!</h1>
            <p className="text-gray-600 mb-6">
              Võtame sinuga peagi ühendust tellimuse kinnitamiseks.
              <br /><br />
              <strong>Kogus:</strong> {form.quantity} tk<br />
              <strong>Hind:</strong> {totalPrice}€<br />
              <strong>Kättesaamine:</strong> {PICKUP_LOCATIONS[form.pickup_location as keyof typeof PICKUP_LOCATIONS]}
            </p>
            <Link
              href="/"
              className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition"
            >
              Tagasi avalehele
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen py-12 px-4">
      <div className="max-w-md mx-auto">
        <Link href="/" className="text-green-600 hover:text-green-700 mb-6 inline-block">
          ← Tagasi
        </Link>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-2xl font-bold mb-2 text-gray-800">Telli imeliq jooki</h1>
          <p className="text-gray-600 mb-6">
            Meie looduslik energiajook nüüd saadaval!
          </p>

          {/* Pricing info */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-green-800 mb-2">Hinnakiri:</h3>
            <ul className="text-sm text-green-700 space-y-1">
              <li>✓ <strong>1€/tk</strong> - kui andsid tagasiside andmed</li>
              <li>✓ <strong>2€/tk</strong> - ilma andmeteta</li>
            </ul>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="sinu@email.ee"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kogus *
              </label>
              <input
                type="number"
                min="1"
                max="100"
                required
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: parseInt(e.target.value) || 1 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Kas andsid andmed tagasiside ankeedis? *
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={form.gave_data}
                    onChange={() => setForm({ ...form, gave_data: true })}
                    className="h-4 w-4 text-green-600"
                  />
                  <span>Jah (1€/tk)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={!form.gave_data}
                    onChange={() => setForm({ ...form, gave_data: false })}
                    className="h-4 w-4 text-green-600"
                  />
                  <span>Ei (2€/tk)</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Kättesaamise koht *
              </label>
              <div className="space-y-2">
                {Object.entries(PICKUP_LOCATIONS).map(([key, label]) => (
                  <label
                    key={key}
                    className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                      form.pickup_location === key ? 'border-green-500 bg-green-50' : ''
                    }`}
                  >
                    <input
                      type="radio"
                      name="pickup"
                      value={key}
                      checked={form.pickup_location === key}
                      onChange={(e) => setForm({ ...form, pickup_location: e.target.value as keyof typeof PICKUP_LOCATIONS })}
                      className="h-4 w-4 text-green-600"
                    />
                    <span className="text-sm">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="bg-gray-50 rounded-lg p-4 mt-4">
              <div className="flex justify-between items-center text-lg font-semibold">
                <span>Kokku:</span>
                <span className="text-green-600">{totalPrice}€</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {form.quantity} tk × {pricePerUnit}€
              </p>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50"
            >
              {loading ? 'Saadan...' : 'Esita tellimus'}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}

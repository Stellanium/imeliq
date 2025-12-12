'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'

type PickupKey = 'courier' | 'tallinn' | 'parnu' | 'tartu' | 'vantaa'

export default function OrderPage() {
  const t = useTranslations()
  const params = useParams()
  const locale = params.locale as string

  const PICKUP_LOCATIONS: Record<PickupKey, string> = {
    courier: t('order.pickupCourier'),
    tallinn: t('order.pickupTallinn'),
    parnu: t('order.pickupParnu'),
    tartu: t('order.pickupTartu'),
    vantaa: t('order.pickupVantaa')
  }

  const [form, setForm] = useState({
    email: '',
    quantity: 1,
    pickup_location: '' as PickupKey | '',
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
      setError(t('order.errorFillAll'))
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
          pickup_location: form.pickup_location,
          locale: locale
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || t('common.error'))
      }

      setSuccess(true)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t('common.error')
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
            <h1 className="text-2xl font-bold mb-4 text-gray-800">{t('order.successTitle')}</h1>
            <p className="text-gray-600 mb-6">
              {t('order.successMessage')}
              <br /><br />
              <strong>{t('order.successQuantity')}:</strong> {form.quantity} {locale === 'et' ? 'tk' : locale === 'fi' ? 'kpl' : locale === 'sv' ? 'st' : 'pc'}<br />
              <strong>{t('order.successPrice')}:</strong> {totalPrice}€<br />
              <strong>{t('order.successPickup')}:</strong> {PICKUP_LOCATIONS[form.pickup_location as PickupKey]}
            </p>
            <Link
              href={`/${locale}`}
              className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition"
            >
              {t('order.successButton')}
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen py-12 px-4">
      <div className="max-w-md mx-auto">
        <Link href={`/${locale}`} className="text-green-600 hover:text-green-700 mb-6 inline-block">
          ← {t('common.back')}
        </Link>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-2xl font-bold mb-2 text-gray-800">{t('order.title')}</h1>
          <p className="text-gray-600 mb-6">
            {t('order.subtitle')}
          </p>

          {/* Pricing info */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-green-800 mb-2">{t('order.pricing')}:</h3>
            <ul className="text-sm text-green-700 space-y-1">
              <li>✓ <strong>{t('order.priceWithData')}</strong></li>
              <li>✓ <strong>{t('order.priceWithoutData')}</strong></li>
            </ul>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('order.email')} *
              </label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder={t('order.emailPlaceholder')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('order.quantity')} *
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
                {t('order.gaveData')} *
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={form.gave_data}
                    onChange={() => setForm({ ...form, gave_data: true })}
                    className="h-4 w-4 text-green-600"
                  />
                  <span>{t('order.gaveDataYes')}</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={!form.gave_data}
                    onChange={() => setForm({ ...form, gave_data: false })}
                    className="h-4 w-4 text-green-600"
                  />
                  <span>{t('order.gaveDataNo')}</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                {t('order.pickupLocation')} *
              </label>
              <div className="space-y-2">
                {(Object.entries(PICKUP_LOCATIONS) as [PickupKey, string][]).map(([key, label]) => (
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
                      onChange={(e) => setForm({ ...form, pickup_location: e.target.value as PickupKey })}
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
                <span>{t('order.total')}:</span>
                <span className="text-green-600">{totalPrice}€</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {form.quantity} × {pricePerUnit}€
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
              {loading ? t('common.loading') : t('order.submitButton')}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}

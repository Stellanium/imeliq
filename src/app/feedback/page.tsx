'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function FeedbackPage() {
  const [form, setForm] = useState({
    product_code: '',
    referrer_name: '',
    feeling: '' as '' | 'nothing' | 'energy' | 'other',
    comments: ''
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!form.product_code || !form.referrer_name || !form.feeling) {
      setError('Palun täida kõik kohustuslikud väljad!')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_code: form.product_code,
          referrer_name: form.referrer_name,
          feeling: form.feeling,
          comments: form.comments || null
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Viga tagasiside salvestamisel')
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
              <span className="text-3xl">🙏</span>
            </div>
            <h1 className="text-2xl font-bold mb-4 text-gray-800">Aitäh tagasiside eest!</h1>
            <p className="text-gray-600 mb-6">
              Sinu arvamus on meile väga oluline. Kui soovid jooki juurde tellida, mine edasi!
            </p>
            <Link
              href="/order"
              className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition"
            >
              Telli jooki juurde
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
          <h1 className="text-2xl font-bold mb-2 text-gray-800">Anna tagasisidet</h1>
          <p className="text-gray-600 mb-6">
            Jaga meiega oma kogemust imeliq joogiga.
          </p>

          {/* Important instruction */}
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <p className="text-sm text-yellow-800">
              <strong>Oluline:</strong> Kindlasti tuleb juua vähemalt <strong>150ml</strong> korraga -
              mitte vähem ja mitte rohkem! Kasuta ainult kui oled lõunaks väsinud ja vajad kohvi/energiajooki.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Joogi unikaalne kood (pudelil) *
              </label>
              <input
                type="text"
                required
                value={form.product_code}
                onChange={(e) => setForm({ ...form, product_code: e.target.value.toUpperCase() })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent uppercase"
                placeholder="Nt: ABC123"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kelle käest joogi said? *
              </label>
              <input
                type="text"
                required
                value={form.referrer_name}
                onChange={(e) => setForm({ ...form, referrer_name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Soovitaja nimi"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Mida tundsid pärast joogi joomist? *
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="feeling"
                    value="nothing"
                    checked={form.feeling === 'nothing'}
                    onChange={(e) => setForm({ ...form, feeling: e.target.value as 'nothing' })}
                    className="h-4 w-4 text-green-600"
                  />
                  <span>Ei midagi erilist</span>
                </label>
                <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 border-green-200 bg-green-50">
                  <input
                    type="radio"
                    name="feeling"
                    value="energy"
                    checked={form.feeling === 'energy'}
                    onChange={(e) => setForm({ ...form, feeling: e.target.value as 'energy' })}
                    className="h-4 w-4 text-green-600"
                  />
                  <span>Tuli energiat ja väsimus kadus!</span>
                </label>
                <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="feeling"
                    value="other"
                    checked={form.feeling === 'other'}
                    onChange={(e) => setForm({ ...form, feeling: e.target.value as 'other' })}
                    className="h-4 w-4 text-green-600"
                  />
                  <span>Muu (kirjelda kommentaaris)</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kommentaarid (vabatahtlik)
              </label>
              <textarea
                value={form.comments}
                onChange={(e) => setForm({ ...form, comments: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                placeholder="Jaga oma mõtteid ja kogemust..."
              />
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
              {loading ? 'Saadan...' : 'Saada tagasiside'}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}

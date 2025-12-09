'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: '',
    family_name: '',
    email: '',
    phone: '',
    marketing_consent: false
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!form.name || !form.email) {
      setError('Nimi ja email on kohustuslikud!')
      setLoading(false)
      return
    }

    try {
      // Use server-side API instead of direct Supabase client
      const response = await fetch('/api/data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: form.name,
          family_name: form.family_name || null,
          email: form.email,
          phone: form.phone || null,
          marketing_consent: form.marketing_consent
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Viga registreerimisel')
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
              <span className="text-3xl">✅</span>
            </div>
            <h1 className="text-2xl font-bold mb-4 text-gray-800">Oled registreeritud!</h1>
            <p className="text-gray-600 mb-6">
              Võtame sinuga peagi ühendust. Kui oled joogi juba saanud, anna tagasisidet!
            </p>
            <Link
              href="/feedback"
              className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition"
            >
              Anna tagasisidet
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
          <h1 className="text-2xl font-bold mb-2 text-gray-800">Registreeru katsetajaks</h1>
          <p className="text-gray-600 mb-6">
            Täida vorm ja saad võimaluse proovida meie looduslikku energiajooki.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Eesnimi *
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Sinu eesnimi"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Perekonnanimi (vabatahtlik)
              </label>
              <input
                type="text"
                value={form.family_name}
                onChange={(e) => setForm({ ...form, family_name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Sinu perekonnanimi"
              />
            </div>

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
              <p className="text-xs text-gray-500 mt-1">
                Vajalik hilisema kontakti ja pakkumiste jaoks
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Telefon (vabatahtlik)
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="+372 5XX XXXX"
              />
            </div>

            <div className="flex items-start gap-3 pt-2">
              <input
                type="checkbox"
                id="marketing"
                checked={form.marketing_consent}
                onChange={(e) => setForm({ ...form, marketing_consent: e.target.checked })}
                className="mt-1 h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
              />
              <label htmlFor="marketing" className="text-sm text-gray-600">
                Nõustun saama uudiseid ja pakkumisi emailile (GDPR)
              </label>
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
              {loading ? 'Saadan...' : 'Registreeru'}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'

export default function FeedbackPage() {
  const t = useTranslations()
  const params = useParams()
  const locale = params.locale as string

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
      setError(t('common.fillAllFields'))
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
          comments: form.comments || null,
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
              <span className="text-3xl">🙏</span>
            </div>
            <h1 className="text-2xl font-bold mb-4 text-gray-800">{t('feedback.successTitle')}</h1>
            <p className="text-gray-600 mb-6">
              {t('feedback.successMessage')}
            </p>
            <Link
              href={`/${locale}/order`}
              className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition"
            >
              {t('feedback.successButton')}
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
          <h1 className="text-2xl font-bold mb-2 text-gray-800">{t('feedback.title')}</h1>
          <p className="text-gray-600 mb-6">
            {t('feedback.subtitle')}
          </p>

          {/* Important instruction */}
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <p className="text-sm text-yellow-800">
              <strong>{t('feedback.important')}:</strong> {t('feedback.importantText')}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('feedback.productCode')} *
              </label>
              <input
                type="text"
                required
                value={form.product_code}
                onChange={(e) => setForm({ ...form, product_code: e.target.value.toUpperCase() })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent uppercase"
                placeholder={t('feedback.productCodePlaceholder')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('feedback.referrerName')} *
              </label>
              <input
                type="text"
                required
                value={form.referrer_name}
                onChange={(e) => setForm({ ...form, referrer_name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder={t('feedback.referrerNamePlaceholder')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                {t('feedback.feeling')} *
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
                  <span>{t('feedback.feelingNothing')}</span>
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
                  <span>{t('feedback.feelingEnergy')}</span>
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
                  <span>{t('feedback.feelingOther')}</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('feedback.comments')} ({t('common.optional')})
              </label>
              <textarea
                value={form.comments}
                onChange={(e) => setForm({ ...form, comments: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                placeholder={t('feedback.commentsPlaceholder')}
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
              {loading ? t('common.loading') : t('feedback.submitButton')}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}

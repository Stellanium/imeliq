'use client'

import { useState, useEffect } from 'react'

// Types
type Feedback = {
  id: string
  created_at: string
  product_code: string
  referrer_name: string
  feeling: 'energy' | 'nothing' | 'other'
  comments?: string
}

type Order = {
  id: string
  created_at: string
  email: string
  quantity: number
  price_per_unit: number
  pickup_location: string
  status: string
}

type Tester = {
  id: string
  created_at: string
  name: string
  family_name?: string
  email: string
  phone?: string
  marketing_consent: boolean
}

type FeedbackStats = {
  total_feedback: number
  positive_count: number
  negative_count: number
  neutral_count: number
  positive_percent: number
  negative_percent: number
}

// Pie Chart component
function PieChart({ stats }: { stats: FeedbackStats }) {
  const total = stats.positive_count + stats.negative_count + stats.neutral_count
  if (total === 0) return <div className="text-gray-400 text-center py-8">Andmeid pole</div>

  const positiveAngle = (stats.positive_count / total) * 360
  const negativeAngle = (stats.negative_count / total) * 360
  const posEnd = positiveAngle
  const negEnd = posEnd + negativeAngle

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        className="w-48 h-48 rounded-full shadow-lg"
        style={{
          background: `conic-gradient(
            #22c55e 0deg ${posEnd}deg,
            #ef4444 ${posEnd}deg ${negEnd}deg,
            #9ca3af ${negEnd}deg 360deg
          )`
        }}
      />
      <div className="flex gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span>Energia ({stats.positive_count})</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <span>Ei midagi ({stats.negative_count})</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gray-400"></div>
          <span>Muu ({stats.neutral_count})</span>
        </div>
      </div>
    </div>
  )
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [activeTab, setActiveTab] = useState<'stats' | 'feedback' | 'orders' | 'testers'>('stats')
  const [loading, setLoading] = useState(true)

  // Data states
  const [stats, setStats] = useState<FeedbackStats | null>(null)
  const [feedback, setFeedback] = useState<Feedback[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [testers, setTesters] = useState<Tester[]>([])

  // Check session on mount
  useEffect(() => {
    checkSession()
  }, [])

  // Load data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadData()
    }
  }, [isAuthenticated, activeTab])

  const checkSession = async () => {
    try {
      const res = await fetch('/api/admin/auth')
      const data = await res.json()
      setIsAuthenticated(data.authenticated)
    } catch {
      setIsAuthenticated(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError('')

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      })

      const data = await res.json()

      if (res.ok) {
        setIsAuthenticated(true)
        setPassword('')
      } else {
        setLoginError(data.error || 'Sisselogimine ebaõnnestus')
      }
    } catch {
      setLoginError('Võrgu viga')
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth', { method: 'DELETE' })
      setIsAuthenticated(false)
    } catch {
      console.error('Logout failed')
    }
  }

  const loadData = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/data?type=all')

      if (!response.ok) {
        if (response.status === 401) {
          setIsAuthenticated(false)
          return
        }
        throw new Error('Failed to fetch data')
      }

      const result = await response.json()
      const data = result.data

      if (data.stats) {
        setStats({
          ...data.stats,
          positive_percent: data.stats.total_feedback > 0
            ? Math.round((data.stats.positive_count / data.stats.total_feedback) * 100)
            : 0,
          negative_percent: data.stats.total_feedback > 0
            ? Math.round((data.stats.negative_count / data.stats.total_feedback) * 100)
            : 0
        })
      }

      if (data.feedback) setFeedback(data.feedback)
      if (data.orders) setOrders(data.orders)
      if (data.testers) setTesters(data.testers)

    } catch (err) {
      console.error('Error loading data:', err)
    } finally {
      setLoading(false)
    }
  }

  // GDPR: Delete record
  const handleDelete = async (type: 'tester' | 'feedback' | 'order', id: string) => {
    if (!confirm('Kas oled kindel? See tegevus on pöördumatu (GDPR Art.17).')) {
      return
    }

    try {
      const res = await fetch(`/api/data?type=${type}&id=${id}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        loadData() // Reload data
      } else {
        alert('Kustutamine ebaõnnestus')
      }
    } catch {
      alert('Võrgu viga')
    }
  }

  // CSV Export
  const exportToCSV = (data: Record<string, unknown>[], filename: string) => {
    if (data.length === 0) return

    const headers = Object.keys(data[0])
    const csvContent = [
      headers.join(';'),
      ...data.map(row =>
        headers.map(h => {
          const val = row[h]
          if (val === null || val === undefined) return ''
          if (typeof val === 'string' && val.includes(';')) return `"${val}"`
          return String(val)
        }).join(';')
      )
    ].join('\n')

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  // Loading state
  if (isAuthenticated === null) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Laadin...</div>
      </main>
    )
  }

  // Login form
  if (!isAuthenticated) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4 bg-gray-100">
        <div className="max-w-sm w-full">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">Admin</h1>
            <form onSubmit={handleLogin}>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Parool"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-green-500"
                autoComplete="current-password"
              />
              {loginError && (
                <p className="text-red-500 text-sm mb-4">{loginError}</p>
              )}
              <button
                type="submit"
                className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700"
              >
                Logi sisse
              </button>
            </form>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">imeliq Admin</h1>
          <button
            onClick={handleLogout}
            className="text-gray-500 hover:text-gray-700"
          >
            Logi välja
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {(['stats', 'feedback', 'orders', 'testers'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                activeTab === tab
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              {tab === 'stats' && 'Statistika'}
              {tab === 'feedback' && 'Tagasiside'}
              {tab === 'orders' && 'Tellimused'}
              {tab === 'testers' && 'Katsetajad'}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500">Laadin...</div>
        ) : (
          <>
            {/* Stats Tab */}
            {activeTab === 'stats' && stats && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <h2 className="text-xl font-semibold mb-4 text-gray-800 text-center">Tagasiside jaotus</h2>
                    <PieChart stats={stats} />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white rounded-xl p-6 shadow-sm">
                      <p className="text-gray-500 text-sm">Tagasisideid kokku</p>
                      <p className="text-3xl font-bold text-gray-800">{stats.total_feedback}</p>
                    </div>
                    <div className="bg-white rounded-xl p-6 shadow-sm">
                      <p className="text-gray-500 text-sm">Positiivne</p>
                      <p className="text-3xl font-bold text-green-600">{stats.positive_percent}%</p>
                      <p className="text-sm text-gray-400">{stats.positive_count} tk</p>
                    </div>
                    <div className="bg-white rounded-xl p-6 shadow-sm">
                      <p className="text-gray-500 text-sm">Negatiivne</p>
                      <p className="text-3xl font-bold text-red-500">{stats.negative_percent}%</p>
                      <p className="text-sm text-gray-400">{stats.negative_count} tk</p>
                    </div>
                    <div className="bg-white rounded-xl p-6 shadow-sm">
                      <p className="text-gray-500 text-sm">Muu</p>
                      <p className="text-3xl font-bold text-gray-600">{stats.neutral_count}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Feedback Tab */}
            {activeTab === 'feedback' && (
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="p-4 border-b flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-800">Tagasiside ({feedback.length})</h2>
                  <button
                    onClick={() => exportToCSV(feedback as unknown as Record<string, unknown>[], 'imeliq_tagasiside')}
                    className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition"
                  >
                    Ekspordi CSV
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left py-3 px-4 text-gray-600">Kuupäev</th>
                        <th className="text-left py-3 px-4 text-gray-600">Kood</th>
                        <th className="text-left py-3 px-4 text-gray-600">Soovitaja</th>
                        <th className="text-left py-3 px-4 text-gray-600">Tunne</th>
                        <th className="text-left py-3 px-4 text-gray-600">Kommentaar</th>
                        <th className="text-center py-3 px-4 text-gray-600">GDPR</th>
                      </tr>
                    </thead>
                    <tbody>
                      {feedback.map((f) => (
                        <tr key={f.id} className="border-b last:border-0 hover:bg-gray-50">
                          <td className="py-3 px-4 text-sm">
                            {new Date(f.created_at).toLocaleDateString('et-EE')}
                          </td>
                          <td className="py-3 px-4 font-mono text-sm">{f.product_code}</td>
                          <td className="py-3 px-4">{f.referrer_name}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded text-sm ${
                              f.feeling === 'energy' ? 'bg-green-100 text-green-700' :
                              f.feeling === 'nothing' ? 'bg-red-100 text-red-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {f.feeling === 'energy' ? 'Energia' :
                               f.feeling === 'nothing' ? 'Ei midagi' : 'Muu'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-500 max-w-xs truncate">
                            {f.comments || '-'}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={() => handleDelete('feedback', f.id)}
                              className="text-red-500 hover:text-red-700 text-sm"
                              title="Kustuta (GDPR Art.17)"
                            >
                              Kustuta
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="p-4 border-b flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-800">Tellimused ({orders.length})</h2>
                  <button
                    onClick={() => exportToCSV(orders as unknown as Record<string, unknown>[], 'imeliq_tellimused')}
                    className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition"
                  >
                    Ekspordi CSV
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left py-3 px-4 text-gray-600">Kuupäev</th>
                        <th className="text-left py-3 px-4 text-gray-600">Email</th>
                        <th className="text-center py-3 px-4 text-gray-600">Kogus</th>
                        <th className="text-center py-3 px-4 text-gray-600">Hind</th>
                        <th className="text-left py-3 px-4 text-gray-600">Koht</th>
                        <th className="text-left py-3 px-4 text-gray-600">Staatus</th>
                        <th className="text-center py-3 px-4 text-gray-600">GDPR</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((o) => (
                        <tr key={o.id} className="border-b last:border-0 hover:bg-gray-50">
                          <td className="py-3 px-4 text-sm">
                            {new Date(o.created_at).toLocaleDateString('et-EE')}
                          </td>
                          <td className="py-3 px-4 text-sm">{o.email}</td>
                          <td className="py-3 px-4 text-center">{o.quantity} tk</td>
                          <td className="py-3 px-4 text-center">
                            {o.quantity * o.price_per_unit}€
                          </td>
                          <td className="py-3 px-4 text-sm">{o.pickup_location}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded text-sm ${
                              o.status === 'delivered' ? 'bg-green-100 text-green-700' :
                              o.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                              'bg-yellow-100 text-yellow-700'
                            }`}>
                              {o.status === 'delivered' ? 'Kohale viidud' :
                               o.status === 'confirmed' ? 'Kinnitatud' : 'Ootel'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={() => handleDelete('order', o.id)}
                              className="text-red-500 hover:text-red-700 text-sm"
                              title="Kustuta (GDPR Art.17)"
                            >
                              Kustuta
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Testers Tab */}
            {activeTab === 'testers' && (
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="p-4 border-b flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-800">Katsetajad ({testers.length})</h2>
                  <button
                    onClick={() => exportToCSV(testers as unknown as Record<string, unknown>[], 'imeliq_katsetajad')}
                    className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition"
                  >
                    Ekspordi CSV
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left py-3 px-4 text-gray-600">Kuupäev</th>
                        <th className="text-left py-3 px-4 text-gray-600">Nimi</th>
                        <th className="text-left py-3 px-4 text-gray-600">Email</th>
                        <th className="text-left py-3 px-4 text-gray-600">Telefon</th>
                        <th className="text-center py-3 px-4 text-gray-600">Marketing</th>
                        <th className="text-center py-3 px-4 text-gray-600">GDPR</th>
                      </tr>
                    </thead>
                    <tbody>
                      {testers.map((t) => (
                        <tr key={t.id} className="border-b last:border-0 hover:bg-gray-50">
                          <td className="py-3 px-4 text-sm">
                            {new Date(t.created_at).toLocaleDateString('et-EE')}
                          </td>
                          <td className="py-3 px-4">
                            {t.name} {t.family_name || ''}
                          </td>
                          <td className="py-3 px-4 text-sm">{t.email}</td>
                          <td className="py-3 px-4 text-sm">{t.phone || '-'}</td>
                          <td className="py-3 px-4 text-center">
                            {t.marketing_consent ? (
                              <span className="text-green-600">✓</span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={() => handleDelete('tester', t.id)}
                              className="text-red-500 hover:text-red-700 text-sm"
                              title="Kustuta (GDPR Art.17)"
                            >
                              Kustuta
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}

        {/* GDPR Footer */}
        <div className="mt-8 text-center text-sm text-gray-400">
          <p>GDPR-compliant: Audit logging • Data export • Right to erasure (Art.17)</p>
        </div>
      </div>
    </main>
  )
}

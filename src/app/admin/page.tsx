'use client'

import { useState, useEffect } from 'react'
import { supabase, Feedback, Order, Tester } from '@/lib/supabase'

type FeedbackStats = {
  total_feedback: number
  positive_count: number
  negative_count: number
  neutral_count: number
  positive_percent: number
  negative_percent: number
}

type TopReferrer = {
  referrer_name: string
  referral_count: number
  positive_referrals: number
}

// Simple Pie Chart component
function PieChart({ stats }: { stats: FeedbackStats }) {
  const total = stats.positive_count + stats.negative_count + stats.neutral_count
  if (total === 0) return <div className="text-gray-400 text-center py-8">Andmeid pole</div>

  const positiveAngle = (stats.positive_count / total) * 360
  const negativeAngle = (stats.negative_count / total) * 360
  const neutralAngle = (stats.neutral_count / total) * 360

  // Calculate cumulative angles for conic-gradient
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
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [activeTab, setActiveTab] = useState<'stats' | 'feedback' | 'orders' | 'testers'>('stats')
  const [loading, setLoading] = useState(true)

  // Data states
  const [stats, setStats] = useState<FeedbackStats | null>(null)
  const [topReferrers, setTopReferrers] = useState<TopReferrer[]>([])
  const [feedback, setFeedback] = useState<Feedback[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [testers, setTesters] = useState<Tester[]>([])

  // Simple password check (in production, use proper auth)
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === 'imeliq2024') {
      setIsAuthenticated(true)
      localStorage.setItem('imeliq_admin', 'true')
    }
  }

  useEffect(() => {
    // Check if already logged in
    if (localStorage.getItem('imeliq_admin') === 'true') {
      setIsAuthenticated(true)
    }
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      loadData()
    }
  }, [isAuthenticated, activeTab])

  const loadData = async () => {
    setLoading(true)
    try {
      // Load stats
      const { data: statsData } = await supabase
        .from('feedback_stats')
        .select('*')
        .single()
      if (statsData) setStats(statsData)

      // Load top referrers
      const { data: referrersData } = await supabase
        .from('top_referrers')
        .select('*')
      if (referrersData) setTopReferrers(referrersData)

      // Load based on active tab
      if (activeTab === 'feedback') {
        const { data } = await supabase
          .from('feedback')
          .select('*')
          .order('created_at', { ascending: false })
        if (data) setFeedback(data)
      }

      if (activeTab === 'orders') {
        const { data } = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false })
        if (data) setOrders(data)
      }

      if (activeTab === 'testers') {
        const { data } = await supabase
          .from('testers')
          .select('*')
          .order('created_at', { ascending: false })
        if (data) setTesters(data)
      }
    } catch (err) {
      console.error('Error loading data:', err)
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: string, status: string) => {
    await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId)
    loadData()
  }

  // CSV Export functions
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

  const exportFeedback = () => exportToCSV(feedback as unknown as Record<string, unknown>[], 'imeliq_tagasiside')
  const exportOrders = () => exportToCSV(orders as unknown as Record<string, unknown>[], 'imeliq_tellimused')
  const exportTesters = () => exportToCSV(testers as unknown as Record<string, unknown>[], 'imeliq_katsetajad')

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
              />
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
            onClick={() => {
              localStorage.removeItem('imeliq_admin')
              setIsAuthenticated(false)
            }}
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
                {/* Pie Chart + Overview */}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Pie Chart */}
                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <h2 className="text-xl font-semibold mb-4 text-gray-800 text-center">Tagasiside jaotus</h2>
                    <PieChart stats={stats} />
                  </div>

                  {/* Overview Cards */}
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

                {/* Top Referrers */}
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h2 className="text-xl font-semibold mb-4 text-gray-800">TOP Soovitajad</h2>
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 text-gray-600">Nimi</th>
                        <th className="text-center py-2 text-gray-600">Soovitusi</th>
                        <th className="text-center py-2 text-gray-600">Positiivsed</th>
                        <th className="text-center py-2 text-gray-600">%</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topReferrers.map((ref, i) => (
                        <tr key={i} className="border-b last:border-0">
                          <td className="py-3">{ref.referrer_name}</td>
                          <td className="text-center">{ref.referral_count}</td>
                          <td className="text-center text-green-600">{ref.positive_referrals}</td>
                          <td className="text-center">
                            {Math.round((ref.positive_referrals / ref.referral_count) * 100)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Feedback Tab */}
            {activeTab === 'feedback' && (
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="p-4 border-b flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-800">Tagasiside ({feedback.length})</h2>
                  <button
                    onClick={exportFeedback}
                    className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition"
                  >
                    Ekspordi CSV
                  </button>
                </div>
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-3 px-4 text-gray-600">Kuupäev</th>
                      <th className="text-left py-3 px-4 text-gray-600">Kood</th>
                      <th className="text-left py-3 px-4 text-gray-600">Soovitaja</th>
                      <th className="text-left py-3 px-4 text-gray-600">Tunne</th>
                      <th className="text-left py-3 px-4 text-gray-600">Kommentaar</th>
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
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="p-4 border-b flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-800">Tellimused ({orders.length})</h2>
                  <button
                    onClick={exportOrders}
                    className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition"
                  >
                    Ekspordi CSV
                  </button>
                </div>
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-3 px-4 text-gray-600">Kuupäev</th>
                      <th className="text-left py-3 px-4 text-gray-600">Email</th>
                      <th className="text-center py-3 px-4 text-gray-600">Kogus</th>
                      <th className="text-center py-3 px-4 text-gray-600">Hind</th>
                      <th className="text-left py-3 px-4 text-gray-600">Koht</th>
                      <th className="text-left py-3 px-4 text-gray-600">Staatus</th>
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
                          <select
                            value={o.status}
                            onChange={(e) => updateOrderStatus(o.id, e.target.value)}
                            className={`px-2 py-1 rounded text-sm border ${
                              o.status === 'delivered' ? 'bg-green-100 border-green-300' :
                              o.status === 'confirmed' ? 'bg-blue-100 border-blue-300' :
                              'bg-yellow-100 border-yellow-300'
                            }`}
                          >
                            <option value="pending">Ootel</option>
                            <option value="confirmed">Kinnitatud</option>
                            <option value="delivered">Kohale viidud</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Testers Tab */}
            {activeTab === 'testers' && (
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="p-4 border-b flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-800">Katsetajad ({testers.length})</h2>
                  <button
                    onClick={exportTesters}
                    className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition"
                  >
                    Ekspordi CSV
                  </button>
                </div>
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-3 px-4 text-gray-600">Kuupäev</th>
                      <th className="text-left py-3 px-4 text-gray-600">Nimi</th>
                      <th className="text-left py-3 px-4 text-gray-600">Email</th>
                      <th className="text-left py-3 px-4 text-gray-600">Telefon</th>
                      <th className="text-center py-3 px-4 text-gray-600">Marketing</th>
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
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  )
}

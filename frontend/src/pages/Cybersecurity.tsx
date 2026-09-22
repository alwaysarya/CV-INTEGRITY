import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Shield, AlertTriangle, Loader2, RefreshCw, Activity, Zap } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import axios from 'axios'

interface Threat {
  id: string
  type: string
  severity: string
  source: string
  target: string
  status: string
  timestamp: string
  confidence: number
}

const API = 'http://localhost:8000'

const severityColors: Record<string, any> = {
  Critical: { bg: 'rgba(220, 38, 38, 0.15)', text: '#DC2626', border: 'rgba(220, 38, 38, 0.4)' },
  High: { bg: 'rgba(239, 68, 68, 0.15)', text: '#EF4444', border: 'rgba(239, 68, 68, 0.4)' },
  Medium: { bg: 'rgba(245, 158, 11, 0.15)', text: '#F59E0B', border: 'rgba(245, 158, 11, 0.4)' },
  Low: { bg: 'rgba(16, 185, 129, 0.15)', text: '#10B981', border: 'rgba(16, 185, 129, 0.4)' },
}

const statusColors: Record<string, any> = {
  Blocked: { bg: 'rgba(16, 185, 129, 0.15)', text: '#10B981', border: 'rgba(16, 185, 129, 0.4)' },
  Resolved: { bg: 'rgba(56, 189, 248, 0.15)', text: '#38BDF8', border: 'rgba(56, 189, 248, 0.4)' },
  Investigating: { bg: 'rgba(245, 158, 11, 0.15)', text: '#F59E0B', border: 'rgba(245, 158, 11, 0.4)' },
}

export function Cybersecurity() {
  const [threats, setThreats] = useState<Threat[]>([])
  const [summary, setSummary] = useState<any>({})
  const [timeline, setTimeline] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadAll()
  }, [])

  const loadAll = async () => {
    setLoading(true)
    setError(null)
    try {
      console.log('Fetching threats from:', `${API}/api/cybersecurity/threats`)
      
      const tRes = await axios.get(`${API}/api/cybersecurity/threats`)
      console.log('Threats response:', tRes.data)
      
      const tmRes = await axios.get(`${API}/api/cybersecurity/timeline`)
      console.log('Timeline response:', tmRes.data)
      
      setThreats(tRes.data.threats || [])
      setSummary(tRes.data.summary || {})
      setTimeline(tmRes.data.timeline || [])
    } catch (err: any) {
      console.error('Fetch error:', err)
      setError(err.message || 'Backend connect nahi ho raha')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold gradient-text mb-1">Cybersecurity</h1>
          <p className="text-gray-400 text-sm">
            {loading ? 'Loading threats...' : `${threats.length} real threats from backend`}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={loadAll} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 text-sm font-medium">
            <RefreshCw size={16} /> Refresh
          </button>
          <Badge className="bg-green-500/20 text-green-400 border-green-500/40 gap-1.5 py-2 px-3">
            <span className="live-dot" /> Protected
          </Badge>
        </div>
      </motion.div>

      {error && (
        <Card className="glass-card p-4 border-red-500/40 bg-red-500/5">
          <div className="flex items-center gap-3">
            <AlertTriangle className="text-red-400" size={20} />
            <div className="text-red-400 text-sm">{error}</div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Threats', value: threats.length, color: '#38BDF8', icon: AlertTriangle },
          { label: 'Blocked', value: summary.status?.Blocked || 0, color: '#10B981', icon: Shield },
          { label: 'Critical', value: summary.severity?.Critical || 0, color: '#EF4444', icon: Zap },
          { label: 'System Uptime', value: '99.9%', color: '#8B5CF6', icon: Activity },
        ].map((stat, i) => {
          const Icon = stat.icon
          return (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: i * 0.1 }}>
              <Card className="liquid-glass specular border-0 p-5 hover-lift">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: `${stat.color}20`, border: `1px solid ${stat.color}40` }}>
                  <Icon size={20} style={{ color: stat.color }} />
                </div>
                <div className="text-white text-3xl font-bold mb-1">{stat.value}</div>
                <div className="text-gray-400 text-xs">{stat.label}</div>
              </Card>
            </motion.div>
          )
        })}
      </div>

      <Card className="liquid-glass border-0 p-5">
        <div className="mb-4">
          <h3 className="text-white font-bold text-sm">THREAT TIMELINE (24H)</h3>
          <p className="text-gray-500 text-xs mt-0.5">Attack attempts over time</p>
        </div>
        <div className="w-full h-64">
          {timeline.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeline}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(56, 189, 248, 0.1)" />
                <XAxis dataKey="time" stroke="#475569" tick={{ fontSize: 10 }} />
                <YAxis stroke="#475569" tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '8px', fontSize: '11px' }} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Line type="monotone" dataKey="attacks" stroke="#EF4444" strokeWidth={2} dot={{ r: 3 }} name="Attacks" />
                <Line type="monotone" dataKey="blocked" stroke="#10B981" strokeWidth={2} dot={{ r: 3 }} name="Blocked" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500 text-sm">No timeline data</div>
          )}
        </div>
      </Card>

      <Card className="liquid-glass border-0 p-5">
        <div className="mb-4">
          <h3 className="text-white font-bold text-sm">THREAT DETAILS</h3>
          <p className="text-gray-500 text-xs mt-0.5">{threats.length} real threats detected</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin text-cyan-400" size={32} />
            <span className="ml-3 text-gray-400">Loading threats...</span>
          </div>
        ) : threats.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-cyan-500/10">
                  <th className="text-left text-gray-500 text-[10px] font-bold uppercase pb-3">Type</th>
                  <th className="text-left text-gray-500 text-[10px] font-bold uppercase pb-3">Source</th>
                  <th className="text-left text-gray-500 text-[10px] font-bold uppercase pb-3">Target</th>
                  <th className="text-right text-gray-500 text-[10px] font-bold uppercase pb-3">Confidence</th>
                  <th className="text-right text-gray-500 text-[10px] font-bold uppercase pb-3">Severity</th>
                  <th className="text-right text-gray-500 text-[10px] font-bold uppercase pb-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {threats.map((threat) => {
                  const sev = severityColors[threat.severity] || severityColors.Medium
                  const st = statusColors[threat.status] || statusColors.Blocked
                  return (
                    <tr key={threat.id} className="border-b border-cyan-500/5 hover:bg-cyan-500/5">
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: sev.bg, border: `1px solid ${sev.border}` }}>
                            <AlertTriangle size={14} style={{ color: sev.text }} />
                          </div>
                          <div className="text-white text-xs font-bold">{threat.type}</div>
                        </div>
                      </td>
                      <td className="py-3"><div className="text-gray-400 text-xs">{threat.source}</div></td>
                      <td className="py-3"><div className="text-gray-400 text-xs">{threat.target}</div></td>
                      <td className="py-3 text-right"><div className="text-xs font-bold text-cyan-400">{threat.confidence}%</div></td>
                      <td className="py-3 text-right">
                        <Badge className="text-[10px] py-0.5 px-2" style={{ backgroundColor: sev.bg, color: sev.text, border: `1px solid ${sev.border}` }}>
                          {threat.severity}
                        </Badge>
                      </td>
                      <td className="py-3 text-right">
                        <Badge className="text-[10px] py-0.5 px-2" style={{ backgroundColor: st.bg, color: st.text, border: `1px solid ${st.border}` }}>
                          ● {threat.status}
                        </Badge>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <AlertTriangle size={48} className="mx-auto mb-3 opacity-40" />
            <div className="text-sm">No threats loaded</div>
            <div className="text-xs mt-2">Check backend: http://localhost:8000/api/cybersecurity/threats</div>
          </div>
        )}
      </Card>
    </div>
  )
}

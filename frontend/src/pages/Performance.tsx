import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Zap, Activity, Clock, Cpu, TrendingUp, Target } from 'lucide-react'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'

const latencyData = [
  { time: '00:00', p50: 28, p95: 65, p99: 120 },
  { time: '04:00', p50: 32, p95: 70, p99: 135 },
  { time: '08:00', p50: 45, p95: 95, p99: 180 },
  { time: '12:00', p50: 52, p95: 110, p99: 210 },
  { time: '16:00', p50: 48, p95: 100, p99: 195 },
  { time: '20:00', p50: 38, p95: 82, p99: 150 },
]

const throughputData = [
  { hour: '00', requests: 120 },
  { hour: '04', requests: 85 },
  { hour: '08', requests: 340 },
  { hour: '12', requests: 580 },
  { hour: '16', requests: 520 },
  { hour: '20', requests: 310 },
]

const endpoints = [
  { endpoint: '/api/datasets', avgLatency: 42, requests: 12450, p95: 85, p99: 142 },
  { endpoint: '/api/models', avgLatency: 38, requests: 9840, p95: 72, p99: 128 },
  { endpoint: '/api/trust-scores', avgLatency: 52, requests: 7620, p95: 108, p99: 186 },
  { endpoint: '/api/blockchain/blocks', avgLatency: 28, requests: 4520, p95: 58, p99: 94 },
  { endpoint: '/api/verify', avgLatency: 145, requests: 2340, p95: 245, p99: 380 },
]

export function Performance() {
  const stats = {
    avgLatency: 48,
    p95: 96,
    requestsPerSec: 342,
    uptime: 99.94,
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Performance</h1>
          <p className="text-gray-400 text-sm">API latency, throughput, and uptime metrics</p>
        </div>
        <Badge className="bg-green-500/20 text-green-400 border-green-500/40 gap-1.5 py-2 px-3">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          All Systems Nominal
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Avg Latency', value: `${stats.avgLatency}ms`, color: '#38BDF8', icon: Clock },
          { label: 'P95 Latency', value: `${stats.p95}ms`, color: '#F59E0B', icon: Activity },
          { label: 'Requests/sec', value: stats.requestsPerSec, color: '#10B981', icon: Zap },
          { label: 'Uptime', value: `${stats.uptime}%`, color: '#8B5CF6', icon: Target },
        ].map((stat, i) => {
          const Icon = stat.icon
          return (
            <Card key={i} className="glass-card p-5 border-cyan-500/20">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${stat.color}20`, border: `1px solid ${stat.color}40` }}>
                  <Icon size={20} style={{ color: stat.color }} />
                </div>
              </div>
              <div className="text-white text-3xl font-bold mb-1">{stat.value}</div>
              <div className="text-gray-400 text-xs">{stat.label}</div>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="glass-card border-cyan-500/20 p-5">
          <div className="mb-4">
            <h3 className="text-white font-bold text-sm">LATENCY (24H)</h3>
            <p className="text-gray-500 text-xs mt-0.5">P50, P95, P99 percentiles in ms</p>
          </div>
          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={latencyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(56, 189, 248, 0.1)" />
                <XAxis dataKey="time" stroke="#475569" tick={{ fontSize: 10 }} />
                <YAxis stroke="#475569" tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '8px', fontSize: '11px' }} />
                <Legend wrapperStyle={{ fontSize: '11px', color: '#94A3B8' }} />
                <Line type="monotone" dataKey="p50" stroke="#10B981" strokeWidth={2} dot={{ r: 3 }} name="P50" />
                <Line type="monotone" dataKey="p95" stroke="#F59E0B" strokeWidth={2} dot={{ r: 3 }} name="P95" />
                <Line type="monotone" dataKey="p99" stroke="#EF4444" strokeWidth={2} dot={{ r: 3 }} name="P99" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="glass-card border-cyan-500/20 p-5">
          <div className="mb-4">
            <h3 className="text-white font-bold text-sm">THROUGHPUT (24H)</h3>
            <p className="text-gray-500 text-xs mt-0.5">Requests per hour</p>
          </div>
          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={throughputData}>
                <defs>
                  <linearGradient id="thruGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#38BDF8" />
                    <stop offset="100%" stopColor="#8B5CF6" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(56, 189, 248, 0.1)" />
                <XAxis dataKey="hour" stroke="#475569" tick={{ fontSize: 10 }} />
                <YAxis stroke="#475569" tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '8px', fontSize: '11px' }} />
                <Bar dataKey="requests" fill="url(#thruGrad)" radius={[8, 8, 0, 0]} name="Requests" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card className="glass-card border-cyan-500/20 p-5">
        <div className="mb-4">
          <h3 className="text-white font-bold text-sm">ENDPOINT PERFORMANCE</h3>
          <p className="text-gray-500 text-xs mt-0.5">Latency by API endpoint</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-cyan-500/10">
                <th className="text-left text-gray-500 text-[10px] font-bold tracking-wider uppercase pb-3">Endpoint</th>
                <th className="text-right text-gray-500 text-[10px] font-bold tracking-wider uppercase pb-3">Avg (ms)</th>
                <th className="text-right text-gray-500 text-[10px] font-bold tracking-wider uppercase pb-3">P95 (ms)</th>
                <th className="text-right text-gray-500 text-[10px] font-bold tracking-wider uppercase pb-3">P99 (ms)</th>
                <th className="text-right text-gray-500 text-[10px] font-bold tracking-wider uppercase pb-3">Requests</th>
                <th className="text-right text-gray-500 text-[10px] font-bold tracking-wider uppercase pb-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {endpoints.map((ep, i) => {
                const status = ep.avgLatency < 50 ? 'Fast' : ep.avgLatency < 100 ? 'Normal' : 'Slow'
                const colors = status === 'Fast'
                  ? { bg: 'rgba(16, 185, 129, 0.15)', text: '#10B981', border: 'rgba(16, 185, 129, 0.4)' }
                  : status === 'Normal'
                  ? { bg: 'rgba(56, 189, 248, 0.15)', text: '#38BDF8', border: 'rgba(56, 189, 248, 0.4)' }
                  : { bg: 'rgba(245, 158, 11, 0.15)', text: '#F59E0B', border: 'rgba(245, 158, 11, 0.4)' }
                return (
                  <tr key={i} className="border-b border-cyan-500/5 hover:bg-cyan-500/5 transition-colors">
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
                          <Cpu size={14} className="text-cyan-400" />
                        </div>
                        <div className="text-white text-xs font-mono">{ep.endpoint}</div>
                      </div>
                    </td>
                    <td className="py-3 text-right"><div className="text-white text-xs font-mono font-bold">{ep.avgLatency}</div></td>
                    <td className="py-3 text-right"><div className="text-gray-300 text-xs font-mono">{ep.p95}</div></td>
                    <td className="py-3 text-right"><div className="text-gray-300 text-xs font-mono">{ep.p99}</div></td>
                    <td className="py-3 text-right"><div className="text-gray-400 text-xs font-mono">{ep.requests.toLocaleString()}</div></td>
                    <td className="py-3 text-right">
                      <Badge className="text-[10px] py-0.5 px-2" style={{ backgroundColor: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}>
                        ● {status}
                      </Badge>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

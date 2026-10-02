import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Cpu, HardDrive, MemoryStick, Server, Loader2 } from 'lucide-react'
import apiClient from '@/lib/api'

export function SystemResources() {
  const [resources, setResources] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { load() }, [])
  const load = async () => {
    try {
      const [dRes, mRes, bRes, wRes] = await Promise.all([
        apiClient.getDatasets(), apiClient.getModels(), apiClient.getBlocks(), apiClient.getWallets()
      ])
      const d = Object.keys(dRes.data.datasets || {}).length
      const m = Object.keys(mRes.data.models || {}).length
      const b = (bRes.data.blocks || []).length
      const w = Object.keys(wRes.data.wallets || {}).length

      setResources([
        { name: 'Datasets', value: Math.min(d * 10, 100), icon: HardDrive, color: '#38BDF8', count: d },
        { name: 'Models', value: Math.min(m * 15, 100), icon: Server, color: '#F59E0B', count: m },
        { name: 'Blocks', value: Math.min(b * 5, 100), icon: Cpu, color: '#8B5CF6', count: b },
        { name: 'Wallets', value: Math.min(w * 20, 100), icon: MemoryStick, color: '#10B981', count: w },
      ])
    } catch (err) { console.error(err) } finally { setLoading(false) }
  }

  return (
    <Card className="glass-card border-cyan-500/20 p-5 h-full">
      <div className="mb-4">
        <h3 className="text-white font-bold text-sm">SYSTEM RESOURCES</h3>
        <p className="text-gray-500 text-xs mt-0.5">Real entity counts</p>
      </div>

      {loading ? (
        <div className="text-center py-8"><Loader2 className="animate-spin text-cyan-400 mx-auto" size={24} /></div>
      ) : (
        <div className="grid grid-cols-4 gap-3">
          {resources.map((r) => {
            const Icon = r.icon
            const c = 2 * Math.PI * 35
            const off = c - (r.value / 100) * c
            return (
              <div key={r.name} className="flex flex-col items-center gap-2">
                <div className="relative w-24 h-24">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="35" fill="none" stroke="rgba(56, 189, 248, 0.1)" strokeWidth="6" />
                    <circle cx="50" cy="50" r="35" fill="none" stroke={r.color} strokeWidth="6" strokeLinecap="round"
                      strokeDasharray={c} strokeDashoffset={off}
                      style={{ filter: `drop-shadow(0 0 6px ${r.color})`, transition: 'stroke-dashoffset 1s ease' }} />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <Icon size={14} style={{ color: r.color }} />
                    <span className="text-white font-bold text-lg mt-0.5">{r.count}</span>
                  </div>
                </div>
                <div className="text-gray-400 text-[10px] font-medium">{r.name}</div>
              </div>
            )
          })}
        </div>
      )}
    </Card>
  )
}

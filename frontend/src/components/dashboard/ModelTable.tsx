import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Brain, Loader2 } from 'lucide-react'
import apiClient from '@/lib/api'

export function ModelTable() {
  const [models, setModels] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { load() }, [])
  const load = async () => {
    try {
      const res = await apiClient.getModels()
      const raw = res.data.models || {}
      setModels(Object.entries(raw).map(([key, val]: [string, any]) => ({
        name: key.toUpperCase(),
        precision: val.precision || 0,
        recall: val.recall || 0,
        mAP50: val.mAP50 || 0,
      })))
    } catch (err) { console.error(err) } finally { setLoading(false) }
  }

  return (
    <Card className="glass-card border-cyan-500/20 p-5 h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-white font-bold text-sm flex items-center gap-2">
            <Brain size={14} className="text-green-400" /> MODEL PERFORMANCE
          </h3>
          <p className="text-gray-500 text-xs mt-0.5">Real models from backend</p>
        </div>
        <Badge className="bg-green-500/20 text-green-400 border-green-500/40 text-[10px]">
          {models.length} models
        </Badge>
      </div>

      {loading ? (
        <div className="text-center py-8"><Loader2 className="animate-spin text-cyan-400 mx-auto" size={24} /></div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-cyan-500/10">
                <th className="text-left text-gray-500 text-[10px] font-bold uppercase pb-2">Model</th>
                <th className="text-right text-gray-500 text-[10px] font-bold uppercase pb-2">Precision</th>
                <th className="text-right text-gray-500 text-[10px] font-bold uppercase pb-2">Recall</th>
                <th className="text-right text-gray-500 text-[10px] font-bold uppercase pb-2">mAP50</th>
                <th className="text-right text-gray-500 text-[10px] font-bold uppercase pb-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {models.map((m, i) => {
                const color = m.mAP50 >= 18 ? '#10B981' : m.mAP50 >= 16 ? '#F59E0B' : '#EF4444'
                const status = m.mAP50 >= 18 ? 'Deployed' : m.mAP50 >= 16 ? 'Testing' : 'Training'
                return (
                  <tr key={i} className="border-b border-cyan-500/5 hover:bg-cyan-500/5">
                    <td className="py-2.5"><div className="text-white text-xs font-bold">{m.name}</div></td>
                    <td className="py-2.5 text-right"><span className="text-gray-300 text-xs font-mono">{m.precision.toFixed(2)}</span></td>
                    <td className="py-2.5 text-right"><span className="text-gray-300 text-xs font-mono">{m.recall.toFixed(2)}</span></td>
                    <td className="py-2.5 text-right"><span className="text-xs font-mono font-bold" style={{ color }}>{m.mAP50.toFixed(2)}%</span></td>
                    <td className="py-2.5 text-right">
                      <Badge className="text-[10px] py-0.5 px-2" style={{ backgroundColor: `${color}20`, color, border: `1px solid ${color}60` }}>● {status}</Badge>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  )
}

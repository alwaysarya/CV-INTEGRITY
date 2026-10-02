import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Database, Loader2 } from 'lucide-react'
import apiClient from '@/lib/api'

export function DatasetTable() {
  const [datasets, setDatasets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { load() }, [])
  const load = async () => {
    try {
      const res = await apiClient.getDatasets()
      const raw = res.data.datasets || {}
      setDatasets(Object.entries(raw).map(([key, val]: [string, any]) => ({
        name: key.toUpperCase(),
        overall: val.overall_score || 0,
        images: val.total_images || 0,
        category: val.category || 'N/A',
      })))
    } catch (err) { console.error(err) } finally { setLoading(false) }
  }

  return (
    <Card className="glass-card border-cyan-500/20 p-5 h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-white font-bold text-sm flex items-center gap-2">
            <Database size={14} className="text-cyan-400" /> DATASET STATUS
          </h3>
          <p className="text-gray-500 text-xs mt-0.5">Real quality from backend</p>
        </div>
        <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/40 text-[10px]">
          {datasets.length} datasets
        </Badge>
      </div>

      {loading ? (
        <div className="text-center py-8"><Loader2 className="animate-spin text-cyan-400 mx-auto" size={24} /></div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-cyan-500/10">
                <th className="text-left text-gray-500 text-[10px] font-bold uppercase pb-2">Name</th>
                <th className="text-right text-gray-500 text-[10px] font-bold uppercase pb-2">Overall</th>
                <th className="text-right text-gray-500 text-[10px] font-bold uppercase pb-2">Images</th>
                <th className="text-right text-gray-500 text-[10px] font-bold uppercase pb-2">Category</th>
              </tr>
            </thead>
            <tbody>
              {datasets.map((d, i) => {
                const color = d.overall >= 90 ? '#10B981' : d.overall >= 80 ? '#38BDF8' : '#F59E0B'
                return (
                  <tr key={i} className="border-b border-cyan-500/5 hover:bg-cyan-500/5">
                    <td className="py-2.5"><div className="text-white text-xs font-bold">{d.name}</div></td>
                    <td className="py-2.5 text-right"><span className="text-xs font-mono font-bold" style={{ color }}>{d.overall.toFixed(1)}%</span></td>
                    <td className="py-2.5 text-right"><span className="text-gray-300 text-xs font-mono">{d.images}</span></td>
                    <td className="py-2.5 text-right">
                      <Badge className="text-[10px] py-0.5 px-2" style={{ backgroundColor: `${color}20`, color, border: `1px solid ${color}60` }}>{d.category}</Badge>
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

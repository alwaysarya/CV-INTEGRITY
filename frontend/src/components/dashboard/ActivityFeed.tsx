import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Activity, Loader2 } from 'lucide-react'
import apiClient from '@/lib/api'

const actionColors: Record<string, string> = {
  GENESIS: '#8B5CF6',
  DATASET_UPLOAD: '#38BDF8',
  MODEL_TRAINING: '#10B981',
  TRUST_EVALUATION: '#F59E0B',
  INFERENCE_RECORD: '#EF4444',
}

export function ActivityFeed() {
  const [activities, setActivities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { load() }, [])
  const load = async () => {
    try {
      const res = await apiClient.getBlocks()
      const blocks = res.data.blocks || []
      const list = blocks.slice().reverse().slice(0, 6).map((b: any, i: number) => {
        const action = b.data?.action || 'UNKNOWN'
        const color = actionColors[action] || '#38BDF8'
        let text = `Block #${b.index}: ${action}`
        if (b.data?.dataset_name) text += ` — ${b.data.dataset_name}`
        if (b.data?.model) text += ` — ${b.data.model}`
        if (b.data?.trust_score) text += ` (${b.data.trust_score}%)`
        return {
          id: i,
          text,
          time: b.datetime ? new Date(b.datetime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'N/A',
          color,
        }
      })
      setActivities(list)
    } catch (err) { console.error(err) } finally { setLoading(false) }
  }

  return (
    <Card className="glass-card border-cyan-500/20 p-5 h-full">
      <div className="mb-4">
        <h3 className="text-white font-bold text-sm">RECENT ACTIVITY</h3>
        <p className="text-gray-500 text-xs mt-0.5">Real blockchain events</p>
      </div>

      {loading ? (
        <div className="text-center py-8"><Loader2 className="animate-spin text-cyan-400 mx-auto" size={24} /></div>
      ) : (
        <div className="space-y-2">
          {activities.map((a) => (
            <div key={a.id} className="flex items-center gap-3 p-2.5 rounded-lg transition-all hover:translate-x-1" style={{
              borderLeft: `2px solid ${a.color}`,
              backgroundColor: 'rgba(0, 0, 0, 0.2)',
            }}>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${a.color}15`, border: `1px solid ${a.color}40` }}>
                <Activity size={12} style={{ color: a.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-gray-300 text-xs truncate">{a.text}</div>
              </div>
              <div className="text-gray-500 text-[10px] flex-shrink-0">{a.time}</div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}

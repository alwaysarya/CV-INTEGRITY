import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Brain } from 'lucide-react'

interface Model {
  name: string
  type: string
  accuracy: number
  status: 'Deployed' | 'Testing' | 'Training'
}

const models: Model[] = [
  { name: 'YOLOv8n', type: 'Object Detection', accuracy: 92.4, status: 'Deployed' },
  { name: 'ResNet50', type: 'Image Classification', accuracy: 94.1, status: 'Deployed' },
  { name: 'ViT-B/16', type: 'Vision Transformer', accuracy: 91.2, status: 'Testing' },
  { name: 'BERT-Base', type: 'NLP', accuracy: 88.7, status: 'Deployed' },
  { name: 'Custom-DQN', type: 'Anomaly Detection', accuracy: 76.3, status: 'Training' },
]

const statusColors = {
  Deployed: { bg: 'rgba(16, 185, 129, 0.15)', text: '#10B981', border: 'rgba(16, 185, 129, 0.4)' },
  Testing: { bg: 'rgba(245, 158, 11, 0.15)', text: '#F59E0B', border: 'rgba(245, 158, 11, 0.4)' },
  Training: { bg: 'rgba(56, 189, 248, 0.15)', text: '#38BDF8', border: 'rgba(56, 189, 248, 0.4)' },
}

export function ModelTable() {
  return (
    <Card className="glass-card border-cyan-500/20 p-5 h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-white font-bold text-sm flex items-center gap-2">
            <Brain size={14} className="text-green-400" />
            MODEL PERFORMANCE
          </h3>
          <p className="text-gray-500 text-xs mt-0.5">Live model statistics</p>
        </div>
        <button className="text-cyan-400 text-xs hover:text-cyan-300">View Models →</button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-cyan-500/10">
              <th className="text-left text-gray-500 text-[10px] font-bold tracking-wider uppercase pb-2">Model Name</th>
              <th className="text-left text-gray-500 text-[10px] font-bold tracking-wider uppercase pb-2">Type</th>
              <th className="text-right text-gray-500 text-[10px] font-bold tracking-wider uppercase pb-2">Accuracy</th>
              <th className="text-right text-gray-500 text-[10px] font-bold tracking-wider uppercase pb-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {models.map((model, i) => {
              const colors = statusColors[model.status]
              return (
                <tr key={i} className="border-b border-cyan-500/5 hover:bg-cyan-500/5 transition-colors">
                  <td className="py-2.5"><div className="text-white text-xs font-medium">{model.name}</div></td>
                  <td className="py-2.5"><div className="text-gray-400 text-xs">{model.type}</div></td>
                  <td className="py-2.5 text-right"><span className="text-green-400 text-xs font-bold">{model.accuracy}%</span></td>
                  <td className="py-2.5 text-right">
                    <Badge className="text-[10px] py-0.5 px-2" style={{ backgroundColor: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}>
                      ● {model.status}
                    </Badge>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
